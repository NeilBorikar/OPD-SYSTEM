import { useState, useEffect, useCallback } from "react";
import { getNurseTasks } from "../services/api";
import { Link } from "react-router-dom";

function PastTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  // Default to today
  const [searchDate, setSearchDate] = useState(new Date().toISOString().split('T')[0]);
  const username = localStorage.getItem("nurse_username") || "Unknown";

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getNurseTasks(username, "completed", searchDate);
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [username, searchDate]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <div className="nurse-dashboard" style={{ padding: "24px" }}>
      <section className="nurse-hero" style={{ marginBottom: "24px" }}>
        <div>
          <Link to="/nurse" style={{ color: "#64748b", textDecoration: "none", display: "flex", alignItems: "center", gap: "5px", marginBottom: "10px", fontWeight: "600" }}>
            ← Back to Dashboard
          </Link>
          <h2>Past Tasks History</h2>
          <p>Review completed tasks and performance logs for {username}.</p>
        </div>
      </section>

      <section className="table-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
          <h3 style={{ margin: 0 }}>Completed Tasks Log</h3>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", backgroundColor: "#f8fafc", padding: "8px 16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
            <label htmlFor="searchDate" style={{ fontSize: "0.9rem", color: "#475569", fontWeight: "600" }}>Select Date:</label>
            <input 
              id="searchDate"
              type="date" 
              value={searchDate} 
              onChange={(e) => setSearchDate(e.target.value)}
              style={{ 
                padding: "6px 10px", 
                borderRadius: "6px", 
                border: "1px solid #cbd5e1",
                outline: "none",
                fontSize: "0.9rem",
                color: "#1e293b",
                fontWeight: "500"
              }}
            />
          </div>
        </div>

        <div className="nurse-table-wrap">
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>
              <div className="spinner" style={{ marginBottom: "10px" }}>⌛</div>
              Loading History...
            </div>
          ) : (
            <table className="nurse-table">
              <thead>
                <tr>
                  <th>Patient Context</th>
                  <th>Task Performed</th>
                  <th>Assignment Time</th>
                  <th>Completion Time</th>
                  <th>Verification</th>
                </tr>
              </thead>
              <tbody>
                {tasks.length > 0 ? tasks.map((task) => (
                  <tr key={task._id}>
                    <td>
                      <div style={{ fontWeight: "700", color: "#1e293b" }}>{task.patient_name}</div>
                      <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "2px" }}>PRN: {task.patient_prn}</div>
                    </td>
                    <td style={{ color: "#334155", maxWidth: "300px" }}>{task.task_content}</td>
                    <td>
                      <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
                        {new Date(task.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: "0.85rem", color: "#059669", fontWeight: "700" }}>
                        {new Date(task.completed_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </div>
                    </td>
                    <td>
                      <span className="severity-pill severity-normal" style={{ fontSize: "0.65rem", padding: "2px 8px" }}>Verified</span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="no-results" style={{ padding: "80px 20px" }}>
                      <div style={{ fontSize: "1.2rem", color: "#cbd5e1", marginBottom: "5px" }}>📁</div>
                      No completed tasks found for {new Date(searchDate).toLocaleDateString()}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}

export default PastTasks;
