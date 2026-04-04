import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

export default function Layout({ children }) {
  const navigate = useNavigate();

  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name");

  const [dropdown, setDropdown] = useState(false);

  // 🔥 MODALS
  const [showActivity, setShowActivity] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const dropdownRef = useRef();

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  // 🔥 CLOSE DROPDOWN ON OUTSIDE CLICK
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const displayName = name || "User";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="relative min-h-screen text-white">

      {/* BACKGROUND */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-black via-gray-900 to-black" />

      {/* MAIN */}
      <div className="flex flex-col relative z-10 max-w-7xl mx-auto w-full">

        {/* NAVBAR */}
        <div className="bg-gray-800 p-4 flex justify-between items-center rounded-xl mt-4">

          <h2 className="font-semibold text-lg capitalize">
            {role} Dashboard
          </h2>

          <div className="flex items-center gap-4">

            <div className="bg-blue-500/20 px-3 py-1 rounded-full text-sm capitalize">
              {role}
            </div>

            <div className="hidden md:block font-medium">
              {displayName}
            </div>

            {/* 🔥 PROFILE DROPDOWN */}
            <div className="relative" ref={dropdownRef}>

              <div
                onClick={() => setDropdown(!dropdown)}
                className="w-8 h-8 bg-blue-500 flex items-center justify-center rounded-full font-bold cursor-pointer"
              >
                {initial}
              </div>

              {dropdown && (
                <div className="absolute right-0 mt-2 bg-white text-black rounded-lg shadow-lg w-56 overflow-hidden">

                  {/* HEADER */}
                  <div className="p-3 border-b">
                    <p className="font-semibold">{displayName}</p>
                    <p className="text-xs text-gray-500 capitalize">{role}</p>
                  </div>

                  {/* 🔥 NEW OPTIONS */}
                  <button
                    onClick={() => {
                      setShowActivity(true);
                      setDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100"
                  >
                    📊 My Activity
                  </button>

                  <button
                    onClick={() => {
                      setShowHelp(true);
                      setDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100"
                  >
                    📄 Help / Support
                  </button>

                  <button
                    onClick={logout}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 text-red-500"
                  >
                    🚪 Logout
                  </button>

                </div>
              )}
            </div>

          </div>
        </div>

        {/* CONTENT */}
        <div className="p-6 md:p-6">
          {children}
        </div>

      </div>

      {/* 🔥 ACTIVITY MODAL */}
      {showActivity && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white text-black p-6 rounded-xl w-80">

            <h2 className="text-xl font-bold mb-4">📊 My Activity</h2>

            {/* STATIC SAFE DATA */}
            <p>Last submitted complaint date -- </p>

            <button
              onClick={() => setShowActivity(false)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
            >
              Close
            </button>

          </div>
        </div>
      )}

      {/* 🔥 HELP MODAL */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white text-black p-6 rounded-xl w-80">

            <h2 className="text-xl font-bold mb-4">📄 Help</h2>

            <p className="text-sm">
              • Submit complaints using the text box  <br />
              • Track status in dashboard  <br />
              • Contact admin if unresolved  <br />
            </p>

            <button
              onClick={() => setShowHelp(false)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
            >
              Close
            </button>

          </div>
        </div>
      )}

    </div>
  );
}