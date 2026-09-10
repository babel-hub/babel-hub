import type { ParentStudent } from "../../../shared/types/types.ts";

interface AttendanceProps {
    students: ParentStudent[];
    date: string;
}

export function Attendance({ date, students }: AttendanceProps) {
    console.log(date, students);

    return (
        <></>
    )
}