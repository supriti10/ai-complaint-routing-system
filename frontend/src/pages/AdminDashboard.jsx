import { useEffect, useState } from "react";
import API from "../api";
import Layout from "../components/Layout";
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip
} from "recharts";

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const fetchData = async () => {
    const res = await API.get("/admin/complaints");
    setComplaints(res.data);
    setFiltered(res.data);
  };

  useEffect(() => { fetchData(); }, []);

  // 🔍 FILTER LOGIC
  useEffect(() => {
    let data = complaints;

    if (search) {
      data = data.filter(c =>
        c.complaint_text.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status) {
      data = data.filter(c => c.status === status);
    }

    setFiltered(data);
  }, [search, status, complaints]);

  // 📊 Stats
  const stats = [
    { name: "Pending", value: complaints.filter(c => c.status === "Pending").length },
    { name: "Resolved", value: complaints.filter(c => c.status === "Resolved").length },
  ];

  return (
    <Layout>

      {/* 🔍 Filters */}
      <div className="flex gap-3 mb-4">
        <input
          placeholder="Search..."
          className="border p-2 rounded"
          onChange={(e)=>setSearch(e.target.value)}
        />

        <select onChange={(e)=>setStatus(e.target.value)}
          className="border p-2 rounded">
          <option value="">All</option>
          <option>Pending</option>
          <option>Resolved</option>
        </select>
      </div>

      {/* 📊 Charts */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">

        <div className="bg-white p-4 rounded shadow">
          <PieChart width={300} height={300}>
            <Pie data={stats} dataKey="value">
              <Cell fill="#facc15" />
              <Cell fill="#22c55e" />
            </Pie>
          </PieChart>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <BarChart width={300} height={300} data={stats}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" />
          </BarChart>
        </div>

      </div>

      {/* 📋 Complaints */}
      {filtered.map(c => (
        <div key={c.id} className="bg-white p-3 mb-2 rounded shadow">
          {c.complaint_text} - {c.status}
        </div>
      ))}

    </Layout>
  );
}