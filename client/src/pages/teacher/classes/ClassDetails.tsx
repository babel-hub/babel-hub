import { SharedClassDetails } from "../../../shared/class-managment/components/SharedClassDetails.tsx";
import { getTeacherClass } from "../../../shared/class-managment/api";


export default function ClassDetails() {
    return <SharedClassDetails viewMode="teacher" fetcher={getTeacherClass} />;
}