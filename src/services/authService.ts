import { apiRequest, clearCsrfToken } from '../api/apiClient'

export interface AuthUser {
  id: number | string
  name: string
  email: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  workspaceName: string
  industry?: string
}

export async function login(
  request: LoginRequest,
): Promise<AuthUser> {
  const user = await apiRequest<AuthUser>('/api/auth/login', {
    method: 'POST',
    body: request,
  })

  // Backend login sırasında CSRF çerezini temizlediği için
  // sonraki POST isteklerinde yeni bir token alınmalı.
  clearCsrfToken()

  return user
}

export function register(
  request: RegisterRequest,
): Promise<void> {
  return apiRequest<void>('/api/auth/register', {
    method: 'POST',
    body: request,
  })
}

export function getCurrentUser(): Promise<AuthUser> {
  return apiRequest<AuthUser>('/api/auth/me')
}

export async function logout(): Promise<void> {
  try {
    await apiRequest<void>('/api/auth/logout', {
      method: 'POST',
    })
  } finally {
    clearCsrfToken()
  }
}
