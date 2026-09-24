import {useState, useEffect, useCallback} from "react";
import type { TeacherSchedule } from "../types/types.ts";
import { getTeacherSchedule } from "../api";

export const useTeacherSchedule = (teacherId: string) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [schedule, setSchedule] = useState<TeacherSchedule[]>([]);
    const [trigger, setTrigger] = useState<number>(0);

    const refetch = useCallback(() => {
        setTrigger((prev) => prev + 1);
    }, []);

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
                    "Ocurrió un error al cargar el horario";

                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        }
        fetchSchedule();
    }, [teacherId, trigger]);

    return { loading, error, schedule, refetch };
}