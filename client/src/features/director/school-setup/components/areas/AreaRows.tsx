import { HiPencil, HiTrash } from "react-icons/hi";
import { ActionMenu, type MenuOption } from "../../../../../components/ui/menu/ActionMenu.tsx";
import type { Area } from "../../../../../shared/types/types.ts";
import { Link } from "react-router-dom";

interface AreaRowsProps {
    area: Area;
    onDelete: (area: Area) => void;
    onEdit: (area: Area) => void;
}

export function AreaRows({ area, onDelete, onEdit }: AreaRowsProps) {
    const menuOptions: MenuOption[] = [
        {
            label: "Editar",
            icon: <HiPencil className="size-4" />,
            onClick: () => onEdit(area),
        },
        {
            isSeparator: true,
            label: "separator"
        },
        {
            label: "Eliminar",
            icon: <HiTrash className="size-4" />,
            onClick: () => onDelete(area),
            isDanger: true,
        }
    ];

    return (
        <li className="w-full p-3 sm:px-5 sm:py-3 border-2 border-gray-100 rounded-xl text-sm font-medium text-custom-black flex items-center justify-between">
            <Link
                to={`areas/${area.id}`}
                className="cursor-pointer w-full capitalize text-sm sm:text-base font-medium"
            >
                {area.name}
            </Link>

            <ActionMenu options={menuOptions} />
        </li>
    )
}