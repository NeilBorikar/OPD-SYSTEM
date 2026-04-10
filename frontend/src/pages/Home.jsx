import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Home = () => {
  const [query, setQuery] = useState("");
  const [hint, setHint] = useState(null);
  const navigate = useNavigate();

  const handleSearch = () => {
    if (!query.trim()) {
      setHint("Enter a patient name or PRN to search.");
      return;
    }
    setHint(null);
    navigate("/history", { state: { prn: query } });
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="page-bleed">
      <motion.div
        className="page-hero"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1>Patient lookup</h1>
        <p>
          Search by patient name or PRN to open their consultation history in one
          click.
        </p>
      </motion.div>

      <motion.div
        className="search-panel"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
      >
        <div className="search-wrap">
          <input
            type="text"
            placeholder="Name or PRN…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (hint) setHint(null);
            }}
            onKeyDown={onKeyDown}
            aria-label="Patient name or PRN"
            aria-invalid={!!hint}
          />
        </div>
        <button type="button" className="btn btn-primary" onClick={handleSearch}>
          Search records
        </button>
      </motion.div>

      {hint && (
        <p
          className="auth-banner auth-banner--err"
          style={{ maxWidth: 520, margin: "-0.5rem auto 1.25rem", textAlign: "center" }}
          role="alert"
        >
          {hint}
        </p>
      )}

      <motion.div
        className="card-surface"
        style={{ padding: "1.5rem 1.75rem", maxWidth: 520, margin: "0 auto" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.4 }}
      >
        <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--nc-muted)" }}>
          <strong style={{ color: "var(--nc-text)" }}>Tip:</strong> After search,
          use <strong>Consultation</strong> to start a new visit or{" "}
          <strong>Register</strong> for a first-time patient.
        </p>
      </motion.div>
    </div>
  );
};

export default Home;
