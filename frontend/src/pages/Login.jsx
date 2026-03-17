import { useState } from "react";
import { loginUnified } from "../services/api";
import { useNavigate } from "react-router-dom";

function Login() {
  const [form, setForm] = useState({
    username: "",
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
      const res = await loginUnified(form);
      alert("Login Successful");

      if (res.role === "doctor") {
        navigate("/doctor-dashboard");
      } else if (res.role === "nurse") {
        navigate("/nurse-dashboard", { state: { username: form.username } });
      } else if (res.role === "receptionist") {
        navigate("/reception-dashboard");
      }
    } catch (err) {
      console.error(err);
      alert("Invalid credentials / User not found");
    }
  };

  return (
    <div className="login-page">
      <h2>Staff Login (Doctor / Nurse / Receptionist)</h2>
      <input
        name="username"
        placeholder="Username"
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

      <p
        style={{ cursor: "pointer", color: "blue", marginTop: "15px" }}
        onClick={() => navigate("/reset")}
      >
        Forgot Password?
      </p>
    </div>
  );
}

export default Login;