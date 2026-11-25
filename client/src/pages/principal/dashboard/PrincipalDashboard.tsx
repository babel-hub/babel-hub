import { usePeriods } from "../../../shared/global/hooks/usePeriods.ts";
import { useScales } from "../../../shared/global/hooks/useScales.ts";
import { PrincipalDashboardLayout } from "../../../features/director/dashboard/components";

export const PrincipalDashboard = () => {
    const {} = usePeriods();
    const {} = useScales();

    return (
        <PrincipalDashboardLayout />
    )
};

export default PrincipalDashboard;