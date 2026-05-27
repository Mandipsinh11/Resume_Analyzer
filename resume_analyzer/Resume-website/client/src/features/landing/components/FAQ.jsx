import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqData = [
  { id: 1, q: "What is an ATS-friendly resume?", a: "An ATS-friendly resume is structured so that automated screening software can read and rank it correctly. Without this, your application may never reach a human recruiter — no matter how qualified you are." },
  { id: 2, q: "What does the Free plan include?", a: "Free users get a complete ATS compatibility score, an AI keyword detection overview, structural analysis across every section, and a grade summary — enough to understand where you stand before committing." },
  { id: 3, q: "What does Basic ($2.99/mo) unlock?", a: "Basic unlocks your complete color-coded AI feedback report, one ATS-optimized resume download per month, and one AI-generated cover letter per month. Cancel anytime." },
  { id: 4, q: "What does Pro ($6.99/mo) include?", a: "Pro gives you everything in Basic without limits, plus job description match scoring, unlimited resume versions, AI interview prep questions, LinkedIn optimization tips, and priority support." },
  { id: 5, q: "What resume formats work best with ATS?", a: "Simple layouts, standard fonts, and clear section headings. Chronological resumes work best because they follow a logical flow that ATS systems can parse reliably. All ATSify templates are pre-optimized for this." },
  { id: 6, q: "Does an ATS-optimized resume still look good to humans?", a: "Absolutely. All of ATSify's templates are both machine-readable and visually polished. Passing the ATS filter and impressing a human recruiter are not mutually exclusive." },
];

export default function FAQ() {
  const [openId, setOpenId] = useState(1);
  return (
    <section id="faq" className="py-32 relative overflow-hidden" style={{ background: "var(--bg)" }}>
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none rounded-full blur-[120px] opacity-10"
        style={{ background: "radial-gradient(ellipse, var(--primary) 0%, transparent 70%)" }} />

      <div className="max-w-3xl mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[var(--primary)] text-sm font-black uppercase tracking-[0.3em] mb-4"
          >
            Support
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black tracking-tight text-[var(--text)] mb-6 leading-tight"
          >
            Questions we get <br />
            <span style={{ color: "var(--primary)" }}>Asked all the time</span>
          </motion.h2>
        </div>

        <div className="space-y-4">
          {faqData.map((f, i) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="rounded-[24px] overflow-hidden transition-all duration-300"
              style={{
                background: openId === f.id ? "var(--bg-2)" : "var(--bg)",
                border: openId === f.id ? "1px solid var(--primary-glow)" : "1px solid var(--border)",
                boxShadow: openId === f.id ? "0 20px 40px -12px rgba(59, 130, 246, 0.08)" : "none",
              }}
            >
              <button
                className="w-full flex items-center justify-between gap-4 px-8 py-7 text-left"
                onClick={() => setOpenId(openId === f.id ? null : f.id)}
              >
                <span className="font-bold text-base md:text-lg transition-colors text-[var(--text)]">
                  {f.q}
                </span>
                <motion.div
                  animate={{ rotate: openId === f.id ? 45 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all"
                  style={{
                    background: openId === f.id ? "var(--primary)" : "var(--bg-3)",
                    color: openId === f.id ? "#fff" : "var(--text-3)",
                  }}
                >
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </motion.div>
              </button>
              <AnimatePresence>
                {openId === f.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <p className="px-6 pb-6 text-sm md:text-base leading-relaxed font-medium text-[var(--text-2)]">
                      {f.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
