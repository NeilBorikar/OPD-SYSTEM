import { useState, useEffect, useCallback } from "react";
import { getPatientsOrdered } from "../services/api";
import { useLocation } from "react-router-dom";

function NurseDashboard() {
  const [patients, setPatients] = useState([]);
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

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

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
  const yourTaskCount = patients.reduce((count, patient) => {
    const tasks = patient.tasks_for_nurse || [];
    return count + tasks.filter((task) => task.nurse_username === username).length;
  }, 0);

  return (
    <div className="nurse-dashboard">
      <section className="nurse-hero">
        <div>
          <h2>Nurse Dashboard</h2>
          <p>Welcome back, {username}. Track assignments and patient priorities in real time.</p>
        </div>
        <div className="nurse-metrics">
          <div className="metric-card">
            <span className="metric-label">Total Patients</span>
            <strong className="metric-value">{totalPatients}</strong>
          </div>
          <div className="metric-card">
            <span className="metric-label">Your Tasks</span>
            <strong className="metric-value">{yourTaskCount}</strong>
          </div>
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
                      <span className="severity-pill">{p.severityIndex || "N/A"}</span>
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
        <div style={{ padding: "15px", backgroundColor: "#fff", borderRadius: "8px" }}>
          <SlotMonitor />
        </div>
      </section>
    </div>
  );
}

function SlotMonitor() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSlots = useCallback(async () => {
    try {
      const API_URL = window.location.hostname === "localhost" ? "http://localhost:8000" : "https://corepulse-ysxr.onrender.com";
      const response = await fetch(`${API_URL}/slots/`);
      const data = await response.json();
      setSlots(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  if (loading) return <p>Loading slots...</p>;

  const groupedSlots = slots.reduce((acc, slot) => {
    if (!acc[slot.doctor_username]) acc[slot.doctor_username] = [];
    acc[slot.doctor_username].push(slot);
    return acc;
  }, {});

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
      {Object.keys(groupedSlots).length > 0 ? (
        Object.keys(groupedSlots).map(doctor => (
          <div key={doctor} style={{ flex: "1 1 300px", border: "1px solid #eee", padding: "10px", borderRadius: "8px" }}>
            <h4 style={{ margin: "0 0 10px 0" }}>Dr. {doctor}</h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "8px" }}>
              {groupedSlots[doctor].map(s => (
                <div
                  key={s._id}
                  style={{
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    backgroundColor: s.is_booked ? "#e3f2fd" : "#f5f5f5",
                    textAlign: "center",
                    fontSize: "0.85em"
                  }}
                >
                  <div style={{ fontWeight: "bold" }}>{s.time}</div>
                  <div style={{ color: s.is_booked ? "#1976d2" : "#757575" }}>
                    {s.is_booked ? `PRN: ${s.patient_prn}` : "Empty"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <p>No doctor slots generated for today yet.</p>
      )}
    </div>
  );
}

export default NurseDashboard;
