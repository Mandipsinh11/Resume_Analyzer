import fs from "fs";
import path from "path";
import { getCodeFeedback } from "../utils/gemini.js";

export const uploadCodeFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Code file is required" });
    }
    const codePath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();
    const languageMap = {
      ".js": "JavaScript",
      ".py": "Python",
      ".java": "Java",
      ".c": "C",
      ".cpp": "C++",
      ".ts": "TypeScript",
      ".json": "JSON",
      ".md": "Markdown",
      ".txt": "plain text",
    };
    const language = languageMap[ext] || "plain text";
    const code = fs.readFileSync(codePath, "utf8");
    const feedback = await getCodeFeedback(code, language);
    return res.status(200).json({
      message: "Code uploaded and feedback generated",
      filename: req.file.filename,
      language,
      feedback,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
