import type { ReactNode } from "react";

interface OtherAwardsProps {
    title: string
    description: string
    icon: ReactNode
}

export function OtherAwards({ title, description, icon }: OtherAwardsProps) {
    return (
        <button
            type="button"
            className="flex border cursor-pointer hover:bg-gray-50 border-gray-200 bg-white rounded-2xl p-2 gap-2 items-start"
        >
            <div className="flex-shrink-0 flex items-center justify-center">
                {icon}
            </div>

            <div className="flex gap-1 text-left flex-col items-start">
                <span className="text-sm text-primary font-semibold leading-tight">{title}</span>
                <p className="text-gray-400 text-xs leading-relaxed">{description}</p>
            </div>
        </button>
    )
}
