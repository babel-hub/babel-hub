import type { Announcement } from "../../../types/types.ts";
import { formatterDate } from "../../../../types";
import { formatDayLabel } from "../../../../features/utils/utils.ts";
import { getStyles } from "../utils/utils.ts";
import { typeLabels } from "../types/types.ts";

interface AnnouncementCardProps {
    announcement: Announcement;
    onClick: () => void;
}

export function AnnouncementCard({ announcement, onClick }: AnnouncementCardProps) {
    const formattedDate = formatterDate.format(new Date(announcement.created_at));
    const date = formatDayLabel(formattedDate);
    const { Icon, style } = getStyles(announcement.type);

    return (
        <button
            onClick={onClick}
            className="bg-white rounded-xl border border-gray-200 p-2 w-full shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3"
        >
            <div className="flex justify-between items-center gap-4 w-full">

                <div className="flex items-center w-full max-w-md gap-2">
                    <div className={`w-26 h-16 shrink-0 rounded-xl flex items-center justify-center ${style} transition-colors`}>
                        <Icon className="w-8 h-8" />
                    </div>

                    <div className="flex flex-col flex-1 text-left">
                        <h3 className="text-sm md:text-base font-bold text-gray-900 leading-tight">
                            {announcement.title}
                        </h3>
                        <span className="text-xs md:text-sm text-gray-500 mt-1 capitalize">
                        {announcement.caption ?? "Sin leyenda"}
                    </span>
                    </div>
                </div>

                <div className="">
                    {typeLabels[announcement.target_type]}
                </div>

                <div>
                    {date}
                </div>
            </div>
        </button>
    );
}