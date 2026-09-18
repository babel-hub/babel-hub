import { globalErrorHandler } from "./middleware/error.middleware.js";
import { defaultLimiter } from "./middleware/ratelimit.middleware.js";

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import areaRoutes from "./modules/areas/infrastructure/area.routes.js";
import periodRoutes from "./modules/periods/infrastructure/period.routes.js";
import subjectRoutes from "./modules/subjects/infrastructure/subject.routes.js";
import teacherRoutes from "./modules/teacher/infrastructure/teacher.routes.js";
import studentRoutes from "./modules/student/infrastructure/student.routes.js";
import coursesRoutes from "./modules/courses/infrastructure/course.routes.js";
import classesRoutes from "./modules/classes/infrastructure/class.routes.js";
import principalRoutes from "./modules/principal/infrastructure/principal.routes.js";
import attendanceRoutes from "./modules/attendance/infrastructure/attendance.routes.js";
import SchoolRoutes from "./modules/school/infrastructure/school.routes.js";
import userRoutes from "./modules/user/infrastucture/user.routes.js";
import gradingTemplateRoutes from "./modules/gradingTemplate/infrastructure/gradingTemplate.routes.js";
import assessmentRouter from "./modules/assessmentCriteria/infrastructure/assessment.router.js";
import scaleRoutes from "./modules/scales/infrastructure/scale.routes.js";
import assignmentRoutes from "./modules/assignments/infrastructure/assignment.routes.js";
import gradeRoutes from "./modules/grade/infrastructure/grade.routes.js";
import parentRoutes from "./modules/parent/infrastructure/parent.routes.js";
import classScheduleRoutes from "./modules/class-schedule/infrastructure/classSchedule.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.set("trust proxy", 1);
app.use(defaultLimiter);

app.use("/healthcheck", (req, res, next) => {
    res.status(200).json({ message: 'OK' })
});

//CRUD of attendance and grades
app.use("/attendance", attendanceRoutes);

//GET current user info
app.use("/user", userRoutes);

//CRUD principals, teachers and community
app.use("/principal", principalRoutes);
app.use("/teacher", teacherRoutes);
app.use("/student", studentRoutes);
app.use("/parents", parentRoutes);

//CRUD courses and schools
app.use("/school", SchoolRoutes);
app.use("/courses", coursesRoutes);
app.use("/classes", classesRoutes);
app.use("/subjects", subjectRoutes);
app.use("/areas", areaRoutes);
app.use("/periods", periodRoutes);
app.use("/grading_templates", gradingTemplateRoutes);
app.use("/assessments", assessmentRouter);
app.use("/scales", scaleRoutes);
app.use("/assignments", assignmentRoutes);
app.use("/grades", gradeRoutes);
app.use("/class-schedule", classScheduleRoutes)

app.use(globalErrorHandler);

app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
})