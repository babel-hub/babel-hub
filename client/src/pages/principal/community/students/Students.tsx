import api from "../../../../api/client.ts";
import React, { useEffect, useState } from "react";
import { formateDate } from "../../../../types";
import { PrimaryButton } from "../../../../components/Buttons.tsx";
import { useNavigate } from "react-router-dom";
import ButtonChevronBack from "../../../../components/ButtonChevrowBack.tsx";
import { LoadingContent } from "../../../../components/Loadings.tsx";
import DynamicModalForm, {type FormField} from "../../../../components/ModalForm.tsx";

interface StudentProps {
    student_id: string;
    enrollment_code: string;
    full_name: string;
    created_at: string;
    course_name: string;
    email: string;
}

const formRegExp = [
    { label: "name", regExp: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\-']{2,50}$/ },
    { label: "email", regExp: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/ },
    { label: "password", regExp: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{7,}$/ },
];

const ListStudents = () => {
    // const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [students, setStudents] = useState<StudentProps[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [availableCourses, setAvailableCourses] = useState<any[]>([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
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
    ];

    const fetchStudents = async () => {
        setLoading(true);

        try {
            const response = await api.get("/student");
            setStudents(response.data);
        } catch (fetchError) {
            console.log(fetchError);
            setError("Error fetching community");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const fetchCoursesForDropdown = async () => {
            try {
                const response = await api.get('/courses');
                setAvailableCourses(response.data.courses || response.data);
            } catch (error) {
                console.error("Error fetching courses for dropdown:", error);
            }
        };

        if (isModalOpen && availableCourses.length === 0) {
            fetchCoursesForDropdown();
        }
    }, [isModalOpen]);


    useEffect(() => {
        fetchStudents();
    }, []);

    const handleCreateStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError("");

        const nameRegExp = formRegExp.find(r => r.label === "name")?.regExp;
        const emailRegExp = formRegExp.find(r => r.label === "email")?.regExp;
        const passwordRegExp = formRegExp.find(r => r.label === "password")?.regExp;

        if (nameRegExp && !nameRegExp.test(formData.fullName)) {
            setFormError("El nombre debe tener entre 2 y 50 caracteres y solo contener letras.");
            return;
        }

        if (emailRegExp && !emailRegExp.test(formData.email)) {
            setFormError("Por favor, ingresa un correo electrónico válido.");
            return;
        }

        if (passwordRegExp && !passwordRegExp.test(formData.password)) {
            setFormError("La contraseña debe tener mínimo 8 caracteres, e incluir al menos una letra, un número y un carácter especial (@$!%*#?&).");
            return;
        }

        setFormLoading(true);

        try {
            await api.post("/student", formData);
            setIsModalOpen(false);
            setFormData({ fullName: "", courseId: "", email: "", password: "", enrolmentCode: "" });
            await fetchStudents();

        } catch (err: any) {
            setFormError(err.response?.data?.message || "Error al crear el estudiante.");
        } finally {
            setFormLoading(false);
        }
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const getInitials = (name: string) => {
        const names = name.split(" ");
        if (names.length >= 2) return (names[0][0] + names[1][0]).toUpperCase();
        return name[0].toUpperCase();
    };

    const filteredStudents = students.filter(student =>
        student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.enrollment_code && student.enrollment_code.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if(loading) return <LoadingContent title="Cargando estudiantes..."/>;
    if (error) return <p className="text-red-500 font-semibold p-6">{error || "Clase no encontrada"}</p>;

    return (
        <div className="flex flex-col gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex gap-2">
                        <ButtonChevronBack onClick={() => navigate(-1)}/>
                        <h2 className="text-2xl font-bold text-custom-black">Estudiantes</h2>
                    </div>
                    <p className="text-gray-500 text-sm mt-1">
                        {students.length} estudiantes registrados en el sistema.
                    </p>
                </div>
                <PrimaryButton onClick={() => setIsModalOpen(true)} title="+ Nuevo Estudiante"/>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredStudents.map((student) => (
                    <div
                        key={student.student_id}
                        className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col h-full"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 shrink-0 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
                                {getInitials(student.full_name)}
                            </div>
                            <div className="overflow-hidden">
                                <h3 className="font-bold text-custom-black text-lg truncate" title={student.full_name}>
                                    {student.full_name}
                                </h3>
                                <p className="text-gray-500 text-sm truncate" title={student.email}>
                                    {student.email}
                                </p>
                            </div>
                        </div>

                        <div className="mb-4 flex flex-col gap-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 font-medium">Código:</span>
                                {student.enrollment_code ? (
                                    <span className="bg-green-100 text-green-700 font-bold px-2 py-1 rounded text-xs">
                                        {student.enrollment_code}
                                    </span>
                                ) : (
                                    <span className="bg-yellow-100 text-yellow-700 font-bold px-2 py-1 rounded text-xs">
                                        Pendiente
                                    </span>
                                )}
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 font-medium">Curso:</span>
                                <span className="text-gray-700 font-medium">{student.course_name}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 font-medium">Registro:</span>
                                <span className="text-gray-700 font-medium">{formateDate(student.created_at)}</span>
                            </div>
                        </div>

                        <div className="mt-auto pt-4 border-t border-gray-100 flex justify-end gap-3">
                            <button
                                disabled={true}
                                className="text-sm font-semibold text-gray-500 hover:text-custom-black transition-colors px-2 py-1 cursor-pointer"
                            >
                                Editar
                            </button>
                            <button
                                onClick={() => navigate(`${student.student_id}`)}
                                className="text-sm font-semibold text-primary-600 hover:text-primary-800 transition-colors px-2 py-1 cursor-pointer"
                            >
                                Ver Perfil
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredStudents.length === 0 && (
                <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
                    <p className="text-gray-500 font-medium text-lg">No se encontraron estudiantes.</p>
                    <p className="text-sm mt-1 text-gray-400">Intenta buscar con otros términos.</p>
                </div>
            )}

            <DynamicModalForm
                isOpen={isModalOpen}
                title="Crear Nuevo Estudiante"
                fields={studentFields}
                formData={formData}
                formError={formError}
                formLoading={formLoading}
                onChange={handleFormChange}
                onSubmit={handleCreateStudent}
                onClose={() => {
                    setIsModalOpen(false);
                    setFormError("");
                    setFormData({ fullName: "", courseId: "", enrolmentCode: "", password: "",email:"" });
                }}
            />
        </div>
    );
}

export default ListStudents