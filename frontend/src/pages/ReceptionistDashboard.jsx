import { useState, useEffect, useCallback } from "react";
import { getPatientsReception } from "../services/api";

function ReceptionistDashboard() {
  const [patients, setPatients] = useState([]);

  const fetchPatients = useCallback(async () => {
    try {
      const data = await getPatientsReception();
      setPatients(data);
    } catch (err) {
      console.error("Error fetching patients: ", err);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Receptionist Dashboard</h2>

      <h3>Patient Locations & Assigned Doctors</h3>
      <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead style={{ backgroundColor: "#f4f4f4" }}>
          <tr>
            <th>PRN</th>
            <th>Name</th>
            <th>Assigned Room Number</th>
            <th>Assigned Doctor</th>
          </tr>
        </thead>
        <tbody>
          {patients.map(p => (
            <tr key={p.prn}>
              <td>{p.prn}</td>
              <td>{p.name}</td>
              <td>
                <input 
                  defaultValue={p.assigned_room || ""} 
                  onBlur={async (e) => {
                    const newValue = e.target.value;
                    if (newValue !== p.assigned_room) {
                      try {
                        const API_URL = window.location.hostname === "localhost" ? "http://localhost:8000" : "https://corepulse-ysxr.onrender.com";
                        await fetch(`${API_URL}/patient/${p.prn}/update`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ assigned_room: newValue })
                        });
                        alert(`Room updated for ${p.name}`);
                        fetchPatients();
                      } catch {
                        alert("Update failed");
                      }
                    }
                  }}
                  placeholder="Set Room"
                  style={{ width: "80px", padding: "5px", color: "green", fontWeight: "bold" }}
                />
              </td>
              <td>
                <input 
                  defaultValue={p.assigned_doctor || ""} 
                  onBlur={async (e) => {
                    const newValue = e.target.value;
                    if (newValue !== p.assigned_doctor) {
                      try {
                        const API_URL = window.location.hostname === "localhost" ? "http://localhost:8000" : "https://corepulse-ysxr.onrender.com";
                        await fetch(`${API_URL}/patient/${p.prn}/update`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ assigned_doctor: newValue })
                        });
                        alert(`Doctor updated for ${p.name}`);
                        fetchPatients();
                      } catch {
                        alert("Update failed");
                      }
                    }
                  }}
                  placeholder="Set Doctor"
                  style={{ width: "120px", padding: "5px" }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <hr style={{ margin: "30px 0" }} />

      <h3>Doctor Slot Bookings (Today)</h3>
      <div style={{ padding: "15px", border: "1px solid #ccc", borderRadius: "8px", backgroundColor: "#f9f9f9" }}>
        <SlotMonitor />
      </div>
    </div>
  );
}

function SlotMonitor() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const API_URL = window.location.hostname === "localhost" ? "http://localhost:8000" : "https://corepulse-ysxr.onrender.com";
        const response = await fetch(`${API_URL}/slots/`);
        const data = await response.json();
        setSlots(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSlots();
  }, []);

  if (loading) return <p>Loading slots...</p>;

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
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "10px" }}>
              {groupedSlots[doctor].map(s => (
                <div
                  key={s._id}
                  style={{
                    padding: "10px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    backgroundColor: s.is_booked ? "#e3f2fd" : "#fff",
                    textAlign: "center"
                  }}
                >
                  <div style={{ fontWeight: "bold" }}>{s.time}</div>
                  <div style={{ color: s.is_booked ? "#1976d2" : "#757575" }}>
                    {s.is_booked ? `Patient: ${s.patient_prn}` : "Empty"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <p>No doctor slots generated for today yet.</p>
      )}
    </div>
  );
}

export default ReceptionistDashboard;
