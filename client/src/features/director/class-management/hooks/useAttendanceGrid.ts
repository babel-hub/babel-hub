import { useState, useEffect } from "react";
import {getAttendanceClass} from "../api";
import toast from "react-hot-toast";
import type { CourseAttendance, StudentPeriodAttendance } from "../../../types/types";

interface AttendanceGridProps {
    courseId: string,
    classId: string,
    students: number,
    startDate: string,
    endDate: string
}

export const useAttendanceGrid = ({ courseId, classId, students, startDate, endDate }: AttendanceGridProps) => {
    const [loading, setLoading] = useState(false);
    const [attendance, setAttendance] = useState<StudentPeriodAttendance[]>([]);
    const [calendar, setCalendar] = useState<string[]>([]);

    useEffect(() => {
        const controller = new AbortController();
        let isMounted = true;

        const showAttendance = async () => {
            if (!startDate || !endDate || students === 0) return;

            const today = new Date();
            const periodStart = new Date(startDate);

            if (today < periodStart) {
                setAttendance([]);
                setCalendar([]);
                return;
            }
            const todayStr = today.toISOString().split('T')[0];
            const periodEndStr = endDate.split('T')[0];
            const effectiveEndDate = todayStr < periodEndStr ? todayStr : periodEndStr;

            setLoading(true);
            try {
                const response = await getAttendanceClass(courseId, classId, startDate, effectiveEndDate, controller.signal);
                const data = response.attendanceClass;

                const datesSet = new Set<string>();
                const studentMap = new Map<string, StudentPeriodAttendance>();

                data.forEach((row: CourseAttendance) => {
                    const dateKey = row.date.split('T')[0];
                    datesSet.add(dateKey);

                    if (!studentMap.has(row.student_id)) {
                        studentMap.set(row.student_id, {
                            student_id: row.student_id,
                            firstName: row.student_first_name,
                            middleName: row.student_middle_name,
                            firstLastName: row.student_first_last_name,
                            secondLastName: row.student_second_last_name,
                            records: []
                        });
                    }
                    studentMap.get(row.student_id)!.records.push({
                        date: dateKey,
                        status: row.status
                    });
                });

                if (isMounted) {
                    setCalendar(Array.from(datesSet).sort());
                    setAttendance(Array.from(studentMap.values()));
                }
            } catch (error: any) {
                if (error.name === "CanceledError" || error.name === "AbortError") return;

                console.error("Error GETTING calendar", error);
                if (isMounted) toast.error("Error al cargar el calendario");
            } finally {
                if (isMounted) setLoading(false);
            }
        }
        showAttendance();

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [courseId, classId, startDate, endDate, students]);

    return {
        loading,
        calendar,
        attendance,
    }
}