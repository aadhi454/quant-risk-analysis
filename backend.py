from __future__ import annotations

import json
from pathlib import Path

from flask import Flask, jsonify, send_from_directory


BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = BASE_DIR / "frontend"
SIMULATION_FILE = BASE_DIR / "simulation.json"

app = Flask(__name__)


@app.route("/api/simulation")
def simulation():
    if not SIMULATION_FILE.exists():
        return jsonify({"error": "simulation.json not found"}), 404

    try:
        with SIMULATION_FILE.open("r", encoding="utf-8") as file:
            data = json.load(file)
    except json.JSONDecodeError:
        return jsonify({"error": "simulation.json is invalid"}), 500

    response = jsonify(data)
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response


@app.route("/api/status")
def status():
    response = jsonify({"status": "running"})
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response


@app.route("/")
def landing():
    return send_from_directory(FRONTEND_DIR, "landing.html")


@app.route("/<path:filename>")
def frontend_files(filename: str):
    return send_from_directory(FRONTEND_DIR, filename)


if __name__ == "__main__":
    app.run(debug=True, port=5000)
