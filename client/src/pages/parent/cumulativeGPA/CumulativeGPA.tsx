import { useState, useEffect } from "react";
import { CumulativeGPALayout, Grades, Attendance, Observations } from "../../../features/parent/cumulativeGPA/components";
import { LoadingContent } from "../../../components/ui/Loadings.tsx";
import { NoResults } from "../../../components/ui/blocks/NoResults.tsx";
import { usePeriods } from "../../../shared/hooks/usePeriods.ts";
import { useStudentData } from "../../../features/parent/shared/hooks/useStudentData.ts";
import type { CumulativeGPATypes } from "../../../features/parent/shared/types/types.ts";

export default function CumulativeGPA() {
    const [tab, setTab] = useState<CumulativeGPATypes>('grades');
    const { periods } = usePeriods();
    const { loading, students } = useStudentData();

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
    if (periods.length === 0) return <NoResults title="No se encontraron periodos" />;

    const selectedPeriod = periods.find(p => p.id === selectedPeriodId);
    const activeStudent = students.find(s => s.student_id === selectedStudentId);
    if (!selectedPeriod || !selectedPeriodId || !selectedStudentId || !activeStudent) return null;

    return (
        <CumulativeGPALayout
            students={students}
            activeStudent={activeStudent}
            onStudentChange={setSelectedStudentId}
            activeTab={tab}
            onButtonChange={setTab}
            periods={periods}
            selectedPeriodId={selectedPeriod?.id}
            onPeriodChange={setSelectedPeriodId}
        >
            {tab === 'grades' && (<Grades studentId={selectedStudentId} periodId={selectedPeriod?.id} />)}
            {tab === 'attendance' && (<Attendance studentId={selectedStudentId} period={selectedPeriod} />)}
            {tab === 'observations' && (<Observations />)}
        </CumulativeGPALayout>
    );
}