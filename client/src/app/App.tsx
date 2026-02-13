import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/auth/login.tsx";
import StudentDashboard from "../pages/student/home.tsx";
import TeacherDashboard from "../pages/teacher/home.tsx";
import PrincipalDashboard from "../pages/principal/home.tsx";
import ProtectedRoute from "../auth/Route.tsx";
import NotFoundPage from "../pages/misc/notFoundPage.tsx";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={
                        <Navigate to="/login" replace />
                    }
                />

                <Route
                    path="/login"
                    element={
                        <Login />
                    }
                />
                <Route
                    path="/principal"
                    element={
                        <ProtectedRoute>
                            <PrincipalDashboard />
                        </ProtectedRoute>
                    }
                />
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