import { useState } from "react";
import type { Student } from "../../../../features/types/types.ts";
import { useInfractionsData } from "../../../coexisting/hooks/useInfractionsData.ts";
import { useMonitoringData } from "../../../coexisting/hooks/useMonitoringData.ts";
import { InfractionsManager } from "../../../coexisting/components/containers/InfractionsManager.tsx";

interface AgendaProps {
    students: Student[];
    classId: string;
    courseId: string;
}

export function Agenda({ students, classId, courseId }: AgendaProps) {
    const [selectedStudentId, setSelectedStudentId] = useState<string>("");

    const {
        infractions,
        loading: loadingInfractions,
        error: errorInfractions,
        refetch,
    } = useInfractionsData(classId, selectedStudentId);

    const {
        monitoring,
        loading: loadingMonitoring,
        error: errorMonitoring,
        refetch: refetchMonitoring,
    } = useMonitoringData(courseId, selectedStudentId);

    const selectedStudent = students.find(s => s.student_id === selectedStudentId);

    const handleRefetchAll = () => {
        refetch();
        refetchMonitoring();
    };

    return (
        <InfractionsManager
            students={students}
            selectedStudentId={selectedStudentId}
            setSelectedStudentId={setSelectedStudentId}
            selectedStudent={selectedStudent}
            infractions={infractions}
            monitoring={monitoring}
            loadingInfractions={loadingInfractions}
            loadingMonitoring={loadingMonitoring}
            errorInfractions={errorInfractions}
            errorMonitoring={errorMonitoring}
            classId={classId}
            courseId={courseId}
            refetch={handleRefetchAll}
            canCreate
            canEdit
            canDelete
            canEscalate
        />
    );
}