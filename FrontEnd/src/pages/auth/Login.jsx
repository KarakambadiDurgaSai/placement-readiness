import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../api/api";
import { useToast } from "../../components/ToastProvider";
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
  Zap,
  CheckCircle2,
  TrendingUp,
  Building2,
} from "lucide-react";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors]     = useState({ email: "", password: "", global: "" });
  const [loading, setLoading]   = useState(false);

  // ── handlers (logic UNCHANGED) ──────────────────────────────────────────
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
      const result = await loginUser({
        email:    email.toLowerCase().trim(),
        password: password.trim(),
      });
      localStorage.setItem("token", result.token);
      localStorage.setItem("role",  result.role);
      toast.success("Welcome back!", "Login successful.");
      if (result.role === "student") navigate("/student/profile");
      if (result.role === "company") navigate("/company/profile");
      if (result.role === "admin")   navigate("/admin/dashboard");
    } catch (err) {
      const msg = err.message?.toLowerCase() || "";
      if (msg.includes("invalid") || msg.includes("credentials") || msg.includes("incorrect") || msg.includes("not found")) {
        setErrors((p) => ({ ...p, email: err.message || "Invalid credentials", password: err.message || "Invalid credentials" }));
      } else if (msg.includes("blocked") || msg.includes("verified")) {
        setErrors((p) => ({ ...p, global: err.message }));
      } else {
        setErrors((p) => ({ ...p, global: err.message || "Login failed. Please try again." }));
      }
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
    <div className="login-layout">

      {/* ── LEFT PANEL ─────────────────────────────────────────────────── */}
      <div className="login-left">
        <div className="login-bg-grid"></div>

        <div className="login-left-content">
          {/* Logo */}
          <Link to="/" className="login-brand" aria-label="Return to PlaceReady home">
            <div className="login-brand-icon"><Rocket size={20} strokeWidth={2.5} /></div>
            <span className="login-brand-text">PlaceReady</span>
          </Link>

          {/* Headline */}
          <h1 className="login-headline">
            Your career,<br />
            <span className="login-gold">intelligently</span><br />
            guided.
          </h1>
          <p className="login-desc">
            Sign in and pick up right where you left off. Your placement journey continues here.
          </p>

          {/* Feature Cards */}
          <div className="login-features">
            <div className="login-feature-card">
              <div className="login-feature-icon"><ShieldCheck size={20} strokeWidth={2} /></div>
              <div className="login-feature-text">
                <span className="login-feature-title">Verified Profiles</span>
                <span className="login-feature-desc">Every profile reviewed by administrators</span>
              </div>
            </div>
            <div className="login-feature-card">
              <div className="login-feature-icon"><BarChart3 size={20} strokeWidth={2} /></div>
              <div className="login-feature-text">
                <span className="login-feature-title">Readiness Score</span>
                <span className="login-feature-desc">Percentile-based fair ranking system</span>
              </div>
            </div>
            <div className="login-feature-card">
              <div className="login-feature-icon"><UserCheck size={20} strokeWidth={2} /></div>
              <div className="login-feature-text">
                <span className="login-feature-title">Smart Matching</span>
                <span className="login-feature-desc">Only eligible students can apply</span>
              </div>
            </div>
          </div>

          {/* Premium bottom-right illustration */}
          <div className="login-illustration">

            {/* Main dashboard card */}
            <div className="illus-card floating-slow">
              {/* Card header */}
              <div className="illus-card-header">
                <div className="illus-avatar">
                  <CheckCircle2 size={14} color="#D4A017" strokeWidth={2.5} />
                </div>
                <div className="illus-profile-lines">
                  <div className="illus-line wide"></div>
                  <div className="illus-line narrow"></div>
                </div>
                <div className="illus-verified-dot badge-pulse-anim"></div>
              </div>

              {/* Readiness score */}
              <div className="illus-score-section">
                <div className="illus-score-row">
                  <span className="illus-score-label">Readiness Score</span>
                  <span className="illus-score-value">92%</span>
                </div>
                <div className="illus-bar-track">
                  <div className="illus-bar-fill gold-fill" style={{ width: "92%" }}></div>
                </div>
              </div>

              {/* Match score */}
              <div className="illus-score-section">
                <div className="illus-score-row">
                  <span className="illus-score-label">Company Match</span>
                  <span className="illus-score-value green">4 Active</span>
                </div>
                <div className="illus-bar-track">
                  <div className="illus-bar-fill green-fill" style={{ width: "65%" }}></div>
                </div>
              </div>
            </div>

            {/* Thin connector line */}
            <div className="illus-connector">
              <div className="illus-connector-line line-glow"></div>
              <div className="illus-connector-dot"></div>
            </div>

            {/* Floating company match chip */}
            <div className="illus-chip floating-fast">
              <div className="illus-chip-logo">
                <Building2 size={13} strokeWidth={2} color="#172742" />
              </div>
              <div className="illus-chip-body">
                <span className="illus-chip-name">TechCorp Pvt. Ltd.</span>
                <span className="illus-chip-match">98% Match</span>
              </div>
            </div>

          </div>

        </div>

        <div className="login-left-footer">
          © {new Date().getFullYear()} PlaceReady Inc.
        </div>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────────────────────── */}
      <div className="login-right">
        <div className="login-form-container">

          {/* Eyebrow badge */}
          <div className="login-form-badge">
            <Zap size={14} fill="#D4A017" color="#D4A017" />
            PlaceReady
          </div>

          <h1 className="login-form-title">Welcome back</h1>
          <p className="login-form-subtitle">
            Sign in to your account to continue your placement journey.
          </p>

          {/* Global error */}
          {errors.global && (
            <div className="login-global-error">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{errors.global}</span>
            </div>
          )}

          <form className="login-form-fields" onSubmit={handleSubmit} noValidate>

            {/* Email */}
            <div className="login-field-group">
              <label className="login-field-label" htmlFor="login-email">Email address</label>
              <div className="login-input-container">
                <span className="login-input-icon"><Mail size={20} strokeWidth={1.5} /></span>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  className={`login-form-input ${errors.email ? "has-error" : ""}`}
                  placeholder="you@example.com"
                  value={email}
                  onChange={handleEmailChange}
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="login-field-error">
                  <AlertCircle size={14} />{errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="login-field-group">
              <div className="login-label-row">
                <label className="login-field-label" htmlFor="login-password">Password</label>
                <Link to="/forgot-password" className="login-forgot-link">Forgot password?</Link>
              </div>
              <div className="login-input-container">
                <span className="login-input-icon"><Lock size={20} strokeWidth={1.5} /></span>
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className={`login-form-input ${errors.password ? "has-error" : ""}`}
                  placeholder="••••••••"
                  value={password}
                  onChange={handlePasswordChange}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="login-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="login-field-error">
                  <AlertCircle size={14} />{errors.password}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="login-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <><Loader2 size={22} className="spin" /> Signing in…</>
              ) : (
                <>Sign In <ArrowRight size={22} /></>
              )}
            </button>
          </form>

          <div className="login-form-footer">
            Don&apos;t have an account? <Link to="/register">Create one free</Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
