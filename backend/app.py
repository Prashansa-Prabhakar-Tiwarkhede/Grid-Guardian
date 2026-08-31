"""
Grid Guardian - Backend API
Flask server providing simulated grid telemetry, Groq-powered contextual
threat classification, KPI metrics, and workforce task orchestration.
"""
import os
import time
import uuid
import random
from datetime import datetime, timezone

from flask import Flask, jsonify, request
from flask_cors import CORS

from simulator import ASSETS, generate_event
from groq_client import classify_event

app = Flask(__name__)
CORS(app)

# ---------------------------------------------------------------------------
# In-memory state (swap for a real DB in production)
# ---------------------------------------------------------------------------
EVENTS = []          # all generated telemetry events / incidents
TASKS = []           # workforce task queue (robot vs human assignment)
DETECTION_TIMES = [] # ms latency samples for KPI calc


def now_iso():
    return datetime.now(timezone.utc).isoformat()


# ---------------------------------------------------------------------------
# Assets
# ---------------------------------------------------------------------------
@app.route("/api/assets", methods=["GET"])
def get_assets():
    return jsonify(ASSETS)


# ---------------------------------------------------------------------------
# Events / Vigilance feed
# ---------------------------------------------------------------------------
@app.route("/api/events", methods=["GET"])
def get_events():
    return jsonify(sorted(EVENTS, key=lambda e: e["timestamp"], reverse=True))


@app.route("/api/events/generate", methods=["POST"])
def generate_new_event():
    """Simulate a new sensor/drone telemetry anomaly on a random asset."""
    t0 = time.time()
    event = generate_event()
    event["id"] = str(uuid.uuid4())[:8]
    event["timestamp"] = now_iso()
    event["status"] = "unclassified"
    detection_ms = round((time.time() - t0) * 1000 + random.uniform(600, 4200))
    event["detection_latency_ms"] = detection_ms
    DETECTION_TIMES.append(detection_ms)
    EVENTS.append(event)
    return jsonify(event), 201


@app.route("/api/events/<event_id>/analyze", methods=["POST"])
def analyze_event(event_id):
    """Run the event through Groq for contextual threat classification."""
    event = next((e for e in EVENTS if e["id"] == event_id), None)
    if not event:
        return jsonify({"error": "event not found"}), 404

    t0 = time.time()
    try:
        analysis = classify_event(event)
    except Exception as exc:  # surfaces missing/invalid API key etc.
        return jsonify({"error": str(exc)}), 502
    reasoning_ms = round((time.time() - t0) * 1000)

    event["status"] = "classified"
    event["analysis"] = analysis
    event["reasoning_latency_ms"] = reasoning_ms

    # Auto-spawn a workforce task if the AI recommends action
    if analysis.get("recommended_action") in ("dispatch_robot", "dispatch_technician", "autonomous_patrol"):
        task = {
            "id": str(uuid.uuid4())[:8],
            "event_id": event["id"],
            "asset": event["asset_name"],
            "title": analysis.get("task_title", "Investigate anomaly"),
            "assignment": (
                "robot" if analysis.get("recommended_action") in ("dispatch_robot", "autonomous_patrol")
                else "technician"
            ),
            "priority": analysis.get("threat_level", "medium"),
            "status": "queued",
            "created_at": now_iso(),
        }
        TASKS.append(task)
        event["task_id"] = task["id"]

    return jsonify(event)


# ---------------------------------------------------------------------------
# Workforce task queue
# ---------------------------------------------------------------------------
@app.route("/api/tasks", methods=["GET"])
def get_tasks():
    return jsonify(sorted(TASKS, key=lambda t: t["created_at"], reverse=True))


@app.route("/api/tasks/<task_id>/advance", methods=["POST"])
def advance_task(task_id):
    task = next((t for t in TASKS if t["id"] == task_id), None)
    if not task:
        return jsonify({"error": "task not found"}), 404
    order = ["queued", "in_progress", "resolved"]
    idx = order.index(task["status"])
    task["status"] = order[min(idx + 1, len(order) - 1)]
    return jsonify(task)


# ---------------------------------------------------------------------------
# KPIs — mirrors the success metrics defined in the problem statement
# ---------------------------------------------------------------------------
@app.route("/api/kpis", methods=["GET"])
def get_kpis():
    classified = [e for e in EVENTS if e.get("analysis")]
    total = len(EVENTS)
    threats = [e for e in classified if e["analysis"].get("threat_level") in ("high", "critical")]
    false_positive_est = round(
        (sum(1 for e in classified if e["analysis"].get("threat_level") == "benign") / len(classified) * 100), 1
    ) if classified else 0.0
    avg_detection = round(sum(DETECTION_TIMES) / len(DETECTION_TIMES) / 1000, 2) if DETECTION_TIMES else 0.0
    avg_reasoning = round(
        sum(e["reasoning_latency_ms"] for e in classified) / len(classified) / 1000, 2
    ) if classified else 0.0
    robot_tasks = sum(1 for t in TASKS if t["assignment"] == "robot")
    human_tasks = sum(1 for t in TASKS if t["assignment"] == "technician")

    return jsonify({
        "total_events": total,
        "classified_events": len(classified),
        "threats_detected": len(threats),
        "avg_detection_latency_s": avg_detection,
        "avg_reasoning_latency_s": avg_reasoning,
        "false_positive_rate_pct": false_positive_est,
        "robot_dispatched": robot_tasks,
        "technician_dispatched": human_tasks,
        "workforce_multiplier": round((robot_tasks + human_tasks) / max(human_tasks, 1), 1) if TASKS else 1.0,
    })


@app.route("/api/reset", methods=["POST"])
def reset_state():
    EVENTS.clear()
    TASKS.clear()
    DETECTION_TIMES.clear()
    return jsonify({"status": "reset"})


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "groq_configured": bool(os.environ.get("GROQ_API_KEY"))})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
