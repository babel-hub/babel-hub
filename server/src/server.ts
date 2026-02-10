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
import classRoutes from "./routes/class.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(defaultLimiter);

app.use("/attendance", attendanceRoutes);
app.use("/grades", gradesRoutes);

app.use("/user", accessRoleRoutes);

app.use("/principal", principalRoutes);
app.use("/teacher", teacherRoutes);
app.use("/students", studentRoutes);

app.use("/school", SchoolRoutes);
app.use("/classes", classRoutes);


app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
})
