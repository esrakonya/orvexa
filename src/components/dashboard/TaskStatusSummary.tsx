import {
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
} from 'recharts'

interface TaskStatusSummaryProps {
    summary: {
        TODO: number
        IN_PROGRESS: number
        COMPLETED: number
    }
}

const statusLabels = {
    TODO: 'To Do',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
}

const statusColors = {
    TODO: '#9ca3af',
    IN_PROGRESS: '#3b82f6',
    COMPLETED: '#22c55e',
}

const statusData = [
    {
        key: 'TODO',
        label: statusLabels.TODO,
        color: statusColors.TODO,
    },
    {
        key: 'IN_PROGRESS',
        label: statusLabels.IN_PROGRESS,
        color: statusColors.IN_PROGRESS,
    },
    {
        key: 'COMPLETED',
        label: statusLabels.COMPLETED,
        color: statusColors.COMPLETED,
    },
]

function TaskStatusSummary({
    summary,
}: TaskStatusSummaryProps) {
    const chartData = statusData.map((status) => ({
        ...status,
        value: summary[status.key as keyof typeof summary],
    }))

    const totalTasks = Object.values(summary).reduce(
        (total, count) => total + count,
        0,
    )

    return (
        <section className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="mb-5">
                <h2 className="text-lg font-semibold text-gray-900">
                    Task Status
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                    Current distribution of tasks by status.
                </p>
            </div>

            <div className="relative h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="label"
                            cx="50%"
                            cy="50%"
                            innerRadius={65}
                            outerRadius={90}
                            paddingAngle={3}
                            strokeWidth={0}
                        >
                            {chartData.map((entry) => (
                                <Cell
                                    key={entry.key}
                                    fill={entry.color}
                                />
                            ))}
                        </Pie>

                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>

                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-3xl font-semibold text-gray-900">
                            {totalTasks}
                        </p>

                        <p className="text-sm text-gray-500">
                            Total Tasks
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-5 space-y-3">
                {chartData.map((status) => (
                    <div
                        key={status.key}
                        className="flex items-center justify-between"
                    >
                        <div className="flex items-center gap-2">
                            <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: status.color }}
                                aria-hidden="true"
                            />

                            <span className="text-sm text-gray-600">
                                {status.label}
                            </span>
                        </div>

                        <span className="font-semibold text-gray-900">
                            {status.value}
                        </span>
                    </div>
                ))}
            </div>
        </section>
    )
}

export default TaskStatusSummary