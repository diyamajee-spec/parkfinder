import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ParkingSlotPage from "./components/ParkingSlotPage";
import BookedSlotsPage from "./components/BookedSlotsPage";
import "./App.css";
import Navbar from "./components/Navbar";
import HomePage from "./components/HomePage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import AdminPanel from "./components/AdminPanel";
import DashboardPage from "./components/Dashboard";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/parkingslots" element={<ParkingSlotPage />} />
        <Route path="/bookings" element={<BookedSlotsPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin-panel" element={<AdminPanel />} />
      </Routes>
    </Router>
  );
}

export default App;
