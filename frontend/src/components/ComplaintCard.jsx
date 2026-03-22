export default function ComplaintCard({ c, onUpdate }) {
  return (
    <div className="relative bg-white/80 backdrop-blur-lg p-5 rounded-3xl shadow-lg hover:shadow-2xl hover:scale-[1.02] transition border border-gray-200">

      {/* 🔥 Complaint Text */}
      <p className="font-semibold text-gray-800 text-lg mb-3 leading-snug">
        {c.complaint_text}
      </p>

      {/* 🏢 Department */}
      <div className="flex flex-wrap gap-2 items-center">

        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
          🏢 {c.predicted_department}
        </span>

        {/* 🎯 PRIORITY (GRADIENT FIX) */}
        <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
          c.priority?.toLowerCase() === "high"
            ? "bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 text-white"
            : c.priority?.toLowerCase() === "medium"
            ? "bg-gradient-to-r from-yellow-400 via-orange-400 to-amber-500 text-black"
            : "bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 text-white"
        }`}>
          {c.priority?.toLowerCase() === "high" && "🔥 HIGH"}
          {c.priority?.toLowerCase() === "medium" && "⚡ MEDIUM"}
          {c.priority?.toLowerCase() === "low" && "✅ LOW"}
        </span>

        {/* 🔄 STATUS */}
        <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
          c.status?.toLowerCase() === "pending"
            ? "bg-gray-200/70 backdrop-blur-md text-black"
            : c.status?.toLowerCase() === "in progress"
            ? "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white"
            : "bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 text-white"
        }`}>
          {c.status === "Pending" && "⏳ Pending"}
          {c.status === "In Progress" && "🚀 In Progress"}
          {c.status === "Resolved" && "✅ Resolved"}
        </span>

      </div>

      {/* ⚙ ACTION BUTTONS */}
      {onUpdate && (
        <div className="mt-4 flex gap-3">

          <button
            onClick={()=>onUpdate(c.id,"In Progress")}
            className="px-4 py-1.5 rounded-xl text-white text-sm font-medium
                       bg-gradient-to-r from-blue-500 to-indigo-600
                       hover:scale-105 transition shadow"
          >
            Start 🚀
          </button>

          <button
            onClick={()=>onUpdate(c.id,"Resolved")}
            className="px-4 py-1.5 rounded-xl text-white text-sm font-medium
                       bg-gradient-to-r from-green-500 to-emerald-600
                       hover:scale-105 transition shadow"
          >
            Resolve ✅
          </button>

        </div>
      )}

    </div>
  );
}