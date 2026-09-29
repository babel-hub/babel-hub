import { useState, useEffect } from 'react';
import { getAttendanceSummary } from "../api";
import type { AttendanceSummary } from "../types";

interface AttendanceSummaryProps {
    startDate: string;
    endDate: string;
    todayDate: string;
}

export const useAttendanceSummary = ({ startDate, endDate, todayDate }: AttendanceSummaryProps) => {
    const [loading, setLoading] = useState(false);
    const [attendance, setAttendance] = useState<AttendanceSummary[]>([]);

    useEffect(() => {
        const getAttendance = async () => {
            if (!startDate || !endDate || !todayDate) return;

            setLoading(true);
            try {
                const today = new Date();
                const initialDate = new Date(startDate);

                if (today < initialDate) {
                    setAttendance([]);
                    return;
                }

                const todayStr = today.toISOString().split('T')[0];
                const periodEndStr = endDate.split('T')[0] || '';
                const effectiveEndDate = todayStr < periodEndStr ? todayStr : periodEndStr;

                const response = await getAttendanceSummary(startDate, effectiveEndDate, todayDate);
                setAttendance(response);
            } catch (error) {
                console.log("Error GETTING attendance", error);
            } finally {
                setLoading(false);
            }
        }
        getAttendance();
    }, [startDate, endDate]);

    return { loading, attendance };
}