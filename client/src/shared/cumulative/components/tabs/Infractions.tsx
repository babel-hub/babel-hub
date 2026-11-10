import { useState } from "react";
import { NoResults } from "../../../../components/ui/blocks/NoResults.tsx";
import { useStudentInfractions } from "../../hooks/useStudentInfractions.ts";
import { reverseName } from "../../../../types";
import type { Tabs } from "../../../class-managment/types/types.ts";
import { useMonitoringData } from "../../../class-managment/hooks/coexistence/useMonitoringData.ts";
import { InfractionsMonitoringTabs } from "../../../coexisting/components/ui/InfractionsMonitoringTabs.tsx";
import type { Student } from "../../../../features/types/types.ts";

interface InfractionsProps {
    courseId: string;
    students: Student[];
}

export function Infractions({ students, courseId }: InfractionsProps) {
    const [selectedStudentId, setSelectedStudentId] = useState<string>("");
    const [tab, setTab] = useState<Tabs>("infractions");

    const {
        infractions,
        loading: loadingInfractions,
        error: errorInfractions,
    } = useStudentInfractions(courseId, selectedStudentId);

    const {
        monitoring,
        loading: loadingMonitoring,
        error: errorMonitoring,
    } = useMonitoringData(
        tab === "monitoring" ? courseId : "",
        tab === "monitoring" ? selectedStudentId : ""
    );

    const selectedStudent = students.find(s => s.student_id === selectedStudentId);

    return (
        <div className="w-full grid grid-cols-2">
            <div className="bg-white h-full max-h-[calc(100dvh-13.4rem)] overflow-y-auto styled-scrollbar border-r border-gray-100">
                {students.length > 0 ? (
                    <ul className="divide-y divide-gray-50">
                        {students.map((student) => (
                            <li
                                key={student.student_id}
                                onClick={() => setSelectedStudentId(student.student_id)}
                                className={`py-3 px-5 flex items-center gap-4 cursor-pointer transition-colors ${
                                    selectedStudentId === student.student_id
                                        ? "bg-primary-shadow"
                                        : "hover:bg-gray-50"
                                }`}
                            >
                                <div className={`w-10 h-10 rounded-full uppercase flex items-center justify-center text-sm font-bold shrink-0
                                    ${selectedStudentId === student.student_id
                                    ? "bg-primary-darker text-white"
                                    : "bg-primary-shadow text-primary-darker"}`}>
                                    {`${student.student_first_name.charAt(0)}${student.student_first_last_name.charAt(0)}`}
                                </div>
                                <div>
                                    <span className="block text-sm md:text-base capitalize font-medium text-custom-black">
                                        {reverseName({
                                            firstName: student.student_first_name,
                                            middleName: student.student_middle_name,
                                            firstLastName: student.student_first_last_name,
                                            secondLastName: student.student_second_last_name,
                                        })}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <NoResults title="No hay estudiantes en este curso" />
                )}
            </div>

            <div className="w-full bg-white h-full max-h-[calc(100dvh-13.4rem)] overflow-y-auto p-5 flex flex-col">
                <div className="w-full flex">
                    <div className="border border-gray-100 rounded-xl">
                        <button
                            type="button"
                            onClick={() => setTab("infractions")}
                            className={`py-2 px-5 font-medium rounded-l-xl  cursor-pointer text-sm transition-colors ${
                                tab === "infractions"
                                    ? selectedStudentId ? "bg-primary-darker text-white" : "bg-primary text-white"
                                    : "bg-primary-shadow text-primary"
                            }`}
                        >
                            Infracciones
                        </button>
                        <button
                            type="button"
                            onClick={() => setTab("monitoring")}
                            className={`py-2 px-5 font-medium cursor-pointer rounded-r-xl text-sm transition-colors ${
                                tab === "monitoring"
                                    ? selectedStudentId ? "bg-primary-darker text-white" : "bg-primary text-white"
                                    : "bg-primary-shadow text-primary"
                            }`}
                        >
                            Monitoreo
                        </button>
                    </div>
                </div>

                <InfractionsMonitoringTabs
                    selectedStudentId={selectedStudentId}
                    selectedStudent={selectedStudent}
                    tab={tab}
                    infractions={infractions}
                    monitoring={monitoring}
                    loadingInfractions={loadingInfractions}
                    loadingMonitoring={loadingMonitoring}
                    errorInfractions={errorInfractions}
                    errorMonitoring={errorMonitoring}
                />
            </div>
        </div>
    );
}