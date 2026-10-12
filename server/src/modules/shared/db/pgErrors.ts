const UNIQUE_MESSAGES: Record<string, string> = {
    'profile_email_key':                         'Ya existe un usuario con ese correo electrónico',
    'profile_user_name_key':                     'Ese nombre de usuario ya está en uso',
    'profile_user_name_school_id_key':           'Ese nombre de usuario ya está en uso en este colegio',
    'profile_auth_profile_id_key':               'Este usuario ya fue registrado',
    'profile_phone_unique':                      'Ese numero telefonico ya esta en uso',

    'student_enrollment_code_key':               'Ese código de matrícula ya está en uso',
    'student_course_id_enrollment_code_key':     'Ese código de matrícula ya está en uso en este curso',

    'parent_student_parent_id_student_id_key':   'Este acudiente ya está vinculado a este estudiante',

    'course_teacher_id_key':                     'Este profesor ya dirige otro curso',

    'school_name_key':                           'Ya existe un colegio con ese nombre',
};

export function pgUniqueMessage(constraint: string | undefined): string {
    if (!constraint) return 'Ya existe un registro con esos datos';
    return UNIQUE_MESSAGES[constraint] ?? 'Ya existe un registro con esos datos';
}