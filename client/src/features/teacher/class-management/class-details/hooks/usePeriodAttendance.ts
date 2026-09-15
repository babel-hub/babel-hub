import { useState, useEffect } from "react";
import { getPeriodAttendance } from "../api";
import toast from "react-hot-toast";
import type { CourseAttendance, StudentPeriodAttendance } from "../../../../types/types.ts";
import { formatterDate } from "../../../../../types";

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
        const controller = new AbortController();
        let isMounted = true;

        const loadPeriodAttendance = async () => {
            if (!courseId || !classId || !startDate || !endDate) return;

            const todayStr = formatterDate.format(new Date());
            const periodStartStr = startDate.split('T')[0];
            const periodEndStr = endDate.split('T')[0];

            if (todayStr < periodStartStr) {
                setPeriodAttendance([]);
                setCalendarDates([]);
                return;
            }

            const effectiveEndDate = todayStr < periodEndStr ? todayStr : periodEndStr;

            setLoading(true);
            try {
                const attendance: CourseAttendance[] = await getPeriodAttendance(
                    courseId,
                    classId,
                    startDate,
                    effectiveEndDate,
                    controller.signal
                );

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

                if (isMounted) {
                    setCalendarDates(Array.from(dates).sort((a, b) => new Date(a).getTime() - new Date(b).getTime()));
                    setPeriodAttendance(Array.from(studentMap.values()));
                }
            } catch (error: any) {
                if (error.name === "CanceledError" || error.name === "AbortError") return;

                console.error("Error GETTING the caledar ", error);

                if (isMounted) {
                    toast.error("Error al cargar el calendario");
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        loadPeriodAttendance();

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [courseId, classId, startDate, endDate]);

    return { loading, periodAttendance, calendarDates };
}