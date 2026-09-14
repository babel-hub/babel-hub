import { memo } from "react";
import { reverseName } from "../../../../../types";
import type { TeacherRowProps } from "../../types";
import {ActionMenu, type MenuOption} from "../../../../../components/ui/menu/ActionMenu.tsx";
import {HiPencil, HiTrash} from "react-icons/hi";
import { formatFullDateString } from "../../../../utils/utils.ts";

export const TeacherRow = memo(function ({ teacher, onEdit, onDelete, onNavigate }: TeacherRowProps) {
    const menuOptions: MenuOption[] = [
        {
            label: "Editar",
            icon: <HiPencil className="size-4" />,
            onClick: () => onEdit(teacher),
        },
        {
            isSeparator: true,
            label: "separator"
        },
        {
            label: "Eliminar",
            icon: <HiTrash className="size-4" />,
            onClick: () => onDelete(teacher),
            isDanger: true,
        }
    ];

    const formattedName = reverseName({
        middleName: teacher.teacher_middle_name,
        secondLastName: teacher.teacher_second_last_name,
        firstName: teacher.teacher_first_name,
        firstLastName: teacher.teacher_first_last_name
    })

    return (
        <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
            <td className="p-4">
                <div className="flex items-center gap-3">
                    <p className="w-10 uppercase h-10 shrink-0 rounded-full bg-primary-shadow flex items-center justify-center text-primary-darker font-bold text-sm">
                        {`${teacher.teacher_first_name.charAt(0)}${teacher.teacher_first_last_name.charAt(0)}`}
                    </p>
                    <button
                        onClick={() => onNavigate(`${teacher.id}`)}
                        className="overflow-hidden text-sm xl:text-base text-left cursor-pointer"
                    >
                        <p className="font-bold capitalize text-custom-black truncate" title={formattedName}>
                            {formattedName}
                        </p>
                        <p className="text-gray-500 text-xs truncate" title={teacher.email}>
                            {teacher.email}
                        </p>
                    </button>
                </div>
            </td>

            <td className="p-4">
                <span className="bg-indigo-50 text-indigo-700 font-semibold px-3 py-1 rounded-full text-xs border border-indigo-100">
                    {teacher.total_classes || 0} Clases
                </span>
            </td>

            <td className="p-4 text-gray-500 text-sm font-medium">
                {formatFullDateString(teacher.created_at)}
            </td>

            <td className="p-4">
                <ActionMenu options={menuOptions} />
            </td>
        </tr>
    );
});