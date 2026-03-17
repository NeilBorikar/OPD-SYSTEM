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
              <td>{p.assigned_room ? <span style={{ color: "green", fontWeight: "bold" }}>{p.assigned_room}</span> : <span style={{ color: "red" }}>Unassigned</span>}</td>
              <td>{p.assigned_doctor || "Not Assigned"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ReceptionistDashboard;
