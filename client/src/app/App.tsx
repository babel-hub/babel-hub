import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/auth/login.tsx";
import StudentDashboard from "../pages/student/home.tsx";
import TeacherDashboard from "../pages/teacher/home.tsx";
import PrincipalDashboard from "../pages/principal/PrincipalDashboard.tsx";
import ProtectedRoute from "../auth/Route.tsx";
import NotFoundPage from "../pages/misc/notFoundPage.tsx";
import PrincipalClasses from "../pages/principal/classes/PrincipalClasses.tsx";
import ClassInfo from "../pages/principal/classes/ClassInfo.tsx";
import PrincipalLayout from "../pages/principal/PrincipalLayout.tsx";
import ListStudents from "../pages/principal/students/Students.tsx";
import ListTeacher from "../pages/principal/teachers/Teachers.tsx";

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
                    <Route index element={<PrincipalDashboard />} />
                    <Route path="classes" element={<PrincipalClasses />} />
                    <Route path="classes/:id" element={<ClassInfo />} />
                    <Route path="students" element={<ListStudents />} />
                    <Route path="teachers" element={<ListTeacher />} />
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