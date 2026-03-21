import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import OfficerDashboard from "./pages/OfficerDashboard";

function App() {

  // 🔐 Protected Route
  const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem("token");

    if (!token) {
      return <Navigate to="/" />;
    }

    return children;
  };

  // 🎯 Role-based dashboard
  const Dashboard = () => {
    const role = localStorage.getItem("role");

    if (role === "admin") return <AdminDashboard />;
    if (role === "officer") return <OfficerDashboard />;
    return <UserDashboard />;
  };

  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;