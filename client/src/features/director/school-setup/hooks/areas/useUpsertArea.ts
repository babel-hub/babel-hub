import { useState } from "react";
import { createArea, updateArea } from "../../api";
import toast from "react-hot-toast";
import type { modeTypes } from "../../../../types/types.ts";

export const useUpsertArea = (onSuccess: () => void) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const upsertArea = async (mode: modeTypes, areaId: string | null, payload: any) => {
        setLoading(true);
        setError("");

        try {
            if (mode === 'edit' && areaId) {
                await updateArea(areaId, payload);
            } else if (mode === 'create')  {
                await createArea(payload);
            }
            toast.success(`Área ${mode === 'create' ? "creada" : "editada"} correctamente.`);

            onSuccess();
        } catch (error : any) {
            const msg = error.response?.data?.message || "Error al guardar el área."
            console.error(msg);
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return { loading, error, setError, upsertArea };
}