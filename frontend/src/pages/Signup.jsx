import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import toast from "react-hot-toast";

export default function Signup() {
  const navigate = useNavigate();

  const [data, setData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    role: "user"
  });

  const signup = async () => {
    try {
      await API.post("/auth/signup", data);
      toast.success("Signup successful!");
      navigate("/");
    } catch {
      toast.error("Signup failed");
    }
  };

  return (
    <div
      className="h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage:
        "url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b')"
      }}
    >

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      {/* Card */}
      <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl w-96 text-white">

        <h2 className="text-3xl font-bold mb-6 text-center">
          Create Account ✨
        </h2>

        <input
          placeholder="Username"
          onChange={(e)=>setData({...data, username:e.target.value})}
          className="input-glass"
        />

        <input
          placeholder="Email"
          onChange={(e)=>setData({...data, email:e.target.value})}
          className="input-glass"
        />

        <input
          placeholder="Phone"
          onChange={(e)=>setData({...data, phone:e.target.value})}
          className="input-glass"
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e)=>setData({...data, password:e.target.value})}
          className="input-glass"
        />

        {/* Role */}
        <select
          onChange={(e)=>setData({...data, role:e.target.value})}
          className="input-glass text-black"
        >
          <option value="user">User</option>
          <option value="officer">Officer</option>
          <option value="admin">Admin</option>
        </select>

        <button
          onClick={signup}
          className="w-full py-2 mt-4 rounded-xl font-semibold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:scale-105 transition"
        >
          Signup 🚀
        </button>

        <p className="text-sm mt-4 text-center">
          Already have an account?{" "}
          <span
            onClick={()=>navigate("/")}
            className="text-indigo-300 cursor-pointer hover:underline font-semibold"
          >
            Login
          </span>
        </p>

      </div>
    </div>
  );
}