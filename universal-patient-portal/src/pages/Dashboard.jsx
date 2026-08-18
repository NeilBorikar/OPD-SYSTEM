import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUniversalHistory } from "../services/api";

const Dashboard = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const prn = localStorage.getItem("universal_prn");
  const navigate = useNavigate();

  useEffect(() => {
    if (!prn) {
      navigate("/");
      return;
    }
    const fetchData = async () => {
      try {
        const data = await getUniversalHistory(prn);
        setRecords(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [prn, navigate]);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Universal Dashboard</h1>
          <p style={styles.subtitle}>PRN: {prn}</p>
        </div>
        <button 
          onClick={() => { localStorage.removeItem("universal_prn"); navigate("/"); }}
          style={styles.logoutBtn}
        >
          Logout
        </button>
      </div>

      <div style={styles.content}>
        <h2 style={{ marginBottom: "1rem", color: "#334155" }}>Your Global Consultation History</h2>
        
        {loading ? (
          <p>Loading your records...</p>
        ) : records.length === 0 ? (
          <p>No consultations found across any clinic.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {records.map((record) => (
              <div key={record._id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <span style={styles.clinicBadge}>Clinic: {record.clinic_id || "Unknown"}</span>
                  <span style={styles.date}>{record.consultationDate || "No date"}</span>
                </div>
                <h3 style={{ margin: "0.5rem 0", color: "#0f172a" }}>Diagnosis: {record.diagnosis}</h3>
                <p style={{ margin: "0.5rem 0", color: "#475569" }}><strong>Complaints:</strong> {record.complaints}</p>
                <p style={{ margin: "0.5rem 0", color: "#475569" }}><strong>Advice:</strong> {record.advice}</p>
                
                {record.medicines && record.medicines.length > 0 && (
                  <div style={{ marginTop: "1rem", background: "#f8fafc", padding: "1rem", borderRadius: "8px" }}>
                    <h4 style={{ margin: "0 0 0.5rem 0", color: "#334155" }}>Prescription</h4>
                    <ul style={{ margin: 0, paddingLeft: "1.5rem" }}>
                      {record.medicines.map((med, idx) => (
                        <li key={idx} style={{ color: "#475569" }}>{med.name} - {med.dose}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f1f5f9",
    fontFamily: "system-ui, sans-serif"
  },
  header: {
    background: "white",
    padding: "1.5rem 2rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
  },
  title: {
    margin: 0,
    color: "#0f172a",
    fontSize: "1.5rem"
  },
  subtitle: {
    margin: "0.25rem 0 0 0",
    color: "#64748b"
  },
  logoutBtn: {
    padding: "0.5rem 1rem",
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold"
  },
  content: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "2rem"
  },
  card: {
    background: "white",
    padding: "1.5rem",
    borderRadius: "12px",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)"
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #e2e8f0",
    paddingBottom: "0.75rem",
    marginBottom: "0.75rem"
  },
  clinicBadge: {
    background: "#dbeafe",
    color: "#1d4ed8",
    padding: "0.25rem 0.75rem",
    borderRadius: "9999px",
    fontSize: "0.875rem",
    fontWeight: "bold"
  },
  date: {
    color: "#64748b",
    fontSize: "0.875rem"
  }
};

export default Dashboard;
