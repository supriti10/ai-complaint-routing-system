import React, { useEffect, useState } from "react";
import API from "../api";
import Layout from "../components/Layout";
import toast from "react-hot-toast";
import { all } from "axios";

export default function OfficerDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [unassigned, setUnassigned] = useState([]);
  const [filter, setFilter] = useState("");
  const allComplaints = [...complaints, ...unassigned];

  // 🔥 FETCH DATA
  const fetchData = async () => {
    try {
      const res = await API.get("/officer/complaints");

      setComplaints(res.data.assigned || []);
      setUnassigned(res.data.unassigned || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load complaints");
    }
  };

  // 🔄 UPDATE STATUS
  const update = async (id, status) => {
    try {
      await API.put(`/officer/complaints/${id}?status=${status}`);
      toast.success("Updated");
      fetchData();
    } catch {
      toast.error("Update failed");
    }
  };

  // 🔥 TAKE COMPLAINT
  const takeComplaint = async (id) => {
    try {
      await API.put(`/officer/take/${id}`);
  
      toast.success("Assigned to you 🚀");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🔍 FILTER
  const filtered = filter
    ? complaints.filter(c => c.status === filter)
    : complaints;

  // 📊 ANALYTICS
  const stats = {
    total: allComplaints.length,
    pending: allComplaints.filter(c => c.status === "Pending").length,
    progress: allComplaints.filter(c => c.status === "In Progress").length,
    resolved: allComplaints.filter(c => c.status === "Resolved").length,
  };

  return (
    <Layout>

      {/* 🔥 HEADER */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">🚀 Officer Control Panel</h1>
        <p className="text-gray-500">Handle assigned complaints smartly</p>
      </div>

      {/* 📊 ANALYTICS */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          ["Total", stats.total, "bg-gray-700"],
          ["Pending", stats.pending, "bg-yellow-500"],
          ["In Progress", stats.progress, "bg-blue-500"],
          ["Resolved", stats.resolved, "bg-green-500"],
        ].map(([title, val, color]) => (
          <div key={title}
            className={`text-white p-4 rounded-xl shadow ${color}`}>
            <p className="text-sm">{title}</p>
            <h2 className="text-2xl font-bold">{val}</h2>
          </div>
        ))}
      </div>

      {/* 🔍 FILTER */}
      <select
        onChange={(e)=>setFilter(e.target.value)}
        className="mb-4 border p-2 rounded-lg shadow"
      >
        <option value="">All</option>
        <option>Pending</option>
        <option>In Progress</option>
        <option>Resolved</option>
      </select>

      {/* 🧾 ASSIGNED */}
      <h2 className="text-xl font-bold mb-3">📌 My Complaints</h2>

      <div className="grid md:grid-cols-2 gap-6">
        {filtered.length === 0 && (
          <p className="text-gray-500">No assigned complaints</p>
        )}

        {filtered.map(c => (
          <div key={c.id}
            className="backdrop-blur-lg bg-white/70 p-5 rounded-2xl shadow-lg hover:scale-[1.02] transition">

            <p className="font-semibold text-lg mb-2">
              {c.complaint_text}
            </p>

            <p className="text-gray-500 mb-3">
              🏢 {c.predicted_department}
            </p>

            {/* 🎯 PRIORITY */}
            <span className={`px-4 py-1.5 rounded-full text-xs font-semibold shadow-md ${
              c.priority?.toLowerCase() === "high"
                ? "bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 text-white"
                : c.priority?.toLowerCase() === "medium"
                ? "bg-gradient-to-r from-yellow-400 via-orange-400 to-amber-500 text-black"
                : "bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 text-white"
            }`}>
              {c.priority?.toLowerCase() === "high" && "🔥 HIGH"}
              {c.priority?.toLowerCase() === "medium" && "⚡ MEDIUM"}
              {c.priority?.toLowerCase() === "low" && "✅ LOW"}
            </span>

            {/* 🔄 STATUS */}
            <div className="mt-3">
              <span className={`px-4 py-1.5 rounded-full text-xs font-semibold shadow-md ${
                c.status?.toLowerCase() === "pending"
                  ? "bg-gray-200/70 backdrop-blur-md text-black"
                  : c.status?.toLowerCase() === "in progress"
                  ? "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white"
                  : "bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 text-white"
              }`}>
                {c.status === "Pending" && "⏳ Pending"}
                {c.status === "In Progress" && "🚀 In Progress"}
                {c.status === "Resolved" && "✅ Resolved"}
              </span>
            </div>

            {/* ⚙ ACTIONS */}
            <div className="mt-4 flex gap-3">

              {/* 🟡 Pending → Show Start */}
              {c.status === "Pending" && (
                <button
                  onClick={()=>update(c.id,"In Progress")}
                  className="px-4 py-1.5 rounded-xl text-white text-sm font-medium
                            bg-gradient-to-r from-blue-500 to-indigo-600
                            hover:scale-105 transition shadow"
                >
                  Start 🚀
                </button>
              )}

              {/* 🔵 In Progress → Show Resolve */}
              {c.status === "In Progress" && (
                <button
                  onClick={()=>update(c.id,"Resolved")}
                  className="px-4 py-1.5 rounded-xl text-white text-sm font-medium
                            bg-gradient-to-r from-green-500 to-emerald-600
                            hover:scale-105 transition shadow"
                >
                  Resolve ✅
                </button>
              )}

              {/* 🟢 Resolved → Show nothing */}
              {c.status === "Resolved" && (
                <span className="text-sm text-gray-500 italic">
                  ✔ Completed
                </span>
              )}

            </div>

          </div>
        ))}
      </div>

      {/* 🧾 UNASSIGNED */}
      <h2 className="text-xl font-bold mt-8 mb-3">
        📥 Available Complaints
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        {unassigned.length === 0 && (
          <p className="text-gray-500">No available complaints</p>
        )}

        {unassigned.map(c => (
          <div key={c.id}
            className="bg-white p-5 rounded-2xl shadow border hover:shadow-xl transition">

            <p className="font-semibold text-lg mb-2">
              {c.complaint_text}
            </p>

            <p className="text-gray-500 mb-3">
              🏢 {c.predicted_department}
            </p>

            {/* 🔥 CLEAN ROW */}
            <div className="flex items-center justify-between mt-3">

              <span className={`px-4 py-1.5 rounded-full text-xs font-semibold shadow-md ${
                c.priority?.toLowerCase() === "high"
                  ? "bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 text-white"
                  : c.priority?.toLowerCase() === "medium"
                  ? "bg-gradient-to-r from-yellow-400 via-orange-400 to-amber-500 text-black"
                  : "bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 text-white"
              }`}>
                {c.priority?.toLowerCase() === "high" && "🔥 HIGH"}
                {c.priority?.toLowerCase() === "medium" && "⚡ MEDIUM"}
                {c.priority?.toLowerCase() === "low" && "✅ LOW"}
              </span>

              <button
                onClick={()=>takeComplaint(c.id)}
                className="px-5 py-2 rounded-xl text-white font-medium 
                           bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500
                           hover:scale-105 transition shadow-md"
              >
                Take
              </button>

            </div>

          </div>
        ))}
      </div>

    </Layout>
  );
}