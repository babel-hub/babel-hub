import { useState, useEffect } from 'react';
import { getCumulativeAttendance } from "../../api";
import type { CumulativeAttendance } from "../../types/types.ts";

export const useCumulativeAttendance = (courseId: string, periodId: string) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [attendance, setAttendance] = useState<CumulativeAttendance[]>([]);

    useEffect(() => {
        const fetchAttendance = async () => {
            setLoading(true);
            setError("");
            try {
                const result = await getCumulativeAttendance(courseId, periodId);
                setAttendance(result);
            } catch (error : any) {
                const errorMessage =
                    error?.response?.data?.message ||
                    error?.message ||
                    "Ocurrió un error al cargar la asistencia";
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        }
        fetchAttendance();
    }, []);

    return { loading, error, attendance };
}