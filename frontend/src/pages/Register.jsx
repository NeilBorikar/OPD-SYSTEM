import { useState } from "react";
import { registerPatient } from "../services/api";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Register = () => {
  const navigate = useNavigate();
  const [patient, setPatient] = useState({
    name: "",
    age: "",
    sex: "",
    address: "",
    phone: "",
    prn: "",
    consultationDate: "",
    department: "",
    consultant: "",
    regNo: "",
    email: "",
  });
  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    setPatient({
      ...patient,
      [e.target.name]: e.target.value,
    });
    if (status) setStatus(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    try {
      const result = await registerPatient(patient);
      console.log("Registered:", result);
      setStatus({ type: "ok", text: "Patient registered. Opening consultation…" });
      const prn = patient.prn;
      setPatient({
        name: "",
        age: "",
        sex: "",
        address: "",
        phone: "",
        prn: "",
        consultationDate: "",
        department: "",
        consultant: "",
        regNo: "",
        email: "",
      });
      setTimeout(() => navigate("/consultation", { state: { prn } }), 500);
    } catch (error) {
      console.error("Registration failed:", error);
      setStatus({ type: "err", text: "Registration failed. Check details and try again." });
    }
  };

  const field = (props) => <input {...props} onChange={handleChange} />;

  return (
    <div className="page-bleed">
      <motion.div
        className="page-hero"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1>Register new patient</h1>
        <p>Capture demographics and visit context. You can continue straight into consultation.</p>
      </motion.div>

      <motion.form
        onSubmit={handleSubmit}
        className="card-surface register-grid"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08 }}
      >
        {status && (
          <div
            className={`auth-banner ${status.type === "ok" ? "auth-banner--ok" : "auth-banner--err"}`}
            role="status"
          >
            {status.text}
          </div>
        )}

        <p className="register-section-title">Identity</p>
        {field({
          name: "name",
          placeholder: "Patient name",
          value: patient.name,
          required: true,
        })}
        {field({
          name: "age",
          placeholder: "Age",
          value: patient.age,
        })}
        <select name="sex" value={patient.sex} onChange={handleChange} required>
          <option value="">Sex</option>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>

        <p className="register-section-title">Contact</p>
        {field({
          name: "address",
          placeholder: "Address",
          value: patient.address,
        })}
        {field({
          name: "phone",
          placeholder: "Phone number",
          value: patient.phone,
        })}
        {field({
          name: "email",
          placeholder: "Email address",
          value: patient.email,
        })}

        <p className="register-section-title">Visit</p>
        {field({
          name: "prn",
          placeholder: "PRN / PSN number",
          value: patient.prn,
        })}
        {field({
          type: "date",
          name: "consultationDate",
          value: patient.consultationDate,
        })}
        {field({
          name: "department",
          placeholder: "Department",
          value: patient.department,
        })}
        {field({
          name: "consultant",
          placeholder: "Consultant name",
          value: patient.consultant,
        })}
        {field({
          name: "regNo",
          placeholder: "Registration number",
          value: patient.regNo,
        })}

        <button type="submit" className="btn btn-primary">
          Register &amp; continue
        </button>
      </motion.form>
    </div>
  );
};

export default Register;
