import api from "../../../../api/client.ts";
import toast from 'react-hot-toast';
import {memo, useCallback, useEffect, useState} from "react";
import {formateDate, getInitials} from "../../../../types";
import {DeleteButton, EditButton, PrimaryButton} from "../../../../components/Buttons.tsx";
import { useNavigate } from "react-router-dom";
import ButtonChevronBack from "../../../../components/ButtonChevrowBack.tsx";
import { LoadingContent } from "../../../../components/Loadings.tsx";
import DynamicModalForm, {type FormField} from "../../../../components/ModalForm.tsx";
import { ConfirmModal } from "../../../../components/ConfirmModal.tsx";

interface Teacher {
    id: string;
    user_id: string;
    created_at: string;
    full_name: string;
    email: string;
    total_classes: number;
}
interface TeacherRowProps {
    teacher: Teacher;
    onEdit: (teacher: Teacher) => void;
    onDelete: (teacher: Teacher) => void;
    onNavigate: (id: string) => void;
}

const formRegExp = [
    { label: "name", regExp: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\-']{2,50}$/ },
    { label: "email", regExp: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/ },
    { label: "password", regExp: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/ },
];

const TeacherRow = memo(function ({ teacher, onEdit, onDelete, onNavigate }: TeacherRowProps) {
    return (
        <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
            <td className="p-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 shrink-0 rounded-full bg-primary-shadow flex items-center justify-center text-primary-darker font-bold text-sm">
                        {getInitials(teacher.full_name)}
                    </div>
                    <button
                        onClick={() => onNavigate(`${teacher.id}`)}
                        className="overflow-hidden text-sm xl:text-base text-left cursor-pointer"
                    >
                        <p className="font-bold capitalize text-custom-black truncate" title={teacher.full_name}>
                            {teacher.full_name}
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

            <td className="p-4 text-gray-500 text-xs xl:text-sm font-medium">
                {formateDate(teacher.created_at)}
            </td>

            <td className="md:p-4 pr-3 text-right space-x-1 xl:space-x-3">
                <EditButton onClick={() => onEdit(teacher)} />
                <DeleteButton onClick={() => onDelete(teacher)} />
            </td>
        </tr>
    );
});

const ListTeacher = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'none'>('none');
    const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);

    const [formLoading, setFormLoading] = useState(false);
    const [loadingDeleteTeacher, setLoadingDeleteTeacher] = useState(false);
    const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
    const [formError, setFormError] = useState("");
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: ""
    });

    const navigate = useNavigate();

    const fetchTeachers = async () => {
        setLoading(true);
        try {
            const response = await api.get("/teacher");
            setTeachers(response.data.teachers || response.data);
        } catch (fetchError) {
            console.error(fetchError);
            setError("Error fetching teachers");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchTeachers();
    }, []);

    const openEditModal = (teacher: Teacher) => {
        setSelectedTeacherId(teacher.id);
        setFormData({
            fullName: teacher.full_name,
            email: "",
            password: ""
        });
        setModalMode('edit');
    };

    const handleDeleteTeacher = async (id: string) => {
        setLoadingDeleteTeacher(true);

        try {
            await api.delete(`/teacher/${id}`);
            await fetchTeachers();

            setTeacherToDelete(null);
            toast.success("Profesor eliminado correctamente");
        } catch (err: any) {
            const msg = err?.response?.data?.message || "Error al eliminar el profesor.";
            console.error(msg);
            toast.error(msg);
        } finally {
            setLoadingDeleteTeacher(false);
        }
    };

    const handleModalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError("");

        const nameRegex = formRegExp.find(r => r.label === "name")?.regExp;
        const emailRegex = formRegExp.find(r => r.label === "email")?.regExp;
        const passRegex = formRegExp.find(r => r.label === "password")?.regExp;

        if (nameRegex && !nameRegex.test(formData.fullName)) {
            setFormError("El nombre debe tener entre 2 y 50 caracteres y solo contener letras.");
            return;
        }

        if (modalMode === 'create') {
            if (emailRegex && !emailRegex.test(formData.email)) {
                setFormError("Por favor, ingresa un correo electrónico válido.");
                return;
            }
            if (passRegex && !passRegex.test(formData.password)) {
                setFormError("La contraseña debe tener mínimo 8 caracteres, e incluir al menos una letra, un número y un carácter especial.");
                return;
            }
        }

        setFormLoading(true);

        try {
            const payload = {
                ...formData,
                fullName: formData.fullName.trim().toLowerCase()
            }

            if (modalMode === 'create') {
                await api.post("/teacher", payload);
            } else if (modalMode === 'edit') {
                await api.put(`/teacher/${selectedTeacherId}`, { fullName: payload.fullName });
            }

            setModalMode('none');
            setFormData({ fullName: "", email: "", password: "" });
            setSelectedTeacherId(null);
            await fetchTeachers();

            toast.success(`Profesor ${modalMode === 'create' ? 'creado' : 'editado'} correctamente`)
        } catch (err: any) {
            const msg = err.response?.data?.message || "Error al guardar el profesor."
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
    const teacherFields: FormField[] = [
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
        }
    ].filter(field => modalMode === 'create' || field.name === 'fullName');

    const filteredTeachers = teachers.filter(teacher =>
        teacher.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEdit = useCallback((teacher: Teacher) => {
        openEditModal(teacher);
    }, []);

    const handleDelete = useCallback((teacher: Teacher) => {
        setTeacherToDelete(teacher);
    }, []);

    const handleNavigate = useCallback((id: string) => {
        navigate(`${id}`);
    }, [navigate]);

    if (loading) return <LoadingContent title="Cargando profesores..." />;
    if (error) return <p className="text-red-500 font-semibold p-6 bg-red-50 rounded-xl">{error}</p>;

    return (
        <div className="flex flex-col gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex gap-2 items-center">
                        <ButtonChevronBack onClick={() => navigate(-1)} />
                        <h2 className="text-xl md:text-1xl xl:text-2xl font-bold text-custom-black">Profesores</h2>
                    </div>
                    <p className="text-gray-500 text-sm mt-1">
                        {teachers.length} profesores registrados en el sistema.
                    </p>
                </div>
                <PrimaryButton
                    onClick={() => {
                        setFormData({ fullName: "", email: "", password: "" });
                        setModalMode('create');
                    }}
                    title="Nuevo Profesor"
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <input
                    type="text"
                    placeholder="Buscar por nombre o correo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow"
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-600">
                        <th className="p-4 text-sm font-semibold">Profesor</th>
                        <th className="p-4 text-sm font-semibold">Clases Asignadas</th>
                        <th className="p-4 text-sm font-semibold">Fecha de Contratación</th>
                        <th className="p-4 text-sm font-semibold text-right">Acciones</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {filteredTeachers.map((teacher) => (
                        <TeacherRow
                            key={teacher.id}
                            teacher={teacher}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onNavigate={handleNavigate}
                        />
                    ))}
                    </tbody>
                </table>
            </div>

            <ConfirmModal
                isOpen={teacherToDelete !== null}
                onClose={() => setTeacherToDelete(null)}
                title="¿Estás seguro?"
                message={`¿Que quieres eliminar al profesor ${teacherToDelete?.full_name}?`}
                onConfirm={async () => {
                    if (teacherToDelete) {
                        await handleDeleteTeacher(teacherToDelete.id);
                    }
                }}
                loadingDelete={loadingDeleteTeacher}
            />

            <DynamicModalForm
                isOpen={modalMode !== 'none'}
                title={modalMode === 'create' ? "Crear Nuevo Profesor" : "Editar Profesor"}
                fields={teacherFields}
                formData={formData}
                formError={formError}
                formLoading={formLoading}
                onChange={handleFormChange}
                onSubmit={handleModalSubmit}
                onClose={() => {
                    setModalMode('none');
                    setFormError("");
                    setFormData({ fullName: "", password: "",email:"" });
                    setSelectedTeacherId(null);
                }}
            />
        </div>
    );
}

export default ListTeacher;