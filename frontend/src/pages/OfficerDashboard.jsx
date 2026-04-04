import React, { useEffect, useState } from "react";
import API from "../api";
import Layout from "../components/Layout";
import toast from "react-hot-toast";

export default function OfficerDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [unassigned, setUnassigned] = useState([]);
  const [filter, setFilter] = useState("");

  const fetchData = async () => {
    try {
      const res = await API.get("/officer/complaints");
      setComplaints(res.data.assigned || []);
      setUnassigned(res.data.unassigned || []);
    } catch {
      toast.error("Failed to load complaints");
    }
  };

  const update = async (id, status) => {
    try {
      await API.put(`/officer/complaints/${id}?status=${status}`);
      toast.success("Updated");
      fetchData();
    } catch {
      toast.error("Update failed");
    }
  };

  const takeComplaint = async (id) => {
    try {
      await API.put(`/officer/take/${id}`);
      toast.success("Assigned to you 🚀");
      fetchData();
    } catch {
      toast.error("Failed to take complaint");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🔥 PERFORMANCE
  const total = complaints.length;
  const resolved = complaints.filter(c => c.status === "Resolved").length;
  const inProgress = complaints.filter(c => c.status === "In Progress").length;

  // 🔥 PRIORITY ORDER
  const priorityOrder = {
    high: 1,
    medium: 2,
    low: 3
  };

  // 🔥 FILTER + SORT
  const filtered = (filter
    ? complaints.filter(c => c.status === filter)
    : complaints
  ).sort((a, b) => {
    return (
      priorityOrder[a.priority?.toLowerCase()] -
      priorityOrder[b.priority?.toLowerCase()]
    );
  });

  // 🔥 PRIORITY STYLE (MATCH USER DASHBOARD)
  const priorityStyle = (p) => {
    p = p?.toLowerCase();

    if (p === "high")
      return "bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 text-white";

    if (p === "medium")
      return "bg-gradient-to-r from-yellow-400 via-orange-400 to-amber-500 text-black";

    return "bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 text-white";
  };

  return (
    <Layout>

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Officer Control Panel</h1>
        <p className="text-gray-400">Manage assigned complaints efficiently with priority sorting, quick actions, and performance insights.</p>
      </div>

      {/* 🔥 PERFORMANCE PANEL */}
      <div className="grid grid-cols-3 gap-4 mb-6">

        <div className="bg-gray-800 p-4 rounded-xl text-center">
          <p>Total</p>
          <h2 className="text-xl font-bold">{total}</h2>
        </div>

        <div className="bg-blue-600 p-4 rounded-xl text-center">
          <p>In Progress</p>
          <h2>{inProgress}</h2>
        </div>

        <div className="bg-green-600 p-4 rounded-xl text-center">
          <p>Resolved</p>
          <h2>{resolved}</h2>
        </div>

      </div>

      {/* FILTER */}
      <select
        onChange={(e)=>setFilter(e.target.value)}
        className="mb-4 p-2 rounded-lg bg-gray-800 border text-white"
      >
        <option value="">All</option>
        <option>Pending</option>
        <option>In Progress</option>
        <option>Resolved</option>
      </select>

      {/* ASSIGNED */}
      <h2 className="text-xl font-bold mb-3">~ My Complaints</h2>

      <div className="grid md:grid-cols-2 gap-6">
        {filtered.map(c => (
          <div key={c.id}
            className={`p-5 rounded-2xl bg-gray-800 shadow 
            ${c.priority?.toLowerCase() === "high" ? "border-2 border-red-500" : ""}`}>

            {/* TEXT */}
            <p className="font-semibold text-lg mb-2">
              {c.complaint_text}
            </p>

            {/* USER ID */}
            <p className="text-xs text-gray-400 mb-1">
              👤 {c.username || "Unknown"} (ID: {c.user_id ?? "N/A"})
            </p>

            {/* DEPT */}
            <p className="text-gray-400 mb-2">
              🏢 {c.predicted_department}
            </p>

            {/* PRIORITY */}
            <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase ${priorityStyle(c.priority)}`}>
              {c.priority}
            </span>

            {/* STATUS */}
            <div className="mt-3">
              <span className={`px-3 py-1 rounded-full text-xs ${
                c.status === "Pending"
                  ? "bg-gray-600"
                  : c.status === "In Progress"
                  ? "bg-blue-500"
                  : "bg-green-500"
              }`}>
                {c.status}
              </span>
            </div>

            {/* ACTIONS */}
            <div className="mt-4 flex gap-3 items-center">

              {c.status === "Pending" && (
                <button
                  onClick={()=>update(c.id,"In Progress")}
                  className="px-4 py-1 rounded-xl bg-blue-600"
                >
                  Start
                </button>
              )}

              {c.status === "In Progress" && (
                <button
                  onClick={()=>update(c.id,"Resolved")}
                  className="px-4 py-1 rounded-xl bg-green-600"
                >
                  Resolve
                </button>
              )}

            </div>

          </div>
        ))}
      </div>

      {/* UNASSIGNED */}
      <h2 className="text-xl font-bold mt-8 mb-3">📥 Available Complaints</h2>

      <div className="grid md:grid-cols-2 gap-6">
        {unassigned.map(c => (
          <div key={c.id}
            className="bg-gray-800 p-5 rounded-2xl shadow">

            <p className="font-semibold mb-2">
              {c.complaint_text}
            </p>

            {/* USER ID */}
            <p className="text-xs text-gray-400 mb-1">
              👤 {c.username || "Unknown"} (ID: {c.user_id ?? "N/A"})
            </p>

            <p className="text-gray-400 mb-2">
              🏢 {c.predicted_department}
            </p>

            <div className="flex justify-between items-center mt-3">

              <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase ${priorityStyle(c.priority)}`}>
                {c.priority}
              </span>

              <button
                onClick={()=>takeComplaint(c.id)}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500"
              >
                Accept
              </button>

            </div>

          </div>
        ))}
      </div>

    </Layout>
  );
}