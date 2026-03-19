import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import OfficerDashboard from "./pages/OfficerDashboard";

function App() {
  const role = localStorage.getItem("role");

  const getDashboard = () => {
    if (role === "admin") return <AdminDashboard />;
    if (role === "officer") return <OfficerDashboard />;
    return <UserDashboard />;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={getDashboard()} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;