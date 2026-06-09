import { useState } from "react";
import { registerPatient } from "../services/api";
import { useNavigate } from "react-router-dom";


const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState("");
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
    password: "",
    severityIndex: "normal"
  });

  const handleChange = (e) => {
    setPatient({
      ...patient,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {

  e.preventDefault();
  setPwError("");

  if (!patient.password) {
    setPwError("Password is required.");
    return;
  }
  if (patient.password.length < 4) {
    setPwError("Password must be at least 4 characters.");
    return;
  }
  if (patient.password !== confirmPassword) {
    setPwError("Passwords do not match.");
    return;
  }

  try {

    const result = await registerPatient(patient);

    console.log("Registered:", result);

    alert("Patient Registered Successfully!");

    // reset form
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
      password: "",
      severityIndex: "normal"
    });
    setConfirmPassword("");
   
    navigate("/consultation", { state: { prn: patient.prn } });

  } catch (error) {

    console.error("Registration failed:", error);

    alert("Error registering patient");

  }
};

  return (
    <div style={styles.container}>

      <h1 style={styles.title}>Register New Patient</h1>

      <form onSubmit={handleSubmit} style={styles.form}>

        <input
          name="name"
          placeholder="Patient Name"
          value={patient.name}
          onChange={handleChange}
          style={styles.input}
        />

        <input
          name="age"
          placeholder="Age"
          value={patient.age}
          onChange={handleChange}
          style={styles.input}
        />

        <select
          name="sex"
          value={patient.sex}
          onChange={handleChange}
          style={styles.input}
        >
          <option value="">Select Sex</option>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>

        <input
          name="address"
          placeholder="Address"
          value={patient.address}
          onChange={handleChange}
          style={styles.input}
        />

        <input
          
          name="phone"
          placeholder="Phone Number"
          value={patient.phone}
          onChange={handleChange}
          style={styles.input}
        />

        <input
          name="prn"
          placeholder="PRN / PSN Number"
          value={patient.prn}
          onChange={handleChange}
          style={styles.input}
        />

        <input
          type="date"
          name="consultationDate"
          value={patient.consultationDate}
          onChange={handleChange}
          style={styles.input}
        />

        <input
          name="department"
          placeholder="Department"
          value={patient.department}
          onChange={handleChange}
          style={styles.input}
        />

        <input
          name="consultant"
          placeholder="Consultant Name"
          value={patient.consultant}
          onChange={handleChange}
          style={styles.input}
        />

        <input
          name="regNo"
          placeholder="Registration Number"
          value={patient.regNo}
          onChange={handleChange}
          style={styles.input}
        />

        {/* Password Section */}
        <div style={styles.sectionLabel}>🔐 Patient Portal Password</div>

        <div style={styles.passwordWrap}>
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Set Password"
            value={patient.password}
            onChange={handleChange}
            style={{ ...styles.input, marginBottom: 0, paddingRight: "40px" }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={styles.eyeBtn}
            title={showPassword ? "Hide" : "Show"}
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>

        <div style={styles.passwordWrap}>
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setPwError(""); }}
            style={{ ...styles.input, marginBottom: 0, paddingRight: "40px",
              borderColor: pwError ? "#ef4444" : "#06B6D4"
            }}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            style={styles.eyeBtn}
            title={showConfirm ? "Hide" : "Show"}
          >
            {showConfirm ? "🙈" : "👁️"}
          </button>
        </div>

        {pwError && (
          <div style={styles.errorMsg}>⚠️ {pwError}</div>
        )}

        <button type="submit" style={styles.button}>
          Register Patient
        </button>

      </form>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#E0F2FE",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingTop: "40px"
  },

  title: {
    marginBottom: "20px",
    color: "#0F172A"
  },

  form: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "12px",
    width: "400px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    boxShadow: "0 6px 16px rgba(0,0,0,0.1)"
  },

  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #06B6D4",
    width: "100%"
  },

  sectionLabel: {
    fontSize: "0.78rem",
    fontWeight: 700,
    color: "#0369a1",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    marginTop: "6px",
    marginBottom: "2px",
    borderTop: "1px dashed #bae6fd",
    paddingTop: "10px"
  },

  passwordWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center"
  },

  eyeBtn: {
    position: "absolute",
    right: "8px",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    padding: "4px",
    lineHeight: 1
  },

  errorMsg: {
    color: "#dc2626",
    fontSize: "0.82rem",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "6px",
    padding: "8px 10px"
  },

  button: {
    padding: "12px",
    backgroundColor: "#06B6D4",
    border: "none",
    color: "white",
    borderRadius: "8px",
    cursor: "pointer",
    marginTop: "10px",
    fontWeight: 700,
    fontSize: "15px"
  }
};

export default Register;