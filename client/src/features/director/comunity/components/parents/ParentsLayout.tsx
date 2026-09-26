import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import ButtonChevronBack from "../../../../../components/ui/buttons/ButtonChevrowBack.tsx";
import { PrimaryButton } from "../../../../../components/ui/buttons/Buttons.tsx";
import { ConfirmModal } from "../../../../../components/ui/modals/ConfirmModal.tsx";
import { ParentFormModal } from "../ui/ParentFormModal.tsx";
import { LoadingContent } from "../../../../../components/ui/Loadings.tsx";
import { useParentsData } from "../../hooks/parents/useParentsData.ts";
import { useParentDelete } from "../../hooks/parents/useParentDelete.ts";
import { type ModalModeTypes, reverseName } from "../../../../../types";
import type { Parent } from "../../types";
import { ParentsTable } from "./ParentTable.tsx";
import {ParentToStudentFormModal} from "../ui/ParentToStudentFormModal.tsx";
import {useParentStudentDelete} from "../../hooks/parents/useParentStudentDelete.ts";

export function ParentsLayout() {
    const navigate = useNavigate();

    const { parents, loading, refetch } = useParentsData();
    const { deleteParentById, loadingDelete } = useParentDelete(refetch);
    const { loading: parentStudentLoading, deleteParentStudentById } = useParentStudentDelete(refetch);

    const [searchTerm, setSearchTerm] = useState("");
    const [modalMode, setModalMode] = useState<ModalModeTypes>('none');
    const [parentToEdit, setParentToEdit] = useState<Parent | null>(null);
    const [parentToDelete, setParentToDelete] = useState<Parent | null>(null);
    const [parentToDeleteStudent, setParentToDeleteStudent] = useState<Parent | null>(null);

    const [modalModeParentToStudent, setModalModeParentToStudent] = useState<ModalModeTypes>('none');
    const [parentToStudent, setParentToStudent] = useState<Parent | null>(null);

    const filteredParents = parents.filter((parent: any) =>
        parent.parent_first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        parent.parent_first_last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        parent.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOnAddStudent = (parent: Parent) => {
        setParentToStudent(parent);
        setModalModeParentToStudent('create')
    }

    const handleOpenEdit = useCallback((parent: Parent) => {
        setParentToEdit(parent);
        setModalMode('edit');
    }, []);

    const handleOpenDelete = useCallback((parent: Parent) => {
        setParentToDelete(parent || null);
    }, [parents]);

    const handleOpenDeleteStudent = useCallback((parent: Parent) => {
        setParentToDeleteStudent(parent || null);
    }, [parents]);

    if (loading) return <LoadingContent title="Cargando padres/acudientes..." />;

    console.log(parents);

    return (
        <div className="flex flex-col md:gap-5">
            <div className="bg-white xl:rounded-xl md:border md:border-gray-100 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="flex gap-2">
                    <ButtonChevronBack onClick={() => navigate(-1)} />
                    <h2 className="text-xl md:text-1xl xl:text-2xl font-bold text-custom-black">Padres</h2>
                </div>
                <div className="flex grow w-full gap-2 justify-end items-center">
                    <div className="w-full sm:max-w-2xs">
                        <input
                            type="text"
                            placeholder="Buscar padre"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 xl:py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 transition-shadow"
                        />
                    </div>
                    <PrimaryButton
                        onClick={() => {
                            setParentToEdit(null);
                            setModalMode('create');
                        }}
                        title="+ Nuevo padre"
                    />
                </div>
            </div>

            <ParentsTable
                parents={filteredParents}
                onAddStudent={handleOnAddStudent}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
                onDeleteStudent={handleOpenDeleteStudent}
            />

            <ConfirmModal
                isOpen={parentToDelete !== null}
                onClose={() => setParentToDelete(null)}
                title="¿Estás seguro?"
                message={`¿Quieres eliminar al padre/acudiente ${
                    parentToDelete ?
                        reverseName({
                            middleName: parentToDelete.parent_middle_name,
                            secondLastName: parentToDelete.parent_second_last_name,
                            firstName: parentToDelete.parent_first_name,
                            firstLastName: parentToDelete.parent_first_last_name
                        }) : "Desconocido"
                }? Esta acción no se puede deshacer.`}
                onConfirm={async () => {
                    if (parentToDelete) {
                        await deleteParentById(parentToDelete.parent_id);
                        setParentToDelete(null);
                    }
                }}
                loadingDelete={loadingDelete}
            />

            <ConfirmModal
                isOpen={parentToDeleteStudent !== null}
                onClose={() => setParentToDeleteStudent(null)}
                title="¿Estás seguro?"
                message={`¿Quieres eliminar al padre/acudiente ${
                    parentToDeleteStudent ?
                        reverseName({
                            middleName: parentToDeleteStudent.parent_middle_name,
                            secondLastName: parentToDeleteStudent.parent_second_last_name,
                            firstName: parentToDeleteStudent.parent_first_name,
                            firstLastName: parentToDeleteStudent.parent_first_last_name
                        }) : "Desconocido"
                }? Esta acción no se puede deshacer.`}
                onConfirm={async () => {
                    if (parentToDeleteStudent) {
                        await deleteParentStudentById(parentToDeleteStudent.parent_id);
                        setParentToDeleteStudent(null);
                    }
                }}
                loadingDelete={parentStudentLoading}
            />

            {modalMode !== 'none' && (
                <ParentFormModal
                    mode={modalMode}
                    initialData={parentToEdit}
                    onClose={() => setModalMode('none')}
                    onSuccess={() => {
                        setModalMode('none');
                        refetch();
                    }}
                />
            )}

            {modalModeParentToStudent !== 'none' && parentToStudent && (
                <ParentToStudentFormModal
                    parent={parentToStudent}
                    onClose={() => setModalModeParentToStudent('none')}
                    onSuccess={async () => {
                        setModalModeParentToStudent('none');
                        await refetch();
                    }}
                />
            )}
        </div>
    );
}