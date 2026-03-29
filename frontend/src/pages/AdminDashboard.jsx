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

  const normalize = (s) => s?.toLowerCase().trim();

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

  // 🔥 Analytics
  const total = complaints.length;
  const assignedCount = complaints.filter(c => c.assigned_to).length;
  const unassignedCount = complaints.filter(c => !c.assigned_to).length;
  const resolvedCount = complaints.filter(
    c => normalize(c.status) === "resolved"
  ).length;

  return (
    <Layout>

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">
          👑 Admin Control Center
        </h1>
        <p className="text-gray-400">
          Assign, monitor, and manage complaints efficiently
        </p>
      </div>

      {/* 🔥 KPI */}
      <div className="grid grid-cols-4 gap-4 mb-6">

        <div className="bg-gray-800 p-4 rounded-xl text-center">
          <p>Total</p>
          <h2 className="text-2xl">{total}</h2>
        </div>

        <div className="bg-blue-600 p-4 rounded-xl text-center">
          <p>Assigned</p>
          <h2>{assignedCount}</h2>
        </div>

        <div className="bg-yellow-500 p-4 rounded-xl text-center">
          <p>Unassigned</p>
          <h2>{unassignedCount}</h2>
        </div>

        <div className="bg-green-600 p-4 rounded-xl text-center">
          <p>Resolved</p>
          <h2>{resolvedCount}</h2>
        </div>

      </div>

      {/* 🔥 COMPLAINT LIST */}
      <div className="grid md:grid-cols-2 gap-6">

        {complaints.map(c => (

          <div key={c.id}
            className="bg-gray-800/60 backdrop-blur-xl border border-white/10 
                       p-5 rounded-2xl shadow-lg hover:scale-[1.02] transition">

            {/* TEXT */}
            <p className="font-semibold text-lg mb-2">
              {c.complaint_text}
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
            <p className="mt-2 text-sm text-indigo-400">
              Status: {c.status}
            </p>

            {/* 🔥 ASSIGN / REASSIGN */}
            <div className="mt-4">

              {c.assigned_to ? (
                <>
                  {/* ✅ SHOW ASSIGNED */}
                  <p className="text-green-400 text-sm mb-2">
                    👤 Assigned to: {getOfficerName(c.assigned_to)}
                  </p>

                  {/* 🔁 REASSIGN */}
                  <select
                    onChange={(e)=>assign(c.id, e.target.value)}
                    className="w-full p-2 rounded-lg bg-gray-900 border border-gray-700 text-white"
                  >
                    <option value="">Reassign officer</option>
                    {officers.map(o => (
                      <option key={o.id} value={o.id}>
                        {o.username}
                      </option>
                    ))}
                  </select>
                </>
              ) : (
                <>
                  {/* 📥 ASSIGN */}
                  <select
                    onChange={(e)=>assign(c.id, e.target.value)}
                    className="w-full p-2 rounded-lg bg-gray-900 border border-gray-700 text-white"
                  >
                    <option value="">Assign officer</option>
                    {officers.map(o => (
                      <option key={o.id} value={o.id}>
                        {o.username}
                      </option>
                    ))}
                  </select>
                </>
              )}

            </div>

          </div>

        ))}

      </div>

    </Layout>
  );
}