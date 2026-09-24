import { useState } from "react";
import { updateSchedule } from "../api";
import toast from "react-hot-toast";

export const useEditSchedule = (onSuccess: () => void) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const editSchedule = async (scheduleId: string, payload: any) => {
        setLoading(true);
        setError("");
        try {
            await updateSchedule(scheduleId, payload);
            toast.success("Se edito correctamente el horario");
            onSuccess();
        } catch (err: any) {
            console.error("Error editing calendar:", err);

            const errorMessage =
                err.response?.data?.message ||
                err.message ||
                "Ocurrió un error al editar el horario";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return { editSchedule, loading, error, setError };
}