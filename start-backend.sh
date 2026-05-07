#!/bin/bash
# MONTRO — Start FastAPI backend
cd "$(dirname "$0")"
source venv/bin/activate
uvicorn api:app --host 0.0.0.0 --port 8000 --reload
