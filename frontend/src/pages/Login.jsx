import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import toast from "react-hot-toast";

export default function Login() {
  const navigate = useNavigate();

  const [data, setData] = useState({
    name: "",
    email_or_phone: "",
    password: ""
  });

  const login = async () => {
    try {
      const res = await API.post("/auth/login", data);

      if (res.data.error) {
        return toast.error(res.data.error);
      }

      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("user_id", res.data.id);

      toast.success("Login successful!");
      navigate("/dashboard");

    } catch {
      toast.error("Login failed");
    }
  };

  return (
    <div
      className="h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage:
        "url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40')"
      }}
    >

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      {/* Card */}
      <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl w-80 text-white">

        <h2 className="text-3xl font-bold mb-6 text-center">
          Welcome Back 👋
        </h2>

        {/* Input */}
        <input
          placeholder="Username / Email / Phone"
          onChange={(e)=>setData({...data, username:e.target.value})}
          className="w-full p-3 mb-3 rounded-xl bg-white/20 placeholder-white/70 text-white outline-none focus:ring-2 focus:ring-indigo-400"
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e)=>setData({...data, password:e.target.value})}
          className="w-full p-3 mb-4 rounded-xl bg-white/20 placeholder-white/70 text-white outline-none focus:ring-2 focus:ring-indigo-400"
        />

        {/* Button */}
        <button
          onClick={login}
          className="w-full py-2 rounded-xl font-semibold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:scale-105 transition"
        >
          Login 🚀
        </button>

        {/* Signup */}
        <p className="text-sm mt-4 text-center">
          Don’t have an account?{" "}
          <span
            onClick={()=>navigate("/signup")}
            className="text-indigo-300 cursor-pointer hover:underline font-semibold"
          >
            Signup
          </span>
        </p>

      </div>
    </div>
  );
}