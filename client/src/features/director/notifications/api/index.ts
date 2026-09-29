import api from "../../../../api/client.ts";

export const getAttendanceSummary = async (startDate: string, endDate: string, todayDate: string) => {
    const response = await api.get(`/attendance/summary`, {
        params: {
            startDate: startDate,
            endDate: endDate,
            today: todayDate
        }
    });
    return response.data.attendanceSummary;
}

export const getAttendanceStudentCalendar = async (startDate: string, endDate: string, studentId: string, controller: any) => {
    const response = await api.get(`/attendance/summary/calendar`, {
        signal: controller.signal,
        params: {
            startDate: startDate,
            endDate: endDate,
            studentId: studentId
        }
    });
    return response.data.attendanceByCalendar;
}