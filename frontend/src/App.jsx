import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Consultation from "./pages/Consultation";
import History from "./pages/History";
import Navbar from "./components/Navbar";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/consultation" element={<Consultation />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </Router>
  );
}

export default App;