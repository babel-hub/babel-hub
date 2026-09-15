import { useState, useEffect } from "react";
import type { StudentDailyGrade } from "../../types/types.ts";
import { getStudentDailyGrades } from "../../api";

export const useDailyGrades = (studentId: string, date: string) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [grades, setGrades] = useState<StudentDailyGrade[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        let isMounted = true;

        const getGrades = async () => {
            if (!studentId || !date) return;

            setLoading(true);
            setError(null);
            try {
                const response = await getStudentDailyGrades(studentId, date, controller.signal);
                if (isMounted) setGrades(response);
            } catch (err: any) {
                if (err.name === "CanceledError" || err.name === "AbortError") return;

                console.error(err);
                const backendMessage = err.response?.data?.message
                    || err.response?.data?.error
                    || "Ocurrió un error inesperado al cargar las calificaciones.";

                if (isMounted) setError(backendMessage);
            } finally {
                if (isMounted) setLoading(false);
            }
        }
        getGrades();

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [studentId, date]);

    return { loading, grades, error }
}