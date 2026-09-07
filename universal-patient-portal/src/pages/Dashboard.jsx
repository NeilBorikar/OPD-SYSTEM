import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUniversalHistory, getSummary } from "../services/api";
import { Sparkles } from "lucide-react";

const Dashboard = () => {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
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
        const [historyData, summaryData] = await Promise.all([
          getUniversalHistory(prn),
          getSummary(prn).catch(() => null) // don't break if summary fails
        ]);
        setRecords(historyData);
        if (summaryData) setSummary(summaryData);
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
      <div style={styles.content}>
        
        {/* AI Summary Card */}
        <div style={styles.aiCard}>
          <div style={styles.aiHeader}>
            <Sparkles size={20} color="#0ea5e9" />
            <h3>AI Health Summary</h3>
          </div>
          {summary ? (
            <>
              <p style={styles.aiText}>{summary.summary_text}</p>
              {summary.stats && (
                <div style={styles.statsGrid}>
                  <div style={styles.statBox}>
                    <h4>Total Visits</h4>
                    <p>{summary.stats.total_consultations}</p>
                  </div>
                  <div style={styles.statBox}>
                    <h4>Clinics Visited</h4>
                    <p>{summary.stats.clinics_visited}</p>
                  </div>
                  <div style={styles.statBox}>
                    <h4>Prescriptions</h4>
                    <p>{summary.stats.total_prescriptions}</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p style={{ color: "#64748b" }}>Generating summary...</p>
          )}
        </div>

        <h2 style={{ marginBottom: "1.5rem", color: "#334155" }}>Your Global Consultation History</h2>
        
        {loading ? (
          <div className="loading" style={{ height: "100px" }}></div>
        ) : records.length === 0 ? (
          <p>No consultations found across any clinic.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {records.map((record) => (
              <div key={record._id} className="card" style={styles.card}>
                <div style={styles.cardHeader}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <span style={styles.clinicBadge}>Clinic: {record.clinic_id || "Unknown"}</span>
                    <span style={styles.date}>{record.consultationDate || "No date"}</span>
                  </div>
                  {record.severityIndex && (
                    <span style={{...styles.severityBadge, ...getSeverityStyle(record.severityIndex)}}>
                      {record.severityIndex.toUpperCase()}
                    </span>
                  )}
                </div>
                
                <div style={styles.grid2Col}>
                  <div>
                    <h3 style={styles.sectionTitle}>Clinical Assessment</h3>
                    <p style={styles.recordText}><strong>Diagnosis:</strong> {record.diagnosis || "None recorded"}</p>
                    <p style={styles.recordText}><strong>Complaints:</strong> {record.complaints || "None recorded"}</p>
                    {record.examination && <p style={styles.recordText}><strong>Examination:</strong> {record.examination}</p>}
                    {record.past_history && <p style={styles.recordText}><strong>Past History:</strong> {record.past_history}</p>}
                  </div>
                  
                  <div>
                    <h3 style={styles.sectionTitle}>Vitals</h3>
                    <div style={styles.vitalsGrid}>
                      <div style={styles.vitalItem}><span>BP</span> <strong>{record.bp || "-"}</strong></div>
                      <div style={styles.vitalItem}><span>Pulse</span> <strong>{record.pulse || "-"}</strong></div>
                      <div style={styles.vitalItem}><span>SpO2</span> <strong>{record.spo2 || "-"}</strong></div>
                      <div style={styles.vitalItem}><span>Weight</span> <strong>{record.weight ? `${record.weight}kg` : "-"}</strong></div>
                    </div>
                  </div>
                </div>

                <div style={styles.grid2Col}>
                  {record.medicines && record.medicines.length > 0 && (
                    <div>
                      <h3 style={styles.sectionTitle}>Prescription</h3>
                      <ul style={styles.medList}>
                        {record.medicines.map((med, idx) => (
                          <li key={idx} style={styles.medItem}>
                            <strong>{med.name}</strong>
                            <span>{med.dose}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <h3 style={styles.sectionTitle}>Doctor's Orders</h3>
                    <p style={styles.recordText}><strong>Advice:</strong> {record.advice || "None"}</p>
                    {record.investigations && <p style={styles.recordText}><strong>Investigations:</strong> {record.investigations}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const getSeverityStyle = (severity) => {
  switch(severity.toLowerCase()) {
    case 'critical': return { background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca' };
    case 'severe': return { background: '#fffbeb', color: '#f59e0b', border: '1px solid #fde68a' };
    default: return { background: '#f0fdf4', color: '#22c55e', border: '1px solid #bbf7d0' };
  }
};

const styles = {
  page: {
    minHeight: "100vh",
    fontFamily: "'Inter', sans-serif"
  },
  content: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "2rem"
  },
  aiCard: {
    background: "linear-gradient(to right, #f0f9ff, #e0f2fe)",
    borderRadius: "16px",
    padding: "1.5rem 2rem",
    marginBottom: "2.5rem",
    border: "1px solid #bae6fd",
    boxShadow: "0 4px 6px -1px rgba(14, 165, 233, 0.1)"
  },
  aiHeader: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginBottom: "1rem"
  },
  aiText: {
    fontSize: "1.05rem",
    lineHeight: "1.6",
    color: "#0f172a",
    marginBottom: "1.5rem"
  },
  statsGrid: {
    display: "flex",
    gap: "1rem",
    flexWrap: "wrap"
  },
  statBox: {
    background: "white",
    padding: "1rem",
    borderRadius: "12px",
    flex: 1,
    minWidth: "120px",
    border: "1px solid #e0f2fe",
    textAlign: "center"
  },
  card: {
    padding: "2rem",
    marginBottom: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem"
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #e2e8f0",
    paddingBottom: "1rem",
  },
  clinicBadge: {
    background: "#eff6ff",
    color: "#2563eb",
    padding: "0.4rem 1rem",
    borderRadius: "999px",
    fontSize: "0.85rem",
    fontWeight: "700",
    border: "1px solid #bfdbfe"
  },
  severityBadge: {
    padding: "0.3rem 0.75rem",
    borderRadius: "6px",
    fontSize: "0.75rem",
    fontWeight: "bold",
    letterSpacing: "0.5px"
  },
  date: {
    color: "#64748b",
    fontSize: "0.95rem",
    fontWeight: "500"
  },
  grid2Col: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "2rem",
  },
  sectionTitle: {
    fontSize: "1rem",
    color: "#0f172a",
    margin: "0 0 1rem 0",
    borderBottom: "2px solid #f1f5f9",
    paddingBottom: "0.5rem"
  },
  recordText: {
    fontSize: "0.9rem",
    color: "#475569",
    margin: "0 0 0.5rem 0",
    lineHeight: "1.5"
  },
  vitalsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0.75rem"
  },
  vitalItem: {
    background: "#f8fafc",
    padding: "0.75rem",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
    border: "1px solid #f1f5f9"
  },
  medList: {
    margin: 0,
    padding: 0,
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem"
  },
  medItem: {
    background: "#f8fafc",
    padding: "0.75rem 1rem",
    borderRadius: "8px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "0.9rem",
    border: "1px solid #e2e8f0"
  }
};

export default Dashboard;
