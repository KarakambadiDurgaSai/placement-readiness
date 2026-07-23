import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRole, isAdmin = false }) => {
  // 🔐 Separate tokens
  const userToken = localStorage.getItem("token");
  const adminToken = localStorage.getItem("adminToken");

  const role = localStorage.getItem("role");

  // =========================
  // ADMIN PROTECTION
  // =========================
  if (isAdmin) {
    if (!adminToken) {
      return <Navigate to="/admin/login" replace />;
    }
    return children;
  }

  // =========================
  // USER PROTECTION
  // =========================
  if (!userToken) {
    return <Navigate to="/login" replace />;
  }

  // Role-based restriction
  if (allowedRole && role !== allowedRole) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;