import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getClinics } from "../services/api";
import "../styles/global.css";
import "../styles/login.css";
import "../styles/clinic-selector.css";

const ChevronIcon = ({ open }) => (
  <svg
    className={`cs-chevron${open ? " cs-rotated" : ""}`}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 6l4 4 4-4" />
  </svg>
);

const MedicalIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const ClinicSelector = () => {
  const [clinics, setClinics] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState("");
  const [loading, setLoading] = useState(true);
  const [proceeding, setProceeding] = useState(false);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const data = await getClinics();
        setClinics(data);
      } catch (e) {
        console.error("Error fetching clinics:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchClinics();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (clinicId) => {
    setSelectedClinic(clinicId);
    setOpen(false);
  };

  const handleProceed = () => {
    if (!selectedClinic || proceeding) return;
    setProceeding(true);
    localStorage.setItem("clinic_id", selectedClinic);
    sessionStorage.setItem("login_active", "true");
    // brief pause so the spinner is visible
    setTimeout(() => navigate("/login"), 350);
  };

  const selected = clinics.find((c) => c.clinic_id === selectedClinic);

  const getInitials = (name) =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <div className="login-wrapper" style={{ position: "relative" }}>
      {/* HERO SECTION - exact match from Login.jsx */}
      <div className="login-hero-banner">
        <div className="hero-content">
          <div className="hero-brand-pill">
            <span className="pulse-dot"></span>
            <span>SYSTEM ACCESS</span>
          </div>
          <h1 
            className="hero-title"
            style={{
              color: "white",
              WebkitTextFillColor: "white",
              background: "none",
              WebkitBackgroundClip: "unset",
              backgroundClip: "unset",
              textShadow: "none"
            }}
          >
            COREPULSE
          </h1>
          <h2 
            className="hero-subtitle"
            style={{
              color: "#e2e8f0",
              WebkitTextFillColor: "#e2e8f0",
              background: "none",
              WebkitBackgroundClip: "unset",
              backgroundClip: "unset",
              textShadow: "none"
            }}
          >
            Smart Hospital Management Ecosystem
          </h2>
          <div className="hero-tags">
            <span className="tag">Connecting Doctors</span>
            <span className="tag-dot">·</span>
            <span className="tag">Nurses</span>
            <span className="tag-dot">·</span>
            <span className="tag">Receptionists</span>
            <span className="tag-dot">·</span>
            <span className="tag">Patients</span>
          </div>
        </div>
      </div>

      {/* Selector Card area */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        marginTop: "-3.5rem", // pull up over the banner
        padding: "0 1rem",
        zIndex: 10,
        position: "relative"
      }}>
        <div className="cs-card">
          {/* Icon */}
          <div className="cs-icon">
            <MedicalIcon />
          </div>

          {/* Title */}
          <h1 className="cs-title">Select Clinic</h1>
          <p className="cs-subtitle">Choose your clinic to continue</p>

          {loading ? (
            <div className="cs-skeleton">
              <div className="cs-skeleton-bar" />
              <div className="cs-skeleton-bar" style={{ width: "60%" }} />
            </div>
          ) : (
            <>
              {/* Custom dropdown */}
              <div className="cs-dropdown" ref={dropdownRef}>
                <button
                  type="button"
                  className={`cs-dropdown-trigger${open ? " cs-open" : ""}`}
                  onClick={() => setOpen((prev) => !prev)}
                >
                  {selected ? (
                    <span className="cs-trigger-content">
                      <span className="cs-trigger-badge">
                        {getInitials(selected.name)}
                      </span>
                      <span className="cs-trigger-name">{selected.name}</span>
                    </span>
                  ) : (
                    <span className="cs-placeholder">Select a clinic…</span>
                  )}
                  <ChevronIcon open={open} />
                </button>

                {open && (
                  <div className="cs-dropdown-list">
                    {clinics.map((c) => (
                      <div
                        key={c.id || c.clinic_id}
                        className={`cs-dropdown-item${
                          selectedClinic === c.clinic_id ? " cs-selected" : ""
                        }`}
                        onClick={() => handleSelect(c.clinic_id)}
                      >
                        <span className="cs-badge">{getInitials(c.name)}</span>
                        <span className="cs-item-name">{c.name}</span>
                        <span className="cs-item-id">{c.clinic_id}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Proceed button */}
              <button
                className="cs-btn"
                onClick={handleProceed}
                disabled={!selectedClinic || proceeding}
              >
                {proceeding ? (
                  <>
                    <span className="cs-spinner" />
                    Connecting…
                  </>
                ) : (
                  "Continue to Login"
                )}
              </button>
            </>
          )}

          <p className="cs-footer">COREPULSE &middot; Smart Hospital Ecosystem</p>
        </div>
      </div>
    </div>
  );
};

export default ClinicSelector;
