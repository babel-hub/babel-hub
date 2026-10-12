import { ValidationError } from "../../errors/domain/CustomErrors.js";

export function validateWeight(weight: number): void {
    if (typeof weight !== 'number' || Number.isNaN(weight)) {
        throw new ValidationError("El peso debe ser un número válido");
    }
    if (weight < 0 || weight > 100) {
        throw new ValidationError("El peso debe estar entre 0 y 100");
    }
}