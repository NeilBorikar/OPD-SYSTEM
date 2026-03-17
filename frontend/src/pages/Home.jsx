import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {

  if (!query.trim()) {
    alert("Please enter PRN or patient name");
    return;
  }

  navigate("/history", { state: { prn: query } });

};

  return (
    <div style={styles.container}>
      <h1>OPD Management System</h1>

      <div style={styles.card}>
        <h2>Patient Lookup</h2>
        <div style={styles.searchContainer}>
          <input
            type="text"
            placeholder="Enter Name or PRN"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={styles.input}
          />
          <button onClick={handleSearch} style={styles.button}>
            Search
          </button>
        </div>
      </div>

      <div style={styles.grid}>
        <div style={styles.roleCard} onClick={() => navigate("/login")}>
          <h3>Doctor Portal</h3>
          <p>Login as Doctor to manage patients & assign tasks.</p>
        </div>
        <div style={styles.roleCard} onClick={() => navigate("/nurse-login")}>
          <h3>Nurse Portal</h3>
          <p>Login as Nurse to view your assigned patients & tasks.</p>
        </div>
        <div style={styles.roleCard} onClick={() => navigate("/receptionist-login")}>
          <h3>Receptionist Portal</h3>
          <p>Login as Receptionist to view patient assignments & rooms.</p>
        </div>
        <div style={styles.roleCard} onClick={() => navigate("/patient-login")}>
          <h3>Patient Portal</h3>
          <p>Login as Patient to view your own history & medications.</p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "2rem",
    textAlign: "center",
    backgroundColor: "#F3F4F6",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  card: {
    backgroundColor: "white",
    padding: "2rem",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    marginBottom: "2rem",
    width: "100%",
    maxWidth: "600px"
  },
  searchContainer: {
    display: "flex",
    gap: "10px",
    justifyContent: "center",
    flexWrap: "wrap"
  },
  input: {
    padding: "12px",
    flex: "1 1 200px",
    borderRadius: "8px",
    border: "1px solid #D1D5DB",
    fontSize: "1rem"
  },
  button: {
    padding: "12px 24px",
    backgroundColor: "#2563EB",
    border: "none",
    borderRadius: "8px",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background-color 0.2s"
  },
  grid: {
    display: "flex",
    gap: "20px",
    justifyContent: "center",
    flexWrap: "wrap",
    width: "100%",
    maxWidth: "1000px"
  },
  roleCard: {
    backgroundColor: "white",
    padding: "1.5rem",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    flex: "1 1 200px",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
    textAlign: "left"
  }
};

export default Home;