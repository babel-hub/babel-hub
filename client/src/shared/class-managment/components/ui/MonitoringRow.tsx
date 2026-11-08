import type {StudentMonitoring} from "../../types/types.ts";
import {getSeverityStyle} from "../../utils/utils.ts";
import {formatFullDateString} from "../../../../features/utils/utils.ts";

interface MonitoringRowProps {
    monitoring: StudentMonitoring;
}

export function MonitoringRow({ monitoring }: MonitoringRowProps) {
    return (
        <li className="border border-gray-100 rounded-xl p-3">
            <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-semibold text-sm capitalize text-custom-black">
                    {monitoring.infraction_name}
                </span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${getSeverityStyle(monitoring.severity)}`}>
                    {monitoring.severity === "high" ? "Grave" : monitoring.severity === "medium" ? "Media" : "Leve"}
                </span>
            </div>
            {monitoring.notes && (
                <p className="text-sm text-gray-600 mb-2">{monitoring.notes}</p>
            )}
            <p className="text-xs text-gray-400">
                En <span className="font-medium capitalize">{monitoring.course_name}</span>
                {" · "}
                Reportado por <span className="font-medium capitalize">{monitoring.reported_by_name}</span>
                {" · "}
                {formatFullDateString(monitoring.created_at)}
            </p>
        </li>
    );
}