import ButtonChevronBack from "../../../../../components/ui/buttons/ButtonChevrowBack.tsx";
import { useStudentProfile } from "../../hooks/students/useStudentProfile.ts";
import { useNavigate, useParams } from "react-router-dom";
import { LoadingContent } from "../../../../../components/ui/Loadings.tsx";
import {StudentInformation} from "../ui/StudentInformation.tsx";

export function StudentProfileLayout() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const { data, loading } = useStudentProfile(id);

    if (loading) return <LoadingContent title="Cargando estudiante..."/>;
    if (!data) return <div className="p-5 rounded-xl text-center bg-red-shadow text-red-error font-medium">Estudiante no encontrado</div>;

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="flex items-center gap-4">
                    <ButtonChevronBack onClick={() => navigate(-1)} />
                    <div className="w-16 h-16 bg-primary-shadow text-primary rounded-full flex items-center justify-center text-xl md:text-1xl xl:text-2xl font-bold">
                        UN
                    </div>
                    <div>
                        <h1 className="text-xl md:text-1xl xl:text-2xl font-bold text-custom-black">{data.full_name}</h1>
                        <p className="text-gray-500">{data.email} | Código: {data.enrollment_code}</p>
                    </div>
                </div>
                <div className="mt-4 md:mt-0 text-right">
                    <span className="inline-block bg-primary-shadow text-primary px-3 py-1 rounded-full text-sm font-semibold border border-primary-shadow">
                        Curso: {data.course_name}
                    </span>
                </div>
            </div>

            <StudentInformation
                grades={data.recent_grades}
            />
        </div>
    )
}