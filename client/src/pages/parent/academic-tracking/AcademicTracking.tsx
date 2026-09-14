import { useState } from "react";

import { AcademicTrackingLayout, Attendance, Grades, Observations } from "../../../features/parent/academic-tracking/components";
import type { CumulativeGPATypes } from "../../../features/parent/shared/types/types.ts";
import { useStudentData } from "../../../features/parent/shared/hooks/useStudentData.ts";
import { LoadingContent } from "../../../components/ui/Loadings.tsx";
import { NoResults } from "../../../components/ui/blocks/NoResults.tsx";
import { formatterDate } from "../../../types";

export default function AcademicTracking () {
    const [tab, setTab] = useState<CumulativeGPATypes>('attendance');
    const { loading, students } = useStudentData();
    const initialDate = formatterDate.format(new Date());
    const [tabDate, setTabDate] = useState<string>(initialDate)

    if (loading) return <LoadingContent title="" />;
    if (students.length === 0) return <NoResults title='Estudiantes no asignados a este acudiante' />;

    return (
        <AcademicTrackingLayout
            student={students}
            activeTab={tab}
            onButtonTabChange={setTab}
            date={tabDate}
            onButtonDateChange={setTabDate}
        >
            {tab === 'grades' && (<Grades students={students} date={tabDate} />)}
            {tab === 'attendance' && (<Attendance date={tabDate} students={students} />)}
            {tab === 'observations' && (<Observations />)}
        </AcademicTrackingLayout>
    )
}