import useDashboardData from '../hooks/useDashboardData'

function DashboardPage() {
  const dashboardData = useDashboardData()

  return (
    <div>
      <h1>Dashboard Data Verification</h1>

      <pre>
        {JSON.stringify(dashboardData, null, 2)}
      </pre>
    </div>
  )
}

export default DashboardPage