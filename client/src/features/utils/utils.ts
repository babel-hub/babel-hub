import type { GradeScale } from "../../types";

// Domingo, 13 de septiembre
export function formatDayLabel(dateStr: string): string {
    const date = new Date(`${dateStr}T00:00:00`);
    const formatted = date.toLocaleDateString('es-CO', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

// 4:13 p. m.
export function formatTime(isoStr: string): string {
    return new Date(isoStr).toLocaleTimeString('es-CO', {
        hour: 'numeric',
        minute: '2-digit',
    });
}

// 18th August 2026
export function formatFullDateString(date: string) {
    return  new Date(date).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// 18 - AUG - MON
export const formatDateParts = (dateString: string) => {
    const date = new Date(dateString);
    return {
        dayNum: date.getUTCDate(),
        month: date.toLocaleString('es-CO', { month: 'short', timeZone: 'UTC' }).toUpperCase(),
        weekday: date.toLocaleString('es-CO', { weekday: 'short', timeZone: 'UTC' }).toUpperCase()
    };
};

// August 1 - 30 2026 or Jan 1 - Mar 5 2026
export const formatDatePeriod = (startDateStr: string, endDateStr: string) => {
    if (!startDateStr || !endDateStr) return '';

    const start = new Date(startDateStr);
    const end = new Date(endDateStr);

    const startDay = start.getDate();
    const endDay = end.getDate();

    const startMonth = start.toLocaleString('es-CO', { month: 'long' });
    const endMonth = end.toLocaleString('es-CO', { month: 'long' });

    const startYear = start.getFullYear();
    const endYear = end.getFullYear();

    const cap = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

    if (startMonth === endMonth && startYear === endYear) {
        return `${cap(startMonth)} ${startDay} - ${endDay}, ${startYear}`;
    }

    if (startYear === endYear) {
        return `${cap(startMonth)} ${startDay} - ${cap(endMonth)} ${endDay}, ${startYear}`;
    }

    return `${cap(startMonth)} ${startDay}, ${startYear} - ${cap(endMonth)} ${endDay}, ${endYear}`;
};

export const getStatusDotColor = (status: string) => {
    switch(status) {
        case 'absent': return 'bg-red-500 border-red-500';
        case 'late': return 'bg-yellow-400 border-yellow-400';
        case 'present': return 'bg-green-500 border-green-500';
        case 'excused': return 'bg-blue-500 border-blue-500';
        default: return 'bg-gray-300 border-gray-300';
    }
}

export function toneBg(value: number | null | undefined, scale: GradeScale): string {
    if (value === null || value === undefined || Number.isNaN(value) || typeof value !== "number") {
        return 'bg-gray-100';
    }

    if (value < scale.passing) return 'bg-red-500';

    const passingRange = scale.max - scale.passing;

    if (passingRange <= 0) return 'bg-emerald-500';

    const ratio = (value - scale.passing) / passingRange;

    if (ratio >= 0.75) return 'bg-emerald-500';
    if (ratio >= 0.33) return 'bg-lime-500';

    return 'bg-amber-300';
}