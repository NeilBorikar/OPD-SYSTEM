import { useState } from "react";
import HistoryCard from "../components/HistoryCard";
import { getPatientHistory } from "../services/api";
import { useLocation } from "react-router-dom";

const History = () => {

  const location = useLocation();
  const initialPRN = location.state?.prn || "";
  const [search, setSearch] = useState(initialPRN);
  const [records, setRecords] = useState([]);
  const [searched, setSearched] = useState(false);


  // Mock database (later MongoDB)
  

 const handleSearch = async () => {

  if (!search) return;

  try {

    const data = await getPatientHistory(search);
    console.log("API Response:", data);
    setRecords(data);

  } catch (error) {

    console.error("Error fetching history:", error);

  }

  setSearched(true);
};

  return (
    <div style={styles.container}>

      <h1 style={styles.title}>Patient History</h1>

      {/* SEARCH BAR */}

      <div style={styles.searchBox}>
        <input
          type="text"
          placeholder="Enter Patient Name or ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.input}
        />

        <button onClick={handleSearch} style={styles.button}>
          Search
        </button>
      </div>

      {/* RESULTS */}

      <div style={styles.results}>

        {!searched && (
          <p style={styles.message}>
            Search by PRN to view consultation history
          </p>
        )}

        {searched && records.length === 0 && (
          <p style={styles.message}>
            No history found for this patient
          </p>
        )}

        {records.map((record) => (
          <HistoryCard key={record._id} record={record} />
        ))}

      </div>

    </div>
  );
};

const styles = {

  container: {
    minHeight: "100vh",
    padding: "40px",
    backgroundColor: "#E0F2FE"
  },

  title: {
    textAlign: "center",
    marginBottom: "30px",
    color: "#0F172A"
  },

  searchBox: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "30px"
  },

  input: {
    padding: "12px",
    width: "300px",
    borderRadius: "8px",
    border: "1px solid #06B6D4"
  },

  button: {
    padding: "12px 20px",
    backgroundColor: "#06B6D4",
    border: "none",
    color: "white",
    borderRadius: "8px",
    cursor: "pointer"
  },

  results: {
    maxWidth: "700px",
    margin: "auto"
  },

  message: {
    textAlign: "center",
    color: "#475569"
  }

};

export default History;