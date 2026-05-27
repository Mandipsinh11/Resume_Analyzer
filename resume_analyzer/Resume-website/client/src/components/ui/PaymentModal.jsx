import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";


const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) { resolve(true); return; }
    const s = document.createElement("script");
    s.id = "razorpay-script";
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

const PLAN_INFO = {
  free: {
    name: "free",
    price: 0,
    period: "/month",
    color: "#3b82f6",
    gradient: "linear-gradient(135deg, #1d4ed8, #2563eb)",
    glow: "rgba(37,99,235,0.3)",
    features: [
      "Resume upload & instant ATS score","AI keyword detection overview","Structural resume analysis","Section-by-section grade summary",
    ],
  },
  basic: {
    name: "Basic",
    price: 2.99,
    period: "/month",
    color: "#3b82f6",
    gradient: "linear-gradient(135deg, #1d4ed8, #2563eb)",
    glow: "rgba(37,99,235,0.3)",
    features: [
      "Complete color-coded feedback report",
      "1 ATS-optimized resume download",
      "1 AI cover letter per month",
      "Email support",
    ],
  },
  pro: {
    name: "Pro",
    price: 6.99,
    period: "/month",
    color: "#f59e0b",
    gradient: "linear-gradient(135deg, #d97706, #f59e0b)",
    glow: "rgba(245,158,11,0.3)",
    features: [
      "Everything in Basic — unlimited",
      "Job description match scoring",
      "Unlimited resume versions",
      "AI interview prep questions",
      "LinkedIn optimization tips",
      "Priority support",
    ],
  },
};

const PAYMENT_MODES = [
  {
    id: "upi",
    label: "UPI",
    icon: (
      <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="12" fill="rgba(99,102,241,0.15)" />
        <path d="M24 10L34 24L24 38L14 24L24 10Z" fill="#6366f1" />
        <path d="M24 18L30 24L24 30L18 24L24 18Z" fill="white" />
      </svg>
    ),
    desc: "Pay via any UPI app",
    rzpMethod: "upi",
  },
  {
    id: "card",
    label: "Card",
    icon: (
      <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="12" fill="rgba(59,130,246,0.15)" />
        <rect x="8" y="14" width="32" height="20" rx="4" fill="#3b82f6" />
        <rect x="8" y="20" width="32" height="6" fill="#1d4ed8" />
        <rect x="12" y="27" width="8" height="3" rx="1" fill="white" opacity="0.7" />
      </svg>
    ),
    desc: "Credit / Debit card",
    rzpMethod: "card",
  },
  {
    id: "netbanking",
    label: "Net Banking",
    icon: (
      <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="12" fill="rgba(16,185,129,0.15)" />
        <rect x="10" y="22" width="28" height="16" rx="2" fill="#10b981" />
        <path d="M24 10L38 22H10L24 10Z" fill="#059669" />
        <rect x="19" y="27" width="4" height="8" fill="white" opacity="0.8" />
        <rect x="25" y="27" width="4" height="8" fill="white" opacity="0.8" />
      </svg>
    ),
    desc: "Any bank account",
    rzpMethod: "netbanking",
  },
  {
    id: "qr",
    label: "QR Code",
    icon: (
      <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="12" fill="rgba(245,158,11,0.15)" />
        <rect x="10" y="10" width="12" height="12" rx="2" fill="#f59e0b" />
        <rect x="13" y="13" width="6" height="6" fill="#0a0d18" />
        <rect x="26" y="10" width="12" height="12" rx="2" fill="#f59e0b" />
        <rect x="29" y="13" width="6" height="6" fill="#0a0d18" />
        <rect x="10" y="26" width="12" height="12" rx="2" fill="#f59e0b" />
        <rect x="13" y="29" width="6" height="6" fill="#0a0d18" />
        <rect x="26" y="26" width="5" height="5" rx="1" fill="#f59e0b" />
        <rect x="33" y="26" width="5" height="5" rx="1" fill="#f59e0b" />
        <rect x="26" y="33" width="5" height="5" rx="1" fill="#f59e0b" />
        <rect x="33" y="33" width="5" height="5" rx="1" fill="#f59e0b" />
      </svg>
    ),
    desc: "Scan & pay instantly",
    rzpMethod: "upi",
    upiQr: true,
  },
];

const PaymentModal = ({ plan, onClose, onSuccess }) => {
  const [selectedMode, setSelectedMode] = useState(null);
  const [loading, setLoading] = useState(false);
  const p = PLAN_INFO[plan] || PLAN_INFO.basic;
  const [rate, setRate] = useState(null);
  const [currency, setCurrency] = useState(null);
  const FX_KEY = "fxCache_ipapi_v1";
  const FX_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
  const FX_COOLDOWN_MS = 2 * 60 * 1000; // 2 min cooldown if ipapi rate-limits
  const convertedPrice =
  currency && rate !== null
    ? Number((p.price * rate).toFixed(2))
    : null;

  useEffect(() => {
    const cached = JSON.parse(sessionStorage.getItem(FX_KEY) || "null");
    if (cached && Date.now() - cached.t < FX_TTL_MS) {
      setCurrency(cached.c);
      setRate(cached.r);
      return;
    }
    (async () => {
      try {
        const lastAttempt = Number(sessionStorage.getItem(`${FX_KEY}_lastAttempt`) || "0");
        if (lastAttempt && Date.now() - lastAttempt < FX_COOLDOWN_MS) {
          setCurrency("USD");
          setRate(1);
          return;
        }
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

  const handlePay = async () => {
    if (loading) return;
    if (!selectedMode) return;
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first to upgrade your plan!");
      window.location.href = "/login";
      return;
    }
    setLoading(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert("Failed to load payment gateway. Check your internet connection.");
        setLoading(false);
        return;
      }
      const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";
      const { data } = await axios.post(
        `${apiUrl}/api/payment/create-order`,
        { plan, currency },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const mode = PAYMENT_MODES.find((m) => m.id === selectedMode);
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "ATSify",
        description: data.planName,
        image: "/vite.svg",
        order_id: data.orderId,
        method: mode?.rzpMethod,
        ...(mode?.upiQr ? { flow: "qr" } : {}),
        handler: async (response) => {
          try {
            const verifyRes = await axios.post(
              `${apiUrl}/api/payment/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (verifyRes.data.success) {
              onClose();
              if (onSuccess) onSuccess(plan);
              else {
                alert(`🎉 Payment successful! ${p.name} plan activated.`);
                window.location.href = "/dashboard";
              }
            }
          } catch (err) {
            alert(`Payment verification failed: ${err.response?.data?.message || "Network error"}`);
          }
          setLoading(false);
        },
        prefill: {},
        theme: { color: plan === "pro" ? "#f59e0b" : "#2563eb" },
        modal: { ondismiss: () => setLoading(false) },
      };
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (r) => {
        alert(`Payment failed: ${r.error.description}`);
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      alert(`Order creation failed: ${err.response?.data?.message || "Network error"}`);
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 20 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className="w-full max-w-lg rounded-3xl overflow-hidden"
        style={{ background: "#0a0d18", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        {/* Header */}
        <div
          className="px-7 pt-7 pb-5 relative"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ background: "rgba(255,255,255,0.06)", color: "#94a3b8" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
          >
            ✕
          </button>
          <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: p.color }}>
            Upgrade to {p.name}
          </p>
          <div className="flex items-baseline gap-1">
            {convertedPrice !== null && currency && (
  <span className="text-4xl font-black text-white">
    {new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency,
    }).format(convertedPrice)}
  </span>
)}
            <span className="text-sm" style={{ color: "#475569" }}>{p.period}</span>
          </div>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
            {p.features.slice(0, 3).map((f) => (
              <li key={f} className="flex items-center gap-1.5 text-xs" style={{ color: "#64748b" }}>
                <svg width="10" height="10" fill="none" stroke="#22c55e" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Payment Mode Selection */}
        <div className="px-7 py-6">
          <p className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: "#334155" }}>
            Choose Payment Method
          </p>
          <div className="grid grid-cols-2 gap-3">
            {PAYMENT_MODES.map((mode) => {
              const active = selectedMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => setSelectedMode(mode.id)}
                  className="flex items-center gap-3 p-4 rounded-2xl text-left transition-all"
                  style={{
                    background: active ? "rgba(37,99,235,0.1)" : "rgba(255,255,255,0.03)",
                    border: active ? `1px solid ${p.color}` : "1px solid rgba(255,255,255,0.07)",
                    boxShadow: active ? `0 0 16px ${p.glow}40` : "none",
                  }}
                >
                  {mode.icon}
                  <div>
                    <p className="text-sm font-black text-white">{mode.label}</p>
                    <p className="text-[10px]" style={{ color: "#475569" }}>{mode.desc}</p>
                  </div>
                  {active && (
                    <div
                      className="ml-auto w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: p.color }}
                    >
                      <svg width="8" height="8" fill="none" stroke="white" strokeWidth="3" viewBox="0 0 24 24">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Pay Button */}
        <div className="px-7 pb-7">
          <button
            onClick={handlePay}
            disabled={!selectedMode || loading}
            className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: selectedMode ? p.gradient : "rgba(255,255,255,0.05)",
              color: plan === "pro" ? "#000" : "#fff",
              boxShadow: selectedMode ? `0 0 24px ${p.glow}` : "none",
            }}
          >
            {loading
              ? "Processing..."
              : selectedMode
              ? `Pay ${new Intl.NumberFormat(undefined,{
  style:"currency",
  currency: currency || "USD"
}).format(convertedPrice)} via ${PAYMENT_MODES.find((m)=>m.id===selectedMode)?.label}`
              : "Select a Payment Method"}
          </button>
          <p className="text-center text-[10px] mt-3" style={{ color: "#334155" }}>
            Secured by Razorpay · Cancel anytime · 256-bit SSL
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PaymentModal;
