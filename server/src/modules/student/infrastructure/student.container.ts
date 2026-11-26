import { StudentService } from "../application/StudentService.js";
import { PostgresStudentRepository } from "./PostgresStudentRepository.js";
import { PostgresParentRepository } from "../../parent/infrastructure/PostgresParentRepository.js";
import { PostgresGradeRepository } from "../../grade/infrastructure/PostgresGradeRepository.js";
import { PostgresClassRepository } from "../../classes/infrastructure/PostgresClassRepository.js";
import { PostgresAttendanceRepository } from "../../attendance/infrastructure/PostgresAttendanceRepository.js";

export const studentService = new StudentService(
    new PostgresStudentRepository(),
    new PostgresParentRepository(),
    new PostgresGradeRepository(),
    new PostgresClassRepository(),
    new PostgresAttendanceRepository(),
);