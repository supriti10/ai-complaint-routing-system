import { useEffect, useState, useRef } from "react";
import API from "../api";
import Layout from "../components/Layout";
import ComplaintCard from "../components/ComplaintCard";
import toast from "react-hot-toast";

export default function UserDashboard() {
  const [text, setText] = useState("");
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔥 NEW STATES
  const [similarComplaintId, setSimilarComplaintId] = useState(null);
  const [similarList, setSimilarList] = useState([]);
  const [showSimilar, setShowSimilar] = useState(false);

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

  // =====================
  // 🚀 SUBMIT
  // =====================
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

      // 🔥 SET SIMILAR ID (NOT OBJECT)
      if (data.similar && data.existing_id) {
        setSimilarComplaintId(data.existing_id);
      } else {
        setSimilarComplaintId(null);
      }

      toast.success("Complaint submitted");

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

  // =====================
  // 🔥 FETCH USER DATA
  // =====================
  const fetchData = async () => {
    const res = await API.get("/complaints/my");
    setComplaints(res.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // =====================
  // 🔥 FETCH SIMILAR
  // =====================
  const fetchSimilar = async (id) => {
    try {
      const res = await API.get(`/complaints/similar/${id}`);
      setSimilarList(res.data || []);
      setShowSimilar(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load similar complaints");
    }
  };

  return (
    <Layout>

      {/* HERO */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 rounded-3xl mb-8">
        <h1 className="text-3xl font-bold">Welcome !!</h1>
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
          {loading ? "Submitting..." : "Submit Complaint"}
        </button>
      </div>

      {/* 🔥 SIMILAR ALERT PANEL */}
      {similarComplaintId && !showSimilar && (
        <div className="bg-yellow-100 text-black p-4 rounded-xl mb-6">
          <h3 className="font-bold">⚠️ Similar Complaint Found</h3>

          <div className="flex gap-3 mt-2">
            <button
              onClick={() => fetchSimilar(similarComplaintId)}
              className="px-3 py-1 bg-blue-500 text-white rounded"
            >
              View
            </button>

            <button
              onClick={() => setSimilarComplaintId(null)}
              className="underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* 🔥 SIMILAR LIST */}
      {showSimilar && (
        <div className="bg-gray-800 p-6 rounded-xl mb-6">

          <div className="flex justify-between mb-4">
            <h3 className="font-bold text-white text-lg">
              Similar Complaints
            </h3>

            <button
              onClick={() => setShowSimilar(false)}
              className="text-red-400"
            >
              Close
            </button>
          </div>

          {similarList.length === 0 && (
            <p className="text-gray-400">No similar complaints found</p>
          )}

          <div className="space-y-3">
            {similarList.map((c) => (
              <div key={c.id} className="bg-gray-700 p-4 rounded-lg">

                {/* 🔒 PRIVACY SAFE */}
                <p className="text-white mb-1">
                  {c.complaint_text}
                </p>

                <p className="text-sm text-gray-400">
                  Submitted on{" "}
                  {new Date(c.created_at).toLocaleDateString("en-GB")} at{" "}
                  {new Date(c.created_at).toLocaleTimeString("en-GB")}
                </p>

                <p className="text-xs text-indigo-300">
                  Similarity: {c.similarity}
                </p>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🔍 RESPONSIVE SEARCH */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">

        {/* LEFT: TITLE */}
        <h2 className="text-xl font-bold flex items-center gap-2">
          ~ My Complaints
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
            (c.complaint_text || "").toLowerCase().includes(search.toLowerCase())
          )
          .map(c => (
            <div key={c.id}>
              <ComplaintCard c={c} />
            </div>
        ))}
      </div>

    </Layout>
  );
}