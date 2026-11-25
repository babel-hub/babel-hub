import { PostgresStudentRepository } from "../../student/infrastructure/PostgresStudentRepository.js";
import { PostgresTeacherRepository } from "../../teacher/infrastructure/PostgresTeacherRepository.js";
import { PostgresParentRepository } from "../../parent/infrastructure/PostgresParentRepository.js";
import { PostgresGradeRepository } from "../../grade/infrastructure/PostgresGradeRepository.js";
import { PostgresClassRepository } from "../../classes/infrastructure/PostgresClassRepository.js";
import { PostgresAttendanceRepository } from "../../attendance/infrastructure/PostgresAttendanceRepository.js";
import { PostgresCoexistenceRepository } from "../../coexistence/infrastructure/PostgresCoexistenceRepository.js";
import { PostgresAnnouncementsRepository } from "../../announcements/infrastructure/PostgresAnnouncementsRepository.js";
import { PostgresCumulativeRepository } from "../../cumulative/infrastructure/PostgresCumulativeRepository.js";
import { PostgresClassScheduleRepository } from "../../class-schedule/infrastructure/PostgresClassScheduleRepository.js";
import { PostgresAssignmentRepository } from "../../assignments/infrastructure/PostgersAssigmentRepository.js";
import { PostgresPrincipalRepository } from "./PostgresPrincipalRepository.js";

import { StudentService } from "../../student/application/StudentService.js";
import { TeacherServices } from "../../teacher/application/TeacherServices.js";
import { CoexistenceService } from "../../coexistence/application/CoexistenceService.js";
import { AnnouncementService } from "../../announcements/application/AnnouncementService.js";
import { AttendanceService } from "../../attendance/application/AttendanceService.js";
import { CumulativeService } from "../../cumulative/application/CumulativeService.js";
import { PrincipalService } from "../application/PrincipalService.js";
import { PrincipalDashboardService } from "../application/PrincipalDashboardService.js";

const studentRepo = new PostgresStudentRepository();
const teacherRepo = new PostgresTeacherRepository();
const parentRepo = new PostgresParentRepository();
const gradeRepo = new PostgresGradeRepository();
const classRepo = new PostgresClassRepository();
const attendanceRepo = new PostgresAttendanceRepository();
const coexistenceRepo = new PostgresCoexistenceRepository();
const announcementRepo = new PostgresAnnouncementsRepository();
const cumulativeRepo = new PostgresCumulativeRepository();
const principalRepo = new PostgresPrincipalRepository();
const classScheduleRepo = new PostgresClassScheduleRepository();
const assignmentRepo = new PostgresAssignmentRepository();

export const studentService = new StudentService(studentRepo, parentRepo, gradeRepo, classRepo, attendanceRepo);
export const teacherService = new TeacherServices(teacherRepo, classScheduleRepo, assignmentRepo, classRepo);
export const coexistenceService = new CoexistenceService(coexistenceRepo);
export const announcementService = new AnnouncementService(announcementRepo);
export const attendanceService = new AttendanceService(attendanceRepo);
export const cumulativeService = new CumulativeService(cumulativeRepo, studentRepo);

export const principalService = new PrincipalService(principalRepo);

export const principalDashboardService = new PrincipalDashboardService(
    studentService,
    teacherService,
    coexistenceService,
    announcementService,
    attendanceService,
    cumulativeService,
);