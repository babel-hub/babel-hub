export interface PrincipalForSchool {
    firstName: string;
    middleName: string | null | undefined;
    firstLastName: string;
    secondLastName: string | null | undefined;
    email: string;
    password: string;
}

export interface CreateSchoolPayload {
    schoolName: string;
    principal: PrincipalForSchool;
}