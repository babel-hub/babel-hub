import { SharedClassDetails } from "../../../../shared/class-managment/components/SharedClassDetails.tsx";
import { getClass } from "../../../../shared/class-managment/api";

export default function ClassesDetails() {
    return <SharedClassDetails viewMode="principal" fetcher={getClass} />;
}