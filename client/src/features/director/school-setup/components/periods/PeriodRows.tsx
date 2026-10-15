import { HiPencil, HiTrash } from "react-icons/hi";
import { ActionMenu, type MenuOption } from "../../../../../components/ui/menu/ActionMenu.tsx";
import { formatDatePeriod } from "../../../../utils/utils.ts";
import type { Period } from "../../../../../shared/types/types.ts";

interface PeriodRowsProps {
    period: Period;
    onDelete: (period: Period) => void;
    onEdit: (period: Period) => void;
}

export function PeriodRows({ period, onDelete, onEdit }: PeriodRowsProps) {
    const menuOptions: MenuOption[] = [
        {
            label: "Editar",
            icon: <HiPencil className="size-4" />,
            onClick: () => onEdit(period),
        },
        {
            isSeparator: true,
            label: "separator"
        },
        {
            label: "Eliminar",
            icon: <HiTrash className="size-4" />,
            onClick: () => onDelete(period),
            isDanger: true,
        }
    ];

    return (
        <li className="w-full text-left p-3 sm:px-5 sm:py-3 border-2 border-gray-100 rounded-lg text-sm font-medium text-custom-black flex items-center justify-between">
            <div
                className="text-left flex flex-col"
            >
                <span className="capitalize text-sm sm:text-base font-medium">{period.name}</span>
                <span className="text-xs text-gray-400">{formatDatePeriod(period.start_date, period.end_date)}</span>
            </div>

            <div className="shrink-0">
                <ActionMenu options={menuOptions} />
            </div>
        </li>
    );
}