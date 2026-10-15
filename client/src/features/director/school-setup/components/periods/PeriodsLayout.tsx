import { usePeriods } from "../../../../../shared/hooks/usePeriods.ts";
import { useState } from "react";
import { type ModalModeTypes } from "../../../../../types";
import { ConfirmModal } from "../../../../../components/ui/modals/ConfirmModal.tsx";
import { useDeletePeriod } from "../../hooks/periods/useDeletePeriod.ts";
import { PeriodsFormModal } from "../ui/PeriodsFormModal.tsx";
import { HiPlus } from "react-icons/hi";
import { PeriodRows } from "./PeriodRows.tsx";
import type { Period } from "../../../../../shared/types/types.ts";

export function PeriodsLayout() {
    const [modalMode, setModalMode] = useState<ModalModeTypes>('none');
    const [periodToDelete, setPeriodToDelete] = useState<Period | null>(null);
    const [periodToEdit, setPeriodToEdit] = useState<Period | null>(null);

    const { periods, reloadPeriods } = usePeriods();
    const { loadingDelete, deletePeriodById } = useDeletePeriod(reloadPeriods);

    const handleCreatePeriod = () => {
        setPeriodToEdit(null);
        setModalMode('create');
    };

    const handleEditPeriod = (period: Period) => {
        setPeriodToEdit(period);
        setModalMode('edit');
    };

    const handleDeletePeriod = (period: Period) => {
        setPeriodToDelete(period);
    };

    return (
        <div className="w-full">
            <div className="flex items-center mb-5 justify-between">
                <div className="max-w-[250px] w-full">
                    <p className="text-custom-black text-sm font-semibold">Tus periodos academicos</p>
                </div>
                <button
                    className="cursor-pointer flex items-center gap-1 py-2 px-3 rounded-md transition-colors text-sm font-bold text-primary hover:bg-primary-shadow hover:border-primary-shadow border border-gray-100"
                    onClick={handleCreatePeriod}
                >
                    <HiPlus />
                    <p>Añadir</p>
                </button>
            </div>

            <ul className="flex flex-col gap-2">
                {periods.map((period) => (
                    <PeriodRows
                        key={period.id}
                        period={period}
                        onEdit={handleEditPeriod}
                        onDelete={handleDeletePeriod}
                    />
                ))}
            </ul>

            <ConfirmModal
                isOpen={periodToDelete !== null}
                onClose={() => setPeriodToDelete(null)}
                title="¿Estás seguro?"
                message={`¿Quieres eliminar la clase de ${periodToDelete?.name}?`}
                onConfirm={async () => {
                    if (periodToDelete) {
                        await deletePeriodById(periodToDelete.id);
                        setPeriodToDelete(null);
                    }
                }}
                loadingDelete={loadingDelete}
            />

            {modalMode !== 'none' && (
                <PeriodsFormModal
                    mode={modalMode}
                    onSuccess={async () => {
                        setPeriodToEdit(null);
                        await reloadPeriods();
                        setModalMode('none');
                    }}
                    period={periodToEdit}
                    onClose={() => {
                        setPeriodToEdit(null);
                        setModalMode('none');
                    }}
                />
            )}
        </div>
    );
}