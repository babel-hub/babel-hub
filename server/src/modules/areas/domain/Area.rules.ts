import { ValidationError } from "../../errors/domain/CustomErrors.js";

export function validateName(name: string): string {
    if (!name || name.trim() === '' || typeof name !== 'string') {
        throw new ValidationError('El nombre del área no puede estar vacío y debe ser tipo string.');
    }

    return name.trim().toLowerCase();
}