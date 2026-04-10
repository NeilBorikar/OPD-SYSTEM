import { useState } from "react";
import { loginDoctor } from "../services/api";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function Login() {
  const [form, setForm] = useState({
    username: "",
    password: "",
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

  const handleLogin = async () => {
    setStatus(null);
    try {
      const response = await loginDoctor(form);
      localStorage.setItem("authToken", response.token || "authenticated");
      localStorage.setItem("username", form.username);
      setStatus({ type: "ok", text: "Welcome back. Redirecting…" });
      setTimeout(() => navigate("/home"), 600);
    } catch {
      setStatus({ type: "err", text: "Invalid username or password." });
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
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
          <h1>Outpatient care, organized in one place.</h1>
          <p>
            Look up patients, capture consultations, and review history with a
            workflow built for busy neurosurgery clinics.
          </p>
          <div className="auth-dots" aria-hidden>
            <span />
            <span />
            <span />
          </div>
        </div>
      </motion.div>

      <motion.div
        className="auth-card login-page"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2>Doctor sign in</h2>
        <p className="auth-card-sub">Use your hospital credentials to continue.</p>

        {status && (
          <div
            className={`auth-banner ${status.type === "ok" ? "auth-banner--ok" : "auth-banner--err"}`}
            role="status"
          >
            {status.text}
          </div>
        )}

        <div className="field">
          <label htmlFor="login-username">Username</label>
          <input
            id="login-username"
            name="username"
            autoComplete="username"
            placeholder="e.g. dr.smith"
            value={form.username}
            onChange={handleChange}
            onKeyDown={onKeyDown}
          />
        </div>
        <div className="field">
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            onKeyDown={onKeyDown}
          />
        </div>

        <button type="button" className="btn btn-primary" onClick={handleLogin}>
          Enter workspace
        </button>

        <p className="auth-hint">
          <button type="button" onClick={() => navigate("/reset")}>
            Forgot password?
          </button>
        </p>
      </motion.div>
    </div>
  );
}

export default Login;
