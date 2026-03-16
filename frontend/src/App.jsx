import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";

import Login from "./pages/Login";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Consultation from "./pages/Consultation";
import History from "./pages/History";
import ResetPassword from "./pages/ResetPassword";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>

        {/* default route */}
        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/login" element={<Login />} />
        <Route path="/reset" element={<ResetPassword />} />

        {/* protected routes (temporarily open) */}
        <Route path="/home" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/consultation" element={<Consultation />} />
        <Route path="/history" element={<History />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;