import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Layout({ children }) {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const [open, setOpen] = useState(true);

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-100 to-gray-200">

      {/* 🔥 Sidebar */}
      <div className={`bg-white shadow-xl transition-all duration-300 ${open ? "w-64" : "w-16"} flex flex-col`}>

        {/* Toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="p-3 text-gray-600 hover:bg-gray-100"
        >
          ☰
        </button>

        {/* Logo */}
        <h1 className={`font-bold text-xl p-4 ${!open && "hidden"}`}>
          Grievance AI
        </h1>

        {/* Menu */}
        <div className="flex flex-col gap-2 p-3">

          <button
            onClick={() => navigate("/dashboard")}
            className="hover:bg-gray-200 p-2 rounded flex items-center gap-2"
          >
            🏠 {open && "Dashboard"}
          </button>

          <button
            onClick={logout}
            className="text-red-500 hover:bg-gray-200 p-2 rounded flex items-center gap-2"
          >
            🚪 {open && "Logout"}
          </button>
        </div>
      </div>

      {/* 🔥 Main */}
      <div className="flex-1 flex flex-col">

        {/* 🔝 Navbar */}
        <div className="bg-white shadow p-4 flex justify-between items-center">

          <h2 className="font-semibold text-lg">
            Dashboard
          </h2>

          <div className="flex items-center gap-4">

            {/* 👤 Role Badge */}
            <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
              {role}
            </div>

            {/* 👤 Avatar */}
            <div className="w-8 h-8 bg-blue-500 text-white flex items-center justify-center rounded-full">
              {role?.[0]?.toUpperCase()}
            </div>
          </div>
        </div>

        {/* 📦 Content */}
        <div className="p-6 overflow-y-auto">
          {children}
        </div>

      </div>
    </div>
  );
}