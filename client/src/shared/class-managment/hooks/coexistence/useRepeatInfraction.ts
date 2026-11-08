import { useState } from "react";
import type { UpsertInfractionPayload } from "../../types/types.ts";
import toast from "react-hot-toast";
import { createInfraction } from "../../api";

export const useRepeatInfraction = (onSuccess: () => void) => {
    const [loading, setLoading] = useState(false);

    const repeatInfraction = async (classId: string, payload: UpsertInfractionPayload) => {
        setLoading(true);
        try {
            await createInfraction(classId, payload);

            toast.success("La reincidencia de creao correctament");
            onSuccess();
        } catch (error: any) {
            const message = error?.response?.data?.message ||
                error?.message || "No se pudo repetir la infracción"
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }

    return { repeatInfraction, loading };
}