import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Rocket,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  BarChart3,
  UserCheck,
  AlertCircle,
  ArrowRight,
  Loader2,
  Zap
} from "lucide-react";
import "./AdminLogin.css";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "", global: "" });
  const [loading, setLoading] = useState(false);

  // ── handlers ──────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({ email: "", password: "", global: "" });

    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
    if (!email.trim())
      return setErrors((p) => ({ ...p, email: "Email is required" }));
    if (!emailRegex.test(email.trim()))
      return setErrors((p) => ({ ...p, email: "Please enter a valid email address format" }));
    if (!password)
      return setErrors((p) => ({ ...p, password: "Password is required" }));
    if (password.length < 6)
      return setErrors((p) => ({ ...p, password: "Password must be at least 6 characters" }));

    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim(), password: password.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors((p) => ({ ...p, global: data.message || "Login failed" }));
        return;
      }

      if (data.token) {
        localStorage.setItem("adminToken", data.token);
        window.location.href = "/admin/dashboard";
      } else {
        setErrors((p) => ({ ...p, global: "Unexpected server response" }));
      }
    } catch (err) {
      setErrors((p) => ({ ...p, global: "Unable to reach server. Please ensure the backend is running." }));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (errors.email || errors.global) setErrors((p) => ({ ...p, email: "", global: "" }));
  };
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (errors.password || errors.global) setErrors((p) => ({ ...p, password: "", global: "" }));
  };

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="admin-login-layout">

      {/* ── LEFT PANEL ─────────────────────────────────────────────────── */}
      <div className="admin-login-left">
        <div className="admin-login-bg-grid"></div>

        <div className="admin-login-left-content">
          {/* Logo */}
          <Link to="/" className="admin-login-brand" aria-label="Return to PlaceReady home">
            <div className="admin-login-brand-icon"><Rocket size={20} strokeWidth={2.5} /></div>
            <span className="admin-login-brand-text">PlaceReady</span>
          </Link>

          {/* Headline */}
          <h1 className="admin-login-headline">
            Admin Control<br />
            <span className="admin-login-gold">Center</span>
          </h1>
          <p className="admin-login-desc" style={{ marginBottom: "24px" }}>
            Restricted Access<br />
            Authorized Personnel Only
          </p>

          {/* Divider */}
          <div style={{ height: "1px", background: "rgba(255,255,255,0.1)", margin: "0 0 32px 0", maxWidth: "400px" }}></div>

          {/* Feature Cards */}
          <div className="admin-login-features">
            <div className="admin-login-feature-card">
              <div className="admin-login-feature-icon"><ShieldCheck size={20} strokeWidth={2} /></div>
              <div className="admin-login-feature-text">
                <span className="admin-login-feature-title">Verified Companies</span>
                <span className="admin-login-feature-desc">Approve and manage company registrations.</span>
              </div>
            </div>
            <div className="admin-login-feature-card">
              <div className="admin-login-feature-icon"><BarChart3 size={20} strokeWidth={2} /></div>
              <div className="admin-login-feature-text">
                <span className="admin-login-feature-title">Student Verification</span>
                <span className="admin-login-feature-desc">Review and verify student profiles.</span>
              </div>
            </div>
            <div className="admin-login-feature-card">
              <div className="admin-login-feature-icon"><UserCheck size={20} strokeWidth={2} /></div>
              <div className="admin-login-feature-text">
                <span className="admin-login-feature-title">Platform Monitoring</span>
                <span className="admin-login-feature-desc">Handle reports, complaints and platform activity.</span>
              </div>
            </div>
          </div>

          {/* Premium bottom-right illustration */}
          <div className="admin-login-illustration">

            {/* Main dashboard card */}
            <div className="admin-illus-card floating-slow">
              {/* Card header */}
              <div className="admin-illus-card-header">
                <div className="admin-illus-avatar">
                  <BarChart3 size={14} color="#D4A017" strokeWidth={2.5} />
                </div>
                <div className="admin-illus-profile-lines">
                  <div className="admin-illus-line wide"></div>
                  <div className="admin-illus-line narrow"></div>
                </div>
                <div className="admin-illus-verified-dot badge-pulse-anim"></div>
              </div>

              {/* Admin Analytics Overview */}
              <div className="admin-illus-score-section">
                <div className="admin-illus-score-row" style={{ marginBottom: "12px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "8px" }}>
                  <span className="admin-illus-score-label" style={{ color: "#FFFFFF", fontSize: "12px" }}>Platform Overview</span>
                </div>
                
                <div className="admin-illus-score-row">
                  <span className="admin-illus-score-label">Companies</span>
                  <span className="admin-illus-score-value">125</span>
                </div>
                
                <div className="admin-illus-score-row">
                  <span className="admin-illus-score-label">Students</span>
                  <span className="admin-illus-score-value">520</span>
                </div>
                
                <div className="admin-illus-score-row">
                  <span className="admin-illus-score-label">Applications</span>
                  <span className="admin-illus-score-value">980</span>
                </div>
                
                <div className="admin-illus-score-row" style={{ marginTop: "4px" }}>
                  <span className="admin-illus-score-label">Pending</span>
                  <span className="admin-illus-score-value" style={{ color: "#EF4444" }}>12</span>
                </div>
              </div>
            </div>

            {/* Thin connector line */}
            <div className="admin-illus-connector">
              <div className="admin-illus-connector-line line-glow"></div>
              <div className="admin-illus-connector-dot"></div>
            </div>

            {/* Floating platform status chip */}
            <div className="admin-illus-chip floating-fast">
              <div className="admin-illus-chip-logo" style={{ background: "rgba(16, 185, 129, 0.1)", borderColor: "rgba(16, 185, 129, 0.2)" }}>
                <ShieldCheck size={13} strokeWidth={2.5} color="#10B981" />
              </div>
              <div className="admin-illus-chip-body">
                <span className="admin-illus-chip-name">System Status</span>
                <span className="admin-illus-chip-match" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }}></div>
                  Secure
                </span>
              </div>
            </div>

          </div>

        </div>

        <div className="admin-login-left-footer">
          © {new Date().getFullYear()} PlaceReady
        </div>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────────────────────── */}
      <div className="admin-login-right">
        <div className="admin-login-form-container">

          {/* Eyebrow badge */}
          <div className="admin-login-form-badge">
            <Zap size={14} fill="#D4A017" color="#D4A017" />
            Admin Access
          </div>

          <h1 className="admin-login-form-title">Admin Login</h1>
          <p className="admin-login-form-subtitle">
            Sign in to access the Admin Control Center.
          </p>

          {/* Global error */}
          {errors.global && (
            <div className="admin-login-global-error">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{errors.global}</span>
            </div>
          )}

          <form className="admin-login-form-fields" onSubmit={handleSubmit} noValidate>

            {/* Email */}
            <div className="admin-login-field-group">
              <label className="admin-login-field-label" htmlFor="admin-email">Email</label>
              <div className="admin-login-input-container">
                <span className="admin-login-input-icon"><Mail size={20} strokeWidth={1.5} /></span>
                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  className={`admin-login-form-input ${errors.email ? "has-error" : ""}`}
                  placeholder="admin@placeready.com"
                  value={email}
                  onChange={handleEmailChange}
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="admin-login-field-error">
                  <AlertCircle size={14} />{errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="admin-login-field-group">
              <div className="admin-login-label-row">
                <label className="admin-login-field-label" htmlFor="admin-password">Password</label>
              </div>
              <div className="admin-login-input-container">
                <span className="admin-login-input-icon"><Lock size={20} strokeWidth={1.5} /></span>
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className={`admin-login-form-input ${errors.password ? "has-error" : ""}`}
                  placeholder="••••••••"
                  value={password}
                  onChange={handlePasswordChange}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="admin-login-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="admin-login-field-error">
                  <AlertCircle size={14} />{errors.password}
                </p>
              )}
            </div>
            
            {/* Remember Me / Forgot Password */}
            <div className="admin-login-label-row" style={{ marginTop: "-8px" }}>
              <label className="admin-login-field-label" style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px", fontWeight: 500, color: "#64748B" }}>
                <input type="checkbox" style={{ accentColor: "#D4A017", width: "16px", height: "16px", cursor: "pointer" }} />
                Remember Me
              </label>
              <Link to="/forgot-password" className="admin-login-forgot-link">Forgot Password</Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="admin-login-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <><Loader2 size={22} className="spin" /> Authenticating…</>
              ) : (
                <>Sign in to Admin Panel <ArrowRight size={22} /></>
              )}
            </button>
          </form>

          <div className="admin-login-form-footer">
            <span style={{ fontWeight: 600 }}>PlaceReady Administration System</span><br />
            <span style={{ fontSize: "14px", marginTop: "4px", display: "inline-block" }}>Secure Access</span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminLogin;