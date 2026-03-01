import { useNavigate } from "react-router-dom";
import ListData from "../../../components/List.tsx";

function Community () {
    const navigate = useNavigate();

    const listItems = [
        { label: "Estudiantes", onClick: () => navigate("/principal/comunidad/estudiantes") },
        { label: "Profesores", onClick: () => navigate("/principal/comunidad/profesores") }
    ]

    return (
        <div>
            <ListData
                data={listItems}
            />
        </div>
    );
}

export default Community;