import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const CTA = () => {
  const navigate = useNavigate();
  return (
    <section className="py-28 relative overflow-hidden" style={{ background: "var(--bg)" }}>
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-[48px] p-12 md:p-24 text-center border border-[var(--border)] shadow-2xl shadow-blue-500/[0.04]"
          style={{ background: "var(--bg-2)" }}
        >
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[var(--primary-glow)] to-transparent rounded-full blur-[140px] opacity-30 -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[var(--secondary)] to-transparent rounded-full blur-[140px] opacity-20 translate-y-1/2 -translate-x-1/4" />

          <div className="relative z-10 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-3 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-10 border border-blue-100 bg-blue-50 text-[var(--primary)]"
            >
              <span className="w-2 h-2 bg-[var(--primary)] rounded-full animate-pulse" />
              Join 10,000+ candidates getting hired this month
            </motion.div>

            <h2 className="text-4xl md:text-7xl font-black tracking-tight text-[var(--text)] mb-8 leading-[0.95]">
              Stop being filtered out. <br />
              <span style={{ color: "var(--primary)" }}>Start getting hired.</span>
            </h2>

            <p className="text-xl md:text-2xl font-semibold text-[var(--text-3)] mb-14 max-w-2xl mx-auto leading-relaxed">
              Thousands of job seekers use ATSify to bypass filters and land interviews at top-tier companies.
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-20">
              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/login")}
                className="group relative px-12 py-6 rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-2xl shadow-blue-500/20 transition-all overflow-hidden"
                style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-d))" }}
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10">Get Started for Free</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/pricing")}
                className="px-12 py-6 rounded-2xl font-black text-xs uppercase tracking-widest text-[var(--text)] border border-[var(--border)] bg-white hover:bg-[var(--bg-3)] transition-all shadow-sm hover:shadow-lg"
              >
                Review Plans
              </motion.button>
            </div>

            <div className="pt-12 border-t border-[var(--border)]">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-3)] mb-8">
                Trusted by candidates at
              </p>
              <div className="flex flex-wrap justify-center gap-x-12 gap-y-8 opacity-40 grayscale group-hover:grayscale-0 transition-all duration-500">
                {["Meta", "Google", "Amazon", "Netflix", "Apple", "Stripe", "Spotify", "Airbnb"].map((n) => (
                  <motion.span
                    key={n}
                    whileHover={{ scale: 1.15, color: "var(--primary)" }}
                    className="text-lg font-black tracking-tighter text-[var(--text-3)] transition-all cursor-default"
                  >
                    {n}
                  </motion.span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
