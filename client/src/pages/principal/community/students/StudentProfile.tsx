import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
    StudentProfileAttendance,
    StudentProfileClasses,
    StudentProfileDetailsLayout,
    StudentProfileGeneral,
    StudentProfileGrades,
    StudentProfileSecurity
} from "../../../../features/director/comunity";
import type { StudentProfileTabTypes } from "../../../../types";
import { useStudentProfile } from "../../../../features/director/comunity/hooks/students/useStudentProfile.ts";
import { usePeriods } from "../../../../shared/hooks/usePeriods.ts";
import { NoResults } from "../../../../components/ui/blocks/NoResults.tsx";
import type { Period } from "../../../../shared/types/types.ts";

export default function StudentProfile() {
    const { id } = useParams<{ id: string }>();
    const { periods } = usePeriods();
    const navigate = useNavigate();

    const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");
    const [period, setPeriod] = useState<Period | null>(null);
    const [tab, setTab] = useState<StudentProfileTabTypes>("account");

    const { loading, data } = useStudentProfile(
        id || "",
        selectedPeriodId,
        period?.start_date || "",
        period?.end_date || ""
    );

    useEffect(() => {
        if (periods && periods.length > 0 && !selectedPeriodId) {
            const activePeriod = periods.find(p => p.is_current);
            setPeriod(activePeriod || periods[0]);
            setSelectedPeriodId(activePeriod ? activePeriod.id : periods[0].id);
        }
    }, [periods, selectedPeriodId]);

    if (!id) return null;
    if (!periods || periods.length === 0) return <NoResults title="No se encontraron periodos" />;

    if (!loading && !data && selectedPeriodId) {
        return <div className="p-6 text-gray-500 text-center flex-1">Estudiante no encontrado.</div>;
    }

    return (
        <StudentProfileDetailsLayout
            studentId={id}
            activeTab={tab}
            onTabChange={setTab}
            onClose={() => navigate(-1)}
            loading={loading}
        >
            {tab === "account" && data && <StudentProfileGeneral data={data} />}
            {tab === "grades" && data && <StudentProfileGrades grades={data.recent_grades} />}
            {tab === "classes" && data && <StudentProfileClasses classes={data.current_classes} />}
            {tab === "attendance" && data && <StudentProfileAttendance attendance={data.attendance_summary} />}
            {tab === "security" && data && <StudentProfileSecurity isActive={data.is_active} createdAt={data.created_at} />}
        </StudentProfileDetailsLayout>
    );
}