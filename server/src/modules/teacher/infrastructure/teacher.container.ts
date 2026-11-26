import { TeacherServices } from "../application/TeacherServices.js";
import { PostgresTeacherRepository } from "./PostgresTeacherRepository.js";
import { PostgresClassScheduleRepository } from "../../class-schedule/infrastructure/PostgresClassScheduleRepository.js";
import { PostgresAssignmentRepository } from "../../assignments/infrastructure/PostgersAssigmentRepository.js";
import { PostgresClassRepository } from "../../classes/infrastructure/PostgresClassRepository.js";

export const teacherService = new TeacherServices (
    new PostgresTeacherRepository(),
    new PostgresClassScheduleRepository(),
    new PostgresAssignmentRepository(),
    new PostgresClassRepository()
)