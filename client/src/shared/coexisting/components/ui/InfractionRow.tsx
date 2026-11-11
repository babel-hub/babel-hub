import { HiPencil, HiTrash, HiOutlineDuplicate, HiOutlineShieldExclamation } from "react-icons/hi";
import type { StudentInfraction } from "../../types/types.ts";
import { ActionMenu, type MenuOption } from "../../../../components/ui/menu/ActionMenu.tsx";
import { formatFullDateString } from "../../../../features/utils/utils.ts";
import { getTypeStyle } from "../../utils/utils.ts";

interface InfractionRowProps {
    infraction: StudentInfraction;
    onEdit?: (infraction: StudentInfraction) => void;
    onDelete?: (infraction: StudentInfraction) => void;
    onRepeat?: (infraction: StudentInfraction) => void;
    onEscalate?: (infraction: StudentInfraction) => void;
    showClassName?: boolean;
}

export function InfractionRow({
                                  infraction,
                                  onEdit,
                                  onDelete,
                                  onRepeat,
                                  onEscalate,
                                  showClassName = true,
                              }: InfractionRowProps) {
    const menuOptions: MenuOption[] = [];
    if (onEdit) menuOptions.push({ label: "Editar", icon: <HiPencil />, onClick: () => onEdit(infraction) });
    if (onRepeat) menuOptions.push({ label: "Reincidir", icon: <HiOutlineDuplicate />, onClick: () => onRepeat(infraction) });
    if (onEscalate) menuOptions.push({ label: "Escalar", icon: <HiOutlineShieldExclamation className="text-orange-500" />, onClick: () => onEscalate(infraction) });
    if (onDelete) {
        if (menuOptions.length > 0) menuOptions.push({ isSeparator: true, label: "separator" });
        menuOptions.push({ label: "Eliminar", icon: <HiTrash />, onClick: () => onDelete(infraction), isDanger: true });
    }

    return (
        <li className="border border-gray-100 rounded-xl p-3">
            <div className="flex items-start justify-between gap-2 mb-2">

                <div className="flex flex-col">
                    <span className="text-xs text-gray-500 font-medium mt-0.5">
                        Art. {infraction.infraction_article_name}
                    </span>
                    <span className="text-sm text-custom-black leading-tight">
                        <span className="font-semibold">Cod, {infraction.infraction_code_number}.</span> {infraction.infraction_code_name}
                    </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] uppercase tracking-wide font-bold px-2 py-0.5 rounded-md ${getTypeStyle(infraction.infraction_type_order)}`}>
                        {infraction.infraction_type_order === 1
                            ? "I"
                            : infraction.infraction_type_order === 2
                                ? "II"
                                : "III"}

                    </span>
                    {menuOptions.length > 0 && (
                        <div className="shrink-0 -mt-1">
                            <ActionMenu options={menuOptions} />
                        </div>
                    )}
                </div>
            </div>

            {infraction.description && (
                <p className="text-sm text-gray-600 mb-2 mt-3">{infraction.description}</p>
            )}

            <p className="text-xs text-gray-400 mt-1">
                {showClassName && (
                    <>
                        En <span className="font-medium capitalize">{infraction.class_name || "clase"}</span>
                        {" · "}
                    </>
                )}
                Reportado por <span className="font-medium capitalize">{infraction.reported_by_name}</span>
                {" · "}
                {formatFullDateString(infraction.created_at)}
            </p>
        </li>
    );
}