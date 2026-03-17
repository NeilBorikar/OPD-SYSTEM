import { useState } from "react";
import { loginReceptionist } from "../services/api";
import { useNavigate } from "react-router-dom";

function ReceptionistLogin() {
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
      await loginReceptionist(form);
      alert("Login Successful");
      navigate("/reception-dashboard");
    } catch (err) {
      console.error(err);
      alert("Invalid credentials");
    }
  };

  return (
    <div className="login-page">
      <h2>Receptionist Login</h2>
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
    </div>
  );
}

export default ReceptionistLogin;
