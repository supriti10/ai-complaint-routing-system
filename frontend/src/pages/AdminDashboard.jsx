import { useEffect, useState } from "react";
import API from "../api";
import Layout from "../components/Layout";
import toast from "react-hot-toast";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetchData();
    fetchOfficers();
  }, []);

  // 🔥 FETCH COMPLAINTS
  const fetchData = async () => {
    try {
      const res = await API.get("/admin/complaints");
      setComplaints(res.data || []);
    } catch (err) {
      console.error("Fetch complaints error", err);
      toast.error("Failed to load complaints");
    }
  };

  // 🔥 FETCH OFFICERS
  const fetchOfficers = async () => {
    try {
      const res = await API.get("/admin/officers");
      setOfficers(res.data || []);
    } catch (err) {
      console.error("Fetch officers error", err);
    }
  };

  const normalize = (s) => (s || "").toLowerCase().trim();

  // 🔥 ASSIGN
  const assign = async (id, officerId) => {
    if (!officerId) return;

    try {
      await API.put(
        `/admin/assign?complaint_id=${id}&officer_id=${officerId}`
      );

      await fetchData();
      toast.success("Assigned");
    } catch (err) {
      console.error(err);
      toast.error("Assign failed");
    }
  };

  const getOfficerName = (id) => {
    const officer = officers.find((o) => o.id === id);
    return officer ? officer.username : "Unknown";
  };

  // 🔥 PRIORITY STYLE
  const priorityStyle = (p) => {
    p = normalize(p);

    if (p === "high")
      return "bg-gradient-to-r from-red-500 via-pink-500 to-rose-500";

    if (p === "medium")
      return "bg-gradient-to-r from-yellow-400 via-orange-400 to-amber-500 text-black";

    return "bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500";
  };

  // 🔥 ANALYTICS
  const total = complaints.length;

  const assignedCount = complaints.filter((c) => c.assigned_to).length;

  const resolvedCount = complaints.filter(
    (c) => normalize(c.status) === "resolved"
  ).length;

  const pendingCount = complaints.filter(
    (c) => normalize(c.status) === "pending"
  ).length;

  // 🔥 FIXED CHART DATA
  const chartData = [
    { name: "Pending", value: pendingCount },
    { name: "Resolved", value: resolvedCount },
    { name: "Assigned", value: assignedCount },
  ];

  // 🔥 SEARCH + FILTER
  const filteredComplaints = complaints
    .filter((c) =>
      (c.complaint_text || "")
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .filter((c) =>
      filter ? normalize(c.status) === normalize(filter) : true
    );

  // 🔥 WORKLOAD
  const workload = officers.map((o) => ({
    id: o.id,
    name: o.username,
    count: complaints.filter((c) => c.assigned_to === o.id).length,
  }));

  // 🔥 AUTO ASSIGN (SAFE)
  const autoAssign = async (complaintId) => {
    if (!workload.length) return;

    const leastLoaded = workload.reduce((min, curr) =>
      curr.count < min.count ? curr : min
    );

    if (!leastLoaded) return;

    await assign(complaintId, leastLoaded.id);
  };

  return (
    <Layout>
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">
          Admin Control Center
        </h1>
        <p className="text-gray-400">
          Monitor complaints, analyze trends, and assign intelligently.
        </p>
      </div>

      {/* KPI */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded-xl text-center">
          <p>Total</p>
          <h2 className="text-2xl">{total}</h2>
        </div>

        <div className="bg-blue-600 p-4 rounded-xl text-center">
          <p>Assigned</p>
          <h2>{assignedCount}</h2>
        </div>

        <div className="bg-yellow-500 p-4 rounded-xl text-center">
          <p>Pending</p>
          <h2>{pendingCount}</h2>
        </div>

        <div className="bg-green-600 p-4 rounded-xl text-center">
          <p>Resolved</p>
          <h2>{resolvedCount}</h2>
        </div>
      </div>

      {/* CHART */}
      <div className="bg-gray-800 p-6 rounded-xl mb-6">
        <h2 className="text-lg font-bold mb-4">
          Complaint Analytics
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />

            <XAxis
              dataKey="name"
              stroke="#9CA3AF"
              tick={{ fill: "#D1D5DB" }}
            />

            <YAxis stroke="#9CA3AF" />

            <Tooltip
              contentStyle={{
                backgroundColor: "#111827",
                borderRadius: "10px",
                color: "#fff",
              }}
            />

            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#A855F7" />
              </linearGradient>
            </defs>

            <Bar
              dataKey="value"
              fill="url(#grad)"
              radius={[10, 10, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* SEARCH + FILTER */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <input
          placeholder="Search complaints..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="md:col-span-2 px-4 py-3 rounded-xl bg-gray-200 text-black"
        />

        <select
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-3 rounded-xl bg-gray-200 text-black"
        >
          <option value="">All</option>
          <option>Pending</option>
          <option>Resolved</option>
        </select>
      </div>

      {/* WORKLOAD */}
      <div className="bg-gray-800 p-4 rounded-xl mb-6">
        <h2 className="font-bold mb-3">Officer Workload</h2>

        {workload.map((w) => (
          <p key={w.id} className="text-gray-300">
            {w.name} → {w.count}
          </p>
        ))}
      </div>

      {/* LIST */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredComplaints.map((c) => (
          <div key={c.id} className="bg-gray-800 p-5 rounded-xl">
            <p className="font-semibold mb-2">
              {c.complaint_text}
            </p>

            <span
              className={`px-3 py-1 text-xs rounded-full ${priorityStyle(
                c.priority
              )}`}
            >
              {c.priority}
            </span>

            <p className="mt-2 text-indigo-400">
              Status: {c.status}
            </p>

            <div className="mt-4">
              {c.assigned_to ? (
                <>
                  <p className="text-green-400 mb-2">
                    👤 {getOfficerName(c.assigned_to)}
                  </p>

                  <select
                    onChange={(e) =>
                      assign(c.id, Number(e.target.value))
                    }
                    className="w-full p-2 bg-gray-900 text-white rounded"
                  >
                    <option value="">Reassign</option>
                    {officers
                      .filter((o) => o.id !== c.assigned_to)
                      .map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.username}
                        </option>
                      ))}
                  </select>
                </>
              ) : (
                <>
                  <select
                    onChange={(e) =>
                      assign(c.id, Number(e.target.value))
                    }
                    className="w-full p-2 bg-gray-900 text-white rounded mb-2"
                  >
                    <option value="">Assign officer</option>
                    {officers.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.username}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => autoAssign(c.id)}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500"
                  >
                    Auto Assign
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}