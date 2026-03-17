import { useState } from "react";
import { registerPatient } from "../services/api";
import { useNavigate } from "react-router-dom";


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
    password: "1234", // Default password for patient login
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
      regNo: ""
    });
   
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
    border: "1px solid #06B6D4"
  },

  button: {
    padding: "12px",
    backgroundColor: "#06B6D4",
    border: "none",
    color: "white",
    borderRadius: "8px",
    cursor: "pointer",
    marginTop: "10px"
  }
};

export default Register;