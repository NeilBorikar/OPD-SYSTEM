import { useState, useEffect, useCallback } from "react";
import { getPatientsOrdered, assignTask, setDoctorSession, updatePatient, getDoctorQueries, answerQuery, deleteQuery } from "../services/api";
import SlotMonitor from "../components/SlotMonitor";

function DoctorDashboard() {
  const [patients, setPatients] = useState([]);
  const [queries, setQueries] = useState([]);
  const [answerInputs, setAnswerInputs] = useState({});
  const [taskForm, setTaskForm] = useState({ prn: "", task: "", nurse_username: "" });
  const [sessionTime, setSessionTime] = useState({ 
    start: "09:00", 
    end: "14:00",
    date: new Date().toISOString().split('T')[0] 
  });
  const doctorUsername = localStorage.getItem("doctor_username");

  const fetchPatients = useCallback(async () => {
    try {
      const data = await getPatientsOrdered();
      setPatients(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchDoctorQueriesList = useCallback(async () => {
    if (!doctorUsername) return;
    try {
      const data = await getDoctorQueries(doctorUsername);
      setQueries(data);
    } catch (err) {
      console.error("Error fetching doctor queries:", err);
    }
  }, [doctorUsername]);

  useEffect(() => {
    fetchPatients();
    fetchDoctorQueriesList();

    const queryInterval = setInterval(fetchDoctorQueriesList, 15000);
    return () => clearInterval(queryInterval);
  }, [fetchPatients, fetchDoctorQueriesList]);

  const handleDeleteQuery = async (queryId) => {
    if (!window.confirm("Are you sure you want to delete this query?")) return;
    try {
      await deleteQuery(queryId);
      alert("Query deleted successfully.");
      fetchDoctorQueriesList();
    } catch (err) {
      alert("Failed to delete query: " + err.message);
    }
  };

  const handleAnswerSubmit = async (queryId) => {
    const text = answerInputs[queryId];
    if (!text || !text.trim()) {
      alert("Please enter an answer before submitting.");
      return;
    }
    try {
      await answerQuery(queryId, {
        answer_text: text.trim(),
        answered_by_role: "Doctor",
        answered_by_name: `Dr. ${doctorUsername}`
      });
      alert("Query answered successfully!");
      setAnswerInputs(prev => ({ ...prev, [queryId]: "" }));
      fetchDoctorQueriesList();
    } catch (err) {
      alert("Failed to submit answer: " + err.message);
    }
  };

  const normalizeTime = (val) => {
    if (!val) return "";
    let cleaned = val.replace(/\./g, ":").trim();
    const parts = cleaned.split(":");
    if (parts.length === 2) {
      let hh = parts[0].padStart(2, "0");
      let mm = parts[1].padStart(2, "0");
      if (/^\d{2}$/.test(hh) && /^\d{2}$/.test(mm)) {
        return `${hh}:${mm}`;
      }
    }
    return cleaned;
  };

  const handleSetSession = async () => {
    const startTimeClean = normalizeTime(sessionTime.start);
    const endTimeClean = normalizeTime(sessionTime.end);

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTimeClean) || !timeRegex.test(endTimeClean)) {
      alert("Invalid time format. Please enter time as HH:MM or HH.MM (e.g. 11:30 or 11.30)");
      return;
    }

    const getLocalDateString = () => {
      const d = new Date();
      const offset = d.getTimezoneOffset();
      const localDate = new Date(d.getTime() - (offset * 60 * 1000));
      return localDate.toISOString().split('T')[0];
    };

    const todayStr = getLocalDateString();
    if (sessionTime.date < todayStr) {
      alert("Cannot set visiting hours for a past date.");
      return;
    }

    if (sessionTime.date === todayStr) {
      const now = new Date();
      const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      if (startTimeClean < currentHHMM) {
        alert("Cannot create appointments before current time.");
        return;
      }
    }

    if (endTimeClean <= startTimeClean) {
      alert("End time must be after start time.");
      return;
    }

    try {
      await setDoctorSession({
        doctor_username: doctorUsername,
        start_time: startTimeClean,
        end_time: endTimeClean,
        date: sessionTime.date
      });
      alert("Visiting hours set and slots generated!");
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

  return (
    <div style={{ padding: "20px" }}>
      <h2>Doctor Dashboard ({doctorUsername})</h2>
      
      <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
        <div style={{ flex: 1, padding: "20px", border: "1px solid #e2e8f0", borderRadius: "12px", backgroundColor: "#f8fafc", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
          <h3 style={{ marginBottom: "15px", color: "#1e293b" }}>Set Daily Visiting Hours</h3>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "15px" }}>
            <label style={{ fontWeight: "600" }}>Start:</label>
            <input 
              type="text"
              placeholder="e.g. 11.00"
              value={sessionTime.start} 
              onChange={e => setSessionTime({...sessionTime, start: e.target.value})}
              style={{ padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", width: "90px" }}
            />
            <label style={{ fontWeight: "600" }}>End:</label>
            <input 
              type="text"
              placeholder="e.g. 14.00"
              value={sessionTime.end} 
              onChange={e => setSessionTime({...sessionTime, end: e.target.value})}
              style={{ padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", width: "90px" }}
            />
            <label style={{ fontWeight: "600" }}>Date:</label>
            <input 
              type="date"
              value={sessionTime.date}
              onChange={e => setSessionTime({...sessionTime, date: e.target.value})}
              min={new Date().toISOString().split('T')[0]}
              style={{ padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
            />
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
          <p style={{ fontSize: "0.85em", color: "#64748b" }}>* Generates 10-minute slots. Enter time in HH:MM or HH.MM format (e.g. 11.30). Existing unused slots for the selected date will be reset.</p>
        </div>

        <div style={{ flex: 1, padding: "20px", border: "1px solid #e2e8f0", borderRadius: "12px", backgroundColor: "#f8fafc", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
          <h3 style={{ marginBottom: "10px", color: "#1e293b" }}>Your Live Schedule</h3>
          <p style={{ fontSize: "0.85em", color: "#64748b", marginBottom: "15px" }}>Click 'End Session' as patients leave to keep the queue adjusted in real-time.</p>
          <SlotMonitor doctorFilter={doctorUsername} showActions={true} />
        </div>
      </div>

      {/* Forwarded Patient Queries Section */}
      <section style={{ marginBottom: "30px", padding: "20px", border: "1px solid #e2e8f0", borderRadius: "12px", backgroundColor: "white", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
          <h3 style={{ margin: 0, color: "#1e293b", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "1.5rem" }}>💬</span> Forwarded Patient Queries
          </h3>
          <span style={{ padding: "4px 12px", backgroundColor: "#f3e8ff", color: "#6b21a8", borderRadius: "12px", fontSize: "0.85rem", fontWeight: "700" }}>
            {queries.filter(q => q.status !== "answered").length} Forwarded to You
          </span>
        </div>
        <p style={{ fontSize: "0.85em", color: "#64748b", marginBottom: "15px" }}>
          Queries forwarded to you by Receptionists or Nurses. Your answer will be directly visible to the patient.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {queries.length > 0 ? (
            queries.map((q) => (
              <div key={q._id} style={{
                padding: "16px",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                backgroundColor: "#faf5ff",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.02)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "8px" }}>
                  <div>
                    <strong style={{ color: "#0f172a", fontSize: "1rem" }}>{q.patient_name}</strong>
                    <span style={{ marginLeft: "10px", fontSize: "0.85rem", color: "#64748b" }}>PRN: {q.patient_prn}</span>
                    <span style={{ marginLeft: "15px", fontSize: "0.8rem", color: "#7e22ce", fontWeight: "600" }}>
                      Forwarded by {q.forwarded_by_name} ({q.forwarded_by_role})
                    </span>
                  </div>
                  <span style={{
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "0.8rem",
                    fontWeight: "700",
                    backgroundColor: q.status === "answered" ? "#dcfce7" : "#f3e8ff",
                    color: q.status === "answered" ? "#166534" : "#6b21a8"
                  }}>
                    {q.status === "answered" ? `✅ Answered by You` : "⌛ Pending Your Answer"}
                  </span>
                </div>

                <div style={{ fontSize: "0.95rem", color: "#334155", fontWeight: "500", marginBottom: "12px", padding: "10px 14px", backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #e9d5ff" }}>
                  "{q.query_text}"
                </div>

                {q.status === "answered" ? (
                  <div style={{ padding: "10px 14px", backgroundColor: "#f0fdf4", borderRadius: "8px", borderLeft: "4px solid #22c55e" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: "0.8rem", fontWeight: "700", color: "#166534" }}>Your Answer:</div>
                      <button
                        onClick={() => handleDeleteQuery(q._id)}
                        style={{ padding: "4px 8px", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.75rem", fontWeight: "bold" }}
                      >
                        Delete Query
                      </button>
                    </div>
                    <div style={{ fontSize: "0.95rem", color: "#14532d", marginTop: "4px" }}>{q.answer_text}</div>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <input
                      type="text"
                      placeholder="Type doctor's advice / answer to patient..."
                      value={answerInputs[q._id] || ""}
                      onChange={(e) => setAnswerInputs({ ...answerInputs, [q._id]: e.target.value })}
                      style={{ flex: 1, minWidth: "250px", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                    />
                    <button
                      onClick={() => handleAnswerSubmit(q._id)}
                      style={{ padding: "8px 20px", backgroundColor: "#7e22ce", color: "white", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}
                    >
                      Answer Query
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div style={{ textAlign: "center", padding: "20px", backgroundColor: "#faf5ff", borderRadius: "8px", border: "1px dashed #d8b4fe" }}>
              <p style={{ color: "#7e22ce", margin: 0, fontSize: "0.9rem" }}>No patient queries forwarded to you at this time.</p>
            </div>
          )}
        </div>
      </section>

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
                <th>Actions</th>
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
                  <td>
                    <button
                      onClick={async () => {
                        if (window.confirm(`Are you sure you want to remove ${p.name} from active list?`)) {
                          try {
                            await updatePatient(p.prn, { active: false });
                            alert(`Patient ${p.name} removed from active list.`);
                            fetchPatients();
                          } catch (err) {
                            alert("Failed to remove patient: " + err.message);
                          }
                        }
                      }}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#ef4444",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "600",
                        transition: "background-color 0.2s"
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = "#dc2626"}
                      onMouseOut={(e) => e.target.style.backgroundColor = "#ef4444"}
                    >
                      Delete
                    </button>
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
