import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/auth/login.tsx";
import StudentDashboard from "../pages/student/home.tsx";
import TeacherDashboard from "../pages/teacher/dashboard/TeacherDashboard.tsx";
import PrincipalDashboard from "../pages/principal/dashboard/PrincipalDashboard.tsx";
import ProtectedRoute from "../auth/Route.tsx";
import NotFoundPage from "../pages/misc/notFoundPage.tsx";
import PrincipalCourses from "../pages/principal/courses/PrincipalCourses.tsx";
import CourseDetails from "../pages/principal/courses/CourseDetails.tsx";
import PrincipalLayout from "../pages/principal/PrincipalLayout.tsx";
import ListStudents from "../pages/principal/community/students/Students.tsx";
import ListTeacher from "../pages/principal/community/teachers/Teachers.tsx";
import Community from "../pages/principal/community/Community.tsx";
import StudentProfile from "../pages/principal/community/students/StudentProfile.tsx";
import ClassDetails from "../pages/principal/courses/classes/ClassesDetails.tsx";
import FilesDashboard from "../pages/principal/files/FilesDashboard.tsx";
import AreaDetails from "../pages/principal/files/areas/AreaDetails.tsx";
import TeacherDetails from "../pages/principal/community/teachers/TeacherDetails.tsx";
import TeacherLayout from "../pages/teacher/TeacherLayout.tsx";
import TeacherCourses from "../pages/teacher/courses/TeacherCourses.tsx";
import NotificationCenter from "../pages/principal/notifications/NotificationCenter.tsx";
import AttendanceNotification from "../pages/principal/notifications/attendance/AttendanceNotification.tsx";
import TeacherCourseDetails from "../pages/teacher/courses/CourseDetails.tsx";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={ <Navigate to="/login" replace /> } />
                <Route path="/login" element={ <Login /> } />
                <Route
                    path="/principal"
                    element={
                        <ProtectedRoute>
                            <PrincipalLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="dashboard" index element={<PrincipalDashboard />} />

                    <Route path="cursos" element={<PrincipalCourses />}>
                        <Route path=":id" element={<CourseDetails />} />
                        <Route path=":courseId/clase/:id" element={<ClassDetails />} />
                    </Route>

                    <Route path="comunidad" element={<Community />} />
                    <Route path="comunidad/profesores" element={<ListTeacher />} />
                    <Route path="comunidad/profesores/:id" element={<TeacherDetails />} />
                    <Route path="comunidad/estudiantes" element={<ListStudents />} />
                    <Route path="comunidad/estudiantes/:id" element={<StudentProfile />} />

                    <Route path="formatos" element={<FilesDashboard />} />
                    <Route path="formatos/areas/:areaId" element={<AreaDetails />} />

                    <Route path="notificaciones" element={<NotificationCenter />} />
                    <Route path="notificaciones/asistencia" element={<AttendanceNotification />} />

                </Route>

                <Route
                    path="/teacher"
                    element={
                        <ProtectedRoute>
                            <TeacherLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="dashboard" index element={<TeacherDashboard />}/>

                    <Route path="clases" element={<TeacherCourses />}>
                        <Route path=":id" element={<TeacherCourseDetails />}/>
                    </Route>
                </Route>

                <Route
                    path="/student"
                    element={
                        <ProtectedRoute>
                            <StudentDashboard />
                        </ProtectedRoute>
                    }
                />

                { /* Not Found Pages section */ }
                <Route
                    path="*"
                    element={
                        <NotFoundPage />
                    }
                />
            </Routes>
        </BrowserRouter>
    )
}

export default App;