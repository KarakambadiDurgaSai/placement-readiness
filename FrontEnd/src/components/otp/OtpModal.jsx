import { useState } from "react";
import { Shield, X } from "lucide-react";

const OtpModal = ({ isOpen, onClose, onVerify, loading }) => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleVerify = () => {
    if (!otp || otp.length !== 6) {
      setError("Enter a valid 6-digit OTP");
      return;
    }
    setError("");
    onVerify(otp);
  };

  return (
    <div className="pr-modal-overlay" onClick={onClose}>
      <div className="pr-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
        <div className="pr-modal-icon" style={{ margin: "0 auto 20px" }}>
          <Shield size={24} />
        </div>
        <div className="pr-modal-title">Email Verification</div>
        <p className="pr-modal-desc">Enter the 6-digit OTP sent to your college email address.</p>

        <div className="pr-form-group" style={{ textAlign: "left", marginBottom: 16 }}>
          <label className="pr-label" htmlFor="otp-input">OTP Code</label>
          <input
            id="otp-input"
            type="text"
            maxLength="6"
            placeholder="000000"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            className="pr-input"
            style={{ textAlign: "center", fontSize: 20, letterSpacing: 8, fontWeight: 700 }}
            autoFocus
          />
          {error && <div className="pr-field-error" style={{ marginTop: 6 }}>{error}</div>}
        </div>

        <div className="pr-modal-actions">
          <button className="pr-btn pr-btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="pr-btn pr-btn-primary"
            onClick={handleVerify}
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OtpModal;
