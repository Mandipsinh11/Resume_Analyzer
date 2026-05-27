import { motion, useAnimationControls } from "framer-motion";
import { useEffect, useState } from "react";

const STEPS = [
  {
    step: "01", title: "Upload Resume", desc: "Drag and drop your PDF or Word document. Our AI instantly parses your entire career history.", gradient: "from-blue-500 to-indigo-600",
    icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
  },
  {
    step: "02", title: "AI Deep Scan", desc: "Our engine compares your data against 500+ industry-specific ATS checkpoints and recruiter benchmarks.", gradient: "from-violet-500 to-purple-600",
    icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
  },
  {
    step: "03", title: "Get Results", desc: "Receive a detailed breakdown of your score, missing keywords, and actionable rewriting tips.", gradient: "from-emerald-500 to-teal-600",
    icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
  },
];

const KEYWORDS = [
  { label: "React.js", color: "bg-blue-50 text-blue-600 border-blue-200", delay: 0.5 },
  { label: "Node.js", color: "bg-violet-50 text-violet-600 border-violet-200", delay: 0.8 },
  { label: "TypeScript", color: "bg-emerald-50 text-emerald-600 border-emerald-200", delay: 1.1 },
  { label: "AWS", color: "bg-orange-50 text-orange-600 border-orange-200", delay: 1.4 },
  { label: "REST API", color: "bg-pink-50 text-pink-600 border-pink-200", delay: 1.7 },
  { label: "Docker", color: "bg-cyan-50 text-cyan-600 border-cyan-200", delay: 2.0 },
];

const CHECKS = [
  { label: "Keyword Density", pass: true, delay: 0.3 },
  { label: "ATS Formatting", pass: true, delay: 0.6 },
  { label: "Action Verbs", pass: true, delay: 0.9 },
  { label: "Quantified Impact", pass: false, delay: 1.2 },
];

const RESUME_LINES = [8, 14, 10, 6, 12, 9, 13, 7, 11, 8, 14, 6];

function AnimatedScanner() {
  const [score, setScore] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [done, setDone] = useState(false);
  const scanControls = useAnimationControls();

  useEffect(() => {
    const start = async () => {
      await new Promise(r => setTimeout(r, 600));
      setScanning(true);
      await scanControls.start({
        y: ["0%", "100%"],
        transition: { duration: 2.2, ease: "linear" },
      });
      setScanning(false);
      setDone(true);
      let s = 0;
      const interval = setInterval(() => {
        s += 2;
        setScore(s);
        if (s >= 94) clearInterval(interval);
      }, 28);
    };
    start();
  }, []);

  return (
    <div className="relative w-full max-w-sm mx-auto select-none" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Glow */}
      <div className="absolute -inset-8 rounded-full blur-[80px] opacity-10 pointer-events-none" style={{ background: "var(--primary)" }} />

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 rounded-3xl overflow-hidden border shadow-2xl"
        style={{ background: "#fff", borderColor: "var(--border)" }}
      >
        {/* Header bar */}
        <div className="flex items-center gap-1.5 px-4 py-3 border-b" style={{ borderColor: "var(--border)", background: "#f9fafb" }}>
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
          <span className="ml-3 text-[11px] font-semibold text-gray-400 tracking-wide">resume_ayush_2025.pdf</span>
        </div>

        <div className="flex gap-0" style={{ minHeight: 320 }}>
          {/* Resume preview */}
          <div className="relative flex-1 p-4 overflow-hidden" style={{ background: "#f8f9fc" }}>
            {/* Scan beam */}
            {scanning && (
              <motion.div
                animate={scanControls}
                className="absolute left-0 right-0 h-[3px] z-20 pointer-events-none"
                style={{
                  top: 0,
                  background: "linear-gradient(90deg, transparent, #3b82f6, #818cf8, #3b82f6, transparent)",
                  boxShadow: "0 0 16px 4px #3b82f688",
                }}
              />
            )}

            {/* Fake resume lines */}
            <div className="flex flex-col gap-2 pt-1">
              <div className="h-2.5 w-3/4 rounded-full bg-gray-800 opacity-80" />
              <div className="h-1.5 w-2/5 rounded-full bg-blue-400 opacity-70 mb-1" />
              {RESUME_LINES.map((w, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: done ? (CHECKS[i % CHECKS.length]?.pass ? 1 : 0.35) : 0.5 }}
                  transition={{ delay: i * 0.07 }}
                  className="h-1.5 rounded-full"
                  style={{
                    width: `${w * 6}%`,
                    background: done
                      ? (i % 5 === 0 ? "#3b82f6" : "#cbd5e1")
                      : "#cbd5e1",
                  }}
                />
              ))}
            </div>

            {/* Highlight overlays on done */}
            {done && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                  className="absolute top-10 left-3 right-3 h-5 rounded bg-blue-400/10 border border-blue-300/30" />
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                  className="absolute top-24 left-3 right-6 h-5 rounded bg-emerald-400/10 border border-emerald-300/30" />
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                  className="absolute top-40 left-3 right-10 h-5 rounded bg-violet-400/10 border border-violet-300/30" />
              </>
            )}
          </div>

          {/* Side panel */}
          <div className="w-36 border-l flex flex-col p-3 gap-3" style={{ borderColor: "var(--border)" }}>
            {/* Score */}
            <div className="text-center">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">ATS Score</p>
              <div className="relative w-16 h-16 mx-auto">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                  <motion.circle
                    cx="18" cy="18" r="15.9" fill="none"
                    stroke="url(#scoreGrad)" strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray="100"
                    initial={{ strokeDashoffset: 100 }}
                    animate={{ strokeDashoffset: done ? 6 : 100 }}
                    transition={{ duration: 1.4, ease: "easeOut", delay: 0.2 }}
                  />
                  <defs>
                    <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#818cf8" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.span
                    className="text-lg font-black"
                    style={{ color: "var(--primary)" }}
                  >
                    {score}
                  </motion.span>
                </div>
              </div>
            </div>

            {/* Checks */}
            <div className="flex flex-col gap-1.5">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Checks</p>
              {CHECKS.map((c, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: done ? 1 : 0, x: done ? 0 : 10 }}
                  transition={{ delay: c.delay }}
                  className="flex items-center gap-1.5"
                >
                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 ${c.pass ? "bg-emerald-500" : "bg-red-400"}`}>
                    {c.pass
                      ? <svg width="8" height="8" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg>
                      : <svg width="8" height="8" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    }
                  </div>
                  <span className="text-[9px] font-semibold text-gray-500 leading-tight">{c.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Keywords footer */}
        <div className="border-t px-4 py-3" style={{ borderColor: "var(--border)" }}>
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">Keywords Detected</p>
          <div className="flex flex-wrap gap-1.5">
            {KEYWORDS.map((k, i) => (
              <motion.span
                key={k.label}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: done ? 1 : 0, scale: done ? 1 : 0.7 }}
                transition={{ delay: k.delay, type: "spring", stiffness: 300 }}
                className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${k.color}`}
              >
                {k.label}
              </motion.span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Floating score badge */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-5 -right-4 z-20 flex items-center gap-2 px-3 py-2 rounded-2xl bg-white shadow-xl border border-emerald-100"
      >
        <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center">
          <svg width="14" height="14" fill="none" stroke="#fff" strokeWidth="3" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg>
        </div>
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Score</p>
          <p className="text-sm font-black text-emerald-600">94/100</p>
        </div>
      </motion.div>

      {/* Floating AI badge */}
      <motion.div
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
        className="absolute -bottom-5 -left-4 z-20 px-3 py-2 rounded-2xl bg-white shadow-xl border border-blue-100 flex items-center gap-2"
      >
        <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "var(--primary)" }}>
          <svg width="14" height="14" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" /></svg>
        </div>
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">AI Scan</p>
          <p className="text-[11px] font-black" style={{ color: "var(--primary)" }}>Complete</p>
        </div>
      </motion.div>
    </div>
  );
}

const HowItWorks = () => (
  <section id="how" className="py-12 min-h-[100dvh] flex items-center relative overflow-hidden" style={{ background: "var(--bg-2)" }}>
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
      <div className="absolute top-1/2 right-0 w-[600px] h-[600px] rounded-full blur-[140px] opacity-[0.05] -translate-y-1/2" style={{ background: "var(--primary)" }} />
    </div>

    <div className="w-full max-w-7xl mx-auto px-6 md:px-12 relative z-10">
      <div className="flex flex-col lg:flex-row lg:items-center items-center gap-10 lg:gap-16">
        {/* Left */}
        <div className="lg:w-1/2">
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-100 bg-blue-50/80 text-[var(--primary)] text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mb-4">
            <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-[var(--primary)]" /> The Process
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-[var(--text)] mb-4 leading-tight">
            How it works in <br /><span style={{ color: "var(--primary)" }}>3 Simple Steps</span>
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="text-[var(--text-2)] text-base md:text-lg mb-8 font-semibold leading-relaxed">
            Getting past the ATS shouldn't be a mystery. We've simplified the process.
          </motion.p>

          <div className="flex flex-col gap-3">
            {STEPS.map((s, i) => (
              <motion.div key={s.step}
                initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.15 + 0.3 }}
                whileHover={{ x: 8, transition: { duration: 0.2 } }}
                className="flex items-start gap-4 p-4 md:p-5 rounded-2xl md:rounded-3xl border border-transparent hover:border-blue-100 hover:bg-white transition-all group cursor-pointer hover:shadow-xl hover:shadow-blue-500/[0.04]">
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br ${s.gradient} flex items-center justify-center text-white shadow-lg flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  {s.icon}
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-black text-[var(--text)] mb-1 group-hover:text-[var(--primary)] transition-colors">{s.title}</h3>
                  <p className="text-xs md:text-sm text-[var(--text-2)] font-medium leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right — Interactive Animated Scanner */}
        <div className="lg:w-1/2 flex items-center justify-center py-8">
          <AnimatedScanner />
        </div>
      </div>
    </div>
  </section>
);

export default HowItWorks;
