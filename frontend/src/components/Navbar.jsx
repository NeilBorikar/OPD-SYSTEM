import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="navbar-shell">
      <h2 className="navbar-logo">NeuroCare OPD</h2>
      <div className="navbar-links">
        <Link to="/home" className="navbar-link">Patient Lookup</Link>
        <Link to="/register" className="navbar-link">Register Patient</Link>
        <Link to="/consultation" className="navbar-link">Consultation</Link>
        <Link to="/login" className="navbar-link">Login</Link>
      </div>
    </nav>
  );
};

export default Navbar;