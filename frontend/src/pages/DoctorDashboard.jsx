import { useState, useEffect } from "react";
import { getPatientsOrdered, assignTask } from "../services/api";

function DoctorDashboard() {
  const [patients, setPatients] = useState([]);
  const [taskForm, setTaskForm] = useState({ prn: "", task: "", nurse_username: "" });

  
    

  const fetchPatients = async () => {
    try {
      const data = await getPatientsOrdered();
      console.log("Patients data fetched:", data);
      setPatients(data);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
  fetchPatients();
  }, []);

  const handleAssignTask = async (e) => {
    e.preventDefault();
    if (!taskForm.prn || !taskForm.task || !taskForm.nurse_username) {
      alert("Please fill all fields for task assignment");
      return;
    }
    try {
      await assignTask(taskForm.prn, { task: taskForm.task, nurse_username: taskForm.nurse_username });
      alert("Task assigned successfully");
      setTaskForm({ prn: "", task: "", nurse_username: "" });
      fetchPatients();
    } catch (err) {
      alert("Failed to assign task: " + err.message);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Doctor Dashboard</h2>
      
      <div style={{ marginBottom: "20px", padding: "10px", border: "1px solid #ccc", borderRadius: "8px" }}>
        <h3>Assign Task to Nurse</h3>
        <form onSubmit={handleAssignTask}>
          <input 
            placeholder="Patient PRN" 
            value={taskForm.prn} 
            onChange={e => setTaskForm({...taskForm, prn: e.target.value})} 
            style={{ marginRight: "10px", padding: "8px" }}
          />
          <input 
            placeholder="Nurse Username" 
            value={taskForm.nurse_username} 
            onChange={e => setTaskForm({...taskForm, nurse_username: e.target.value})}
            style={{ marginRight: "10px", padding: "8px" }}
          />
          <input 
            placeholder="Task Description" 
            value={taskForm.task} 
            onChange={e => setTaskForm({...taskForm, task: e.target.value})}
            style={{ marginRight: "10px", padding: "8px", width: "300px" }}
          />
          <button type="submit" style={{ padding: "8px 16px" }}>Assign</button>
        </form>
      </div>

      <h3>Patients List (Sorted by Severity)</h3>
      <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead style={{ backgroundColor: "#f4f4f4" }}>
          <tr>
            <th>PRN</th>
            <th>Name</th>
            <th>Severity Index</th>
            <th>Assigned Room</th>
            <th>Tasks for Nurse</th>
          </tr>
        </thead>
        <tbody>
          {patients.map(p => (
            <tr key={p.prn}>
              <td>{p.prn}</td>
              <td>{p.name}</td>
              <td style={{ 
                color: p.severityIndex === "critical" ? "red" : 
                       p.severityIndex === "severe" ? "orange" : 
                       "green", 
                fontWeight: "bold",
                textTransform: "capitalize"
              }}>
                {p.severityIndex || "Normal"}
              </td>
              <td>
                <input 
                  defaultValue={p.assigned_room || ""} 
                  onBlur={async (e) => {
                    const newRoom = e.target.value;
                    if (newRoom !== p.assigned_room) {
                      try {
                        const API_URL = window.location.hostname === "localhost" ? "http://localhost:8000" : "https://corepulse-ysxr.onrender.com";
                        await fetch(`${API_URL}/patient/${p.prn}/update`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ assigned_room: newRoom })
                        });
                        alert(`Room updated for ${p.name}`);
                        fetchPatients();
                      } catch (err) {
                        alert("Update failed");
                      }
                    }
                  }}
                  placeholder="Set Room"
                  style={{ width: "80px", padding: "5px" }}
                />
              </td>
              <td>
                <ul style={{ paddingLeft: "20px", margin: 0 }}>
                  {(p.tasks_for_nurse || []).map((t, i) => (
                    <li key={i}>
                      {t.task} <strong>(Nurse: {t.nurse_username})</strong>
                    </li>
                  ))}
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DoctorDashboard;
