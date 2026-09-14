import { formatterDate } from "../../../../types";

export const CRITERIA_COLORS = ['#F5A524', '#F31260', '#F76B15', '#17C964'];

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