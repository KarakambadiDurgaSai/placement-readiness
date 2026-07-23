import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { resetPassword, forgotPassword } from "../../api/api";
import { useToast } from "../../components/ToastProvider";
import { Mail, KeyRound, Lock, ArrowRight, Loader2, RefreshCw } from "lucide-react";
// CSS removed, imported globally

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const [form, setForm] = useState({
    email: location.state?.email || "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      return toast.error("Validation Error", "Passwords do not match");
    }

    setLoading(true);

    try {
      await resetPassword({
        email: form.email.toLowerCase().trim(),
        otp: form.otp,
        newPassword: form.newPassword,
      });

      toast.success("Password Reset!", "You can now log in using your new password.");
      setTimeout(() => navigate("/login"), 2000);

    } catch (err) {
      if (err.message.includes("expired")) {
         toast.error("Expired", "OTP has expired. Please request a new OTP.");
      } else if (err.message.includes("Invalid")) {
         toast.error("Invalid", "Invalid OTP.");
      } else {
         toast.error("Error", err.message || "Password reset failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
     if (!form.email) return toast.warning("Email required", "Please enter your email first.");
     setResending(true);
     try {
       await forgotPassword({ email: form.email.toLowerCase().trim() });
       toast.success("Sent!", "A new OTP has been sent to your email address.");
     } catch (err) {
       toast.error("Error", err.message || "Failed to resend OTP");
     } finally {
       setResending(false);
     }
  };

  return (
    <div className="auth-centered-page">
      <div className="auth-centered-card">
        
        <div className="auth-form-header" style={{ textAlign: "center" }}>
          <div className="auth-form-eyebrow" style={{ margin: "0 auto 16px" }}>
            <KeyRound size={12} />
            Create New Password
          </div>
          <h1 className="auth-form-title">Reset Password</h1>
          <p className="auth-form-subtitle">
            Enter the OTP sent to your email and choose a strong new password.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="auth-steps">
          <div className="auth-step is-done">
            <div className="auth-step-circle">✓</div>
            <div className="auth-step-label">Email</div>
          </div>
          <div className="auth-step is-active">
            <div className="auth-step-circle">2</div>
            <div className="auth-step-label">OTP</div>
          </div>
          <div className="auth-step is-active">
            <div className="auth-step-circle">3</div>
            <div className="auth-step-label">Reset</div>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          
          <div className="pr-form-group">
            <label className="pr-label" htmlFor="reset-email">Email address</label>
            <div className="pr-input-wrap">
              <span className="pr-input-icon"><Mail size={16} /></span>
              <input
                id="reset-email"
                name="email"
                type="email"
                className="pr-input has-icon"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
                readOnly={!!location.state?.email}
                style={location.state?.email ? { backgroundColor: 'var(--pr-surface-hover)', color: 'var(--pr-text-muted)' } : {}}
              />
            </div>
          </div>

          <div className="pr-form-group">
            <label className="pr-label" htmlFor="reset-otp">One-Time Password (OTP)</label>
            <div className="pr-input-wrap">
              <span className="pr-input-icon"><KeyRound size={16} /></span>
              <input
                id="reset-otp"
                name="otp"
                className="pr-input has-icon"
                placeholder="Enter 6-digit OTP"
                value={form.otp}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="pr-form-group">
            <label className="pr-label" htmlFor="reset-new">New Password</label>
            <div className="pr-input-wrap">
              <span className="pr-input-icon"><Lock size={16} /></span>
              <input
                id="reset-new"
                name="newPassword"
                type="password"
                className="pr-input has-icon"
                placeholder="••••••••"
                value={form.newPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="pr-form-group">
            <label className="pr-label" htmlFor="reset-confirm">Confirm Password</label>
            <div className="pr-input-wrap">
              <span className="pr-input-icon"><Lock size={16} /></span>
              <input
                id="reset-confirm"
                name="confirmPassword"
                type="password"
                className="pr-input has-icon"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button type="submit" className="pr-btn pr-btn-primary" disabled={loading} style={{ width: "100%", height: "48px", marginTop: "16px" }}>
            {loading ? (
              <><Loader2 size={16} className="spin" /> Updating…</>
            ) : (
              <>Reset Password <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        <div className="auth-form-footer">
          Didn't receive OTP?{" "}
          <button type="button" onClick={handleResend} disabled={resending}>
            {resending ? "Resending..." : "Resend OTP"}
            {!resending && <RefreshCw size={12} style={{ display: 'inline', marginLeft: 4, verticalAlign: '-2px' }} />}
          </button>
        </div>

        <div className="auth-form-footer" style={{ marginTop: 12 }}>
          Back to <Link to="/login">Sign in</Link>
        </div>

      </div>
    </div>
  );
};

export default ResetPassword;