import ButtonChevronBack from "../../../../../components/ui/buttons/ButtonChevrowBack.tsx";
import { PrimaryButton } from "../../../../../components/ui/buttons/Buttons.tsx";
import { useNavigate } from "react-router-dom";
import { useCallback, useState } from "react";
import { LoadingContent } from "../../../../../components/ui/Loadings.tsx";
import type { Teacher } from "../../types";
import { useDeleteTeacher } from "../../hooks/teachers/useDeleteTeacher.ts";
import { TeacherTable } from "./TeacherTable.tsx";
import { ConfirmModal } from "../../../../../components/ui/modals/ConfirmModal.tsx";
import { TeacherFormModal } from "../ui/TeacherFormModal.tsx";
import {type ModalModeTypes, reverseName} from "../../../../../types";
import {useTeachers} from "../../../../../shared/global/hooks/useTeachers.ts";

export function TeacherLayout() {
    const [modalMode, setModalMode] = useState<ModalModeTypes>('none');
    const [teacherToEdit, setTeacherToEdit] = useState<Teacher | null>(null);
    const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const navigate = useNavigate();

    const { loading, teachers, reload } = useTeachers();
    const { deleteTeacherById, loading: loadingDelete } = useDeleteTeacher(reload);

    const filteredTeachers = teachers.filter((teacher: Teacher) =>
        teacher.teacher_first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.teacher_first_last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEdit = useCallback((teacher: Teacher) => {
        setTeacherToEdit(teacher);
        setModalMode('edit');
    }, []);

    const handleDelete = useCallback((teacher: Teacher) => {
        setTeacherToDelete(teacher);
    }, []);

    const handleNavigate = useCallback((id: string) => {
        navigate(`${id}`);
    }, [navigate]);

    if (loading) return <LoadingContent title="Cargando profesores..." />;

    return (
        <div className="flex flex-col md:gap-5">
            <div className="bg-white md:rounded-xl md:border md:border-gray-200 p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex gap-2 items-center">
                        <ButtonChevronBack onClick={() => navigate(-1)} />
                        <h2 className="text-xl md:text-1xl xl:text-2xl font-bold text-custom-black">Profesores</h2>
                    </div>
                </div>
                <div className="flex grow w-full gap-2 justify-end items-center">
                    <div className="w-full sm:max-w-2xs">
                        <input
                            type="text"
                            placeholder="Buscar profesor"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 xl:py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 transition-shadow"
                        />
                    </div>
                    <PrimaryButton
                        onClick={() => {
                            setTeacherToEdit(null);
                            setModalMode('create');
                        }}
                        title="+ Nuevo profesor"
                    />
                </div>
            </div>

            <TeacherTable
                teachers={filteredTeachers}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onNavigate={handleNavigate}
            />

            <ConfirmModal
                isOpen={teacherToDelete !== null}
                onClose={() => setTeacherToDelete(null)}
                title="¿Estás seguro?"
                message={`¿Quieres eliminar al profesor ${
                    teacherToDelete
                        ? reverseName({
                            firstLastName: teacherToDelete.teacher_first_last_name,
                            firstName: teacherToDelete.teacher_first_name,
                            middleName: teacherToDelete.teacher_middle_name,
                            secondLastName: teacherToDelete.teacher_second_last_name
                        })
                        : "Unknow"
                }? Esta acción no se puede deshacer.`}
                onConfirm={async () => {
                    if (teacherToDelete) {
                        await deleteTeacherById(teacherToDelete.id);
                        setTeacherToDelete(null);
                    }
                }}
                loadingDelete={loadingDelete}
            />

            {modalMode !== "none" && (
                <TeacherFormModal
                    mode={modalMode}
                    onClose={() => setModalMode('none')}
                    onSuccess={async () => {
                        setModalMode('none');
                        await reload();
                    }}
                    initialData={teacherToEdit}
                />
            )}
        </div>
    )
}