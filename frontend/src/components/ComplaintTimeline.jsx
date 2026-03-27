export default function ComplaintTimeline({ status }) {

    const steps = ["Pending", "Assigned", "In Progress", "Resolved"];
  
    const getIndex = () => {
      if (status === "Pending") return 0;
      if (status === "In Progress") return 2;
      if (status === "Resolved") return 3;
      return 0;
    };
  
    const current = getIndex();
  
    return (
      <div className="flex items-center justify-between mt-5">
  
        {steps.map((step, i) => (
          <div key={i} className="flex-1 flex flex-col items-center relative">
  
            {/* LINE */}
            {i !== steps.length - 1 && (
              <div className={`absolute top-3 left-1/2 w-full h-[3px] rounded-full ${
                i < current
                  ? "bg-gradient-to-r from-green-400 to-emerald-500"
                  : "bg-gray-300"
              }`} />
            )}
  
            {/* CIRCLE */}
            <div className={`z-10 w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold shadow-md transition
              ${
                i < current
                  ? "bg-green-500 text-white shadow-green-300"
                  : i === current
                  ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white scale-110 shadow-lg"
                  : "bg-gray-300 text-gray-600"
              }
            `}>
              {i < current
                ? "✓"
                : i === current
                ? "✓"
                : i + 1}
            </div>
  
            {/* LABEL */}
            <p className={`mt-2 text-xs text-center transition ${
              i === current
                ? "text-indigo-600 font-semibold"
                : i < current
                ? "text-green-600"
                : "text-gray-500"
            }`}>
              {step}
            </p>
  
          </div>
        ))}
  
      </div>
    );
  }