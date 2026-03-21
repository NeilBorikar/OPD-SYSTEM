import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import "../styles/navbar.css";
import "../styles/global.css";

const ModernNavbar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActiveRoute = (path) => location.pathname === path;

  const navLinks = [
    { to: "/home", label: "Patient Lookup" },
    { to: "/register", label: "Register Patient" },
    { to: "/consultation", label: "Consultation" },
    { to: "/history", label: "History" },
  ];

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
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-link ${isActiveRoute(link.to) ? "active" : ""}`}
            >
              <span className="nav-label">{link.label}</span>
            </Link>
          ))}
          <Link to="/login" className="nav-link login-btn">
            <span className="nav-label">Login</span>
          </Link>
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
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`mobile-nav-link ${isActiveRoute(link.to) ? "active" : ""}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="nav-label">{link.label}</span>
            </Link>
          ))}
          <Link
            to="/login"
            className="mobile-nav-link login-btn"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span className="nav-label">Login</span>
          </Link>
        </div>
      )}
    </nav>
  );
};

export default ModernNavbar;
