"""
pipeline.py
===========
The orchestrator. Calls extractor -> section_detector -> skill_extractor
in sequence and produces the final structured JSON.
"""

import re
import sys
import json
from extractor import extract_text, _clean_text # type: ignore

from section_detector import detect_sections # type: ignore
from skill_extractor import extract_skills  # type: ignore

def run_pipeline(file_path: str, jd_text: str = "") -> dict:  # type: ignore
    print(f"[1/4] Extracting text from: {file_path}")
    extraction = extract_text(file_path) # type: ignore

    if extraction["error"]:
        return {"error": extraction["error"], "file_path": file_path} # type: ignore

    if extraction["char_count"] < 100:
        return {"error": "Extracted text too short — file may be image-based.", "char_count": extraction["char_count"]} # type: ignore

    raw_text = extraction["raw_text"] # type: ignore

    print("[2/4] Detecting sections...")
    sections = detect_sections(raw_text) # type: ignore

    print("[3/4] Extracting skills...")
    skills = extract_skills(sections) # type: ignore

    print("[4/4] Parsing candidate information...")
    header_block = sections.pop("_header_block", "") # type: ignore
    candidate = _parse_candidate_info(header_block, raw_text) # type: ignore

    result = {
        "candidate": candidate,
        "meta": {
            "file_type": extraction["file_type"],
            "page_count": extraction["page_count"],
            "char_count": extraction["char_count"],
        },
        "sections": {k: v for k, v in sections.items() if v.strip()}, # type: ignore
        "extracted_skills": skills,
        "ats_score": None,
        "jd_match": None,
    } # type: ignore

    if jd_text and jd_text.strip():
        try:
            from ats_scorer import ATSScorer  # type: ignore
            from jd_matcher import JDMatcher  # type: ignore

            scorer = ATSScorer()
            ats_result = scorer.score_file(file_path, jd_text.strip())
            result["ats_score"] = ats_result.to_dict() # type: ignore

            matcher = JDMatcher()
            result["jd_match"] = matcher.match(raw_text, jd_text.strip()).to_dict() # type: ignore
        except Exception as exc:
            print(f"[warn] ATS/JD scoring skipped: {exc}")

    return result


def _parse_candidate_info(header_block: str, full_text: str) -> dict: # type: ignore
    search_text = header_block if header_block.strip() else full_text[:500]
    lines = [l.strip() for l in search_text.splitlines() if l.strip()]
    return {
        "name":     _extract_name(lines),
        "email":    _extract_email(search_text),
        "phone":    _extract_phone(search_text),
        "linkedin": _extract_linkedin(search_text),
        "github":   _extract_github(search_text),
        "location": _extract_location(lines, search_text),
    } # type: ignore


def _extract_name(lines): # type: ignore
    for line in lines[:5]: # type: ignore
        if re.search(r'[@/\\|]|\d{5,}', line): # type: ignore
            continue
        if len(line) > 50: # type: ignore
            continue
        words = line.split() # type: ignore
        if 2 <= len(words) <= 5: # type: ignore
            if re.match(r'^[A-Za-z][A-Za-z\s\-\.]+$', line): # type: ignore
                return line # type: ignore
    return ""


def _extract_email(text): # type: ignore
    match = re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text) # type: ignore
    return match.group(0).lower() if match else ""


def _extract_phone(text): # type: ignore
    match = re.search(r'(\+?\d{1,3}[\s\-]?)?(\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{4}|\d{10})', text) # type: ignore
    return match.group(0).strip() if match else ""


def _extract_linkedin(text): # type: ignore
    match = re.search(r'linkedin\.com/in/[A-Za-z0-9\-_%]+', text, re.IGNORECASE) # type: ignore
    return match.group(0) if match else ""


def _extract_github(text): # type: ignore
    match = re.search(r'github\.com/[A-Za-z0-9\-_]+', text, re.IGNORECASE) # type: ignore
    return match.group(0) if match else ""


def _extract_location(lines, text): # type: ignore
    match = re.search(r'\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)*),\s*([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)\b', text[:500]) # type: ignore
    return match.group(0) if match else ""


def save_result(result, output_path="output.json"): # type: ignore
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    print(f"\nResult saved to: {output_path}")


if __name__ == "__main__":
    if len(sys.argv) >= 2:
        result = run_pipeline(sys.argv[1]) # type: ignore
    else:
        print("No file provided — running with mock resume text.\n")
        mock_resume = """John Doe
john.doe@email.com | +91-9876543210 | linkedin.com/in/johndoe | github.com/johndoe
Ahmedabad, Gujarat

SUMMARY
Final year B.Tech Computer Science student. Skilled in Python, Django,
and REST API development. Passionate about machine learning and NLP.

EXPERIENCE
Software Development Intern - TechCorp, Ahmedabad
June 2024 - August 2024
- Built REST APIs using FastAPI and deployed to AWS EC2
- Reduced database query time by 40% using PostgreSQL indexing
- Containerized services with Docker and Kubernetes

EDUCATION
B.Tech Computer Science Engineering
GCET, Vallabh Vidyanagar - 2021-2025  CGPA: 8.4

SKILLS
Python, Django, FastAPI, PostgreSQL, MySQL
Git, Docker, Linux, VS Code, Postman
Machine Learning, NLP, scikit-learn, TensorFlow

PROJECTS
Resume Analyzer - NLP-based resume scoring tool
Built an end-to-end NLP pipeline using spaCy and sentence-transformers.

CERTIFICATIONS
AWS Cloud Practitioner - Amazon Web Services, 2024
Python for Data Science - Coursera, 2023
"""
        cleaned = _clean_text(mock_resume)
        sections = detect_sections(cleaned) # type: ignore
        skills = extract_skills(sections) # type: ignore
        header_block = sections.pop("_header_block", "") # type: ignore
        candidate = _parse_candidate_info(header_block, cleaned) # type: ignore
        result = { # type: ignore
            "candidate": candidate,
            "meta": {"file_type": "mock", "page_count": 1, "char_count": len(cleaned)},
            "sections": {k: v for k, v in sections.items() if v.strip()}, # type: ignore
            "extracted_skills": skills,
            "ats_score": None,
            "jd_match": None,
        }

    print("\n" + "=" * 55)
    print("FINAL PIPELINE OUTPUT")
    print("=" * 55)
    print(json.dumps(result, indent=2))
    save_result(result)