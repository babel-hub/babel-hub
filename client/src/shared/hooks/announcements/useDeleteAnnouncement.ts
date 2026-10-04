import { useState } from "react";
import toast from "react-hot-toast";
import { deleteAnnouncement } from "../../api";

export const useDeleteAnnouncement = (onSuccess: () => void) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const deleteAnnouncementById = async (announcementId: string) => {
        setLoading(true);
        setError("");

        try {
            await deleteAnnouncement(announcementId);

            toast.success("Comunicado eliminado correctamente");
            onSuccess();
        } catch (err: any) {
            const errorMessage = err.response?.data?.message
                || err.message
                || "Error al eliminar el comunicado";

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    return { loading, deleteAnnouncementById, error };
}