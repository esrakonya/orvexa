import { useState, useEffect } from "react"
import TeamFilters, {
    type TeamFiltersState,
} from "../components/team/TeamFilters"
import TeamMemberList from "../components/team/TeamMemberList"
import type { User } from "../interfaces/User"
import { getAllUsers } from "../services/userService"

function TeamPage() {
    const [filters, setFilters] = useState<TeamFiltersState>({
        search: "",
        role: "",
    })

    const [users, setUsers] = useState<User[]>([])
    const [isLoadingUsers, setIsLoadingUsers] = useState(true)
    const [usersError, setUsersError] = useState<string | null>(null)

    useEffect(() => {
        let isMounted = true

        const loadUsers = async () => {
            try {
                const result = await getAllUsers()

                if (isMounted) {
                    setUsers(result)
                    setUsersError(null)
                }
            } catch (error: unknown) {
                if (isMounted) {
                    setUsersError(
                        error instanceof Error
                            ? error.message
                            : "Could not load team members.",
                    )
                }
            } finally {
                if (isMounted) {
                    setIsLoadingUsers(false)
                }
            }
        }

        void loadUsers()

        return () => {
            isMounted = false
        }
    }, [])

    const filteredUsers = users.filter((user) => {
        const searchTerm = filters.search.trim().toLowerCase()

        const matchesSearch =
            searchTerm === "" ||
            user.name.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm)

        const matchesRole =
            filters.role === "" || user.role === filters.role

        return matchesSearch && matchesRole
    })

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-forest">
                    Team
                </h1>

                <p className="mt-1 text-sm text-sage">
                    View the members of your workspace and their roles.
                </p>
            </div>

            {/* Team Invitation Section */}
            <section className="rounded-xl border border-sage-mist bg-white p-5">
                <h2 className="text-lg font-semibold text-forest">
                    Invite a team member
                </h2>

                <p className="mt-1 text-sm text-sage">
                    Create an invitation link for someone to join your workspace.
                </p>

                {/* Maintenance Notice */}
                <div
                    role="status"
                    className="mt-5 rounded-lg border border-blue-200 bg-blue-50 p-4"
                >
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 text-blue-600">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 16v-4" />
                                <path d="M12 8h.01" />
                            </svg>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-blue-900">
                                Feature Update in Progress
                            </h3>

                            <p className="mt-1 text-sm leading-relaxed text-blue-800">
                                Team member invitations are currently being
                                improved. This feature will be available again
                                soon. Thank you for your patience.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Temporarily Disabled Invitation Form */}
                <fieldset disabled className="mt-5 opacity-50">
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="sm:col-span-1">
                            <label
                                htmlFor="invite-email"
                                className="mb-1 block text-sm font-medium text-forest"
                            >
                                Email address
                            </label>

                            <input
                                id="invite-email"
                                type="email"
                                placeholder="colleague@example.com"
                                className="w-full rounded-lg border border-sage-mist bg-gray-50 px-3 py-2 text-sm cursor-not-allowed"
                            />
                        </div>

                        <div className="sm:col-span-1">
                            <label
                                htmlFor="invite-role"
                                className="mb-1 block text-sm font-medium text-forest"
                            >
                                Role
                            </label>

                            <select
                                id="invite-role"
                                defaultValue="MEMBER"
                                className="w-full rounded-lg border border-sage-mist bg-gray-50 px-3 py-2 text-sm cursor-not-allowed"
                            >
                                <option value="MEMBER">Member</option>
                                <option value="PROJECT_MANAGER">
                                    Project Manager
                                </option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>

                        <div className="flex items-end">
                            <button
                                type="button"
                                disabled
                                className="w-full cursor-not-allowed rounded-lg bg-forest px-4 py-2 text-sm font-medium text-white"
                            >
                                Create invitation
                            </button>
                        </div>
                    </div>
                </fieldset>

                <p className="mt-3 text-xs text-sage">
                    Invitation functionality is temporarily unavailable.
                </p>
            </section>

            {/* Team Members */}
            {isLoadingUsers && (
                <p className="text-sm text-sage">
                    Loading team members...
                </p>
            )}

            {usersError && (
                <p role="alert" className="text-sm text-red-600">
                    Could not load team members: {usersError}
                </p>
            )}

            {!isLoadingUsers && !usersError && (
                <>
                    <TeamFilters
                        filters={filters}
                        onChange={setFilters}
                    />

                    <TeamMemberList users={filteredUsers} />
                </>
            )}
        </div>
    )
}

export default TeamPage
