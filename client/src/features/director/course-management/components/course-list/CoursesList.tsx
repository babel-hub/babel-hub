import type { CoursesListData } from "../../types";
import { InteractiveHomeList } from "../../../../../components/ui/lists/InteractiveHomeList.tsx";
import { reverseName } from "../../../../../types";
import { memo } from "react";
import { HiOutlinePencil, HiTrash } from "react-icons/hi";

interface CoursesListProps {
    courses: CoursesListData[];
    activeCourseId: string | undefined;
    onEditCourse: (course: CoursesListData) => void;
    onDeleteCourse: (course: CoursesListData) => void;
    loadingDelete: boolean;
}

export const CoursesList = memo(function CoursesList({
                                                         courses,
                                                         activeCourseId,
                                                         onEditCourse,
                                                         onDeleteCourse,
                                                         loadingDelete,
                                                     }: CoursesListProps) {
    return (
        <div className="p-3 space-y-2 flex-1 overflow-y-auto styled-scrollbar overflow-x-hidden">
            {courses.map((course) => (
                <InteractiveHomeList
                    key={course.id}
                    goTo={course.id}
                    isActive={activeCourseId === course.id}
                    avatarText={course.course_name ? course.course_name.replace("-", "") : "UNK"}
                    title={<span>Curso <span className="uppercase">{course.course_name}</span></span>}
                    subtitle={`${reverseName({
                        middleName: course.director_middle_name,
                        secondLastName: course.director_second_last_name,
                        firstName: course.director_first_name,
                        firstLastName: course.director_first_last_name
                    }) || "Sin director"} • ${course.student_count || 0} Est.`}
                    menuOptions={[
                        {
                            label: "Editar",
                            icon: <HiOutlinePencil className="size-4" />,
                            onClick: () => onEditCourse(course)
                        },
                        { isSeparator: true, label: "separator" },
                        {
                            label: loadingDelete ? "Cargando..." : "Eliminar",
                            icon: <HiTrash className="size-4" />,
                            onClick: () => onDeleteCourse(course),
                            disabled: loadingDelete,
                            isDanger: true
                        },
                    ]}
                />
            ))}
        </div>
    );
});