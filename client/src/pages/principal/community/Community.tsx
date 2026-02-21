import { useNavigate } from "react-router-dom";

function Community () {
    const navigate = useNavigate();

    return (
        <div>
            <ul>
                <li className="mb-3">
                    <button
                        onClick={() => navigate("/principal/comunidad/estudiantes")}
                        className="bg-primary-shadow hover:bg-primary hover:text-white transition-colors text-sm sm:text-base cursor-pointer rounded-xl text-primary-darker font-medium w-full p-5 text-left">
                        Estudientes
                    </button>
                </li>
                <li>
                    <button
                        onClick={() => navigate("/principal/comunidad/profesores")}
                        className="bg-primary-shadow hover:bg-primary hover:text-white transition-colors text-sm sm:text-base cursor-pointer rounded-xl text-primary-darker font-medium w-full p-5 text-left">
                        Profesores
                    </button>
                </li>
            </ul>
        </div>
    );
}

export default Community;