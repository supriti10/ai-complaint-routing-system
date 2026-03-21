import { useEffect, useState } from "react";
import API from "../api";
import Layout from "../components/Layout";

export default function OfficerDashboard() {
  const [complaints, setComplaints] = useState([]);

  const fetchData = async () => {
    const res = await API.get("/officer/complaints");
    setComplaints(res.data);
  };

  const update = async (id, status) => {
    await API.put(`/officer/complaints/${id}?status=${status}`);
    fetchData();
  };

  useEffect(()=>{fetchData()},[]);

  return (
    <Layout>

      {complaints.map(c => (
        <div key={c.id} className="bg-white p-4 mb-3 rounded shadow">

          <p>{c.complaint_text}</p>

          <span className={`px-2 py-1 rounded text-white ${
            c.priority === "High" ? "bg-red-500" :
            c.priority === "Medium" ? "bg-yellow-500" :
            "bg-green-500"
          }`}>
            {c.priority}
          </span>

          <div className="mt-2">
            <button onClick={()=>update(c.id,"In Progress")}
              className="bg-blue-500 text-white px-3 py-1 mr-2 rounded">
              Start
            </button>

            <button onClick={()=>update(c.id,"Resolved")}
              className="bg-green-500 text-white px-3 py-1 rounded">
              Resolve
            </button>
          </div>

        </div>
      ))}

    </Layout>
  );
}