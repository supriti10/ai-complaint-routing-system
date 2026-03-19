import { useState } from "react";
import API from "../api";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function Login() {
  const [data, setData] = useState({ email_or_phone: "", password: "" });
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!data.email_or_phone || !data.password) {
      return toast.error("Fill all fields");
    }

    try {
      const res = await API.post("/auth/login", data);

      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("role", res.data.role);

      toast.success("Welcome back!");
      navigate("/dashboard");

    } catch (err) {
      toast.error(err.response?.data?.detail || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">

      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">

        {/* 🔥 Title */}
        <h1 className="text-2xl font-bold text-center mb-2">
          AI Grievance System
        </h1>

        <p className="text-center text-gray-500 mb-6">
          Login to continue
        </p>

        {/* Inputs */}
        <input
          className="w-full border p-3 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Email or Phone"
          onChange={(e)=>setData({...data,email_or_phone:e.target.value})}
        />

        <input
          type="password"
          className="w-full border p-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Password"
          onChange={(e)=>setData({...data,password:e.target.value})}
        />

        {/* Button */}
        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Login
        </button>

        {/* Link */}
        <p className="text-center text-sm mt-4">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-blue-600 font-medium">
            Signup
          </Link>
        </p>

      </div>
    </div>
  );
}