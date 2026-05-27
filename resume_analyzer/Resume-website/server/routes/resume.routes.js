import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import { protect } from "../middleware/auth.middleware.js";
import { uploadResume, analyzeResume, fixResumeAI, generateReportPDF } from "../controllers/resume.controller.js";

const router = express.Router();

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    const uniqueName = `${Date.now()}_${safeName}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF or DOCX documents are allowed"));
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

router.post("/upload", protect, upload.single("resume"), uploadResume);
router.post("/analyze", protect, analyzeResume);
router.post("/fix-resume", protect, fixResumeAI);
router.post("/generate-report", protect, generateReportPDF);

export default router;
