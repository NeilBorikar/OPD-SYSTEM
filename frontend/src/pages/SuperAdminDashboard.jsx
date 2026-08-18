import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/global.css";

const API_BASE = window.location.hostname === "localhost" 
  ? "http://localhost:8000" 
  : "https://corepulse-ysxr.onrender.com";

const SuperAdminDashboard = () => {
  const [tab, setTab] = useState("clinics");
  const [clinics, setClinics] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [newClinic, setNewClinic] = useState({
    clinic_id: "", name: "", address: "", phone: "", email: ""
  });

  useEffect(() => {
    if (!localStorage.getItem("super_admin")) {
      navigate("/");
    } else {
      fetchClinics();
    }
  }, [navigate]);

  const fetchClinics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/AEGIS@12250510/clinics`);
      const data = await res.json();
      setClinics(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/AEGIS@12250510/users`);
      const data = await res.json();
      setUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (t) => {
    setTab(t);
    if (t === "clinics") fetchClinics();
    if (t === "users") fetchUsers();
  };

  const handleCreateClinic = async () => {
    try {
      const res = await fetch("http://localhost:8000/AEGIS@12250510/clinics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClinic)
      });
      if (res.ok) {
        alert("Clinic created!");
        setNewClinic({ clinic_id: "", name: "", address: "", phone: "", email: "" });
        fetchClinics();
      } else {
        const d = await res.json();
        alert("Error: " + d.detail);
      }
    } catch (e) {
      alert("Error creating clinic");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ color: "#b91c1c" }}>Super Admin Mainframe</h1>
        <button onClick={() => { localStorage.removeItem("super_admin"); navigate("/"); }}>Logout</button>
      </div>

      <div style={{ margin: "2rem 0", display: "flex", gap: "1rem" }}>
        <button 
          style={{ padding: "0.5rem 1rem", background: tab === "clinics" ? "#0ea5e9" : "#e2e8f0", color: tab === "clinics" ? "white" : "black" }} 
          onClick={() => handleTabChange("clinics")}
        >
          Manage Clinics
        </button>
        <button 
          style={{ padding: "0.5rem 1rem", background: tab === "users" ? "#0ea5e9" : "#e2e8f0", color: tab === "users" ? "white" : "black" }} 
          onClick={() => handleTabChange("users")}
        >
          Global Users View
        </button>
      </div>

      {loading && <p>Loading data...</p>}

      {!loading && tab === "clinics" && (
        <div>
          <h2>Register New Clinic</h2>
          <div style={{ display: "grid", gap: "1rem", maxWidth: "400px", marginBottom: "2rem" }}>
            <input placeholder="Clinic ID (e.g. IR)" value={newClinic.clinic_id} onChange={e => setNewClinic({...newClinic, clinic_id: e.target.value})} />
            <input placeholder="Name" value={newClinic.name} onChange={e => setNewClinic({...newClinic, name: e.target.value})} />
            <input placeholder="Address" value={newClinic.address} onChange={e => setNewClinic({...newClinic, address: e.target.value})} />
            <input placeholder="Phone" value={newClinic.phone} onChange={e => setNewClinic({...newClinic, phone: e.target.value})} />
            <input placeholder="Email" value={newClinic.email} onChange={e => setNewClinic({...newClinic, email: e.target.value})} />
            <button onClick={handleCreateClinic} style={{ background: "#10b981", color: "white" }}>Register Clinic</button>
          </div>

          <h2>Registered Clinics</h2>
          <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f1f5f9" }}>
                <th style={{ padding: "1rem" }}>ID</th>
                <th>Name</th>
                <th>Address</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {clinics.map(c => (
                <tr key={c.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "1rem" }}>{c.clinic_id}</td>
                  <td>{c.name}</td>
                  <td>{c.address}</td>
                  <td>{c.verification_status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && tab === "users" && (
        <div>
          <h2>Universal Patient Directory</h2>
          {users.map(u => (
            <div key={u._id} style={{ background: "#f8fafc", padding: "1rem", margin: "1rem 0", borderRadius: "8px" }}>
              <h3>{u.name} (PRN: {u.prn})</h3>
              <p>Contact: {u.phone || "N/A"}</p>
              <h4>Consultations Across Clinics:</h4>
              <ul>
                {u.consultations?.map(c => (
                  <li key={c._id}>{c.clinic_id} - {c.diagnosis} ({c.advice})</li>
                ))}
                {(!u.consultations || u.consultations.length === 0) && <li>No consultations</li>}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
