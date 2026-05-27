import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const PHRASES = [
  "gets you past ATS filters.",
  "lands you more interviews.",
  "impresses real recruiters.",
  "is optimized by real AI.",
];

const BRANDS = [
  { name: "Spotify", color: "#1DB954", logo: "/images/logos/spotify.png" },
  { name: "Stripe", color: "#008CDD", logo: "/images/logos/stripe.svg" },
  { name: "Uber", color: "#000000", logo: "/images/logos/uber.png" },
  { name: "Amazon", color: "#FF9900", logo:  "/images/logos/amazon.png"},
  { name: "Meta", color: "#0668E1", logo: "/images/logos/meta.png" },
  { name: "Google", color: "#4285F4", logo: "/images/logos/google.png" },
];

const TypeWriter = () => {
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState("");
  const [del, setDel] = useState(false);

  useEffect(() => {
    const phrase = PHRASES[idx];
    let t;
    if (!del && text.length < phrase.length) {
      t = setTimeout(() => setText(phrase.slice(0, text.length + 1)), 52);
    } else if (!del && text.length === phrase.length) {
      t = setTimeout(() => setDel(true), 2000);
    } else if (del && text.length > 0) {
      t = setTimeout(() => setText(text.slice(0, -1)), 26);
    } else if (del) {
      setDel(false);
      setIdx((i) => (i + 1) % PHRASES.length);
    }
    return () => clearTimeout(t);
  }, [text, del, idx]);

  return (
    <span className="relative">
      <span style={{ color: "var(--primary)" }}>{text}</span>
      <span
        className="animate-pulse ml-0.5"
        style={{ color: "var(--primary)" }}
      >
        |
      </span>
    </span>
  );
};

const Hero = () => {
  const navigate = useNavigate();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const opac = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex flex-col justify-center overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[-20%] left-[-10%] w-[60%] h-[80%] rounded-full opacity-[0.06] blur-[140px]"
          style={{ background: "var(--primary)" }}
        />
        <div
          className="absolute bottom-[-20%] right-[-5%] w-[55%] h-[70%] rounded-full opacity-[0.05] blur-[120px]"
          style={{ background: "var(--secondary)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "radial-gradient(var(--primary) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full pt-28 pb-40 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        {/* LEFT COLUMN — Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-start max-w-xl"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full border bg-blue-50/80 text-[var(--primary)] text-xs font-black uppercase tracking-widest mb-8"
            style={{ borderColor: "rgba(37,99,235,0.18)" }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute h-full w-full rounded-full bg-[var(--primary)] opacity-75" />
              <span className="relative rounded-full h-2 w-2 bg-[var(--primary)]" />
            </span>
            Trusted by 10,000+ Job Seekers
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.8 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-[-0.04em] leading-tight mb-4 text-[var(--text)]"
          >
            Your dream job
            <br />
            <TypeWriter />
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-base md:text-lg max-w-lg mb-6 leading-relaxed font-semibold text-[var(--text-2)]"
          >
            ATSify is the world's most advanced AI resume checker. Scan, score,
            and optimize your way to more interviews.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8"
          >
            <motion.button
              whileHover={{ scale: 1.04, y: -3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/login")}
              className="group px-9 py-4 rounded-2xl font-black text-sm text-white shadow-xl shadow-blue-500/20 overflow-hidden relative"
              style={{
                background:
                  "linear-gradient(135deg, var(--primary), var(--primary-d))",
              }}
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10 flex items-center gap-3">
                Analyze My Resume — Free
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                  className="group-hover:translate-x-1 transition-transform"
                >
                  <path d="M5 12h14m-7-7l7 7-7 7" />
                </svg>
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.04, y: -3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/templates")}
              className="px-9 py-4 rounded-2xl font-black text-sm text-[var(--text)] border-2 border-[var(--border)] bg-white hover:border-blue-200 hover:shadow-lg transition-all"
            >
              View Templates
            </motion.button>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex items-center gap-6 mt-2"
          >
            {[
              { value: "94%", label: "ATS Pass Rate" },
              { value: "3×", label: "More Interviews" },
              { value: "500+", label: "Resumes Optimized" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-black text-[var(--primary)]">
                  {stat.value}
                </p>
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-3)] mt-0.5">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* RIGHT COLUMN — Simplified App Preview */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          style={{ y: y2, opacity: opac }}
          className="relative hidden lg:flex items-center justify-center"
        >
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-[420px] max-w-full"
          >
            {/* Card background */}
            <div className="rounded-[32px] border border-blue-100 bg-gradient-to-br from-white via-[#f5f7ff] to-[#e0ebff] shadow-[0_24px_60px_rgba(15,23,42,0.14)] overflow-hidden">
              {/* Top bar with avatar and basic info */}
              <div className="px-6 pt-6 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                    P
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Candidate Name
                    </p>
                    <p className="text-[11px] font-medium text-slate-500">
                      Role • Skills • Location
                    </p>
                  </div>
                </div>
                {/* ATS badge in top-right */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">
                    94
                  </span>
                  <div className="flex flex-col leading-none">
                    <span className="text-[9px] font-bold tracking-[0.14em] text-emerald-500 uppercase">
                      ATS Score
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-700">
                      Strong match
                    </span>
                  </div>
                </div>
              </div>

              {/* Fake resume preview */}
              <div className="px-6 pb-6 space-y-4">
                {/* Section header */}
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold tracking-[0.24em] text-slate-400 uppercase">
                    Resume Overview
                  </p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600">
                    Keyword optimized
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </span>
                </div>

                {/* Two-column resume layout */}
                <div className="grid grid-cols-[1.1fr_0.9fr] gap-5">
                  {/* Left column */}
                  <div className="space-y-3">
                    {/* Big highlighted line */}
                    <div className="h-3.5 rounded-full bg-gradient-to-r from-blue-500/80 to-indigo-500/80 w-3/4" />
                    {/* Smaller lines */}
                    <div className="space-y-2">
                      <div className="h-2.5 rounded-full bg-slate-100 w-full" />
                      <div className="h-2.5 rounded-full bg-slate-100 w-11/12" />
                      <div className="h-2.5 rounded-full bg-slate-100 w-10/12" />
                    </div>

                    <div className="space-y-2 pt-2">
                      <div className="h-2.5 rounded-full bg-slate-100 w-9/12" />
                      <div className="h-2.5 rounded-full bg-slate-100 w-full" />
                      <div className="h-2.5 rounded-full bg-slate-100 w-5/6" />
                    </div>
                  </div>

                  {/* Right column – score breakdown */}
                  <div className="space-y-3">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-2.5">
                      <p className="text-[11px] font-semibold text-slate-500 mb-1">
                        Match breakdown
                      </p>
                      <div className="space-y-1.5">
                        {[
                          { label: "Keywords", value: 92 },
                          { label: "Formatting", value: 88 },
                          { label: "Experience", value: 96 },
                        ].map((item) => (
                          <div
                            key={item.label}
                            className="flex items-center justify-between"
                          >
                            <span className="text-[11px] text-slate-500">
                              {item.label}
                            </span>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-blue-500"
                                  style={{ width: `${item.value}%` }}
                                />
                              </div>
                              <span className="text-[11px] font-semibold text-slate-700">
                                {item.value}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-blue-50 bg-blue-50/60 px-3 py-2.5 flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-semibold text-slate-600">
                          Next best action
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Add 2 more React projects to your resume.
                        </p>
                      </div>
                      <div className="w-8 h-8 rounded-2xl bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
                        AI
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Brand Logos Marquee */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-0 left-0 w-full py-8 bg-[var(--bg)] border-y border-[var(--border)] overflow-hidden flex items-center z-20"
      >
        <div className="relative flex overflow-hidden w-full">
          <motion.div
            animate={{ x: [0, -1500] }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="flex items-center gap-24 whitespace-nowrap px-10"
          >
            {[...Array(4)].flatMap(() => BRANDS).map((b, i) => (
              <div
                key={`${b.name}-${i}`}
                className="flex items-center gap-3 min-w-max"
              >
                <div className="w-9 h-9 rounded-2xl flex items-center justify-center bg-white shadow-sm border border-white/60">
                  {b.logo ? (
                    <img
                      src={b.logo}
                      alt={b.name}
                      className="w-6 h-6 object-contain"
                    />
                  ) : (
                    <span
                      className="w-7 h-7 rounded-xl flex items-center justify-center text-[11px] font-bold text-white"
                      style={{ background: b.color }}
                    >
                      {b.name.charAt(0)}
                    </span>
                  )}
                </div>
                <span className="text-lg md:text-xl font-semibold tracking-tight text-slate-900">
                  {b.name}
                </span>
              </div>
            ))}
          </motion.div>

          <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-[var(--bg)] to-transparent z-10" />
          <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-[var(--bg)] to-transparent z-10" />
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;