import { getAllClients } from "../services/clientService"

function DashboardPage() {
    const clients = getAllClients()

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900">
                Dashboard
            </h1>

            <p className="mt-2 text-gray-600">
                Active clients: {clients.filter((client) => client.status === 'ACTIVE').length}
            </p>
        </div>
    )
}

export default DashboardPage