import { useState } from "react";
import { loginPatient } from "../services/api";
import { useNavigate } from "react-router-dom";

function PatientLogin() {
  const [form, setForm] = useState({ prn: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleLogin = async () => {
    if (!form.prn || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      await loginPatient(form);
      localStorage.setItem("user_role", "patient");
      localStorage.setItem("patient_prn", form.prn);
      navigate("/patient-dashboard", { state: { prn: form.prn } });
    } catch (err) {
      console.error(err);
      setError("Invalid PRN or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div id="patient-login-container" style={styles.page}>
      {/* Animated background blobs */}
      <div style={styles.blob1} />
      <div style={styles.blob2} />
      <div style={styles.blob3} />

      <div style={styles.card}>
        {/* Left panel */}
        <div style={styles.leftPanel}>
          <div style={styles.leftContent}>
            <div style={styles.iconWrap}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="24" fill="rgba(255,255,255,0.15)" />
                <path d="M24 12C24 12 14 17.5 14 26C14 31.5 18.5 36 24 36C29.5 36 34 31.5 34 26C34 17.5 24 12 24 12Z" fill="white" opacity="0.9"/>
                <rect x="21" y="21" width="6" height="2" rx="1" fill="#0ea5e9"/>
                <rect x="23" y="19" width="2" height="6" rx="1" fill="#0ea5e9"/>
              </svg>
            </div>
            <h1 style={styles.brandName} className="white-heading">CorePulse</h1>
            <p style={styles.brandTagline}>OPD Management System</p>

            <div style={styles.divider} />

            <h2 style={styles.welcomeTitle} className="white-heading">Welcome Back,<br />Patient!</h2>
            <p style={styles.welcomeDesc}>
              Access your health records, appointments, and consultation history — all in one place.
            </p>

            <div style={styles.featureList}>
              {["View Consultation History", "Track Your Appointments", "Secure & Confidential"].map((f, i) => (
                <div key={i} style={styles.featureItem}>
                  <span style={styles.featureDot}>✓</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div style={styles.rightPanel}>
          <div style={styles.formWrap}>
            <div style={styles.formHeader}>
              <div style={styles.avatarIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" fill="#0ea5e9"/>
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h2 style={styles.formTitle} className="patient-login-heading">Patient Login</h2>
              <p style={styles.formSubtitle}>Enter your credentials to continue</p>
            </div>

            {/* PRN Field */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>PRN Number</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                    <rect x="2" y="5" width="20" height="14" rx="2"/>
                    <path d="M2 10h20"/>
                  </svg>
                </span>
                <input
                  id="patient-prn"
                  name="prn"
                  placeholder="Enter your PRN"
                  value={form.prn}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  style={styles.input}
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  id="patient-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  style={styles.input}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div style={styles.errorBox}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Login button */}
            <button
              id="patient-login-btn"
              onClick={handleLogin}
              disabled={loading}
              style={{
                ...styles.loginBtn,
                opacity: loading ? 0.75 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? (
                <span style={styles.spinnerWrap}>
                  <span style={styles.spinner} />
                  Signing in...
                </span>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/>
                    <polyline points="10 17 15 12 10 7"/>
                    <line x1="15" y1="12" x2="3" y2="12"/>
                  </svg>
                  Sign In
                </>
              )}
            </button>

            <p style={styles.footerNote}>
              🔒 Your data is encrypted and secure
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.05); }
          66% { transform: translate(-20px, 10px) scale(0.95); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-25px, 20px) scale(1.08); }
          66% { transform: translate(15px, -15px) scale(0.92); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, 25px) scale(1.06); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        #patient-prn:focus, #patient-password:focus {
          border-color: #0ea5e9 !important;
          box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.15) !important;
          background: #fff !important;
          color: #0f172a !important;
        }
        #patient-login-btn:hover:not(:disabled) {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 25px rgba(14, 165, 233, 0.45) !important;
        }
        #patient-login-btn:active:not(:disabled) {
          transform: translateY(0) !important;
        }
        #patient-login-container h1,
        #patient-login-container h2 {
          color: white !important;
          background: none !important;
          -webkit-background-clip: unset !important;
          -webkit-text-fill-color: white !important;
          background-clip: unset !important;
          text-shadow: none !important;
        }
      `}</style>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #0c4a6e 100%)",
    padding: "2rem",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  blob1: {
    position: "absolute",
    top: "-10%",
    left: "-10%",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(14,165,233,0.25) 0%, transparent 70%)",
    animation: "float1 12s ease-in-out infinite",
    pointerEvents: "none",
  },
  blob2: {
    position: "absolute",
    bottom: "-15%",
    right: "-10%",
    width: "600px",
    height: "600px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)",
    animation: "float2 15s ease-in-out infinite",
    pointerEvents: "none",
  },
  blob3: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)",
    animation: "float3 18s ease-in-out infinite",
    pointerEvents: "none",
  },
  card: {
    display: "flex",
    width: "100%",
    maxWidth: "900px",
    minHeight: "560px",
    borderRadius: "24px",
    overflow: "hidden",
    boxShadow: "0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)",
    position: "relative",
    zIndex: 1,
  },
  leftPanel: {
    flex: "1 1 42%",
    background: "linear-gradient(160deg, #0369a1 0%, #0ea5e9 50%, #38bdf8 100%)",
    padding: "3rem 2.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  leftContent: {
    position: "relative",
    zIndex: 1,
    color: "white",
  },
  iconWrap: {
    marginBottom: "1rem",
  },
  brandName: {
    margin: 0,
    fontSize: "2rem",
    fontWeight: 800,
    color: "white",
    letterSpacing: "-0.5px",
  },
  brandTagline: {
    margin: "0.25rem 0 0",
    fontSize: "0.8rem",
    color: "rgba(255,255,255,0.75)",
    textTransform: "uppercase",
    letterSpacing: "1.5px",
    fontWeight: 500,
  },
  divider: {
    width: "48px",
    height: "3px",
    background: "rgba(255,255,255,0.5)",
    borderRadius: "2px",
    margin: "1.75rem 0",
  },
  welcomeTitle: {
    margin: "0 0 0.75rem",
    fontSize: "1.6rem",
    fontWeight: 700,
    color: "white",
    lineHeight: 1.3,
  },
  welcomeDesc: {
    margin: "0 0 1.5rem",
    fontSize: "0.9rem",
    color: "rgba(255,255,255,0.8)",
    lineHeight: 1.6,
  },
  featureList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.65rem",
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    fontSize: "0.875rem",
    color: "rgba(255,255,255,0.9)",
  },
  featureDot: {
    width: "22px",
    height: "22px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.75rem",
    fontWeight: 700,
    flexShrink: 0,
  },
  rightPanel: {
    flex: "1 1 58%",
    background: "rgba(15, 23, 42, 0.95)",
    backdropFilter: "blur(20px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "3rem 2.5rem",
  },
  formWrap: {
    width: "100%",
    maxWidth: "380px",
  },
  formHeader: {
    marginBottom: "2rem",
    textAlign: "center",
  },
  avatarIcon: {
    width: "60px",
    height: "60px",
    borderRadius: "16px",
    background: "rgba(14, 165, 233, 0.12)",
    border: "1px solid rgba(14, 165, 233, 0.25)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 1rem",
  },
  formTitle: {
    margin: "0 0 0.4rem",
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "#e0e0e0",
    text: "#e0e0e0",
  },
  formSubtitle: {
    margin: 0,
    fontSize: "0.875rem",
    color: "#64748b",
  },
  fieldGroup: {
    marginBottom: "1.25rem",
  },
  label: {
    display: "block",
    fontSize: "0.8rem",
    fontWeight: 600,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    marginBottom: "0.5rem",
  },
  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: "14px",
    display: "flex",
    alignItems: "center",
    pointerEvents: "none",
    zIndex: 1,
  },
  input: {
    width: "100%",
    padding: "0.85rem 1rem 0.85rem 2.75rem",
    background: "rgba(255,255,255,0.05)",
    border: "1.5px solid rgba(255,255,255,0.08)",
    borderRadius: "12px",
    fontSize: "0.95rem",
    color: "white",
    outline: "none",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease",
    fontFamily: "inherit",
  },
  eyeBtn: {
    position: "absolute",
    right: "12px",
    background: "none",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    padding: "4px",
    borderRadius: "6px",
    transition: "opacity 0.2s ease",
    opacity: 0.7,
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    background: "rgba(220, 38, 38, 0.1)",
    border: "1px solid rgba(220, 38, 38, 0.3)",
    borderRadius: "10px",
    padding: "0.75rem 1rem",
    marginBottom: "1.25rem",
    fontSize: "0.85rem",
    color: "#f87171",
  },
  loginBtn: {
    width: "100%",
    padding: "0.9rem 1.5rem",
    background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "1rem",
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.6rem",
    transition: "transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease",
    boxShadow: "0 4px 15px rgba(14, 165, 233, 0.3)",
    fontFamily: "inherit",
    marginTop: "0.5rem",
  },
  spinnerWrap: {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
  },
  spinner: {
    width: "18px",
    height: "18px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "white",
    borderRadius: "50%",
    display: "inline-block",
    animation: "spin 0.7s linear infinite",
  },
  footerNote: {
    textAlign: "center",
    fontSize: "0.78rem",
    color: "#475569",
    marginTop: "1.25rem",
  },
};

export default PatientLogin;
