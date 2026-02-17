import { useAuth } from "../../auth/useAuth.ts";
import Home from "../../components/Home.tsx";

export const PrincipalLayout = () => {
    const user = useAuth((state) => state.user);

    const gridItems = [
        { id: "1", icon: "", path:"/principal", label: "Dashboard" },
        { id: "2", icon: "", path:"/unknow", label: "Calendario" },
        { id: "3", icon: "", path:"/principal/classes", label: "Cursos" },
        { id: "4", icon: "", path:"/principal/teachers", label: "Profesores" },
        { id: "5", icon: "", path:"/principal/students", label: "Estudiantes" },
        { id: "6", icon: "", path:"/unknow", label: "Acudientes" },
        { id: "7", icon: "", path:"/unknow", label: "Formatos" },
        { id: "8", icon: "", path:"/unknow", label: "Mensajes" }
    ]

    return (
        <Home user={user} grid={gridItems}/>
    )
};

export default PrincipalLayout;