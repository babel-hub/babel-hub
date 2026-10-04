import { LuCalendar, LuChartBar, LuClock, LuInfo, LuTriangleAlert } from "react-icons/lu";

export function getStyles(type: string) {
    switch (type) {
        case "GENERAL":
            return { Icon: LuInfo, style: "bg-blue-50 text-blue-700" };
        case "EVENT":
            return { Icon: LuCalendar, style: "bg-purple-50 text-purple-700" };
        case "EMERGENCY":
            return { Icon: LuTriangleAlert, style: "bg-red-50 text-red-700" };
        case "DEADLINE":
            return { Icon: LuClock, style: "bg-orange-50 text-orange-700" };
        case "POLL":
            return { Icon: LuChartBar, style: "bg-teal-50 text-teal-700" };
        default:
            return { Icon: LuInfo, style: "bg-gray-50 text-gray-700" };
    }
}