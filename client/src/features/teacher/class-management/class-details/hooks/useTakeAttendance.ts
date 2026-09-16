import { useState, useEffect, useCallback } from "react";
import { bulkAttendance, getDailyAttendance } from "../api";
import toast from "react-hot-toast";
import type { AttendanceStatus, Student } from "../../../../types/types.ts";

interface TakeAttendanceProps {
    classId: string;
    date: string;
    students: Student[];
}

export const useTakeAttendance = ({classId, date, students}: TakeAttendanceProps) => {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [dailyAttendance, setDailyAttendance] = useState<Record<string, string>>({});

    useEffect(() => {
        const controller = new AbortController();
        let isMounted = true;

        const getAttendance = async () => {
            if (!classId || !date || students.length === 0) return;

            setLoading(true);
            try {
                const rawAttendance = await getDailyAttendance(classId, date, controller.signal);

                const attendance: Record<string, string> = {};

                students.map((student: Student) => {
                    const studentItem = rawAttendance.find((s: any) => s.student_id === student.student_id);
                    attendance[student.student_id] = studentItem?.status ?? 'present';
                });

                if (isMounted) setDailyAttendance(attendance);
            } catch (error: any) {
                if (error.name === "CanceledError" || error.name === "AbortError") return;

                console.error("Error GETTING daily attendance", error);
                if (isMounted) toast.error("Error al cargar asistencia");
            } finally {
                if (isMounted) setLoading(false);
            }
        }
        getAttendance();

        return () => {
            isMounted = false;
            controller.abort();
        }
    }, [classId, date, students.length]);

    const handleUpdateStatus = useCallback((studentId: string, status: AttendanceStatus) => {
        setDailyAttendance(prev => ({...prev, [studentId]: status }));
    }, []);

    const bulkAttendanceClass = async () => {
        if (!classId || !date || students.length === 0) return;

        setSaving(true);
        try {
            const formattedRecords = Object.entries(dailyAttendance).map(([id, status]) => ({ studentId: id, status }));
            await bulkAttendance(classId, date, formattedRecords);
            toast.success("Asistencia guardada correctamente.");
        } catch (error: any) {
            console.error("Error SENDING the attendance", error);
            toast.error("Error al guardar la asistencia");
        } finally {
            setSaving(false);
        }
    }

    return { loading, saving, bulkAttendanceClass, handleUpdateStatus, dailyAttendance };
}