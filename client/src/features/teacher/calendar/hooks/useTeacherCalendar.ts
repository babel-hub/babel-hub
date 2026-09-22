import { useState, useEffect } from "react";
import { getTeacherCalendar } from "../api";
import { formatterDate } from "../../../../types";
import type {AssignmentsByTeacherAndDate} from "../types/types.ts";

export const useTeacherCalendar = (teacherId: string, viewingMonth: Date) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [monthActivities, setMonthActivities] = useState<AssignmentsByTeacherAndDate[]>([]);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        const fetchMonthCalendar = async () => {
            if (!teacherId) return;

            const year = viewingMonth.getFullYear();
            const month = viewingMonth.getMonth();
            const startDate = formatterDate.format(new Date(year, month, 1));
            const endDate = formatterDate.format(new Date(year, month + 1, 0));

            setLoading(true);
            try {
                const response = await getTeacherCalendar(teacherId, startDate, endDate);
                setMonthActivities(response);
            } catch (error: any) {
                console.error("Error getting calendar:", error);

                const errorMessage =
                    error.response?.data?.message ||
                    error.message ||
                    "Ocurrió al cargar el calendario";

                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        }
        fetchMonthCalendar();
    }, [teacherId, viewingMonth]);

    return { loading, monthActivities, error };
}