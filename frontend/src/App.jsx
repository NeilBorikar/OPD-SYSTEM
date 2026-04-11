import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ModernNavbar from "./components/ModernNavbar";

import Login from "./pages/Login";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Consultation from "./pages/Consultation";
import History from "./pages/History";
import ResetPassword from "./pages/ResetPassword";

import NurseLogin from "./pages/NurseLogin";
import ReceptionistLogin from "./pages/ReceptionistLogin";
import PatientLogin from "./pages/PatientLogin";

import DoctorDashboard from "./pages/DoctorDashboard";
import NurseDashboard from "./pages/NurseDashboard";
import ReceptionistDashboard from "./pages/ReceptionistDashboard";
import PatientDashboard from "./pages/PatientDashboard";
import PastTasks from "./pages/PastTasks";

function App() {
  return (
    <BrowserRouter>
      <ModernNavbar />
      <Routes>

        {/* default route */}
        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/login" element={<Login />} />
        <Route path="/reset" element={<ResetPassword />} />

        <Route path="/nurse-login" element={<NurseLogin />} />
        <Route path="/receptionist-login" element={<ReceptionistLogin />} />
        <Route path="/patient-login" element={<PatientLogin />} />
        <Route path="/nurse-login" element={<NurseLogin />} />
        <Route path="/receptionist-login" element={<ReceptionistLogin />} />

        {/* protected routes (temporarily open) */}
        <Route path="/home" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/consultation" element={<Consultation />} />
        <Route path="/history" element={<History />} />

        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
        <Route path="/nurse" element={<NurseDashboard />} />
        <Route path="/nurse/past-tasks" element={<PastTasks />} />
        <Route path="/reception-dashboard" element={<ReceptionistDashboard />} />
        <Route path="/patient-dashboard" element={<PatientDashboard />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;