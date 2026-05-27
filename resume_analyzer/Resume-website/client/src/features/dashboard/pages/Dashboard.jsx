import { useMemo, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Layout, FileText, History, Trash2 } from "lucide-react";
import ResumeFeedback from "../../resume-analyzer/ResumeFeedback";
import PaymentModal from "../../../components/ui/PaymentModal";
import {
  getOptimizationHistory,
  clearOptimizationHistory,
  formatRelativeTime,
  formatFileSize,
} from "../../../utils/optimizationHistory";
const Navbar = ({ displayName, onLogout }) => (
  <nav
    className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-6 bg-[var(--bg)]/80 backdrop-blur-xl border-b border-[var(--border)]"
  >
    <div className="max-w-7xl mx-auto flex items-center justify-between">
      <Link to="/" className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-[var(--primary-glow)]"
          style={{
            background: "linear-gradient(135deg, var(--primary), var(--primary-d))",
          }}
        >
          <svg width="16" height="16" fill="none" stroke="white" strokeWidth="3" viewBox="0 0 24 24">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        </div>
        <span className="text-2xl font-black tracking-tighter text-[var(--text)]">
          ATSify<span className="text-[var(--primary)]">.ai</span>
        </span>
      </Link>
      <div className="flex items-center gap-8">
        <div className="hidden md:flex gap-8">
          {[
            { name: "Dashboard", href: "/dashboard" },
            { name: "My Resumes", href: "/my-resumes" },
            { name: "Settings", href: "/settings" },
          ].map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-3)] hover:text-[var(--primary)] transition-colors"
            >
              {item.name}
            </Link>
          ))}
          <button
            type="button"
            onClick={onLogout}
            className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 hover:text-rose-600 transition-colors"
          >
            Log Out
          </button>
        </div>
        <div className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center text-xs font-black text-white shadow-lg shadow-[var(--primary-glow)]">
          {displayName.charAt(0)}
        </div>
      </div>
    </div>
  </nav>
);

const HistoryEntryCard = ({ entry, onSelect, selected }) => (
  <motion.button
    type="button"
    whileHover={{ x: 6 }}
    onClick={() => onSelect(entry)}
    className={`w-full text-left flex items-center justify-between p-6 rounded-3xl border transition-all group ${
      selected
        ? "bg-[var(--primary-glow)]/10 border-[var(--primary)]"
        : "bg-[var(--bg-2)] border-[var(--border)] hover:border-[var(--primary)]"
    }`}
  >
    <div className="flex items-center gap-6 min-w-0">
      <div className="w-12 h-12 rounded-xl bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center text-[var(--primary)] shadow-sm shrink-0">
        <FileText className="w-6 h-6" />
      </div>
      <div className="min-w-0">
        <p className="text-lg font-bold text-[var(--text)] leading-none mb-2 truncate">{entry.fileName}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-black uppercase tracking-widest text-[var(--text-3)]">
          <span>{formatRelativeTime(entry.createdAt)}</span>
          <span className="opacity-20">•</span>
          <span>{formatFileSize(entry.fileSize)}</span>
          {entry.role && (
            <>
              <span className="opacity-20">•</span>
              <span className="truncate max-w-[140px]">{entry.role}</span>
            </>
          )}
        </div>
      </div>
    </div>
    <div className="flex items-center gap-4 shrink-0 ml-4">
      <div className="text-right">
        <p className="text-2xl font-black text-[var(--primary)]">{entry.score ?? "—"}</p>
        <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-3)]">ATS</p>
      </div>
      {entry.scoreAfter != null && (
        <div className="text-right">
          <p className="text-2xl font-black text-emerald-600">{entry.scoreAfter}</p>
          <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-3)]">After fix</p>
        </div>
      )}
      <ArrowRight className="w-5 h-5 text-[var(--text-3)] group-hover:text-[var(--primary)]" />
    </div>
  </motion.button>
);

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [paymentPlan, setPaymentPlan] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const navigate = useNavigate();

  const refreshHistory = useCallback(() => {
    const items = getOptimizationHistory();
    setHistory(items);
    setSelectedHistory((prev) => {
      if (!prev) return null;
      return items.find((e) => e.id === prev.id) || null;
    });
  }, []);
  const displayName = useMemo(() => {
    const r = localStorage.getItem("user");
    if (!r) return "there";
    try {
      const p = JSON.parse(r);
      return p.name || p.username || "there";
    } catch {
      return "there";
    }
  }, []);

  useEffect(() => {
    refreshHistory();
    const onUpdate = () => refreshHistory();
    window.addEventListener("atsify-history-updated", onUpdate);
    return () => window.removeEventListener("atsify-history-updated", onUpdate);
  }, [refreshHistory]);

  const handleClearHistory = () => {
    if (history.length === 0) return;
    if (window.confirm("Clear all optimization history?")) {
      clearOptimizationHistory();
      setSelectedHistory(null);
      refreshHistory();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const tools = [
    {
      title: "Analyze Resume",
      desc: "Upload your resume and get instant color-coded AI feedback.",
      action: "Analyze Now",
      tab: "analyze",
      icon: "🔍",
      accent: "var(--primary-glow)",
      aBorder: "var(--primary)",
      badge: null,
    },
    {
      title: "Create ATS Resume",
      desc: "Build a new ATS-optimized resume from scratch with AI guidance.",
      action: "Start Building",
      tab: null,
      icon: "📄",
      accent: "var(--accent-glow)",
      aBorder: "var(--accent)",
      badge: "Pro",
    },
    {
      title: "Optimization History",
      desc: "Review previous versions and tracking feedback over time.",
      action: "View History",
      tab: "history",
      icon: "🕒",
      accent: "rgba(100, 116, 139, 0.1)",
      aBorder: "var(--border)",
      badge: null,
    },
  ];

  const iV = {
    hidden: { opacity: 0, y: 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
    },
  };
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "analyze", label: "Analyze Resume" },
    { id: "history", label: "History" },
    { id: "resumes", label: "My Resumes" },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] pb-24 overflow-x-hidden">
      {/* Background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[60%] h-[60%] rounded-full opacity-20 blur-[140px]"
          style={{ background: "radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 left-0 w-[40%] h-[40%] rounded-full opacity-10 blur-[120px]"
          style={{ background: "radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)" }} />
      </div>

      <Navbar displayName={displayName} onLogout={handleLogout} />

      <motion.main
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
        className="relative z-10 pt-40 px-6 md:px-12 max-w-7xl mx-auto"
      >
        <header className="mb-16">
          <motion.div
            variants={iV}
            className="inline-flex items-center gap-3 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 bg-[var(--bg-3)] border border-[var(--border)] shadow-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 rounded-full animate-ping bg-emerald-400 opacity-40" />
              <span className="relative block h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-[var(--text-2)]">Neural Engine Online</span>
          </motion.div>

          <div className="flex flex-col md:flex-row items-end justify-between gap-10">
            <div>
              <motion.h1
                variants={iV}
                className="text-5xl md:text-7xl font-black tracking-tight leading-[0.9] text-[var(--text)] mb-6"
              >
                Welcome back, <br />
                <span className="text-[var(--primary)]">{displayName}.</span>
              </motion.h1>
              <motion.p
                variants={iV}
                className="text-xl font-medium text-[var(--text-3)] leading-relaxed max-w-lg"
              >
                Your AI-powered career stack is optimized and ready for deployment.
              </motion.p>
            </div>

            <motion.div
              variants={iV}
              className="flex bg-[var(--bg-2)] p-2 rounded-2xl border border-[var(--border)] shadow-sm"
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === tab.id
                    ? "bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary-glow)]"
                    : "text-[var(--text-3)] hover:text-[var(--text)]"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </motion.div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="space-y-16"
            >
              {/* Tools Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {tools.map((tool) => (
                  <motion.div
                    key={tool.title}
                    variants={iV}
                    onClick={() => tool.tab && setActiveTab(tool.tab)}
                    className="group relative p-10 rounded-[40px] bg-[var(--bg-2)] border border-[var(--border)] overflow-hidden transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] cursor-pointer"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 opacity-10 bg-gradient-to-br from-white to-transparent blur-2xl group-hover:opacity-20 transition-opacity" />

                    <div className="flex items-start justify-between mb-8">
                      <div className="w-16 h-16 rounded-[24px] bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform">
                        {tool.icon}
                      </div>
                      {tool.badge && (
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full bg-[var(--accent-glow)] border border-[var(--accent)] text-[var(--accent)] shadow-sm">
                          {tool.badge}
                        </span>
                      )}
                    </div>

                    <h2 className="text-2xl font-black tracking-tight text-[var(--text)] mb-4">
                      {tool.title}
                    </h2>
                    <p className="text-base font-medium text-[var(--text-3)] leading-relaxed mb-10">
                      {tool.desc}
                    </p>

                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--primary)] group-hover:gap-5 transition-all">
                      {tool.action}
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pro Section Banner */}
              <motion.div
                variants={iV}
                className="p-12 rounded-[48px] relative overflow-hidden bg-white shadow-2xl shadow-[var(--primary-glow)] border border-[var(--border)]"
              >
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[var(--primary-glow)] to-transparent opacity-10" />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                  <div className="max-w-xl text-center md:text-left">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--primary)] mb-4 block">Engine Upgrade Available</span>
                    <h3 className="text-4xl font-black text-[var(--text)] tracking-tight mb-4">
                      Unlock the <span className="text-[var(--primary)] text-5xl">Apex</span> Tier.
                    </h3>
                    <p className="text-lg font-medium text-[var(--text-3)] leading-relaxed">
                      Transform your career with unlimited AI rewrites, premium PDF exports, and one-on-one strategy reports.
                    </p>
                  </div>
                  <div className="flex gap-4 flex-wrap justify-center">
                    <button
                      onClick={() => setPaymentPlan("pro")}
                      className="px-10 py-5 rounded-2xl bg-[var(--primary)] text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-[var(--primary-glow)] hover:scale-105 active:scale-95 transition-all"
                    >
                      Go Pro Now
                    </button>
                    <button
                      onClick={() => setPaymentPlan("basic")}
                      className="px-10 py-5 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] font-black text-xs uppercase tracking-[0.2em] hover:bg-[var(--bg-2)] transition-all"
                    >
                      View Plans
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Recent Documents Table */}
              <motion.div variants={iV} className="pt-10 border-t border-[var(--border)]">
                <div className="flex items-center justify-between mb-10">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-3)]">
                    System History
                  </h3>
                  <button
                    type="button"
                    onClick={handleClearHistory}
                    disabled={history.length === 0}
                    className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--primary)] hover:underline disabled:opacity-40"
                  >
                    Clear Logs
                  </button>
                </div>

                {history.length === 0 ? (
                  <div className="py-16 text-center rounded-3xl border-2 border-dashed border-[var(--border)] bg-[var(--bg-2)]">
                    <History className="w-10 h-10 mx-auto mb-4 text-[var(--text-3)] opacity-40" />
                    <p className="text-lg font-bold text-[var(--text)] mb-2">No optimization history yet</p>
                    <p className="text-sm font-medium text-[var(--text-3)] mb-8">
                      Run an analysis on the Analyze Resume tab — it will appear here automatically.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab("analyze")}
                      className="px-8 py-4 rounded-2xl bg-[var(--primary)] text-white font-black text-xs uppercase tracking-[0.2em]"
                    >
                      Analyze Resume
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {history.slice(0, 5).map((entry) => (
                      <HistoryEntryCard
                        key={entry.id}
                        entry={entry}
                        selected={selectedHistory?.id === entry.id}
                        onSelect={(e) => {
                          setSelectedHistory(e);
                          setActiveTab("history");
                        }}
                      />
                    ))}
                    {history.length > 5 && (
                      <button
                        type="button"
                        onClick={() => setActiveTab("history")}
                        className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--primary)] py-2"
                      >
                        View all {history.length} entries →
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}

          {activeTab === "analyze" && (
            <motion.div
              key="analyze"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-10">
                <div>
                  <h2 className="text-4xl font-black tracking-tight text-[var(--text)] mb-3">
                    Neural Analyzer
                  </h2>
                  <p className="text-lg font-medium text-[var(--text-3)]">
                    Real-time keyword extraction and ATS compatibility scoring.
                  </p>
                </div>
                <div className="flex gap-6">
                  {[
                    { label: "Elite", color: "var(--primary)" },
                    { label: "Standard", color: "var(--accent)" },
                    { label: "Low", color: "rose-500" }
                  ].map((status) => (
                    <div key={status.label} className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: status.color }} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-3)]">{status.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <ResumeFeedback />
            </motion.div>
          )}

          {activeTab === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <h2 className="text-4xl font-black tracking-tight text-[var(--text)] mb-3">
                    Optimization History
                  </h2>
                  <p className="text-lg font-medium text-[var(--text-3)]">
                    Every analysis and AI fix is saved on this device.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClearHistory}
                  disabled={history.length === 0}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl border border-[var(--border)] text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 hover:bg-rose-50 disabled:opacity-40"
                >
                  <Trash2 className="w-4 h-4" /> Clear all
                </button>
              </div>

              {history.length === 0 ? (
                <div className="py-24 text-center rounded-[40px] border-2 border-dashed border-[var(--border)] bg-[var(--bg-2)]">
                  <History className="w-12 h-12 mx-auto mb-6 text-[var(--text-3)] opacity-40" />
                  <h3 className="text-2xl font-black text-[var(--text)] mb-3">No history yet</h3>
                  <p className="text-[var(--text-3)] font-medium mb-10 max-w-md mx-auto">
                    Complete at least one resume analysis to build your optimization timeline.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("analyze")}
                    className="px-10 py-5 rounded-2xl bg-[var(--primary)] text-white font-black text-xs uppercase tracking-[0.2em]"
                  >
                    Start first analysis
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    {history.map((entry) => (
                      <HistoryEntryCard
                        key={entry.id}
                        entry={entry}
                        selected={selectedHistory?.id === entry.id}
                        onSelect={setSelectedHistory}
                      />
                    ))}
                  </div>

                  <div className="p-8 rounded-[32px] bg-[var(--bg-2)] border border-[var(--border)] min-h-[320px]">
                    {!selectedHistory ? (
                      <p className="text-[var(--text-3)] font-medium text-center py-20">
                        Select an entry to view details
                      </p>
                    ) : (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-xl font-black text-[var(--text)] mb-1">{selectedHistory.fileName}</h3>
                          <p className="text-sm text-[var(--text-3)]">{formatRelativeTime(selectedHistory.createdAt)}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)]">
                            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-3)] mb-1">Role</p>
                            <p className="font-bold text-[var(--text)]">{selectedHistory.role || "—"}</p>
                          </div>
                          <div className="p-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)]">
                            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-3)] mb-1">ATS score</p>
                            <p className="font-black text-2xl text-[var(--primary)]">{selectedHistory.score ?? "—"}</p>
                          </div>
                        </div>
                        {selectedHistory.feedback?.improve?.items?.length > 0 && (
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-3)] mb-3">Top gaps</p>
                            <ul className="space-y-2 text-sm font-medium text-[var(--text-2)]">
                              {selectedHistory.feedback.improve.items.slice(0, 4).map((item, i) => (
                                <li key={i}>• {item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {selectedHistory.fixedResumeData?.improvements?.length > 0 && (
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-3">AI fixes applied</p>
                            <ul className="space-y-2 text-sm font-medium text-emerald-800">
                              {selectedHistory.fixedResumeData.improvements.slice(0, 4).map((item, i) => (
                                <li key={i}>✓ {item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "resumes" && (
            <motion.div
              key="resumes"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-10"
            >
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-center">
                  <div className="w-24 h-24 rounded-[32px] bg-[var(--bg-2)] border-2 border-dashed border-[var(--border)] flex items-center justify-center mb-10">
                    <Layout className="w-10 h-10 text-[var(--text-3)] opacity-40" />
                  </div>
                  <h3 className="text-3xl font-black tracking-tight text-[var(--text)] mb-4">No archives found</h3>
                  <p className="text-lg font-medium text-[var(--text-3)] max-w-sm mb-12">
                    Begin your first analysis to see your history and saved drafts appear here.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("analyze")}
                    className="px-10 py-5 rounded-2xl bg-[var(--primary)] text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-[var(--primary-glow)] hover:scale-105 active:scale-95 transition-all"
                  >
                    Launch Analyzer
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <h2 className="text-4xl font-black tracking-tight text-[var(--text)] mb-3">My Resumes</h2>
                    <p className="text-lg font-medium text-[var(--text-3)]">
                      Resumes you have analyzed on this device ({history.length})
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {history.map((entry) => (
                      <HistoryEntryCard
                        key={entry.id}
                        entry={entry}
                        selected={false}
                        onSelect={() => {
                          setSelectedHistory(entry);
                          setActiveTab("history");
                        }}
                      />
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.main>

      <AnimatePresence>
        {paymentPlan && (
          <PaymentModal plan={paymentPlan} onClose={() => setPaymentPlan(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardPage;
