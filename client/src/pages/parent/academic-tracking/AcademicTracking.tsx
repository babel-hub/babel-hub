import { useEffect, useState } from "react";
import { AcademicTrackingLayout, Attendance, Grades, Observations } from "../../../features/parent/academic-tracking/components";
import type { CumulativeGPATypes } from "../../../features/parent/shared/types/types.ts";
import { useStudentData } from "../../../features/parent/shared/hooks/useStudentData.ts";
import { LoadingContent } from "../../../components/ui/Loadings.tsx";
import { NoResults } from "../../../components/ui/blocks/NoResults.tsx";
import { formatterDate } from "../../../types";
import { usePeriods } from "../../../shared/hooks/usePeriods.ts";

export default function AcademicTracking() {
    const [tab, setTab] = useState<CumulativeGPATypes>('attendance');
    const { periods } = usePeriods();
    const { loading, students } = useStudentData();
    const initialDate = formatterDate.format(new Date());
    const [tabDate, setTabDate] = useState<string>(initialDate);

    const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");
    const [selectedStudentId, setSelectedStudentId] = useState<string>("");

    useEffect(() => {
        if (periods && periods.length > 0 && !selectedPeriodId) {
            const activePeriod = periods.find((p) => p.is_current);
            setSelectedPeriodId(activePeriod ? activePeriod.id : periods[0].id);
        }
    }, [periods, selectedPeriodId]);

    useEffect(() => {
        if (students && students.length > 0 && !selectedStudentId) {
            setSelectedStudentId(students[0].student_id);
        }
    }, [students, selectedStudentId]);

    if (loading) return <LoadingContent title="" />;
    if (students.length === 0) return <NoResults title='Estudiantes no asignados a este acudiante' />;

    const activeStudent = students.find(s => s.student_id === selectedStudentId);

    if (!selectedStudentId || !activeStudent) return null;

    return (
        <AcademicTrackingLayout
            students={students}
            activeStudent={activeStudent}
            onStudentChange={setSelectedStudentId}

            activeTab={tab}
            onButtonTabChange={setTab}
            date={tabDate}
            onButtonDateChange={setTabDate}
        >
            {tab === 'grades' && (<Grades studentId={selectedStudentId} date={tabDate} periodId={selectedPeriodId} />)}
            {tab === 'attendance' && (<Attendance studentId={selectedStudentId} date={tabDate} />)}
            {tab === 'observations' && (<Observations />)}
        </AcademicTrackingLayout>
    )
}