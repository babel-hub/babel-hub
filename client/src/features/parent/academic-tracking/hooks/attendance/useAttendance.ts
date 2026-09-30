import { useEffect, useState } from "react";
import type {DailyScheduleWithBreaks} from "../../types/types.ts";
import { getStudentDailyAttendance } from "../../api";

export const useAttendance = (courseId: string, studentId: string, date: string) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [attendance, setAttendance] = useState<DailyScheduleWithBreaks>();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        let isMounted = true;

        const fetchAttendance = async () => {
            if (!studentId || !date || !courseId) return;

            setLoading(true);
            setError(null);
            try {
                const result = await getStudentDailyAttendance(courseId, studentId, date, controller.signal);
                if (isMounted) setAttendance(result);
            } catch (error: any) {
                if (error.name === "CanceledError" || error.name === "AbortError") return;

                console.error(error);
                const backendMessage = error.response?.data?.message
                    || error.response?.data?.error
                    || "Ocurrió un error inesperado al cargar la asistencia.";

                if (isMounted) setError(backendMessage);
            } finally {
                if (isMounted) setLoading(false);
            }
        }
        fetchAttendance();

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [studentId, date]);

    return { loading, attendance, error };
}