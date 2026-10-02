import { useAuth } from "../../auth/useAuth.ts";
import Home from "../../components/Home.tsx";
import {
    BiSolidDashboard,
    BiCalendar,
    BiBookBookmark,
    BiBell,
    BiGroup,
    BiFile,
} from "react-icons/bi";
import { TbMessages } from "react-icons/tb";

export const PrincipalLayout = () => {
    const user = useAuth((state) => state.user);

    const gridItems = [
        { id: "1", icon: <BiSolidDashboard />, path: "/principal/dashboard", label: "Dashboard" },
        { id: "2", icon: <BiCalendar />, path: "/unknow", label: "Calendario" },
        { id: "3", icon: <BiBookBookmark />, path: "/principal/cursos", label: "Cursos" },
        { id: "4", icon: <BiBell />, path: "/principal/notificaciones", label: "Notificaciones" },
        { id: "5", icon: <BiGroup />, path: "/principal/comunidad", label: "Comunidad" },
        { id: "6", icon: <BiFile />, path: "/principal/formatos", label: "Formatos" },
        { id: "7", icon: <TbMessages />, path: "/principal/comunicados", label: "Comunicados" }
    ];

    return (
        <Home user={user} grid={gridItems}/>
    )
};

export default PrincipalLayout;