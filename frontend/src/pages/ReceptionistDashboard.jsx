import { useState, useEffect, useCallback } from "react";
import { getPatientsReception, updatePatient } from "../services/api";
import SlotMonitor from "../components/SlotMonitor";

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
                        await updatePatient(p.prn, { assigned_room: newValue });
                        alert(`Room updated for ${p.name}`);
                        fetchPatients();
                      } catch {
                        alert("Update failed");
                      }
                    }
                  }}
                  placeholder="Set Room"
                  className="nurse-search"
                  style={{ width: "120px", padding: "8px" }}
                />
              </td>
              <td>
                <input 
                  defaultValue={p.assigned_doctor || ""} 
                  onBlur={async (e) => {
                    const newValue = e.target.value;
                    if (newValue !== p.assigned_doctor) {
                      try {
                        await updatePatient(p.prn, { assigned_doctor: newValue });
                        alert(`Doctor updated for ${p.name}`);
                        fetchPatients();
                      } catch {
                        alert("Update failed");
                      }
                    }
                  }}
                  placeholder="Set Doctor"
                  className="nurse-search"
                  style={{ width: "160px", padding: "8px" }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <hr style={{ margin: "30px 0" }} />

      <hr style={{ margin: "30px 0" }} />

      <section className="table-card">
        <h3>Doctor Slot Bookings (Today)</h3>
        <p style={{ fontSize: "0.9rem", color: "#64748b", marginBottom: "15px" }}>
          Monitor live appointments and mark slots as finished when patients leave. Future slots will adjust automatically.
        </p>
        <SlotMonitor showActions={true} />
      </section>
    </div>
  );
}

export default ReceptionistDashboard;
