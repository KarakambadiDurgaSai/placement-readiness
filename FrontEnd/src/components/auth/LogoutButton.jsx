import { useNavigate } from "react-router-dom";

const LogoutButton = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  // ❌ hide logout if not student or company
  if (role !== "student" && role !== "company") {
    return null;
  }

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <button
      onClick={logout}
      style={{
        position: "fixed",
        top: "16px",
        right: "16px",
        padding: "10px 14px",
        borderRadius: "8px",
        border: "none",
        background: "#ef4444",
        color: "#fff",
        cursor: "pointer",
        zIndex: 1000,
      }}
    >
      Logout
    </button>
  );
};

export default LogoutButton;
