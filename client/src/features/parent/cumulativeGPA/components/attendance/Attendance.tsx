import type { Period } from "../../../../../shared/global/types/types.ts";

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