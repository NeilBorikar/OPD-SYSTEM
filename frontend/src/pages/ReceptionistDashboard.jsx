import { useState, useEffect } from "react";
import { getPatientsReception } from "../services/api";

function ReceptionistDashboard() {
  const [patients, setPatients] = useState([]);

  const fetchPatients = async () => {
    try {
      const data = await getPatientsReception();
      setPatients(data);
    } catch (err) {
      console.error("Error fetching patients: ", err);
    }
  };

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
                      } catch (err) {
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
                      } catch (err) {
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
    </div>
  );
}

export default ReceptionistDashboard;
