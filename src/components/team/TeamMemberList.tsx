import type { User, UserRole } from '../../interfaces/User'

interface TeamMemberListProps {
  users: User[]
}

const roleLabels: Record<UserRole, string> = {
  ADMIN: 'Admin',
  PROJECT_MANAGER: 'Project Manager',
  MEMBER: 'Member',
}

function TeamMemberList({
  users,
}: TeamMemberListProps) {
  if (users.length === 0) {
    return (
      <section className="rounded-xl border bg-white p-8 text-center shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          No team members found
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Try adjusting your search or role filter.
        </p>
      </section>
    )
  }

  return (
    <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b bg-gray-50 text-left">
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Member
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Email
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Role
              </th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100">
                      <span className="text-sm font-medium text-gray-700">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    <span className="font-medium text-gray-900">
                      {user.name}
                    </span>
                  </div>
                </td>

                <td className="px-5 py-4 text-sm text-gray-600">
                  {user.email}
                </td>

                <td className="px-5 py-4">
                  <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                    {roleLabels[user.role]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default TeamMemberList