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
      toast.success("Account created 🎉");
      navigate("/");
    } catch {
      toast.error("Signup failed");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500">

      <div className="card w-[400px]">

        <h2 className="text-3xl font-bold text-center mb-6">
          ✨ Create Account
        </h2>

        <input className="input mb-3" placeholder="Username"
          onChange={(e)=>setData({...data, username:e.target.value})} />

        <input className="input mb-3" placeholder="Email"
          onChange={(e)=>setData({...data, email:e.target.value})} />

        <input className="input mb-3" placeholder="Phone"
          onChange={(e)=>setData({...data, phone:e.target.value})} />

        <input type="password" className="input mb-3" placeholder="Password"
          onChange={(e)=>setData({...data, password:e.target.value})} />

        {/* 🔥 Role Dropdown */}
        <select
          className="input mb-4"
          onChange={(e)=>setData({...data, role:e.target.value})}
        >
          <option value="user">User</option>
          <option value="officer">Officer</option>
          <option value="admin">Admin</option>
        </select>

        <button onClick={signup} className="btn">
          Signup
        </button>

        <p className="text-center mt-4 text-sm">
          Already have an account?{" "}
          <span
            onClick={()=>navigate("/")}
            className="text-blue-600 font-semibold cursor-pointer"
          >
            Login
          </span>
        </p>

      </div>
    </div>
  );
}