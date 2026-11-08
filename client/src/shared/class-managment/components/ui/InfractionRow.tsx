import { HiPencil, HiTrash, HiOutlineDuplicate, HiOutlineShieldExclamation } from "react-icons/hi";
import type { StudentInfraction } from "../../types/types.ts";
import { ActionMenu, type MenuOption } from "../../../../components/ui/menu/ActionMenu.tsx";
import { getSeverityStyle } from "../../utils/utils.ts";
import {formatFullDateString} from "../../../../features/utils/utils.ts";

interface InfractionRowProps {
    infraction: StudentInfraction;
    onEdit: (infraction: StudentInfraction) => void;
    onDelete: (infraction: StudentInfraction) => void;
    onRepeat: (infraction: StudentInfraction) => void;
    onEscalate: (infraction: StudentInfraction) => void;
}

export function InfractionRow({ infraction, onEdit, onDelete, onRepeat, onEscalate }: InfractionRowProps) {
    const menuOptions: MenuOption[] = [
        {
            label: "Editar",
            icon: <HiPencil className="size-4" />,
            onClick: () => onEdit(infraction),
        },
        {
            label: "Reincidir",
            icon: <HiOutlineDuplicate className="size-4" />,
            onClick: () => onRepeat(infraction),
        },
        {
            label: "Escalar",
            icon: <HiOutlineShieldExclamation className="size-4" />,
            onClick: () => onEscalate(infraction),
        },
        {
            isSeparator: true,
            label: "separator",
        },
        {
            label: "Eliminar",
            icon: <HiTrash className="size-4" />,
            onClick: () => onDelete(infraction),
            isDanger: true,
        },
    ];

    return (
        <li className="border border-gray-100 rounded-xl p-3">
            <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-semibold text-sm text-custom-black">
                    {infraction.infraction_name}
                </span>
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${getSeverityStyle(infraction.severity)}`}>
                        {infraction.severity === "high" ? "Grave" : infraction.severity === "medium" ? "Media" : "Leve"}
                    </span>
                    <div className="shrink-0">
                        <ActionMenu options={menuOptions} />
                    </div>
                </div>
            </div>
            {infraction.description && (
                <p className="text-sm text-gray-600 mb-2">{infraction.description}</p>
            )}
            <p className="text-xs text-gray-400">
                Reportado por <span className="font-medium capitalize">{infraction.reported_by_name}</span>
                {" · "}
                {formatFullDateString(infraction.created_at)}
            </p>
        </li>
    );
}