import { useState, useEffect } from "react";

import { CumulativeGPALayout, Grades, Attendance, Observations } from "../../../features/parent/cumulativeGPA/components";
import { LoadingContent } from "../../../components/ui/Loadings.tsx";
import { NoResults } from "../../../components/ui/blocks/NoResults.tsx";
import { usePeriods } from "../../../shared/hooks/usePeriods.ts";

import { useStudentData } from "../../../features/parent/shared/hooks/useStudentData.ts";
import type { CumulativeGPATypes } from "../../../features/parent/shared/types/types.ts";

export default function CumulativeGPA() {
    const [tab, setTab] = useState<CumulativeGPATypes>('attendance');
    const { periods } = usePeriods();
    const { loading, students } = useStudentData();
    const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");

    useEffect(() => {
        if (periods && periods.length > 0 && !selectedPeriodId) {
            const activePeriod = periods.find((p) => p.is_current);
            setSelectedPeriodId(activePeriod ? activePeriod.id : periods[0].id);
        }
    }, [periods, selectedPeriodId]);

    if (loading) return <LoadingContent title="" />;
    if (students.length === 0) return <NoResults title='Estudiantes no asignados a este acudiante' />;
    if (periods.length === 0) return <NoResults title="No se encontraron periodos" />;

    const selectedPeriod = periods.find(p => p.id === selectedPeriodId);

    if (!selectedPeriod || !selectedPeriodId) return null;

    return (
        <CumulativeGPALayout
            student={students}
            activeTab={tab}
            onButtonChange={setTab}
            periods={periods}
            selectedPeriodId={selectedPeriod?.id}
            onPeriodChange={setSelectedPeriodId}
        >
            {tab === 'grades' && (<Grades students={students} periodId={selectedPeriod?.id} />)}
            {tab === 'attendance' && (<Attendance students={students} period={selectedPeriod} />)}
            {tab === 'observations' && (<Observations />)}
        </CumulativeGPALayout>
    );
}