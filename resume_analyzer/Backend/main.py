"""
main.py
=======
Flask REST API — entry point for the AI Resume Analyzer frontend.

Endpoints
---------
POST /api/analyze          — Full pipeline: extract + detect sections + extract skills
POST /api/ats-score        — ATS score + improvement suggestions (requires JD)
POST /api/jd-match         — JD match report only
GET  /api/health           — Health check

All endpoints accept multipart/form-data with a `resume` file field.
/api/ats-score and /api/jd-match also require a `jd_text` field.

Usage
-----
    pip install flask flask-cors pdfplumber python-docx
    python main.py

    # Or with gunicorn in production:
    gunicorn -w 4 -b 0.0.0.0:5000 main:app
"""

import os
import uuid
import traceback
from pathlib import Path

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_talisman import Talisman
from werkzeug.exceptions import HTTPException

from pipeline import run_pipeline # type: ignore
from ats_scorer import ATSScorer
from extractor import extract_text # type: ignore
from jd_matcher import JDMatcher



# App setup

app = Flask(__name__)
CORS(app)  # Allow all origins — restrict to your frontend domain in production

Talisman(app, force_https=False)

UPLOAD_FOLDER = Path("uploads")
UPLOAD_FOLDER.mkdir(exist_ok=True)

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc", ".txt"}
MAX_FILE_SIZE_MB = 5


# Helpers
def _allowed_file(filename: str) -> bool:
    return Path(filename).suffix.lower() in ALLOWED_EXTENSIONS


def _save_upload(file) -> Path:
    """Save the uploaded file with a unique name and return its path."""
    ext = Path(file.filename).suffix.lower()
    unique_name = f"{uuid.uuid4().hex}{ext}"
    save_path = UPLOAD_FOLDER / unique_name
    file.save(save_path)
    return save_path


def _cleanup(path: Path) -> None:
    """Delete a temporary upload after processing."""
    try:
        path.unlink(missing_ok=True)
    except Exception:
        pass


def _error(message: str, status: int = 400):
    return jsonify({"success": False, "error": message}), status


def _validate_resume_upload(request) -> tuple:
    """
    Validates that the request contains a valid resume file.
    Returns (file_object, error_response) — one will be None.
    """
    if "resume" not in request.files:
        return None, _error("No resume file provided. Send it as 'resume' in form-data.")

    file = request.files["resume"]

    if not file.filename:
        return None, _error("File has no name.")

    if not _allowed_file(file.filename):
        return None, _error(f"Unsupported file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}")

    return file, None


# Routes

@app.route("/api/health", methods=["GET"])
def health():
    """Simple liveness check."""
    return jsonify({"success": True, "status": "ok", "service": "AI Resume Analyzer"})

@app.route("/api/analyze", methods=["POST"])
def analyze():
    """
    Full NLP pipeline: text extraction → section detection → skill extraction.

    Form data:
        resume  (file)   — PDF or DOCX resume
        jd_text (string) — Optional job description text

    Response: {
        success, candidate, meta, sections, extracted_skills, ats_score, jd_match
    }
    """
    file, err = _validate_resume_upload(request)
    if err:
        return err

    jd_text = request.form.get("jd_text", "").strip()
    save_path = _save_upload(file)

    try:
        result = run_pipeline(str(save_path), jd_text=jd_text)

        if result.get("error"):
            return _error(result["error"])

        return jsonify({"success": True, **result})

    except Exception as e:
        traceback.print_exc()
        return _error(f"Pipeline error: {str(e)}", 500)

    finally:
        _cleanup(save_path)

@app.route("/api/ats-score", methods=["POST"])
def ats_score():
    """
    Full ATS scoring with improvement suggestions.

    Form data:
        resume  (file)   — PDF or DOCX resume
        jd_text (string) — Job description text (required)

    Response: {
        success,
        ats_score,
        grade,
        grade_detail,
        score_breakdown,
        sections_detected,
        technical_skills,
        certifications,
        keywords_required,
        match_analysis,
        improvements
    }
    """
    file, err = _validate_resume_upload(request)
    if err:
        return err

    jd_text = request.form.get("jd_text", "").strip()
    if not jd_text:
        return _error("'jd_text' is required for ATS scoring.")

    save_path = _save_upload(file)

    try:
        scorer = ATSScorer()
        result = scorer.score_file(str(save_path), jd_text)
        return jsonify({"success": True, **result.to_dict()})

    except Exception as e:
        traceback.print_exc()
        return _error(f"ATS scoring error: {str(e)}", 500)

    finally:
        _cleanup(save_path)

@app.route("/api/jd-match", methods=["POST"])
def jd_match():
    """
    Job description match report — skill gaps, keyword gaps, certifications.

    Form data:
        resume  (file)   — PDF or DOCX resume
        jd_text (string) — Job description text (required)

    Response: {
        success,
        overall_match_pct,
        jd_seniority_level,
        jd_required_degree,
        dimensions,
        skills   { matched, missing, bonus_in_resume },
        keywords { matched, missing },
        certifications { matched, missing },
        keyword_details
    }
    """
    file, err = _validate_resume_upload(request)
    if err:
        return err

    jd_text = request.form.get("jd_text", "").strip()
    if not jd_text:
        return _error("'jd_text' is required for JD matching.")

    save_path = _save_upload(file)

    try:
        resume_text = extract_text_from_file(str(save_path))
        matcher = JDMatcher()
        report = matcher.match(resume_text, jd_text)
        return jsonify({"success": True, **report.to_dict()})

    except Exception as e:
        traceback.print_exc()
        return _error(f"JD match error: {str(e)}", 500)

    finally:
        _cleanup(save_path)


# Error handlers
@app.errorhandler(404)
def not_found(_):
    return _error("Endpoint not found.", 404)


@app.errorhandler(405)
def method_not_allowed(_):
    return _error("Method not allowed.", 405)


@app.errorhandler(413)
def too_large(_):
    return _error(f"File too large. Maximum size is {MAX_FILE_SIZE_MB} MB.", 413)


@app.errorhandler(500)
def internal_error(error):
    return _error("Internal server error.", 500)


@app.errorhandler(Exception)
def handle_exception(e):
    # Pass through HTTP errors
    if isinstance(e, HTTPException):
        return _error(e.description, e.code)
    # Handle non-HTTP exceptions
    traceback.print_exc()
    return _error(f"Unexpected error: {str(e)}", 500)

@app.route("/")
def home():
    return jsonify({
        "success": True,
        "message": "Backend secured successfully"
    }) 

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "true").lower() == "true"
    print(f"Starting AI Resume Analyzer API on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=debug)