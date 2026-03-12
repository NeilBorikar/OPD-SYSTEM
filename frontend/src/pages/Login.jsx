import { useState } from "react";
import { loginDoctor } from "../services/api";
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

      await loginDoctor(form);

      alert("Login Successful");

      navigate("/home");

    } catch (err) {

      alert("Invalid credentials");

    }

  };

  return (
    <div className="login-page">

      <h2>Doctor Login</h2>

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
        style={{ cursor: "pointer", color: "blue" }}
        onClick={() => navigate("/reset")}
      >
        Forgot Password?
      </p>

    </div>
  );
}

export default Login;