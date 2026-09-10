import { useAuth } from "../../auth/useAuth.ts";
import {
    BiBell,
    BiCalendar,
    BiMessageDetail,
    BiSolidDashboard
} from "react-icons/bi";
import Home from "../../components/Home.tsx";
import { RiApps2Line } from "react-icons/ri";
import { PiListMagnifyingGlassBold } from "react-icons/pi";

export default function ParentLayout() {
    const user = useAuth(state => state.user);

    const gridItems = [
        { id: "1", icon: <BiSolidDashboard />, path: "/parent/dashboard", label: "Dashboard" },
        { id: "2", icon: <BiCalendar />, path: "/unknow", label: "Comunicados" },
        { id: "4", icon: <BiBell />, path: "/unknow", label: "Notificaciones" },
        { id: "5", icon: <BiMessageDetail />, path: "/unknow", label: "Mensajes" },
        { id: "6", icon: <RiApps2Line />, path: "/parent/acumulado", label: "Acumulado" },
        { id: "7", icon: <PiListMagnifyingGlassBold />, path: "/parent/seguimiento-academico", label: "Seguimiento Academico" }
    ];

    return (
        <Home user={user} grid={gridItems}/>
    )
}