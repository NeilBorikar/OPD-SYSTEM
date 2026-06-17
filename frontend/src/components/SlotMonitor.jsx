import { useState, useEffect, useCallback } from "react";
import { getSlots, completeSlot, getDoctors, bookSlot } from "../services/api";

function SlotMonitor({ doctorFilter = null, showActions = false, prn = null }) {
  const [slots, setSlots] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(doctorFilter || "");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  // Fetch doctors list for the dropdown
  useEffect(() => {
    const fetchDoctorsList = async () => {
      try {
        const data = await getDoctors();
        setDoctors(data);
      } catch (err) {
        console.error("Failed to load doctors:", err);
      }
    };
    fetchDoctorsList();
  }, []);

  const fetchSlots = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSlots(selectedDate, selectedDoctor || null);
      setSlots(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, selectedDoctor]);

  useEffect(() => {
    fetchSlots();
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchSlots, 60000);
    return () => clearInterval(interval);
  }, [fetchSlots]);

  const handleComplete = async (slotId) => {
    if (!window.confirm("End this appointment and confirm patient departure? Subsequent slots will be adjusted automatically.")) return;
    try {
      await completeSlot(slotId);
      alert("Appointment completed. Schedule updated successfully!");
      fetchSlots();
    } catch (err) {
      alert("Failed to complete appointment: " + err.message);
    }
  };

  const handleBook = async (slotId) => {
    if (!prn) return;
    try {
      await bookSlot(slotId, prn);
      alert("Slot booked successfully!");
      fetchSlots();
    } catch (err) {
      alert("Booking failed: " + err.message);
    }
  };

  // Grouping logic
  const getLocalDateString = () => {
    const d = new Date();
    const offset = d.getTimezoneOffset();
    const localDate = new Date(d.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
  };

  const todayStr = getLocalDateString();
  const now = new Date();
  const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const processedSlots = [...slots]
    .sort((a, b) => a.time.localeCompare(b.time))
    .filter(s => {
      if (s.date === todayStr) {
        try {
          const parts = s.time.split(" - ");
          if (parts.length === 2) {
            const endTime = parts[1];
            return endTime > currentHHMM;
          }
        } catch (e) {
          console.error(e);
        }
      }
      return true;
    });

  const groupedSlots = processedSlots.reduce((acc, slot) => {
    if (!acc[slot.doctor_username]) acc[slot.doctor_username] = [];
    acc[slot.doctor_username].push(slot);
    return acc;
  }, {});

  return (
    <div className="slot-monitor-container">
      {/* Filters Section */}
      <div className="slot-filters" style={{ 
        display: "flex", 
        gap: "20px", 
        marginBottom: "25px", 
        flexWrap: "wrap", 
        padding: "15px", 
        backgroundColor: "#f8fafc", 
        borderRadius: "12px",
        border: "1px solid #e2e8f0"
      }}>
        {!doctorFilter && (
           <div className="filter-group" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
             <label style={{ fontWeight: "700", color: "#475569", fontSize: "0.9rem" }}>Doctor:</label>
             <select 
               value={selectedDoctor} 
               onChange={(e) => setSelectedDoctor(e.target.value)}
               style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", minWidth: "160px" }}
             >
               <option value="">{prn ? "Select Doctor" : "All Doctors"}</option>
               {doctors.map(d => (
                 <option key={d.username} value={d.username}>{d.full_name}</option>
               ))}
             </select>
           </div>
        )}
        <div className="filter-group" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <label style={{ fontWeight: "700", color: "#475569", fontSize: "0.9rem" }}>Date:</label>
          <input 
             type="date"
             value={selectedDate}
             onChange={(e) => setSelectedDate(e.target.value)}
             style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
             min={new Date().toISOString().split('T')[0]}
          />
        </div>
        {loading && <span style={{ color: "#3b82f6", fontSize: "0.85rem", fontWeight: "600", alignSelf: "center" }}>Refetching...</span>}
      </div>

      {/* Slots Display Section */}
      {!selectedDoctor && prn ? (
        <div style={{
          textAlign: "center",
          padding: "30px",
          backgroundColor: "#f0fdf4",
          border: "1px dashed #bbf7d0",
          borderRadius: "12px",
          color: "#166534",
          fontWeight: "600",
          width: "100%"
        }}>
          👈 Please select a doctor from the dropdown above to see their schedule and book an appointment.
        </div>
      ) : Object.keys(groupedSlots).length > 0 ? (
        Object.keys(groupedSlots).map(doctor => (
          <div key={doctor} className="doctor-slot-group">
            <h4 className="doctor-name-heading">Dr. {doctor}</h4>
            <div className="slots-grid">
              {groupedSlots[doctor].map(s => {
                const isUserBooking = prn && s.patient_prn === prn;
                
                // If prn exists, we are in booking mode (colored buttons)
                if (prn) {
                  return (
                    <button
                      key={s._id}
                      className={`slot-card ${s.is_completed ? 'completed' : isUserBooking ? 'user-booked' : s.is_booked ? 'booked' : 'available'}`}
                      onClick={() => !s.is_booked && handleBook(s._id)}
                      disabled={s.is_booked || s.is_completed}
                      style={{
                        cursor: (s.is_booked || s.is_completed) ? "not-allowed" : "pointer",
                        border: "none",
                        textAlign: "center",
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                        padding: "12px",
                        borderRadius: "10px",
                        backgroundColor: s.is_completed ? "#f1f5f9" : isUserBooking ? "#0369a1" : s.is_booked ? "#0ea5e9" : "#0ea5e9", // Matching user's blue theme
                        color: "white",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        opacity: (s.is_booked && !isUserBooking) || s.is_completed ? 0.6 : 1,
                        transition: "all 0.2s"
                      }}
                    >
                      <div style={{ fontWeight: "800", fontSize: "0.9rem" }}>{s.time}</div>
                      <div style={{ fontSize: "0.7rem", fontWeight: "600", opacity: 0.9 }}>
                        {s.is_completed ? "Finished" : isUserBooking ? "Your Booking" : s.is_booked ? "Booked" : "Available"}
                      </div>
                    </button>
                  );
                }

                // Default Monitor mode (cards)
                return (
                  <div
                    key={s._id}
                    className={`slot-card ${s.is_completed ? 'completed' : s.is_booked ? 'booked' : 'available'}`}
                  >
                    <div className="slot-time">{s.time}</div>
                    <div className="slot-meta">
                      {s.is_completed ? (
                        <span className="status-badge completed">Finished</span>
                      ) : s.is_booked ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <span className="status-badge booked">
                            PRN: {s.patient_prn}
                          </span>
                          {showActions && (
                            <button 
                              className="end-session-btn-styled"
                              onClick={() => handleComplete(s._id)}
                            >
                              End Session
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="status-badge available">Available</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      ) : (
        <div className="no-slots-alert">
          <span style={{ fontSize: "2rem", display: "block", marginBottom: "10px" }}>📅</span>
          No doctor slots available for selected doctor and date.
        </div>
      )}
    </div>
  );
}

export default SlotMonitor;
