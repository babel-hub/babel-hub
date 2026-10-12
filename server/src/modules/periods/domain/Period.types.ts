export interface Period {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    is_current: boolean
}

export interface CreatePeriodPayload {
    periodName: string;
    startDate: string;
    endDate: string;
}

export interface UpdatePeriodPayload extends CreatePeriodPayload {
    periodId: string;
}