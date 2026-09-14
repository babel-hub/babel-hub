import type { AssessmentCriteria, Assignment } from "../../../../types";
import {HiDotsVertical, HiPencil, HiTrash} from "react-icons/hi";
import {ActionMenu, type MenuOption} from "../../menu/ActionMenu.tsx";

interface AssignmentMenuProps {
    assessmentCriteria: AssessmentCriteria;
    assignment: Assignment;
    onEditAssignment: (ac: AssessmentCriteria, asg: Assignment) => void;
    onDeleteAssignment: (asg: Assignment) => void;
}

export function AssignmentMenu({
                                   assessmentCriteria,
                                   assignment,
                                   onEditAssignment,
                                   onDeleteAssignment
                               }: AssignmentMenuProps) {
    const menuOptions: MenuOption[] = [
        {
            label: "Editar",
            icon: <HiPencil className="size-4" />,
            onClick: () => onEditAssignment(assessmentCriteria, assignment),
        },
        {
            isSeparator: true,
            label: "separator"
        },
        {
            label: "Eliminar",
            icon: <HiTrash className="size-4" />,
            onClick: () => onDeleteAssignment(assignment),
            isDanger: true,
        }
    ];

    return (
        <ActionMenu options={menuOptions} customIcon={<HiDotsVertical className="size-3 opacity-0 hover:opacity-100" />} />
    )
}