import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/signup`, {
        name,
        email,
        password,
      });
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      {/* ── Left Panel — Image & Value Prop (hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col">
        {/* Background Image */}
        <img
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=85"
          alt="Collaboration"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Overlay */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(160deg, rgba(37,99,235,0.85) 0%, rgba(29,78,216,0.92) 100%)" }}
        />

        {/* Content over image */}
        <div className="relative z-10 flex flex-col h-full p-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(12px)" }}
            >
              <svg width="18" height="18" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <span className="text-2xl font-black text-white tracking-tight">
              ATS<span style={{ color: "rgba(255,255,255,0.6)" }}>ify</span>
            </span>
          </Link>

          <div className="flex-1 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h2 className="text-4xl font-black text-white leading-tight mb-6">
                Start your journey to<br />
                <span style={{ color: "rgba(255,255,255,0.75)" }}>a better career today.</span>
              </h2>
              <ul className="space-y-4 mb-12">
                {[
                  "Get an instant ATS compatibility score",
                  "Identify and fix missing keywords",
                  "Access 20+ field-tested templates",
                  "Unlimited AI-powered rewrites",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/80 font-medium">
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                      <svg width="12" height="12" fill="none" stroke="white" strokeWidth="3" viewBox="0 0 24 24">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-auto">
            © 2026 ATSify Intelligence Systems
          </p>
        </div>
      </div>

      {/* ── Right Panel — SignUp Form ── */}
      <div
        className="flex-1 flex items-center justify-center px-6 py-12 relative"
        style={{ background: "var(--bg)" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-md"
        >
          {/* Mobile logo */}
          <Link to="/" className="flex lg:hidden items-center justify-center gap-2.5 mb-10">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-d))" }}
            >
              <svg width="15" height="15" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <span className="text-2xl font-black" style={{ color: "var(--text)" }}>
              ATS<span style={{ color: "var(--primary)" }}>ify</span>
            </span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-black tracking-tight mb-2" style={{ color: "var(--text)" }}>
              Create account
            </h1>
            <p className="text-sm font-medium" style={{ color: "var(--text-3)" }}>
              Start optimizing your resume for free
            </p>
          </div>

          <div
            className="p-8 rounded-3xl border"
            style={{
              background: "var(--bg-2)",
              borderColor: "var(--border)",
              boxShadow: "0 4px 32px rgba(0,0,0,0.06)",
            }}
          >
            <form className="space-y-5" onSubmit={handleSignUp}>
              <div>
                <label
                  className="text-[10px] font-black uppercase tracking-widest mb-2 block"
                  style={{ color: "var(--text-3)" }}
                >
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 rounded-xl text-sm font-medium focus:outline-none transition-all"
                  style={{
                    background: "var(--bg)",
                    border: "1.5px solid var(--border)",
                    color: "var(--text)",
                    caretColor: "var(--primary)",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "var(--primary)";
                    e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.10)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "var(--border)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              <div>
                <label
                  className="text-[10px] font-black uppercase tracking-widest mb-2 block"
                  style={{ color: "var(--text-3)" }}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 rounded-xl text-sm font-medium focus:outline-none transition-all"
                  style={{
                    background: "var(--bg)",
                    border: "1.5px solid var(--border)",
                    color: "var(--text)",
                    caretColor: "var(--primary)",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "var(--primary)";
                    e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.10)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "var(--border)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              <div>
                <label
                  className="text-[10px] font-black uppercase tracking-widest mb-2 block"
                  style={{ color: "var(--text-3)" }}
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3.5 rounded-xl text-sm font-medium focus:outline-none transition-all pr-16"
                    style={{
                      background: "var(--bg)",
                      border: "1.5px solid var(--border)",
                      color: "var(--text)",
                      caretColor: "var(--primary)",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "var(--primary)";
                      e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.10)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "var(--border)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest transition-colors"
                    style={{ color: "var(--text-3)" }}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest text-white relative overflow-hidden group mt-2"
                style={{
                  background: "linear-gradient(135deg, var(--primary), var(--primary-d))",
                  boxShadow: "0 4px 20px rgba(37,99,235,0.25)",
                }}
              >
                <span className="relative z-10">
                  {loading ? "Creating account..." : "Create Account"}
                </span>
              </button>

              <div className="relative flex items-center gap-4 my-1">
                <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-3)" }}>
                  or
                </span>
                <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
              </div>

              <button
                type="button"
                onClick={() => (window.location.href = `${import.meta.env.VITE_API_BASE_URL}/api/auth/google?clientUrl=${encodeURIComponent(window.location.origin)}`)}
                className="w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-3 transition-all border"
                style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text-2)" }}
              >
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.6 20.4H42V20H24v8h11.3C33.7 32.1 29.2 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.4 1.1 7.4 2.9l5.7-5.7C33.7 7 29 5 24 5 12.9 5 4 13.9 4 25s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.6z" />
                  <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16.1 18.9 13 24 13c2.8 0 5.4 1.1 7.4 2.9l5.7-5.7C33.7 7 29 5 24 5c-7.7 0-14.4 4.3-17.7 9.7z" />
                  <path fill="#4CAF50" d="M24 45c5.1 0 9.7-2 13.2-5.3l-6.1-5.1c-1.8 1.3-4.1 2.1-7.1 2.1-5.2 0-9.6-3.5-11.2-8.3l-6.5 5C9.6 40.5 16.3 45 24 45z" />
                  <path fill="#1976D2" d="M43.6 20.4H42V20H24v8h11.3c-1 2.7-3 4.9-5.6 6.3l.1.1 6.1 5.1C39.6 36.1 44 31 44 25c0-1.3-.1-2.6-.4-3.6z" />
                </svg>
                Sign up with Google
              </button>

              <p className="text-center text-sm font-medium" style={{ color: "var(--text-3)" }}>
                Already have an account?{" "}
                <Link to="/login" className="font-black transition-colors" style={{ color: "var(--primary)" }}>
                  Sign In
                </Link>
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignUpPage;
