export type ActivityType =
    | 'CREATED'
    | 'UPDATED'
    | 'DELETED'
    | 'COMPLETED'

export type ActivityEntityType =
    | 'CLIENT'
    | 'PROJECT'
    | 'TASK'
    | 'USER'

export interface Activity {
    id: string
    workspaceId: string
    actorMembershipId: string
    type: ActivityType
    entityType: ActivityEntityType
    entityId: string
    description: string
    createdAt: string
}