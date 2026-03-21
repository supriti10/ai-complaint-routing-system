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

  const chatRef = useRef(null);

  // 🔥 Auto scroll
  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth"
    });
  }, [messages, loading]);

  // 🔥 Typing animation
  const typeMessage = async (text) => {
    let current = "";

    for (let i = 0; i < text.length; i++) {
      current += text[i];

      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { from: "bot", text: current };
        return updated;
      });

      await new Promise(r => setTimeout(r, 10));
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

      if (!res || !res.data) throw new Error("No response");

      const { reply, final, complaint } = res.data;

      // Add empty bot msg
      setMessages(prev => [...prev, { from: "bot", text: "" }]);
      await typeMessage(reply || "Processing...");

      // ✅ Instead of alert → store pending complaint
      if (final && complaint) {
        setPendingComplaint(complaint);

        setMessages(prev => [
          ...prev,
          {
            from: "bot",
            text: `📋 Ready to submit:\n${complaint}`
          }
        ]);
      }

    } catch (err) {
      console.error(err);

      setMessages(prev => [
        ...prev,
        {
          from: "bot",
          text: "⚠️ Server issue. Submitting directly..."
        }
      ]);

      try {
        await API.post("/complaints/submit", {
          complaint_text: userMsg
        });

        toast.success("Complaint submitted!");
      } catch {
        toast.error("Failed to submit");
      }
    }

    setLoading(false);
  };

  // ✅ Submit handler (NO ALERT)
  const handleSubmitComplaint = async () => {
    try {
      await API.post("/complaints/submit", {
        complaint_text: pendingComplaint
      });

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
      {/* 💬 Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-5 right-5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 rounded-full shadow-xl hover:scale-110 transition"
      >
        💬
      </button>

      {/* 💬 Chat Window */}
      {open && (
        <div className="fixed bottom-20 right-5 w-80 bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-3 flex justify-between">
            AI Assistant 🤖
            <button onClick={() => setOpen(false)}>✖</button>
          </div>

          {/* Messages */}
          <div
            ref={chatRef}
            className="h-64 overflow-y-auto p-3 space-y-2"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg max-w-[75%] whitespace-pre-line ${
                  m.from === "bot"
                    ? "bg-gray-200"
                    : "bg-blue-500 text-white ml-auto"
                }`}
              >
                {m.text}
              </div>
            ))}

            {loading && (
              <div className="text-sm text-gray-400">🤖 Typing...</div>
            )}
          </div>

          {/* ✅ Inline submit UI */}
          {pendingComplaint && (
            <div className="p-3 border-t bg-gray-50">
              <button
                onClick={handleSubmitComplaint}
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
              >
                ✅ Confirm & Submit
              </button>
            </div>
          )}

          {/* Input */}
          <div className="flex border-t">
            <input
              className="flex-1 p-2 outline-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your issue..."
              onKeyDown={(e) => e.key === "Enter" && send()}
            />

            <button
              onClick={send}
              className="bg-blue-600 text-white px-4 hover:bg-blue-700"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}