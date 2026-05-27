import express from 'express';
import multer from 'multer';
import { uploadResume, analyzeResume, generateResume, fixResume } from '../controllers/resumeController.js';

const router = express.Router();


const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are allowed!'), false);
    }
  }
});

router.post('/upload', upload.single('file'), uploadResume);
router.post('/analyze', analyzeResume);
router.post('/fix', fixResume);
router.post('/generate', generateResume);

export default router;
