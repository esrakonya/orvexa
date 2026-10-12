const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''
const CSRF_ENDPOINT = '/api/csrf'
const CSRF_HEADER = 'X-XSRF-TOKEN'

type ApiErrorBody = {
    message?: string
}

export class ApiError extends Error {
    public readonly status: number

    constructor(
        message: string,
        status: number,
    ) {
        super(message)
        this.name = 'ApiError'
        this.status = status
    }
}

let csrfToken: string | null = null

async function fetchCsrfToken(): Promise<string> {
    const response = await fetch(`${API_BASE_URL}${CSRF_ENDPOINT}`, {
        method: 'GET',
        credentials: 'include',
    })

    if (!response.ok) {
        throw new ApiError('CSRF token could not be obtained.', response.status)
    }

    const data: { token: string } = await response.json()

    if (!data.token) {
        throw new ApiError('CSRF token is missing from the response.', response.status)
    }

    csrfToken = data.token
    return csrfToken
}


type ApiRequestOptions = Omit<RequestInit, 'body'> & {
    body?: unknown
}

export async function apiRequest<T>(
    path: string,
    options: ApiRequestOptions = {},
): Promise<T> {
    const method = (options.method ?? 'GET').toUpperCase()
    const needsCsrf = !['GET', 'HEAD', 'OPTIONS'].includes(method)

    const headers = new Headers(options.headers)

    if (options.body !== undefined) {
        headers.set('Content-Type', 'application/json')
    }

    if (needsCsrf) {
        const token = csrfToken ?? await fetchCsrfToken()
        headers.set(CSRF_HEADER, token)
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        method,
        headers,
        credentials: 'include',
        body: options.body === undefined
            ? undefined
            : JSON.stringify(options.body),
    })

    if (response.status === 204) {
        return undefined as T
    }

    const contentType = response.headers.get('content-type') ?? ''
    const data: unknown = contentType.includes('application/json')
        ? await response.json()
        : await response.text()

    if (!response.ok) {
        const message =
            typeof data === 'object' &&
                data !== null &&
                'message' in data &&
                typeof (data as ApiErrorBody).message === 'string'
                ? (data as ApiErrorBody).message!
                : `Request failed with status ${response.status}.`

        throw new ApiError(message, response.status)
    }

    return data as T
}

export function clearCsrfToken(): void {
    csrfToken = null
}