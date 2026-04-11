import { useState } from "react";
import { loginUnified } from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import "../styles/login.css";
import "../styles/global.css";

function Login() {
  const [form, setForm] = useState({
    username: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async () => {
    if (!form.username || !form.password) {
      alert("Please enter both username and password");
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginUnified(form);
      alert("Login Successful");

      if (res.role === "doctor") {
        localStorage.setItem("doctor_username", form.username);
        navigate("/doctor-dashboard");
      } else if (res.role === "nurse") {
        localStorage.setItem("nurse_username", form.username);
        navigate("/nurse", { state: { username: form.username } });
      } else if (res.role === "receptionist") {
        navigate("/reception-dashboard");
      }
    } catch (err) {
      console.error(err);
      alert("Invalid credentials / User not found");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="login-page">
      <div className="login-background">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">
              <span className="logo-icon">🏥</span>
            </div>
            <h2>Staff Login</h2>
            <p className="login-subtitle">Doctor / Nurse / Receptionist</p>
          </div>

          <div className="login-form">
            <div className="form-group">
              <label className="form-label">Username</label>
              <div className="input-wrapper">
                <span className="input-icon">👤</span>
                <input
                  name="username"
                  type="text"
                  placeholder="Enter your username"
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <input
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  className="form-input"
                  style={{ paddingLeft: '1.25rem' }}
                />
              </div>
            </div>

            <button 
              onClick={handleLogin}
              disabled={isLoading}
              className={`login-btn ${isLoading ? 'loading' : ''}`}
            >
              {isLoading ? (
                <span className="loading-spinner">⏳</span>
              ) : (
                <span>Login to Dashboard</span>
              )}
            </button>
          </div>

          <div className="login-footer">
            <Link to="/reset" className="forgot-password-link">
              Forgot Password?
            </Link>
          </div>

          <div className="login-divider">
            <span>OR</span>
          </div>

          <div className="alternative-logins">
            <Link to="/patient-login" className="alt-login-btn">
              <span className="alt-icon">👥</span>
              <span>Patient Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;