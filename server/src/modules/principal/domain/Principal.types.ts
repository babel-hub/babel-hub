import type { UserCredentialsForm } from "../../shared/domain/Shared.types.js";

export interface CreatePrincipalPayload extends UserCredentialsForm {}

export interface Alert {
    severity: "error" | "warning" | "info";
    message: string;
    count: number;
}