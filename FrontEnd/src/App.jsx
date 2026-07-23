import { Routes, Route } from "react-router-dom";

import LandingPage from "./pages/landing/LandingPage";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

import StudentProfile from "./pages/student/StudentProfile";
import CompanyList from "./pages/student/CompanyList";
import StudentApplications from "./pages/student/StudentApplications";

import CompanyProfile from "./pages/company/CompanyProfile";
import CompanyApplicants from "./pages/company/CompanyApplicants";

// 🔥 ADMIN IMPORTS
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";

import ProtectedRoute from "./routes/ProtectedRoute";

function App() {

return (
<>

  <Routes>
    {/* ================= PUBLIC ROUTES ================= */}
    <Route path="/" element={<LandingPage />} />
    <Route path="/register" element={<Register />} />
    <Route path="/login" element={<Login />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password" element={<ResetPassword />} />

    {/* ================= STUDENT ROUTES ================= */}

    <Route
      path="/student/profile"
      element={
        <ProtectedRoute allowedRole="student">
          <StudentProfile />
        </ProtectedRoute>
      }
    />

    <Route
      path="/student/companies"
      element={
        <ProtectedRoute allowedRole="student">
          <CompanyList />
        </ProtectedRoute>
      }
    />

    <Route
      path="/student/applications"
      element={
        <ProtectedRoute allowedRole="student">
          <StudentApplications />
        </ProtectedRoute>
      }
    />

    {/* ================= COMPANY ROUTES ================= */}
    <Route
      path="/company/profile"
      element={
        <ProtectedRoute allowedRole="company">
          <CompanyProfile />
        </ProtectedRoute>
      }
    />

    <Route
      path="/company/applicants"
      element={
        <ProtectedRoute allowedRole="company">
          <CompanyApplicants />
        </ProtectedRoute>
      }
    />

    {/* ================= ADMIN ROUTES ================= */}
    <Route path="/admin/login" element={<AdminLogin />} />

    <Route
      path="/admin/dashboard"
      element={
        <ProtectedRoute isAdmin={true}>
          <AdminDashboard />
        </ProtectedRoute>
      }
    />
  </Routes>
</>

);
}

export default App;
