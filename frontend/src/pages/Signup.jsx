import { useState } from "react";
import API from "../api";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

export default function Signup() {
  const [data, setData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "user"
  });

  const handleSignup = async () => {
    if (!data.name || !data.email || !data.phone || !data.password) {
      return toast.error("Fill all fields");
    }

    try {
      await API.post("/auth/signup", data);
      toast.success("Account created!");

    } catch (err) {
      console.log(err.response?.data);
      toast.error(err.response?.data?.detail || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-500 to-teal-600">

      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">

        {/* 🔥 Title */}
        <h1 className="text-2xl font-bold text-center mb-2">
          Create Account
        </h1>

        <p className="text-center text-gray-500 mb-6">
          Join AI Grievance System
        </p>

        {/* Inputs */}
        <input
          className="w-full border p-3 rounded-lg mb-3 focus:ring-2 focus:ring-green-400"
          placeholder="Full Name"
          onChange={(e)=>setData({...data,name:e.target.value})}
        />

        <input
          className="w-full border p-3 rounded-lg mb-3 focus:ring-2 focus:ring-green-400"
          placeholder="Email"
          onChange={(e)=>setData({...data,email:e.target.value})}
        />

        <input
          className="w-full border p-3 rounded-lg mb-3 focus:ring-2 focus:ring-green-400"
          placeholder="Phone"
          onChange={(e)=>setData({...data,phone:e.target.value})}
        />

        <input
          type="password"
          className="w-full border p-3 rounded-lg mb-3 focus:ring-2 focus:ring-green-400"
          placeholder="Password"
          onChange={(e)=>setData({...data,password:e.target.value})}
        />

        {/* Role */}
        <select
          className="w-full border p-3 rounded-lg mb-4"
          onChange={(e)=>setData({...data,role:e.target.value})}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="officer">Officer</option>
        </select>

        {/* Button */}
        <button
          onClick={handleSignup}
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
        >
          Signup
        </button>

        {/* Link */}
        <p className="text-center text-sm mt-4">
          Already have an account?{" "}
          <Link to="/" className="text-green-600 font-medium">
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}