import { useEffect, useState } from "react";
import { getCumulativeGrades} from "../../api";
import type {CumulativeGrades} from "../../types";

export const useCumulativeGrades = (courseId: string, periodId: string) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [grades, setGrades] = useState<CumulativeGrades[]>([]);

    useEffect(() => {
        const getGrades = async () => {
            if (!courseId || !periodId) return;

            setLoading(true);
            setError("");
            try {
                const records = await getCumulativeGrades(courseId, periodId);
                setGrades(records);
            } catch (error : any) {
                const errorMessage = error.message
                    || error.data.message
                    || "Ocurrio un error al cargar las notas";

                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        }
        getGrades();
    }, [courseId, periodId]);

    return { loading, error, grades };
}