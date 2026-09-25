import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { StudentsTable } from "./StudentsTable.tsx";
import ButtonChevronBack from "../../../../../components/ui/buttons/ButtonChevrowBack.tsx";
import { PrimaryButton } from "../../../../../components/ui/buttons/Buttons.tsx";
import { ConfirmModal } from "../../../../../components/ui/modals/ConfirmModal.tsx";
import { StudentFormModal } from "../ui/StudentFormModal.tsx";
import { LoadingContent } from "../../../../../components/ui/Loadings.tsx";
import { useStudentsData } from "../../hooks/students/useStudentsData.ts";
import { useStudentDelete } from "../../hooks/students/useStudentDelete.ts";
import { type ModalModeTypes, reverseName } from "../../../../../types";
import type { StudentProps } from "../../types";

export function StudentsLayout() {
    const navigate = useNavigate();

    const { students, loading, reloadStudents } = useStudentsData();
    const { deleteStudentById, loadingDelete } = useStudentDelete(reloadStudents);

    const [searchTerm, setSearchTerm] = useState("");
    const [modalMode, setModalMode] = useState<ModalModeTypes>('none');
    const [studentToEdit, setStudentToEdit] = useState<StudentProps | null>(null);
    const [studentToDelete, setStudentToDelete] = useState<StudentProps | null>(null);

    const filteredStudents = students.filter((student: any) =>
        student.student_first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.student_first_last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.enrollment_code && student.enrollment_code.toLowerCase().includes(searchTerm.toLowerCase()))
    );


    if (loading) return <LoadingContent title="Cargando estudiantes..." />;

    return (
        <div className="flex flex-col md:gap-5">
            <div className="bg-white md:rounded-xl md:border md:border-gray-100 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="flex gap-2">
                    <ButtonChevronBack onClick={() => navigate(-1)} />
                    <h2 className="text-xl md:text-1xl xl:text-2xl font-bold text-custom-black">Estudiantes</h2>
                </div>
                <div className="flex grow w-full gap-2 justify-end items-center">
                    <div className="w-full sm:max-w-2xs">
                        <input
                            type="text"
                            placeholder="Buscar estudiante"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 xl:py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 transition-shadow"
                        />
                    </div>
                    <PrimaryButton
                        onClick={() => {
                            setStudentToEdit(null);
                            setModalMode('create');
                        }}
                        title="+ Nuevo estudiante"
                    />
                </div>
            </div>

            <StudentsTable
                students={filteredStudents}
            />

            <ConfirmModal
                isOpen={studentToDelete !== null}
                onClose={() => setStudentToDelete(null)}
                title="¿Estás seguro?"
                message={`¿Quieres eliminar al estudiante ${
                    studentToDelete ?
                        reverseName({
                            middleName: studentToDelete.student_middle_name,
                            secondLastName: studentToDelete.student_second_last_name,
                            firstName: studentToDelete.student_first_name,
                            firstLastName: studentToDelete.student_first_last_name
                        }) : "Unknow"
                }? Esta acción no se puede deshacer.`}
                onConfirm={async () => {
                    if (studentToDelete) {
                        await deleteStudentById(studentToDelete.student_id);
                        setStudentToDelete(null);
                    }
                }}
                loadingDelete={loadingDelete}
            />

            {modalMode !== 'none' && (
                <StudentFormModal
                    mode={modalMode}
                    initialData={studentToEdit}
                    onClose={() => setModalMode('none')}
                    onSuccess={async () => {
                        setModalMode('none');
                        await reloadStudents();
                    }}
                />
            )}
        </div>
    );
}