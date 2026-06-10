import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/navbar.css";
import "../styles/global.css";

const ModernNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const userRole = localStorage.getItem("user_role");
  const isDoctor = userRole === "doctor";
  const isLoggedIn = !!userRole;

  const isActiveRoute = (path) => location.pathname === path;

  // Only doctors see these nav links
  const doctorNavLinks = [
    { to: "/home", label: "Patient Lookup" },
    { to: "/register", label: "Register Patient" },
    { to: "/consultation", label: "Consultation" },
    { to: "/doctor-dashboard", label: "🏠 Dashboard" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("user_role");
    localStorage.removeItem("doctor_username");
    localStorage.removeItem("nurse_username");
    localStorage.removeItem("receptionist_username");
    localStorage.removeItem("patient_prn");
    setIsMobileMenuOpen(false);
    navigate("/login");
  };

  // Hide navbar entirely on dashboard pages that have their own nav
  const hiddenRoutes = ["/patient-dashboard"];
  if (hiddenRoutes.includes(location.pathname)) return null;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <div className="brand-text">
            <h1>NeuroCare OPD Management</h1>
            <span className="tagline">Advanced Healthcare Management</span>
          </div>
        </div>

        <div className="nav-links-desktop">
          {/* Doctor nav links — only visible when logged in as doctor */}
          {isDoctor && doctorNavLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-link ${isActiveRoute(link.to) ? "active" : ""}`}
            >
              <span className="nav-label">{link.label}</span>
            </Link>
          ))}

          {/* Logout (when logged in) or Login (when not logged in) */}
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="nav-link login-btn"
              style={{ background: "linear-gradient(135deg, #dc2626, #b91c1c)", border: "none", cursor: "pointer" }}
            >
              <span className="nav-label">Logout</span>
            </button>
          ) : (
            <Link to="/login" className="nav-link login-btn">
              <span className="nav-label">Login</span>
            </Link>
          )}
        </div>

        <button
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="mobile-menu">
          {isDoctor && doctorNavLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`mobile-nav-link ${isActiveRoute(link.to) ? "active" : ""}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="nav-label">{link.label}</span>
            </Link>
          ))}

          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="mobile-nav-link login-btn"
              style={{ background: "linear-gradient(135deg, #dc2626, #b91c1c)", border: "none", cursor: "pointer", width: "calc(100% - 3rem)" }}
            >
              <span className="nav-label">Logout</span>
            </button>
          ) : (
            <Link
              to="/login"
              className="mobile-nav-link login-btn"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="nav-label">Login</span>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default ModernNavbar;
