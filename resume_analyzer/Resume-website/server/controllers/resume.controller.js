import fs from "fs";
import path from "path";
import axios from "axios";
import FormData from "form-data";
import User from "../models/User.js";
import { extractResumeData } from "../utils/resumeParser.js";
import { generateLatexResume } from "../utils/latexTemplate.js";
import { analyzeResume as analyzeResumeAI, getAtsTips, fixResumeWithAI, analyzeTemplateIssues, comprehensiveResumeAnalysis } from "../utils/gemini.js";

const mapParsedToLatexData = (parsed) => {
  const skillsArray = Array.isArray(parsed.skills) ? parsed.skills : [];

  const splitBullets = (text) =>
    text
      .split(/\n|•/g)
      .map((line) => line.trim())
      .filter(Boolean);

  const experienceText = typeof parsed.experience === "string" ? parsed.experience : "";
  const educationText = typeof parsed.education === "string" ? parsed.education : "";

  const experience = experienceText
    ? [
      {
        company: "Work Experience",
        duration: "",
        position: "",
        location: "",
        achievements: splitBullets(experienceText),
      },
    ]
    : [];

  const education = educationText
    ? [
      {
        institution: educationText,
        duration: "",
        degree: "",
        cgpa: "",
        coursework: "",
      },
    ]
    : [];

  const skills = skillsArray.length ? { skills: skillsArray.join(", ") } : {};

  return {
    personalInfo: {
      name: parsed.name || "",
      email: parsed.email || "",
      phone: parsed.phone || "",
      linkedin: "",
      github: "",
      portfolio: "",
      leetcode: "",
    },
    education,
    experience,
    projects: [],
    skills,
    certifications: [],
  };
};

export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Resume file is required" });
    }

    const resume = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      url: `/uploads/${req.file.filename}`,
      uploadedAt: new Date(),
    };

    let resumeParsed = {};
    try {
      resumeParsed = await extractResumeData({
        filePath: req.file.path,
        mimeType: req.file.mimetype,
      });
    } catch (err) {
      console.error("Resume parsing error:", err);
      resumeParsed = {};
    }

    // Get ATS tips from Gemini (DISABLED TEMPORARILY)
    let atsTips = [];
    /*
    if (resumeParsed && Object.keys(resumeParsed).length > 0) {
      try {
        atsTips = await getAtsTips(resumeParsed);
      } catch (err) {
        console.error("Gemini ATS tips error:", err);
      }
    }
    */
    resumeParsed.atsTips = atsTips;

    const latexData = mapParsedToLatexData(resumeParsed);
    const latex = generateLatexResume(latexData);

    const uploadDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const latexFilename = `${path.parse(req.file.filename).name}.tex`;
    const latexFilePath = path.join(uploadDir, latexFilename);
    fs.writeFileSync(latexFilePath, latex, "utf8");

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { resume, resumeParsed },
      { returnDocument: "after" }
    ).select("-password");
    console.log("Upload controller - Updated User resumeParsed rawText length:", user.resumeParsed?.rawText ? user.resumeParsed.rawText.length : "MISSING");

    return res.status(200).json({
      message: "Resume uploaded",
      user,
      resumeParsed,
      latex,
      latexFile: `/uploads/${latexFilename}`,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const analyzeResume = async (req, res) => {
  try {
    const { role, jobDescription, resumeText } = req.body;
    const user = await User.findById(req.user.id);

    if (!resumeText && (!user || !user.resumeParsed)) {
      return res.status(400).json({
        message: "Role and Resume data (text or uploaded file) are required"
      });
    }

    const textToAnalyze = resumeText || (user.resumeParsed ? user.resumeParsed.rawText : "");
    console.log("Analyze controller - rawText length:", textToAnalyze ? textToAnalyze.length : "EMPTY");

    // 1. Get ATS Score & deterministic issues from Python Backend
    let atsScore = 70;
    let missingKeywords = [];
    let issues = [];
    let suggestions = [];

    try {
      const formData = new FormData();
      formData.append("jd_text", jobDescription || role || "software engineer");
      const buffer = Buffer.from(textToAnalyze, "utf8");
      formData.append("resume", buffer, { filename: "resume.txt", contentType: "text/plain" });

      const pyRes = await axios.post("http://localhost:5000/api/ats-score", formData, {
        headers: formData.getHeaders()
      });

      if (pyRes.data && pyRes.data.success) {
        atsScore = pyRes.data.ats_score || 70;
        
        // Extract missing keywords
        const matchAnalysis = pyRes.data.match_analysis || {};
        missingKeywords = matchAnalysis.missing_keywords || pyRes.data.keywords_required?.missing || [];
        
        // Extract issues and suggestions
        const pyImprovements = pyRes.data.improvements || [];
        issues = pyImprovements.filter(i => i.priority === "high").map(i => i.suggestion);
        suggestions = pyImprovements.map(i => i.suggestion);
      }
    } catch (pyErr) {
      console.error("Python ATS scoring error:", pyErr.message);
      // Fallback to Gemini if Python fails
      try {
         const aiRes = await analyzeResumeAI(role || "", jobDescription || "", textToAnalyze);
         atsScore = aiRes.atsScore || 70;
         missingKeywords = aiRes.missingKeywords || [];
         issues = aiRes.issues || [];
         suggestions = aiRes.suggestions || [];
      } catch(e) {}
    }

    // 2. Get AI Optimized Draft from Gemini
    let optimizedResume = textToAnalyze;
    try {
      const fixRes = await fixResumeWithAI(textToAnalyze, jobDescription || "", role || "");
      optimizedResume = fixRes.improvedResume || textToAnalyze;
      
      // Also merge AI keywords and improvements
      if (fixRes.keywordsAdded && fixRes.keywordsAdded.length > 0) {
         suggestions.push(`Consider these AI added keywords: ${fixRes.keywordsAdded.join(", ")}`);
      }
    } catch (geminiErr) {
      console.error("Gemini fixResume error:", geminiErr.message);
    }

    const analysis = {
      atsScore,
      missingKeywords,
      issues,
      suggestions,
      optimizedResume
    };

    return res.status(200).json(analysis);
  } catch (error) {
    console.error("Analysis Error:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const fixResumeAI = async (req, res) => {
  try {
    const { role, jobDescription, resumeText } = req.body;
    const user = await User.findById(req.user.id);

    if (!resumeText && (!user || !user.resumeParsed)) {
      return res.status(400).json({
        message: "Resume text is required"
      });
    }

    const textToFix = resumeText || (user.resumeParsed ? user.resumeParsed.rawText : "");
    
    if (!textToFix) {
      return res.status(400).json({
        message: "No resumable content found"
      });
    }

    console.log("Fixing resume with AI...");
    const fixedData = await fixResumeWithAI(textToFix, jobDescription || "", role || "");

    return res.status(200).json({
      success: true,
      data: fixedData
    });
  } catch (error) {
    console.error("Resume Fix Error:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const generateReportPDF = async (req, res) => {
  try {
    const { feedbackData, fileName } = req.body;
    
    if (!feedbackData) {
      return res.status(400).json({ message: "Feedback data is required" });
    }

    const templateAnalysis = feedbackData.templateAnalysis || {};
    const templateIssues = templateAnalysis.templateIssues || [];
    const improvementSuggestions = templateAnalysis.improvementSuggestions || [];
    const missingRecommendedSections = templateAnalysis.missingRecommendedSections || [];
    
    // Comprehensive analysis data
    const skillsAnalysis = feedbackData.skillsAnalysis || {};
    const keyStrengths = feedbackData.keyStrengths || [];
    const areasForImprovement = feedbackData.areasForImprovement || [];
    const recommendedCourses = feedbackData.recommendedCoursesOrCertifications || [];
    const nextSteps = feedbackData.nextSteps || [];
    
    // Calculate improvement metrics
    const criticalIssues = templateIssues.filter(i => i.severity === 'CRITICAL').length;
    const highIssues = templateIssues.filter(i => i.severity === 'HIGH').length;
    const successRate = feedbackData.atsScore ? Math.min(100, feedbackData.atsScore) : 0;
    const completionScore = feedbackData.resumeScore ? Math.min(100, feedbackData.resumeScore) : 0;

    // Generate HTML report with enhanced design
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Resume Analysis Report - ${fileName || 'Resume'}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', sans-serif;
            line-height: 1.7;
            color: #2c3e50;
            background: #ecf0f1;
            padding: 20px;
          }
          .container {
            background: white;
            max-width: 1100px;
            margin: 0 auto;
            padding: 50px 40px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.08);
            border-radius: 12px;
          }
          
          /* Header & Title */
          .report-header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 25px;
          }
          .report-header h1 {
            font-size: 2.5em;
            color: #1e293b;
            margin-bottom: 10px;
            font-weight: 700;
            letter-spacing: -0.5px;
          }
          .report-subtitle {
            font-size: 0.95em;
            color: #7f8c8d;
            font-style: italic;
          }
          
          /* Scores Grid */
          .scores-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 25px;
            margin-bottom: 40px;
            page-break-inside: avoid;
          }
          .score-card {
            padding: 30px 25px;
            border-radius: 10px;
            text-align: center;
            color: white;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            position: relative;
            overflow: hidden;
          }
          .score-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%);
            pointer-events: none;
          }
          .score-card.primary { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); }
          .score-card.success { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
          .score-card.warning { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
          .score-label {
            font-size: 0.85em;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            opacity: 0.95;
            margin-bottom: 12px;
          }
          .score-number {
            font-size: 3.5em;
            font-weight: 800;
            margin: 10px 0;
            line-height: 1;
          }
          .score-max {
            font-size: 0.9em;
            opacity: 0.85;
            margin-top: 8px;
          }
          .score-description {
            font-size: 0.8em;
            opacity: 0.9;
            margin-top: 5px;
            font-weight: 500;
          }
          
          /* Progress Indicators */
          .progress-bar {
            width: 100%;
            height: 8px;
            background: #e5e7eb;
            border-radius: 10px;
            overflow: hidden;
            margin-top: 10px;
          }
          .progress-fill {
            height: 100%;
            background: inherit;
            border-radius: 10px;
            transition: width 0.3s ease;
          }
          
          /* Main Sections */
          h2 {
            font-size: 1.6em;
            color: #1e293b;
            margin: 35px 0 20px 0;
            padding-bottom: 12px;
            border-bottom: 3px solid #3b82f6;
            page-break-after: avoid;
            font-weight: 700;
          }
          h2::before {
            margin-right: 12px;
          }
          h3 {
            font-size: 1.2em;
            color: #34495e;
            margin: 20px 0 12px 0;
            font-weight: 600;
            page-break-after: avoid;
          }
          h4 {
            font-size: 1.05em;
            color: #3b82f6;
            margin: 15px 0 10px 0;
            font-weight: 600;
          }
          
          /* Executive Summary */
          .executive-summary {
            background: linear-gradient(135deg, #f0f9ff 0%, #dbeafe 100%);
            border-left: 5px solid #3b82f6;
            padding: 25px;
            border-radius: 8px;
            margin-bottom: 30px;
            page-break-inside: avoid;
            font-size: 1.02em;
            line-height: 1.8;
          }
          
          /* Issues Grid */
          .issues-container {
            display: grid;
            grid-template-columns: repeated(auto-fit, minmax(100%, 1fr));
            gap: 15px;
            margin: 20px 0;
          }
          .issue-card {
            padding: 20px;
            border-radius: 8px;
            border-left: 5px solid;
            page-break-inside: avoid;
            background-color: white;
            border: 1px solid #e5e7eb;
          }
          .issue-card.critical {
            border-left-color: #dc2626;
            background-color: #fef2f2;
          }
          .issue-card.critical .severity { color: #991b1b; background: #fee2e2; }
          .issue-card.high {
            border-left-color: #f97316;
            background-color: #fffbeb;
          }
          .issue-card.high .severity { color: #92400e; background: #fef3c7; }
          .issue-card.medium {
            border-left-color: #f59e0b;
            background-color: #fefce8;
          }
          .issue-card.medium .severity { color: #78350f; background: #fef08a; }
          .issue-card.low {
            border-left-color: #3b82f6;
            background-color: #f0f9ff;
          }
          .issue-card.low .severity { color: #1e40af; background: #dbeafe; }
          
          .severity {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8em;
            font-weight: 600;
            text-transform: uppercase;
            margin-bottom: 10px;
          }
          .issue-title {
            font-weight: 700;
            font-size: 1.05em;
            margin-bottom: 8px;
            color: #1e293b;
          }
          .issue-detail {
            font-size: 0.95em;
            margin: 8px 0;
            line-height: 1.6;
          }
          .issue-detail strong { color: #1e293b; }
          .issue-example {
            background: rgba(0,0,0,0.05);
            padding: 12px;
            border-radius: 6px;
            font-family: 'Courier New', monospace;
            font-size: 0.85em;
            margin-top: 10px;
            color: #2c3e50;
            word-break: break-word;
          }
          
          /* Feedback Items */
          .feedback-list {
            list-style: none;
            margin: 15px 0;
          }
          .feedback-item {
            padding: 15px 20px;
            margin: 12px 0;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
            page-break-inside: avoid;
            background-color: #f9fafb;
            line-height: 1.7;
          }
          .feedback-item.strength {
            border-left-color: #10b981;
            background-color: #ecfdf5;
            color: #166534;
          }
          .feedback-item.strength::before { content: "✓ "; font-weight: bold; color: #10b981; }
          .feedback-item.improvement {
            border-left-color: #f59e0b;
            background-color: #fffbeb;
            color: #92400e;
          }
          .feedback-item.improvement::before { content: "→ "; font-weight: bold; color: #f59e0b; }
          
          /* Suggestion Items */
          .suggestion-card {
            background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
            border: 1px solid #bbf7d0;
            border-left: 5px solid #10b981;
            padding: 20px;
            margin: 15px 0;
            border-radius: 8px;
            page-break-inside: avoid;
          }
          .suggestion-icon {
            font-size: 1.3em;
            display: inline-block;
            margin-right: 10px;
          }
          .suggestion-area {
            font-weight: 700;
            color: #059669;
            font-size: 1.05em;
            margin-bottom: 12px;
          }
          .suggestion-content {
            font-size: 0.98em;
            line-height: 1.7;
          }
          .suggestion-content p {
            margin: 10px 0;
          }
          .suggestion-content strong { color: #1e293b; }
          
          /* Grid Layouts */
          .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 20px 0;
          }
          .grid-item {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            padding: 20px;
            border-radius: 8px;
            page-break-inside: avoid;
          }
          .grid-item h3 { margin-top: 0; }
          
          /* Tables */
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 0.95em;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          }
          table th {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
            padding: 15px;
            text-align: left;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.85em;
            letter-spacing: 0.5px;
          }
          table td {
            padding: 12px 15px;
            border-bottom: 1px solid #e5e7eb;
          }
          table tr:hover { background: #f9fafb; }
          table tr:last-child td { border-bottom: none; }
          
          /* Tips Section */
          .tips-box {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border-left: 5px solid #f59e0b;
            padding: 25px;
            border-radius: 8px;
            margin: 25px 0;
            page-break-inside: avoid;
          }
          .tips-box h3 { margin-top: 0; color: #92400e; }
          .tips-box ul { margin: 15px 0; padding-left: 25px; }
          .tips-box li { margin: 10px 0; color: #78350f; line-height: 1.7; }
          
          /* Action Items */
          .action-list {
            list-style: none;
            margin: 20px 0;
            counter-reset: item-count;
          }
          .action-list li {
            counter-increment: item-count;
            padding: 15px 20px;
            margin: 12px 0;
            background: linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%);
            border-left: 4px solid #3b82f6;
            border-radius: 6px;
            page-break-inside: avoid;
          }
          .action-list li::before {
            content: counter(item-count);
            display: inline-block;
            background: #3b82f6;
            color: white;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            text-align: center;
            line-height: 28px;
            font-weight: 700;
            margin-right: 12px;
            font-size: 0.9em;
          }
          
          /* Page Breaks */
          .page-break {
            page-break-after: always;
            margin: 50px 0;
            padding: 30px 0;
            border-bottom: 2px solid #e5e7eb;
          }
          
          /* Metadata */
          .metadata {
            margin-top: 50px;
            padding-top: 25px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            font-size: 0.85em;
            color: #7f8c8d;
            page-break-inside: avoid;
          }
          .metadata p { margin: 8px 0; }
          
          /* Print Styles */
          @media print {
            body { background: white; padding: 0; }
            .container { box-shadow: none; margin: 0; }
            a { color: inherit; text-decoration: none; }
          }
          
          /* Highlights */
          .highlight { background: #fef08a; padding: 2px 6px; border-radius: 3px; font-weight: 500; }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- HEADER -->
          <div class="report-header">
            <h1>📋 Comprehensive Resume Analysis Report</h1>
            <p class="report-subtitle">Professional Career Development Assessment</p>
          </div>
          
          <!-- SCORE CARDS -->
          <div class="scores-grid">
            <div class="score-card primary">
              <div class="score-label">ATS Compatibility</div>
              <div class="score-number">${feedbackData.atsScore || '—'}</div>
              <div class="score-max">out of 100</div>
              <div class="score-description">ATS parsing compatibility</div>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${successRate}%; background: linear-gradient(90deg, #3b82f6, #2563eb);"></div>
              </div>
            </div>
            
            <div class="score-card success">
              <div class="score-label">Resume Quality</div>
              <div class="score-number">${feedbackData.resumeScore || '—'}</div>
              <div class="score-max">out of 100</div>
              <div class="score-description">Overall content quality</div>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${completionScore}%; background: linear-gradient(90deg, #10b981, #059669);"></div>
              </div>
            </div>
            
            <div class="score-card warning">
              <div class="score-label">Template Score</div>
              <div class="score-number">${templateAnalysis.overallTemplateScore || '—'}</div>
              <div class="score-max">out of 100</div>
              <div class="score-description">Formatting & structure</div>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${templateAnalysis.overallTemplateScore || 0}%; background: linear-gradient(90deg, #f59e0b, #d97706);"></div>
              </div>
            </div>
          </div>
          
          <!-- EXECUTIVE SUMMARY -->
          <h2>📊 Executive Summary</h2>
          ${feedbackData.overallAssessment ? `
            <div class="executive-summary">
              <p>${feedbackData.overallAssessment}</p>
            </div>
          ` : `
            <div class="executive-summary">
              <p>Your resume has been thoroughly analyzed using advanced ATS algorithms and industry best practices. This report provides actionable insights to elevate your resume and improve your chances with both ATS systems and recruiters.</p>
            </div>
          `}
          
          <!-- CRITICAL INFORMATION -->
          ${criticalIssues > 0 || highIssues > 0 ? `
            <div style="background: #fef2f2; border: 2px solid #fecaca; padding: 20px; border-radius: 8px; margin: 25px 0; page-break-inside: avoid;">
              <h3 style="color: #991b1b; margin-top: 0;">⚠️ Critical Items Requiring Attention</h3>
              <p style="margin: 10px 0; color: #7f1d1d;">Your resume has <strong>${criticalIssues}</strong> critical and <strong>${highIssues}</strong> high-priority issues that significantly impact ATS compatibility. Address these immediately for best results.</p>
            </div>
          ` : ''}
          
          <!-- TEMPLATE & FORMATTING ISSUES -->
          <h2>🎨 Template & Formatting Analysis</h2>
          ${templateIssues.length > 0 ? `
            <p style="margin-bottom: 20px; color: #555;">Found <strong>${templateIssues.length}</strong> formatting issues:</p>
            <div class="issues-container">
              ${templateIssues.map(issue => `
                <div class="issue-card ${(issue.severity || 'medium').toLowerCase()}">
                  <div class="severity">${issue.severity || 'ISSUE'}</div>
                  <div class="issue-title">${issue.issue || 'Formatting Issue'}</div>
                  <div class="issue-detail"><strong>Impact:</strong> ${issue.impact || 'Affects resume parsing'}</div>
                  ${issue.example ? `<div class="issue-example">Example: "${issue.example}"</div>` : ''}
                </div>
              `).join('')}
            </div>
          ` : `
            <div style="background: #ecfdf5; border: 1px solid #bbf7d0; padding: 20px; border-radius: 8px; color: #166534;">
              ✓ No major template issues detected. Your resume formatting is solid!
            </div>
          `}
          
          <!-- SKILLS ANALYSIS -->
          <h2>🎯 Skills & Experience Analysis</h2>
          <div class="grid-2">
            ${skillsAnalysis.currentSkills && skillsAnalysis.currentSkills.length > 0 ? `
              <div class="grid-item">
                <h3>Current Skills Identified</h3>
                <ul class="feedback-list">
                  ${skillsAnalysis.currentSkills.slice(0, 8).map(skill => `
                    <li class="feedback-item" style="border-left-color: #10b981; background: #ecfdf5;">✓ ${skill}</li>
                  `).join('')}
                </ul>
              </div>
            ` : '<div class="grid-item"><p>No current skills identified.</p></div>'}
            
            ${skillsAnalysis.missingSkills && skillsAnalysis.missingSkills.length > 0 ? `
              <div class="grid-item">
                <h3>Skills to Develop</h3>
                <ul class="feedback-list">
                  ${skillsAnalysis.missingSkills.slice(0, 8).map(skill => `
                    <li class="feedback-item" style="border-left-color: #f59e0b; background: #fffbeb;">🎯 ${skill}</li>
                  `).join('')}
                </ul>
              </div>
            ` : '<div class="grid-item"><p>Skills analysis complete.</p></div>'}
          </div>
          ${skillsAnalysis.skillProficiency ? `<p style="margin: 20px 0; font-size: 1.02em; line-height: 1.8;"><strong>Proficiency Assessment:</strong> ${skillsAnalysis.skillProficiency}</p>` : ''}
          
          <!-- KEY STRENGTHS -->
          <h2>💪 Key Strengths</h2>
          ${keyStrengths.length > 0 ? `
            <ul class="feedback-list">
              ${keyStrengths.map(strength => `
                <li class="feedback-item strength">
                  ${strength}
                </li>
              `).join('')}
            </ul>
          ` : '<p style="padding: 15px; background: #f9fafb; border-radius: 8px;">Continue building on your existing strengths.</p>'}
          
          <!-- AREAS FOR IMPROVEMENT -->
          <h2>🚀 Areas for Improvement</h2>
          ${areasForImprovement.length > 0 ? `
            <ul class="feedback-list">
              ${areasForImprovement.map(area => `
                <li class="feedback-item improvement">
                  ${area}
                </li>
              `).join('')}
            </ul>
          ` : '<p style="padding: 15px; background: #ecfdf5; border: 1px solid #bbf7d0; border-radius: 8px; color: #166534;">Your resume looks comprehensive!</p>'}
          
          <div class="page-break"></div>
          
          <!-- HOW TO IMPROVE -->
          <h2>🔧 Improvement Roadmap</h2>
          ${improvementSuggestions.length > 0 ? `
            ${improvementSuggestions.slice(0, 5).map((suggestion, idx) => `
              <div class="suggestion-card">
                <div class="suggestion-area">
                  <span class="suggestion-icon">${String.fromCharCode(9312 + idx)}</span>
                  ${suggestion.area || 'General Improvement'}
                </div>
                <div class="suggestion-content">
                  <p><strong>Action:</strong> ${suggestion.suggestion || 'Improve this area'}</p>
                  <p><strong>Why it matters:</strong> ${suggestion.reason || 'Improves resume competitiveness'}</p>
                </div>
              </div>
            `).join('')}
          ` : ''}
          
          <!-- ATS OPTIMIZATION TIPS -->
          <h2>💡 ATS Optimization Best Practices</h2>
          <div class="tips-box">
            <h3>Ensure Maximum ATS Compatibility</h3>
            <ul>
              <li><strong>Format:</strong> Use .docx or .pdf in ATS-friendly format. Avoid complex layouts, tables, and images.</li>
              <li><strong>Keywords:</strong> Match job description keywords. ATS systems rely heavily on keyword matching.</li>
              <li><strong>Dates:</strong> Use consistent formatting (MM/DD/YYYY or Month Year) throughout your resume.</li>
              <li><strong>Sections:</strong> Use standard section headers (Summary, Experience, Skills, Education, etc.)</li>
              <li><strong>Fonts:</strong> Stick to commonly used fonts (Arial, Calibri, Times New Roman).</li>
              <li><strong>Bullet Points:</strong> Use standard bullet points (•) instead of special characters or symbols.</li>
              <li><strong>Numbers:</strong> Quantify achievements whenever possible (e.g., "Increased sales by 25%" vs. "Increased sales").</li>
            </ul>
          </div>
          
          <!-- MISSING SECTIONS -->
          ${missingRecommendedSections.length > 0 ? `
            <h2>📝 Missing Recommended Sections</h2>
            <p>Consider adding these sections to strengthen your resume:</p>
            <ul style="margin: 15px 0; padding-left: 25px;">
              ${missingRecommendedSections.map(section => `<li style="margin: 8px 0; font-size: 1em;">🔹 ${section}</li>`).join('')}
            </ul>
          ` : ''}
          
          <!-- DEVELOPMENT RECOMMENDATIONS -->
          ${recommendedCourses.length > 0 ? `
            <h2>📚 Recommended Courses & Certifications</h2>
            <p>Enhance your skills with these recommended learning paths:</p>
            <ul style="margin: 15px 0; padding-left: 25px;">
              ${recommendedCourses.slice(0, 10).map(course => `<li style="margin: 12px 0; font-size: 1em;">📖 ${course}</li>`).join('')}
            </ul>
          ` : ''}
          
          <div class="page-break"></div>
          
          <!-- ACTION PLAN -->
          <h2>✅ Your Action Plan</h2>
          <ol class="action-list">
            ${nextSteps.length > 0 ? nextSteps.slice(0, 6).map(step => `<li>${step}</li>`).join('') : `
              <li><strong>Immediate:</strong> Fix all CRITICAL and HIGH priority formatting issues identified above.</li>
              <li><strong>This Week:</strong> Incorporate missing keywords and optimize your skills section for ATS matching.</li>
              <li><strong>Content Enhancement:</strong> Add quantifiable metrics and impact statements to your achievements.</li>
              <li><strong>Structure Refinement:</strong> Reorganize sections to follow ATS-friendly structure guidelines.</li>
              <li><strong>Final Review:</strong> Proofread for grammar, spelling, and consistency in formatting and dates.</li>
              <li><strong>Re-Analyze:</strong> After 2 weeks of improvements, re-analyze your resume to track progress.</li>
            `}
          </ol>
          
          <!-- FOOTER METADATA -->
          <div class="metadata">
            <p><strong>Report Generated:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Document:</strong> ${fileName || 'resume-report.pdf'}</p>
            <p><strong>Analysis Method:</strong> Advanced AI Resume Analysis with ATS Compatibility Scoring</p>
            <p style="margin-top: 15px; font-style: italic; color: #999;">This comprehensive analysis was generated using industry-leading algorithms. Apply recommendations that align with your career goals and target positions.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Use puppeteer to generate PDF if available, otherwise send as HTML
    try {
      const puppeteer = (await import('puppeteer')).default;
      const browser = await puppeteer.launch({ headless: 'new' });
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({ 
        format: 'A4',
        printBackground: true,
        margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' }
      });
      await browser.close();

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="resume-analysis-report-${Date.now()}.pdf"`,
        'Content-Length': pdfBuffer.length
      });
      return res.send(pdfBuffer);
    } catch (err) {
      console.log("Puppeteer not available, sending HTML...");
      res.set({
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="resume-analysis-report-${Date.now()}.html"`
      });
      return res.send(htmlContent);
    }
  } catch (error) {
    console.error("Report Generation Error:", error);
    return res.status(500).json({ message: error.message });
  }
};
