export default function ComplaintCard({ c, onUpdate }) {
    return (
      <div className="bg-white backdrop-blur-lg p-4 rounded-2xl shadow hover:shadow-lg transition">
  
        <p className="font-semibold text-gray-800">{c.complaint_text}</p>
  
        <div className="flex gap-2 mt-2 text-sm">
  
          <span className="bg-blue-100 px-2 py-1 rounded">
            {c.predicted_department}
          </span>
  
          <span className="bg-yellow-100 px-2 py-1 rounded">
            {c.priority}
          </span>
  
          <span className={`px-2 py-1 rounded text-white ${
            c.status === "Pending" ? "bg-yellow-500" :
            c.status === "In Progress" ? "bg-blue-500" :
            "bg-green-500"
          }`}>
            {c.status}
          </span>
  
        </div>
  
        {onUpdate && (
          <div className="mt-3 flex gap-2">
            <button onClick={()=>onUpdate(c.id,"In Progress")}
              className="bg-blue-500 text-white px-3 py-1 rounded">
              Start
            </button>
            <button onClick={()=>onUpdate(c.id,"Resolved")}
              className="bg-green-500 text-white px-3 py-1 rounded">
              Resolve
            </button>
          </div>
        )}
      </div>
    );
  }