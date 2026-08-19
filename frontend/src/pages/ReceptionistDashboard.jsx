import { useState, useEffect, useCallback } from "react";
import { getPatientsReception, updatePatient, getStaffQueries, getDoctors, answerQuery, forwardQuery, deleteQuery } from "../services/api";
import SlotMonitor from "../components/SlotMonitor";

function ReceptionistDashboard() {
  const [patients, setPatients] = useState([]);
  const [queries, setQueries] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [answerInputs, setAnswerInputs] = useState({});
  const [forwardSelects, setForwardSelects] = useState({});

  const receptionistName = localStorage.getItem("receptionist_username") || "Receptionist";

  const fetchPatients = useCallback(async () => {
    try {
      const data = await getPatientsReception();
      setPatients(data);
    } catch (err) {
      console.error("Error fetching patients: ", err);
    }
  }, []);

  const fetchQueries = useCallback(async () => {
    try {
      const data = await getStaffQueries();
      setQueries(data);
    } catch (err) {
      console.error("Error fetching queries: ", err);
    }
  }, []);

  const fetchDoctorsList = useCallback(async () => {
    try {
      const data = await getDoctors();
      setDoctors(data);
    } catch (err) {
      console.error("Error fetching doctors: ", err);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
    fetchQueries();
    fetchDoctorsList();

    const queryInterval = setInterval(fetchQueries, 15000);
    return () => clearInterval(queryInterval);
  }, [fetchPatients, fetchQueries, fetchDoctorsList]);


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

  const handleAnswerSubmit = async (queryId) => {
    const text = answerInputs[queryId];
    if (!text || !text.trim()) {
      alert("Please enter an answer before submitting.");
      return;
    }
    try {
      await answerQuery(queryId, {
        answer_text: text.trim(),
        answered_by_role: "Receptionist",
        answered_by_name: receptionistName
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
        forwarded_by_role: "Receptionist",
        forwarded_by_name: receptionistName
      });
      alert(`Query forwarded to Dr. ${docName} successfully!`);
      fetchQueries();
    } catch (err) {
      alert("Failed to forward query: " + err.message);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Receptionist Dashboard</h2>

      {/* Patient Queries Section */}
      <section style={{ marginBottom: "40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
          <h3 style={{ margin: 0, color: "#1e293b", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "1.5rem" }}>💬</span> Patient Queries & Messaging
          </h3>
          <span style={{ padding: "4px 12px", backgroundColor: "#e0f2fe", color: "#0369a1", borderRadius: "12px", fontSize: "0.85rem", fontWeight: "700" }}>
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
                    {q.status === "answered" ? `✅ Answered by ${q.answered_by_name} (${q.answered_by_role})` : q.status === "forwarded" ? `↗️ Forwarded to Dr. ${q.forwarded_to_doctor_name || q.forwarded_to_doctor}` : "⌛ Pending Staff Action"}
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
                    {/* Direct Answer Box */}
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

                    {/* Forward to Doctor */}
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

      <h3>Patient Locations & Assigned Doctors</h3>
      <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead style={{ backgroundColor: "#f4f4f4" }}>
          <tr>
            <th>PRN</th>
            <th>Name</th>
            <th>Assigned Room Number</th>
            <th>Assigned Doctor</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {patients.map(p => (
            <tr key={p.prn}>
              <td>{p.prn}</td>
              <td>{p.name}</td>
              <td>
                <input 
                  defaultValue={p.assigned_room || ""} 
                  onBlur={async (e) => {
                    const newValue = e.target.value;
                    if (newValue !== p.assigned_room) {
                      try {
                        await updatePatient(p.prn, { assigned_room: newValue });
                        alert(`Room updated for ${p.name}`);
                        fetchPatients();
                      } catch {
                        alert("Update failed");
                      }
                    }
                  }}
                  placeholder="Set Room"
                  className="nurse-search"
                  style={{ width: "120px", padding: "8px" }}
                />
              </td>
              <td>
                <input 
                  defaultValue={p.assigned_doctor || ""} 
                  onBlur={async (e) => {
                    const newValue = e.target.value;
                    if (newValue !== p.assigned_doctor) {
                      try {
                        await updatePatient(p.prn, { assigned_doctor: newValue });
                        alert(`Doctor updated for ${p.name}`);
                        fetchPatients();
                      } catch {
                        alert("Update failed");
                      }
                    }
                  }}
                  placeholder="Set Doctor"
                  className="nurse-search"
                  style={{ width: "160px", padding: "8px" }}
                />
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

      <hr style={{ margin: "30px 0" }} />

      <section className="table-card">
        <h3>Doctor Slot Bookings (Today)</h3>
        <p style={{ fontSize: "0.9rem", color: "#64748b", marginBottom: "15px" }}>
          Monitor live appointments and mark slots as finished when patients leave. Future slots will adjust automatically.
        </p>
        <SlotMonitor showActions={true} />
      </section>
    </div>
  );
}

export default ReceptionistDashboard;
