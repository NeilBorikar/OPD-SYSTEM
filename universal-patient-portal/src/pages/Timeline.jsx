import { useState, useEffect } from "react";
import { getTimeline } from "../services/api";
import { Activity, Clock, MapPin, Pill, ArrowRight } from "lucide-react";

const Timeline = () => {
  const [timelineData, setTimelineData] = useState(null);
  const [loading, setLoading] = useState(true);
  const prn = localStorage.getItem("universal_prn");

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const data = await getTimeline(prn);
        setTimelineData(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (prn) fetchTimeline();
  }, [prn]);

  if (loading) {
    return (
      <div style={styles.container}>
        <div className="loading" style={{ height: "200px" }}></div>
        <p style={{ textAlign: "center", color: "#64748b" }}>Generating AI Timeline...</p>
      </div>
    );
  }

  if (!timelineData || !timelineData.timeline || timelineData.timeline.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState}>No medical records found to generate a timeline.</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Your Health Timeline</h1>
        <p style={styles.subtitle}>AI-generated chronological narrative of your visits.</p>
      </div>

      <div style={styles.timelineContainer}>
        {timelineData.timeline.map((entry, idx) => (
          <div key={idx} style={styles.timelineItem}>
            <div style={styles.timelineIcon}>
              <Activity size={20} color="white" />
            </div>
            
            <div style={styles.timelineCard}>
              <div style={styles.cardHeader}>
                <div style={styles.dateBadge}>
                  <Clock size={14} />
                  <span>{entry.date}</span>
                </div>
                <div style={styles.clinicBadge}>
                  <MapPin size={14} />
                  <span>{entry.clinic}</span>
                </div>
              </div>
              
              <p style={styles.narrative}>{entry.narrative}</p>
              
              <div style={styles.cardFooter}>
                {entry.medicines_count > 0 && (
                  <div style={styles.tag}>
                    <Pill size={14} />
                    <span>{entry.medicines_count} medicines</span>
                  </div>
                )}
                {entry.has_followup && (
                  <div style={{ ...styles.tag, background: "#fef3c7", color: "#d97706" }}>
                    <ArrowRight size={14} />
                    <span>Follow-up recommended</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <p style={styles.disclaimer}>
        This timeline summarizes data recorded in your CorePulse account. It is not a medical diagnosis or treatment recommendation. Please discuss any concerns with your healthcare provider.
      </p>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "2rem"
  },
  header: {
    marginBottom: "3rem",
    textAlign: "center"
  },
  title: {
    fontSize: "2rem",
    color: "#0f172a",
    marginBottom: "0.5rem"
  },
  subtitle: {
    color: "#64748b",
    fontSize: "1.1rem"
  },
  emptyState: {
    padding: "3rem",
    textAlign: "center",
    background: "white",
    borderRadius: "12px",
    border: "1px dashed #cbd5e1",
    color: "#64748b"
  },
  timelineContainer: {
    position: "relative",
    paddingLeft: "2rem"
  },
  timelineItem: {
    position: "relative",
    paddingBottom: "3rem"
  },
  timelineIcon: {
    position: "absolute",
    left: "-3rem",
    top: 0,
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 10px rgba(14, 165, 233, 0.3)",
    zIndex: 10
  },
  timelineCard: {
    background: "white",
    padding: "1.5rem",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
    position: "relative"
  },
  cardHeader: {
    display: "flex",
    gap: "1rem",
    marginBottom: "1rem"
  },
  dateBadge: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    background: "#f1f5f9",
    color: "#475569",
    padding: "0.4rem 0.75rem",
    borderRadius: "8px",
    fontSize: "0.85rem",
    fontWeight: "600"
  },
  clinicBadge: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    background: "#eff6ff",
    color: "#2563eb",
    padding: "0.4rem 0.75rem",
    borderRadius: "8px",
    fontSize: "0.85rem",
    fontWeight: "600"
  },
  narrative: {
    color: "#334155",
    lineHeight: "1.6",
    fontSize: "1.05rem",
    marginBottom: "1.5rem"
  },
  cardFooter: {
    display: "flex",
    gap: "1rem",
    borderTop: "1px solid #f1f5f9",
    paddingTop: "1rem"
  },
  tag: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    background: "#f0fdf4",
    color: "#16a34a",
    padding: "0.3rem 0.75rem",
    borderRadius: "999px",
    fontSize: "0.8rem",
    fontWeight: "600"
  },
  disclaimer: {
    marginTop: "4rem",
    fontSize: "0.8rem",
    color: "#94a3b8",
    textAlign: "center",
    padding: "1rem",
    background: "#f8fafc",
    borderRadius: "8px"
  }
};

export default Timeline;
