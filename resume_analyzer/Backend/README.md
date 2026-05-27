# Backend Architecture & Best Practices

This directory contains the Python ML backend for the AI Resume Analyzer.

## Recommended Scalable Folder Structure

As the project grows, keeping all Python files in the root directory will become unmanageable. We highly recommend adopting the following scalable architecture:

```
backend/
├── app/
│   ├── api/                 # Flask routes and blueprints
│   │   ├── routes.py        # Centralized endpoint definitions
│   │   └── dependencies.py  # Request validation and auth middleware
│   ├── core/                # Configuration and setup
│   │   ├── config.py        # Environment variables and secrets
│   │   └── security.py      # Auth handlers
│   ├── services/            # Business logic and ML models
│   │   ├── ats_scorer.py    # ATS scoring heuristics
│   │   ├── jd_matcher.py    # Semantic matching logic
│   │   ├── extractor.py     # Text extraction (PDF/DOCX/TXT)
│   │   └── section_detector.py # NLP-based section identification
│   └── main.py              # Application entry point
├── tests/                   # Unit and integration tests
├── uploads/                 # Temporary storage (should be migrated to S3)
├── requirements.txt
└── README.md
```

## Separation of Concerns

1. **API Layer (`app/api`)**: Should only handle HTTP requests, validate incoming data, and return JSON responses. It should **not** contain business logic.
2. **Service Layer (`app/services`)**: Contains the core logic (e.g., `run_pipeline`, `score_file`). It accepts raw data (like text or buffers) and returns Python objects or dictionaries.
3. **Core Layer (`app/core`)**: Manages configurations like `ALLOWED_EXTENSIONS`, port numbers, and logging setups.

## File Handling in Production

Currently, uploaded files are saved to the local disk in the `uploads/` directory. While acceptable for a small proof-of-concept, this approach will fail in a load-balanced production environment (e.g., AWS Elastic Beanstalk, Heroku) because local files are not shared across server instances.

**Recommendation:** Modify the extraction pipeline (`extractor.py`) to process file streams (buffers) directly in-memory, or upload them to a dedicated object storage service like AWS S3 and pass the S3 URI to the extraction tools.

## Error Handling

We have implemented a global error handler for Flask (`@app.errorhandler(Exception)`). This ensures that any unhandled exception during the ML pipeline execution gracefully returns a standard JSON response (`{ "success": False, "error": "Detailed message" }`) rather than an HTML 500 page, which would break the Node.js API Gateway.
