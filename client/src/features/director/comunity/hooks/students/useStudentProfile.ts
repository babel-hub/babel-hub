import { useState, useEffect } from "react";
import { getStudentById } from "../../api";
import type { StudentProfileData } from "../../types";

export const useStudentProfile = (id: string | undefined, periodId: string, startDate: string, endDate: string) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<StudentProfileData>();
    const [error, setError] = useState<string>("");

    useEffect(() => {
        const loadProfile = async () => {
            if (!id || !periodId || !startDate || !endDate) return;

            setLoading(true);
            try {
                const response = await getStudentById(id, periodId, startDate, endDate);
                setData(response);
            } catch (error: any) {
                const errorMessage =
                    error.response?.data?.message ||
                    error.message ||
                    "Error al cargar el estudiante";

                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        loadProfile();

    }, [id, periodId, startDate, endDate]);

    return { loading, data, error };
};