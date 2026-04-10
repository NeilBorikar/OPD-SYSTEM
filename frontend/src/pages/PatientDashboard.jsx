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

      <hr style={{ margin: "30px 0" }} />

      <h3>Book a Consultation Slot</h3>
      <div style={{ padding: "15px", border: "1px solid #ccc", borderRadius: "8px", backgroundColor: "#f9f9f9" }}>
        <p>Select an available slot to book your appointment for today.</p>
        <AvailableSlots prn={prn} />
      </div>
    </div>
  );
}

function AvailableSlots({ prn }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSlots = async () => {
    try {
      const data = await getSlots();
      setSlots(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const handleBook = async (slotId) => {
    try {
      await bookSlot(slotId, prn);
      alert("Slot booked successfully!");
      fetchSlots();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <p>Loading slots...</p>;

  // Group slots by doctor
  const groupedSlots = slots.reduce((acc, slot) => {
    if (!acc[slot.doctor_username]) acc[slot.doctor_username] = [];
    acc[slot.doctor_username].push(slot);
    return acc;
  }, {});

  return (
    <div>
      {Object.keys(groupedSlots).length > 0 ? (
        Object.keys(groupedSlots).map(doctor => (
          <div key={doctor} style={{ marginBottom: "20px" }}>
            <h4>Dr. {doctor}</h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "10px" }}>
              {groupedSlots[doctor].map(s => (
                <button
                  key={s._id}
                  onClick={() => handleBook(s._id)}
                  disabled={s.is_booked}
                  style={{
                    padding: "10px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    backgroundColor: s.is_booked ? "#eee" : "#fff",
                    cursor: s.is_booked ? "not-allowed" : "pointer",
                    textAlign: "center"
                  }}
                >
                  <div>{s.time}</div>
                  <div style={{ fontSize: "0.8em", color: s.is_booked ? "#999" : "#2e7d32" }}>
                    {s.is_booked ? (s.patient_prn === prn ? "Your Booking" : "Booked") : "Available"}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))
      ) : (
        <p>No slots available for today yet. Please check back later.</p>
      )}
    </div>
  );
}

export default PatientDashboard;
