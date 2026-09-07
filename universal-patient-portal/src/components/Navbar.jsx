import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Clock, TrendingUp, MessageSquare, FileText, LogOut } from "lucide-react";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const prn = localStorage.getItem("universal_prn");

  const handleLogout = () => {
    localStorage.removeItem("universal_prn");
    navigate("/");
  };

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { path: "/timeline", label: "Timeline", icon: <Clock size={18} /> },
    { path: "/trends", label: "Trends", icon: <TrendingUp size={18} /> },
    { path: "/ask", label: "Ask Records", icon: <MessageSquare size={18} /> },
    { path: "/report", label: "Health Report", icon: <FileText size={18} /> },
  ];

  if (!prn) return null;

  return (
    <nav style={styles.navbar}>
      <div style={styles.brandContainer}>
        <div className="pulse-animation-container" style={{ width: "80px", height: "30px" }}>
          <svg className="pulse-line" viewBox="0 0 200 50" preserveAspectRatio="none">
            <path d="M0,25 L50,25 L60,10 L75,40 L85,25 L200,25" fill="none" stroke="#0ea5e9" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
          </svg>
        </div>
        <h2 style={styles.brandName}>COREPULSE <span style={styles.brandSub}>UNIVERSAL</span></h2>
      </div>

      <div style={styles.linksContainer}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path} 
              style={{ ...styles.link, ...(isActive ? styles.activeLink : {}) }}
            >
              {item.icon}
              <span style={styles.linkLabel}>{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div style={styles.userSection}>
        <div style={styles.prnBadge}>PRN: {prn}</div>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "1rem 2rem",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
    borderBottom: "1px solid rgba(14, 165, 233, 0.3)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
    position: "sticky",
    top: 0,
    zIndex: 50,
  },
  brandContainer: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem"
  },
  brandName: {
    color: "white",
    margin: 0,
    fontSize: "1.25rem",
    fontWeight: "800",
    letterSpacing: "-0.5px"
  },
  brandSub: {
    color: "#0ea5e9",
    fontWeight: "600",
    fontSize: "0.85rem",
    letterSpacing: "1px"
  },
  linksContainer: {
    display: "flex",
    gap: "1rem",
    alignItems: "center"
  },
  link: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    color: "#94a3b8",
    textDecoration: "none",
    padding: "0.5rem 1rem",
    borderRadius: "8px",
    fontSize: "0.95rem",
    fontWeight: "500",
    transition: "all 0.2s ease"
  },
  activeLink: {
    color: "white",
    background: "rgba(14, 165, 233, 0.2)",
    border: "1px solid rgba(14, 165, 233, 0.3)",
  },
  linkLabel: {
    display: "inline-block"
  },
  userSection: {
    display: "flex",
    alignItems: "center",
    gap: "1rem"
  },
  prnBadge: {
    background: "rgba(255, 255, 255, 0.1)",
    color: "#e2e8f0",
    padding: "0.4rem 0.75rem",
    borderRadius: "999px",
    fontSize: "0.85rem",
    fontWeight: "600",
    border: "1px solid rgba(255, 255, 255, 0.2)"
  },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    background: "transparent",
    color: "#ef4444",
    border: "1px solid #ef4444",
    padding: "0.4rem 1rem",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.85rem",
    transition: "all 0.2s ease"
  }
};

export default Navbar;
