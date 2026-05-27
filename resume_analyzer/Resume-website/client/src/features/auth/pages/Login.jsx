import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, {
        identifier,
        password,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      {/* ── Left Panel — Image & Testimonial (hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col">
        {/* Background Image */}
        <img
          src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=1200&q=85"
          alt="Resume review"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Overlay */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(160deg, rgba(37,99,235,0.82) 0%, rgba(29,78,216,0.90) 100%)" }}
        />

        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: "radial-gradient(white 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />

        {/* Content over image */}
        <div className="relative z-10 flex flex-col h-full p-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
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

          {/* Stats in middle */}
          <div className="flex-1 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h2 className="text-4xl font-black text-white leading-tight mb-6">
                Land your dream job<br />
                <span style={{ color: "rgba(255,255,255,0.75)" }}>with AI-powered resumes.</span>
              </h2>
              <p className="text-white/70 text-lg font-medium leading-relaxed mb-12 max-w-md">
                Join 10,000+ professionals who've used ATSify to beat ATS filters and secure more interviews.
              </p>

              {/* Stat badges */}
              <div className="flex gap-6">
                {[
                  { value: "94%", label: "ATS Pass Rate" },
                  { value: "3×", label: "More Interviews" },
                  { value: "10k+", label: "Users" },
                ].map((s) => (
                  <div key={s.label} className="text-center p-4 rounded-2xl" style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}>
                    <p className="text-2xl font-black text-white">{s.value}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Testimonial card at bottom */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="p-6 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(16px)" }}
          >
            <p className="text-white/90 text-sm font-medium leading-relaxed mb-4">
              "ATSify helped me rewrite my resume in 20 minutes. Got 4 interview calls the next week — including Google!"
            </p>
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80"
                alt="User"
                className="w-9 h-9 rounded-full object-cover border-2 border-white/30"
              />
              <div>
                <p className="text-white text-xs font-black">Arjun Mehta</p>
                <p className="text-white/50 text-[10px] font-medium">Software Engineer · Google</p>
              </div>
              <div className="ml-auto flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill="#fbbf24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Right Panel — Login Form ── */}
      <div
        className="flex-1 flex items-center justify-center px-6 py-12 relative"
        style={{ background: "var(--bg)" }}
      >
        {/* Subtle background glow */}
        <div
          className="absolute top-[-10%] right-[-10%] w-80 h-80 rounded-full pointer-events-none opacity-[0.06] blur-[100px]"
          style={{ background: "var(--primary)" }}
        />

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

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-black tracking-tight mb-2" style={{ color: "var(--text)" }}>
              Welcome back
            </h1>
            <p className="text-sm font-medium" style={{ color: "var(--text-3)" }}>
              Sign in to your ATSify account to continue
            </p>
          </div>

          {/* Card */}
          <div
            className="p-8 rounded-3xl border"
            style={{
              background: "var(--bg-2)",
              borderColor: "var(--border)",
              boxShadow: "0 4px 32px rgba(0,0,0,0.06)",
            }}
          >
            <form className="space-y-5" onSubmit={handleLogin}>
              {/* Email field */}
              <div>
                <label
                  className="text-[10px] font-black uppercase tracking-widest mb-2 block"
                  style={{ color: "var(--text-3)" }}
                >
                  Email or Username
                </label>
                <input
                  type="text"
                  placeholder="you@example.com or username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
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

              {/* Password field */}
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
                    onMouseEnter={(e) => (e.target.style.color = "var(--primary)")}
                    onMouseLeave={(e) => (e.target.style.color = "var(--text-3)")}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest text-white relative overflow-hidden group mt-1"
                style={{
                  background: "linear-gradient(135deg, var(--primary), var(--primary-d))",
                  boxShadow: "0 4px 20px rgba(37,99,235,0.25)",
                }}
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: "linear-gradient(135deg, var(--primary-d), var(--secondary))" }}
                />
                <span className="relative z-10">
                  {loading ? "Signing in..." : "Sign In →"}
                </span>
              </button>

              {/* Divider */}
              <div className="relative flex items-center gap-4 my-1">
                <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-3)" }}>
                  or
                </span>
                <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
              </div>

              {/* Google OAuth */}
              <button
                type="button"
                onClick={() => (window.location.href = `${import.meta.env.VITE_API_BASE_URL}/api/auth/google?clientUrl=${encodeURIComponent(window.location.origin)}`)}
                className="w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-3 transition-all border"
                style={{
                  background: "var(--bg)",
                  borderColor: "var(--border)",
                  color: "var(--text-2)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(37,99,235,0.30)";
                  e.currentTarget.style.background = "var(--bg-3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.background = "var(--bg)";
                }}
              >
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.6 20.4H42V20H24v8h11.3C33.7 32.1 29.2 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.4 1.1 7.4 2.9l5.7-5.7C33.7 7 29 5 24 5 12.9 5 4 13.9 4 25s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.6z" />
                  <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16.1 18.9 13 24 13c2.8 0 5.4 1.1 7.4 2.9l5.7-5.7C33.7 7 29 5 24 5c-7.7 0-14.4 4.3-17.7 9.7z" />
                  <path fill="#4CAF50" d="M24 45c5.1 0 9.7-2 13.2-5.3l-6.1-5.1c-1.8 1.3-4.1 2.1-7.1 2.1-5.2 0-9.6-3.5-11.2-8.3l-6.5 5C9.6 40.5 16.3 45 24 45z" />
                  <path fill="#1976D2" d="M43.6 20.4H42V20H24v8h11.3c-1 2.7-3 4.9-5.6 6.3l.1.1 6.1 5.1C39.6 36.1 44 31 44 25c0-1.3-.1-2.6-.4-3.6z" />
                </svg>
                Continue with Google
              </button>

              {/* LinkedIn OAuth */}
              <button
                type="button"
                onClick={() => (window.location.href = `${import.meta.env.VITE_API_BASE_URL}/api/auth/linkedin?clientUrl=${encodeURIComponent(window.location.origin)}`)}
                className="w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-3 transition-all border"
                style={{
                  background: "rgba(10,102,194,0.05)",
                  borderColor: "rgba(10,102,194,0.20)",
                  color: "var(--text-2)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(10,102,194,0.10)";
                  e.currentTarget.style.borderColor = "rgba(10,102,194,0.40)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(10,102,194,0.05)";
                  e.currentTarget.style.borderColor = "rgba(10,102,194,0.20)";
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A66C2">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                Continue with LinkedIn
              </button>

              {/* Signup link */}
              <p className="text-center text-sm font-medium" style={{ color: "var(--text-3)" }}>
                New here?{" "}
                <Link
                  to="/signup"
                  className="font-black transition-colors"
                  style={{ color: "var(--primary)" }}
                  onMouseEnter={(e) => (e.target.style.color = "var(--secondary)")}
                  onMouseLeave={(e) => (e.target.style.color = "var(--primary)")}
                >
                  Create Account
                </Link>
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
