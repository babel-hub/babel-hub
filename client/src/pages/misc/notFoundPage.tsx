import { useNavigate } from "react-router-dom";
import errorImage from "../../assets/images/web-page.png";

export default function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-page px-6">
            <div className="max-w-md text-center">
                <img src={errorImage} alt="Page not found" className="w-56 md:w-64 h-auto mx-auto" />

                <h1 className="text-2xl md:text-3xl font-bold text-custom-black mb-4">
                    ¡Ups! Página no encontrada
                </h1>

                <p className="text-gray-500 mb-8 text-base sm:text-lg">
                    Parece que te has perdido. La página que estás buscando no existe o ha sido movida.
                </p>

                <button
                    onClick={() => navigate("/")} // Sends them back to the default route (login or dashboard)
                    className="bg-primary hover:bg-primary-darker text-sm md:text-base cursor-pointer text-white font-semibold py-3 px-8 rounded-xl transition-colors shadow-md"
                >
                    Volver al inicio
                </button>
            </div>
        </div>
    );
}