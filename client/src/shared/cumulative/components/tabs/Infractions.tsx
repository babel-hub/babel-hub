import { useState } from "react";
import { useMonitoringData } from "../../../coexisting/hooks/useMonitoringData.ts";
import type { Student } from "../../../../features/types/types.ts";
import { InfractionsManager } from "../../../coexisting/components/containers/InfractionsManager.tsx";
import { useStudentInfractions } from "../../hooks/useStudentInfractions.ts";

interface InfractionsProps {
    courseId: string;
    students: Student[];
}

export function Infractions({ students, courseId }: InfractionsProps) {
    const [selectedStudentId, setSelectedStudentId] = useState<string>("");

    const {
        infractions,
        loading: loadingInfractions,
        error: errorInfractions,
        refetch,
    } = useStudentInfractions(courseId, selectedStudentId);

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
            courseId={courseId}
            onView={() => {}}
            refetch={handleRefetchAll}
            canCreate
            canEdit
            canDelete
            canEscalate
        />
    );
}