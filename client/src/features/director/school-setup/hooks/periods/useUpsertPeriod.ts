import { useState } from "react";
import { createPeriod, updatePeriod } from "../../api";
import toast from "react-hot-toast";
import type { modeTypes } from "../../../../types/types.ts";

export const useUpsertPeriod = (onSuccess: () => void) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const upsertPeriod = async (mode: modeTypes, periodId: string | null, payload: any) => {
        setLoading(true);
        setError("");

        try {
            if (mode === 'edit' && periodId) {
                await updatePeriod(periodId, payload);
            } else if (mode === 'create') {
                await createPeriod(payload);
            } else {
                throw new Error("No se pudo determinar la acción a realizar");
            }
            toast.success(`Periodo ${mode === "create" ? "creado" : "editado"} correctamente.`);

            onSuccess();
        } catch (error : any) {
            const msg = error?.response?.data?.message || `Error al ${mode === "create" ? "crear" : "editar"} el periodo.`;
            console.error(msg);
            setError(msg);
        } finally {
            setLoading(false);
        }
    }

    return { upsertPeriod, loading, error, setError };
}