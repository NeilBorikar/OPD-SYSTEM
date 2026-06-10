import { useState } from "react";
import { getPatientHistory } from "../services/api";
import HistoryCard from "../components/HistoryCard";

const Home = () => {
  const [query, setQuery] = useState("");
  const [records, setRecords] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [patientPRN, setPatientPRN] = useState("");

  const handleSearch = async () => {
    if (!query.trim()) {
      alert("Please enter PRN or patient name");
      return;
    }
    setLoading(true);
    setSearched(false);
    try {
      const data = await getPatientHistory(query.trim());
      setRecords(data);
      setPatientPRN(query.trim());
    } catch (err) {
      console.error("Error fetching history:", err);
      setRecords([]);
    } finally {
      setSearched(true);
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.headerSection}>
        <h1 style={styles.pageTitle}>Patient Lookup</h1>
        <p style={styles.pageSubtitle}>Search by PRN or patient name to view consultation history</p>
      </div>

      {/* Search Bar */}
      <div style={styles.searchCard}>
        <div style={styles.searchRow}>
          <div style={styles.inputWrapper}>
            <svg style={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Enter PRN or patient name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              style={styles.input}
            />
          </div>
          <button onClick={handleSearch} style={styles.searchBtn} disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </div>

      {/* Results */}
      <div style={styles.resultsArea}>
        {!searched && !loading && (
          <div style={styles.emptyState}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5">
              <path d="M9 12h6M9 16h6M9 8h2M17 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2z" />
            </svg>
            <p style={styles.emptyText}>Enter a PRN above to load patient history</p>
          </div>
        )}

        {loading && (
          <div style={styles.emptyState}>
            <div style={styles.spinner} />
            <p style={styles.emptyText}>Fetching records...</p>
          </div>
        )}

        {searched && !loading && records.length === 0 && (
          <div style={styles.emptyState}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#fca5a5" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M15 9l-6 6M9 9l6 6" />
            </svg>
            <p style={{ ...styles.emptyText, color: "#f87171" }}>No records found for <strong>"{patientPRN}"</strong></p>
          </div>
        )}

        {searched && !loading && records.length > 0 && (
          <>
            <div style={styles.resultsHeader}>
              <span style={styles.resultsBadge}>{records.length} record{records.length > 1 ? "s" : ""} found</span>
              <span style={styles.prnTag}>PRN: {patientPRN}</span>
            </div>
            {records.map((record) => (
              <HistoryCard key={record._id} record={record} />
            ))}
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f8fafc 0%, #f0f9ff 50%, #e0f2fe 100%)",
    padding: "2.5rem 2rem",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  headerSection: {
    textAlign: "center",
    marginBottom: "2rem",
  },
  pageTitle: {
    margin: "0 0 0.5rem",
    fontSize: "2rem",
    fontWeight: 800,
    color: "#0f172a",
  },
  pageSubtitle: {
    margin: 0,
    fontSize: "1rem",
    color: "#64748b",
  },
  searchCard: {
    background: "white",
    borderRadius: "16px",
    padding: "1.5rem",
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
    maxWidth: "700px",
    margin: "0 auto 2rem",
    border: "1px solid rgba(14,165,233,0.15)",
  },
  searchRow: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },
  inputWrapper: {
    flex: 1,
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  searchIcon: {
    position: "absolute",
    left: "14px",
    width: "18px",
    height: "18px",
    pointerEvents: "none",
  },
  input: {
    width: "100%",
    padding: "0.85rem 1rem 0.85rem 2.75rem",
    border: "1.5px solid #e2e8f0",
    borderRadius: "10px",
    fontSize: "0.95rem",
    color: "#0f172a",
    outline: "none",
    fontFamily: "inherit",
    transition: "border-color 0.2s",
  },
  searchBtn: {
    padding: "0.85rem 1.75rem",
    background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "0.95rem",
    fontWeight: 700,
    cursor: "pointer",
    whiteSpace: "nowrap",
    fontFamily: "inherit",
    boxShadow: "0 4px 12px rgba(14,165,233,0.3)",
    transition: "opacity 0.2s",
  },
  resultsArea: {
    maxWidth: "700px",
    margin: "0 auto",
  },
  resultsHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "1rem",
  },
  resultsBadge: {
    background: "#dcfce7",
    color: "#166534",
    fontSize: "0.8rem",
    fontWeight: 700,
    padding: "4px 12px",
    borderRadius: "999px",
    border: "1px solid #bbf7d0",
  },
  prnTag: {
    background: "#eff6ff",
    color: "#1d4ed8",
    fontSize: "0.8rem",
    fontWeight: 600,
    padding: "4px 12px",
    borderRadius: "999px",
    border: "1px solid #bfdbfe",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1rem",
    padding: "3rem",
    background: "white",
    borderRadius: "16px",
    border: "1.5px dashed #e2e8f0",
  },
  emptyText: {
    margin: 0,
    color: "#94a3b8",
    fontSize: "0.95rem",
  },
  spinner: {
    width: "36px",
    height: "36px",
    border: "3px solid rgba(14,165,233,0.2)",
    borderTopColor: "#0ea5e9",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
};

export default Home;