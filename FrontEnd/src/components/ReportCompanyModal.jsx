import { useState } from "react";
import { Flag } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const OPTIONS = [
  "Very low hiring count",
  "Unrealistic workload for low salary",
  "Fake or misleading job description",
  "Asking money or registration fees",
  "No response after selection",
  "Company details look fake",
];

const ReportCompanyModal = ({ companyId, onClose }) => {
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const toggleOption = (option) => {
    setSelected((prev) =>
      prev.includes(option)
        ? prev.filter((o) => o !== option)
        : [...prev, option]
    );
  };

  const submitReport = async () => {
    if (selected.length === 0) {
      setMessage("Select at least one reason");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`${API_BASE_URL}/complaints/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify({ companyId, reasons: selected }),
      });
      const data = await res.json();
      setMessage(data.message);
    } catch {
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pr-modal-overlay" onClick={onClose}>
      <div className="pr-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <div className="pr-modal-icon" style={{ background: "var(--pr-danger-light)", color: "var(--pr-danger)", margin: "0 auto 20px" }}>
          <Flag size={24} />
        </div>
        <div className="pr-modal-title">Report Suspicious Company</div>
        <p className="pr-modal-desc">Select all reasons that apply to your report.</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, margin: "20px 0", textAlign: "left" }}>
          {OPTIONS.map((opt) => (
            <label
              key={opt}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 14px", borderRadius: 10, cursor: "pointer",
                border: `1.5px solid ${selected.includes(opt) ? "var(--pr-primary)" : "var(--pr-border)"}`,
                background: selected.includes(opt) ? "var(--pr-primary-light)" : "var(--pr-surface)",
                fontSize: 14, fontWeight: selected.includes(opt) ? 600 : 400,
                color: selected.includes(opt) ? "var(--pr-primary)" : "var(--pr-text-body)",
                transition: "all 0.15s",
              }}
            >
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => toggleOption(opt)}
                style={{ accentColor: "var(--pr-primary)" }}
              />
              {opt}
            </label>
          ))}
        </div>

        {message && (
          <div className="pr-info-banner" style={{ marginBottom: 16 }}>{message}</div>
        )}

        <div className="pr-modal-actions">
          <button onClick={onClose} className="pr-btn pr-btn-ghost">Cancel</button>
          <button
            onClick={submitReport}
            disabled={loading}
            className="pr-btn pr-btn-danger"
          >
            {loading ? "Submitting..." : "Submit Report"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportCompanyModal;
