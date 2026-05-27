import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import PaymentModal from "../../../components/ui/PaymentModal";

const Pricing = () => {
    const navigate = useNavigate();
    const [paymentPlan, setPaymentPlan] = useState(null);
    const [currency, setCurrency] = useState(null);
    const [rate, setRate] = useState(null);
    const FX_KEY = "fxCache_ipapi_v1";
    const FX_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
    const FX_COOLDOWN_MS = 2 * 60 * 1000; // 2 min cooldown if ipapi rate-limits

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
                border: "1px solid var(--border)",
                background: "var(--bg)",
            },
            btnStyle: {
                border: "1px solid var(--border-2)",
                background: "var(--bg-2)",
                color: "var(--text-2)",
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
                border: "2px solid var(--primary)",
                background: "var(--bg)",
                boxShadow: "0 24px 48px -12px var(--primary-glow)",
            },
            btnStyle: {
                background: "var(--primary)",
                color: "#fff",
                boxShadow: "0 12px 24px -6px var(--primary-glow)",
            },
            badge: { label: "Most Popular", bg: "var(--primary)" },
            glow: "var(--primary-glow)",
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
                border: "1px solid var(--border)",
                background: "var(--bg)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
            },
            btnStyle: {
                background: "var(--text)",
                color: "#fff",
            },
            badge: { label: "Best Value", bg: "var(--text)" },
            glow: "rgba(15, 23, 42, 0.03)",
        },
    ];

    useEffect(() => {
        const cached = JSON.parse(sessionStorage.getItem(FX_KEY) || "null");
        if (cached && Date.now() - cached.t < FX_TTL_MS) {
            setCurrency(cached.c);
            setRate(cached.r);
            return;
        }

        const lastAttempt = Number(sessionStorage.getItem(`${FX_KEY}_lastAttempt`) || "0");
        if (lastAttempt && Date.now() - lastAttempt < FX_COOLDOWN_MS) {
            setCurrency("USD");
            setRate(1);
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
            className="py-32 relative overflow-hidden"
            style={{ background: "var(--bg)" }}
        >
            <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] pointer-events-none opacity-20 blur-[120px]"
                style={{
                    background: "radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)",
                }}
            />
            <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
                <div className="text-center mb-24">
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-[var(--primary)] text-sm font-black uppercase tracking-[0.3em] mb-4"
                    >
                        Investment
                    </motion.p>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-black tracking-tight text-[var(--text)] mb-6"
                    >
                        Simple, <span style={{ color: "var(--primary)" }}>Honest</span> Pricing
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-[var(--text-2)] text-xl max-w-2xl mx-auto font-medium"
                    >
                        Start for free and upgrade as you grow. No hidden fees or complex contracts.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((p, i) => (
                        <motion.div
                            key={p.name}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.12 }}
                            whileHover={{ y: -8, transition: { duration: 0.3 } }}
                            className="relative p-10 rounded-[32px] flex flex-col group transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/[0.06] cursor-pointer"
                            style={p.style}
                        >
                            {p.glow && (
                                <div
                                    className="absolute inset-0 rounded-[32px] pointer-events-none opacity-20 group-hover:opacity-30 transition-opacity"
                                    style={{
                                        background: `radial-gradient(circle at 50% 0%, ${p.glow} 0%, transparent 70%)`,
                                    }}
                                />
                            )}
                            {p.badge && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <span
                                        className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full text-white shadow-lg shadow-[var(--primary-glow)]"
                                        style={{ background: p.badge.bg }}
                                    >
                                        {p.badge.label}
                                    </span>
                                </div>
                            )}
                            <div className="relative z-10 flex flex-col flex-1">
                                <div className="mb-8">
                                    <p
                                        className="text-[10px] font-black uppercase tracking-widest mb-4"
                                        style={{ color: "var(--text-3)" }}
                                    >
                                        {p.name}
                                    </p>
                                    <div className="flex items-baseline gap-2 mb-4">
                                        <span className="text-5xl font-black text-[var(--text)] tracking-tighter">
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
                                        <span className="text-lg font-medium text-[var(--text-3)]">
                                            {p.period}
                                        </span>
                                    </div>
                                    <p
                                        className="text-sm font-medium leading-relaxed text-[var(--text-2)]"
                                    >
                                        {p.desc}
                                    </p>
                                </div>

                                <div className="h-px bg-[var(--border)] mb-8" />

                                <ul className="space-y-4 mb-10 flex-1">
                                    {p.features.map((f) => (
                                        <li key={f} className="flex items-start gap-3">
                                            <div className="mt-1 w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                                                <svg
                                                    width="12"
                                                    height="12"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="3"
                                                    viewBox="0 0 24 24"
                                                    className="text-emerald-500"
                                                >
                                                    <path d="M20 6L9 17l-5-5" />
                                                </svg>
                                            </div>
                                            <span
                                                className="text-sm font-medium text-[var(--text-2)]"
                                            >
                                                {f}
                                            </span>
                                        </li>
                                    ))}
                                    {p.locked.map((f) => (
                                        <li key={f} className="flex items-start gap-3 opacity-40">
                                            <div className="mt-1 w-5 h-5 rounded-full bg-[var(--bg-3)] flex items-center justify-center flex-shrink-0">
                                                <svg
                                                    width="12"
                                                    height="12"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="3"
                                                    viewBox="0 0 24 24"
                                                    className="text-[var(--text-3)]"
                                                >
                                                    <rect x="3" y="11" width="18" height="11" rx="2" />
                                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                                </svg>
                                            </div>
                                            <span
                                                className="text-sm font-medium text-[var(--text-3)]"
                                            >
                                                {f}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() =>
                                        p.name === "Free"
                                            ? navigate("/signup")
                                            : setPaymentPlan(p.name.toLowerCase())
                                    }
                                    className="w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-sm hover:shadow-lg"
                                    style={p.btnStyle}
                                >
                                    {p.cta}
                                </motion.button>
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

export default Pricing;
