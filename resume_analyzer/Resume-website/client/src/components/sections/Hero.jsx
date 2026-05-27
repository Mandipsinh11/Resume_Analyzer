import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PHRASES = [
  "gets you past ATS filters.",
  "lands you more interviews.",
  "impresses real recruiters.",
  "is optimized by real AI.",
];

const TypeWriter = () => {
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState("");
  const [del, setDel] = useState(false);
  useEffect(() => {
    const phrase = PHRASES[idx];
    let t;
    if (!del && text.length < phrase.length) t = setTimeout(() => setText(phrase.slice(0, text.length + 1)), 52);
    else if (!del && text.length === phrase.length) t = setTimeout(() => setDel(true), 2000);
    else if (del && text.length > 0) t = setTimeout(() => setText(text.slice(0, -1)), 26);
    else if (del) { setDel(false); setIdx(i => (i + 1) % PHRASES.length); }
    return () => clearTimeout(t);
  }, [text, del, idx]);
  return (
    <span className="relative">
      <span style={{ color: "#009dff" }}>{text}</span>
      <span className="animate-pulse ml-0.5" style={{ color: "#f2f6fd" }}>|</span>
    </span>
  );
};

const Hero = () => {
  const navigate = useNavigate();
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ background: "transparent" }}>
      {/* Ambient lights */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-175 h-125 rounded-full opacity-30"
          style={{ background: "radial-gradient(ellipse, rgba(37,99,235,0.25) 0%, transparent 70%)" }} />
        <div className="absolute bottom-[-5%] right-[15%] w-125 h-100 rounded-full opacity-20"
          style={{ background: "radial-gradient(ellipse, rgba(245,158,11,0.2) 0%, transparent 70%)" }} />
      
        
      </div>

      {/* Floating insight cards */}
      {/* Score badge */}
      {/* <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4.5, repeat: Infinity }}
        className="absolute hidden lg:flex items-center gap-2.5 px-4 py-2.5 rounded-2xl top-[24%] left-[6%]"
        style={{ background: "rgba(12,14,21,0.85)", border: "1px solid rgba(59,130,246,0.25)", backdropFilter: "blur(16px)" }}>
        <div className="relative w-2 h-2"> */}
          {/* <span className="absolute inset-0 rounded-full animate-ping" style={{ background: "rgba(34,197,94,0.6)" }} />
          <span className="relative block w-2 h-2 rounded-full bg-emerald-400" />
        </div>
        <span className="text-xs font-bold" style={{ color: "#94a3b8" }}>ATS Score <span className="text-white font-black">94</span>/100</span> */}
      {/* </motion.div> */}

      {/* Keywords card */}
      {/* <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity, delay: 1.2 }}
        className="absolute hidden lg:flex flex-col gap-2 px-4 py-3 rounded-2xl top-[18%] right-[7%]"
        style={{ background: "rgba(12,14,21,0.85)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(16px)" }}>
        <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: "#475569" }}>AI Detected Keyword</span>
        <div className="flex gap-1.5 flex-wrap max-w-40">
          {["Python", "React", "AWS", "CI/CD"].map(k => (
            <span key={k} className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: "rgba(37,99,235,0.15)", border: "1px solid rgba(59,130,246,0.25)", color: "#93c5fd" }}>{k}</span>
          ))}
        </div>
      </motion.div>

      {/* Chart card */}{/*}
      <motion.div animate={{ y: [0, -9, 0] }} transition={{ duration: 6, repeat: Infinity, delay: 0.6 }}
        className="absolute hidden lg:flex flex-col gap-2 px-4 py-3 rounded-2xl bottom-[30%] right-[5%]"
        style={{ background: "rgba(12,14,21,0.85)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(16px)" }}>
        <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: "#475569" }}>Interview Callbacks</span>
        <div className="flex items-end gap-1 h-8">
          {[35, 55, 42, 70, 88, 82, 96].map((h, i) => (
            <motion.div key={i} className="w-3 rounded-t-sm" initial={{ height: 0 }} whileInView={{ height: `${h}%` }} transition={{ delay: i * 0.07, duration: 0.5 }}
              style={{ height: `${h}%`, background: i === 6 ? "linear-gradient(to top, #2563eb, #60a5fa)" : "rgba(59,130,246,0.3)" }} />
          ))}
        </div>
        <span className="text-[10px] font-bold text-emerald-400">↑ 3.2× more callbacks</span>
      </motion.div>

      {/* Cover letter badge */}{/*}
      <motion.div animate={{ y: [0, -11, 0] }} transition={{ duration: 5.5, repeat: Infinity, delay: 2 }}
        className="absolute hidden lg:flex items-center gap-3 px-4 py-3 rounded-2xl bottom-[34%] left-[5%]"
        style={{ background: "rgba(12,14,21,0.85)", border: "1px solid rgba(245,158,11,0.2)", backdropFilter: "blur(16px)" }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base" style={{ background: "rgba(245,158,11,0.15)" }}>✍️</div>
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: "#475569" }}>Cover Letter</p>
          <p className="text-xs font-bold text-white">Generated in 4s</p>
        </div>
      </motion.div> */}

      {/* Main content */}
      <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 max-w-5xl mx-auto px-6 text-center">

        <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18, duration: 0.75 }}
          className="text-5xl sm:text-7xl md:text-[82px] font-black tracking-[-0.04em] leading-[1.02] mb-6 text-white">
          A resume that
          <br />
          <TypeWriter />
        </motion.h1>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.32 }}
          className="text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed font-medium" style={{ color: "#94a3b8" }}>
          ATSify scans, scores, and rewrites your resume so it passes every filter and lands on a real recruiter's desk.
        </motion.p>

        {/* Stats */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.42 }}
          className="flex flex-wrap justify-center gap-10 mb-12">
          {[{ v: "10K+", l: "Resumes Optimized" }, { v: "85%", l: "Interview Rate" }, { v: "3×", l: "More Callbacks" }, { v: "<5s", l: "AI Analysis" }].map(({ v, l }) => (
            <div key={l} className="text-center">
              <div className="text-3xl font-black text-white tracking-tighter">{v}</div>
              <div className="text-[10px] font-black uppercase tracking-widest mt-1" style={{ color: "#475569" }}>{l}</div>
            </div>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.52 }}
          className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <button onClick={() => navigate("/login")}
            className="group relative w-full sm:w-auto px-10 py-4 rounded-2xl font-black text-base text-white overflow-hidden"
            style={{ background: "linear-gradient(135deg, #1d4ed8, #2563eb, #3b82f6)", boxShadow: "0 0 40px rgba(37,99,235,0.35)" }}>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
              style={{ background: "linear-gradient(135deg, #2563eb, #3b82f6)" }} />
            <span className="relative z-10 flex items-center justify-center gap-2">
              Analyze My Resume — Free
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14m-7-7l7 7-7 7"/></svg>
            </span>
          </button>
          <button onClick={() => navigate("/signup")}
            className="w-full sm:w-auto px-10 py-4 rounded-2xl font-black text-base text-white transition-all hover:brightness-110"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
            View Templates
          </button>
        </motion.div>

        {/* Logos */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}
          className="mt-16 pt-10 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <p className="text-[9px] font-black uppercase tracking-[0.4em] mb-7" style={{ color: "#334155" }}>Trusted by candidates at</p>
          <div className="flex flex-wrap justify-center items-center gap-8">
            {["Meta", "Google", "Amazon", "Apple", "Netflix", "Stripe"].map(n => (
              <span key={n} className="text-sm font-black tracking-tight" style={{ color: "#334155" }}
                onMouseEnter={e => e.target.style.color = "#64748b"}
                onMouseLeave={e => e.target.style.color = "#334155"}>{n}</span>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};
export default Hero;
