import { LoadingContent } from "../../../../../components/ui/Loadings.tsx";
import type { ClassDetailsData } from "../../types";
import { StudentAttendanceRow } from "../ui/StudentAttendaceRow.tsx";
import { useTakeAttendance } from "../../hooks/useTakeAttendance.ts";
import { NoResults } from "../../../../../components/ui/blocks/NoResults.tsx";
import { LuCircleCheck } from "react-icons/lu";
import { IoMdCheckmark } from "react-icons/io";


interface RegisterAttendanceProps {
    classData: ClassDetailsData
    date: string;
}

export function RegisterAttendance ({ classData, date }: RegisterAttendanceProps) {
    const {
        saving,
        records,
        loading,
        saveRecords,
        updateRecords
    } = useTakeAttendance({
        classId: classData.details.id,
        date,
        students: classData.students,
    });


    return (
        <div className="max-w-4xl mx-auto space-y-2">
            {loading ? (
                <LoadingContent title="Cargando..." />
            ) : (
                <div className="relative">
                    <div className="flex bg-white items-center border-b-2 border-gray-100 p-3 md:p-4 justify-end sm:justify-between">
                        <div className="sm:block hidden">
                            <p className="text-custom-black text-sm md:text-base font-semibold">Lista de estudiantes</p>
                            <p className="text-xs text-custom-black">{classData.students.length} estudiantes</p>
                        </div>
                        <div className="flex items-center gap-2 md:gap-4">
                            <div className="flex items-center gap-1"><span className="w-2 h-2 block rounded-full bg-green-500" /><p className="text-custom-black text-xs">Presente</p></div>
                            <div className="flex items-center gap-1"><span className="w-2 h-2 block rounded-full bg-red-500" /><p className="text-custom-black text-xs">Ausente</p></div>
                            <div className="flex items-center gap-1"><span className="w-2 h-2 block rounded-full bg-yellow-500" /><p className="text-custom-black text-xs">Tarde</p></div>
                            <div className="flex items-center gap-1"><span className="w-2 h-2 block rounded-full bg-blue-500" /><p className="text-custom-black text-xs">Justificado</p></div>
                        </div>
                    </div>

                    {classData.students.length === 0 ? (
                        <NoResults title="No hay estudiantes en este curso" />
                    ) : (
                        <ul className="divide-y divide-gray-50 border-b-2 border-gray-100 overflow-y-auto">
                            {classData.students.map((student) => {
                                const status = records[student.student_id] || 'present';
                                return (
                                    <StudentAttendanceRow
                                        key={student.student_id}
                                        student={student}
                                        status={status}
                                        onUpdateStatus={updateRecords}
                                    />
                                )
                            })}
                        </ul>
                    )}

                    <div className="bg-primary-shadow sticky bottom-0 p-2 mt-5 sm:p-3 md:p-4 rounded-xl border border-gray-100 flex items-center justify-between z-10">
                        <div className="flex items-center sm:gap-3">
                            <div className="bg-primary rounded-full p-2 text-white text-xl font-bold"><LuCircleCheck /></div>
                            <div className="sm:flex hidden flex-col">
                                <p className="text-custom-black mb-0 text-xs md:text-sm font-semibold">Lista lista para guardar</p>
                                <span className="text-primary text-xs">{classData.students.length} de {classData.students.length} para guardar</span>
                            </div>
                        </div>

                        <button type="button" className="bg-primary transition-colors hover:bg-primary-darker rounded-xl cursor-pointer flex items-center gap-1 px-3 md:px-5 py-2.5 text-white text-xs md:text-sm" onClick={saveRecords}>
                            <IoMdCheckmark />
                            <span className="font-semibold">{saving ? 'Guardando' : 'Registrar asistencia'}</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}