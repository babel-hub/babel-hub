import type { SeverityLevel } from "../types/types.ts";

const SEVERITY_STYLES: Record<string, string> = {
    low: "bg-gray-100 text-gray-700",
    medium: "bg-yellow-100 text-yellow-700",
    high: "bg-red-100 text-red-700",
};

export function getSeverityStyle(severity: SeverityLevel | string): string {
    if (severity in SEVERITY_STYLES) {
        return SEVERITY_STYLES[severity as SeverityLevel];
    }

    return SEVERITY_STYLES.low;
}