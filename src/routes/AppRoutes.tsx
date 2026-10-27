import { type ReactNode } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import DashboardPage from '../pages/DashboardPage'
import AppLayout from '../components/layout/AppLayout'
import ClientsPage from '../pages/ClientsPage'
import ClientDetailsPage from '../pages/ClientDetailsPage'
import ProjectsPage from '../pages/ProjectsPage'
import ProjectDetailsPage from '../pages/ProjectDetailsPage'
import TasksPage from '../pages/TasksPage'
import TeamPage from '../pages/TeamPage'
import ActivityPage from '../pages/ActivityPage'
import SettingsPage from '../pages/SettingsPage'
import NotFoundPage from '../pages/NotFoundPage'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import ProtectedRoute from './ProtectedRoute'
import AcceptInvitationPage from '../pages/AcceptInvitationPage'
import { useAuth } from '../contexts/AuthContext'

interface GuestRouteProps {
    children: ReactNode
}


function GuestRoute({ children }: GuestRouteProps) {
    const { isAuthenticated, isLoading } = useAuth()

    if (!isLoading && isAuthenticated) {
        return <Navigate to="/dashboard" replace />
    }

    return <>{children}</>
}

function AppRoutes() {
    return (
        <Routes>
            <Route
                path="/login"
                element={
                    <GuestRoute>
                        <LoginPage />
                    </GuestRoute>
                }
            />

            <Route
                path="/register"
                element={
                    <GuestRoute>
                        <RegisterPage />
                    </GuestRoute>
                }
            />

            <Route
                path="/accept-invitation"
                element={<AcceptInvitationPage />}
            />

            <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                    <Route
                        path="/"
                        element={<Navigate to="/dashboard" replace />}
                    />

                    <Route path="/dashboard" element={<DashboardPage />} />

                    <Route path="/clients" element={<ClientsPage />} />
                    <Route
                        path="/clients/:clientId"
                        element={<ClientDetailsPage />}
                    />

                    <Route path="/projects" element={<ProjectsPage />} />
                    <Route
                        path="/projects/:projectId"
                        element={<ProjectDetailsPage />}
                    />

                    <Route path="/tasks" element={<TasksPage />} />
                    <Route path="/team" element={<TeamPage />} />
                    <Route path="/activity" element={<ActivityPage />} />
                    <Route path="/settings" element={<SettingsPage />} />

                    <Route path="*" element={<NotFoundPage />} />
                </Route>
            </Route>
        </Routes>
    )
}

export default AppRoutes
