import { useState } from "react"
import TeamFilters, {
    type TeamFiltersState,
} from "../components/team/TeamFilters"
import TeamMemberList from "../components/team/TeamMemberList"
import { getAllUsers } from "../services/userService"

function TeamPage() {
    const [filters, setFilters] = useState<TeamFiltersState>({
        search: '',
        role: '',
    })

    const users = getAllUsers()

    const filteredUsers = users.filter((user) => {
        const searchTerm = filters.search.trim().toLowerCase()

        const matchesSearch = 
          searchTerm === '' ||
          user.name.toLowerCase().includes(searchTerm) ||
          user.email.toLowerCase().includes(searchTerm)

        const matchesRole = 
          filters.role === '' || user.role === filters.role
        
        return matchesSearch && matchesRole
    })

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                    Team
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    View the members of your workspace and their roles.
                </p>
            </div>

            <TeamFilters
                filters={filters}
                onChange={setFilters}
            />

            <TeamMemberList users={filteredUsers} />
        </div>
    )
}

export default TeamPage