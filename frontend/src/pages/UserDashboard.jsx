import { useEffect, useState } from "react";
import API from "../api";
import Layout from "../components/Layout";
import ComplaintCard from "../components/ComplaintCard";
import Chatbot from "../components/Chatbot";
import toast from "react-hot-toast";

export default function UserDashboard() {
  const [text, setText] = useState("");
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ SUBMIT (CLEAN + RELIABLE)
  const submit = async () => {
    try {
      if (!text) return toast.error("Enter complaint");
  
      setLoading(true);
  
      const res = await API.post("/complaints/submit", {
        complaint_text: text
      });
  
      // 🔥 HANDLE DUPLICATE / WARNING (NO setMessages here)
      if (res.data.duplicate) {
        toast.error(
          `⚠️ Similar complaint (${(res.data.similarity_score * 100).toFixed(1)}%)`
        );
      }
  
      if (res.data.warning) {
        toast(
          `⚠️ Similar complaint exists (${(res.data.similarity_score * 100).toFixed(1)}%)`
        );
      }
  
      setText("");
  
      await fetchData();
  
      toast.success("Complaint submitted 🚀");
  
    } catch (err) {
      console.error("Submit error:", err);
      toast.error("Submission failed");
    } finally {
      setLoading(false);
    }
  };

  // ✅ FETCH
  const fetchData = async () => {
    try {
      const res = await API.get("/complaints/my");
      setComplaints(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Layout>

      {/* 🔥 HERO */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 text-white p-8 rounded-3xl mb-8 shadow-xl">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-xl"></div>

        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Welcome 👋</h1>
          <p className="text-white/90 text-lg">
            Submit and track your complaints easily!
          </p>
        </div>
      </div>

      {/* 🔥 SUBMIT BOX */}
      <div className="bg-white/70 backdrop-blur-lg border border-gray-200 p-6 rounded-3xl shadow-lg mb-8">

        <textarea
          value={text}
          onChange={(e)=>setText(e.target.value)}
          className="w-full p-4 rounded-xl outline-none
          bg-white text-black
          border border-gray-300
          placeholder-gray-500"
          placeholder="Describe your issue in detail..."
        />

        <button 
          onClick={submit}
          disabled={loading}
          className={`mt-4 px-6 py-2 rounded-xl text-white font-medium shadow-md transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:scale-105"
          }`}
        >
          {loading ? "Submitting..." : "Submit Complaint 🚀"}
        </button>

      </div>

      {/* 🔥 HEADER */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-purple/50">
          📋 My Complaints
        </h2>
        <span className="text-sm text-gray-500">
          {complaints.length} total
        </span>
      </div>

      {/* 🔥 LIST */}
      <div className="grid md:grid-cols-2 gap-6">
        {complaints.length === 0 && (
          <p className="text-gray-500">No complaints yet</p>
        )}

        {complaints.map(c => (
          <div key={c.id} className="hover:scale-[1.02] transition">
            <ComplaintCard c={c} />
          </div>
        ))}
      </div>

      {/* 🤖 CHATBOT */}
      <Chatbot />

    </Layout>
  );
}