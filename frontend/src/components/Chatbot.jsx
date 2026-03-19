import { useState } from "react";
import API from "../api";
import toast from "react-hot-toast";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi 👋 What’s your issue?" }
  ]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState(0);
  const [data, setData] = useState({});

  const send = async () => {
    if (!input) return;

    let newMsgs = [...messages, { from: "user", text: input }];

    if (step === 0) {
      setData({ ...data, issue: input });
      newMsgs.push({ from: "bot", text: "Since when?" });
      setStep(1);

    } else if (step === 1) {
      setData({ ...data, duration: input });
      newMsgs.push({ from: "bot", text: "Location?" });
      setStep(2);

    } else {
      const final = { ...data, location: input };

      try {
        const res = await API.post("/complaints/submit", {
          complaint_text: JSON.stringify(final)
        });

        newMsgs.push({
          from: "bot",
          text: `✅ Submitted (${res.data.department}, ${res.data.priority})`
        });

        toast.success("Complaint submitted!");

      } catch {
        toast.error("Error");
      }

      setStep(0);
    }

    setMessages(newMsgs);
    setInput("");
  };

  return (
    <>
      {/* Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-5 right-5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 rounded-full shadow-xl"
      >
        💬
      </button>

      {/* Chat */}
      {open && (
        <div className="fixed bottom-20 right-5 w-80 bg-white rounded-xl shadow-xl flex flex-col overflow-hidden">

          <div className="bg-blue-600 text-white p-3 flex justify-between">
            AI Assistant
            <button onClick={() => setOpen(false)}>✖</button>
          </div>

          <div className="h-64 overflow-y-auto p-3 space-y-2">
            {messages.map((m,i)=>(
              <div key={i}
                className={`p-2 rounded-lg max-w-[75%] ${
                  m.from==="bot"
                    ? "bg-gray-200"
                    : "bg-blue-500 text-white ml-auto"
                }`}>
                {m.text}
              </div>
            ))}
          </div>

          <div className="flex border-t">
            <input
              className="flex-1 p-2 outline-none"
              value={input}
              onChange={(e)=>setInput(e.target.value)}
            />
            <button onClick={send} className="bg-blue-600 text-white px-3">
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}