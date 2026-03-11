import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";


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
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={styles.container}
    >
      <h1>Patient Lookup</h1>

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
    </motion.div>
  );
};

const styles = {
  container: {
    padding: "50px",
    textAlign: "center",
    backgroundColor: "#E0F2FE",
    minHeight: "100vh"
  },
  input: {
    padding: "12px",
    width: "300px",
    marginRight: "10px",
    borderRadius: "8px",
    border: "1px solid #06B6D4"
  },
  button: {
    padding: "12px 20px",
    backgroundColor: "#06B6D4",
    border: "none",
    borderRadius: "8px",
    color: "white",
    cursor: "pointer"
  }
};

export default Home;