import { useState } from "react";
import { deleteSchedule } from "../api";
import toast from "react-hot-toast";

export const useDeleteSchedule = (onSuccess: () => void) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const deleteScheduleById = async (scheduleId: string) => {
        setLoading(true);
        setError(null);

        try {
            await deleteSchedule(scheduleId);

            toast.success("Se elimino correctamente el horario");
            onSuccess();
        } catch (error: any) {
            console.error("Error deleting calendar:", error);

            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                "Ocurrió un error al eliminar el horario";

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    return { deleteScheduleById, loading, error }
}