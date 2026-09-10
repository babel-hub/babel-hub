import type { ParentStudent } from "../../../shared/types/types.ts";

interface GradesProps {
    students: ParentStudent[];
}

export function Grades({ students }: GradesProps) {
    console.log(students);

    return (
        <></>
    )
}