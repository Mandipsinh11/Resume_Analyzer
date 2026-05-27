import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import axios from "axios";
import {
    Briefcase,
    FileText,
    Search,
    CheckCircle,
    AlertCircle,
    ArrowRight,
    Copy,
    Download,
    Layout,
    Target,
    Zap
} from "lucide-react";

const Navbar = () => {
    const userStr = localStorage.getItem("user");
    const displayName = userStr ? JSON.parse(userStr).name : "User";

    return (
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
                    <Link to="/dashboard" className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-3)] hover:text-[var(--primary)] transition-colors">
                        Dashboard
                    </Link>
                    <div className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center text-xs font-black text-white shadow-lg shadow-[var(--primary-glow)]">
                        {displayName.charAt(0)}
                    </div>
                </div>
            </div>
        </nav>
    );
};

const ResumeAnalyzer = () => {
    const [role, setRole] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);

    const handleAnalyze = async () => {
        if (!role) {
            setError("Please specify the target job role.");
            return;
        }
        setError(null);
        setLoading(true);
        setResults(null);

        try {
            const token = localStorage.getItem("token");
            const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";
            const response = await axios.post(
                `${apiUrl}/api/resume/analyze`,
                { role, jobDescription },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setResults(response.data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to analyze resume. Please ensure you have uploaded a resume first.");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        // Could add a toast here
    };

    const iV = {
        hidden: { opacity: 0, y: 14 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
    };

    return (
        <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] pb-20 overflow-x-hidden">
            {/* Background elements */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[60%] h-[60%] rounded-full opacity-20 blur-[140px]"
                    style={{ background: "radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)" }} />
                <div className="absolute bottom-0 left-0 w-[40%] h-[40%] rounded-full opacity-10 blur-[120px]"
                    style={{ background: "radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)" }} />
            </div>

            <Navbar />

            <motion.main
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
                className="relative z-10 pt-40 px-6 md:px-12 max-w-7xl mx-auto"
            >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Left Column: Input Form */}
                    <div className="lg:col-span-4 space-y-10">
                        <motion.div variants={iV}>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                                ATS <span style={{ color: "var(--primary)" }}>Optimizer</span>
                            </h1>
                            <p className="text-[var(--text-2)] text-lg font-medium leading-relaxed">
                                Tailor your resume to any job description using our elite AI engine.
                            </p>
                        </motion.div>

                        <motion.div
                            variants={iV}
                            className="p-8 rounded-[32px] bg-[var(--bg-2)] border border-[var(--border)] shadow-xl"
                        >
                            <div className="space-y-8">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-3)] mb-4 block">
                                        Target Job Role
                                    </label>
                                    <div className="relative group">
                                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-3)] group-focus-within:text-[var(--primary)] transition-colors" />
                                        <input
                                            type="text"
                                            placeholder="e.g. Senior Product Designer"
                                            value={role}
                                            onChange={(e) => setRole(e.target.value)}
                                            className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-2xl py-4 pl-12 pr-6 text-sm md:text-base font-medium focus:outline-none focus:border-[var(--primary)] shadow-sm transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-3)] mb-4 block">
                                        Job Description (Highly Recommended)
                                    </label>
                                    <textarea
                                        placeholder="Paste the job description here for hyper-accurate keyword matching..."
                                        value={jobDescription}
                                        onChange={(e) => setJobDescription(e.target.value)}
                                        rows={10}
                                        className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-2xl p-6 text-sm md:text-base font-medium focus:outline-none focus:border-[var(--primary)] shadow-sm transition-all resize-none leading-relaxed"
                                    />
                                </div>

                                {error && (
                                    <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold flex items-start gap-3 shadow-sm">
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        {error}
                                    </div>
                                )}

                                <button
                                    onClick={handleAnalyze}
                                    disabled={loading}
                                    className="w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] text-white shadow-xl shadow-[var(--primary-glow)]"
                                    style={{
                                        background: "linear-gradient(135deg, var(--primary), var(--primary-d))",
                                    }}
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            Optimize My Resume <Zap className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Results */}
                    <div className="lg:col-span-8">
                        <AnimatePresence mode="wait">
                            {!results && !loading && (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="h-full min-h-[600px] flex flex-col items-center justify-center text-center p-12 rounded-[40px] bg-[var(--bg-2)] border-2 border-dashed border-[var(--border)] group"
                                >
                                    <div className="w-24 h-24 rounded-[32px] bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform duration-500">
                                        <Search className="w-10 h-10 text-[var(--primary)] opacity-40" />
                                    </div>
                                    <h3 className="text-2xl font-black mb-4 text-[var(--text)] tracking-tight">Ready for analysis</h3>
                                    <p className="text-[var(--text-2)] text-lg font-medium max-w-sm mx-auto leading-relaxed">
                                        Paste the job details and let our AI transform your resume into a top-tier application.
                                    </p>
                                </motion.div>
                            )}

                            {loading && (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="h-full min-h-[600px] flex flex-col items-center justify-center p-12 rounded-[40px] bg-[var(--bg-2)] border border-[var(--border)]"
                                >
                                    <div className="relative w-32 h-32 mb-10">
                                        <div className="absolute inset-0 border-[6px] border-[var(--primary-glow)] rounded-full opacity-20" />
                                        <motion.div
                                            className="absolute inset-0 border-[6px] border-transparent border-t-[var(--primary)] rounded-full"
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                                        />
                                    </div>
                                    <h3 className="text-3xl font-black tracking-tight mb-4">Analyzing with AI</h3>
                                    <p className="text-[var(--primary)] text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">
                                        Scanning Keywords • Calculating Score • Rewriting Draft
                                    </p>
                                </motion.div>
                            )}

                            {results && (
                                <motion.div
                                    key="results"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-8"
                                >
                                    {/* Score & Highlights */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                        <div className="md:col-span-1 p-8 rounded-[32px] bg-[var(--bg-2)] border border-[var(--border)] flex flex-col items-center justify-center text-center shadow-lg">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-3)] mb-6">ATS Index</span>
                                            <div className="relative w-28 h-28 flex items-center justify-center">
                                                <svg className="w-full h-full transform -rotate-90">
                                                    <circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-[var(--bg-3)]" />
                                                    <circle
                                                        cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="10" fill="transparent"
                                                        style={{
                                                            color: "var(--primary)",
                                                            strokeDasharray: 301.6,
                                                            strokeDashoffset: 301.6 - (301.6 * results.atsScore) / 100,
                                                            strokeLinecap: "round",
                                                            transition: "stroke-dashoffset 1.5s cubic-bezier(0.22, 1, 0.36, 1)"
                                                        }}
                                                    />
                                                </svg>
                                                <span className="absolute text-4xl font-black tracking-tighter text-[var(--text)]">{results.atsScore}</span>
                                            </div>
                                        </div>

                                        <div className="md:col-span-3 p-8 rounded-[32px] border shadow-lg relative overflow-hidden flex flex-col justify-center"
                                            style={{ background: "var(--bg-2)", borderColor: "var(--primary-glow)" }}>
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[var(--primary-glow)] to-transparent opacity-20 -mr-20 -mt-20 rounded-full blur-3xl" />

                                            <h4 className="flex items-center gap-3 text-[var(--primary)] text-[10px] font-black uppercase tracking-[0.3em] mb-6 relative z-10">
                                                <CheckCircle className="w-4 h-4" /> Optimization Roadmap
                                            </h4>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 relative z-10">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-3)]">Missing Keywords</p>
                                                    <p className="text-3xl font-black text-[var(--text)]">{results.missingKeywords?.length || 0}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-3)]">Critical Issues</p>
                                                    <p className="text-3xl font-black text-rose-500">{results.issues?.length || 0}</p>
                                                </div>
                                                <div className="hidden md:block space-y-1">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-3)]">Status</p>
                                                    <p className="text-xl font-bold text-emerald-500">{results.atsScore > 80 ? "Premium" : "Needs Work"}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Feedback Tabs */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="p-8 rounded-[32px] bg-[var(--bg-2)] border border-[var(--border)] shadow-md">
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--accent)] mb-6 flex items-center gap-3">
                                                <Search className="w-4 h-4" /> Priority Keywords
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {results.missingKeywords?.map((kw, i) => (
                                                    <span key={i} className="px-4 py-2 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[10px] font-black uppercase text-[var(--text-2)] hover:border-[var(--primary)] transition-colors cursor-default">
                                                        {kw}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="p-8 rounded-[32px] bg-[var(--bg-2)] border border-[var(--border)] shadow-md">
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-3)] mb-6 flex items-center gap-3">
                                                <AlertCircle className="w-4 h-4" /> AI Suggestions
                                            </h4>
                                            <ul className="space-y-4">
                                                {results.suggestions?.slice(0, 3).map((sug, i) => (
                                                    <li key={i} className="flex gap-4 text-sm font-medium text-[var(--text-2)] leading-relaxed">
                                                        <span className="w-2 h-2 rounded-full bg-[var(--primary-glow)] mt-2 shrink-0" />
                                                        {sug}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Optimized Resume Preview */}
                                    <div className="p-10 rounded-[40px] bg-[var(--bg-2)] border border-[var(--border)] shadow-2xl relative group overflow-hidden">
                                        <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--primary-glow)] rounded-full blur-[140px] opacity-10 -mr-40 -mt-40" />

                                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12 relative z-10">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center text-[var(--primary)] shadow-sm">
                                                    <FileText className="w-7 h-7" />
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-black tracking-tight text-[var(--text)]">AI-Optimized Draft</h3>
                                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-3)]">ATS-Ready Professional Rewrite</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => copyToClipboard(results.optimizedResume)}
                                                className="w-12 h-12 rounded-2xl bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center text-[var(--text-3)] hover:text-[var(--primary)] hover:border-[var(--primary)] transition-all shadow-sm"
                                                title="Copy Draft"
                                            >
                                                <Copy className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="relative bg-[var(--bg)] border border-[var(--border)] rounded-3xl p-8 max-h-[600px] overflow-y-auto pr-6 custom-scrollbar shadow-inner">
                                            <pre className="text-base font-medium text-[var(--text-2)] leading-loose whitespace-pre-wrap font-sans italic">
                                                {results.optimizedResume}
                                            </pre>
                                        </div>

                                        <div className="mt-10 flex justify-center relative z-10">
                                            <button
                                                onClick={() => copyToClipboard(results.optimizedResume)}
                                                className="px-12 py-5 rounded-2xl bg-[var(--primary)] font-black text-xs uppercase tracking-widest text-white shadow-xl shadow-[var(--primary-glow)] hover:scale-105 active:scale-95 transition-all"
                                            >
                                                Copy Entire Resume
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.main>
        </div>
    );
};

export default ResumeAnalyzer;
