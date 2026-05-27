import { GoogleGenAI } from "@google/genai";
import puppeteer from "puppeteer";

const COMMON_SKILLS = [
  "python", "java", "javascript", "typescript", "react", "angular", "vue",
  "node.js", "nodejs", "django", "flask", "fastapi", "sql", "postgresql",
  "mysql", "mongodb", "aws", "azure", "docker", "kubernetes", "git",
  "machine learning", "nlp", "tensorflow", "pytorch", "c++", "c#", "go", "rust",
  "html", "css", "spring", "express", "redis", "graphql", "rest api",
];

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

/** Local fallback when Gemini is unavailable — still returns useful ATS feedback. */
export function buildBasicAnalysis(resumeText, role = "", jobDescription = "") {
  const text = resumeText || "";
  const lower = text.toLowerCase();
  const skills = COMMON_SKILLS.filter((skill) => lower.includes(skill)).map(
    (s) => s.replace(/\b\w/g, (c) => c.toUpperCase()),
  );

  const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/);
  const phoneMatch = text.match(/(\+?\d[\d\s\-().]{8,}\d)/);

  let atsScore = 55;
  if (text.length > 400) atsScore += 10;
  if (text.length > 900) atsScore += 5;
  if (emailMatch) atsScore += 8;
  if (phoneMatch) atsScore += 7;
  if (skills.length >= 3) atsScore += 10;
  if (skills.length >= 6) atsScore += 5;

  const jdBlob = `${role} ${jobDescription}`.toLowerCase();
  const jdTokens = [...new Set(jdBlob.split(/\W+/).filter((w) => w.length > 3))];
  const matchedJd = jdTokens.filter((w) => lower.includes(w));
  if (jdTokens.length > 0) {
    const matchPct = Math.round((matchedJd.length / jdTokens.length) * 100);
    atsScore = Math.min(92, Math.round(35 + matchPct * 0.55));
  }

  const improvements = [];
  if (text.length < 500) improvements.push("Low semantic density detected — expand experience bullets.");
  if (!emailMatch) improvements.push("Add a professional email address.");
  if (!phoneMatch) improvements.push("Add a contact phone number.");
  if (jdTokens.length > 0 && matchedJd.length < jdTokens.length * 0.4) {
    improvements.push("Align more keywords from the job description.");
  }
  if (improvements.length === 0) {
    improvements.push("Quantify achievements with metrics where possible.");
    improvements.push("Use strong action verbs at the start of each bullet.");
  }

  return {
    personal_info: {
      email: emailMatch?.[0] || "",
      phone: phoneMatch?.[0] || "",
    },
    summary: role ? `Targeting role: ${role}` : "",
    experience: [],
    education: [],
    skills: skills.length ? skills : ["Communication", "Problem Solving", "Teamwork"],
    atsScore,
    improvements,
    missingKeywords: jdTokens.filter((w) => !lower.includes(w)).slice(0, 12),
  };
}

export const analyzeAndImproveResume = async (resumeText, role = "", jobDescription = "") => {
  try {
    const prompt = `
    You are an expert ATS resume reviewer and writer. 
    Analyze the following resume text and return a structured JSON representing the improved resume.
    Provide the output in valid JSON format ONLY, without markdown formatting.
    
    Structure the JSON as follows:
    {
      "personal_info": { "name": "", "email": "", "phone": "", "linkedin": "" },
      "summary": "Professional summary...",
      "experience": [ { "company": "", "title": "", "dates": "", "responsibilities": ["...", "..."] } ],
      "education": [ { "institution": "", "degree": "", "dates": "" } ],
      "skills": ["...", "..."]
    }
    
    Improve the bullets to be action-oriented, quantifiable, and ATS-friendly.
    
    Resume Text:
    ---
    ${resumeText}
    ---
    `;

    const ai = getGeminiClient();
    if (!ai) {
      return buildBasicAnalysis(resumeText, role, jobDescription);
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from Gemini API");
    }

    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    const cleanedText = jsonMatch ? jsonMatch[1].trim() : text.trim();

    const parsed = JSON.parse(cleanedText);
    if (!parsed.atsScore) {
      const basic = buildBasicAnalysis(resumeText, role, jobDescription);
      parsed.atsScore = basic.atsScore;
      parsed.improvements = parsed.improvements || basic.improvements;
      parsed.missingKeywords = parsed.missingKeywords || basic.missingKeywords;
    }
    return parsed;
  } catch (error) {
    console.error(
      "Gemini unavailable, using local analysis:",
      error.response?.data || error.message || error,
    );
    return buildBasicAnalysis(resumeText, role, jobDescription);
  }
};

export const generateResumePDF = async (resumeJson) => {
  try {
    // Generate simple HTML template
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Resume - ${resumeJson.personal_info?.name || "User"}</title>
          <style>
              body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
              h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; margin-bottom: 20px; }
              h2 { color: #2980b9; margin-top: 30px; border-bottom: 1px solid #bdc3c7; padding-bottom: 5px; }
              .contact-info { margin-bottom: 20px; font-size: 0.9em; color: #7f8c8d; }
              .summary { font-style: italic; margin-bottom: 30px; }
              .job { margin-bottom: 20px; }
              .job-header { display: flex; justify-content: space-between; font-weight: bold; }
              .job-title { font-weight: normal; font-style: italic; color: #555; }
              ul { margin-top: 5px; padding-left: 20px; }
              li { margin-bottom: 5px; }
              .skills { display: flex; flex-wrap: wrap; gap: 10px; }
              .skill-tag { background-color: #ecf0f1; padding: 5px 10px; border-radius: 5px; font-size: 0.9em; }
          </style>
      </head>
      <body>
          <h1>${resumeJson.personal_info?.name || "Your Name"}</h1>
          <div class="contact-info">
              ${resumeJson.personal_info?.email || ""} | 
              ${resumeJson.personal_info?.phone || ""} | 
              ${resumeJson.personal_info?.linkedin || ""}
          </div>
          
          <div class="summary">
              ${resumeJson.summary || ""}
          </div>
          
          <h2>Experience</h2>
          ${(resumeJson.experience || [])
            .map(
              (job) => `
              <div class="job">
                  <div class="job-header">
                      <span>${job.company}</span>
                      <span>${job.dates}</span>
                  </div>
                  <div class="job-title">${job.title}</div>
                  <ul>
                      ${(job.responsibilities || []).map((resp) => `<li>${resp}</li>`).join("")}
                  </ul>
              </div>
          `,
            )
            .join("")}
          
          <h2>Education</h2>
          ${(resumeJson.education || [])
            .map(
              (edu) => `
              <div class="job">
                  <div class="job-header">
                      <span>${edu.institution}</span>
                      <span>${edu.dates}</span>
                  </div>
                  <div class="job-title">${edu.degree}</div>
              </div>
          `,
            )
            .join("")}
          
          <h2>Skills</h2>
          <div class="skills">
              ${(resumeJson.skills || []).map((skill) => `<span class="skill-tag">${skill}</span>`).join("")}
          </div>
      </body>
      </html>
    `;

    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    await page.setContent(htmlContent, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20mm", right: "20mm", bottom: "20mm", left: "20mm" },
    });

    await browser.close();

    return pdfBuffer;
  } catch (error) {
    console.error("Error generating PDF with Puppeteer:", error);
    throw new Error("Failed to generate PDF");
  }
};
