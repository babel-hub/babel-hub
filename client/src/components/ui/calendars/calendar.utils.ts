import type {TeacherSchedule} from "./CalendarGrid.tsx";

export const HOUR_HEIGHT = 112;

export const timeToPosition = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const startHour = 5;
    return (hours - startHour) * HOUR_HEIGHT + (minutes / 60) * HOUR_HEIGHT + 1.2;
};

export const normalizeString = (str: string | undefined | null) => {
    if (!str) return "";
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
};

export const getAreaColor = (areaName: string) => {
    const normalized = normalizeString(areaName);

    const defaultColor = { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };

    if (normalized.includes("ciencia")) {
        return { bg: 'bg-[#B9F8CF]', text: 'text-[#159447]', border: 'border-[#159447]/30' };
    }
    if (normalized.includes("proyecto")) {
        return { bg: 'bg-[#FFEECD]', text: 'text-[#634000]', border: 'border-[#634000]/30' };
    }
    if (normalized.includes("ingle") || normalized.includes("english")) {
        return { bg: 'bg-[#FFD9D9]', text: 'text-[#B31D1D]', border: 'border-[#B31D1D]/30' };
    }
    if (normalized.includes("arte")) {
        return { bg: 'bg-[#FEDDFF]', text: 'text-[#780991]', border: 'border-[#780991]/30' };
    }
    if (normalized.includes("espanol") || normalized.includes("castellano") || normalized.includes("lenguaje")) {
        return { bg: 'bg-[#FFD1EB]', text: 'text-[#84114A]', border: 'border-[#84114A]/30' };
    }
    if (normalized.includes("sena")) {
        return { bg: 'bg-[#C7E3FF]', text: 'text-[#0C46A6]', border: 'border-[#0C46A6]/30' };
    }
    if (normalized.includes("religion") || normalized.includes("etica")) {
        return { bg: 'bg-[#C9D0FF]', text: 'text-[#3442B3]', border: 'border-[#3442B3]/30' };
    }
    if (normalized.includes("social")) {
        return { bg: 'bg-[#B8F0E5]', text: 'text-[#027D6B]', border: 'border-[#027D6B]/30' };
    }
    if (normalized.includes("matematica") || normalized.includes("geometria") || normalized.includes("estadistica")) {
        return { bg: 'bg-[#E4DAFF]', text: 'text-[#4900A3]', border: 'border-[#4900A3]/30' };
    }

    return defaultColor;
};

export const calculateOverlaps = (events: TeacherSchedule[]) => {
    const sorted = [...events].sort((a, b) => a.start_time.localeCompare(b.start_time));
    const result: (TeacherSchedule & { col: number; maxCol: number })[] = [];

    let currentCluster: typeof result = [];
    let clusterEnd = "00:00";

    sorted.forEach(event => {
        if (event.start_time >= clusterEnd) {
            currentCluster.forEach(c => c.maxCol = Math.max(...currentCluster.map(x => x.col)) + 1);
            currentCluster = [];
            clusterEnd = event.end_time;
        } else {
            if (event.end_time > clusterEnd) clusterEnd = event.end_time;
        }

        let col = 0;
        while (currentCluster.some(c => c.col === col && c.end_time > event.start_time)) {
            col++;
        }

        const eventWithCols = { ...event, col, maxCol: 1 };
        currentCluster.push(eventWithCols);
        result.push(eventWithCols);
    });

    currentCluster.forEach(c => c.maxCol = Math.max(...currentCluster.map(x => x.col)) + 1);

    return result;
};