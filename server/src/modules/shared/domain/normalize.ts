export function normalizeText(value: string): string {
    return value.trim().toLowerCase();
}

export function normalizeOptionalText(value: string | null | undefined): string | null {
    if (value === null || value === undefined) return null;
    const trimmed = value.trim().toLowerCase();
    return trimmed === '' ? null : trimmed;
}

export function nullifyEmpty(value: string | null | undefined): string | null {
    if (value === null || value === undefined) return null;
    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
}