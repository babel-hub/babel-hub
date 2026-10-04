import { useState } from "react";
import type { modeTypes } from "../../../features/types/types.ts";
import toast from "react-hot-toast";
import { createAnnouncement, updateAnnouncement } from "../../api";

export const useUpsertAnnouncements = (onSuccess: () => void) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const upsertAnnouncement = async (mode: modeTypes, announcementId: string | null, payload: any) => {
        setLoading(true);
        setError("");

        try {
            if (mode === "edit" && announcementId) {
                await updateAnnouncement(announcementId, payload);
            } else if (mode === "create") {
                await createAnnouncement(payload);
            } else {
                setError("No hay opciones válidas");
                setLoading(false);
                return;
            }

            toast.success(`Comunicado ${mode === "create" ? "creado" : "editado"} correctamente`);
            onSuccess();
        } catch (err: any) {
            const errorMessage = err.response?.data?.message
                || err.message
                || `Error al ${mode === "create" ? "crear" : "editar"} el comunicado`;

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    return { loading, error, setError, upsertAnnouncement };
}