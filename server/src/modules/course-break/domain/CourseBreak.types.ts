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