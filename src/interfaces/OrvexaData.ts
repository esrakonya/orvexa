import type { Activity } from "./Activity";
import type { Client } from "./Client";
import type { Project } from "./Project";
import type { Task } from "./Task";
import type { User } from "./User";
import type { Workspace } from "./Workspace";

export interface OrvexaData {
    workspace: Workspace
    users: User[]
    clients: Client[]
    projects: Project[]
    tasks: Task[]
    activities: Activity[]
}