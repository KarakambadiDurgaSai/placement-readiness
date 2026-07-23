import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser, loginUser } from "../../api/api";
import { isValidEmail } from "../../utils/validation";
import { useToast } from "../../components/ToastProvider";
import {
  Rocket,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  User,
  Building2,
  GraduationCap,
  Briefcase,
  AlertCircle,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Zap
} from "lucide-react";
import "./Register.css";

const Register = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState({
    email: "",
    phone: "",
    password: "",
    role: "student",
  });
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState({
    email: "", phone: "", password: "", confirmPassword: "", role: "", global: ""
  });
  const [tempWarnings, setTempWarnings] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ── handlers ────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (errors[name] || errors.global) {
      setErrors((p) => ({ ...p, [name]: "", global: "" }));
    }
    if (tempWarnings[name]) {
      setTempWarnings((p) => ({ ...p, [name]: "" }));
    }

    if (name === "email") {
      setForm({ ...form, email: value.toLowerCase() });
    } else if (name === "phone") {
      const rawDigits = value.replace(/\D/g, "");
      if (rawDigits.length > 10) {
        setTempWarnings((p) => ({ ...p, phone: "Maximum 10 digits allowed." }));
      }
      const digitsOnly = rawDigits.slice(0, 10);
      if (value !== digitsOnly) {
         e.target.value = digitsOnly;
      }
      setForm({ ...form, phone: digitsOnly });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const calculateStrength = (pass) => {
    if (!pass) return { score: 0, text: "", color: "#e2e8f0", width: "0%" };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[a-z]/.test(pass)) score += 1;
    if (/\d/.test(pass)) score += 1;
    if (/[@$!%*?&]/.test(pass)) score += 1;

    if (score <= 2) return { score, text: "Weak", color: "#ef4444", width: "33%" };
    if (score <= 4) return { score, text: "Medium", color: "#f59e0b", width: "66%" };
    return { score, text: "Strong", color: "#10b981", width: "100%" };
  };

  const getValidationIcon = (fieldName) => {
    if (fieldName === 'confirmPassword') {
        if (!confirmPassword) return null;
        if (confirmPassword === form.password && confirmPassword.length > 0) return <CheckCircle2 className="status-icon success" size={18} />;
        if (errors.confirmPassword) return <AlertCircle className="status-icon error" size={18} />;
        return null;
    }
    
    const val = form[fieldName];
    if (!val) return null;
    if (errors[fieldName] || tempWarnings[fieldName]) return <AlertCircle className="status-icon error" size={18} />;
    
    if (fieldName === "email" && isValidEmail(val)) return <CheckCircle2 className="status-icon success" size={18} />;
    if (fieldName === "phone" && val.length === 10 && /^[6-9]/.test(val)) return <CheckCircle2 className="status-icon success" size={18} />;
    if (fieldName === "password" && passwordRegex.test(val)) return <CheckCircle2 className="status-icon success" size={18} />;
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({ email: "", phone: "", password: "", confirmPassword: "", role: "", global: "" });

    if (!isValidEmail(form.email))
      return setErrors((p) => ({ ...p, email: "Please enter a valid email address." }));
    if (form.phone.length !== 10)
      return setErrors((p) => ({ ...p, phone: "Phone number must be exactly 10 digits" }));
    if (!/^[6-9]/.test(form.phone))
      return setErrors((p) => ({ ...p, phone: "Phone number must start with a digit between 6 and 9" }));
    if (!passwordRegex.test(form.password))
      return setErrors((p) => ({ ...p, password: "Must be at least 8 chars, include upper, lower, number & special char" }));
    if (form.password !== confirmPassword)
      return setErrors((p) => ({ ...p, confirmPassword: "Passwords do not match" }));
    if (!form.role)
      return setErrors((p) => ({ ...p, role: "Please select a role" }));

    setIsSubmitting(true);
    try {
      await registerUser(form);
      toast.success("Account created!", "Logging you in securely...");
      
      const loginRes = await loginUser({ email: form.email, password: form.password });
      localStorage.setItem("token", loginRes.token);
      localStorage.setItem("role", loginRes.role);

      setTimeout(() => {
        if (loginRes.role === "student") navigate("/student/profile");
        else if (loginRes.role === "company") navigate("/company/profile");
      }, 1500);

    } catch (err) {
      setErrors((p) => ({ ...p, global: err.message || "Registration failed" }));
      toast.error("Registration failed", err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasErrors = Object.values(errors).some((err) => err !== "");

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="register-layout">
      {/* ── LEFT PANEL (MARKETING) ────────────────────────────────────── */}
      <div className="register-left">
        <div className="bg-grid"></div>
        <div className="left-content-wrapper">
          <Link to="/" className="brand-logo" aria-label="Return to home">
            <div className="brand-icon-box"><Rocket size={20} strokeWidth={2.5} /></div>
            <span className="brand-text">PlaceReady</span>
          </Link>

          <h1 className="left-headline">
            Empowering<br />
            <span className="text-gold">Students</span> &<br />
            Companies
          </h1>
          <p className="left-desc">
            Join the platform that bridges the gap between top talent and leading organizations.
          </p>

          <div className="feature-cards">
            {/* Feature 1 */}
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <GraduationCap size={20} strokeWidth={2} />
              </div>
              <div className="feature-text-content">
                <span className="feature-title">For Students</span>
                <span className="feature-desc">Build your profile and get placement-ready</span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <Briefcase size={20} strokeWidth={2} />
              </div>
              <div className="feature-text-content">
                <span className="feature-title">For Companies</span>
                <span className="feature-desc">Discover and hire verified talent effortlessly</span>
              </div>
            </div>
          </div>

          {/* Premium CSS Illustration */}
          <div className="premium-illustration-container">
            <div className="floating-dashboard">
              <div className="dash-header">
                <div className="dash-skeleton-line short"></div>
                <div className="dash-skeleton-circle"></div>
              </div>
              
              <div className="dash-body">
                {/* Profile Card */}
                <div className="dash-card primary">
                  <div className="dash-profile-row">
                    <div className="dash-avatar">
                      <User size={16} strokeWidth={2.5} color="#D4A017" />
                    </div>
                    <div className="dash-profile-info">
                      <div className="dash-skeleton-line thick"></div>
                      <div className="dash-skeleton-line thin"></div>
                    </div>
                    <div className="dash-badge badge-pulse">
                      <CheckCircle2 size={16} fill="#D4A017" color="#FFFFFF" />
                    </div>
                  </div>
                  <div className="dash-metrics">
                    <div className="dash-metric-bar"></div>
                    <div className="dash-metric-bar short"></div>
                  </div>
                </div>

                {/* Connection Flow */}
                <div className="dash-connection">
                  <div className="dash-line line-glow"></div>
                </div>

                {/* Match Card */}
                <div className="dash-card secondary">
                  <div className="dash-company-row">
                    <div className="dash-company-logo">
                      <Building2 size={14} strokeWidth={2} color="#172742" />
                    </div>
                    <div className="dash-company-info">
                      <div className="dash-skeleton-line medium dark"></div>
                      <div className="dash-skeleton-line thin dark"></div>
                    </div>
                    <div className="dash-score">98% Match</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div className="left-footer">
          © {new Date().getFullYear()} PlaceReady Inc.
        </div>
      </div>

      {/* ── RIGHT PANEL (FORM) ────────────────────────────────────────── */}
      <div className="register-right">
        <div className="form-container">

          <div className="form-badge">
            <Zap size={14} fill="#D4A017" color="#D4A017" />
            PlaceReady
          </div>
          
          <h1 className="form-title">Create Account</h1>
          <p className="form-subtitle">
            Sign up for free and kickstart your journey.
          </p>

          {errors.global && (
            <div className="global-error-box">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{errors.global}</span>
            </div>
          )}

          <form className="form-fields" onSubmit={handleSubmit} noValidate>
            
            {/* Email */}
            <div className="field-group">
              <label className="field-label" htmlFor="reg-email">Email address</label>
              <div className="input-container">
                <span className="input-icon"><Mail size={20} strokeWidth={1.5} /></span>
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  className={`form-input ${errors.email ? "has-error" : ""}`}
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                />
                {getValidationIcon('email')}
              </div>
              {errors.email && (
                <p className="field-error-text"><AlertCircle size={14} />{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div className="field-group">
              <label className="field-label" htmlFor="reg-phone">Phone number</label>
              <div className="input-container">
                <span className="input-icon"><Phone size={20} strokeWidth={1.5} /></span>
                <input
                  id="reg-phone"
                  name="phone"
                  type="tel"
                  className={`form-input ${errors.phone ? "has-error" : ""}`}
                  placeholder="9876543210"
                  value={form.phone}
                  onChange={handleChange}
                  onBlur={() => setTempWarnings((p) => ({ ...p, phone: "" }))}
                />
                {getValidationIcon('phone')}
              </div>
              {errors.phone ? (
                <p className="field-error-text"><AlertCircle size={14} />{errors.phone}</p>
              ) : tempWarnings.phone ? (
                <p className="field-error-text" style={{ color: '#f59e0b' }}><AlertCircle size={14} />{tempWarnings.phone}</p>
              ) : null}
            </div>

            {/* Password */}
            <div className="field-group">
              <label className="field-label" htmlFor="reg-pass">Create password</label>
              <div className="input-container has-eye">
                <span className="input-icon"><Lock size={20} strokeWidth={1.5} /></span>
                <input
                  id="reg-pass"
                  name="password"
                  type={showCreatePassword ? "text" : "password"}
                  className={`form-input ${errors.password ? "has-error" : ""}`}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                />
                {getValidationIcon('password')}
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowCreatePassword(!showCreatePassword)}
                  aria-label="Toggle password visibility"
                >
                  {showCreatePassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {form.password && (
                <div className="password-strength-container">
                  <div className="strength-track">
                    <div 
                      className="strength-fill" 
                      style={{ 
                        width: calculateStrength(form.password).width, 
                        backgroundColor: calculateStrength(form.password).color 
                      }} 
                    />
                  </div>
                  <div className="strength-label" style={{ color: calculateStrength(form.password).color }}>
                    {calculateStrength(form.password).text}
                  </div>
                </div>
              )}

              {errors.password && (
                <p className="field-error-text"><AlertCircle size={14} />{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="field-group">
              <label className="field-label" htmlFor="reg-confirm">Confirm password</label>
              <div className="input-container has-eye">
                <span className="input-icon"><Lock size={20} strokeWidth={1.5} /></span>
                <input
                  id="reg-confirm"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  className={`form-input ${errors.confirmPassword ? "has-error" : ""}`}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors((p) => ({ ...p, confirmPassword: "" }));
                  }}
                />
                {getValidationIcon('confirmPassword')}
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="field-error-text"><AlertCircle size={14} />{errors.confirmPassword}</p>
              )}
            </div>

            {/* Role Selection (Pill format) */}
            <div className="field-group">
              <label className="field-label">I am signing up as a:</label>
              
              <div className="role-pill-group">
                
                {/* Student Pill */}
                <label className="role-pill">
                  <input
                    type="radio"
                    name="role"
                    value="student"
                    checked={form.role === "student"}
                    onChange={() => {
                      setForm({ ...form, role: "student" });
                      if (errors.role) setErrors((p) => ({ ...p, role: "" }));
                    }}
                  />
                  <div className="pill-content">
                    {form.role === "student" ? (
                      <CheckCircle2 size={16} color="#D4A017" strokeWidth={2.5} className="pill-check-icon" />
                    ) : (
                      <div className="pill-radio-empty"></div>
                    )}
                    <User size={16} strokeWidth={2} />
                    <span>Student</span>
                  </div>
                </label>

                {/* Company Pill */}
                <label className="role-pill">
                  <input
                    type="radio"
                    name="role"
                    value="company"
                    checked={form.role === "company"}
                    onChange={() => {
                      setForm({ ...form, role: "company" });
                      if (errors.role) setErrors((p) => ({ ...p, role: "" }));
                    }}
                  />
                  <div className="pill-content">
                    {form.role === "company" ? (
                       <CheckCircle2 size={16} color="#D4A017" strokeWidth={2.5} className="pill-check-icon" />
                    ) : (
                       <div className="pill-radio-empty"></div>
                    )}
                    <Building2 size={16} strokeWidth={2} />
                    <span>Company</span>
                  </div>
                </label>

              </div>
              {errors.role && (
                <p className="field-error-text"><AlertCircle size={14} />{errors.role}</p>
              )}
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting || hasErrors}
            >
              {isSubmitting ? (
                <><Loader2 size={22} className="spin" /> Creating Account…</>
              ) : (
                <>Sign Up <ArrowRight size={22} /></>
              )}
            </button>
          </form>

          <div className="form-footer">
            Already have an account? <Link to="/login">Sign In</Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;
