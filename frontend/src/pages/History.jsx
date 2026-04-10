import { useState } from "react";
import HistoryCard from "../components/HistoryCard";
import { getPatientHistory } from "../services/api";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";

const History = () => {
  const location = useLocation();
  const initialPRN = location.state?.prn || "";
  const [search, setSearch] = useState(initialPRN);
  const [records, setRecords] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!search.trim()) return;
    setLoading(true);
    try {
      const data = await getPatientHistory(search);
      console.log("API Response:", data);
      setRecords(data);
    } catch (error) {
      console.error("Error fetching history:", error);
      setRecords([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  return (
    <div className="page-bleed history-layout">
      <motion.div
        className="page-hero"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1>Patient history</h1>
        <p>Pull prior consultations by PRN or identifier to review care over time.</p>
      </motion.div>

      <motion.div
        className="search-panel"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.06 }}
      >
        <div className="search-wrap">
          <input
            type="text"
            placeholder="Patient name or ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            aria-label="Search patient history"
          />
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </motion.div>

      <div>
        {!searched && (
          <motion.div
            className="card-surface history-empty"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
          >
            <div className="history-empty-icon" aria-hidden>
              ◎
            </div>
            <p style={{ margin: 0, fontSize: "1rem" }}>Search by PRN to load consultation history</p>
            <p style={{ margin: "0.5rem 0 0", fontSize: "0.875rem", opacity: 0.85 }}>
              Results appear as expandable cards below.
            </p>
          </motion.div>
        )}

        {searched && records.length === 0 && (
          <motion.div
            className="card-surface history-empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="history-empty-icon" aria-hidden>
              ∅
            </div>
            <p style={{ margin: 0 }}>No history found for this patient.</p>
          </motion.div>
        )}

        {records.map((record, i) => (
          <motion.div
            key={record._id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: Math.min(i * 0.06, 0.36) }}
          >
            <HistoryCard record={record} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default History;
