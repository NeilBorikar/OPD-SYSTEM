import { useState, useEffect, useCallback } from "react";
import { getPatientsOrdered, getNurseTasks, completeTask, updatePatient, getStaffQueries, getDoctors, answerQuery, forwardQuery, deleteQuery } from "../services/api";
import { useLocation, Link } from "react-router-dom";
import SlotMonitor from "../components/SlotMonitor";

function NurseDashboard() {
  const [patients, setPatients] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [queries, setQueries] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [answerInputs, setAnswerInputs] = useState({});
  const [forwardSelects, setForwardSelects] = useState({});
  const [searchText, setSearchText] = useState("");

  const location = useLocation();
  const username = location.state?.username || localStorage.getItem("nurse_username") || "Unknown";

  const fetchPatients = useCallback(async () => {
    try {
      const data = await getPatientsOrdered();
      setPatients(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchRecentTasks = useCallback(async () => {
    try {
      const data = await getNurseTasks(username, "pending");
      setTasks(data);
    } catch (err) {
      console.error(err);
    }
  }, [username]);

  const fetchQueries = useCallback(async () => {
    try {
      const data = await getStaffQueries();
      setQueries(data);
    } catch (err) {
      console.error("Error fetching queries:", err);
    }
  }, []);

  const fetchDoctorsList = useCallback(async () => {
    try {
      const data = await getDoctors();
      setDoctors(data);
    } catch (err) {
      console.error("Error fetching doctors:", err);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
    fetchRecentTasks();
    fetchQueries();
    fetchDoctorsList();

    const queryInterval = setInterval(fetchQueries, 15000);
    return () => clearInterval(queryInterval);
  }, [fetchPatients, fetchRecentTasks, fetchQueries, fetchDoctorsList]);


  const handleDeleteQuery = async (queryId) => {
    if (!window.confirm("Are you sure you want to delete this query?")) return;
    try {
      await deleteQuery(queryId);
      alert("Query deleted successfully.");
      fetchQueries();
    } catch (err) {
      alert("Failed to delete query: " + err.message);
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await completeTask(taskId);
      alert("Task marked as completed!");
      fetchRecentTasks();
      fetchPatients();
    } catch (err) {
      alert("Failed to complete task: " + err.message);
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
        answered_by_role: "Nurse",
        answered_by_name: username
      });
      alert("Query answered successfully!");
      setAnswerInputs(prev => ({ ...prev, [queryId]: "" }));
      fetchQueries();
    } catch (err) {
      alert("Failed to submit answer: " + err.message);
    }
  };

  const handleForwardSubmit = async (queryId) => {
    const docUsername = forwardSelects[queryId];
    if (!docUsername) {
      alert("Please select a doctor to forward the query to.");
      return;
    }
    const selectedDoc = doctors.find(d => d.username === docUsername);
    const docName = selectedDoc ? selectedDoc.full_name : docUsername;

    try {
      await forwardQuery(queryId, {
        doctor_username: docUsername,
        doctor_name: docName,
        forwarded_by_role: "Nurse",
        forwarded_by_name: username
      });
      alert(`Query forwarded to Dr. ${docName} successfully!`);
      fetchQueries();
    } catch (err) {
      alert("Failed to forward query: " + err.message);
    }
  };

  const filteredPatients = patients.filter((p) => {
    const query = searchText.trim().toLowerCase();
    if (!query) return true;
    return (
      String(p.prn).toLowerCase().includes(query) ||
      p.name?.toLowerCase().includes(query) ||
      String(p.assigned_room || "").toLowerCase().includes(query)
    );
  });

  const totalPatients = patients.length;

  return (
    <div className="nurse-dashboard">
      <section className="nurse-hero">
        <div>
          <h2>Nurse Dashboard</h2>
          <p>Welcome back, {username}. Track assignments and patient priorities in real time.</p>
          <Link to="/nurse/past-tasks" className="past-tasks-btn">
            View Past Tasks History
          </Link>
        </div>
        <div className="nurse-metrics">
          <div className="metric-card">
            <span className="metric-label">Total Patients</span>
            <strong className="metric-value">{totalPatients}</strong>
          </div>
          <div className="metric-card">
            <span className="metric-label">Your Pending Tasks</span>
            <strong className="metric-value">{tasks.length}</strong>
          </div>
        </div>
      </section>

      {/* Patient Queries Section */}
      <section className="table-card" style={{ marginBottom: "30px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
          <h3 style={{ margin: 0, color: "#1e293b", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "1.5rem" }}>💬</span> Patient Queries & Support
          </h3>
          <span className="task-count-badge">
            {queries.filter(q => q.status !== "answered").length} Pending
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {queries.length > 0 ? (
            queries.map((q) => (
              <div key={q._id} style={{
                padding: "20px",
                borderRadius: "14px",
                border: "1px solid #e2e8f0",
                backgroundColor: "#fff",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "8px" }}>
                  <div>
                    <strong style={{ color: "#0f172a", fontSize: "1rem" }}>{q.patient_name}</strong>
                    <span style={{ marginLeft: "10px", fontSize: "0.85rem", color: "#64748b" }}>PRN: {q.patient_prn}</span>
                  </div>
                  <span style={{
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "0.8rem",
                    fontWeight: "700",
                    backgroundColor: q.status === "answered" ? "#dcfce7" : q.status === "forwarded" ? "#f3e8ff" : "#fef9c3",
                    color: q.status === "answered" ? "#166534" : q.status === "forwarded" ? "#6b21a8" : "#854d0e"
                  }}>
                    {q.status === "answered" ? `✅ Answered by ${q.answered_by_name} (${q.answered_by_role})` : q.status === "forwarded" ? `↗️ Forwarded to Dr. ${q.forwarded_to_doctor_name || q.forwarded_to_doctor}` : "⌛ Pending Action"}
                  </span>
                </div>

                <div style={{ fontSize: "1rem", color: "#334155", fontWeight: "500", marginBottom: "15px", padding: "12px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #f1f5f9" }}>
                  "{q.query_text}"
                </div>

                {q.status === "answered" ? (
                  <div style={{ padding: "12px", backgroundColor: "#f0fdf4", borderRadius: "8px", borderLeft: "4px solid #22c55e" }}>
                    <div style={{ fontSize: "0.8rem", fontWeight: "700", color: "#166534" }}>Answer:</div>
                    <div style={{ fontSize: "0.95rem", color: "#14532d" }}>{q.answer_text}</div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      <input
                        type="text"
                        placeholder="Type answer to patient..."
                        value={answerInputs[q._id] || ""}
                        onChange={(e) => setAnswerInputs({ ...answerInputs, [q._id]: e.target.value })}
                        style={{ flex: 1, minWidth: "220px", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                      />
                      <button
                        onClick={() => handleAnswerSubmit(q._id)}
                        style={{ padding: "8px 16px", backgroundColor: "#22c55e", color: "white", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}
                      >
                        Answer Directly
                      </button>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingTop: "8px", borderTop: "1px dashed #e2e8f0" }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "#64748b" }}>Or Forward to Doctor:</span>
                      <select
                        value={forwardSelects[q._id] || ""}
                        onChange={(e) => setForwardSelects({ ...forwardSelects, [q._id]: e.target.value })}
                        style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                      >
                        <option value="">-- Select Doctor --</option>
                        {doctors.map(d => (
                          <option key={d.username} value={d.username}>Dr. {d.full_name} ({d.username})</option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleForwardSubmit(q._id)}
                        style={{ padding: "8px 16px", backgroundColor: "#9333ea", color: "white", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}
                      >
                        Forward to Doctor
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div style={{ textAlign: "center", padding: "30px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
              <p style={{ color: "#94a3b8", margin: 0 }}>No patient queries currently submitted.</p>
            </div>
          )}
        </div>
      </section>

      <section className="recent-tasks-section table-card" style={{ marginBottom: "30px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
          <h3 style={{ margin: 0 }}>Recent Tasks (Pending)</h3>
          <span className="task-count-badge">{tasks.length} Pending</span>
        </div>
        <div className="nurse-table-wrap">
          <table className="nurse-table">
            <thead>
              <tr>
                <th>Time Assigned</th>
                <th>Patient</th>
                <th>Task Description</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length > 0 ? tasks.map((task) => (
                <tr key={task._id}>
                  <td>{new Date(task.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  <td>
                    <strong>{task.patient_name}</strong>
                    <div style={{ fontSize: "0.8em", color: "#666" }}>PRN: {task.patient_prn}</div>
                  </td>
                  <td style={{ color: "#334155" }}>{task.task_content}</td>
                  <td>
                    <button 
                      className="complete-task-btn"
                      onClick={() => handleCompleteTask(task._id)}
                      title="Mark as Completed"
                    >
                      ✓ Mark Complete
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="no-results">No pending tasks found. Good job!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="nurse-controls">
        <input
          className="nurse-search"
          type="text"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="Search by PRN, name, or room..."
        />
      </section>

      <section className="table-card">
        <h3>Patients List & Assigned Tasks</h3>
        <div className="nurse-table-wrap">
          <table className="nurse-table">
            <thead>
              <tr>
                <th>PRN</th>
                <th>Name</th>
                <th>Severity</th>
                <th>Assigned Room</th>
                <th>Your Tasks</th>
                <th>Other Tasks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((p) => {
                const yourTasks = (p.tasks_for_nurse || []).filter((t) => t.nurse_username === username);
                const otherTasks = (p.tasks_for_nurse || []).filter((t) => t.nurse_username !== username);

                return (
                  <tr key={p.prn}>
                    <td>{p.prn}</td>
                    <td>{p.name}</td>
                    <td>
                      <span className={`severity-pill severity-${(p.severityIndex || "normal").toLowerCase()}`}>
                        {p.severityIndex || "Normal"}
                      </span>
                    </td>
                    <td>{p.assigned_room || "N/A"}</td>
                    <td>
                      {yourTasks.length > 0 ? (
                        <ul className="task-list task-list-you">
                          {yourTasks.map((t, i) => (
                            <li key={i}>{t.task}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="empty-state">None</span>
                      )}
                    </td>
                    <td>
                      {otherTasks.length > 0 ? (
                        <ul className="task-list task-list-other">
                          {otherTasks.map((t, i) => (
                            <li key={i}>{t.task} (Nurse: {t.nurse_username})</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="empty-state">None</span>
                      )}
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
                );
              })}
              {filteredPatients.length === 0 && (
                <tr>
                  <td colSpan="7" className="no-results">No patients match your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="table-card" style={{ marginTop: "30px" }}>
        <h3>Doctor Slot Bookings (Today)</h3>
        <p style={{ fontSize: "0.9rem", color: "#64748b", marginBottom: "15px" }}>
          View live appointment status. 
        </p>
        <SlotMonitor showActions={false} />
      </section>
    </div>
  );
}

export default NurseDashboard;
