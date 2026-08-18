import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginPatient } from "../services/api";
import "../index.css";

const Login = () => {
  const [patientForm, setPatientForm] = useState({ prn: "", password: "" });
  const [patientLoading, setPatientLoading] = useState(false);
  const [patientError, setPatientError] = useState("");
  const navigate = useNavigate();

  const handlePatientChange = (e) => {
    setPatientForm({ ...patientForm, [e.target.name]: e.target.value });
    setPatientError("");
  };

  const handlePatientLogin = async () => {
    if (!patientForm.prn || !patientForm.password) {
      setPatientError("Please enter both PRN and password");
      return;
    }
    setPatientLoading(true);
    try {
      await loginPatient(patientForm);
      localStorage.setItem("universal_prn", patientForm.prn);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setPatientError("Invalid PRN or password");
    } finally {
      setPatientLoading(false);
    }
  };

  const handlePatientKeyPress = (e) => {
    if (e.key === "Enter") handlePatientLogin();
  };

  return (
    <div className="login-wrapper" style={{ position: "relative" }}>
      <div className="login-hero-banner">
        <div className="hero-content">
          <div className="hero-brand-pill">
            <span className="pulse-dot"></span>
            <span>UNIVERSAL PATIENT PORTAL</span>
          </div>
          <h1 className="hero-title" style={{ color: "white", textShadow: "none" }}>
            COREPULSE
          </h1>
          <h2 className="hero-subtitle" style={{ color: "#e2e8f0", textShadow: "none" }}>
            Access all your consultations from any clinic in one place
          </h2>
        </div>
      </div>

      <div className="login-cards-container" style={{ justifyContent: "center", display: "flex", width: "100%", maxWidth: "800px" }}>
        <div className="login-card patient-card expanded" style={{ maxWidth: "450px", width: "100%" }}>
          <div className="card-header" style={{ cursor: "default" }}>
            <div className="card-icon patient-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
            </div>
            <h3>Universal Login</h3>
            <p>View your global records</p>
          </div>

          <div className="card-body">
            <div className="form-group">
              <label>PRN Number</label>
              <input
                name="prn"
                type="text"
                placeholder="Enter your universal PRN"
                value={patientForm.prn}
                onChange={handlePatientChange}
                onKeyPress={handlePatientKeyPress}
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                name="password"
                type="password"
                placeholder="Enter password"
                value={patientForm.password}
                onChange={handlePatientChange}
                onKeyPress={handlePatientKeyPress}
              />
            </div>

            {patientError && <div className="error-msg">{patientError}</div>}

            <button 
              className="login-btn patient-btn" 
              onClick={handlePatientLogin} 
              disabled={patientLoading}
            >
              {patientLoading ? "Authenticating..." : "Login securely"}
            </button>
            <div className="card-footer">
              <span>Secure encrypted connection</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
