import { useState } from "react";
import toast from "react-hot-toast";
import { createAssignment, updateAssignment } from "../../api";
import type { modeTypes } from "../../../../features/types/types.ts";

export const useCreateAssignment = (onSuccess: () => void) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const upsertAssignment = async (mode: modeTypes, assignmentId: string | null, payload: any) => {
        setLoading(true);
        try {
            if (mode === 'edit' && assignmentId) {
                await updateAssignment(assignmentId, payload);
            } else if (mode === 'create') {
                await createAssignment(payload);
            } else {
                throw new Error("No se pudo determinar la acción a realizar");
            }
            toast.success(`Asignación ${mode === "create" ? "creada" : "editada"} correctamente.`);

            onSuccess();
        } catch (error : any) {
            const msg = error?.response?.data?.message || error?.message || `Error al ${mode === "create" ? "crear" : "editar"} la asignación.`;
            console.error(msg);
            setError(msg);
        } finally {
            setLoading(false);
        }
    }

    return {
        loading,
        error,
        upsertAssignment,
        setError
    }
}