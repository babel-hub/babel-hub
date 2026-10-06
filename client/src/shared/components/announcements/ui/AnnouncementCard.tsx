import type { Announcement } from "../../../types/types.ts";
import { formatterDate } from "../../../../types";
import { formatFullDateString } from "../../../../features/utils/utils.ts";
import { getStyles } from "../utils/utils.ts";
import { typeLabels } from "../types/types.ts";
import { FiCalendar } from "react-icons/fi";

interface AnnouncementCardProps {
    announcement: Announcement;
    onClick: () => void;
}

export function AnnouncementCard({ announcement, onClick }: AnnouncementCardProps) {
    const formattedDate = formatterDate.format(new Date(announcement.created_at));
    const date = formatFullDateString(formattedDate);
    const { Icon, style } = getStyles(announcement.type);

    return (
        <button
            onClick={onClick}
            className="bg-white border-b-1 cursor-pointer border-gray-100 last:border-b-0 p-2 w-full flex flex-col gap-3"
        >
            <div className="flex justify-between items-center gap-4 w-full">
                <div className="flex items-center w-full max-w-md gap-2">
                    <div className={`w-20 h-14 md:w-24 md:h-16 shrink-0 rounded-xl flex items-center justify-center ${style} transition-colors`}>
                        <Icon className="w-7 h-7 md:w-8 md:h-8" />
                    </div>

                    <div className="flex flex-col items-start flex-1 overflow-hidden">
                        <h3 className="text-sm md:text-base font-bold text-gray-900 leading-tight truncate transition-colors">
                            {announcement.title}
                        </h3>
                        <span className="text-xs md:text-sm text-gray-500 mt-1 capitalize truncate">
                        {announcement.caption ?? "Sin leyenda"}
                    </span>
                    </div>
                </div>

                <div className="flex items-center gap-3 md:gap-5 shrink-0">
                    <div className="hidden md:flex bg-primary-shadow px-3 py-1 text-xs md:text-sm text-primary-darker font-medium rounded-xl">
                        {typeLabels[announcement.target_type] || announcement.target_type}
                    </div>

                    <div className="hidden sm:flex text-gray-400 gap-1.5 items-center text-xs md:text-sm whitespace-nowrap">
                        <FiCalendar />
                        {date}
                    </div>
                </div>
            </div>
        </button>
    );
}