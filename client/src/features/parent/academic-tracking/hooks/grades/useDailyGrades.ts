import { useState, useEffect } from "react";
import type { StudentDailyGrade } from "../../types/types.ts";
import { getStudentDailyGrades } from "../../api";

export const useDailyGrades = (studentId: string, date: string) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [grades, setGrades] = useState<StudentDailyGrade[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const getGrades = async () => {
            if (!studentId || !date) return;

            setLoading(true);
            setError(null);
            try {
                const response = await getStudentDailyGrades(studentId, date);
                setGrades(response);
            } catch (err : any) {
                console.error(err);
                const backendMessage = err.response?.data?.message
                    || err.response?.data?.error
                    || "Ocurrió un error inesperado al cargar las calificaciones.";

                setError(backendMessage);
            } finally {
                setLoading(false);
            }
        }
        getGrades();
    }, [studentId, date]);

    return { loading, grades, error }
}