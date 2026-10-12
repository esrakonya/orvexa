-- 1. User accounts
CREATE TABLE users (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_users_status
        CHECK (status IN ('ACTIVE', 'DISABLED'))
);

CREATE UNIQUE INDEX uq_users_email_lower
    ON users (LOWER(email));


-- 2. Workspaces
CREATE TABLE workspaces (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    industry VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_workspaces_name
        CHECK (LENGTH(TRIM(name)) > 0)
);


-- 3. Workspace memberships
CREATE TABLE workspace_memberships (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL,
    user_id UUID NOT NULL,
    role VARCHAR(30) NOT NULL,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_memberships_workspace
        FOREIGN KEY (workspace_id)
        REFERENCES workspaces (id),

    CONSTRAINT fk_memberships_user
        FOREIGN KEY (user_id)
        REFERENCES users (id),

    CONSTRAINT uq_membership_workspace_user
        UNIQUE (workspace_id, user_id),

    CONSTRAINT uq_membership_id_workspace
        UNIQUE (id, workspace_id),

    CONSTRAINT chk_membership_role
        CHECK (role IN ('ADMIN', 'PROJECT_MANAGER', 'MEMBER'))
);

CREATE INDEX idx_memberships_user
    ON workspace_memberships (user_id);


-- 4. Workspace invitations
CREATE TABLE workspace_invitations (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL,
    invited_by_membership_id UUID NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMPTZ,

    CONSTRAINT fk_invitations_workspace
        FOREIGN KEY (workspace_id)
        REFERENCES workspaces (id),

    CONSTRAINT fk_invitations_inviter
        FOREIGN KEY (invited_by_membership_id, workspace_id)
        REFERENCES workspace_memberships (id, workspace_id),

    CONSTRAINT chk_invitations_role
        CHECK (role IN ('ADMIN', 'PROJECT_MANAGER', 'MEMBER')),

    CONSTRAINT chk_invitations_status
        CHECK (status IN ('PENDING', 'ACCEPTED', 'REVOKED', 'EXPIRED')),

    CONSTRAINT chk_invitations_accepted_at
        CHECK (
            (status = 'ACCEPTED' AND accepted_at IS NOT NULL)
            OR
            (status <> 'ACCEPTED' AND accepted_at IS NULL)
        )
);

CREATE INDEX idx_invitations_workspace_status
    ON workspace_invitations (workspace_id, status);

CREATE UNIQUE INDEX uq_pending_invitation_email_workspace
    ON workspace_invitations (workspace_id, LOWER(email))
    WHERE status = 'PENDING';


-- 5. Clients
CREATE TABLE clients (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    industry VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_clients_workspace
        FOREIGN KEY (workspace_id)
        REFERENCES workspaces (id),

    CONSTRAINT uq_clients_id_workspace
        UNIQUE (id, workspace_id),

    CONSTRAINT chk_clients_status
        CHECK (status IN ('ACTIVE', 'INACTIVE')),

    CONSTRAINT chk_clients_name
        CHECK (LENGTH(TRIM(name)) > 0)
);

CREATE INDEX idx_clients_workspace
    ON clients (workspace_id);


-- 6. Projects
CREATE TABLE projects (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL,
    client_id UUID NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PLANNING',
    start_date DATE NOT NULL,
    due_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_projects_workspace
        FOREIGN KEY (workspace_id)
        REFERENCES workspaces (id),

    CONSTRAINT fk_projects_client_workspace
        FOREIGN KEY (client_id, workspace_id)
        REFERENCES clients (id, workspace_id),

    CONSTRAINT uq_projects_id_workspace
        UNIQUE (id, workspace_id),

    CONSTRAINT chk_projects_status
        CHECK (
            status IN (
                'PLANNING',
                'IN_PROGRESS',
                'ON_HOLD',
                'COMPLETED'
            )
        ),

    CONSTRAINT chk_projects_dates
        CHECK (due_date >= start_date),

    CONSTRAINT chk_projects_name
        CHECK (LENGTH(TRIM(name)) > 0)
);

CREATE INDEX idx_projects_workspace
    ON projects (workspace_id);

CREATE INDEX idx_projects_client
    ON projects (client_id, workspace_id);


-- 7. Tasks
CREATE TABLE tasks (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL,
    project_id UUID NOT NULL,
    assignee_membership_id UUID NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'TODO',
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    due_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_tasks_workspace
        FOREIGN KEY (workspace_id)
        REFERENCES workspaces (id),

    CONSTRAINT fk_tasks_project_workspace
        FOREIGN KEY (project_id, workspace_id)
        REFERENCES projects (id, workspace_id),

    CONSTRAINT fk_tasks_assignee_workspace
        FOREIGN KEY (assignee_membership_id, workspace_id)
        REFERENCES workspace_memberships (id, workspace_id),

    CONSTRAINT chk_tasks_status
        CHECK (status IN ('TODO', 'IN_PROGRESS', 'COMPLETED')),

    CONSTRAINT chk_tasks_priority
        CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),

    CONSTRAINT chk_tasks_title
        CHECK (LENGTH(TRIM(title)) > 0)
);

CREATE INDEX idx_tasks_workspace
    ON tasks (workspace_id);

CREATE INDEX idx_tasks_project
    ON tasks (project_id, workspace_id);

CREATE INDEX idx_tasks_assignee
    ON tasks (assignee_membership_id, workspace_id);


-- 8. Activities
CREATE TABLE activities (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL,
    actor_membership_id UUID NOT NULL,
    type VARCHAR(20) NOT NULL,
    entity_type VARCHAR(20) NOT NULL,
    entity_id UUID NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_activities_workspace
        FOREIGN KEY (workspace_id)
        REFERENCES workspaces (id),

    CONSTRAINT fk_activities_actor_workspace
        FOREIGN KEY (actor_membership_id, workspace_id)
        REFERENCES workspace_memberships (id, workspace_id),

    CONSTRAINT chk_activities_type
        CHECK (type IN ('CREATED', 'UPDATED', 'DELETED', 'COMPLETED')),

    CONSTRAINT chk_activities_entity_type
        CHECK (entity_type IN ('CLIENT', 'PROJECT', 'TASK', 'USER'))
);

CREATE INDEX idx_activities_workspace_created
    ON activities (workspace_id, created_at DESC);

CREATE INDEX idx_activities_entity
    ON activities (entity_type, entity_id);