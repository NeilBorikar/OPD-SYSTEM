import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("authToken");
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("username");
    closeMenu();
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    `topnav-link${isActive ? " topnav-link--active" : ""}`;

  return (
    <header className="topnav">
      <Link to={isLoggedIn ? "/home" : "/login"} className="topnav-brand" onClick={closeMenu}>
        <span className="topnav-brand-mark">Clinical workspace</span>
        <span className="topnav-brand-title">NeuroCare OPD</span>
      </Link>

      <div className="topnav-spacer" aria-hidden />

      {isLoggedIn && (
        <>
          <nav
            className={`topnav-links${menuOpen ? " topnav-links--open" : ""}`}
            aria-label="Main"
          >
            <NavLink to="/home" className={linkClass} onClick={closeMenu}>
              Patient lookup
            </NavLink>
            <NavLink to="/register" className={linkClass} onClick={closeMenu}>
              Register
            </NavLink>
            <NavLink to="/consultation" className={linkClass} onClick={closeMenu}>
              Consultation
            </NavLink>
            <NavLink to="/history" className={linkClass} onClick={closeMenu}>
              History
            </NavLink>
          </nav>

          <button
            type="button"
            className="topnav-burger"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span />
            <span />
            <span />
          </button>
        </>
      )}

      <div className="topnav-actions">
        {isLoggedIn ? (
          <button type="button" className="btn-nav btn-nav--ghost" onClick={handleLogout}>
            Log out
          </button>
        ) : (
          <NavLink to="/login" className="btn-nav btn-nav--primary">
            Sign in
          </NavLink>
        )}
      </div>
    </header>
  );
};

export default Navbar;
