import { useEffect, useState } from "react";
import type { ClassFinalGrade } from "../../types/types.ts";
import { getStudentGrades } from "../../api";

export const useGrades = (studentId: string, periodId: string) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [grades, setGrades] = useState<ClassFinalGrade[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchGrade = async () => {
            if(!studentId || !periodId) return;

            setLoading(true);
            setError(null);
            try {
                const response = await getStudentGrades(studentId, periodId);
                setGrades(response);
            } catch (error : any) {
                console.error(error);
                const backendMessage = error.response?.data?.message
                    || error.response?.data?.error
                    || "Ocurrió un error inesperado al cargar las calificaciones.";

                setError(backendMessage);
            } finally {
                setLoading(false);
            }
        }
        fetchGrade();
    }, [periodId, studentId]);

    return { loading, grades, error };
}