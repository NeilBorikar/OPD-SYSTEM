import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getPatientHistory, getPatient } from "../services/api";

function PatientDashboard() {
  const [history, setHistory] = useState([]);
  const [patientData, setPatientData] = useState(null);
  const location = useLocation();
  const prn = location.state?.prn;

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getPatientHistory(prn);
        setHistory(data);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchPatientData = async () => {
      try {
        const data = await getPatient(prn);
        setPatientData(data);
      } catch (err) {
        console.error(err);
      }
    };

    if (prn) {
      fetchHistory();
      fetchPatientData();
    }
  }, [prn]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Patient Dashboard</h2>
      {patientData && (
        <div style={{ marginBottom: "20px", padding: "15px", backgroundColor: "#e0f7fa", borderRadius: "8px" }}>
          <p><strong>Name:</strong> {patientData.name}</p>
          <p><strong>PRN:</strong> {patientData.prn}</p>
          <p><strong>Assigned Doctor:</strong> {patientData.assigned_doctor || "Not assigned"}</p>
          <p><strong>Assigned Room:</strong> {patientData.assigned_room || "Not assigned"}</p>
        </div>
      )}

      <h3>Your Medical History & Medications</h3>
      {history.length > 0 ? (
        history.map((record, index) => (
          <div key={index} style={{ border: "1px solid #ccc", margin: "10px 0", padding: "10px", borderRadius: "8px" }}>
            <p><strong>Date/Visit ID:</strong> {record._id}</p>
            <p><strong>Diagnosis:</strong> {record.diagnosis}</p>
            <p><strong>Advice:</strong> {record.advice}</p>
            <h4>Medications:</h4>
            <ul>
              {record.medicines && record.medicines.map((m, i) => (
                <li key={i}>{m.name} - {m.dose}</li>
              ))}
            </ul>
          </div>
        ))
      ) : (
        <p>No past medical history or medications found.</p>
      )}
    </div>
  );
}

export default PatientDashboard;
