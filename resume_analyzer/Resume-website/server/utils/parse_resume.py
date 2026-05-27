import sys
import json
import warnings
import os
import spacy
from spacy.matcher import Matcher
import re

# Suppress warnings
warnings.filterwarnings("ignore")

class SimpleResumeParser:
    def __init__(self):
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except:
            # Fallback if model not found
            import os
            os.system("python -m spacy download en_core_web_sm")
            self.nlp = spacy.load("en_core_web_sm")
        
        self.matcher = Matcher(self.nlp.vocab)
        self.skills_list = [
            "python", "java", "c++", "javascript", "react", "node.js", "express", "mongodb",
            "html", "css", "sql", "aws", "docker", "kubernetes", "machine learning",
            "deep learning", "flask", "django", "typescript", "angular", "vue", "rest api",
            "git", "ci/cd", "agile", "scrum", "project management", "nlp", "tensorflow", "pytorch"
        ]

    def extract_text_from_pdf(self, file_path):
        from pdfminer.high_level import extract_text
        return extract_text(file_path)

    def extract_text_from_docx(self, file_path):
        import docx2txt
        return docx2txt.process(file_path)

    def extract_data(self, file_path):
        ext = os.path.splitext(file_path)[1].lower()
        text = ""
        if ext == ".pdf":
            text = self.extract_text_from_pdf(file_path)
        elif ext == ".docx":
            text = self.extract_text_from_docx(file_path)
        else:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                text = f.read()
        
        doc = self.nlp(text)
        
        # Simple extraction logic
        data = {
            "name": self.extract_name(doc),
            "email": self.extract_email(text),
            "mobile_number": self.extract_mobile(text),
            "skills": self.extract_skills(text),
            "degree": self.extract_degree(text),
            "no_of_pages": None, 
            "experience": self.extract_experience(text),
            "raw_text": text
        }
        return data

    def extract_name(self, doc):
        for ent in doc.ents:
            if ent.label_ == "PERSON":
                return ent.text
        return None

    def extract_email(self, text):
        email = re.findall(r"([^@|\s]+@[^@]+\.[^@|\s]+)", text)
        if email:
            return email[0].split()[0].strip(';,')
        return None

    def extract_mobile(self, text):
        phone = re.findall(r"\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}", text)
        if phone:
            return phone[0]
        return None

    def extract_skills(self, text):
        found_skills = []
        lower_text = text.toLowerCase() if hasattr(text, 'toLowerCase') else text.lower()
        for skill in self.skills_list:
            if re.search(r'\b' + re.escape(skill) + r'\b', lower_text):
                found_skills.append(skill)
        return found_skills

    def extract_degree(self, text):
        degrees = ["B.E", "B.Tech", "M.Tech", "B.Sc", "M.Sc", "BCA", "MCA", "PHD", "Bachelor", "Master"]
        found = []
        for d in degrees:
            if d.lower() in text.lower():
                found.append(d)
        return found

    def extract_experience(self, text):
        # Very simple experience extraction
        lines = text.split('\n')
        exp = []
        header_found = False
        for line in lines:
            if re.search(r'experience|work history|employment', line.lower()):
                header_found = True
                continue
            if header_found:
                if line.strip() == "" and len(exp) > 5:
                    break
                exp.append(line.strip())
        return exp or None

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No file path provided"}))
        sys.exit(1)
    
    file_path = sys.argv[1]
    parser = SimpleResumeParser()
    try:
        result = parser.extract_data(file_path)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
