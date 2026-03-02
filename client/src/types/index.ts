export type UserRole = "principal" | "admin" | "teacher" | "student" | null;

export function formateDate(date: string) {
    return  new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

export const getInitials = (name: string) => {
    const names = name.split(" ");
    if (names.length >= 2) return (names[0][0] + (names[1][0] ? names[1][0] : names[0][names[0].length - 1])).toUpperCase();
    return name[0].toUpperCase();
};

export function reverseName(fullName: string, firstNameCount = 2) {
    const parts = fullName.trim().split(/\s+/);
    const firstNames = parts.slice(0, firstNameCount).join(" ");
    const lastNames = parts.slice(firstNameCount).join(" ");

    return `${lastNames} ${firstNames}`.trim();
};

export const formatterDate = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
});