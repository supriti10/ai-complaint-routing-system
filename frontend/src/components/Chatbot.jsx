import { useState, useRef, useEffect } from "react";
import API from "../api";
import toast from "react-hot-toast";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi 👋 Tell me your issue" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [pendingComplaint, setPendingComplaint] = useState(null);
  const [duplicateInfo, setDuplicateInfo] = useState(null);

  const chatRef = useRef(null);

  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth"
    });
  }, [messages, loading]);

  const typeMessage = async (text) => {
    let current = "";

    for (let i = 0; i < text.length; i++) {
      current += text[i];

      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { from: "bot", text: current };
        return updated;
      });

      await new Promise(r => setTimeout(r, 8));
    }
  };

  const send = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;

    setMessages(prev => [...prev, { from: "user", text: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      const res = await API.post("/chatbot/", {
        message: userMsg
      });

      const { reply, final, complaint } = res.data;

      setMessages(prev => [...prev, { from: "bot", text: "" }]);
      await typeMessage(reply || "Processing...");

      if (final && complaint) {
        setPendingComplaint(complaint);

        setMessages(prev => [
          ...prev,
          {
            from: "bot",
            text: `📋 Here's a refined complaint:\n${complaint}`
          }
        ]);
      }

    } catch {
      toast.error("Chatbot failed");
    }

    setLoading(false);
  };

  // 🔥 FINAL SUBMIT (WITH DUPLICATE CHECK)
  const handleSubmitComplaint = async () => {
    try {
      const res = await API.post("/complaints/submit", {
        complaint_text: pendingComplaint
      });

      // 🔥 DUPLICATE HANDLING
      if (res.data?.duplicate) {
        setDuplicateInfo(res.data);

        setMessages(prev => [
          ...prev,
          {
            from: "bot",
            text: `⚠️ Similar complaint already exists (ID: ${res.data.existing_id}).`
          }
        ]);

        return;
      }

      toast.success("Complaint submitted!");
      setPendingComplaint(null);

      setMessages(prev => [
        ...prev,
        { from: "bot", text: "✅ Complaint submitted successfully!" }
      ]);

    } catch {
      toast.error("Submission failed");
    }
  };

  return (
    <>
      {/* FLOAT BUTTON */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-5 right-5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-full shadow-xl hover:scale-110 transition"
      >
        🤖
      </button>

      {/* CHAT WINDOW */}
      {open && (
        <div className="fixed bottom-20 right-5 w-80 
                        bg-gray-900 text-white 
                        rounded-xl shadow-2xl flex flex-col overflow-hidden">

          {/* HEADER */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-3 flex justify-between">
            AI Assistant 🤖
            <button onClick={() => setOpen(false)}>✖</button>
          </div>

          {/* MESSAGES */}
          <div ref={chatRef} className="h-64 overflow-y-auto p-3 space-y-2">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg max-w-[75%] whitespace-pre-line ${
                  m.from === "bot"
                    ? "bg-gray-700"
                    : "bg-indigo-500 ml-auto"
                }`}
              >
                {m.text}
              </div>
            ))}

            {loading && (
              <div className="text-sm text-gray-400">🤖 Thinking...</div>
            )}
          </div>

          {/* CONFIRM SUBMIT */}
          {pendingComplaint && !duplicateInfo && (
            <div className="p-3 border-t border-gray-700">
              <button
                onClick={handleSubmitComplaint}
                className="w-full bg-green-600 py-2 rounded-lg hover:bg-green-700"
              >
                ✅ Confirm & Submit
              </button>
            </div>
          )}

          {/* 🔥 DUPLICATE INFO (UPGRADED WITH ACTION) */}
          {duplicateInfo && (
            <div className="p-3 border-t border-gray-700 bg-yellow-500/10 text-yellow-300 text-sm rounded-b-xl">

              <p className="font-semibold mb-1">
                ⚠️ Similar complaint detected
              </p>

              <p>
                Similarity: {(duplicateInfo.similarity_score * 100).toFixed(1)}%
              </p>

              {duplicateInfo.existing_id && (
                <>
                  <p>
                    Existing Complaint ID: #{duplicateInfo.existing_id}
                  </p>

                  {/* 🔥 ACTION BUTTON */}
                  <button
                    onClick={() => {
                      alert(`Redirect to complaint ${duplicateInfo.existing_id}`);
                    }}
                    className="mt-2 text-blue-400 underline"
                  >
                    View Similar Complaint
                  </button>
                </>
              )}

              <p className="text-xs mt-1 text-gray-400">
                Your complaint has still been submitted successfully.
              </p>

            </div>
          )}
                

          {/* INPUT */}
          <div className="flex border-t border-gray-700">
            <input
              className="flex-1 p-2 bg-gray-800 outline-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your issue..."
              onKeyDown={(e) => e.key === "Enter" && send()}
            />

            <button
              onClick={send}
              className="bg-indigo-600 px-4 hover:bg-indigo-700"
            >
              Send
            </button>
          </div>

        </div>
      )}
    </>
  );
}