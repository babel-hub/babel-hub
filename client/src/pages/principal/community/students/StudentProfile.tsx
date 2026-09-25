import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { StudentProfileDetailsLayout } from "../../../../features/director/comunity";
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
    const [tab, setTab] = useState<StudentProfileTabTypes>("general");

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

    console.log(data)

    return (
        <StudentProfileDetailsLayout
            studentId={id}
            activeTab={tab}
            onTabChange={setTab}
            onClose={() => navigate(-1)}
            loading={loading}
        >
            {tab === "general" && data && (
                <div className="animate-in fade-in duration-200">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Información General</h2>
                    <p className="text-gray-500">Datos de {data.first_name}</p>
                </div>
            )}

            {tab === "academic" && data && (
                <div className="animate-in fade-in duration-200">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Área Académica</h2>
                    <p className="text-gray-500">Grados y clases de {data.first_name}</p>
                </div>
            )}

            {tab === "security" && data && (
                <div className="animate-in fade-in duration-200">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Privacidad</h2>
                    <p className="text-gray-500">Gestión de accesos.</p>
                </div>
            )}
        </StudentProfileDetailsLayout>
    );
}