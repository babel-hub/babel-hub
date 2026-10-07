export function normalizeText(value: string): string {
    return value.trim().toLowerCase();
}

export function normalizeOptionalText(value: string | null | undefined): string | null {
    if (value === null || value === undefined) return null;
    const trimmed = value.trim().toLowerCase();
    return trimmed === '' ? null : trimmed;
}

export function nullifyEmpty(value: string | null | string[] | undefined): string | string[] | null {
    if (value === null || value === undefined || value.length === 0) return null;

    if (Array.isArray(value)) {
        return value;
    } else {
        const trimmed = value.trim();
        return trimmed === '' ? null : trimmed;
    }
}