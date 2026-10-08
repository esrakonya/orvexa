import type { LucideIcon } from 'lucide-react'

interface KpiCardProps {
    label: string
    value: number
    icon: LucideIcon
    iconClassName: string
    iconBackgroundClassName: string
}

function KpiCard({
    label,
    value,
    icon: Icon,
    iconClassName,
    iconBackgroundClassName,
}: KpiCardProps) {
    return (
        <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-gray-500">
                        {label}
                    </p>

                    <p className="mt-2 text-3xl font-semibold text-gray-900">
                        {value}
                    </p>
                </div>

                <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconBackgroundClassName}`}
                >
                    <Icon className={`h-5 w-5 ${iconClassName}`} />
                </div>
            </div>
        </div>
    )
}

export default KpiCard