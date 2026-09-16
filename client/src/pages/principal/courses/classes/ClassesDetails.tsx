import { useClassData } from "../../../../features/director/class-management/hooks/useClassData.ts";
import { useParams } from "react-router-dom";
import {useEffect, useState} from "react";
import { LoadingContent } from "../../../../components/ui/Loadings.tsx";
import { formatterDate } from "../../../../types";

import { ClassLayout } from "../../../../features/director/class-management";
import { Assignments } from "../../../../features/director/class-management/components/tabs/Assignments.tsx";
import { RegisterAttendance } from "../../../../features/director/class-management/components/tabs/RegisterAttendance.tsx";
import { Students } from "../../../../features/director/class-management/components/tabs/Students.tsx";
import { ViewAttendance } from "../../../../features/director/class-management/components/tabs/ViewAttendance.tsx";
import type { TabTypes } from "../../../../features/types/types.ts";
import { usePeriods } from "../../../../shared/hooks/usePeriods.ts";
import { NoResults } from "../../../../components/ui/blocks/NoResults.tsx";

export default function ClassesDetails() {
    const { id, courseId } = useParams<{ id: string, courseId: string }>();

    const { periods } = usePeriods();
    const [tab, setTab] = useState<TabTypes>("students")
    const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");

    if (!id || !courseId) return null;

    const { data, loading } = useClassData(id);
    const initialDate = formatterDate.format(new Date());
    const [date, setDate] = useState<string>(initialDate)

    useEffect(() => {
        if (periods && periods.length > 0 && !selectedPeriodId) {
            const activePeriod = periods.find(p => p.is_current);
            setSelectedPeriodId(activePeriod ? activePeriod.id : periods[0].id);
        }
    }, [periods, selectedPeriodId]);

    if (!periods || periods.length === 0) return <NoResults title="No se encontraron periodos" />;
    if (loading) return <LoadingContent title="Cargando clase..."/>;
    if (!data) return <div className="p-6 text-gray-500 text-center flex-1">Clase no encontrada.</div>;
    if (!selectedPeriodId) return null;

    return (
        <ClassLayout
            data={data}
            activeTab={tab}
            onTabChange={setTab}
            periods={periods}
            periodId={selectedPeriodId}
            onPeriodChange={setSelectedPeriodId}
            showPeriodSelector={tab === "see attendance" || tab === "assignments"}
            date={initialDate}
            setDate={setDate}
            showCalendar={tab === "register attendance"}
        >
            {tab === "students" && (<Students students={data.students} />)}
            {tab === "register attendance" && (<RegisterAttendance classData={data} date={date} />)}
            {tab === "see attendance" && (<ViewAttendance periodId={selectedPeriodId} classData={data} courseId={courseId} periods={periods} />)}
            {tab === "assignments" && (<Assignments periodId={selectedPeriodId} classData={data} courseId={courseId} classId={id} />)}
        </ClassLayout>
    )
}