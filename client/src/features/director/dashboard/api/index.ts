import api from "../../../../api/client.ts";
import type { PrincipalDashboardData } from "../types/types.ts";

export const getPrincipalDashboard = async (signal?: AbortSignal): Promise<PrincipalDashboardData> => {
    const response = await api.get(`/principal/dashboard`, { signal });
    return response.data.dashboard;
}