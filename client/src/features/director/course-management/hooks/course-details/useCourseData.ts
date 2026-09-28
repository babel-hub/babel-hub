import { useState, useEffect, useCallback } from "react";
import type { Student, ClassItem } from "../../types";
import axios from "axios";
import { getAttendance, getCourse } from "../../api";

export interface CourseDataProps {
    course: {
        is_active: boolean;
        id: string;
        course_name: string;
        year: string;
        created_at: string;
    };
    students: Student[];
    classes: ClassItem[];
}

interface CourseDailyAttendance {
    student_id: string;
    daily_status: 'absent' | 'late' | 'present' | 'excused' | 'no_data';
}

export const useCourseData = (id: string | undefined, date: string) => {
    const [loading, setLoading] = useState(false);
    const [course, setCourse] = useState<CourseDataProps | null>(null);
    const [attendance, setAttendance] = useState<Record<string, string>>({});
    const [reloadTrigger, setReloadTrigger] = useState(0);

    const refetch = useCallback(() => {
        setReloadTrigger((prev) => prev + 1);
    }, []);

    useEffect(() => {
        if (!id || !date) return;

        const controller = new AbortController();

        const loadData = async () => {
            setLoading(true);
            try {
                const fetchedCourse: CourseDataProps = await getCourse(id, controller);
                setCourse(fetchedCourse);

                const fetchedAttendance: CourseDailyAttendance[] = await getAttendance(id, date, controller);

                const attendanceMap: Record<string, string> = {};

                fetchedCourse.students.forEach(student => {
                    const existingRecord = fetchedAttendance.find((r: any) => r.student_id === student.student_id);
                    attendanceMap[student.student_id] = existingRecord?.daily_status ?? 'no_data';
                });

                setAttendance(attendanceMap);
            } catch (error: any) {
                if (axios.isCancel(error) || error.name === 'AbortError') return;
                console.error("Error loading course and attendance:", error);
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };
        loadData();

        return () => controller.abort();
    }, [id, reloadTrigger]);

    return { loading, course, attendance, refetch };
}