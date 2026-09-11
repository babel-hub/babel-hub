import type { Period } from "../../../../../shared/types/types";
import type { ParentStudent } from "../../../shared/types/types.ts";

interface AttendanceProps {
    students: ParentStudent[];
    period: Period;
}

export function Attendance({ students, period }: AttendanceProps) {
    console.log(period, students);

    return (
        <></>
    )
}