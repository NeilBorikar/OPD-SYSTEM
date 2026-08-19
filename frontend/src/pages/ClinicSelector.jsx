import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getClinics } from "../services/api";
import "../styles/global.css";

const ClinicSelector = () => {
  const [clinics, setClinics] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const data = await getClinics();
        setClinics(data);
      } catch (e) {
        console.error("Error fetching clinics:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchClinics();
  }, []);

  const handleProceed = () => {
    if (selectedClinic) {
      localStorage.setItem("clinic_id", selectedClinic);
      sessionStorage.setItem("login_active", "true");
      navigate("/login");
    }
  };

  return (
    <div style={styles.page}>
      
      <div style={styles.card}>
        <h1 style={{ color: "#0f172a", marginBottom: "0.5rem" }}>Select Clinic</h1>
        <p style={{ color: "#64748b", marginBottom: "2rem" }}>Choose your clinic to proceed to the portal</p>
        
        {loading ? (
          <p>Loading clinics...</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <select 
              value={selectedClinic} 
              onChange={e => setSelectedClinic(e.target.value)}
              style={styles.select}
            >
              <option value="" disabled>Select a clinic...</option>
              {clinics.map(c => (
                <option key={c.id} value={c.clinic_id}>{c.name} ({c.clinic_id})</option>
              ))}
            </select>
            
            <button 
              onClick={handleProceed} 
              disabled={!selectedClinic}
              style={{...styles.proceedBtn, opacity: selectedClinic ? 1 : 0.5}}
            >
              Proceed to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f8fafc 0%, #f0f9ff 50%, #e0f2fe 100%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    position: "relative"
  },
  card: {
    background: "white",
    padding: "3rem",
    borderRadius: "16px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
    textAlign: "center",
    maxWidth: "500px",
    width: "100%"
  },
  select: {
    padding: "1rem",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    fontSize: "1rem",
    width: "100%",
    outline: "none"
  },
  proceedBtn: {
    padding: "1rem",
    background: "#0ea5e9",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    fontSize: "1rem",
    cursor: "pointer"
  }
};

export default ClinicSelector;
