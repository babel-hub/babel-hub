import type { Announcement } from "../../../types/types.ts";
import { formatterDate } from "../../../../types";
import { formatFullDateString } from "../../../../features/utils/utils.ts";
import { getStyles } from "../utils/utils.ts";
import { typeLabels } from "../types/types.ts";
import { FiCalendar } from "react-icons/fi";
import { HiPencil, HiTrash } from "react-icons/hi";
import { NoResults } from "../../../../components/ui/blocks/NoResults.tsx";
import { ActionMenu, type MenuOption } from "../../../../components/ui/menu/ActionMenu.tsx";

interface AnnouncementsListProps {
    announcements: Announcement[];
    onView: (announcement: Announcement) => void;
    onEdit: (announcement: Announcement) => void;
    onDelete: (announcement: Announcement) => void;
}

export function AnnouncementsList({ announcements, onView, onEdit, onDelete }: AnnouncementsListProps) {
    if (!announcements || announcements.length === 0) {
        return <NoResults title="No hay comunicados registrados" />;
    }

    return (
        <div className="flex flex-col w-full rounded-xl overflow-hidden border border-gray-100">
            {announcements.map((item) => (
                <AnnouncementManagerCard
                    key={item.id}
                    announcement={item}
                    onView={() => onView(item)}
                    onEdit={() => onEdit(item)}
                    onDelete={() => onDelete(item)}
                />
            ))}
        </div>
    );
}

interface AnnouncementManagerCardProps {
    announcement: Announcement;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

function AnnouncementManagerCard({ announcement, onView, onEdit, onDelete }: AnnouncementManagerCardProps) {
    const formattedDate = formatterDate.format(new Date(announcement.created_at));
    const date = formatFullDateString(formattedDate);
    const { Icon, style } = getStyles(announcement.type);

    const menuOptions: MenuOption[] = [
        {
            label: "Editar",
            icon: <HiPencil className="size-4" />,
            onClick: onEdit,
        },
        {
            isSeparator: true,
            label: "separator"
        },
        {
            label: "Eliminar",
            icon: <HiTrash className="size-4" />,
            onClick: onDelete,
            isDanger: true,
        }
    ];

    return (
        <div className="bg-white border-b border-gray-100 p-3 w-full flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors last:border-b-0">
            <button
                onClick={onView}
                className="flex items-center flex-1 max-w-lg gap-3 text-left cursor-pointer"
            >
                <div className={`w-20 h-14 md:w-24 md:h-16 shrink-0 rounded-xl flex items-center justify-center ${style} transition-colors`}>
                    <Icon className="w-7 h-7 md:w-8 md:h-8" />
                </div>

                <div className="flex flex-col flex-1 overflow-hidden">
                    <h3 className="text-sm md:text-base font-bold text-gray-900 leading-tight truncate transition-colors">
                        {announcement.title}
                    </h3>
                    <span className="text-xs md:text-sm text-gray-500 mt-1 capitalize truncate">
                        {announcement.caption ?? "Sin leyenda"}
                    </span>
                </div>
            </button>

            <div className="flex items-center gap-3 md:gap-6 shrink-0">
                <div className="hidden md:flex bg-primary-shadow px-3 py-1 text-xs md:text-sm text-primary-darker font-medium rounded-xl">
                    {typeLabels[announcement.target_type] || announcement.target_type}
                </div>

                <div className="hidden sm:flex text-gray-400 gap-1.5 items-center text-xs md:text-sm whitespace-nowrap">
                    <FiCalendar />
                    {date}
                </div>

                <div className="pl-2">
                    <ActionMenu options={menuOptions} />
                </div>
            </div>
        </div>
    );
}