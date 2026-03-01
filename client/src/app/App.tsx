import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/auth/login.tsx";
import StudentDashboard from "../pages/student/home.tsx";
import TeacherDashboard from "../pages/teacher/home.tsx";
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

                    <Route path="cursos" element={<PrincipalCourses />} />
                    <Route path="cursos/:id" element={<CourseDetails />} />
                    <Route path="cursos/:courseId/clase/:id" element={<ClassDetails />} />

                    <Route path="comunidad" element={<Community />} />
                    <Route path="comunidad/profesores" element={<ListTeacher />} />
                    <Route path="comunidad/estudiantes" element={<ListStudents />} />
                    <Route path="comunidad/estudiantes/:id" element={<StudentProfile />} />

                    <Route path="formatos" element={<FilesDashboard />} />
                    <Route path="formatos/areas/:areaId" element={<AreaDetails />} />

                </Route>
                <Route
                    path="/student"
                    element={
                        <ProtectedRoute>
                            <StudentDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/teacher"
                    element={
                        <ProtectedRoute>
                            <TeacherDashboard />
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