import { useState, useEffect, useCallback } from "react";
import { getPatientsOrdered, getNurseTasks, completeTask, getSlots } from "../services/api";
import { useLocation, Link } from "react-router-dom";
import SlotMonitor from "../components/SlotMonitor";

function NurseDashboard() {
  const [patients, setPatients] = useState([]);
  const [tasks, setTasks] = useState([]);
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

  useEffect(() => {
    fetchPatients();
    fetchRecentTasks();
  }, [fetchPatients, fetchRecentTasks]);

  const handleCompleteTask = async (taskId) => {
    try {
      await completeTask(taskId);
      alert("Task marked as completed!");
      fetchRecentTasks();
      fetchPatients(); // Refresh patient list to update task statuses if shown
    } catch (err) {
      alert("Failed to complete task: " + err.message);
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
                  </tr>
                );
              })}
              {filteredPatients.length === 0 && (
                <tr>
                  <td colSpan="6" className="no-results">No patients match your search.</td>
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
