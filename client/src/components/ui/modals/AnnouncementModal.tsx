import type { Announcement } from "../../../shared/types/types";
import { getStyles } from "../../../shared/components/announcements/utils/utils.ts";
import { formatterDate } from "../../../types";

interface AnnouncementModalProps {
    announcement: Announcement;
    onClose: () => void;
}

const typeLabels: Record<string, string> = {
    GENERAL: "General",
    EVENT: "Evento",
    EMERGENCY: "Urgente",
    DEADLINE: "Fecha Límite",
    POLL: "Encuesta",
};

export function AnnouncementModal({ announcement, onClose }: AnnouncementModalProps) {
    const { Icon, style } = getStyles(announcement.type);
    const formattedDate = formatterDate.format(new Date(announcement.created_at));

    return (
        <div className="fixed inset-0 z-50 flex items-center bg-black/40 backdrop-blur-sm justify-center p-4">
            {/*
              max-h-[90vh] and flex-col allow the card to have a maximum height.
              The inner content has overflow-y-auto so long descriptions scroll gracefully.
            */}

            <div className="bg-white rounded-2xl w-full max-w-lg flex flex-col max-h-[90vh]">

                <div className="flex justify-between items-center w-full p-4">
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${style}`}>
                        {typeLabels[announcement.type] || announcement.type}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-400 hover:bg-gray-100 border border-transparent transition-colors hover:border-gray-300 rounded-md hover:text-gray-600 cursor-pointer p-1.5 flex items-center justify-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="overflow-y-auto px-5 pb-5 flex flex-col gap-5">
                    <div className={`w-full h-42 shrink-0 rounded-2xl flex items-center justify-center ${style}`}>
                        <Icon className="w-8 h-8" />
                    </div>
                    <div className="flex flex-col gap-1 items-start">
                        <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                            {announcement.title}
                        </h2>

                        {announcement.caption ? (
                            <p className="text-gray-800 text-base font-medium md:text-lg leading-snug">
                                {announcement.caption}
                            </p>
                        ) : ( <p className="text-gray-700 whitespace-pre-wrap text-base leading-relaxed">Sin leyenda</p> )}
                        <div className="text-gray-700 whitespace-pre-wrap text-sm md:text-base leading-relaxed">
                            {announcement.description}
                        </div>
                    </div>

                    <div className="flex gap-4 items-start">
                        <div className="flex flex-col">
                            <span className="text-sm text-gray-500 mt-2">
                                Por <span className="font-semibold text-gray-700">{announcement.author}</span>
                            </span>
                            <span className="text-xs text-gray-400 mt-0.5">
                                {formattedDate}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}