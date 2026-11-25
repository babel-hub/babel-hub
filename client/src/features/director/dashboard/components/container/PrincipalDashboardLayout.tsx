import { usePrincipalDashboard } from "../../hooks/usePrincipalDashboard.ts";

export function PrincipalDashboardLayout() {
    const { dashboard } =  usePrincipalDashboard()

    console.log(JSON.stringify(dashboard, null, 2));
    return (
        <></>
    )
}