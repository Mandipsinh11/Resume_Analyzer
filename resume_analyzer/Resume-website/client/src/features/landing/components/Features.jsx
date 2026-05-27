import { motion, useAnimationControls } from "framer-motion";
import { useEffect, useState, useRef } from "react";

const icons = {
  score: (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
    </svg>
  ),
  keyword: (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /><path d="M8 11h6" /><path d="M11 8v6" />
    </svg>
  ),
  format: (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" />
    </svg>
  ),
  ai: (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
      <path d="M12 2 2 7l10 5 10-5-10-5z" /><path d="m2 17 10 5 10-5" /><path d="m2 12 10 5 10-5" />
    </svg>
  ),
};

const FEATURES = [
  { title: "AI Resume Scoring", desc: "Get an instant ATS score based on real-world recruiter algorithms.", icon: "score", gradient: "from-blue-500 to-indigo-600" },
  { title: "Keyword Optimization", desc: "Automatically detect and insert missing high-impact keywords.", icon: "keyword", gradient: "from-sky-400 to-cyan-600" },
  { title: "Format Analysis", desc: "Ensure your resume is readable by every major ATS system.", icon: "format", gradient: "from-violet-500 to-purple-600" },
  { title: "Live AI Feedback", desc: "Contextual suggestions to rewrite bullet points for maximum impact.", icon: "ai", gradient: "from-emerald-400 to-teal-600" },
];

const SKILL_BARS = [
  { label: "Keyword Match", value: 88, color: "#3b82f6", delay: 0.2 },
  { label: "Formatting", value: 95, color: "#8b5cf6", delay: 0.35 },
  { label: "Impact Verbs", value: 72, color: "#10b981", delay: 0.5 },
  { label: "Readability", value: 91, color: "#f59e0b", delay: 0.65 },
];

const SUGGESTIONS = [
  { icon: "✦", text: "Add quantified metrics to \"Led team…\" bullet", type: "improve", delay: 0.4 },
  { icon: "✓", text: "Strong action verb detected: \"Architected\"", type: "pass", delay: 0.7 },
  { icon: "✦", text: "Missing keyword: \"cross-functional\"", type: "improve", delay: 1.0 },
  { icon: "✓", text: "ATS-safe font and layout confirmed", type: "pass", delay: 1.3 },
];

const TYPING_TEXT = "Built 3 web apps used by 10,000+ users, improving load speed by 60%.";

function LiveFeedbackPanel() {
  const [score, setScore] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showBars, setShowBars] = useState(false);
  const hasStarted = useRef(false);

  const startAnimation = () => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    // Type text
    let i = 0;
    const typeInterval = setInterval(() => {
      setTypedText(TYPING_TEXT.slice(0, i + 1));
      i++;
      if (i >= TYPING_TEXT.length) {
        clearInterval(typeInterval);
        setTimeout(() => {
          setShowBars(true);
          setShowSuggestions(true);
          let s = 0;
          const scoreInterval = setInterval(() => {
            s += 2;
            setScore(s);
            if (s >= 88) clearInterval(scoreInterval);
          }, 22);
        }, 300);
      }
    }, 28);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 32 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      onViewportEnter={startAnimation}
      className="relative w-full max-w-md mx-auto lg:max-w-none select-none"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* Glow */}
      <div className="absolute -inset-8 rounded-full blur-[80px] opacity-[0.07] pointer-events-none" style={{ background: "var(--primary)" }} />

      {/* Main dashboard card */}
      <div className="relative z-10 rounded-[28px] overflow-hidden border shadow-2xl" style={{ background: "#fff", borderColor: "var(--border)" }}>

        {/* Title bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "#f1f5f9", background: "#f8fafc" }}>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <span className="text-[11px] font-semibold text-gray-400">ATSify — Live Analysis</span>
          <div className="flex items-center gap-1.5">
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.4, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-emerald-500"
            />
            <span className="text-[10px] font-bold text-emerald-600">LIVE</span>
          </div>
        </div>

        <div className="p-4 flex flex-col gap-3">
          {/* Editable bullet simulation */}
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Bullet Point Editor</p>
            <div className="relative rounded-xl border p-3 text-[12px] font-medium text-gray-700 leading-relaxed min-h-[52px]"
              style={{ borderColor: "#e2e8f0", background: "#f8fafc" }}>
              {typedText}
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.7, repeat: Infinity }}
                className="inline-block w-0.5 h-3.5 ml-0.5 align-middle rounded-sm"
                style={{ background: "var(--primary)" }}
              />
            </div>
          </div>

          {/* Score + Bars row */}
          <div className="flex gap-3">
            {/* Radial score */}
            <div className="flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl px-4 py-3 border border-blue-100 flex-shrink-0">
              <div className="relative w-16 h-16">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e0e7ff" strokeWidth="3" />
                  <motion.circle
                    cx="18" cy="18" r="15.9" fill="none"
                    strokeWidth="3" strokeLinecap="round"
                    strokeDasharray="100"
                    initial={{ strokeDashoffset: 100 }}
                    animate={{ strokeDashoffset: showBars ? 12 : 100 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    style={{ stroke: "url(#fg)" }}
                  />
                  <defs>
                    <linearGradient id="fg" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#818cf8" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-black" style={{ color: "var(--primary)" }}>{score}</span>
                  <span className="text-[8px] font-bold text-gray-400">/100</span>
                </div>
              </div>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mt-1">ATS Score</p>
            </div>

            {/* Skill bars */}
            <div className="flex-1 flex flex-col gap-2 justify-center">
              {SKILL_BARS.map((bar, i) => (
                <div key={bar.label}>
                  <div className="flex justify-between mb-0.5">
                    <span className="text-[9px] font-bold text-gray-500">{bar.label}</span>
                    <span className="text-[9px] font-black" style={{ color: bar.color }}>{bar.value}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: showBars ? `${bar.value}%` : 0 }}
                      transition={{ duration: 0.9, delay: bar.delay, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ background: bar.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI suggestions */}
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1.5">AI Suggestions</p>
            <div className="flex flex-col gap-1.5">
              {SUGGESTIONS.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: showSuggestions ? 1 : 0, x: showSuggestions ? 0 : 12 }}
                  transition={{ delay: s.delay, type: "spring", stiffness: 260, damping: 22 }}
                  className={`flex items-start gap-2 px-3 py-2 rounded-xl text-[11px] font-semibold leading-snug border ${
                    s.type === "pass"
                      ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                      : "bg-blue-50 border-blue-100 text-blue-700"
                  }`}
                >
                  <span className="font-black flex-shrink-0 mt-px">{s.icon}</span>
                  {s.text}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating top-left card */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-4 -left-4 z-20 flex items-center gap-2 px-3 py-2 rounded-2xl bg-white shadow-xl border border-blue-100"
      >
        <div className="w-7 h-7 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M9 11l2 2 4-4" /><circle cx="12" cy="12" r="9" />
          </svg>
        </div>
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Real‑time</p>
          <p className="text-[11px] font-black" style={{ color: "var(--primary)" }}>Live Scoring</p>
        </div>
      </motion.div>

      {/* Floating bottom-right badge */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -bottom-4 -right-4 z-20 px-3 py-2 rounded-2xl bg-white shadow-xl border border-emerald-100 flex items-center gap-2"
      >
        <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center">
          <svg width="13" height="13" fill="none" stroke="#fff" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
        </div>
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Verified</p>
          <p className="text-[11px] font-black text-emerald-600">ATS‑Ready</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

const Features = () => (
  <section id="features" className="py-12 min-h-[100dvh] flex items-center relative overflow-hidden" style={{ background: "var(--bg-2)" }}>
    <div className="w-full max-w-6xl mx-auto px-6 md:px-10 relative z-10">
      <div className="flex flex-col lg:flex-row lg:items-center items-center gap-10 lg:gap-16 mb-10">
        {/* Left — Text */}
        <div className="lg:w-1/2">
          <motion.div
            initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-100 bg-blue-50/80 text-[var(--primary)] text-[10px] font-black uppercase tracking-[0.22em] mb-4"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
            Powerful intelligence
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-[var(--text)] mb-4 leading-tight"
          >
            Features built for{" "}
            <span style={{ color: "var(--primary)" }}>ATS dominance</span>
          </motion.h2>

          <p className="text-sm md:text-base text-[var(--text-2)] font-semibold leading-relaxed mb-8 max-w-xl">
            ATSify doesn&apos;t just check spelling. It analyzes your resume&apos;s structure, semantics, and impact using data from thousands of successful job applications.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="p-4 lg:p-5 rounded-2xl lg:rounded-3xl bg-white border border-[var(--border)] hover:border-blue-200 transition-all group"
              >
                <div className={`w-9 h-9 lg:w-11 lg:h-11 rounded-lg lg:rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center text-white mb-2 lg:mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                  {icons[f.icon]}
                </div>
                <h3 className="text-sm md:text-base font-black text-[var(--text)] mb-1">{f.title}</h3>
                <p className="text-[11px] lg:text-sm text-[var(--text-3)] font-medium leading-snug">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right — Animated Live Feedback Panel */}
        <div className="lg:w-1/2 relative flex flex-col justify-center py-8">
          <LiveFeedbackPanel />
        </div>
      </div>

      {/* Small supporting cards row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: "👥", gradient: "from-blue-400 to-indigo-500", title: "Human‑in‑the‑loop", desc: "Models trained and validated with real recruiter feedback." },
          { icon: "📄", gradient: "from-violet-400 to-purple-500", title: "Template library", desc: "Best‑practice resume layouts for tech, product, and more." },
          { icon: "🌍", gradient: "from-emerald-400 to-teal-500", title: "Global reach", desc: "Optimizing resumes across roles and countries worldwide." },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.2 + i * 0.12 }}
            className="group cursor-default"
          >
            <div className={`relative h-32 lg:h-40 rounded-2xl lg:rounded-3xl overflow-hidden mb-3 border border-[var(--border)] bg-gradient-to-br ${item.gradient} flex items-center justify-center`}>
              <motion.span
                className="text-5xl"
                animate={{ scale: [1, 1.12, 1], rotate: [0, 4, -4, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: i * 0.8 }}
              >
                {item.icon}
              </motion.span>
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
            </div>
            <h4 className="text-sm font-black text-[var(--text)] mb-0.5">{item.title}</h4>
            <p className="text-[11px] lg:text-xs text-[var(--text-3)] font-medium leading-snug">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default Features;