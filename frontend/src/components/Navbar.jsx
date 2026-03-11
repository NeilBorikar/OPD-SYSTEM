import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav style={styles.nav}>
      <h2 style={styles.logo}>NeuroCare OPD</h2>
      <div>
        <Link to="/" style={styles.link}>Home</Link>
        <Link to="/register" style={styles.link}>Register</Link>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    padding: "15px 40px",
    backgroundColor: "#0F172A",
    color: "white"
  },
  logo: {
    color: "#06B6D4"
  },
  link: {
    marginLeft: "20px",
    color: "white",
    textDecoration: "none"
  }
};

export default Navbar;