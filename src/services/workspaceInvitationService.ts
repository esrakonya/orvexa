import { apiRequest } from "../api/apiClient"

const WORKSPACE_INVITATIONS_ENDPOINT = "/api/workspace-invitations"

export type WorkspaceInvitationRole =
  | "ADMIN"
  | "PROJECT_MANAGER"
  | "MEMBER"

export interface CreateWorkspaceInvitationRequest {
  email: string
  role: WorkspaceInvitationRole
}

export interface WorkspaceInvitationCreatedResponse {
  id: string
  email: string
  role: WorkspaceInvitationRole
  token: string
  expiresAt: string
}

export interface WorkspaceInvitationPreviewResponse {
  workspaceName: string
  email: string
  role: WorkspaceInvitationRole
  expiresAt: string
}

export interface AcceptWorkspaceInvitationRequest {
  token: string
}

export interface RegisterWorkspaceInvitationRequest {
  token: string
  name: string
  password: string
}

export function createWorkspaceInvitation(
  request: CreateWorkspaceInvitationRequest,
): Promise<WorkspaceInvitationCreatedResponse> {
  return apiRequest<WorkspaceInvitationCreatedResponse>(
    WORKSPACE_INVITATIONS_ENDPOINT,
    {
      method: "POST",
      body: request,
    },
  )
}

export function previewWorkspaceInvitation(
  token: string,
): Promise<WorkspaceInvitationPreviewResponse> {
  const params = new URLSearchParams({ token })

  return apiRequest<WorkspaceInvitationPreviewResponse>(
    `${WORKSPACE_INVITATIONS_ENDPOINT}/preview?${params.toString()}`,
  )
}

export function acceptWorkspaceInvitation(
    request: AcceptWorkspaceInvitationRequest,
): Promise<void> {
    return apiRequest<void>(
        `${WORKSPACE_INVITATIONS_ENDPOINT}/accept`,
        {
            method: "POST",
            body: request,
        },
    )
}

export function registerAndAcceptWorkspaceInvitation(
    request: RegisterWorkspaceInvitationRequest,
): Promise<void> {
    return apiRequest<void>(
        `${WORKSPACE_INVITATIONS_ENDPOINT}/register`,
        {
            method: "POST",
            body: request,
        },
    )
}