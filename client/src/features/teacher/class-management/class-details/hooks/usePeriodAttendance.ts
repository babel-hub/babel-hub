import { useState, useEffect } from "react";
import { getPeriodAttendance } from "../api";
import toast from "react-hot-toast";
import type { CourseAttendance, StudentPeriodAttendance } from "../../../../types/types.ts";

interface PeriodAttendanceProps {
    courseId: string,
    classId: string,
    startDate: string,
    endDate: string
}

export const usePeriodAttendance = ({ courseId, classId, startDate, endDate }: PeriodAttendanceProps) => {
    const [loading, setLoading] = useState(false);
    const [periodAttendance, setPeriodAttendance] = useState<StudentPeriodAttendance[]>([]);
    const [calendarDates, setCalendarDates] = useState<string[]>([]);

    useEffect(() => {
        const loadPeriodAttendance = async () => {
            if (!courseId || !classId || !startDate || !endDate) return;

            const today = new Date();
            const periodStart = new Date(startDate);

            if (today < periodStart) {
                setPeriodAttendance([]);
                setCalendarDates([]);
                return;
            }

            const todayStr = today.toISOString().split('T')[0];
            const periodEndStr = endDate.split('T')[0];
            const effectiveEndDate = todayStr < periodEndStr ? todayStr : periodEndStr;

            setLoading(true);
            try {
                const attendance: CourseAttendance[] = await getPeriodAttendance(courseId, classId, startDate, effectiveEndDate);

                const dates = new Set<string>();
                const studentMap = new Map<string, StudentPeriodAttendance>();

                attendance.forEach((row: CourseAttendance) => {
                    const dateKey = row.date.split('T')[0];
                    dates.add(dateKey);

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

                setCalendarDates(Array.from(dates).sort((a, b) => new Date(a).getTime() - new Date(b).getTime()));
                setPeriodAttendance(Array.from(studentMap.values()));
            } catch (error : any) {
                console.error("Error GETTING the caledar ", error);
                toast.error("Error al cargar el calendario");
            } finally {
                setLoading(false);
            }
        }
        loadPeriodAttendance();
    }, [courseId, classId, startDate, endDate]);

    return { loading, periodAttendance, calendarDates };
}