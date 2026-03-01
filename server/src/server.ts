import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import attendanceRoutes from "./routes/attendance.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";
import gradesRoutes from "./routes/grades.routes.js";
import accessRoleRoutes from "./routes/access.role.routes.js";
import principalRoutes from "./routes/principal.routes.js";
import teacherRoutes from "./routes/teacher.routes.js";
import studentRoutes from "./routes/student.routes.js";
import SchoolRoutes from "./routes/school.routes.js";
import { defaultLimiter } from "./middleware/ratelimit.middleware.js";
import healthcheckRoutes from "./routes/healthcheck.routes.js";
import coursesRoutes from "./routes/courses.routes.js";
import classesRoutes from "./routes/classes.routes.js";
import subjectsRoutes from "./routes/subjects.routes.js";
import areasRoutes from "./routes/areas.routes.js";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(defaultLimiter);

app.use("/healthcheck", healthcheckRoutes);

//CRUD of attendance and grades
app.use("/attendance", attendanceRoutes);
app.use("/grades", gradesRoutes);

//GET current user info
app.use("/user", accessRoleRoutes);

//CRUD principals, teachers and community
app.use("/principal", principalRoutes);
app.use("/teacher", teacherRoutes);
app.use("/student", studentRoutes);

//CRUD courses and schools
app.use("/school", SchoolRoutes);
app.use("/courses", coursesRoutes);
app.use("/classes", classesRoutes);
app.use("/subjects", subjectsRoutes);
app.use("/areas", areasRoutes);


app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
})
