<div align="center">

# ⚡ Grid Guardian

**An AI vigilance & workforce safety copilot for European energy networks.**

Simulated sensor telemetry → Groq-powered contextual threat classification → robot vs. technician task dispatch.

Built for *Robotics & AI for Grid Vigilance and Workforce Safety* (E.ON × Infosys)

[![Python](https://img.shields.io/badge/backend-Flask-000000?logo=flask)](backend)
[![React](https://img.shields.io/badge/frontend-React%20%2B%20Vite-149eca?logo=react)](frontend)
[![Groq](https://img.shields.io/badge/AI-Groq%20API-f55036)](https://groq.com)
[![TRL](https://img.shields.io/badge/status-TRL--2%20prototype-yellow)](#status)
[![License](https://img.shields.io/badge/license-MIT-lightgrey)](#license)

</div>

---

## The problem

Europe's power grid faces a triple threat: **aging infrastructure**, a **shrinking technical
workforce** (2.4 retiring specialists for every new entrant), and a rising wave of low-tech,
high-impact physical attacks — conductive objects thrown onto lines, substation perimeter
breaches — that traditional camera/sensor systems are too slow or too noisy to catch in time.

Grid Guardian addresses both halves of that problem in one system:

| | |
|---|---|
| 🛰️ **Vigilance & Resilience** | Ingests sensor/drone telemetry (thermal, acoustic, LiDAR, corona-discharge, SF6 gas) and uses an LLM to reason about each anomaly the way a control-room analyst would — separating genuine threats from weather, wildlife, and routine wear. |
| 🤖 **Workforce Safety & Automation** | Every confirmed threat auto-generates a task, routed to a **robot/autonomous patrol** or a **human technician** depending on proximity to live equipment — augmenting the workforce instead of replacing it, and keeping people out of hazardous proximity to energized equipment. |

## Demo at a glance

- Live **network topology map** of substations, overhead lines, and underground feeders
- A **telemetry feed** of simulated sensor events, click-through to full detail
- **AI threat classification** on demand — threat level, confidence, plain-language reasoning, recommended action (via Groq)
- A **workforce task board** (Queued → In Progress → Resolved) showing robot vs. technician assignment
- A **KPI strip** tracking the exact success metrics from the brief: detection latency (<10s target), AI reasoning latency (<2s target), false-positive rate (<10% target), and a workforce multiplier

## Tech stack

- **Backend:** Python, Flask, Flask-CORS, [Groq API](https://console.groq.com) (`llama-3.3-70b-versatile`)
- **Frontend:** React 18, Vite, plain CSS (no UI framework — custom control-room design system)
- **Data:** in-memory for this prototype; designed to swap in a time-series store (e.g. TimescaleDB) for production

## Project structure

```
grid-guardian/
├── backend/
│   ├── app.py             REST API — events, threat classification, tasks, KPIs
│   ├── simulator.py       Simulated grid assets + sensor telemetry generator
│   ├── groq_client.py     Groq-powered contextual threat classification
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    └── src/
        ├── App.jsx
        ├── api.js
        └── components/
            ├── TopologyMap.jsx     live one-line grid diagram
            ├── EventFeed.jsx       telemetry / vigilance feed
            ├── IncidentPanel.jsx   Groq reasoning detail view
            ├── KpiStrip.jsx        success-metric cards
            └── TaskBoard.jsx       robot vs. technician task kanban
```

## Getting started

### Prerequisites

- Python 3.10+
- Node.js 18+
- A free [Groq API key](https://console.groq.com/keys)

### 1. Backend

```bash
cd backend
python3 -m venv venv && source venv/bin/activate   # optional but recommended
pip install -r requirements.txt
cp .env.example .env
# edit .env and set GROQ_API_KEY=your_real_key
python3 app.py
```

The `.env` file is loaded automatically on startup — no manual `export` needed. You'll see
`[startup] GROQ_API_KEY: found` printed to the console if it picked up your key correctly.
API runs at `http://localhost:5000`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

### 3. Try it out

1. Click **Simulate sensor event** (or toggle **Auto-patrol** for a continuous feed).
2. Click an event in the telemetry feed to open its detail panel.
3. Click **Run AI threat classification** — calls Groq and returns a threat level,
   confidence score, reasoning, and recommended action.
4. Threats rated above "low" auto-spawn a task in the workforce queue. Advance tasks
   through the board as they're worked.
5. Watch the KPI strip and topology map update live.

## API reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Backend + Groq config status |
| `GET` | `/api/assets` | List simulated grid assets |
| `GET` | `/api/events` | List all telemetry events |
| `POST` | `/api/events/generate` | Simulate a new sensor anomaly |
| `POST` | `/api/events/<id>/analyze` | Run Groq contextual threat classification |
| `GET` | `/api/tasks` | List workforce tasks |
| `POST` | `/api/tasks/<id>/advance` | Advance a task to its next status |
| `GET` | `/api/kpis` | Current KPI snapshot |
| `POST` | `/api/reset` | Clear all simulated state |

## Design principles baked into the architecture

- **Standardized interfaces** — the API is a clean REST layer designed to sit in front of
  IEC 61850 / MODBUS telemetry in a real deployment, not a proprietary integration.
- **Edge autonomy path** — Groq stands in as a low-latency reasoning layer to prove the
  concept; a production build would distil this into an on-device model for true offline
  edge operation.
- **Augment, not replace** — the task board never fully automates response. Robots take
  live-line-proximity and repetitive work; technicians stay in the loop for judgment calls.
- **Fail-safe defaults** — when the AI is uncertain, the system is designed to default to
  routing a human technician rather than a robot.

## Status

This is a **TRL-2 concept prototype**: all sensor telemetry is simulated, no real grid,
SCADA, or robotics hardware is connected. See [`Grid_Guardian_Submission.docx`](.) for the
full technical, market, and TCO write-up.

### Roadmap to TRL 4/5

- [ ] Real sensor ingestion (thermal camera / LiDAR / acoustic SDKs) via MQTT/Kafka, feeding the same `/api/events` contract
- [ ] Distilled on-device model for true edge autonomy and offline operation
- [ ] IEC 61850 / MODBUS adapters for multi-vendor grid hardware
- [ ] Real robot/drone fleet-management API integration for task dispatch
- [ ] Persistent time-series storage and historical analytics
- [ ] Per-asset-class cost data for a full TCO / techno-economic model

## License

MIT — see [LICENSE](LICENSE).

---

<div align="center">
<sub>Built with Flask, React, Vite, and the Groq API.</sub>
</div>
