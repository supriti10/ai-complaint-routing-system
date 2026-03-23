import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Layout({ children }) {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const [open, setOpen] = useState(true);

  // 🔥 FORCE DARK MODE ALWAYS
  useEffect(() => {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="relative flex h-screen overflow-hidden text-white">

      {/* 🌌 INSANE BACKGROUND */}
      <div className="absolute inset-0 -z-10 
        bg-gradient-to-br from-black via-gray-900 to-black" />

      {/* 🔥 Glow Layers */}
      <div className="absolute top-[-150px] left-[-150px] w-[400px] h-[400px] bg-purple-600 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute bottom-[-150px] right-[-150px] w-[400px] h-[400px] bg-blue-600 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-pink-500 rounded-full blur-3xl opacity-10"></div>

      {/* 🧠 GRID */}
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(#ffffff10_1px,transparent_1px),linear-gradient(90deg,#ffffff10_1px,transparent_1px)] bg-[size:40px_40px]"></div>

      {/* SIDEBAR */}
      <div className={`transition-all duration-300 ${open ? "w-64" : "w-16"} flex flex-col z-10 bg-gray-900`}>

        <button onClick={() => setOpen(!open)} className="p-3 hover:bg-gray-700">
          ☰
        </button>

        <h1 className={`font-bold text-xl p-4 ${!open && "hidden"}`}>
          Grievance AI
        </h1>

        <div className="flex flex-col gap-2 p-3">

          <button
            onClick={() => navigate("/dashboard")}
            className="hover:bg-gray-700 p-2 rounded flex items-center gap-2"
          >
            🏠 {open && "Dashboard"}
          </button>

          <button
            onClick={logout}
            className="text-red-400 hover:bg-gray-700 p-2 rounded flex items-center gap-2"
          >
            🚪 {open && "Logout"}
          </button>

        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col relative z-10">

        {/* NAVBAR */}
        <div className="bg-gray-800 shadow p-4 flex justify-between items-center rounded-xl mx-4 mt-4">

          <h2 className="font-semibold text-lg capitalize">
            {role} Dashboard
          </h2>

          <div className="flex items-center gap-4">

            <div className="bg-blue-500/20 px-3 py-1 rounded-full text-sm">
              {role}
            </div>

            <div className="w-8 h-8 bg-blue-500 flex items-center justify-center rounded-full">
              {role?.[0]?.toUpperCase()}
            </div>

          </div>
        </div>

        {/* CONTENT */}
        <div className="p-6 overflow-y-auto">
          {children}
        </div>

      </div>
    </div>
  );
}