import { useState } from "react";
import { loginUnified, loginPatient } from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import "../styles/global.css";
import "../styles/login.css";

function Login() {
  // Staff Form State
  const [staffForm, setStaffForm] = useState({ username: "", password: "" });
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffError, setStaffError] = useState("");

  // Patient Form State
  const [patientForm, setPatientForm] = useState({ prn: "", password: "" });
  const [patientLoading, setPatientLoading] = useState(false);
  const [patientError, setPatientError] = useState("");

  const navigate = useNavigate();

  // Accordion toggle state: 'staff', 'patient', or null (both collapsed)
  const [expandedCard, setExpandedCard] = useState(null);

  const toggleCard = (card) => {
    setExpandedCard(prev => prev === card ? null : card);
  };

  // --- STAFF HANDLERS ---
  const handleStaffChange = (e) => {
    setStaffForm({ ...staffForm, [e.target.name]: e.target.value });
    setStaffError("");
  };

  const handleStaffLogin = async () => {
    if (!staffForm.username || !staffForm.password) {
      setStaffError("Please enter both username and password");
      return;
    }
    setStaffLoading(true);
    try {
      const res = await loginUnified(staffForm);
      if (res.role === "doctor") {
        localStorage.setItem("user_role", "doctor");
        localStorage.setItem("doctor_username", staffForm.username);
        navigate("/doctor-dashboard");
      } else if (res.role === "nurse") {
        localStorage.setItem("user_role", "nurse");
        localStorage.setItem("nurse_username", staffForm.username);
        navigate("/nurse", { state: { username: staffForm.username } });
      } else if (res.role === "receptionist") {
        localStorage.setItem("user_role", "receptionist");
        navigate("/reception-dashboard");
      }
    } catch (err) {
      console.error(err);
      setStaffError("Invalid credentials / User not found");
    } finally {
      setStaffLoading(false);
    }
  };

  const handleStaffKeyPress = (e) => {
    if (e.key === 'Enter') handleStaffLogin();
  };

  // --- PATIENT HANDLERS ---
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
      localStorage.setItem("user_role", "patient");
      localStorage.setItem("patient_prn", patientForm.prn);
      navigate("/patient-dashboard", { state: { prn: patientForm.prn } });
    } catch (err) {
      console.error(err);
      setPatientError("Invalid PRN or password");
    } finally {
      setPatientLoading(false);
    }
  };

  const handlePatientKeyPress = (e) => {
    if (e.key === 'Enter') handlePatientLogin();
  };

  return (
    <div className="login-wrapper" style={{ position: "relative" }}>
      
      {/* Top Right Sign Up button */}
      <div style={{
        position: "absolute",
        top: "24px",
        right: "24px",
        zIndex: 50
      }}>
        <button
          onClick={() => navigate("/register")}
          style={{
            padding: "10px 24px",
            background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
            color: "white",
            border: "none",
            borderRadius: "30px",
            cursor: "pointer",
            fontWeight: "700",
            fontSize: "0.95rem",
            boxShadow: "0 4px 15px rgba(14, 165, 233, 0.3)",
            transition: "all 0.2s ease",
            letterSpacing: "0.5px"
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(14, 165, 233, 0.4)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.boxShadow = "0 4px 15px rgba(14, 165, 233, 0.3)";
          }}
        >
          Sign Up
        </button>
      </div>
      
      {/* HERO SECTION */}
      <div className="login-hero-banner">
        <div className="hero-content">
          <div className="hero-brand-pill">
            <span className="pulse-dot"></span>
            <span>SYSTEM ACCESS</span>
          </div>
          <h1 
            className="hero-title"
            style={{
              color: "white",
              WebkitTextFillColor: "white",
              background: "none",
              WebkitBackgroundClip: "unset",
              backgroundClip: "unset",
              textShadow: "none"
            }}
          >
            COREPULSE
          </h1>
          <h2 
            className="hero-subtitle"
            style={{
              color: "#e2e8f0",
              WebkitTextFillColor: "#e2e8f0",
              background: "none",
              WebkitBackgroundClip: "unset",
              backgroundClip: "unset",
              textShadow: "none"
            }}
          >
            Smart Hospital Management Ecosystem
          </h2>
          <div className="hero-tags">
            <span className="tag">Connecting Doctors</span>
            <span className="tag-dot">•</span>
            <span className="tag">Nurses</span>
            <span className="tag-dot">•</span>
            <span className="tag">Receptionists</span>
            <span className="tag-dot">•</span>
            <span className="tag">Patients</span>
          </div>
        </div>
      </div>

      {/* LOGIN CARDS SECTION */}
      <div className="login-cards-container">
        
        {/* STAFF LOGIN CARD */}
        <div className={`login-card staff-card ${expandedCard === "staff" ? "expanded" : "collapsed"}`}>
          <div className="card-header" onClick={() => toggleCard("staff")}>
            <div className="card-icon staff-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <h3>Staff Login</h3>
            <p>Access your dashboard</p>
            <div className="expand-indicator">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>

          <div className="card-body">
            <div className="form-group">
              <label>Username</label>
              <input
                name="username"
                type="text"
                placeholder="Enter username"
                value={staffForm.username}
                onChange={handleStaffChange}
                onKeyPress={handleStaffKeyPress}
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                name="password"
                type="password"
                placeholder="Enter password"
                value={staffForm.password}
                onChange={handleStaffChange}
                onKeyPress={handleStaffKeyPress}
              />
            </div>

            {staffError && <div className="error-msg">{staffError}</div>}

            <button 
              className="login-btn staff-btn" 
              onClick={handleStaffLogin} 
              disabled={staffLoading}
            >
              {staffLoading ? "Authenticating..." : "Login as Staff"}
            </button>
            <div className="card-footer">
              <Link to="/reset">Forgot Password?</Link>
            </div>
          </div>
        </div>

        {/* PATIENT LOGIN CARD */}
        <div className={`login-card patient-card ${expandedCard === "patient" ? "expanded" : "collapsed"}`}>
          <div className="card-header" onClick={() => toggleCard("patient")}>
            <div className="card-icon patient-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
            </div>
            <h3>Patient Login</h3>
            <p>View your records & history</p>
            <div className="expand-indicator">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>

          <div className="card-body">
            <div className="form-group">
              <label>PRN Number</label>
              <input
                name="prn"
                type="text"
                placeholder="Enter PRN"
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
              {patientLoading ? "Authenticating..." : "Login as Patient"}
            </button>
            <div className="card-footer">
              <span>Secure encrypted connection</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;