from flask import Flask, render_template, request, jsonify
import sqlite3
from pathlib import Path
from datetime import datetime

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "database.db"

app = Flask(__name__)

def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS answers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question TEXT NOT NULL,
            answer TEXT,
            created_at TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()

@app.route("/")
def index():
    return render_template("index.html")

@app.post("/save-answer")
def save_answer():
    data = request.get_json(silent=True) or {}
    question = str(data.get("question", "")).strip()
    answer = str(data.get("answer", "")).strip()

    if not question:
        return jsonify({"ok": False, "error": "Missing question"}), 400

    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        "INSERT INTO answers (question, answer, created_at) VALUES (?, ?, ?)",
        (question, answer, datetime.now().isoformat(timespec="seconds"))
    )
    conn.commit()
    conn.close()
    return jsonify({"ok": True})

if __name__ == "__main__":
    init_db()
    app.run(debug=True)
