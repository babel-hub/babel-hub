import { useState } from "react";
import toast from "react-hot-toast";
import { createInfraction, updateInfraction } from "../../api";
import type { modeTypes } from "../../../../features/types/types.ts";
import type { UpsertInfractionPayload } from "../../types/types.ts";

export const useUpsertCoexistence = (onSuccess: () => void) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const upsertCoexistence = async (classId: string, mode: modeTypes, infractionId: null | string, payload: UpsertInfractionPayload) => {
        setLoading(true);
        setError("");

        try {
            if (mode === "create") {
                await createInfraction(classId, payload);
            } else if (mode === "edit" && infractionId) {
                await updateInfraction(infractionId, payload);
            } else {
                setError("No se pudo completar la operación. Recarga la página e intenta de nuevo.");
            }

            toast.success(`La infracción fue ${mode === "create" ? "creada" : "editada"} correctamente`);
            onSuccess();
        } catch (err : any) {
            setError(
                err?.response?.data?.message ||
                err?.message ||
                "No se pudo crear la infracción"
            );
        } finally {
            setLoading(false);
        }
    }

    return { loading, error, upsertCoexistence, setError }
}