import { useState, useEffect } from "react";
import { getPatientsOrdered } from "../services/api";
import { useLocation } from "react-router-dom";

function NurseDashboard() {
  const [patients, setPatients] = useState([]);
  const location = useLocation();
  const username = location.state?.username || "Unknown";

  const fetchPatients = async () => {
    try {
      const data = await getPatientsOrdered();
      console.log("Nurse Dashboard fetching patients:", data);
      setPatients(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Nurse Dashboard (Welcome, {username})</h2>

      <h3>Patients List & Assigned Tasks</h3>
      <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead style={{ backgroundColor: "#f4f4f4" }}>
          <tr>
            <th>PRN</th>
            <th>Name</th>
            <th>Severity Index</th>
            <th>Assigned Room</th>
            <th>Your Assigned Tasks</th>
            <th>Other Tasks</th>
          </tr>
        </thead>
        <tbody>
          {patients.map(p => {
             const yourTasks = (p.tasks_for_nurse || []).filter(t => t.nurse_username === username);
             const otherTasks = (p.tasks_for_nurse || []).filter(t => t.nurse_username !== username);

             return (
              <tr key={p.prn}>
                <td>{p.prn}</td>
                <td>{p.name}</td>
                <td>{p.severityIndex || "N/A"}</td>
                <td>{p.assigned_room || "N/A"}</td>
                <td>
                  <ul style={{ paddingLeft: "20px", margin: 0, color: "green" }}>
                    {yourTasks.length > 0 ? yourTasks.map((t, i) => (
                      <li key={i}>{t.task}</li>
                    )) : <span>None</span>}
                  </ul>
                </td>
                <td>
                  <ul style={{ paddingLeft: "20px", margin: 0, color: "gray" }}>
                    {otherTasks.length > 0 ? otherTasks.map((t, i) => (
                      <li key={i}>{t.task} (Nurse: {t.nurse_username})</li>
                    )) : <span>None</span>}
                  </ul>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default NurseDashboard;
