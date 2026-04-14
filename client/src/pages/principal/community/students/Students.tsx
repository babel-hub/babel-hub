import api from "../../../../api/client.ts";
import React, {memo, useCallback, useEffect, useState} from "react";
import {formateDate, getInitials, reverseName} from "../../../../types";
import {DeleteButton, EditButton, PrimaryButton} from "../../../../components/Buttons.tsx";
import { useNavigate } from "react-router-dom";
import ButtonChevronBack from "../../../../components/ButtonChevrowBack.tsx";
import { LoadingContent } from "../../../../components/Loadings.tsx";
import DynamicModalForm, {type FormField} from "../../../../components/ModalForm.tsx";
import { ConfirmModal } from "../../../../components/ConfirmModal.tsx";
import toast from "react-hot-toast";

interface StudentProps {
    student_id: string;
    enrollment_code: string;
    full_name: string;
    created_at: string;
    course_name: string;
    course_id?: string;
    email: string;
}

interface StudentRowProps {
    student: StudentProps;
    onEdit: (student: StudentProps) => void;
    onDelete: (id: string) => void;
    onNavigate: (id: string) => void;
}

const formRegExp = [
    { label: "name", regExp: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\-']{2,50}$/ },
    { label: "email", regExp: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/ },
    { label: "password", regExp: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{7,}$/ },
];

const StudentsRows = memo(function ({ student, onEdit, onDelete, onNavigate }: StudentRowProps){
    return (
        <tr key={student.student_id} className="hover:bg-gray-50 transition-colors">
            <td className="p-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 shrink-0 rounded-full bg-primary-shadow flex items-center justify-center text-primary font-bold text-sm">
                        {getInitials(student.full_name)}
                    </div>
                    <button
                        onClick={() => onNavigate(`${student.student_id}`)}
                        className="overflow-hidden text-sm xl:text-base text-left cursor-pointer"
                    >
                        <p className="font-bold capitalize text-custom-black truncate" title={student.full_name}>
                            {reverseName(student.full_name)}
                        </p>
                        <p className="text-gray-500 text-xs truncate" title={student.email}>
                            {student.email}
                        </p>
                    </button>
                </div>
            </td>

            <td className="p-4">
                {student.enrollment_code ? (
                    <span className="bg-green-100 text-green-700 font-semibold px-2 py-1 rounded text-xs">
                        {student.enrollment_code}
                    </span>
                ) : (
                    <span className="bg-yellow-100 text-yellow-700 font-semibold px-2 py-1 rounded text-xs">
                        Pendiente
                    </span>
                )}
            </td>

            <td className="p-4 font-medium text-sm xl:text-base text-gray-700">
                {student.course_name}
            </td>

            <td className="p-4 text-gray-500 text-xs xl:text-sm">
                {formateDate(student.created_at)}
            </td>

            <td className="md:p-4 pr-3 text-right space-x-1 xl:space-x-3">
                <EditButton onClick={() => onEdit(student)} />
                <DeleteButton onClick={() => onDelete(student.student_id)} />
            </td>
        </tr>
    );
});

const ListStudents = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [students, setStudents] = useState<StudentProps[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [availableCourses, setAvailableCourses] = useState<any[]>([]);

    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'none'>('none');
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
    const [studentToDelete, setStudentToDelete] = useState<StudentProps | null>(null);

    const [loadingDeleteStudent, setLoadingDeleteStudent] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState("");
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        enrolmentCode: "",
        courseId: ""
    });

    const navigate = useNavigate();

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const response = await api.get("/student");
            setStudents(response.data);
        } catch (fetchError) {
            console.error(fetchError);
            setError("Error fetching community");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchStudents();
    }, []);

    useEffect(() => {
        const fetchCoursesForDropdown = async () => {
            try {
                const response = await api.get('/courses');
                setAvailableCourses(response.data.courses || response.data);
            } catch (error) {
                console.error("Error fetching courses for dropdown:", error);
            }
        };

        if (modalMode !== 'none' && availableCourses.length === 0) {
            fetchCoursesForDropdown();
        }
    }, [modalMode]);

    const openEditModal = (student: StudentProps) => {
        setSelectedStudentId(student.student_id);

        setFormData({
            fullName: student.full_name,
            enrolmentCode: student.enrollment_code || "",
            courseId: student.course_id || "",
            email: "",
            password: ""
        });

        setModalMode('edit');
    };

    const handleDeleteStudent = async (id: string) => {
        setLoadingDeleteStudent(true);

        try {
            await api.delete(`/student/${id}`);
            await fetchStudents();

            setStudentToDelete(null);
            toast.success("Estudiante eliminado correctamente");
        } catch (err: any) {
            const msg = err.response?.data?.message || "Error al eliminar el estudiante."
            console.error(msg)
            toast.error(msg);
        } finally {
            setLoadingDeleteStudent(false);
        }
    };

    const handleModalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError("");

        const nameRegExp = formRegExp.find(r => r.label === "name")?.regExp;
        const emailRegExp = formRegExp.find(r => r.label === "email")?.regExp;
        const passwordRegExp = formRegExp.find(r => r.label === "password")?.regExp;

        if (nameRegExp && !nameRegExp.test(formData.fullName)) {
            setFormError("El nombre debe tener entre 2 y 50 caracteres y solo contener letras.");
            return;
        }

        if (modalMode === 'create') {
            if (emailRegExp && !emailRegExp.test(formData.email)) {
                setFormError("Por favor, ingresa un correo electrónico válido.");
                return;
            }
            if (passwordRegExp && !passwordRegExp.test(formData.password)) {
                setFormError("La contraseña debe tener mínimo 8 caracteres, e incluir al menos una letra, un número y un carácter especial.");
                return;
            }
        }

        setFormLoading(true);

        try {
            const payload = {
                ...formData,
                fullName: formData.fullName.trim().toLowerCase(),
                enrolmentCode: formData.enrolmentCode.trim().toUpperCase()
            };

            if (modalMode === 'create') {
                await api.post("/student", payload);
            } else if (modalMode === 'edit') {
                await api.put(`/student/${selectedStudentId}`, {
                    fullName: payload.fullName,
                    enrolmentCode: payload.enrolmentCode,
                    courseId: payload.courseId
                });
            }


            setModalMode('none');
            setFormData({ fullName: "", courseId: "", email: "", password: "", enrolmentCode: "" });
            setSelectedStudentId(null);
            await fetchStudents();

            toast.success(`Estudiante ${modalMode === 'create' ? 'creado' : 'editado'} correctamente`)
        } catch (err: any) {
            const msg = err.response?.data?.message || "Error al guardar el estudiante."
            console.error(msg);
            setFormError(msg);
        } finally {
            setFormLoading(false);
        }
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    //@ts-ignore
    const studentFields: FormField[] = [
        {
            name: "enrolmentCode",
            label: "Codigo del estudiante",
            type: "text",
            placeholder: "STU-101",
            required: true
        },
        {
            name: "fullName",
            label: "Nombre",
            type: "text",
            placeholder: "Cristian Garcia",
            required: true
        },
        {
            name: "email",
            label: "Correo electronico",
            type: "email",
            placeholder: "example@gmail.com",
            required: true
        },
        {
            name: "password",
            label: "Contraseña",
            type: "password",
            required: true
        },
        {
            name: "courseId",
            label: "Curso",
            type: "select",
            required: true,
            options: availableCourses.map(t => ({ value: t.id, label: t.course_name }))
        }
    ].filter(field => modalMode === 'create' || (field.name !== 'email' && field.name !== 'password'));

    const filteredStudents = students.filter(student =>
        student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.enrollment_code && student.enrollment_code.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleEdit = useCallback((student: StudentProps) => {
        openEditModal(student);
    }, []);

    const handleDelete = useCallback((id: string) => {
        handleDeleteStudent(id);
    }, []);

    const handleNavigate = useCallback((id: string) => {
        navigate(`${id}`);
    }, [navigate]);

    if (loading) return <LoadingContent title="Cargando estudiantes..."/>;
    if (error) return <p className="text-red-500 font-semibold p-6">{error || "Error al cargar datos"}</p>;

    return (
        <div className="flex flex-col gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex gap-2">
                        <ButtonChevronBack onClick={() => navigate(-1)}/>
                        <h2 className="text-xl md:text-1xl xl:text-2xl font-bold text-custom-black">Estudiantes</h2>
                    </div>
                    <p className="text-gray-500 text-sm mt-1">
                        {students.length} estudiantes registrados en el sistema.
                    </p>
                </div>
                <PrimaryButton
                    onClick={() => {
                        setFormData({ fullName: "", courseId: "", email: "", password: "", enrolmentCode: "" });
                        setModalMode('create');
                    }}
                    title="Nuevo Estudiante"
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <input
                    type="text"
                    placeholder="Buscar por nombre, correo o código..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 transition-shadow"
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-600">
                        <th className="p-4 text-sm font-semibold">Estudiante</th>
                        <th className="p-4 text-sm font-semibold">Código</th>
                        <th className="p-4 text-sm font-semibold">Curso</th>
                        <th className="p-4 text-sm font-semibold">Fecha de Registro</th>
                        <th className="p-4 text-sm font-semibold text-right">Acciones</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {filteredStudents.map((student) => (
                        <StudentsRows
                            key={student.student_id}
                            student={student}
                            onDelete={handleDelete}
                            onNavigate={handleNavigate}
                            onEdit={handleEdit}
                        />
                    ))}
                    </tbody>
                </table>
            </div>

            <ConfirmModal
                isOpen={studentToDelete !== null}
                onClose={() => setStudentToDelete(null)}
                title="¿Estas seguro?"
                message={`Que quieres eliminar el estudiante ${studentToDelete?.full_name}`}
                onConfirm={async () => {
                    if (studentToDelete) {
                        await handleDeleteStudent(studentToDelete.student_id);
                    }
                }}
                loadingDelete={loadingDeleteStudent}
            />

            <DynamicModalForm
                isOpen={modalMode !== 'none'}
                title={modalMode === 'create' ? "Crear Nuevo Estudiante" : "Editar Estudiante"}
                fields={studentFields}
                formData={formData}
                formError={formError}
                formLoading={formLoading}
                onChange={handleFormChange}
                onSubmit={handleModalSubmit}
                onClose={() => {
                    setModalMode('none');
                    setFormError("");
                    setFormData({ fullName: "", courseId: "", enrolmentCode: "", password: "",email:"" });
                    setSelectedStudentId(null);
                }}
            />
        </div>
    );
}

export default ListStudents