import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  CheckSquare,
  FolderKanban,
  LayoutDashboard,
  Settings,
  Users,
  UsersRound,
} from 'lucide-react'

export interface NavigationItem {
  label: string
  path: string
  icon: LucideIcon
}

export const navigationItems: NavigationItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Clients',
    path: '/clients',
    icon: Users,
  },
  {
    label: 'Projects',
    path: '/projects',
    icon: FolderKanban,
  },
  {
    label: 'Tasks',
    path: '/tasks',
    icon: CheckSquare,
  },
  {
    label: 'Team',
    path: '/team',
    icon: UsersRound,
  },
  {
    label: 'Activity',
    path: '/activity',
    icon: Activity,
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: Settings,
  },
]