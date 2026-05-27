import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Hero from "../components/sections/Hero";
import Features from "../components/sections/Features";
import HowItWorks from "../components/sections/HowItWorks";
import CTA from "../components/sections/CTA";
import Footer from "../components/layout/Footer";
import TemplatesSection from "../components/sections/TemplatesSection";
import FAQ from "../components/FAQ/FAQ";
import PaymentModal from "../components/PaymentModal";
import FallingResumes from "../components/FallingResumes";

const FX_KEY = "fxCache_ipapi_v1";
const FX_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
const FX_COOLDOWN_MS = 2 * 60 * 1000; // 2 min cooldown if ipapi rate-limits

const Pricing = () => {
  const navigate = useNavigate();
  const [paymentPlan, setPaymentPlan] = useState(null);
  
  // Initialize currency and rate from sessionStorage or localStorage
  const [currency, setCurrency] = useState(() => {
    const cached = JSON.parse(sessionStorage.getItem(FX_KEY) || "null");
    if (cached && Date.now() - cached.t < FX_TTL_MS) {
      return cached.c;
    }
    const lastAttempt = Number(sessionStorage.getItem(`${FX_KEY}_lastAttempt`) || "0");
    if (lastAttempt && Date.now() - lastAttempt < FX_COOLDOWN_MS) {
      return "USD";
    }
    return null;
  });

  const [rate, setRate] = useState(() => {
    const cached = JSON.parse(sessionStorage.getItem(FX_KEY) || "null");
    if (cached && Date.now() - cached.t < FX_TTL_MS) {
      return cached.r;
    }
    const lastAttempt = Number(sessionStorage.getItem(`${FX_KEY}_lastAttempt`) || "0");
    if (lastAttempt && Date.now() - lastAttempt < FX_COOLDOWN_MS) {
      return 1;
    }
    return null;
  });

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "",
      desc: "Explore the platform. No card needed.",
      features: [
        "Resume upload & instant ATS score",
        "AI keyword detection overview",
        "Structural resume analysis",
        "Section-by-section grade summary",
      ],
      locked: [
        "Full color-coded feedback report",
        "ATS resume download",
        "Cover letter generator",
      ],
      cta: "Start Free",
      style: {
        border: "1px solid rgba(255,255,255,0.08)",
        background: "#0c0e15",
      },
      btnStyle: {
        border: "1px solid rgba(255,255,255,0.1)",
        background: "rgba(255,255,255,0.04)",
        color: "#94a3b8",
      },
      badge: null,
    },
    {
      name: "Basic",
      price: "$2.99",
      period: "/month",
      desc: "Full feedback plus one ATS resume & cover letter.",
      features: [
        "Complete color-coded feedback report",
        "1 ATS-optimized resume download",
        "1 AI cover letter per month",
        "Email support",
      ],
      locked: [],
      cta: "Get Basic",
      style: {
        border: "1px solid rgba(59,130,246,0.35)",
        background: "linear-gradient(160deg, #0d1526, #0c0e15)",
      },
      btnStyle: {
        background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
        color: "#fff",
        boxShadow: "0 0 24px rgba(37,99,235,0.25)",
      },
      badge: { label: "Most Popular", bg: "rgba(37,99,235,0.9)" },
      glow: "rgba(37,99,235,0.12)",
    },
    {
      name: "Pro",
      price: "$6.99",
      period: "/month",
      desc: "Unlimited everything. The complete career toolkit.",
      features: [
        "Everything in Basic — unlimited",
        "Job description match scoring",
        "Unlimited resume versions",
        "AI interview prep questions",
        "LinkedIn profile optimization",
        "Priority support",
      ],
      locked: [],
      cta: "Get Pro",
      style: {
        border: "1px solid rgba(245,158,11,0.25)",
        background: "#0c0e15",
      },
      btnStyle: {
        background: "linear-gradient(135deg, #d97706, #f59e0b)",
        color: "#000",
      },
      badge: { label: "Best Value", bg: "rgba(217,119,6,0.9)" },
    },
  ];

  useEffect(() => {
    // Only fetch if we don't have cached data
    const cached = JSON.parse(sessionStorage.getItem(FX_KEY) || "null");
    if (cached && Date.now() - cached.t < FX_TTL_MS) {
      return;
    }

    const lastAttempt = Number(sessionStorage.getItem(`${FX_KEY}_lastAttempt`) || "0");
    if (lastAttempt && Date.now() - lastAttempt < FX_COOLDOWN_MS) {
      return;
    }

    (async () => {
      try {
        sessionStorage.setItem(`${FX_KEY}_lastAttempt`, String(Date.now()));
        const ipRes = await fetch("https://ipapi.co/json/");
        const ipData = await ipRes.json();
        const cur = ipData.currency || "USD";
        const fxRes = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
        const fxData = await fxRes.json();
        const r = cur === "USD" ? 1 : fxData.rates[cur] || 1;
        setCurrency(cur);
        setRate(r);
        sessionStorage.setItem(FX_KEY, JSON.stringify({ c: cur, r, t: Date.now() }));
      } catch {
        setCurrency("USD");
        setRate(1);
      }
    })();
  }, []);

  return (
    <section
      id="pricing"
      className="py-32 px-6 relative overflow-hidden"
      style={{ background: "transparent" }}
    >
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-175 h-75 pointer-events-none rounded-full opacity-15"
        style={{
          background:
            "radial-gradient(ellipse, rgba(37,99,235,0.3) 0%, transparent 70%)",
        }}
      />
      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-5"
            style={{
              background: "rgba(59,130,246,0.1)",
              border: "1px solid rgba(59,130,246,0.2)",
              color: "#93c5fd",
            }}
          >
            Pricing
          </span>
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-[-0.04em]">
            AI Resume Analyzer with ATS Match and Skill Gap Detection
            <br />
            <span style={{ color: "#3b82f6" }}>
              Simple, honest pricing. No surprises.
            </span>
          </h2>
          <p
            className="mt-5 max-w-xl mx-auto font-medium"
            style={{ color: "#64748b" }}
          >
            Start free, upgrade when you're ready. Cancel anytime on monthly
            plans.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {plans.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="relative p-7 rounded-2xl flex flex-col"
              style={p.style}
            >
              {p.glow && (
                <div
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse at 50% 0%, ${p.glow} 0%, transparent 70%)`,
                  }}
                />
              )}
              {p.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span
                    className="px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full text-white"
                    style={{ background: p.badge.bg }}
                  >
                    {p.badge.label}
                  </span>
                </div>
              )}
              <div className="relative z-10 flex flex-col flex-1">
                <div className="mb-6">
                  <p
                    className="text-[10px] font-black uppercase tracking-widest mb-2"
                    style={{ color: "#475569" }}
                  >
                    {p.name}
                  </p>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-4xl font-black text-white">
                      {!currency || rate === null
                        ? p.price
                        : new Intl.NumberFormat(undefined, {
                          style: "currency",
                          currency,
                          minimumFractionDigits: 0,
                        }).format(
                          p.name === "Basic"
                            ? 2.99 * rate
                            : p.name === "Pro"
                              ? 6.99 * rate
                              : 0
                        )}
                    </span>
                    <span className="text-sm" style={{ color: "#475569" }}>
                      {p.period}
                    </span>
                  </div>
                  <p
                    className="text-xs font-medium leading-relaxed"
                    style={{ color: "#475569" }}
                  >
                    {p.desc}
                  </p>
                </div>
                <ul className="space-y-2 mb-6 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <svg
                        className="mt-0.5 shrink-0 text-emerald-400"
                        width="12"
                        height="12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      <span
                        className="text-xs font-medium"
                        style={{ color: "#94a3b8" }}
                      >
                        {f}
                      </span>
                    </li>
                  ))}
                  {p.locked.map((f) => (
                    <li key={f} className="flex items-start gap-2 opacity-30">
                      <svg
                        className="mt-0.5 shrink-0"
                        width="12"
                        height="12"
                        fill="none"
                        stroke="#475569"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                      >
                        <rect x="3" y="11" width="18" height="11" rx="2" />
                        <path d="M7 11V7a5 5 0 0110 0v4" />
                      </svg>
                      <span
                        className="text-xs font-medium"
                        style={{ color: "#475569" }}
                      >
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() =>
                    p.name === "Free"
                      ? navigate("/signup")
                      : setPaymentPlan(p.name.toLowerCase())
                  }
                  className="w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 hover:opacity-85"
                  style={p.btnStyle}
                >
                  {p.cta}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <AnimatePresence>
        {paymentPlan && (
          <PaymentModal plan={paymentPlan} onClose={() => setPaymentPlan(null)} />
        )}
      </AnimatePresence>
    </section>
  );
};

const LandingPage = () => (
  <div className="relative min-h-screen text-white" style={{ background: "#07080c" }}>
    
    {/* Falling resumes layer */}
    <FallingResumes />

    {/* Content */}
    <div className="relative z-20">
    <Navbar />
    <Hero />
    <Features />
    <HowItWorks />
    <TemplatesSection />
    <Pricing />
    <FAQ />
    <CTA />
    <Footer />
    </div>
  </div>
);
export default LandingPage;
