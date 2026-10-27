import {useNavigate, useParams} from "react-router-dom";
import { useCourseData } from "../../../shared/hooks/useCourseData.ts";
import { formatterDate } from "../../../../types";
import { PrimaryLink } from "../../../../components/ui/link/PrimaryLink.tsx";
import { PrimaryButton } from "../../../../components/ui/buttons/Buttons.tsx";
import { ClassList } from "../../../shared/components/ClassList.tsx";
import { CourseDetailsStudentsTable } from "../../../shared/components/CourseDetailsStudentsTable.tsx";
import { useEffect, useRef, useState } from "react";
import { LoadingContent } from "../../../../components/ui/Loadings.tsx";
import ButtonChevronBack from "../../../../components/ui/buttons/ButtonChevrowBack.tsx";

export function TeacherCourseLayout() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [showClasses, setShowClasses] = useState<boolean>(false);
    const classesDropDown = useRef<HTMLDivElement>(null);

    const date = formatterDate.format(new Date());
    const { course, attendance, loading } = useCourseData(courseId, date);

    useEffect(() => {
        const handleClassesDropDown = (e: MouseEvent) => {
            const target = e.target as Element;
            if (target.closest('.action-menu-portal')) return;
            if (classesDropDown.current && !classesDropDown.current.contains(target)) {
                setShowClasses(false);
            }
        };
        document.addEventListener('mousedown', handleClassesDropDown);
        return () => document.removeEventListener('mousedown', handleClassesDropDown);
    }, []);

    if (loading) return <LoadingContent title="Cargando curso..."/>;
    if (!course) return <div className="p-6 text-gray-500 text-center">No se encontró el curso.</div>;

    return (
        <div className="flex flex-col h-full w-full">
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-2">
                    <ButtonChevronBack onClick={() => navigate(-1)} />
                    <h1 className="text-xl md:text-1xl xl:text-2xl font-bold text-custom-black">
                        Curso
                        <span className="text-primary-darker text-base md:text-lg xl:text-xl"> {course.course.course_name}</span>
                    </h1>
                </div>
                <div className="flex w-full md:w-auto gap-2 items-center">
                    <PrimaryLink goTo="acumulados" children="Acumulados" />
                    <PrimaryLink goTo="horario" children="Horario" />

                    <div className="w-full md:w-auto" ref={classesDropDown}>
                        <PrimaryButton
                            onClick={() => setShowClasses(!showClasses)}
                            title="Clases"
                        />
                        {showClasses && (
                            <ClassList
                                isDisabled={true}
                                classes={course.classes}
                            />
                        )}
                    </div>
                </div>
            </div>

            <CourseDetailsStudentsTable
                students={course.students}
                attendance={attendance}
            />
        </div>
    );
}