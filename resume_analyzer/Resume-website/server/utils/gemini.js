import { buildBasicAnalysis } from "../services/resumeService.js";

// v1beta supports responseMimeType; the v1 endpoint rejects it (400 Invalid JSON payload).
const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

const DEFAULT_MODELS = ["gemini-2.0-flash", "gemini-1.5-flash-latest"];
const MODELS_FROM_ENV = (process.env.GEMINI_MODELS || "")
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);
const ACTIVE_MODELS = MODELS_FROM_ENV.length ? MODELS_FROM_ENV : DEFAULT_MODELS;

const MAX_PROMPT_CHARS = Number(process.env.GEMINI_MAX_PROMPT_CHARS || 32000);
const MAX_ERROR_TEXT_CHARS = 800;

function getApiUrl(model) {
  const apiKey = getGeminiApiKey();
  return `${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey}`;
}

function getGeminiApiKey() {
  return String(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "").trim();
}

function assertGeminiConfigured() {
  if (!getGeminiApiKey()) {
    throw new Error("GEMINI_API_KEY is not set in environment");
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function sanitizeText(input) {
  return String(input || "")
    .replace(/\u0000/g, "")
    .trim();
}

function truncateForPrompt(text, maxChars = MAX_PROMPT_CHARS) {
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars)}\n\n[...truncated ${text.length - maxChars} chars]`;
}

function shouldRetryStatus(status) {
  return status === 408 || status === 429 || (status >= 500 && status <= 599);
}

function isPermanentQuotaError(message = "") {
  const lower = String(message).toLowerCase();
  return (
    lower.includes("quota exceeded") &&
    (lower.includes("limit: 0") ||
      lower.includes("billing") ||
      lower.includes("free_tier_requests"))
  );
}

function isRetryableError(err) {
  return err?.name === "AbortError" || err?.name === "TypeError";
}

function extractApiError(payload, fallbackText = "") {
  const message =
    payload?.error?.message || fallbackText || "Unknown Gemini API error";
  const compact = sanitizeText(message).slice(0, MAX_ERROR_TEXT_CHARS);
  return compact || "Unknown Gemini API error";
}

function extractCandidateText(data) {
  const candidates = data?.candidates;
  if (!Array.isArray(candidates) || candidates.length === 0) return "";

  const parts = candidates[0]?.content?.parts;
  if (!Array.isArray(parts)) return "";

  return parts
    .map((part) => (typeof part?.text === "string" ? part.text : ""))
    .join("\n")
    .trim();
}

async function callGemini(prompt, options = {}) {
  assertGeminiConfigured();

  const {
    temperature = 0.2,
    maxTokens = 2048,
    timeout = 30000,
    retries = 2,
    responseMimeType,
  } = options;

  const finalPrompt = truncateForPrompt(sanitizeText(prompt));
  if (!finalPrompt) {
    throw new Error("Prompt is required");
  }

  let lastError;

  for (const model of ACTIVE_MODELS) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      let shouldRetry = false;

      try {
        const response = await fetch(getApiUrl(model), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ parts: [{ text: finalPrompt }] }],
            generationConfig: {
              temperature,
              maxOutputTokens: maxTokens,
              ...(responseMimeType && { responseMimeType }),
            },
          }),
        });

        if (!response.ok) {
          let payload;
          try {
            payload = await response.json();
          } catch {
            payload = null;
          }

          const apiError = extractApiError(payload, response.statusText);
          const error = new Error(
            `Model ${model} failed: ${response.status} - ${apiError}`,
          );
          error.status = response.status;
          shouldRetry =
            shouldRetryStatus(response.status) &&
            !isPermanentQuotaError(apiError);
          throw error;
        }

        const data = await response.json();
        const text = extractCandidateText(data);

        if (!text) {
          throw new Error(`Empty response from ${model}`);
        }

        return text;
      } catch (err) {
        lastError = err;
        shouldRetry = shouldRetry || isRetryableError(err);

        const prefix = shouldRetry ? "Retryable Gemini error" : "Gemini error";
        console.warn(
          `${prefix} (${model}, attempt ${attempt + 1}/${retries + 1}): ${err.message}`,
        );

        if (!shouldRetry) {
          break;
        }

        if (attempt < retries) {
          const backoffMs =
            300 * 2 ** attempt + Math.floor(Math.random() * 120);
          await sleep(backoffMs);
        }
      } finally {
        clearTimeout(timeoutId);
      }
    }
  }

  throw new Error(
    `All Gemini models failed. Last error: ${lastError?.message || "Unknown"}`,
  );
}

function safeJsonParse(text) {
  const input = sanitizeText(text);
  const jsonMatch = input.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const withoutFences = jsonMatch ? jsonMatch[1].trim() : input.trim();

  const candidates = [withoutFences, input];
  for (const candidate of candidates) {
    if (!candidate) continue;

    try {
      return JSON.parse(candidate);
    } catch {
      // Try object/array extraction next.
    }

    const objectMatch = candidate.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      try {
        return JSON.parse(objectMatch[0]);
      } catch {
        // Keep trying.
      }
    }

    const arrayMatch = candidate.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      try {
        return JSON.parse(arrayMatch[0]);
      } catch {
        // Keep trying.
      }
    }
  }

  throw new Error(
    `Invalid JSON response from Gemini: ${input.slice(0, MAX_ERROR_TEXT_CHARS)}`,
  );
}

export async function getCodeFeedback(code, language = "plain text") {
  const normalizedCode = sanitizeText(code);
  if (!normalizedCode) {
    throw new Error("Code is required");
  }

  const prompt = `
You are a senior code reviewer.

Analyze the following ${language} code and provide:
- Issues
- Improvements
- Best practices
- Performance suggestions

Keep it concise and practical.

CODE:
${normalizedCode}
`;

  return await callGemini(prompt, {
    temperature: 0.3,
    maxTokens: 1024,
  });
}

export async function analyzeResume(role, jobDescription = "", resumeText) {
  const cleanRole = sanitizeText(role);
  const cleanResumeText = sanitizeText(resumeText);
  const cleanJobDescription = sanitizeText(jobDescription || "N/A");

  if (!cleanRole || !cleanResumeText) {
    throw new Error("Role and resumeText are required");
  }

  const prompt = `
You are an ATS resume analyzer.

Return ONLY valid JSON.

INPUT:
ROLE: ${cleanRole}
JOB DESCRIPTION: ${cleanJobDescription}
RESUME:
${cleanResumeText}

OUTPUT FORMAT:
{
  "atsScore": number,
  "missingKeywords": [],
  "addedKeywords": [],
  "issues": [],
  "suggestions": [],
  "optimizedResume": ""
}

RULES:
- No markdown
- No explanations
- No extra text
- Do not hallucinate fake experience
`;

  const resultText = await callGemini(prompt, {
    temperature: 0.2,
    maxTokens: 2048,
    responseMimeType: "application/json",
  });

  return safeJsonParse(resultText);
}

export async function getAtsTips(parsedData) {
  const cleanData = JSON.stringify(parsedData);

  const prompt = `
You are an expert career coach and ATS specialist.
Analyze the following extracted resume data and provide exactly 3-5 actionable tips to improve the resume's ATS score and professional impact.

EXTRACTED DATA:
${cleanData}

Return ONLY a JSON array of strings (the tips).
Example: ["Add more quantifiable achievements", "Include missing keywords like 'React'"]

RULES:
- No markdown
- No explanations
- No extra text
`;

  const resultText = await callGemini(prompt, {
    temperature: 0.3,
    maxTokens: 512,
    responseMimeType: "application/json",
  });

  return safeJsonParse(resultText);
}

function buildLocalFixResume(resumeText, jobDescription = "", role = "") {
  const basic = buildBasicAnalysis(resumeText, role, jobDescription);
  const improvementBlock = basic.improvements
    .map((item, i) => `${i + 1}. ${item}`)
    .join("\n");

  return {
    improvedResume: `${resumeText.trim()}\n\n--- Recommended improvements ---\n${improvementBlock}`,
    atsScoreBefore: Math.max(35, (basic.atsScore || 70) - 12),
    atsScoreAfter: basic.atsScore || 70,
    improvements: basic.improvements,
    keywordsAdded: (basic.missingKeywords || []).slice(0, 8),
    suggestionsApplied: basic.improvements,
    _source: "local",
  };
}

export async function fixResumeWithAI(
  resumeText,
  jobDescription = "",
  role = "",
) {
  const cleanResumeText = sanitizeText(resumeText);
  const cleanJobDescription = sanitizeText(jobDescription || "N/A");
  const cleanRole = sanitizeText(role || "desired position not specified");

  if (!cleanResumeText) {
    throw new Error("Resume text is required");
  }

  const prompt = `
You are an expert ATS resume optimizer specializing in improving resume ATS scores and matching.

Your task is to improve the provided resume to:
1. Increase ATS score by optimizing keyword placement
2. Add quantifiable achievements and metrics
3. Use strong action verbs
4. Improve formatting for ATS compatibility
5. Match it with the target role and job description

INPUT:
TARGET ROLE: ${cleanRole}
JOB DESCRIPTION: ${cleanJobDescription}
ORIGINAL RESUME:
${cleanResumeText}

OUTPUT: Return ONLY valid JSON (no markdown, no explanations)
{
  "improvedResume": "the complete improved resume text",
  "atsScoreBefore": 0-100,
  "atsScoreAfter": 0-100,
  "improvements": ["improvement 1", "improvement 2", ...],
  "keywordsAdded": ["keyword1", "keyword2", ...],
  "suggestionsApplied": ["suggestion 1", "suggestion 2", ...]
}

RULES:
- Do NOT hallucinate professional experience
- Enhance existing content with better wording
- Add missing sections if clearly needed
- Keep the resume realistic and honest
- Start action verbs with capital letters
- Include metrics and quantifiable results
- Format for ATS (no tables, no images, simple formatting)
`;

  try {
    const resultText = await callGemini(prompt, {
      temperature: 0.4,
      maxTokens: 4096,
      responseMimeType: "application/json",
    });
    return safeJsonParse(resultText);
  } catch (error) {
    console.warn("fixResumeWithAI fallback:", error.message);
    return buildLocalFixResume(cleanResumeText, cleanJobDescription, cleanRole);
  }
}

export async function analyzeTemplateIssues(resumeText) {
  const cleanResumeText = sanitizeText(resumeText);

  if (!cleanResumeText) {
    throw new Error("Resume text is required");
  }

  const prompt = `
You are an expert resume formatter and ATS specialist with deep knowledge of industry standards.

Analyze this resume for template, formatting, and structural issues. Return ONLY valid JSON.

RESUME:
${cleanResumeText}

OUTPUT: Return ONLY valid JSON (no markdown, no code blocks, no explanations)
{
  "templateIssues": [
    {
      "issue": "description of the issue",
      "severity": "critical" | "high" | "medium" | "low",
      "impact": "how this affects ATS compatibility or readability",
      "example": "what you found in the resume"
    }
  ],
  "formattingProblems": [
    "formatting problem 1",
    "formatting problem 2"
  ],
  "structuralIssues": [
    "structural issue 1",
    "structural issue 2"
  ],
  "missingRecommendedSections": ["section 1", "section 2"],
  "improvementSuggestions": [
    {
      "area": "e.g., Experience, Education, Skills",
      "suggestion": "specific actionable improvement",
      "reason": "why this matters"
    }
  ],
  "overallTemplateScore": 0-100,
  "templateRecommendations": "2-3 sentence summary of how to improve the template"
}

RULES:
- Identify REAL issues only
- Check for: consistency, spacing, bullet points, dates, email format, phone format
- Look for: excessive whitespace, poor section organization, missing headers
- Check if dates are consistent in format (MM/DD/YYYY, Month Year, etc)
- Evaluate if contact info is easy for ATS to parse
- Note any unusual formatting that might confuse ATS
`;

  const resultText = await callGemini(prompt, {
    temperature: 0.2,
    maxTokens: 2048,
    responseMimeType: "application/json",
  });

  return safeJsonParse(resultText);
}

export async function comprehensiveResumeAnalysis(
  resumeText,
  jobDescription = "",
  jobRole = "",
) {
  const cleanResumeText = sanitizeText(resumeText);
  const cleanJobDescription = sanitizeText(jobDescription || "N/A");
  const cleanJobRole = sanitizeText(jobRole || "relevant position");

  if (!cleanResumeText) {
    throw new Error("Resume text is required");
  }

  const prompt = `
You are an expert resume analyst with deep knowledge of industry standards, job requirements, and hiring practices. Provide a COMPREHENSIVE, DETAILED analysis.

RESUME:
${cleanResumeText}

${jobRole ? `TARGET ROLE: ${cleanJobRole}` : ""}
${jobDescription ? `JOB DESCRIPTION:\n${cleanJobDescription}` : ""}

Return ONLY valid JSON (no markdown, no explanations):
{
  "overallAssessment": "detailed assessment of quality, effectiveness, and alignment",
  "professionalProfile": "analysis of career narrative and trajectory",
  "skillsAnalysis": {
    "currentSkills": ["skill1", "skill2", ...],
    "missingSkills": ["skill1", "skill2", ...],
    "skillProficiency": "assessment of expertise level"
  },
  "experienceAnalysis": "detailed feedback on experience presentation",
  "educationAnalysis": "analysis of education section",
  "keyStrengths": ["strength1", "strength2", ...],
  "areasForImprovement": ["area1", "area2", ...],
  "recommendedCoursesOrCertifications": ["course1", "course2", ...],
  "atsScore": 0-100,
  "atsOptimizationNotes": "specific suggestions to improve ATS",
  "resumeScore": 0-100,
  ${jobRole ? '"roleAlignmentAnalysis": "how well resume matches target role",' : ""}
  ${jobDescription ? '"jobMatchAnalysis": {"matchPercentage": 0-100, "keyMissingRequirements": ["req1", "req2"]},' : ""}
  "nextSteps": ["step1", "step2", ...]
}

SCORING RULES:
- ATS Score: 0-100 based entirely on formatting, keywords, structure
- Resume Score: 0-100 based on content quality, organization, effectiveness
- Use 0-40 for resumes with significant issues
- Use 40-60 for average resumes
- Use 60-80 for good resumes
- Use 80-100 for excellent resumes
`;

  const resultText = await callGemini(prompt, {
    temperature: 0.3,
    maxTokens: 3000,
    responseMimeType: "application/json",
  });

  return safeJsonParse(resultText);
}
