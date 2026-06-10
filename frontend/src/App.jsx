import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ModernNavbar from "./components/ModernNavbar";
import ProtectedRoute from "./components/ProtectedRoute";

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

        {/* Default route */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/reset" element={<ResetPassword />} />
        <Route path="/nurse-login" element={<NurseLogin />} />
        <Route path="/receptionist-login" element={<ReceptionistLogin />} />
        <Route path="/patient-login" element={<Navigate to="/login" />} />

        {/* Doctor-only routes */}
        <Route path="/doctor-dashboard" element={
          <ProtectedRoute allowedRoles={["doctor"]}>
            <DoctorDashboard />
          </ProtectedRoute>
        } />
        <Route path="/home" element={
          <ProtectedRoute allowedRoles={["doctor"]}>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/register" element={
          <ProtectedRoute allowedRoles={["doctor"]}>
            <Register />
          </ProtectedRoute>
        } />
        <Route path="/consultation" element={
          <ProtectedRoute allowedRoles={["doctor"]}>
            <Consultation />
          </ProtectedRoute>
        } />
        <Route path="/history" element={
          <ProtectedRoute allowedRoles={["doctor"]}>
            <History />
          </ProtectedRoute>
        } />

        {/* Nurse-only routes */}
        <Route path="/nurse" element={
          <ProtectedRoute allowedRoles={["nurse"]}>
            <NurseDashboard />
          </ProtectedRoute>
        } />
        <Route path="/nurse/past-tasks" element={
          <ProtectedRoute allowedRoles={["nurse"]}>
            <PastTasks />
          </ProtectedRoute>
        } />

        {/* Receptionist-only routes */}
        <Route path="/reception-dashboard" element={
          <ProtectedRoute allowedRoles={["receptionist"]}>
            <ReceptionistDashboard />
          </ProtectedRoute>
        } />

        {/* Patient-only routes */}
        <Route path="/patient-dashboard" element={
          <ProtectedRoute allowedRoles={["patient"]}>
            <PatientDashboard />
          </ProtectedRoute>
        } />

      </Routes>
    </BrowserRouter>
  );
}

export default App;