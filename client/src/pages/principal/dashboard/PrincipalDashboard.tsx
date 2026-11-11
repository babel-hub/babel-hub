import { usePeriods } from "../../../shared/global/hooks/usePeriods.ts";
import { useScales } from "../../../shared/global/hooks/useScales.ts";

export const PrincipalDashboard = () => {
    const {} = usePeriods();
    const {} = useScales();

    return (
        <div className="w-full max-h-screen h-full flex items-center justify-center">
            <p className="mt-4 text-lg font-semibold text-custom-black">Dashboard</p>
        </div>
    )
};

export default PrincipalDashboard;