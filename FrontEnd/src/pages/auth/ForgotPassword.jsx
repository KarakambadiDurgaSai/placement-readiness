import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { forgotPassword } from "../../api/api";
import { useToast } from "../../components/ToastProvider";
import { Mail, ArrowRight, Loader2, KeyRound } from "lucide-react";
// CSS removed, imported globally

const ForgotPassword = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await forgotPassword({ email: email.toLowerCase().trim() });
      toast.success("OTP Sent", "An OTP has been sent to your registered email address.");
      setTimeout(() => navigate("/reset-password", { state: { email } }), 1500);
    } catch (err) {
      if (err.message === "User not found") {
         toast.error("Not Found", "No account found with this email address.");
      } else {
         toast.error("Error", err.message || "Failed to send OTP");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-centered-page">
      <div className="auth-centered-card">
        
        <div className="auth-form-header" style={{ textAlign: "center" }}>
          <div className="auth-form-eyebrow" style={{ margin: "0 auto 16px" }}>
            <KeyRound size={12} />
            Password Recovery
          </div>
          <h1 className="auth-form-title">Forgot Password?</h1>
          <p className="auth-form-subtitle">
            Enter your registered email address and we'll send you an OTP to reset your password.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="auth-steps">
          <div className="auth-step is-active">
            <div className="auth-step-circle">1</div>
            <div className="auth-step-label">Email</div>
          </div>
          <div className="auth-step">
            <div className="auth-step-circle">2</div>
            <div className="auth-step-label">OTP</div>
          </div>
          <div className="auth-step">
            <div className="auth-step-circle">3</div>
            <div className="auth-step-label">Reset</div>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="pr-form-group">
            <label className="pr-label" htmlFor="forgot-email">Email address</label>
            <div className="pr-input-wrap">
              <span className="pr-input-icon"><Mail size={16} /></span>
              <input
                id="forgot-email"
                type="email"
                className="pr-input has-icon"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <button type="submit" className="pr-btn pr-btn-primary" disabled={loading} style={{ width: "100%", height: "48px", marginTop: "16px" }}>
            {loading ? (
              <><Loader2 size={16} className="spin" /> Sending OTP…</>
            ) : (
              <>Send OTP <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        <div className="auth-form-footer">
          Remember your password? <Link to="/login">Sign in</Link>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;