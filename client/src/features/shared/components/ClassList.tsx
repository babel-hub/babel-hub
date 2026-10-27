import type { ClassItem } from "../../director/course-management/types";
import { CourseDetailsClassRows } from "../../director/course-management/components/ui/CourseDetailsClassRows.tsx";
import { memo } from "react";
import { HiMiniPlusSmall } from "react-icons/hi2";

interface ClassListProps {
    classes: ClassItem[];
    isDisabled?: boolean;
    createClass?: () => void;
    onEdit?: (cls: ClassItem) => void;
    onDelete?: (cls: ClassItem) => void;
}

export const ClassList = memo(function ClassList({
                                                     classes,
                                                     createClass,
                                                     isDisabled,
                                                     onEdit,
                                                     onDelete
                                                 }: ClassListProps) {
    return (
        <div className="absolute right-5 top-full w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-30 overflow-hidden">
            <div className="p-2 flex items-center justify-between bg-gray-50 border-b border-gray-100">
                <h3 className="font-bold text-sm text-gray-700">Clases Asignadas</h3>

                {createClass && (
                    <button
                        onClick={createClass}
                        className="flex font-base py-0.5 cursor-pointer px-2 items-center justify-center bg-primary hover:bg-primary-darker rounded-lg text-white"
                    >
                        <HiMiniPlusSmall className="size-6"/>
                    </button>
                )}
            </div>

            <ul className="divide-y w-full divide-gray-100 max-h-[300px] styled-scrollbar overflow-y-auto">
                {classes.map((cls) => (
                    <CourseDetailsClassRows
                        key={cls.class_id}
                        isDisabled={isDisabled}
                        cls={cls}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                ))}
                {classes.length === 0 && (
                    <p className="text-gray-500 text-center py-6 text-sm">No hay clases asignadas a este curso</p>
                )}
            </ul>
        </div>
    );
});