import api from "../../../../api/client.ts";

export const getPrincipalDashboard = async (signal?: AbortSignal): Promise<any> => {
    const response = await api.get(`/principal/dashboard`, { signal });
    return response.data.dashboard;
}