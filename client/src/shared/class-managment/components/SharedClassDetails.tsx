import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { ClassLayout } from "./layout/ClassLayout.tsx";
import { Agenda } from "./tabs/Agenda.tsx";
import { RegisterAttendance } from "./tabs/RegisterAttendance.tsx";
import { ViewAttendance } from "./tabs/ViewAttendance.tsx";
import { Assignments } from "./tabs/Assignments.tsx";
import { usePeriods } from "../../global/hooks/usePeriods.ts";
import type { TabTypes } from "../../../features/types/types.ts";
import { formatterDate } from "../../../types";
import { useClassData } from "../hooks/useClassData.ts";
import { LoadingContent } from "../../../components/ui/Loadings.tsx";
import { NotFound } from "../../../components/ui/blocks/NoFound.tsx";
import { NoResults } from "../../../components/ui/blocks/NoResults.tsx";
import type { PrincipalClassData, SharedClassData, TeacherClassData } from "../types/types.ts";

interface SharedClassDetailsProps {
    viewMode: "principal" | "teacher";
    fetcher: (id: string, signal?: AbortSignal) => Promise<SharedClassData>;
}

export function SharedClassDetails({ viewMode, fetcher }: SharedClassDetailsProps) {
    const { classId } = useParams<{ classId: string }>();
    const { periods } = usePeriods();

    const [tab, setTab] = useState<TabTypes>("students");
    const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");

    const initialDate = formatterDate.format(new Date());
    const [date, setDate] = useState<string>(initialDate);

    const { classData: data, loading } = useClassData(classId || "", fetcher);

    useEffect(() => {
        if (periods && periods.length > 0 && !selectedPeriodId) {
            const activePeriod = periods.find(p => p.is_current);
            setSelectedPeriodId(activePeriod ? activePeriod.id : periods[0].id);
        }
    }, [periods, selectedPeriodId]);

    if (!classId) return null;
    if (loading) return <LoadingContent title="Cargando clase..." />;
    if (!data) return <NotFound title="Clase no encontrada" />;
    if (!periods || periods.length === 0) return <NoResults title="No se encontraron periodos" />;
    if (!selectedPeriodId) return null;

    const activeCourseId = viewMode === "principal"
        ? (data as PrincipalClassData).details.course_id
        : (data as TeacherClassData).course_id;

    return (
        <ClassLayout
            data={data}
            viewMode={viewMode}
            activeTab={tab}
            onTabChange={setTab}
            periods={periods}
            periodId={selectedPeriodId}
            onPeriodChange={setSelectedPeriodId}
            showPeriodSelector={tab === "see attendance" || tab === "assignments"}
            showCalendar={tab === "register attendance"}
            date={date}
            setDate={setDate}
        >
            {tab === "students" && (
                <Agenda
                    students={data.students}
                    classId={classId}
                    courseId={activeCourseId}
                />
            )}

            {tab === "register attendance" && (
                <RegisterAttendance
                    classData={data}
                    date={date}
                    classId={classId}
                />
            )}

            {tab === "see attendance" && (
                <ViewAttendance
                    classData={data}
                    periods={periods}
                    periodId={selectedPeriodId}
                    courseId={activeCourseId}
                    classId={classId}
                />
            )}

            {tab === "assignments" && (
                <Assignments
                    periodId={selectedPeriodId}
                    classData={data}
                    courseId={activeCourseId}
                    classId={classId}
                />
            )}
        </ClassLayout>
    );
}