import { useState } from "react";
import { createClassSchedule } from "../api";
import toast from "react-hot-toast";

export const useCreateClassSchedule = (onSuccess: () => void ) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const submitClassSchedule = async (payload: any) => {
        setLoading(true);
        try {
            await createClassSchedule(payload);
            toast.success("Se asignó el horario correctamente");
            onSuccess();
        } catch (error : any) {
            console.error("Error creating schedule:", error);

            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                "Ocurrió un error al asignar el horario";

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    return { loading, error, setError, submitClassSchedule };
}