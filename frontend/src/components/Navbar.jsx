import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav style={styles.nav}>
      <h2 style={styles.logo}>NeuroCare OPD</h2>
      <div>
        <Link to="/home" style={styles.link}>Patient Lookup</Link>
        <Link to="/register" style={styles.link}>Register Patient</Link>
        <Link to="/consultation" style={styles.link}>Consultation</Link>
        <Link to="/login" style={styles.link}>Login</Link>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 40px",
    backgroundColor: "#0F172A",
    color: "white",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
  },
  logo: {
    color: "#06B6D4",
    margin: 0,
    fontSize: "24px",
    fontWeight: "bold"
  },
  link: {
    marginLeft: "30px",
    color: "white",
    textDecoration: "none",
    fontSize: "15px",
    fontWeight: "500",
    transition: "color 0.3s",
    cursor: "pointer"
  }
};

export default Navbar;