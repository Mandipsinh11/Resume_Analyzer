import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, ExternalLink, Eye } from "lucide-react";

const templates = [
  { id: 1, name: "Modern Professional", img: "/templates/template1.png", tag: "Most Popular" },
  { id: 2, name: "Executive Suite", img: "/templates/template2.png", tag: "Corporate" },
  { id: 3, name: "Creative Edge", img: "/templates/template3.png", tag: "Designer" },
  { id: 4, name: "Minimalist", img: "/templates/template4.png", tag: "Clean" },
  { id: 5, name: "Tech Lead", img: "/templates/template5.png", tag: "Developer" },
  { id: 6, name: "Bold Impact", img: "/templates/template6.png", tag: "Sales" },
];

const TemplatesSection = () => {
  const ref = useRef(null);
  const navigate = useNavigate();
  const [previewId, setPreviewId] = useState(null);

  const scroll = (dir) =>
    ref.current?.scrollBy({
      left: dir === "left" ? -400 : 400,
      behavior: "smooth",
    });

  const previewTemplate = templates.find((t) => t.id === previewId);

  return (
    <section id="templates" className="py-12 lg:py-16 bg-[var(--bg)] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-end justify-between gap-6 mb-10"
        >
          <div className="max-w-2xl">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-4 bg-blue-50 text-[var(--primary)] border border-blue-100">
              Library
            </span>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-[var(--text)] mb-6">
              ATS-optimized designs <br />
              <span style={{ color: "var(--primary)" }}>that actually get seen</span>
            </h2>
            <p className="text-[var(--text-2)] text-xl font-semibold">
              Choose from our collection of field-tested templates, designed in collaboration with top recruiters.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => scroll("left")}
                className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all bg-[var(--bg)] border border-[var(--border)] text-[var(--text-2)] hover:text-[var(--primary)] hover:border-[var(--primary)] shadow-sm"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => scroll("right")}
                className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all bg-[var(--bg)] border border-[var(--border)] text-[var(--text-2)] hover:text-[var(--primary)] hover:border-[var(--primary)] shadow-sm"
              >
                <ChevronRight size={20} />
              </button>
            </div>
            <button
              onClick={() => navigate("/templates")}
              className="px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-[var(--bg-2)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--bg-3)] transition-all"
            >
              Browse All
            </button>
          </div>
        </motion.div>

        <div
          ref={ref}
          className="flex gap-8 overflow-x-auto scroll-smooth no-scrollbar pb-10"
        >
          {templates.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="min-w-[300px] md:min-w-[340px] rounded-[32px] overflow-hidden bg-[var(--bg-2)] border border-[var(--border)] shadow-lg hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500 group"
            >
              <div className="relative h-[360px] md:h-[400px] overflow-hidden bg-[var(--bg-3)]">
                <img
                  src={t.img}
                  alt={t.name}
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                />

                {/* Overlay actions */}
                <div className="absolute inset-0 bg-blue-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-4 backdrop-blur-[2px]">
                  <button
                    onClick={() => setPreviewId(t.id)}
                    className="w-14 h-14 rounded-full bg-white text-[var(--primary)] flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
                  >
                    <Eye size={24} />
                  </button>
                  <button
                    onClick={() => navigate(`/editor/${t.id}`)}
                    className="px-6 py-3 rounded-xl bg-white text-[var(--primary)] font-black text-xs uppercase tracking-widest shadow-xl hover:scale-110 transition-transform"
                  >
                    Use Template
                  </button>
                </div>

                {t.tag && (
                  <div className="absolute top-6 left-6">
                    <span className="px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-[var(--primary)] shadow-lg">
                      {t.tag}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-6 md:p-8 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-[var(--text)] tracking-tight mb-1">
                    {t.name}
                  </h3>
                  <p className="text-xs font-black uppercase tracking-widest text-[var(--text-3)]">
                    Professional Layout
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center text-[var(--text-3)] group-hover:text-[var(--primary)] group-hover:border-[var(--primary)] transition-colors">
                  <ExternalLink size={18} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {previewId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-blue-900/20 backdrop-blur-md z-[100] flex items-center justify-center p-6"
            onClick={() => setPreviewId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[var(--bg)] rounded-[40px] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all z-10"
                onClick={() => setPreviewId(null)}
              >
                <X size={24} />
              </button>

              <div className="md:w-1/2 h-[400px] md:h-auto overflow-hidden bg-[var(--bg-3)]">
                <img
                  src={previewTemplate?.img}
                  alt={previewTemplate?.name}
                  className="w-full h-full object-cover object-top"
                />
              </div>

              <div className="md:w-1/2 p-12 flex flex-col">
                <span className="text-[var(--primary)] text-[10px] font-black uppercase tracking-[0.3em] mb-4">
                  Preview Mode
                </span>
                <h2 className="text-4xl font-black text-[var(--text)] tracking-tight mb-6">
                  {previewTemplate?.name}
                </h2>
                <div className="flex-1">
                  <p className="text-[var(--text-2)] text-lg mb-8 leading-relaxed">
                    This template prioritizes whitespace and clean typography to ensure your skills and experience stand out to both AI and human recruiters.
                  </p>
                  <ul className="space-y-4 mb-12">
                    {[
                      "Recruiter-approved structure",
                      "Fully ATS-compliant formatting",
                      "Customizable color schemes",
                      "Export as high-quality PDF"
                    ].map(item => (
                      <li key={item} className="flex items-center gap-3 text-[var(--text-2)] font-medium">
                        <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
                          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg>
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col gap-4">
                  <button
                    onClick={() => {
                      navigate(`/editor/${previewId}`);
                      setPreviewId(null);
                    }}
                    className="w-full py-5 rounded-2xl bg-[var(--primary)] text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-[var(--primary-glow)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Start with this Template
                  </button>
                  <button
                    onClick={() => setPreviewId(null)}
                    className="w-full py-5 rounded-2xl bg-[var(--bg-3)] border border-[var(--border)] text-[var(--text)] font-black text-xs uppercase tracking-widest hover:bg-[var(--bg-2)] transition-all"
                  >
                    Keep Browsing
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default TemplatesSection;
