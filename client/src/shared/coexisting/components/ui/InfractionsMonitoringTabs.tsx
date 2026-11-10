import type { Student } from "../../../../features/types/types.ts";
import type { StudentInfraction, StudentMonitoring, Tabs } from "../../../class-managment/types/types.ts";
import { InfractionRow } from "../../../class-managment/components/ui/InfractionRow.tsx";
import { MonitoringRow } from "../../../class-managment/components/ui/MonitoringRow.tsx";
import { NoResults } from "../../../../components/ui/blocks/NoResults.tsx";
import { LoadingContent } from "../../../../components/ui/Loadings.tsx";
import { Ghost, FaceGrinning } from 'lucide-react';
import {useState} from "react";
import {MonitoringMessagesModal} from "../../../class-managment/components/ui/MonitoringMessageModal.tsx";

interface InfractionsMonitoringTabsProps {
    selectedStudentId: string;
    selectedStudent: Student | undefined;
    tab: Tabs;
    infractions: StudentInfraction[];
    monitoring: StudentMonitoring[];
    loadingInfractions: boolean;
    loadingMonitoring: boolean;
    errorInfractions: string;
    errorMonitoring: string;
    onEdit?: (infraction: StudentInfraction) => void;
    onDelete?: (infraction: StudentInfraction) => void;
    onRepeat?: (infraction: StudentInfraction) => void;
    onEscalate?: (infraction: StudentInfraction) => void;
}

export function InfractionsMonitoringTabs({
                                              selectedStudentId,
                                              selectedStudent,
                                              tab,
                                              infractions,
                                              monitoring,
                                              loadingInfractions,
                                              loadingMonitoring,
                                              onEscalate,
                                              onRepeat,
                                              errorInfractions,
                                              errorMonitoring,
                                              onEdit,
                                              onDelete,
                                          }: InfractionsMonitoringTabsProps) {
    const [messagesFor, setMessagesFor] = useState<StudentMonitoring | null>(null);
    const studentFirstName = selectedStudent?.student_first_name ?? "Este estudiante";

    if (!selectedStudentId) {
        return (
            <div className="h-full border rounded-xl border-gray-200 flex items-center justify-center mt-5 max-h-[calc(100dvh-12.8rem)]">
                <div className="w-full flex flex-col items-center justify-center max-w-3xs">
                    <Ghost className="text-gray-400" />
                    <p className="text-gray-400 mt-3 text-sm text-center">Selecciona algun estudiante para visualizar sus infracciones o monitoreos</p>
                </div>
            </div>
        );
    }

    const body = (() => {
        if (tab === "infractions") {
            if (loadingInfractions) return <LoadingContent title="" />;
            if (errorInfractions) return <NoResults title={errorInfractions} />;
            if (infractions.length === 0) {
                return (
                    <div className="h-full border rounded-xl border-gray-200 flex items-center justify-center max-h-[calc(100dvh-12.8rem)]">
                        <div className="w-full flex flex-col items-center justify-center max-w-3xs">
                            <FaceGrinning className="text-gray-400" />
                            <p className="text-gray-400 mt-3 text-sm text-center">{studentFirstName} no tiene infracciones registradas</p>
                        </div>
                    </div>
                );
            };
            return (
                <ul className="flex flex-col gap-3">
                    {infractions.map((inf) => (
                        <InfractionRow
                            key={inf.id}
                            infraction={inf}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onEscalate={onEscalate}
                            onRepeat={onRepeat}
                        />
                    ))}
                </ul>
            );
        }

        if (loadingMonitoring) return <LoadingContent title="" />;
        if (errorMonitoring) return <NoResults title={errorMonitoring} />;
        if (monitoring.length === 0) {
            return (
                <div className="h-full border rounded-xl border-gray-200 flex items-center justify-center max-h-[calc(100dvh-12.8rem)]">
                    <div className="w-full flex flex-col items-center justify-center max-w-3xs">
                        <FaceGrinning className="text-gray-400" />
                        <p className="text-gray-400 mt-3 text-sm text-center">{studentFirstName} no tiene monitoreos registrados</p>
                    </div>
                </div>
            )
        };
        return (
            <ul className="flex flex-col gap-3">
                {monitoring.map((m) => (
                    <MonitoringRow key={m.id} monitoring={m} onOpenMessages={(mon) => setMessagesFor(mon)} />
                ))}
            </ul>
        );
    })();

    return (
        <div className="flex-1 overflow-y-auto styled-scrollbar max-h-[calc(100dvh-12.8rem)] mt-5">
            {body}

            {messagesFor && (
                <MonitoringMessagesModal
                    monitoringId={messagesFor.id}
                    monitoringTitle={messagesFor.infraction_code_name}
                    onClose={() => setMessagesFor(null)}
                />
            )}
        </div>
    );
}