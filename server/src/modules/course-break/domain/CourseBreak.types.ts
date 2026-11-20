export interface CourseBreakByDate {
    id: string;
    name: string;
    start_time: string;
    end_time: string;
}

export interface GetCourseBreaksByDatePayload {
    courseId: string;
    date: string;
}

export interface CourseBreak {
    id: string;
    course_id: string;
    name: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
}

export interface CreateBreakGroupPayload {
    name: string;
    days: number[];
    start_time: string;
    end_time: string;
}

export interface UpdateBreakGroupPayload {
    ids: string[];
    name: string;
    days: number[];
    start_time: string;
    end_time: string;
}