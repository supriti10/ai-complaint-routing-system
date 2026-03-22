import React, { useEffect, useState } from "react";
import API from "../api";
import Layout from "../components/Layout";
import toast from "react-hot-toast";
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip
} from "recharts";

export default function AdminDashboard() {

  const [complaints, setComplaints] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  // 🔥 FETCH DATA
  const fetchData = async () => {
    try {
      const res = await API.get("/admin/complaints");
      setComplaints(res.data);
      setFiltered(res.data);
    } catch {
      toast.error("Failed to load complaints");
    }
  };

  const fetchOfficers = async () => {
    try {
      const res = await API.get("/admin/officers");
      setOfficers(res.data);
    } catch {
      console.error("Failed to load officers");
      setOfficers([]);
    }
  };

  useEffect(() => {
    fetchData();
    fetchOfficers();
  }, []);

  // 🔍 FILTER
  useEffect(() => {
    let data = complaints;

    if (search) {
      data = data.filter(c =>
        c.complaint_text.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status === "Unassigned") {
      data = data.filter(c => !c.assigned_to);
    } else if (status) {
      data = data.filter(c => c.status === status);
    }

    setFiltered(data);
  }, [search, status, complaints]);

  // 📊 STATS
  const stats = [
    { name: "Pending", value: complaints.filter(c => c.status === "Pending").length },
    { name: "In Progress", value: complaints.filter(c => c.status === "In Progress").length },
    { name: "Resolved", value: complaints.filter(c => c.status === "Resolved").length },
  ];

  const COLORS = ["#facc15", "#3b82f6", "#22c55e"];

  // 🔥 ASSIGN
  const assign = async (complaintId, officerId) => {
    if (!officerId) return;

    try {
      await API.put(`/admin/assign?complaint_id=${complaintId}&officer_id=${officerId}`);
      toast.success("Assigned 🚀");
      fetchData();
    } catch {
      toast.error("Assign failed");
    }
  };

  return (
    <Layout>

      {/* 🔥 HEADER */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">👑 Admin Control Center</h1>
        <p className="text-gray-500">Manage complaints smartly</p>
      </div>

      {/* 🔍 FILTERS */}
      <div className="flex gap-3 mb-6">
        <input
          placeholder="Search complaints..."
          className="border p-2 rounded-lg shadow w-64"
          onChange={(e)=>setSearch(e.target.value)}
        />

        <select
          onChange={(e)=>setStatus(e.target.value)}
          className="border p-2 rounded-lg shadow"
        >
          <option value="">All</option>
          <option>Pending</option>
          <option>In Progress</option>
          <option>Resolved</option>
          <option>Unassigned</option> {/* 🔥 NEW */}
        </select>
      </div>

      {/* 📊 CHARTS */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">

        <div className="bg-white p-5 rounded-2xl shadow">
          <PieChart width={350} height={300}>
            <Pie data={stats} dataKey="value" nameKey="name" outerRadius={100} label>
              {stats.map((entry, index) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}
            </Pie>
          </PieChart>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow">
          <BarChart width={350} height={300} data={stats}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" />
          </BarChart>
        </div>

      </div>

      {/* 🧾 CARDS */}
      <div className="grid md:grid-cols-2 gap-6">

        {filtered.length === 0 && (
          <p className="text-gray-500">No complaints found</p>
        )}

        {filtered.map(c => (
          <div key={c.id}
            className="bg-white p-5 rounded-2xl shadow hover:shadow-xl transition border-l-4 border-indigo-500">

            <h3 className="font-semibold text-lg mb-2">{c.complaint_text}</h3>

            <p className="text-sm text-gray-500 mb-2">
              🏢 {c.predicted_department}
            </p>

            {/* PRIORITY */}
            <span className={`px-3 py-1 rounded-full text-white text-xs font-semibold ${
              c.priority?.toLowerCase() === "high"
              ? "bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 text-white"
              : c.priority?.toLowerCase() === "medium"
              ? "bg-gradient-to-r from-yellow-400 via-orange-400 to-amber-500 text-black"
              : "bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 text-white"
            }`}>
              {c.priority}
            </span>

            {/* STATUS */}
            <div className="mt-2 text-sm">
              Status:
              <span className={`ml-2 font-semibold ${
                c.status === "Pending"
                  ? "text-yellow-500"
                  : c.status === "In Progress"
                  ? "text-blue-500"
                  : "text-green-600"
              }`}>
                {c.status}
              </span>
            </div>

            {/* 👮 ASSIGNED */}
            <div className="mt-2 text-sm text-gray-600">
              Assigned:
              <span className="ml-2 font-semibold">
                {c.assigned_officer || "Not Assigned"}
              </span>
            </div>

            {/* DROPDOWN */}
            <div className="mt-3">
              <select
                onChange={(e)=>assign(c.id, e.target.value)}
                className="border p-2 rounded-lg w-full"
                defaultValue=""
              >
                <option value="">Assign to officer</option>

                {(officers || []).map(o => (
                  <option key={o.id} value={o.id}>
                    {o.username}
                  </option>
                ))}
              </select>
            </div>

          </div>
        ))}

      </div>

    </Layout>
  );
}