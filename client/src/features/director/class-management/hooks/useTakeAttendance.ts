import { useState, useEffect, useCallback } from "react";
import { getDailyAttendance, saveBulkAttendance } from "../api";
import toast from "react-hot-toast";
import type { AttendanceStatus, Student } from "../../../types/types.ts";

interface TakeAttendanceProps {
    classId: string;
    date: string;
    students: Student[];
}

export const useTakeAttendance = ({ classId, date, students }: TakeAttendanceProps) => {
    const [loading, setLoading] = useState(false);
    const [attendanceDate, setAttendanceDate] = useState(date);
    const [saving, setSaving] = useState(false);
    const [records, setRecords] = useState<Record<string, string>>({});

    useEffect(() => {
        const loadDate = async () => {
            if (!classId || !date || students.length === 0) return;

            setLoading(true);
            try {
                const response = await getDailyAttendance(classId, attendanceDate);
                const newRecordsMap: Record<string, string> = {};


                students.forEach(student => {
                    const existingRecord = response.find((r: any) => r.student_id === student.student_id);
                    newRecordsMap[student?.student_id] = existingRecord?.status ?? 'present';
                });

                setRecords(newRecordsMap)
            } catch (error) {
                console.error("Error GETTING daily attendance", error);
                toast.error("Error al cargar asistencia");
            } finally {
                setLoading(false);
            }
        }
        loadDate()
    }, [classId, attendanceDate]);

    const updateRecords = useCallback((studentId: string, status: AttendanceStatus) => {
        setRecords(prev => ({...prev, [studentId]: status }));
    }, []);

    const saveRecords = async () => {
        setSaving(true);
        try {
            const formattedRecords = Object.entries(records).map(([id, status]) => ({ studentId: id, status }));
            await saveBulkAttendance(classId, attendanceDate, formattedRecords);
            toast.success("Asistencia guardada correctamente.");
        } catch (error) {
            console.error("Error SENDING the attendance", error);
            toast.error("Error al guardar la asistencia");
        } finally {
            setSaving(false);
        }
    };

    return {
        attendanceDate,
        setAttendanceDate,
        saving,
        records,
        loading,
        saveRecords,
        updateRecords,
    }
}