<<<<<<< HEAD
# Grid Guardian
### An AI Vigilance & Workforce Safety Copilot for European Energy Networks

Built for: *Robotics & AI for Grid Vigilance and Workforce Safety* (E.ON / Infosys)

## What this is

A working TRL-2 concept demo — a Flask + React dashboard, powered by the **Groq API**
for real-time contextual threat classification — that addresses both problem clusters
at once:

- **Cluster 1 (Vigilance & Resilience):** simulates sensor/drone telemetry from
  substations, overhead lines and underground feeders (thermal, acoustic, LiDAR,
  corona-discharge, SF6 gas). Each raw reading is sent to Groq, which reasons about it
  the way a control-room analyst would — separating genuine physical/cyber-physical
  threats (conductive-object attacks, perimeter breaches) from benign noise (weather,
  wildlife, routine wear).
- **Cluster 2 (Workforce Safety & Automation):** every confirmed threat auto-generates
  a workforce task, assigned to a **robot/autonomous patrol** or a **human technician**
  depending on proximity to live equipment — directly implementing the "augment, not
  replace" and "reduce hands-on contact with energized components" guardrails from the
  brief.

The dashboard also surfaces the exact KPIs called out in the problem statement:
detection latency (<10s target), AI reasoning/edge latency (<2s target), false-positive
rate (<10% target), and a "workforce multiplier" metric evidencing the 10x supervised
maintenance-volume claim.

## Architecture

```
grid-guardian/
├── backend/            Flask API
│   ├── app.py          REST endpoints (events, tasks, KPIs)
│   ├── simulator.py    Simulated grid assets + sensor telemetry generator
│   ├── groq_client.py  Groq-powered contextual threat classification
│   └── requirements.txt
└── frontend/            React + Vite dashboard
    └── src/
        ├── App.jsx
        ├── api.js
        └── components/
            ├── TopologyMap.jsx    live one-line grid diagram
            ├── EventFeed.jsx      telemetry / vigilance feed
            ├── IncidentPanel.jsx  Groq reasoning detail view
            ├── KpiStrip.jsx       success-metric cards
            └── TaskBoard.jsx      robot vs. technician task kanban
```

**Why this maps to the brief's guardrails:**
- *Edge autonomy / offline operation* → in a production build, the classification
  model would be distilled to run on-device; here Groq stands in as the low-latency
  reasoning layer to prove the concept (Groq's inference speed is itself a reasonable
  proxy for the <2s edge-latency requirement).
- *Standardized interfaces* → the Flask API is a clean REST layer that a real
  deployment would back onto IEC 61850 / MODBUS telemetry instead of the simulator.
- *Augment, not replace* → the task board never fully automates response; robots are
  dispatched for live-line-proximity work, technicians remain in the loop for judgment
  calls.

## Running it locally

### 1. Backend

```bash
cd backend
python3 -m venv venv && source venv/bin/activate   # optional
pip install -r requirements.txt
cp .env.example .env        # then edit .env and add your real GROQ_API_KEY
export $(cat .env | xargs)  # or use python-dotenv / your shell's env loading
python3 app.py
```

The API runs at `http://localhost:5000`. Get a free Groq API key at
https://console.groq.com/keys.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

### 3. Using the app

1. Click **"Simulate sensor event"** (or toggle **Auto-patrol** for a continuous feed).
2. Click an event in the telemetry feed to open its detail panel.
3. Click **"Run AI threat classification"** — this calls Groq and returns a threat
   level, confidence, plain-language reasoning, and a recommended action.
4. Threats above "low" auto-spawn a task in the workforce queue, tagged robot or
   technician. Advance tasks through Queued → In Progress → Resolved.
5. Watch the KPI strip and network topology map update live.

## Next steps toward TRL 4/5 (per the brief's maturity ladder)

- Replace the simulator with real sensor ingestion (thermal camera / LiDAR / acoustic
  sensor SDKs) and a message bus (MQTT/Kafka) feeding the same `/api/events` contract.
- Swap the cloud Groq call for a distilled on-device model for true edge autonomy and
  offline operation, keeping Groq (or an equivalent cloud LLM) as a secondary
  cloud-sync / audit layer.
- Add IEC 61850/MODBUS adapters so the same backend talks to different vendors' grid
  hardware without re-engineering per Member State.
- Wire robot/drone dispatch to a real fleet-management API instead of a task-board
  simulation.
- Layer in cost data per asset class to produce the TCO/techno-economic assessment
  required for the business-case section of the brief.

---
*This is a hackathon/concept-stage (TRL-2) demo: all sensor telemetry is simulated.
No real grid, SCADA, or robotics hardware is connected.*
=======
# Grid-Guardian
AI-powered grid vigilance &amp; workforce safety copilot — Flask + React + Groq. Simulates sensor telemetry, classifies threats, and routes tasks to robots vs. technicians.
>>>>>>> ae0e925cc0524e7f64668cb14ec15122e76d6a44
