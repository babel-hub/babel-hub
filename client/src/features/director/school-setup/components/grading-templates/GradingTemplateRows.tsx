import { HiPencil, HiTrash } from "react-icons/hi";
import type { GradingTemplate } from "../../types";
import { ActionMenu, type MenuOption } from "../../../../../components/ui/menu/ActionMenu.tsx";
import {Link} from "react-router-dom";

interface GradingTemplateRowsProps {
    gradingTemplate: GradingTemplate;
    onDelete: (template: GradingTemplate) => void;
    onEdit: (template: GradingTemplate) => void;
}

export function GradingTemplateRows({ gradingTemplate, onDelete, onEdit }: GradingTemplateRowsProps) {
    const menuOptions: MenuOption[] = [
        {
            label: "Editar",
            icon: <HiPencil className="size-4" />,
            onClick: () => onEdit(gradingTemplate),
        },
        {
            isSeparator: true,
            label: "separator"
        },
        {
            label: "Eliminar",
            icon: <HiTrash className="size-4" />,
            onClick: () => onDelete(gradingTemplate),
            isDanger: true,
        }
    ];

    return (
        <li className="w-full text-left p-3 sm:px-5 sm:py-3 border-2 border-gray-100 rounded-lg text-sm font-medium text-custom-black flex items-center justify-between">
            <Link
                to={`grading-templates/${gradingTemplate.id}`}
                className="cursor-pointer w-full capitalize text-sm sm:text-base font-medium flex items-center gap-1"
            >
                {gradingTemplate.name}
                <span className="text-xs text-gray-500 font-normal">
                    ({gradingTemplate.scale_min}-{gradingTemplate.scale_max})
                </span>
            </Link>

            <div className="shrink-0">
                <ActionMenu options={menuOptions} />
            </div>
        </li>
    );
}