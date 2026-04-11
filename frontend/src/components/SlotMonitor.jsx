import { useState, useEffect, useCallback } from "react";
import { getSlots, completeSlot } from "../services/api";

function SlotMonitor({ doctorFilter = null, showActions = false }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSlots = useCallback(async () => {
    try {
      const data = await getSlots();
      setSlots(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlots();
    // Auto-refresh every 60 seconds to keep dynamic times synced across staff screens
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

  if (loading) return <p className="loading-text">Loading slots...</p>;

  // Filter, Sort and Group
  let processedSlots = [...slots].sort((a, b) => a.time.localeCompare(b.time));
  
  if (doctorFilter) {
    processedSlots = processedSlots.filter(s => s.doctor_username === doctorFilter);
  }

  const groupedSlots = processedSlots.reduce((acc, slot) => {
    if (!acc[slot.doctor_username]) acc[slot.doctor_username] = [];
    acc[slot.doctor_username].push(slot);
    return acc;
  }, {});

  return (
    <div className="slot-monitor-container">
      {Object.keys(groupedSlots).length > 0 ? (
        Object.keys(groupedSlots).map(doctor => (
          <div key={doctor} className="doctor-slot-group">
            <h4 className="doctor-name-heading">
              Dr. {doctor}
            </h4>
            <div className="slots-grid">
              {groupedSlots[doctor].map(s => (
                <div
                  key={s._id}
                  className={`slot-card ${s.is_completed ? 'completed' : s.is_booked ? 'booked' : 'available'}`}
                >
                  <div className="slot-time">
                    {s.time}
                  </div>
                  
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
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="no-slots-alert">
          <span style={{ fontSize: "2rem", display: "block", marginBottom: "10px" }}>📅</span>
          No doctor slots generated for today yet.
        </div>
      )}
    </div>
  );
}

export default SlotMonitor;
