import { useAuth } from "../../auth/useAuth.ts";
import Home from "../../components/Home.tsx";
import {
    BiSolidDashboard,
    BiCalendar,
    BiBookBookmark,
    BiBell,
    BiMessageDetail
} from "react-icons/bi";

export const TeacherLayout = () => {
    const user = useAuth((state) => state.user);

    const gridItems = [
        { id: "1", icon: <BiSolidDashboard />, path: "/teacher/dashboard", label: "Dashboard" },
        { id: "2", icon: <BiCalendar />, path: "/teacher/calendar", label: "Calendario" },
        { id: "3", icon: <BiBookBookmark />, path: "/teacher/clases", label: "Clases" },
        { id: "4", icon: <BiBell />, path: "/unknow", label: "Notificaciones" },
        { id: "5", icon: <BiMessageDetail />, path: "/unknow", label: "Mensajes" }
    ];

    return (
        <Home user={user} grid={gridItems}/>
    )
};

export default TeacherLayout;