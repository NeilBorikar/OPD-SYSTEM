import { useState } from "react";
import { resetPassword } from "../services/api";
import { useNavigate } from "react-router-dom";

function ResetPassword() {

  const [form, setForm] = useState({
    username: "",
    new_password: ""
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleReset = async () => {

    try {

      await resetPassword(form);

      alert("Password Updated");

      navigate("/login");

    } catch (err) {

      alert("Error updating password");

    }

  };

  return (
    <div>

      <h2>Reset Password</h2>

      <input
        name="username"
        placeholder="Username"
        onChange={handleChange}
      />

      <input
        type="password"
        name="new_password"
        placeholder="New Password"
        onChange={handleChange}
      />

      <button onClick={handleReset}>
        Update Password
      </button>

    </div>
  );
}

export default ResetPassword;