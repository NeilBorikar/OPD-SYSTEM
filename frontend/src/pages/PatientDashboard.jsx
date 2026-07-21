import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { getPatientHistory, getPatient, getLiveQueueStatus, createPatientQuery, getPatientQueries } from "../services/api";
import SlotMonitor from "../components/SlotMonitor";

function PatientDashboard() {
  const [history, setHistory] = useState([]);
  const [patientData, setPatientData] = useState(null);
  const [liveQueue, setLiveQueue] = useState(null);
  const [queries, setQueries] = useState([]);
  const [newQueryText, setNewQueryText] = useState("");
  const [submittingQuery, setSubmittingQuery] = useState(false);

  const location = useLocation();
  const prn = location.state?.prn || localStorage.getItem("patient_prn");

  const fetchHistory = useCallback(async () => {
    try {
      const data = await getPatientHistory(prn);
      setHistory(data);
    } catch (err) {
      console.error(err);
    }
  }, [prn]);

  const fetchPatientData = useCallback(async () => {
    try {
      const data = await getPatient(prn);
      setPatientData(data);
    } catch (err) {
      console.error(err);
    }
  }, [prn]);

  const fetchLiveQueue = useCallback(async () => {
    try {
      const data = await getLiveQueueStatus(prn);
      setLiveQueue(data);
    } catch (err) {
      console.error("Error fetching live queue:", err);
    }
  }, [prn]);

  const fetchQueries = useCallback(async () => {
    try {
      const data = await getPatientQueries(prn);
      setQueries(data);
    } catch (err) {
      console.error("Error fetching queries:", err);
    }
  }, [prn]);

  useEffect(() => {
    if (prn) {
      fetchHistory();
      fetchPatientData();
      fetchLiveQueue();
      fetchQueries();

      // Refresh live queue every 30 seconds
      const queueInterval = setInterval(fetchLiveQueue, 30000);
      const queryInterval = setInterval(fetchQueries, 15000);
      return () => {
        clearInterval(queueInterval);
        clearInterval(queryInterval);
      };
    }
  }, [prn, fetchHistory, fetchPatientData, fetchLiveQueue, fetchQueries]);

  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    if (!newQueryText.trim()) return;
    setSubmittingQuery(true);
    try {
      await createPatientQuery({
        patient_prn: prn,
        patient_name: patientData?.name || "Patient",
        query_text: newQueryText.trim()
      });
      setNewQueryText("");
      fetchQueries();
      alert("Your query has been submitted successfully!");
    } catch (err) {
      alert("Failed to submit query: " + err.message);
    } finally {
      setSubmittingQuery(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "20px", color: "#1e293b" }}>Patient Dashboard</h2>
      
      {patientData && (
        <div style={{ 
          marginBottom: "30px", 
          padding: "20px", 
          background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)", 
          borderRadius: "16px",
          border: "1px solid #bae6fd",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
            <div>
              <label style={{ fontSize: "0.8rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Patient Name</label>
              <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: "600", color: "#0f172a" }}>{patientData.name}</p>
            </div>
            <div>
              <label style={{ fontSize: "0.8rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>PRN Number</label>
              <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: "600", color: "#0f172a" }}>{patientData.prn}</p>
            </div>
            <div>
              <label style={{ fontSize: "0.8rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Assigned Doctor</label>
              <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: "600", color: "#0369a1" }}>{patientData.assigned_doctor || "Not assigned"}</p>
            </div>
            <div>
              <label style={{ fontSize: "0.8rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Location</label>
              <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: "600", color: "#0369a1" }}>{patientData.assigned_room ? `Room ${patientData.assigned_room}` : "Waiting Lab/OPD"}</p>
            </div>
          </div>
        </div>
      )}

      {/* Live Queue Section */}
      {liveQueue && liveQueue.has_booking && !liveQueue.is_completed && (
        <section style={{ marginBottom: "40px" }}>
          <div style={{
            padding: "24px",
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            borderRadius: "20px",
            color: "#fff",
            boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.3)",
            border: "1px solid #334155"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "1.8rem" }}>⚡</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "700", color: "#f8fafc" }}>Live Queue Status</h3>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "#94a3b8" }}>Doctor: Dr. {liveQueue.doctor_username} | Slot: {liveQueue.slot_time}</p>
                </div>
              </div>
              <span style={{ 
                padding: "6px 14px", 
                backgroundColor: "#0369a1", 
                color: "#e0f2fe", 
                borderRadius: "20px", 
                fontSize: "0.8rem", 
                fontWeight: "700",
                letterSpacing: "0.5px"
              }}>
                LIVE TRACKING
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "15px", textAlign: "center" }}>
              <div style={{ padding: "18px", backgroundColor: "rgba(255, 255, 255, 0.05)", borderRadius: "14px", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
                <div style={{ fontSize: "0.8rem", textTransform: "uppercase", color: "#94a3b8", fontWeight: "700", marginBottom: "6px" }}>Current patient:</div>
                <div style={{ fontSize: "2.2rem", fontWeight: "800", color: "#38bdf8" }}>{liveQueue.current_patient}</div>
              </div>

              <div style={{ padding: "18px", backgroundColor: "rgba(255, 255, 255, 0.05)", borderRadius: "14px", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
                <div style={{ fontSize: "0.8rem", textTransform: "uppercase", color: "#94a3b8", fontWeight: "700", marginBottom: "6px" }}>Your token:</div>
                <div style={{ fontSize: "2.2rem", fontWeight: "800", color: "#f43f5e" }}>{liveQueue.your_token}</div>
              </div>

              <div style={{ padding: "18px", backgroundColor: "rgba(255, 255, 255, 0.05)", borderRadius: "14px", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
                <div style={{ fontSize: "0.8rem", textTransform: "uppercase", color: "#94a3b8", fontWeight: "700", marginBottom: "6px" }}>Estimated wait:</div>
                <div style={{ fontSize: "2.2rem", fontWeight: "800", color: "#34d399" }}>{liveQueue.estimated_wait_minutes} minutes...</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Book Consultation Slot Section */}
      <section style={{ marginBottom: "40px" }}>
        <h3 style={{ marginBottom: "20px", color: "#1e293b", display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "1.5rem" }}>📅</span> Book a Consultation Slot
        </h3>
        <div style={{ 
          padding: "24px", 
          border: "1px solid #e2e8f0", 
          borderRadius: "16px", 
          backgroundColor: "white",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
        }}>
          <p style={{ color: "#64748b", marginBottom: "20px" }}>Select a doctor and date to view available appointments. You can book one slot per day.</p>
          <SlotMonitor prn={prn} />
        </div>
      </section>

      {/* Patient Queries & Support Section */}
      <section style={{ marginBottom: "40px" }}>
        <h3 style={{ marginBottom: "20px", color: "#1e293b", display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "1.5rem" }}>💬</span> Ask a Query / Support
        </h3>

        {/* Query Submission Box */}
        <div style={{ 
          padding: "24px", 
          border: "1px solid #e2e8f0", 
          borderRadius: "16px", 
          backgroundColor: "white",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
          marginBottom: "25px"
        }}>
          <h4 style={{ margin: "0 0 10px 0", color: "#334155" }}>Have a question or medical concern?</h4>
          <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "15px" }}>
            Submit your query below. Our receptionists and nurses will review it and answer directly or forward it to your doctor.
          </p>
          <form onSubmit={handleQuerySubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <textarea
              rows={3}
              value={newQueryText}
              onChange={(e) => setNewQueryText(e.target.value)}
              placeholder="Type your query or question here..."
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "10px",
                border: "1px solid #cbd5e1",
                fontSize: "0.95rem",
                outline: "none",
                resize: "vertical"
              }}
              required
            />
            <button
              type="submit"
              disabled={submittingQuery}
              style={{
                alignSelf: "flex-end",
                padding: "10px 24px",
                backgroundColor: "#0ea5e9",
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontWeight: "700",
                cursor: submittingQuery ? "not-allowed" : "pointer",
                boxShadow: "0 2px 4px rgba(14, 165, 233, 0.3)"
              }}
            >
              {submittingQuery ? "Submitting..." : "Send Query"}
            </button>
          </form>
        </div>

        {/* Queries History List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {queries.length > 0 ? (
            queries.map((q) => (
              <div key={q._id} style={{
                padding: "20px",
                borderRadius: "14px",
                border: "1px solid #e2e8f0",
                backgroundColor: "#fff",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.02)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "8px" }}>
                  <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "600" }}>
                    Submitted: {new Date(q.created_at).toLocaleString()}
                  </span>
                  <span style={{
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "0.8rem",
                    fontWeight: "700",
                    backgroundColor: q.status === "answered" ? "#dcfce7" : q.status === "forwarded" ? "#f3e8ff" : "#fef9c3",
                    color: q.status === "answered" ? "#166534" : q.status === "forwarded" ? "#6b21a8" : "#854d0e"
                  }}>
                    {q.status === "answered" ? "✅ Answered" : q.status === "forwarded" ? `↗️ Forwarded to Dr. ${q.forwarded_to_doctor_name || q.forwarded_to_doctor}` : "⌛ Pending Staff Review"}
                  </span>
                </div>

                <div style={{ fontSize: "1rem", color: "#1e293b", fontWeight: "600", marginBottom: "12px" }}>
                  "{q.query_text}"
                </div>

                {q.status === "answered" && (
                  <div style={{
                    marginTop: "12px",
                    padding: "14px",
                    borderRadius: "10px",
                    backgroundColor: "#f0fdf4",
                    borderLeft: "4px solid #22c55e"
                  }}>
                    <div style={{ fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "800", color: "#166534", marginBottom: "4px" }}>
                      Answered by {q.answered_by_name} ({q.answered_by_role}):
                    </div>
                    <div style={{ fontSize: "0.95rem", color: "#14532d", fontWeight: "500" }}>
                      {q.answer_text}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div style={{ textAlign: "center", padding: "30px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
              <p style={{ color: "#94a3b8", margin: 0 }}>You haven't submitted any queries yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Medical History Section */}
      <section>
        <h3 style={{ marginBottom: "20px", color: "#1e293b", display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "1.5rem" }}>📜</span> Medical History & Medications
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {history.length > 0 ? (
            history.map((record, index) => (
              <div key={index} style={{ 
                padding: "20px", 
                border: "1px solid #e2e8f0", 
                borderRadius: "12px", 
                backgroundColor: "#fff",
                boxShadow: "var(--shadow-sm)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px" }}>
                  <span style={{ fontWeight: "700", color: "#334155" }}>Visit Date: {record.consultationDate || "Recent"}</span>
                  <span style={{ fontSize: "0.85rem", color: "#64748b" }}>ID: {record._id.substring(0, 8)}...</span>
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "15px" }}>
                  <div>
                    <h5 style={{ margin: "0 0 5px 0", color: "#64748b", textTransform: "uppercase", fontSize: "0.75rem" }}>Diagnosis</h5>
                    <p style={{ margin: 0, fontWeight: "500" }}>{record.diagnosis}</p>
                  </div>
                  <div>
                    <h5 style={{ margin: "0 0 5px 0", color: "#64748b", textTransform: "uppercase", fontSize: "0.75rem" }}>Doctor's Advice</h5>
                    <p style={{ margin: 0, fontWeight: "500" }}>{record.advice}</p>
                  </div>
                </div>

                {record.medicines && record.medicines.length > 0 && (
                  <div>
                    <h5 style={{ margin: "0 0 10px 0", color: "#64748b", textTransform: "uppercase", fontSize: "0.75rem" }}>Prescribed Medications</h5>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {record.medicines.map((m, i) => (
                        <span key={i} style={{ 
                          padding: "6px 12px", 
                          backgroundColor: "#f1f5f9", 
                          borderRadius: "20px", 
                          fontSize: "0.85rem", 
                          fontWeight: "600",
                          color: "#475569",
                          border: "1px solid #e2e8f0"
                        }}>
                          {m.name} ({m.dose})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div style={{ textAlign: "center", padding: "40px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
              <p style={{ color: "#94a3b8" }}>No past medical history or medications found.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default PatientDashboard;
