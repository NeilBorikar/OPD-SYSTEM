import { useState } from "react";
import { loginNurse } from "../services/api";
import { useNavigate } from "react-router-dom";

function NurseLogin() {
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
      await loginNurse(form);
      alert("Login Successful");
      localStorage.setItem("nurse_username", form.username);
      navigate("/nurse-dashboard", { state: { username: form.username } });
    } catch (err) {
      console.error(err);
      alert("Invalid credentials");
    }
  };

  return (
    <div className="login-page">
      <h2>Nurse Login</h2>
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

export default NurseLogin;
