import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/global.css";
import "../styles/login.css";

const SuperAdminLogin = () => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!password) {
      setError("Password required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/AEGIS@12250510/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("super_admin", "true");
        navigate("/super-admin-dashboard");
      } else {
        setError(data.detail || "Authentication Failed");
      }
    } catch (err) {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper" style={{ justifyContent: "center", alignItems: "center" }}>
      <div className="login-card" style={{ maxWidth: "400px", padding: "2rem" }}>
        <h2 style={{ textAlign: "center", color: "#b91c1c", marginBottom: "0.5rem" }}>SYSTEM OVERRIDE</h2>
        <p style={{ textAlign: "center", color: "#64748b", marginBottom: "2rem" }}>AEGIS Protocol Authorized Personnel Only</p>
        
        <div className="form-group">
          <label>Authorization Code</label>
          <input
            type="password"
            placeholder="Enter secure passcode"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
        </div>
        
        {error && <div className="error-msg">{error}</div>}
        
        <button 
          className="login-btn" 
          onClick={handleLogin} 
          disabled={loading}
          style={{ background: "linear-gradient(135deg, #b91c1c, #991b1b)" }}
        >
          {loading ? "Verifying..." : "Access Mainframe"}
        </button>
      </div>
    </div>
  );
};

export default SuperAdminLogin;
