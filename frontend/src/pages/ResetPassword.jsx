import { useState } from "react";
import { resetPassword } from "../services/api";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function ResetPassword() {
  const [form, setForm] = useState({
    username: "",
    new_password: "",
  });
  const [status, setStatus] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
    if (status) setStatus(null);
  };

  const handleReset = async () => {
    setStatus(null);
    try {
      await resetPassword(form);
      setStatus({ type: "ok", text: "Password updated. You can sign in now." });
      setTimeout(() => navigate("/login"), 900);
    } catch {
      setStatus({ type: "err", text: "Could not update password. Try again." });
    }
  };

  return (
    <div className="auth-shell">
      <motion.div
        className="auth-hero"
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="auth-hero-inner">
          <h1>Reset access securely.</h1>
          <p>
            Choose a strong password and return to the OPD workspace when you are
            ready.
          </p>
          <div className="auth-dots" aria-hidden>
            <span />
            <span />
            <span />
          </div>
        </div>
      </motion.div>

      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2>New password</h2>
        <p className="auth-card-sub">Enter your username and a new password.</p>

        {status && (
          <div
            className={`auth-banner ${status.type === "ok" ? "auth-banner--ok" : "auth-banner--err"}`}
            role="status"
          >
            {status.text}
          </div>
        )}

        <div className="field">
          <label htmlFor="reset-username">Username</label>
          <input
            id="reset-username"
            name="username"
            autoComplete="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
          />
        </div>
        <div className="field">
          <label htmlFor="reset-password">New password</label>
          <input
            id="reset-password"
            type="password"
            name="new_password"
            autoComplete="new-password"
            placeholder="New password"
            value={form.new_password}
            onChange={handleChange}
          />
        </div>

        <button type="button" className="btn btn-primary" onClick={handleReset}>
          Update password
        </button>

        <p className="auth-hint">
          <button type="button" onClick={() => navigate("/login")}>
            Back to sign in
          </button>
        </p>
      </motion.div>
    </div>
  );
}

export default ResetPassword;
