import type { Parent } from "../../types";
import { formateDate, reverseName } from "../../../../../types";
import { useEffect, useRef, useState } from "react";
import { HiPencil, HiTrash } from "react-icons/hi";
import {FiPlus} from "react-icons/fi";
import {ActionMenu, type MenuOption} from "../../../../../components/ui/menu/ActionMenu.tsx";

interface ParentsTableProps {
    parents: Parent[];
    onAddStudent: (parent: Parent) => void;
    onEdit: (parent: Parent) => void;
    onDelete: (parent: Parent) => void;
}

export function ParentsTable({ parents, onEdit, onDelete, onAddStudent }: ParentsTableProps) {
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

    const closeMenu = () => setActiveMenuId(null);

    return (
        <div className="bg-white md:rounded-xl shadow-sm border border-gray-100 overflow-x-auto overflow-y-visible">
            <table className="w-full text-left border-collapse min-w-3xl">
                <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-600">
                    <th className="p-4 text-sm font-semibold">Acudiente ({parents.length})</th>
                    <th className="p-4 text-sm font-semibold">Hijos Vinculados</th>
                    <th className="p-4 text-sm font-semibold">Fecha de Registro</th>
                    <th className="p-4 text-sm font-semibold text-right">Acciones</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                {parents.map((parent) => (
                    <ParentsRow
                        key={parent.parent_id}
                        onAddStudent={onAddStudent}
                        isOpen={activeMenuId === parent.parent_id}
                        closeMenu={closeMenu}
                        parent={parent}
                        onDelete={onDelete}
                        onEdit={onEdit}
                    />
                ))}
                </tbody>
            </table>
        </div>
    );
}

interface ParentsRowProps {
    parent: Parent;
    isOpen: boolean;
    onEdit: (parent: Parent) => void;
    onAddStudent: (parent: Parent) => void;
    onDelete: (parent: Parent) => void;
    closeMenu: () => void;
}

const RELATIONSHIP_TRANSLATIONS: Record<string, string> = {
    father: "Padre",
    mother: "Madre",
    other: "Otro"
};

function ParentsRow({ parent, onEdit, onDelete, closeMenu, isOpen, onAddStudent }: ParentsRowProps) {
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;

            if (
                menuRef.current && !menuRef.current.contains(target) &&
                buttonRef.current && !buttonRef.current.contains(target)
            ) {
                closeMenu();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, closeMenu]);

    const menuOptions: MenuOption[] = [
        {
            label: "Asignar",
            icon: <FiPlus className="size-4" />,
            onClick: () => onAddStudent(parent),
        },
        {
            label: "Editar",
            icon: <HiPencil className="size-4" />,
            onClick: () => onEdit(parent),
        },
        {
            isSeparator: true,
            label: "separator"
        },
        {
            label: "Eliminar",
            icon: <HiTrash className="size-4" />,
            onClick: () => onDelete(parent),
            isDanger: true,
        }
    ];

    const formattedName = reverseName({
        firstName: parent.parent_first_name,
        middleName: parent.parent_middle_name,
        firstLastName: parent.parent_first_last_name,
        secondLastName: parent.parent_second_last_name,
    });

    return (
        <tr className="hover:bg-gray-50 transition-colors">
            <td className="p-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 shrink-0 uppercase rounded-full bg-primary-shadow flex items-center justify-center text-primary font-bold text-sm">
                        {`${parent.parent_first_name.charAt(0)}${parent.parent_first_last_name.charAt(0)}`}
                    </div>
                    <button
                        className="overflow-hidden text-sm xl:text-base text-left cursor-pointer transition-colors hover:text-primary"
                    >
                        <p className="font-bold capitalize text-custom-black truncate" title={formattedName}>
                            {formattedName}
                        </p>
                        <p className="text-gray-500 text-xs truncate" title={parent.email}>
                            {parent.email}
                        </p>
                    </button>
                </div>
            </td>

            <td className="p-4">
                {parent.students_count > 0 ? (
                    <div className="flex flex-wrap gap-2 max-w-md w-full">
                        {parent.students?.map((child) => {
                            const childName = `${child.student_first_name} ${child.student_first_last_name}`;
                            const role = RELATIONSHIP_TRANSLATIONS[child.relationship_type] || "Otro";

                            return (
                                <span
                                    key={child.student_id}
                                    className="inline-flex items-center gap-1 bg-primary-shadow/50 text-primary font-medium px-2 py-1 rounded-xl text-[11px] capitalize border border-primary"
                                    title={`Relación: ${role}`}
                                >
                                    {childName}
                                    <span className="text-primary font-normal">({role})</span>
                                </span>
                            );
                        })}
                    </div>
                ) : (
                    <span className="bg-yellow-50 text-yellow-700 font-medium px-2 py-1 rounded-xl text-xs border border-yellow-100">
                        Sin asignar
                    </span>
                )}
            </td>

            <td className="p-4 text-gray-500 text-sm whitespace-nowrap">
                {formateDate(parent.created_at)}
            </td>

            <td className="p-4">
                <ActionMenu options={menuOptions} />
            </td>
        </tr>
    );
}