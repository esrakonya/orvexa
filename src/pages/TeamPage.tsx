import { useState, useEffect } from "react"
import TeamFilters, {
    type TeamFiltersState,
} from "../components/team/TeamFilters"
import TeamMemberList from "../components/team/TeamMemberList"
import type { User } from "../interfaces/User"
import { getAllUsers } from "../services/userService"
import {
    createWorkspaceInvitation,
    type WorkspaceInvitationRole,
} from "../services/workspaceInvitationService"

function TeamPage() {
    const [filters, setFilters] = useState<TeamFiltersState>({
        search: "",
        role: "",
    })

    const [users, setUsers] = useState<User[]>([])
    const [isLoadingUsers, setIsLoadingUsers] = useState(true)
    const [usersError, setUsersError] = useState<string | null>(null)
    const [inviteEmail, setInviteEmail] = useState("")
    const [inviteRole, setInviteRole] = useState<WorkspaceInvitationRole>("MEMBER")
    const [isCreatingInvitation, setIsCreatingInvitation] = useState(false)
    const [invitationError, setInvitationError] = useState<string | null>(null)
    const [invitationLink, setInvitationLink] = useState<string | null>(null)
    const [invitationSuccess, setInvitationSuccess] = useState<string | null>(null)

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


            <section className="rounded-xl border border-sage-mist bg-white p-5">
                <h2 className="text-lg font-semibold text-forest">
                    Invite a team member
                </h2>

                <p className="mt-1 text-sm text-sage">
                    Create an invitation link for someone to join your workspace.
                </p>

                <form
                    className="mt-4 grid gap-4 sm:grid-cols-3"
                    onSubmit={async (event) => {
                        event.preventDefault()
                        setIsCreatingInvitation(true)
                        setInvitationError(null)
                        setInvitationSuccess(null)
                        setInvitationLink(null)

                        try {
                            const invitation = await createWorkspaceInvitation({
                                email: inviteEmail.trim(),
                                role: inviteRole,
                            })

                            const link = new URL(
                                "/accept-invitation",
                                window.location.origin,
                            )
                            link.searchParams.set("token", invitation.token)

                            setInvitationLink(link.toString())
                            setInvitationSuccess(
                                `Invitation created for ${invitation.email}.`,
                            )
                            setInviteEmail("")
                        } catch (error: unknown) {
                            setInvitationError(
                                error instanceof Error
                                    ? error.message
                                    : "Could not create the invitation.",
                            )
                        } finally {
                            setIsCreatingInvitation(false)
                        }
                    }}
                >
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
                            required
                            maxLength={255}
                            value={inviteEmail}
                            onChange={(event) => setInviteEmail(event.target.value)}
                            placeholder="colleague@example.com"
                            className="w-full rounded-lg border border-sage-mist px-3 py-2 text-sm outline-none focus:border-sage focus:ring-2 focus:ring-sage-mist"
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
                            value={inviteRole}
                            onChange={(event) =>
                                setInviteRole(event.target.value as WorkspaceInvitationRole)
                            }
                            className="w-full rounded-lg border border-sage-mist bg-white px-3 py-2 text-sm outline-none focus:border-sage focus:ring-2 focus:ring-sage-mist"
                        >
                            <option value="MEMBER">Member</option>
                            <option value="PROJECT_MANAGER">Project Manager</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button
                            type="submit"
                            disabled={isCreatingInvitation}
                            className="w-full rounded-lg bg-forest px-4 py-2 text-sm font-medium text-white hover:bg-[#10352c] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isCreatingInvitation ? "Creating..." : "Create invitation"}
                        </button>
                    </div>
                </form>

                {invitationError && (
                    <p role="alert" className="mt-4 text-sm text-red-600">
                        {invitationError}
                    </p>
                )}

                {invitationSuccess && (
                    <p role="status" className="mt-4 text-sm text-green-700">
                        {invitationSuccess}
                    </p>
                )}

                {invitationLink && (
                    <div className="mt-4 rounded-lg border border-sage-mist bg-ivory p-4">
                        <p className="text-sm font-medium text-forest">
                            Invitation link
                        </p>

                        <p className="mt-1 break-all text-sm text-sage">
                            {invitationLink}
                        </p>

                        <button
                            type="button"
                            onClick={() => {
                                void navigator.clipboard.writeText(invitationLink)
                            }}
                            className="mt-3 rounded-lg border border-sage-mist bg-white px-3 py-2 text-sm font-medium text-forest hover:bg-sage-mist"
                        >
                            Copy invitation link
                        </button>

                        <p className="mt-2 text-xs text-sage">
                            This link contains a private invitation token. Share it only
                            with the intended recipient.
                        </p>
                    </div>
                )}
            </section>

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