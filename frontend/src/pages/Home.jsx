import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import emailjs from "@emailjs/browser";
import toast from "react-hot-toast";

export default function Home() {
  const navigate = useNavigate();
  const featuresRef = useRef();
  const contactRef = useRef();
  const formRef = useRef();

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToContact = () => {
    contactRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendEmail = async (e) => {
    e.preventDefault();

    try {
      await emailjs.sendForm(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        formRef.current,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      toast.success("Message sent successfully 🚀");
      formRef.current.reset();
    } catch (err) {
      toast.error("Failed to send message ❌");
    }
  };

  return (
    <div className="text-white relative min-h-screen flex flex-col">

      {/* 🌌 BACKGROUND FIXED */}
      <div className="fixed inset-0 -z-10">
        <img
          src="https://img.freepik.com/free-vector/abstract-colorful-technology-dotted-wave-background_1035-17450.jpg?semt=ais_hybrid&w=740&q=80"
          alt="bg"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/70"></div>
      </div>

      {/* 🔥 NAVBAR */}
      <div className="flex justify-between items-center px-6 md:px-12 py-5">
        <h1 className="text-2xl font-bold">Grievix AI</h1>

        <div className="flex gap-3">
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
          >
            Login
          </button>

          <button
            onClick={() => navigate("/signup")}
            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg"
          >
            Signup
          </button>
        </div>
      </div>

      {/* 🔥 HERO */}
      <div className="flex flex-col items-center justify-center text-center px-6 pt-16 pb-10">

        <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
          AI-Powered Complaint Routing System
        </h1>

        <p className="text-gray-300 max-w-2xl mb-6">
          Automatically classify, prioritize and assign complaints using AI.
        </p>

        <div className="flex gap-4">
          <button
            onClick={scrollToFeatures}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:scale-105 transition"
          >
            Get Started
          </button>

          <button
            onClick={scrollToContact}
            className="
                px-6 py-2 rounded-xl
                border border-white/20
                bg-white/5
                backdrop-blur-md
                hover:bg-white/10
                hover:border-white/40
                hover:shadow-[0_0_20px_rgba(168,85,247,0.5)]
                transition duration-300
            "
            >
            Contact
        </button>
        </div>

      </div>

      {/* 🔥 FEATURES */}
      <div ref={featuresRef} className="px-6 md:px-12 py-16">

        <h2 className="text-3xl font-bold text-center mb-10">
          Features
        </h2>

        <div className="grid md:grid-cols-3 gap-6">

          {[
            ["🤖 AI Classification", "Auto detects complaint category"],
            ["⚡ Smart Assignment", "Assigns least busy officer"],
            ["📊 Analytics", "Track performance"]
          ].map((f, i) => (
            <div key={i} className="bg-white/10 p-6 rounded-xl backdrop-blur hover:scale-105 transition">
              <h3 className="font-semibold mb-2">{f[0]}</h3>
              <p className="text-gray-300 text-sm">{f[1]}</p>
            </div>
          ))}

        </div>
      </div>

      {/* 🔥 WORKFLOW FIXED */}
      <div className="px-6 md:px-12 py-16 text-center">

        <h2 className="text-3xl font-bold mb-10">
          How It Works
        </h2>
        <div className="flex flex-wrap justify-center items-center gap-6">

            {["Submit", "AI Analysis", "Assign", "Resolve"].map((step, i) => (
                <div key={i} className="flex items-center">

                {/* STEP */}
                <div className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg">
                    {step}
                </div>

                {/* ARROW */}
                {i !== 3 && (
                    <div className="hidden md:flex items-center mx-4">

                    {/* LINE */}
                    <div className="w-12 h-[2px] bg-gradient-to-r from-indigo-400 to-purple-400"></div>

                    {/* ARROW HEAD */}
                    <div className="
                        w-0 h-0
                        border-t-[6px] border-t-transparent
                        border-b-[6px] border-b-transparent
                        border-l-[8px] border-l-purple-400
                    "></div>
                    </div>
                )}
                </div>
            ))}
        </div>   
      </div>

      {/* 🔮 FUTURE SCOPE */}
      <div className="px-6 md:px-12 py-16">

        <h2 className="text-3xl font-bold text-center mb-10">
          🚀 Future Scope
        </h2>

        <div className="grid md:grid-cols-3 gap-6">

          {[
            ["🧠 Complaint Clustering", "Merge similar complaints automatically"],
            ["📊 Predictive Analytics", "Forecast complaint spikes"],
            ["🤖 AI Chatbot", "Instant complaint assistant"],
            ["📍 Geo Tracking", "Location-based insights"],
            ["🔔 Notifications", "Real-time updates"],
            ["⚖️ SLA Monitoring", "Track resolution deadlines"]
          ].map((item, i) => (
            <div key={i} className="bg-white/10 p-6 rounded-xl backdrop-blur hover:scale-105 transition">
              <h3 className="font-semibold mb-2">{item[0]}</h3>
              <p className="text-gray-300 text-sm">{item[1]}</p>
            </div>
          ))}

        </div>
      </div>

      {/* 🔥 CONTACT */}
      <div ref={contactRef} className="px-6 md:px-12 py-16 text-center">

        <h2 className="text-3xl font-bold mb-8">
          Contact Us
        </h2>

        <form
          ref={formRef}
          onSubmit={sendEmail}
          className="max-w-xl mx-auto bg-white/10 p-6 rounded-xl flex flex-col gap-4 backdrop-blur"
        >

          <input
            name="user_name"
            placeholder="Your Name"
            required
            className="p-3 rounded text-black"
          />

          <input
            name="user_email"
            placeholder="Your Email"
            required
            className="p-3 rounded text-black"
          />

          <textarea
            name="message"
            placeholder="Your Message"
            required
            className="p-3 rounded text-black"
          />

          <button className="bg-gradient-to-r from-indigo-500 to-purple-500 py-2 rounded hover:scale-105 transition">
            Send Message 🚀
          </button>

        </form>

      </div>

      {/* 🔥 FOOTER FIXED */}
      <div className="text-center text-gray-400 py-6 mt-auto">
        © 2026 Grievix AI • All rights reserved
      </div>

    </div>
  );
}