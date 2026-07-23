/**
 * PlaceReady — Toast Notification System
 * 
 * Usage:
 *   1. Wrap your app with <ToastProvider> in main.jsx / App.jsx
 *   2. Call useToast() in any component to show notifications
 *
 * Examples:
 *   const toast = useToast();
 *   toast.success("Profile saved!", "Your changes have been applied.");
 *   toast.error("Upload failed", "File size exceeds limit.");
 *   toast.warning("Session expiring", "You will be logged out soon.");
 *   toast.info("New update", "PlaceReady v2.0 is now available.");
 */

import { createContext, useContext, useState, useCallback, useRef } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

/* --------------------------------------------------------------------------
   Context
   -------------------------------------------------------------------------- */
const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
};

/* --------------------------------------------------------------------------
   Provider
   -------------------------------------------------------------------------- */
const DEFAULT_DURATION = 4000; // ms

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  const show = useCallback(
    (type, title, message, duration = DEFAULT_DURATION) => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev, { id, type, title, message, duration, exiting: false }]);
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss]
  );

  const api = {
    success: (title, message, duration)  => show("success", title, message, duration),
    error:   (title, message, duration)  => show("danger",  title, message, duration),
    warning: (title, message, duration)  => show("warning", title, message, duration),
    info:    (title, message, duration)  => show("info",    title, message, duration),
    dismiss,
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

/* --------------------------------------------------------------------------
   Icons per type
   -------------------------------------------------------------------------- */
const ICONS = {
  success: <CheckCircle2 size={18} />,
  danger:  <XCircle size={18} />,
  warning: <AlertTriangle size={18} />,
  info:    <Info size={18} />,
};

/* --------------------------------------------------------------------------
   Toast Container (rendered at root level)
   -------------------------------------------------------------------------- */
function ToastContainer({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;

  return (
    <div className="pr-toast-container" role="region" aria-label="Notifications" aria-live="polite">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

/* --------------------------------------------------------------------------
   Individual Toast
   -------------------------------------------------------------------------- */
function ToastItem({ toast, onDismiss }) {
  const { id, type, title, message, duration, exiting } = toast;

  return (
    <div
      className={`pr-toast pr-toast-${type} ${exiting ? "pr-toast-exit" : ""}`}
      role="alert"
      aria-atomic="true"
    >
      {/* Icon */}
      <div className="pr-toast-icon" aria-hidden="true">
        {ICONS[type]}
      </div>

      {/* Body */}
      <div className="pr-toast-body">
        {title && <div className="pr-toast-title">{title}</div>}
        {message && <div className="pr-toast-message">{message}</div>}
      </div>

      {/* Close button */}
      <button
        className="pr-toast-close"
        onClick={() => onDismiss(id)}
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>

      {/* Auto-dismiss progress bar */}
      {duration > 0 && (
        <div
          className="pr-toast-progress"
          style={{ animationDuration: `${duration}ms` }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
