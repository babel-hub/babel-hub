import { useState } from "react";
import type { modeTypes } from "../../../types/types.ts";
import toast from "react-hot-toast";

export const useUpsertAnnouncements = (onSuccess: () => void) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const upsertAnnouncement = async (mode: modeTypes, announcementId: string | null, payload: any) => {
        setLoading(true);
        try {
            if (mode === "edit" && announcementId) {
                console.log(payload);
            } else if (mode === "create") {

            } else { setError("No hay opciones validas") }

            onSuccess();
            toast.success(`Comunicado ${mode === "create" ? "creado" : "editado"} correctamente`);
        } catch (error : any) {
            const errorMessage = error.message
            || error.data.message
            || `Error al ${mode === "create" ? "crear" : "editar"} e comunicado`;
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    return { loading, error, setError, upsertAnnouncement };
}