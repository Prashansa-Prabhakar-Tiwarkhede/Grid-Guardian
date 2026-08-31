"""
Wraps the Groq API to perform contextual threat classification on a
simulated telemetry event — the "AI & Edge Processing" layer described in
the problem statement (real-time, contextual, distinguishing benign
wear-and-tear from a genuine physical / cyber-physical threat).
"""
import os
import json

from groq import Groq

MODEL = os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile")

SYSTEM_PROMPT = """You are the on-edge contextual threat classification module of an \
autonomous grid vigilance system for a European Distribution System Operator (DSO). \
You receive a single raw sensor/drone telemetry reading from a substation, overhead \
line, or underground asset and must reason about it the way a grid control-room \
analyst would: distinguishing routine equipment wear-and-tear or environmental noise \
from a genuine physical or cyber-physical threat (e.g. sabotage, intrusion, conductive \
object attack, imminent equipment failure).

Guiding principles you must follow:
- Augment, not replace, the human workforce.
- Only recommend dispatching a human technician into a hazardous or live-energy \
environment when a robot/drone cannot safely or effectively handle the task.
- Prefer "autonomous_patrol" or "dispatch_robot" for anything involving proximity to \
live/energized equipment.
- Be skeptical of noisy environments (weather, wildlife) before declaring a threat.

Respond with ONLY a JSON object, no prose, no markdown fences, matching exactly this shape:
{
  "threat_level": "benign" | "low" | "medium" | "high" | "critical",
  "is_threat": true | false,
  "confidence_pct": <integer 0-100>,
  "reasoning": "<2-3 sentence analyst-style explanation, plain text>",
  "recommended_action": "monitor_only" | "autonomous_patrol" | "dispatch_robot" | "dispatch_technician",
  "task_title": "<short imperative task description if action is needed, else empty string>"
}"""


def _client():
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        raise RuntimeError(
            "GROQ_API_KEY is not set. Export it as an environment variable before "
            "starting the backend (see backend/.env.example)."
        )
    return Groq(api_key=api_key)


def classify_event(event: dict) -> dict:
    user_prompt = f"""Asset: {event['asset_name']} ({event['asset_voltage']} voltage class)
Event kind: {event['kind']}
Sensor source: {event['sensor_source']}
Raw reading: {event['raw_detail']}
Ambient conditions: {event['weather']}

Classify this event."""

    client = _client()
    completion = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.3,
        max_tokens=400,
        response_format={"type": "json_object"},
    )
    content = completion.choices[0].message.content
    return json.loads(content)
