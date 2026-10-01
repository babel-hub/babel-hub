import { formatterDate } from "../../../../types";

export const CRITERIA_COLORS = ['#bbd926', '#4426d9', '#6e26d9', '#17C964'];

export function colorForIndex(index: number): string {
    return CRITERIA_COLORS[index % CRITERIA_COLORS.length];
}

export function shiftDay(dateStr: string, offset: number): string {
    const date = new Date(`${dateStr}T00:00:00`);
    date.setDate(date.getDate() + offset);
    return date.toISOString().slice(0, 10);
}

export function isToday(dateStr: string): boolean {
    const today = formatterDate.format(new Date());
    return dateStr === today;
}

export const formatScheduleTime = (timeStr: string) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const dateObj = new Date();
    dateObj.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    return dateObj.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' });
};