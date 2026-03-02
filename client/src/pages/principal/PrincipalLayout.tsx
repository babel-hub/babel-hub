import { useAuth } from "../../auth/useAuth.ts";
import Home from "../../components/Home.tsx";
import {
    BiSolidDashboard,
    BiCalendar,
    BiBookBookmark,
    BiBell,
    BiGroup,
    BiUserVoice,
    BiFile,
    BiMessageDetail
} from "react-icons/bi";

export const PrincipalLayout = () => {
    const user = useAuth((state) => state.user);

    const gridItems = [
        { id: "1", icon: <BiSolidDashboard />, path: "/principal/dashboard", label: "Dashboard" },
        { id: "2", icon: <BiCalendar />, path: "/unknow", label: "Calendario" },
        { id: "3", icon: <BiBookBookmark />, path: "/principal/cursos", label: "Cursos" },
        { id: "4", icon: <BiBell />, path: "/unknow", label: "Notificaciones" },
        { id: "5", icon: <BiGroup />, path: "/principal/comunidad", label: "Comunidad" },
        { id: "6", icon: <BiUserVoice />, path: "/unknow", label: "Acudientes" },
        { id: "7", icon: <BiFile />, path: "/principal/formatos", label: "Formatos" },
        { id: "8", icon: <BiMessageDetail />, path: "/unknow", label: "Mensajes" }
    ];

    return (
        <Home user={user} grid={gridItems}/>
    )
};

export default PrincipalLayout;