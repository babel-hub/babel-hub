import {
    Assignments,
    ClassLayout,
    RegisterAttendance,
    Students,
    ViewAttendance
} from "../../../features/teacher/class-management";
import { useClassData } from "../../../features/teacher/class-management/class-details/hooks/useClassData.ts";
import { useParams } from "react-router-dom";
import {useEffect, useState} from "react";
import { LoadingContent } from "../../../components/ui/Loadings.tsx";
import { formatterDate } from "../../../types";
import type { TabTypes } from "../../../features/types/types.ts";
import { NotFound } from "../../../components/ui/blocks/NoFound.tsx";
import { usePeriods } from "../../../shared/hooks/usePeriods.ts";
import {NoResults} from "../../../components/ui/blocks/NoResults.tsx";

export default function ClassDetails() {
    const { id: classId } = useParams();
    const { periods } = usePeriods();

    if (!classId) return null;

    const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");
    const [activeTab, setActiveTab] = useState<TabTypes>("students");
    const initialDate = formatterDate.format(new Date());
    const [date, setDate] = useState<string>(initialDate);

    const { loading, classData } = useClassData(classId);

    useEffect(() => {
        if (periods && periods.length > 0 && !selectedPeriodId) {
            const activePeriod = periods.find(p => p.is_current);
            setSelectedPeriodId(activePeriod ? activePeriod.id : periods[0].id);
        }
    }, [periods, selectedPeriodId]);

    if (loading) return <LoadingContent title="Cargando clase..."/>;
    if (!classData) return <NotFound title="Clase no encontrada"/>;
    if (!periods || periods.length === 0) return <NoResults title="No se encontraron periodos" />;
    if (!selectedPeriodId) return null;

    return (
        <ClassLayout
            classDetails={classData}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            periods={periods}
            periodId={selectedPeriodId}
            onPeriodChange={setSelectedPeriodId}
            showPeriodSelector={activeTab === "assignments" || activeTab === "see attendance"}
            showCalendar={activeTab === "register attendance"}
            date={date}
            setDate={setDate}
        >
            {activeTab === "students" && (<Students periodId={selectedPeriodId} courseId={classData.course_id} classId={classId} students={classData.students} />)}
            {activeTab === "register attendance" && (<RegisterAttendance classData={classData} date={date} classId={classId}/>)}
            {activeTab === "see attendance" && (<ViewAttendance periods={periods} periodId={selectedPeriodId} courseId={classData.course_id} classId={classId} />)}
            {activeTab === "assignments" && (<Assignments periodId={selectedPeriodId} classData={classData} courseId={classData.course_id} classId={classId} />)}
        </ClassLayout>
    )
}