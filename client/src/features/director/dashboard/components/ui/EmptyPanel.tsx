import React from "react";

export function EmptyPanel({
                        icon,
                        title,
                        description,
                        actionLabel,
                        onAction,
                    }: {
    icon: React.ReactNode;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
}) {
    return (
        <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white">
                {icon}
            </div>
            <p className="text-sm font-medium text-slate-700">{title}</p>
            <p className="mt-1 max-w-xs text-xs text-slate-500">{description}</p>
            {actionLabel && onAction && (
                <button
                    type="button"
                    onClick={onAction}
                    className="mt-3 text-xs font-semibold text-[#9757FF] hover:underline"
                >
                    + {actionLabel}
                </button>
            )}
        </div>
    );
}