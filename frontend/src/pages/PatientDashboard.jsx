import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { getPatientHistory, getPatient } from "../services/api";
import SlotMonitor from "../components/SlotMonitor";

function PatientDashboard() {
  const [history, setHistory] = useState([]);
  const [patientData, setPatientData] = useState(null);
  const location = useLocation();
  const prn = location.state?.prn;

  const fetchHistory = useCallback(async () => {
    try {
      const data = await getPatientHistory(prn);
      setHistory(data);
    } catch (err) {
      console.error(err);
    }
  }, [prn]);

  const fetchPatientData = useCallback(async () => {
    try {
      const data = await getPatient(prn);
      setPatientData(data);
    } catch (err) {
      console.error(err);
    }
  }, [prn]);

  useEffect(() => {
    if (prn) {
      fetchHistory();
      fetchPatientData();
    }
  }, [prn, fetchHistory, fetchPatientData]);

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "20px", color: "#1e293b" }}>Patient Dashboard</h2>
      
      {patientData && (
        <div style={{ 
          marginBottom: "30px", 
          padding: "20px", 
          background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)", 
          borderRadius: "16px",
          border: "1px solid #bae6fd",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
            <div>
              <label style={{ fontSize: "0.8rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Patient Name</label>
              <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: "600", color: "#0f172a" }}>{patientData.name}</p>
            </div>
            <div>
              <label style={{ fontSize: "0.8rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>PRN Number</label>
              <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: "600", color: "#0f172a" }}>{patientData.prn}</p>
            </div>
            <div>
              <label style={{ fontSize: "0.8rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Assigned Doctor</label>
              <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: "600", color: "#0369a1" }}>{patientData.assigned_doctor || "Not assigned"}</p>
            </div>
            <div>
              <label style={{ fontSize: "0.8rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Location</label>
              <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: "600", color: "#0369a1" }}>{patientData.assigned_room ? `Room ${patientData.assigned_room}` : "Waiting Lab/OPD"}</p>
            </div>
          </div>
        </div>
      )}

      <section style={{ marginBottom: "40px" }}>
        <h3 style={{ marginBottom: "20px", color: "#1e293b", display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "1.5rem" }}>📅</span> Book a Consultation Slot
        </h3>
        <div style={{ 
          padding: "24px", 
          border: "1px solid #e2e8f0", 
          borderRadius: "16px", 
          backgroundColor: "white",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
        }}>
          <p style={{ color: "#64748b", marginBottom: "20px" }}>Select a doctor and date to view available appointments. You can book one slot per day.</p>
          {/* Integrated shared SlotMonitor with booking mode enabled via prn prop */}
          <SlotMonitor prn={prn} />
        </div>
      </section>

      <section>
        <h3 style={{ marginBottom: "20px", color: "#1e293b", display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "1.5rem" }}>📜</span> Medical History & Medications
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {history.length > 0 ? (
            history.map((record, index) => (
              <div key={index} style={{ 
                padding: "20px", 
                border: "1px solid #e2e8f0", 
                borderRadius: "12px", 
                backgroundColor: "#fff",
                boxShadow: "var(--shadow-sm)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px" }}>
                  <span style={{ fontWeight: "700", color: "#334155" }}>Visit Date: {record.consultationDate || "Recent"}</span>
                  <span style={{ fontSize: "0.85rem", color: "#64748b" }}>ID: {record._id.substring(0, 8)}...</span>
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "15px" }}>
                  <div>
                    <h5 style={{ margin: "0 0 5px 0", color: "#64748b", textTransform: "uppercase", fontSize: "0.75rem" }}>Diagnosis</h5>
                    <p style={{ margin: 0, fontWeight: "500" }}>{record.diagnosis}</p>
                  </div>
                  <div>
                    <h5 style={{ margin: "0 0 5px 0", color: "#64748b", textTransform: "uppercase", fontSize: "0.75rem" }}>Doctor's Advice</h5>
                    <p style={{ margin: 0, fontWeight: "500" }}>{record.advice}</p>
                  </div>
                </div>

                {record.medicines && record.medicines.length > 0 && (
                  <div>
                    <h5 style={{ margin: "0 0 10px 0", color: "#64748b", textTransform: "uppercase", fontSize: "0.75rem" }}>Prescribed Medications</h5>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {record.medicines.map((m, i) => (
                        <span key={i} style={{ 
                          padding: "6px 12px", 
                          backgroundColor: "#f1f5f9", 
                          borderRadius: "20px", 
                          fontSize: "0.85rem", 
                          fontWeight: "600",
                          color: "#475569",
                          border: "1px solid #e2e8f0"
                        }}>
                          {m.name} ({m.dose})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div style={{ textAlign: "center", padding: "40px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
              <p style={{ color: "#94a3b8" }}>No past medical history or medications found.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default PatientDashboard;
