export type UserRole = "principal" | "admin" | "teacher" | "student" | null;


export function formateDate(date: string) {
    return  new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}