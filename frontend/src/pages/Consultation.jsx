import { useState } from "react";
import "../index.css";
import { saveConsultation, getPatient } from "../services/api";
import { AnimatePresence, motion } from "framer-motion";

function CollapsibleSection({ title, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="consult-section">
      <button
        type="button"
        className="consult-section-toggle"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{title}</span>
        <span className="consult-section-chevron" aria-hidden>
          ▾
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="consult-section-body"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Consultation() {
  const [medicines, setMedicines] = useState([{ name: "", dose: "" }]);
  const [saveState, setSaveState] = useState(null);

  const addMedicine = () => {
    setMedicines([...medicines, { name: "", dose: "" }]);
  };

  const [formData, setFormData] = useState({
    patient_name: "",
    age: "",
    gender: "",
    address: "",
    prn: "",
    bp: "",
    pulse: "",
    spo2: "",
    weight: "",
    height: "",
    bmi: "",
    complaints: "",
    examination: "",
    past_history: "",
    allergy: "",
    diagnosis: "",
    advice: "",
    investigations: "",
    next_visit_date: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async () => {
    setSaveState(null);
    const payload = {
      ...formData,
      medicines,
    };
    try {
      const res = await saveConsultation(payload);
      setSaveState({ type: "ok", text: "Consultation saved successfully." });
      console.log(res);
    } catch (error) {
      console.error(error);
      setSaveState({ type: "err", text: "Could not save. Check connection and try again." });
    }
  };

  const fetchPatient = async (prn) => {
    try {
      const data = await getPatient(prn);
      if (data.message !== "Patient not found") {
        setFormData((prev) => ({
          ...prev,
          patient_name: data.name,
          age: data.age,
          gender: data.sex,
          address: data.address,
        }));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="page-wrapper">
      <motion.div
        className="prescription-paper"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <hr />

        <h3 className="section-title">OPD consultation sheet</h3>

        {saveState && (
          <div
            className={`auth-banner ${saveState.type === "ok" ? "auth-banner--ok" : "auth-banner--err"}`}
            style={{ marginBottom: "1rem" }}
            role="status"
          >
            {saveState.text}
          </div>
        )}

        <CollapsibleSection title="Patient & visit details" defaultOpen>
          <div className="patient-info-container">
            <div className="patient-info-left">
              <p>
                <b>Patient name</b>{" "}
                <input
                  name="patient_name"
                  className="line-input"
                  value={formData.patient_name}
                  onChange={handleChange}
                />
              </p>
              <p>
                <b>Age</b>{" "}
                <input name="age" className="small-input" value={formData.age} onChange={handleChange} />
              </p>
              <p>
                <b>Gender</b>{" "}
                <input
                  name="gender"
                  className="small-input"
                  value={formData.gender}
                  onChange={handleChange}
                />
              </p>
              <p>
                <b>Address</b>{" "}
                <input
                  name="address"
                  className="line-input"
                  value={formData.address}
                  onChange={handleChange}
                />
              </p>
              <p>
                <b>PRN / PSN</b>{" "}
                <input
                  name="prn"
                  className="line-input"
                  value={formData.prn}
                  onChange={(e) => {
                    handleChange(e);
                    fetchPatient(e.target.value);
                  }}
                />
              </p>
            </div>
            <div className="patient-info-right">
              <p>
                <b>Department</b> Neurosurgery
              </p>
              <p>
                <b>Consultation date</b> <input type="date" />
              </p>
              <p>
                <b>Next visit date</b>{" "}
                <input
                  type="date"
                  name="next_visit_date"
                  value={formData.next_visit_date}
                  onChange={handleChange}
                  className="line-input"
                  style={{ width: "auto" }}
                />
              </p>
              <p>
                <b>Consultant</b> Dr. Rakesh Kumar Das
              </p>
              <p>MBBS, MS, M.Ch. (Neurosurgery)</p>
              <p>Reg No-102761 (WBMC)</p>
              <p>Consultant Brain &amp; Spine Surgeon</p>
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Vitals" defaultOpen>
          <div className="vitals">
            <div>
              <p>
                BP <input name="bp" className="small-input" value={formData.bp} onChange={handleChange} />
              </p>
              <p>
                Pulse{" "}
                <input name="pulse" className="small-input" value={formData.pulse} onChange={handleChange} />
              </p>
              <p>
                SpO₂{" "}
                <input name="spo2" className="small-input" value={formData.spo2} onChange={handleChange} />
              </p>
            </div>
            <div>
              <p>
                Weight{" "}
                <input name="weight" className="small-input" value={formData.weight} onChange={handleChange} />
              </p>
              <p>
                Height{" "}
                <input name="height" className="small-input" value={formData.height} onChange={handleChange} />
              </p>
              <p>
                BMI <input name="bmi" className="small-input" value={formData.bmi} onChange={handleChange} />
              </p>
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Clinical notes" defaultOpen>
          <div className="section" style={{ marginTop: 0 }}>
            <p>
              <b>Chief complaints</b>
            </p>
            <textarea name="complaints" value={formData.complaints} onChange={handleChange} />
          </div>
          <div className="section">
            <p>
              <b>Examination</b>
            </p>
            <textarea name="examination" value={formData.examination} onChange={handleChange} />
          </div>
          <div className="section">
            <p>
              <b>Past history</b>
            </p>
            <textarea name="past_history" value={formData.past_history} onChange={handleChange} />
          </div>
          <div className="section">
            <p>
              <b>Allergy history</b>
            </p>
            <textarea name="allergy" value={formData.allergy} onChange={handleChange} />
          </div>
          <div className="section">
            <p>
              <b>Diagnosis</b>
            </p>
            <textarea name="diagnosis" value={formData.diagnosis} onChange={handleChange} />
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Prescription (Rx)" defaultOpen>
          <div className="section" style={{ marginTop: 0 }}>
            {medicines.map((med, index) => (
              <div key={index} className="medicine-row">
                <input
                  placeholder="Medicine name"
                  value={med.name}
                  onChange={(e) => {
                    const updated = [...medicines];
                    updated[index].name = e.target.value;
                    setMedicines(updated);
                  }}
                />
                <input
                  placeholder="Dose / frequency"
                  value={med.dose}
                  onChange={(e) => {
                    const updated = [...medicines];
                    updated[index].dose = e.target.value;
                    setMedicines(updated);
                  }}
                />
              </div>
            ))}
            <button type="button" className="btn btn-ghost" onClick={addMedicine}>
              + Add medicine
            </button>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Advice & investigations" defaultOpen={false}>
          <div className="section" style={{ marginTop: 0 }}>
            <p>
              <b>Advice</b>
            </p>
            <textarea name="advice" value={formData.advice} onChange={handleChange} />
          </div>
          <div className="section">
            <p>
              <b>Investigations advised</b> <span style={{ opacity: 0.6, fontSize: "0.8em" }}>(Optional)</span>
            </p>
            <textarea
              name="investigations"
              placeholder="e.g. MRI Brain, Blood tests..."
              value={formData.investigations}
              onChange={handleChange}
            />
          </div>
        </CollapsibleSection>

        <div className="consult-actions">
          <button type="button" className="btn btn-primary" onClick={handleSubmit}>
            Save consultation
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default Consultation;
