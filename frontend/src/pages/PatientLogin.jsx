import { useState } from "react";
import { loginPatient } from "../services/api";
import { useNavigate } from "react-router-dom";

function PatientLogin() {
  const [form, setForm] = useState({
    prn: "",
    password: ""
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async () => {
    try {
      await loginPatient(form);
      alert("Login Successful");
      navigate("/patient-dashboard", { state: { prn: form.prn } });
    } catch (err) {
      console.error(err);
      alert("Invalid credentials");
    }
  };

  return (
    <div className="login-page">
      <h2>Patient Login</h2>
      <input
        name="prn"
        placeholder="PRN"
        onChange={handleChange}
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        onChange={handleChange}
      />
      <button onClick={handleLogin}>
        Login
      </button>
    </div>
  );
}

export default PatientLogin;
