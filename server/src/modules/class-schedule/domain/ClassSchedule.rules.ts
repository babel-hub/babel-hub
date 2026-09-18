import { ValidationError } from "../../errors/domain/CustomErrors.js";

export function validateTimeRange(startTime: string, endTime: string): void {
    if (!startTime || !endTime) return;

    if (startTime >= endTime) {
        throw new ValidationError("La hora de fin debe ser mayor a la hora de inicio");
    }
}