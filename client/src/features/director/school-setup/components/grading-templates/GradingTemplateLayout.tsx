import { useGradingTemplateData } from "../../hooks/grading-templates/useGradingTemplateData.ts";
import { useState } from "react";
import type { GradingTemplate } from "../../types";
import type { ModalModeTypes } from "../../../../../types";
import { ConfirmModal } from "../../../../../components/ui/modals/ConfirmModal.tsx";
import { useDeleteGradingTemplate } from "../../hooks/grading-templates/useDeleteGradingTemplate.ts";
import { GradingTemplateModalMode } from "../ui/GradingTemplateModalMode.tsx";
import { HiPlus } from "react-icons/hi";
import { GradingTemplateRows } from "./GradingTemplateRows.tsx";

export function GradingTemplateLayout() {
    const [gradingTemplateToEdit, setGradingTemplateToEdit] = useState<GradingTemplate | null>(null);
    const [gradingTemplateToDelete, setGradingTemplateToDelete] = useState<GradingTemplate | null>(null);
    const [modalMode, setModalMode] = useState<ModalModeTypes>('none');

    const { gradingTemplates, refetch } = useGradingTemplateData();
    const { loadingDelete, deleteGradingTemplateById } = useDeleteGradingTemplate(refetch);

    const handleDelete = (gradingTemplate: GradingTemplate) => {
        setGradingTemplateToDelete(gradingTemplate);
    };

    const handleEdit = (gradingTemplate: GradingTemplate) => {
        setGradingTemplateToEdit(gradingTemplate);
        setModalMode("edit");
    };

    const handleCreate = () => {
        setGradingTemplateToEdit(null);
        setModalMode("create");
    };

    return (
        <div className="w-full">
            <div className="flex items-center mb-5 justify-between">
                <div className="max-w-[250px] w-full">
                    <p className="text-custom-black text-sm font-semibold">Tus porcentajes evaluativos</p>
                    <p className="text-xs text-gray-500">Cada planilla o porcentaje evaluativo puede contener varios criterios.</p>
                </div>
                <button
                    className="cursor-pointer flex items-center gap-1 py-2 px-3 rounded-md transition-colors text-sm font-bold text-primary hover:bg-primary-shadow hover:border-primary-shadow border border-gray-100"
                    onClick={handleCreate}
                >
                    <HiPlus />
                    <p>Añadir</p>
                </button>
            </div>

            <ul className="flex flex-col gap-2">
                {gradingTemplates.map((gradingTemplate: GradingTemplate) => (
                    <GradingTemplateRows
                        key={gradingTemplate.id}
                        gradingTemplate={gradingTemplate}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                ))}
            </ul>

            <ConfirmModal
                isOpen={gradingTemplateToDelete !== null}
                onClose={() => setGradingTemplateToDelete(null)}
                title="¿Estás seguro?"
                message={`¿Quieres eliminar el template ${gradingTemplateToDelete?.name}?`}
                onConfirm={async () => {
                    if (gradingTemplateToDelete) {
                        await deleteGradingTemplateById(gradingTemplateToDelete.id);
                        setGradingTemplateToDelete(null);
                    }
                }}
                loadingDelete={loadingDelete}
            />

            {modalMode !== "none" && (
                <GradingTemplateModalMode
                    mode={modalMode}
                    gradingTemplate={gradingTemplateToEdit}
                    gradingTemplateId={gradingTemplateToEdit ? gradingTemplateToEdit.id : null}
                    onSuccess={async () => {
                        setGradingTemplateToEdit(null);
                        setModalMode("none");
                        await refetch();
                    }}
                    onCancel={() => {
                        setGradingTemplateToEdit(null);
                        setModalMode("none");
                    }}
                />
            )}
        </div>
    );
}