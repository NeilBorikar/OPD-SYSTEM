import { useState, useEffect, useCallback } from "react";
import { getPatientsOrdered, assignTask, setDoctorSession, updatePatient } from "../services/api";
import SlotMonitor from "../components/SlotMonitor";

function DoctorDashboard() {
  const [patients, setPatients] = useState([]);
  const [taskForm, setTaskForm] = useState({ prn: "", task: "", nurse_username: "" });
  const [sessionTime, setSessionTime] = useState({ start: "09:00", end: "14:00" });
  const doctorUsername = localStorage.getItem("doctor_username");

  const fetchPatients = useCallback(async () => {
    try {
      const data = await getPatientsOrdered();
      setPatients(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleSetSession = async () => {
    try {
      await setDoctorSession({
        doctor_username: doctorUsername,
        start_time: sessionTime.start,
        end_time: sessionTime.end
      });
      alert("Visiting hours set and slots generated!");
      // Force refresh SlotMonitor
      window.location.reload();
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
        <div style={{ flex: 1, padding: "20px", border: "1px solid #e2e8f0", borderRadius: "12px", backgroundColor: "#f8fafc", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
          <h3 style={{ marginBottom: "15px", color: "#1e293b" }}>Set Daily Visiting Hours</h3>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "15px" }}>
            <label style={{ fontWeight: "600" }}>Start:</label>
            <select 
              value={sessionTime.start} 
              onChange={e => setSessionTime({...sessionTime, start: e.target.value})}
              style={{ padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
            >
              {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <label style={{ fontWeight: "600" }}>End:</label>
            <select 
              value={sessionTime.end} 
              onChange={e => setSessionTime({...sessionTime, end: e.target.value})}
              style={{ padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
            >
              {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <button 
              onClick={handleSetSession} 
              style={{ 
                padding: "8px 20px", 
                backgroundColor: "#3b82f6", 
                color: "white", 
                border: "none", 
                borderRadius: "6px", 
                cursor: "pointer",
                fontWeight: "600"
              }}
            >
              Set Session
            </button>
          </div>
          <p style={{ fontSize: "0.85em", color: "#64748b" }}>* Generates 10-minute slots. Existing unused slots for today will be reset.</p>
        </div>

        <div style={{ flex: 1, padding: "20px", border: "1px solid #e2e8f0", borderRadius: "12px", backgroundColor: "#f8fafc", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
          <h3 style={{ marginBottom: "10px", color: "#1e293b" }}>Your Live Schedule</h3>
          <p style={{ fontSize: "0.85em", color: "#64748b", marginBottom: "15px" }}>Click 'End Session' as patients leave to keep the queue adjusted in real-time.</p>
          <SlotMonitor doctorFilter={doctorUsername} showActions={true} />
        </div>
      </div>

      <div style={{ marginBottom: "30px", padding: "20px", border: "1px solid #e2e8f0", borderRadius: "12px", backgroundColor: "white", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
        <h3 style={{ marginBottom: "15px", color: "#1e293b" }}>Assign Task to Nurse</h3>
        <form onSubmit={handleAssignTask} style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input 
            placeholder="Patient PRN" 
            value={taskForm.prn} 
            onChange={e => setTaskForm({...taskForm, prn: e.target.value})} 
            style={{ padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", flex: "1", minWidth: "120px" }}
          />
          <input 
            placeholder="Nurse Username" 
            value={taskForm.nurse_username} 
            onChange={e => setTaskForm({...taskForm, nurse_username: e.target.value})}
            style={{ padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", flex: "1", minWidth: "150px" }}
          />
          <input 
            placeholder="Task Description" 
            value={taskForm.task} 
            onChange={e => setTaskForm({...taskForm, task: e.target.value})}
            style={{ padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", flex: "2", minWidth: "250px" }}
          />
          <button type="submit" style={{ padding: "10px 25px", backgroundColor: "#10b981", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700" }}>Assign Task</button>
        </form>
      </div>

      <div className="table-card">
        <h3>Patients List (Sorted by Severity)</h3>
        <div className="nurse-table-wrap">
          <table className="nurse-table">
            <thead>
              <tr>
                <th>PRN</th>
                <th>Name</th>
                <th>Priority</th>
                <th>Room</th>
                <th>Nurseline Logs</th>
              </tr>
            </thead>
            <tbody>
              {patients.map(p => (
                <tr key={p.prn}>
                  <td>{p.prn}</td>
                  <td><strong>{p.name}</strong></td>
                  <td>
                    <span className={`severity-pill severity-${(p.severityIndex || "normal").toLowerCase()}`}>
                      {p.severityIndex || "Normal"}
                    </span>
                  </td>
                  <td>
                    <input 
                      defaultValue={p.assigned_room || ""} 
                      onBlur={async (e) => {
                        const newRoom = e.target.value;
                        if (newRoom !== p.assigned_room) {
                          try {
                            await updatePatient(p.prn, { assigned_room: newRoom });
                            alert(`Room updated for ${p.name}`);
                            fetchPatients();
                          } catch {
                            alert("Update failed");
                          }
                        }
                      }}
                      placeholder="Set Room"
                      style={{ width: "100px", padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                    />
                  </td>
                  <td>
                    <ul style={{ paddingLeft: "15px", margin: 0, fontSize: "0.9rem" }}>
                      {(p.tasks_for_nurse || []).map((t, i) => (
                        <li key={i} style={{ color: t.status === "completed" ? "#059669" : "#475569", marginBottom: "4px" }}>
                          {t.task} 
                          <span style={{ 
                            marginLeft: "8px", 
                            fontSize: "0.7rem", 
                            padding: "2px 6px", 
                            borderRadius: "4px", 
                            backgroundColor: t.status === "completed" ? "#dcfce7" : "#f1f5f9",
                            color: t.status === "completed" ? "#166534" : "#64748b",
                            fontWeight: "700"
                          }}>
                            {t.status === "completed" ? "Done" : `Pending: ${t.nurse_username}`}
                          </span>
                        </li>
                      ))}
                      {(p.tasks_for_nurse || []).length === 0 && <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>No tasks</span>}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DoctorDashboard;
