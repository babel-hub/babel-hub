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

    console.log(students);

    if (loading) return <LoadingContent title="" />;
    if (students.length === 0) return <NoResults title='Estudiantes no asignados a este acudiante' />;

    return (
        <AcademicTrackingLayout
            student={students}
            activeTab={tab}
            onButtonChange={setTab}
        >
            {tab === 'grades' && (<Grades students={students} />)}
            {tab === 'attendance' && (<Attendance date={initialDate} students={students} />)}
            {tab === 'observations' && (<Observations />)}
        </AcademicTrackingLayout>
    )
}