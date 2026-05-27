import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqData = [
  { id: 1, q: "What is an ATS-friendly resume?", a: "An ATS-friendly resume is structured so that automated screening software can read and rank it correctly. Without this, your application may never reach a human recruiter — no matter how qualified you are." },
  { id: 5, q: "What resume formats work best with ATS?", a: "Simple layouts, standard fonts, and clear section headings. Chronological resumes work best because they follow a logical flow that ATS systems can parse reliably. All ATSify templates are pre-optimized for this." },
  { id: 6, q: "Does an ATS-optimized resume still look good to humans?", a: "Absolutely. All of ATSify's templates are both machine-readable and visually polished. Passing the ATS filter and impressing a human recruiter are not mutually exclusive." },
];

export default function FAQ() {
  const [openId, setOpenId] = useState(1);
  return (
    <section id="faq" className="py-32 px-6 relative overflow-hidden" style={{ background: "#07080c" }}>
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-100 h-125 pointer-events-none rounded-full opacity-10"
        style={{ background: "radial-gradient(ellipse, rgba(59,130,246,0.3) 0%, transparent 70%)" }} />

      <div className="max-w-3xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-5"
            style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", color: "#93c5fd" }}>FAQ</span>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-[-0.04em] leading-tight">
            Questions we get
            <br />
            <span style={{ color: "#3b82f6" }}>asked all the time.</span>
          </h2>
        </motion.div>

        <div className="space-y-2">
          {faqData.map((f, i) => (
            <motion.div key={f.id} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
              className="rounded-2xl overflow-hidden transition-all duration-300"
              style={{ background: openId === f.id ? "#0c0e15" : "rgba(12,14,21,0.5)", border: openId === f.id ? "1px solid rgba(59,130,246,0.2)" : "1px solid rgba(255,255,255,0.06)" }}>
              <button className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                onClick={() => setOpenId(openId === f.id ? null : f.id)}>
                <span className="font-bold text-sm md:text-base transition-colors" style={{ color: openId === f.id ? "#f1f5f9" : "#94a3b8" }}>{f.q}</span>
                <motion.div animate={{ rotate: openId === f.id ? 45 : 0 }} transition={{ duration: 0.2 }}
                  className="shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-all"
                  style={{ background: openId === f.id ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.06)", color: openId === f.id ? "#60a5fa" : "#475569" }}>
                  <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
                </motion.div>
              </button>
              <AnimatePresence>
                {openId === f.id && (
                  <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    className="px-6 pb-5 text-sm leading-relaxed font-medium" style={{ color: "#64748b" }}>{f.a}</motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
