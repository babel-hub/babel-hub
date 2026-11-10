import type { StudentMonitoring } from "../../types/types.ts";
import { getTypeStyle } from "../../utils/utils.ts";
import { formatFullDateString } from "../../../../features/utils/utils.ts";
import {HiOutlineChat} from "react-icons/hi";

interface MonitoringRowProps {
    monitoring: StudentMonitoring;
    onOpenMessages?: (monitoring: StudentMonitoring) => void;
}

export function MonitoringRow({ monitoring, onOpenMessages }: MonitoringRowProps) {
    return (
        <li className="border border-gray-100 rounded-xl p-3">
            <div className="flex items-start justify-between gap-2 mb-2">

                <div className="flex flex-col">
                    <span className="text-xs text-gray-500 font-medium mt-0.5">
                        Art. {monitoring.infraction_article_name}
                    </span>
                    <span className="text-sm text-custom-black leading-tight">
                        <span className="font-semibold">Cod, {monitoring.infraction_code_number}.</span> {monitoring.infraction_code_name}
                    </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] uppercase tracking-wide font-bold px-2 py-0.5 rounded-md ${getTypeStyle(monitoring.infraction_type_order)}`}>
                        {monitoring.infraction_type_order === 1
                            ? "I"
                            : monitoring.infraction_type_order === 2
                                ? "II"
                                : "III"}
                    </span>
                    {onOpenMessages && (
                        <button
                            type="button"
                            onClick={() => onOpenMessages(monitoring)}
                            className="flex items-center gap-1 text-gray-500 hover:text-primary px-2 py-1 rounded-md hover:bg-gray-50 transition-colors"
                            title="Ver mensajes"
                        >
                            <HiOutlineChat className="size-4" />
                            {monitoring.message_count > 0 && (
                                <span className="text-xs font-semibold">
                                    {monitoring.message_count}
                                </span>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {monitoring.notes && (
                <p className="text-sm text-gray-600 mb-2 mt-3">{monitoring.notes}</p>
            )}

            <p className="text-xs text-gray-400 mt-1">
                En <span className="font-medium capitalize">{monitoring.course_name}</span>
                {" · "}
                Reportado por <span className="font-medium capitalize">{monitoring.reported_by_name}</span>
                {" · "}
                {formatFullDateString(monitoring.created_at)}
            </p>
        </li>
    );
}