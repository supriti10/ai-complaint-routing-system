import React, { useEffect, useState } from "react";
import API from "../api";
import Layout from "../components/Layout";
import toast from "react-hot-toast";

export default function AdminDashboard() {

  const [complaints, setComplaints] = useState([]);
  const [officers, setOfficers] = useState([]);

  useEffect(() => {
    fetchData();
    fetchOfficers();
  }, []);

  const fetchData = async () => {
    const res = await API.get("/admin/complaints");
    setComplaints(res.data);
  };

  const fetchOfficers = async () => {
    const res = await API.get("/admin/officers");
    setOfficers(res.data);
  };

  // 🔥 SAFE STATUS NORMALIZATION
  const normalize = (status) => status?.toLowerCase().trim();

  const assigned = complaints.filter(c => c.assigned_to);
  const unassigned = complaints.filter(c => !c.assigned_to);

  // 🔥 FIXED RESOLVED COUNT
  const resolved = complaints.filter(
    c => normalize(c.status) === "resolved"
  );

  const assign = async (id, officerId) => {
    if (!officerId) return;

    try {
      await API.put(`/admin/assign?complaint_id=${id}&officer_id=${officerId}`);
      toast.success("Assigned 🚀");
      fetchData();
    } catch {
      toast.error("Assign failed");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/admin/complaints/${id}?status=${status}`);
      toast.success("Updated");
      fetchData();
    } catch {
      toast.error("Update failed");
    }
  };

  const getOfficerName = (id) => {
    const officer = officers.find(o => o.id === id);
    return officer ? officer.username : "Unknown";
  };

  const priorityStyle = (p) => {
    p = p?.toLowerCase();

    if (p === "high")
      return "bg-gradient-to-r from-red-500 via-pink-500 to-rose-500";

    if (p === "medium")
      return "bg-gradient-to-r from-yellow-400 via-orange-400 to-amber-500 text-black";

    return "bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500";
  };

  return (
    <Layout>

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">
          👑 Admin Control Center
        </h1>
        <p className="text-gray-400">
          Manage, assign, and monitor complaints 🚀
        </p>
      </div>

      {/* 🔥 STATS (FIXED + RESOLVED ADDED) */}
      <div className="grid grid-cols-4 gap-4 mb-6">

        <div className="bg-gray-800 p-4 rounded-xl text-center">
          <p>Total</p>
          <h2 className="text-2xl font-bold">{complaints.length}</h2>
        </div>

        <div className="bg-gray-800 p-4 rounded-xl text-center">
          <p>Assigned</p>
          <h2 className="text-2xl font-bold">{assigned.length}</h2>
        </div>

        <div className="bg-gray-800 p-4 rounded-xl text-center">
          <p>Unassigned</p>
          <h2 className="text-2xl font-bold">{unassigned.length}</h2>
        </div>

        <div className="bg-green-600 p-4 rounded-xl text-center">
          <p>Resolved</p>
          <h2 className="text-2xl font-bold">{resolved.length}</h2>
        </div>

      </div>

      {/* UNASSIGNED */}
      <h2 className="text-xl font-bold mb-3 text-white">
        📥 Unassigned Complaints
      </h2>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {unassigned.map(c => (
          <div key={c.id}
            className="bg-gray-800/60 backdrop-blur-xl border border-white/10 
                       p-5 rounded-2xl shadow-lg hover:scale-[1.02] transition">

            <p className="font-semibold text-lg mb-2">{c.complaint_text}</p>

            <p className="text-gray-400 mb-3">
              🏢 {c.predicted_department}
            </p>

            <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase ${priorityStyle(c.priority)}`}>
              {c.priority}
            </span>

            <select
              onChange={(e)=>assign(c.id, e.target.value)}
              className="mt-4 w-full p-2 rounded-lg bg-gray-900 border border-gray-700 text-white"
            >
              <option value="">Assign officer</option>
              {officers.map(o => (
                <option key={o.id} value={o.id}>
                  {o.username}
                </option>
              ))}
            </select>

          </div>
        ))}
      </div>

      {/* ASSIGNED */}
      <h2 className="text-xl font-bold mb-3 text-white">
        📌 Assigned Complaints
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        {assigned.map(c => (
          <div key={c.id}
            className="bg-gray-800/60 backdrop-blur-xl border border-white/10 
                       p-5 rounded-2xl shadow-lg hover:scale-[1.02] transition">

            <p className="font-semibold text-lg mb-2">{c.complaint_text}</p>

            <p className="text-gray-400 mb-2">
              🏢 {c.predicted_department}
            </p>

            <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase ${priorityStyle(c.priority)}`}>
              {c.priority}
            </span>

            <p className="mt-2 text-sm text-indigo-400">
              👤 {getOfficerName(c.assigned_to)}
            </p>

            {/* STATUS CONTROL */}
            <div className="mt-3 flex gap-2">
              <button
                onClick={()=>updateStatus(c.id,"In Progress")}
                className="px-3 py-1 bg-blue-600 rounded"
              >
                Start
              </button>

              <button
                onClick={()=>updateStatus(c.id,"Resolved")}
                className="px-3 py-1 bg-green-600 rounded"
              >
                Resolve
              </button>
            </div>

          </div>
        ))}
      </div>

    </Layout>
  );
}