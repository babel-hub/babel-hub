import React from "react";

interface KpiCardProps {
    label: string;
    value: string | number;
    subtext: string;
    icon: React.ReactNode;
    accent?: boolean;
    highlightSubtext?: boolean;
}

export function KpiCard({
                            label,
                            value,
                            subtext,
                            icon,
                            accent = false,
                            highlightSubtext = false,
                        }: KpiCardProps) {
    return (
        <div
            className={`relative overflow-hidden rounded-xl border p-4 transition ${
                accent
                    ? "border-primary/30 bg-gradient-to-br from-primary-shadow/40 to-white"
                    : "border-slate-200 bg-white"
            }`}
        >
            <div className="relative z-10">
                <span className="block text-xs font-medium text-slate-500 sm:text-sm">
                    {label}
                </span>
                <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    {value}
                </p>
                <p
                    className={`mt-1 truncate text-xs ${
                        highlightSubtext
                            ? "font-medium text-primary-darker"
                            : "text-slate-500"
                    }`}
                >
                    {subtext}
                </p>
            </div>

            <span
                aria-hidden="true"
                className={`pointer-events-none absolute top-5 -right-5 select-none ${
                    accent ? "text-primary-shadow" : "text-primary-shadow"
                }`}
            >
                {icon}
            </span>
        </div>
    );
}