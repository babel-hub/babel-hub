import { useState, useEffect } from "react";
import type { TeacherSchedule } from "../types/types.ts";
import { getTeacherSchedule } from "../api";

export const useTeacherSchedule = (teacherId: string) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [schedule, setSchedule] = useState<TeacherSchedule[]>([]);

    useEffect(() => {
        const fetchSchedule = async () => {
            if (!teacherId) return;

            setLoading(true);
            try {
                const data = await getTeacherSchedule(teacherId);
                setSchedule(data);
            } catch (error : any) {
                console.error("Error getting schedule:", error);

                const errorMessage =
                    error.response?.data?.message ||
                    error.message ||
                    "Ocurrió al cargar el horario";

                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        }
        fetchSchedule();
    }, [teacherId]);

    return { loading, error, schedule };
}