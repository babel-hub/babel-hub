import type { DashboardAlert } from "../../types/types.ts";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";

export function AlertItem({ alert }: { alert: DashboardAlert }) {
    const styles = {
        error: {
            row: "bg-rose-50/70 border-rose-100",
            icon: <AlertCircle className="h-4 w-4 text-rose-600" />,
            badge: "bg-rose-100 text-rose-700",
        },
        warning: {
            row: "bg-amber-50/70 border-amber-100",
            icon: <AlertTriangle className="h-4 w-4 text-amber-600" />,
            badge: "bg-amber-100 text-amber-700",
        },
        info: {
            row: "bg-primary-shadow/60 border-primary/20",
            icon: <Info className="h-4 w-4 text-primary-darker" />,
            badge: "bg-primary-shadow text-primary-darker",
        },
    }[alert.severity];

    return (
        <li
            className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-xs sm:text-sm ${styles.row}`}
        >
            <div className="flex min-w-0 items-center gap-2.5">
                <span className="shrink-0">{styles.icon}</span>
                <span className="text-slate-800">{alert.message}</span>
            </div>
            <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${styles.badge}`}
            >
                {alert.count}
            </span>
        </li>
    );
}