import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import * as resumeService from '../services/resumeService.js';
import { fixResumeWithAI } from '../utils/gemini.js';

export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    let text = '';
    
    if (req.file.mimetype === 'application/pdf') {
      const data = await pdfParse(req.file.buffer);
      text = data.text ? data.text.replace(/\n\s*\n/g, '\n') : '';
    } else if (req.file.mimetype.includes('word')) {
      const data = await mammoth.extractRawText({ buffer: req.file.buffer });
      text = data.value ? data.value.replace(/\n\s*\n/g, '\n') : '';
    }

    return res.status(200).json({ 
      success: true, 
      text 
    });
  } catch (error) {
    console.error('Error parsing file:', error);
    import('fs').then(fs => fs.writeFileSync('debug_upload.log', String(error.stack || error.message)));
    return res.status(500).json({ error: 'Failed to extract text from file' });
  }
};

export const analyzeResume = async (req, res) => {
  try {
    const { text, role, jobDescription } = req.body;
    if (!text || !String(text).trim()) {
      return res.status(400).json({ error: 'No resume text provided' });
    }

    const improvedJson = await resumeService.analyzeAndImproveResume(
      text,
      role || '',
      jobDescription || ''
    );

    return res.status(200).json({ 
      success: true, 
      data: improvedJson 
    });
  } catch (error) {
    console.error('Error analyzing resume:', error);
    return res.status(500).json({ error: 'Failed to analyze and improve resume' });
  }
};

/** Public AI fix (no auth) — uses Gemini with local fallback. */
export const fixResume = async (req, res) => {
  try {
    const { text, resumeText, role, jobDescription } = req.body;
    const content = sanitizeResumeInput(resumeText || text);

    if (!content) {
      return res.status(400).json({ error: 'Resume text is required' });
    }

    const data = await fixResumeWithAI(
      content,
      jobDescription || '',
      role || ''
    );

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error fixing resume:', error);
    return res.status(500).json({ error: 'Failed to fix resume' });
  }
};

function sanitizeResumeInput(value) {
  return String(value || '').replace(/\u0000/g, '').trim();
}

export const generateResume = async (req, res) => {
  try {
    const resumeJson = req.body;
    if (!resumeJson || Object.keys(resumeJson).length === 0) {
      return res.status(400).json({ error: 'No resume JSON data provided' });
    }

    const pdfBuffer = await resumeService.generateResumePDF(resumeJson);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="improved_resume.pdf"',
      'Content-Length': pdfBuffer.length
    });

    return res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    return res.status(500).json({ error: 'Failed to generate PDF' });
  }
};
