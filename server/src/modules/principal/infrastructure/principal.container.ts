import { studentService } from "../../student/infrastructure/student.container.js";
import { teacherService } from "../../teacher/infrastructure/teacher.container.js";

import { PostgresStudentRepository } from "../../student/infrastructure/PostgresStudentRepository.js";
import { PostgresAttendanceRepository } from "../../attendance/infrastructure/PostgresAttendanceRepository.js";
import { PostgresCoexistenceRepository } from "../../coexistence/infrastructure/PostgresCoexistenceRepository.js";
import { PostgresAnnouncementsRepository } from "../../announcements/infrastructure/PostgresAnnouncementsRepository.js";
import { PostgresCumulativeRepository } from "../../cumulative/infrastructure/PostgresCumulativeRepository.js";
import { PostgresPrincipalRepository } from "./PostgresPrincipalRepository.js";

import { CoexistenceService } from "../../coexistence/application/CoexistenceService.js";
import { AnnouncementService } from "../../announcements/application/AnnouncementService.js";
import { AttendanceService } from "../../attendance/application/AttendanceService.js";
import { CumulativeService } from "../../cumulative/application/CumulativeService.js";
import { PrincipalService } from "../application/PrincipalService.js";
import { PrincipalDashboardService } from "../application/PrincipalDashboardService.js";

const studentRepo = new PostgresStudentRepository();
const attendanceRepo = new PostgresAttendanceRepository();
const coexistenceRepo = new PostgresCoexistenceRepository();
const announcementRepo = new PostgresAnnouncementsRepository();
const cumulativeRepo = new PostgresCumulativeRepository();
const principalRepo = new PostgresPrincipalRepository();

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