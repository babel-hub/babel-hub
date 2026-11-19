import { useState } from "react";
import { createClassSchedule } from "../../api";
import toast from "react-hot-toast";

export const useCreateSchedule = (onSuccess: () => void) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const createSchedule = async (classId: string, payload: any) => {
        setLoading(true);
        setError("");

        try {
            await createClassSchedule(classId, payload);

            toast.success("Horario creado correctamente");
            onSuccess();
        } catch (err : any) {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "No se pudo agregar el horario";
            setError(msg);
        } finally {
            setLoading(false);
        }
    }

    return { loading, error, createSchedule, setError };
}