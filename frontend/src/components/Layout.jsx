import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Layout({ children }) {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const [open, setOpen] = useState(true);
  const [dark, setDark] = useState(false);

  // 🌗 Load theme
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      setDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  // 🌗 Apply theme
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="relative flex h-screen overflow-hidden transition-colors duration-500">

      {/* 🌈 BACKGROUND */}
      <div className={`absolute inset-0 -z-10 transition-colors duration-500 ${
        dark
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-black"
          : "bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100"
      }`} />

      {/* 🔥 Glow Effects */}
      <div className="absolute -z-10 top-[-120px] left-[-120px] w-[300px] h-[300px] bg-purple-400 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute -z-10 bottom-[-120px] right-[-120px] w-[300px] h-[300px] bg-blue-400 rounded-full blur-3xl opacity-20"></div>

      {/* 🧠 Grid Pattern */}
      <div className="absolute inset-0 -z-10 opacity-10 bg-[linear-gradient(#00000010_1px,transparent_1px),linear-gradient(90deg,#00000010_1px,transparent_1px)] bg-[size:40px_40px]"></div>

      {/* 🔥 SIDEBAR */}
      <div className={`transition-all duration-300 ${open ? "w-64" : "w-16"} flex flex-col z-10 ${
        dark
          ? "bg-gray-900 text-white"
          : "bg-white shadow-xl"
      }`}>

        {/* Toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="p-3 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          ☰
        </button>

        {/* Logo */}
        <h1 className={`font-bold text-xl p-4 transition ${!open && "hidden"}`}>
          Grievance AI
        </h1>

        {/* Menu */}
        <div className="flex flex-col gap-2 p-3">

          <button
            onClick={() => navigate("/dashboard")}
            className="hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded flex items-center gap-2 transition"
          >
            🏠 {open && "Dashboard"}
          </button>

          <button
            onClick={logout}
            className="text-red-500 hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded flex items-center gap-2 transition"
          >
            🚪 {open && "Logout"}
          </button>
        </div>
      </div>

      {/* 🔥 MAIN */}
      <div className="flex-1 flex flex-col relative z-10">

        {/* 🔝 NAVBAR */}
        <div className={`shadow p-4 flex justify-between items-center rounded-xl mx-4 mt-4 transition ${
          dark
            ? "bg-gray-800 text-white"
            : "bg-white/70 backdrop-blur-lg"
        }`}>

          <h2 className="font-semibold text-lg capitalize">
            {role} Dashboard
          </h2>

          <div className="flex items-center gap-4">

            {/* 🌗 TOGGLE BUTTON */}
            <button
              onClick={() => setDark(!dark)}
              className="px-3 py-1 rounded-lg text-sm font-medium transition
                         bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:scale-105"
            >
              {dark ? "☀ Light" : "🌙 Dark"}
            </button>

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

        {/* 📦 CONTENT */}
        <div className={`p-6 overflow-y-auto transition ${
          dark ? "text-gray-100" : "text-gray-900"
        }`}>
          {children}
        </div>

      </div>
    </div>
  );
}