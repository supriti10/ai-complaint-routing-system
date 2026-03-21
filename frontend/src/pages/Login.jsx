import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import toast from "react-hot-toast";

export default function Login() {
  const navigate = useNavigate();

  const [data, setData] = useState({
    username: "",
    password: ""
  });

  const login = async () => {
    try {
      if (!data.username || !data.password) {
        return toast.error("Enter all fields");
      }

      const res = await API.post("/auth/login", data);

      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("user_id", res.data.id);

      toast.success("Welcome back 🚀");
      navigate("/dashboard");

    } catch (err) {
      toast.error(err.response?.data?.detail || "Login failed");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-500">

      <div className="card w-[350px]">

        <h2 className="text-3xl font-bold text-center mb-6">
          🚀 Welcome Back
        </h2>

        <input
          placeholder="Username / Email / Phone"
          className="input mb-3"
          onChange={(e)=>setData({...data, username:e.target.value})}
        />

        <input
          type="password"
          placeholder="Password"
          className="input mb-4"
          onChange={(e)=>setData({...data, password:e.target.value})}
        />

        <button onClick={login} className="btn">
          Login
        </button>

        <p className="text-center mt-4 text-sm">
          Don’t have an account?{" "}
          <span
            onClick={()=>navigate("/signup")}
            className="text-blue-600 font-semibold cursor-pointer"
          >
            Signup
          </span>
        </p>

      </div>
    </div>
  );
}