import { useEffect, useState } from "react";
// import { getAccumulatedData } from "../../api";
import {MOCK_ACCUMULATED, type SubjectAccumulated} from "../../types/types.ts";

export const useAccumulatedGrades = (
    studentId: string,
    classId: string,
    subjectName: string,
) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [accumulatedGrades, setAccumulatedGrades] = useState<SubjectAccumulated | null>(null);

    useEffect(() => {
        if (!studentId || !classId || !subjectName) {
            setAccumulatedGrades(null);
            setError(null);
            setLoading(false);
            return;
        }

        const controller = new AbortController();
        let cancelled = false;

        (async () => {
            setLoading(true);
            setError(null);
            try {
                // await getAccumulatedData(studentId, classId, subjectName, controller)
                const data = MOCK_ACCUMULATED;
                if (!cancelled) setAccumulatedGrades(data);
            } catch (err: any) {
                if (cancelled || err.name === "CanceledError" || err.name === "AbortError") return;
                const backendMessage =
                    err.response?.data?.message ||
                    err.response?.data?.error ||
                    "Ocurrió un error inesperado al cargar las calificaciones.";
                setError(backendMessage);
                setAccumulatedGrades(null);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
            controller.abort();
        };
    }, [studentId, classId, subjectName]);

    return { loading, accumulatedGrades, error };
};