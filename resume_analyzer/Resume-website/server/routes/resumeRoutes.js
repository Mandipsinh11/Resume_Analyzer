import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import {
  uploadResume,
  analyzeResume,
  generateResume,
  fixResume,
} from "../controllers/resumeController.js";

const router = express.Router();

router.post("/upload", upload.single("file"), uploadResume);
router.post("/analyze", analyzeResume);
router.post("/fix", fixResume);
router.post("/generate", generateResume);

export default router;
