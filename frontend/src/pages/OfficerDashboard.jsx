import { useEffect, useState } from "react";
import API from "../api";
import Layout from "../components/Layout";
import ComplaintCard from "../components/ComplaintCard";

export default function OfficerDashboard() {
  const [complaints, setComplaints] = useState([]);

  const fetchData = async () => {
    const res = await API.get("/officer/complaints");
    setComplaints(res.data);
  };

  const updateStatus = async (id, status) => {
    await API.put(`/officer/complaints/${id}?status=${status}`);
    fetchData();
  };

  useEffect(()=>{fetchData()},[]);

  return (
    <Layout>
      <div className="grid md:grid-cols-2 gap-4">
        {complaints.map(c => (
          <ComplaintCard key={c.id} c={c} onUpdate={updateStatus} />
        ))}
      </div>
    </Layout>
  );
}