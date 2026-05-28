import { Routes, Route } from "react-router-dom";
import LandingPage from "./features/landing/LandingPage";
import Login from "./features/auth/pages/Login";
import SignUpPage from "./features/auth/pages/SignUp";
import DashboardPage from "./features/dashboard/pages/Dashboard";
import AllTemplates from "./features/templates/pages/AllTemplates";
import TemplatesPage from "./features/templates/pages/TemplatesPage";
import FAQ from "./features/landing/components/FAQ";
import MyResumes from "./features/dashboard/pages/MyResumes";
import Settings from "./features/dashboard/pages/Settings";
import ResumeAnalyzer from "./features/resume-analyzer/ResumeAnalyzer";
import OAuthCallback from "./features/auth/pages/OAuthCallback";
import CustomCursor from "./components/CustomCursor";
import { Helmet } from "react-helmet-async";

function App() {
  return (
    <>
      <Helmet>
        <title>ATSify AI Resume Analyzer</title>

        <meta
          name="description"
          content="AI-powered ATS resume analyzer with JD matching and resume scoring."
        />

        <meta
          name="keywords"
          content="ATS Resume Analyzer, AI Resume Checker, Resume Scanner"
        />

        <meta property="og:title" content="ATSify AI Resume Analyzer" />

        <meta
          property="og:description"
          content="AI-powered ATS Resume Analyzer"
        />
      </Helmet>
      <CustomCursor />
      <div className="relative z-10">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/templates/all" element={<AllTemplates />} />
          <Route path="/templates" element={<TemplatesPage />} />
          <Route path="/templates/:category" element={<TemplatesPage />} />
          <Route path="/my-resumes" element={<MyResumes />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/oauth-callback" element={<OAuthCallback />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
