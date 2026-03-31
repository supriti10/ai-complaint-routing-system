import { useEffect, useState, useRef } from "react";
import API from "../api";
import Layout from "../components/Layout";
import ComplaintCard from "../components/ComplaintCard";
import toast from "react-hot-toast";

export default function UserDashboard() {
  const [text, setText] = useState("");
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [similarComplaint, setSimilarComplaint] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const complaintRefs = useRef({});

  const filterOptions = [
    { label: "All", value: "all" },
    { label: "Pending", value: "Pending" },
    { label: "Assigned", value: "Assigned" },
    { label: "In Progress", value: "In Progress" },
    { label: "Resolved", value: "Resolved" }
  ];

  const submit = async () => {
    try {
      if (!text.trim()) return toast.error("Enter complaint");

      setLoading(true);

      const res = await API.post("/complaints/submit", {
        complaint_text: text.trim()
      });

      const data = res.data;

      if (data.blocked) {
        toast.error(data.message);
        return;
      }

      // 🔥 FIXED SIMILAR PANEL
      if (data.similar && data.existing_id) {
        setSimilarComplaint({
          id: data.existing_id,
          text: "A similar complaint already exists"
        });
      }

      toast.success("Complaint submitted 🚀");

      setText("");

      if (data.saved) {
        await fetchData();
      }

    } catch (err) {
      toast.error("Submission failed");
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    const res = await API.get("/complaints/my");
    setComplaints(res.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const scrollToComplaint = (id) => {
    const el = complaintRefs.current[id];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <Layout>

      {/* HERO */}
      <div 
        id="top-section"
        className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 rounded-3xl mb-8"
      >
        <h1 className="text-3xl font-bold">Welcome 👋</h1>
        <p>Submit and track your complaints easily!</p>
      </div>

      {/* SUBMIT */}
      <div className="bg-white/70 p-6 rounded-3xl mb-6">
        <textarea
          value={text}
          onChange={(e)=>setText(e.target.value)}
          className="w-full p-4 rounded-xl text-black border"
          placeholder="Describe your issue..."
        />

        <button 
          onClick={submit}
          disabled={loading}
          className="mt-4 px-6 py-2 rounded-xl text-white bg-gradient-to-r from-indigo-500 to-pink-500"
        >
          {loading ? "Submitting..." : "Submit Complaint 🚀"}
        </button>
      </div>

      {/* 🔥 SIMILAR PANEL */}
      {similarComplaint && (
        <div className="bg-yellow-100 text-black p-4 rounded-xl mb-6">
          <h3 className="font-bold">⚠️ Similar Complaint Found</h3>

          <div className="flex gap-3 mt-2">
            <button
              onClick={() => scrollToComplaint(similarComplaint.id)}
              className="px-3 py-1 bg-blue-500 text-white rounded"
            >
              View
            </button>

            <button
              onClick={() => setSimilarComplaint(null)}
              className="underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* 🔍 RESPONSIVE SEARCH */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">

        {/* LEFT: TITLE */}
        <h2 className="text-xl font-bold flex items-center gap-2">
          📋 My Complaints
        </h2>

        {/* RIGHT: SEARCH */}
        <div className="relative w-full md:w-80">

          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            🔍
          </span>

          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
            className="
              w-full
              pl-9 pr-3 py-2.5
              rounded-xl
              bg-white/80
              text-black
              border border-gray-300
              shadow-sm

              focus:outline-none
              focus:ring-2
              focus:ring-purple-500
            "
          />

        </div>

      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filterOptions.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1 rounded-full ${
              filter === f.value ? "bg-purple-500 text-white" : "bg-gray-200 text-black"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* LIST */}
      <div className="grid md:grid-cols-2 gap-6">
        {complaints
          .filter(c =>
            (filter === "all" || c.status === filter) &&
            c.complaint_text.toLowerCase().includes(search.toLowerCase())
          )
          .map(c => (
            <div
              key={c.id}
              ref={el => (complaintRefs.current[c.id] = el)}
            >
              <ComplaintCard c={c} />
            </div>
        ))}
      </div>

    </Layout>
  );
}