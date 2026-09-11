import { useEffect, useState } from "react";
import type { DailyAttendance } from "../../types/types.ts";
import { getStudentDailyAttendance } from "../../api";

export const useAttendance = (studentId: string, date: string) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [attendance, setAttendance] = useState<DailyAttendance[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAttendance = async () => {
            if (!studentId || !date) return;

            setLoading(true);
            setError(null);
            try {
                const result = await getStudentDailyAttendance(studentId, date);
                setAttendance(result);
            } catch (error : any) {
                console.error(error);

                const backendMessage = error.response?.data?.message
                    || error.response?.data?.error
                    || "Ocurrió un error inesperado al cargar la asistencia.";

                setError(backendMessage);
            } finally {
                setLoading(false);
            }
        }
        fetchAttendance();
    }, [studentId, date]);

    return { loading, attendance, error };
}