import LogOutButton from "../../components/LogOutButton.tsx";
import { useAuth } from "../../auth/useAuth.ts";

export const PrincipalDashboard = () => {
    const user = useAuth((state) => state.user);
    const gridItems = [
        { id: "item-1", icon: "", label: "Dashboard" },
        { id: "item-2", icon: "", label: "Calendario" },
        { id: "item-3", icon: "", label: "Cursos" },
        { id: "item-4", icon: "", label: "Papeleria" },
        { id: "item-5", icon: "", label: "Eventos" },
        { id: "item-6", icon: "", label: "Acudientes" },
        { id: "item-7", icon: "", label: "Formatos" },
        { id: "item-8", icon: "", label: "Mensajes" }
    ]

    return (
        <div className="flex flex-row">
            <div className="border flex-1 max-w-60 p-3 xl:max-w-80 h-full">
                <div className="flex items-center mb-5 justify-between">
                    <div></div>
                    <h1 className="text-custom-black text-base sm:text-lg font-semibold">{user?.role?.toLowerCase()}</h1>
                    <div></div>
                </div>
                <div className="flex items-center mb-5 justify-center">
                    <div>
                        <div className="lg:w-32 mx-auto mb-2 lg:h-32 w-28 h-28 bg-primary-shadow rounded-full"></div>
                        <p className="text-custom-black/60 text-base font-semibold text-center">{user?.name?.split(" ").slice(0,2).join(" ")}</p>
                        <p className="text-custom-black/60 text-sm font-semibold text-center">{user?.email}</p>
                    </div>
                </div>
                <div className="grid mb-5 grid-cols-2 gap-2">
                    {
                        gridItems.map((item) => (
                            <button
                                key={item.id}
                                className="flex items-center cursor-pointer hover:bg-primary-shadow rounded-xl p-5 justify-center flex-col">
                                <div className="w-8 h-8 bg-primary mb-1 rounded-lg"></div>
                                <p className="text-custom-black font-medium text-xs">{item.label}</p>
                            </button>
                        ))
                    }
                </div>
                <LogOutButton />
            </div>
            <div>

            </div>
        </div>
    )
};

export default PrincipalDashboard;