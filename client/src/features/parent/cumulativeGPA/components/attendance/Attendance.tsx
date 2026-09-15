import type { Period } from "../../../../../shared/types/types";

interface AttendanceProps {
    studentId: string;
    period: Period;
}

export function Attendance({ studentId, period }: AttendanceProps) {
    console.log(period, studentId);

    return (
        <></>
    )
}