import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const OAuthCallback = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get("token");
    const userRaw = params.get("user");
    console.log("OAuth Callback hit. Token exists:", !!token, "UserRaw exists:", !!userRaw);
    if (token && userRaw) {
      try {
        const user = JSON.parse(decodeURIComponent(userRaw));
        console.log("Parsed User:", user);
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        console.log("Redirecting to /dashboard...");
        navigate("/dashboard", { replace: true });
      } catch (err) {
        console.error("Parse failed:", err);
        navigate("/login?error=parse_failed", { replace: true });
      }
    } else {
      console.warn("Missing token or userRaw in URL");
      navigate("/login?error=oauth_failed", { replace: true });
    }
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "#07080c" }}
    >
      <div className="text-center">
        <div
          className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #1d4ed8, #3b82f6)" }}
        >
          <svg
            className="animate-spin"
            width="20"
            height="20"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        </div>
        <p
          className="text-sm font-black uppercase tracking-widest"
          style={{ color: "#475569" }}
        >
          Signing you in...
        </p>
      </div>
    </div>
  );
};

export default OAuthCallback;
