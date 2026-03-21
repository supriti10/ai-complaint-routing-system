import { useEffect, useState } from "react";
import API from "../api";
import Layout from "../components/Layout";
import ComplaintCard from "../components/ComplaintCard";
import Chatbot from "../components/Chatbot";
import toast from "react-hot-toast";

export default function UserDashboard() {
  const [text, setText] = useState("");
  const [complaints, setComplaints] = useState([]);
  const [ai, setAi] = useState(null);

  const submit = async () => {
    try {
      if (!text) return toast.error("Enter complaint");
  
      const res = await API.post("/complaints/submit", {
        complaint_text: text
      });
  
      setAi(res.data);
      setText("");
  
      await fetchData(); // 🔥 ensure refresh happens
  
      toast.success("Complaint submitted!");
  
    } catch (err) {
      console.error("Submit error:", err);
      toast.error("Submission failed");
    }
  };

  const fetchData = async () => {
    const res = await API.get("/complaints/my");
    setComplaints(res.data);
  };

  useEffect(()=>{fetchData()},[]);

  return (
    <Layout>

      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-2xl mb-6">
        <h1 className="text-2xl font-bold">Welcome 👋</h1>
        <p>Submit and track your complaints easily</p>
      </div>

      {/* Submit */}
      <div className="bg-white p-5 rounded-2xl shadow mb-6">
        <textarea
          value={text}
          onChange={(e)=>setText(e.target.value)}
          className="w-full border p-3 rounded"
          placeholder="Describe your issue..."
        />

        <button onClick={submit}
          className="bg-blue-600 text-white px-4 py-2 mt-3 rounded">
          Submit
        </button>

        {ai && (
          <div className="mt-3 text-sm">
            <p>🏢 {ai.department}</p>
            <p>⚡ {ai.priority}</p>
          </div>
        )}
      </div>

      {/* Complaints */}
      <div className="grid md:grid-cols-2 gap-4">
        {complaints.map(c => (
          <ComplaintCard key={c.id} c={c} />
        ))}
      </div>

      <Chatbot />

    </Layout>
  );
}