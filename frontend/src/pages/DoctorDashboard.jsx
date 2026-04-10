import { useState, useEffect } from "react";
import { getPatientsOrdered, assignTask, setDoctorSession, getSlots } from "../services/api";

function DoctorDashboard() {
  const [patients, setPatients] = useState([]);
  const [taskForm, setTaskForm] = useState({ prn: "", task: "", nurse_username: "" });
  const [sessionTime, setSessionTime] = useState({ start: "09:00", end: "14:00" });
  const [slots, setSlots] = useState([]);
  const doctorUsername = localStorage.getItem("doctor_username");

  const fetchPatients = async () => {
    try {
      const data = await getPatientsOrdered();
      setPatients(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSlots = async () => {
    try {
      const data = await getSlots();
      // Filter slots for this doctor
      const doctorSlots = data.filter(s => s.doctor_username === doctorUsername);
      setSlots(doctorSlots);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPatients();
    fetchSlots();
  }, []);

  const handleSetSession = async () => {
    try {
      await setDoctorSession({
        doctor_username: doctorUsername,
        start_time: sessionTime.start,
        end_time: sessionTime.end
      });
      alert("Visiting hours set and slots generated!");
      fetchSlots();
    } catch (err) {
      alert("Failed to set session: " + err.message);
    }
  };

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

  const timeOptions = [];
  for (let i = 0; i < 24; i++) {
    const hh = i < 10 ? `0${i}` : `${i}`;
    timeOptions.push(`${hh}:00`);
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Doctor Dashboard ({doctorUsername})</h2>
      
      <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
        <div style={{ flex: 1, padding: "15px", border: "1px solid #ccc", borderRadius: "8px", backgroundColor: "#f9f9f9" }}>
          <h3>Set Daily Visiting Hours</h3>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
            <label>Start Time:</label>
            <select 
              value={sessionTime.start} 
              onChange={e => setSessionTime({...sessionTime, start: e.target.value})}
              style={{ padding: "5px" }}
            >
              {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <label>End Time:</label>
            <select 
              value={sessionTime.end} 
              onChange={e => setSessionTime({...sessionTime, end: e.target.value})}
              style={{ padding: "5px" }}
            >
              {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <button onClick={handleSetSession} style={{ padding: "5px 15px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
              Set Session
            </button>
          </div>
          <p style={{ fontSize: "0.9em", color: "#666" }}>* This will generate 10 slots per hour (10 mins each).</p>
        </div>

        <div style={{ flex: 1, padding: "15px", border: "1px solid #ccc", borderRadius: "8px", backgroundColor: "#f9f9f9" }}>
          <h3>Today's Slots</h3>
          <div style={{ maxHeight: "200px", overflowY: "auto", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "10px" }}>
            {slots.length > 0 ? slots.map(s => (
              <div key={s._id} style={{ 
                padding: "8px", 
                border: "1px solid #ddd", 
                borderRadius: "4px", 
                backgroundColor: s.is_booked ? "#ffebee" : "#e8f5e9",
                textAlign: "center",
                fontSize: "0.85em"
              }}>
                <strong>{s.time}</strong>
                <div style={{ color: s.is_booked ? "#c62828" : "#2e7d32", fontWeight: "bold" }}>
                  {s.is_booked ? `Booked: ${s.patient_prn}` : "Available"}
                </div>
              </div>
            )) : <p>No slots generated yet.</p>}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "20px", padding: "15px", border: "1px solid #ccc", borderRadius: "8px" }}>
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
          <button type="submit" style={{ padding: "8px 16px", backgroundColor: "#2196F3", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Assign</button>
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
