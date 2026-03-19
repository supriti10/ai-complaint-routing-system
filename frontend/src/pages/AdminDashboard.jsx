import { useEffect, useState } from "react";
import API from "../api";
import Layout from "../components/Layout";
import ComplaintCard from "../components/ComplaintCard";
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis } from "recharts";

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);

  const fetchData = async () => {
    const c = await API.get("/admin/complaints");
    const s = await API.get("/admin/stats/all");

    setComplaints(c.data);
    setStats(s.data);
  };

  const updateStatus = async (id, status) => {
    await API.put(`/admin/complaints/${id}?status=${status}`);
    fetchData();
  };

  useEffect(()=>{fetchData()},[]);

  return (
    <Layout>

      {/* 📊 Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

          <div className="bg-white p-4 rounded-xl shadow">
            <p>Total</p>
            <h2 className="text-xl font-bold">{stats.total}</h2>
          </div>

          {stats.status.map((s,i)=>(
            <div key={i} className="bg-white p-4 rounded-xl shadow">
              <p>{s.name}</p>
              <h2 className="text-xl font-bold">{s.count}</h2>
            </div>
          ))}

        </div>
      )}

      {/* 📈 Charts */}
      {stats && (
        <div className="grid md:grid-cols-2 gap-6 mb-6">

          <div className="bg-white p-4 rounded-xl shadow">
            <PieChart width={300} height={300}>
              <Pie data={stats.status} dataKey="count" nameKey="name" />
            </PieChart>
          </div>

          <div className="bg-white p-4 rounded-xl shadow">
            <BarChart width={300} height={300} data={stats.department}>
              <XAxis dataKey="name" />
              <YAxis />
              <Bar dataKey="count" />
            </BarChart>
          </div>

        </div>
      )}

      {/* Complaints */}
      {complaints.map(c => (
        <ComplaintCard key={c.id} c={c} onUpdate={updateStatus} />
      ))}

    </Layout>
  );
}