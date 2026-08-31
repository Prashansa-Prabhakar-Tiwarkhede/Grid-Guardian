import { useEffect, useState, useCallback } from "react";
import { api } from "./api";
import TopologyMap from "./components/TopologyMap";
import EventFeed from "./components/EventFeed";
import IncidentPanel from "./components/IncidentPanel";
import KpiStrip from "./components/KpiStrip";
import TaskBoard from "./components/TaskBoard";
import "./App.css";

export default function App() {
  const [assets, setAssets] = useState([]);
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [kpis, setKpis] = useState({});
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [groqConfigured, setGroqConfigured] = useState(true);
  const [autoPatrol, setAutoPatrol] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const [ev, tk, kp] = await Promise.all([api.getEvents(), api.getTasks(), api.getKpis()]);
      setEvents(ev);
      setTasks(tk);
      setKpis(kp);
    } catch {
      // backend not reachable yet -- silently retry on next tick
    }
  }, []);

  useEffect(() => {
    api.getAssets().then(setAssets).catch(() => {});
    api.health().then((h) => setGroqConfigured(h.groq_configured)).catch(() => {});
    refresh();
    const id = setInterval(refresh, 4000);
    return () => clearInterval(id);
  }, [refresh]);

  useEffect(() => {
    if (!autoPatrol) return;
    const id = setInterval(() => {
      api.generateEvent().then(refresh).catch(() => {});
    }, 6000);
    return () => clearInterval(id);
  }, [autoPatrol, refresh]);

  const handleGenerate = async () => {
    await api.generateEvent();
    refresh();
  };

  const handleAnalyze = async (id) => {
    setAnalyzing(true);
    setError(null);
    try {
      await api.analyzeEvent(id);
      await refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAdvanceTask = async (id) => {
    await api.advanceTask(id);
    refresh();
  };

  const handleReset = async () => {
    await api.reset();
    setSelectedEventId(null);
    setSelectedAsset(null);
    refresh();
  };

  const selectedEvent = events.find((e) => e.id === selectedEventId) || null;

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar__brand">
          <span className="topbar__mark" />
          <div>
            <h1>GRID GUARDIAN</h1>
            <span className="topbar__sub">Autonomous vigilance &amp; workforce safety copilot</span>
          </div>
        </div>
        <div className="topbar__actions">
          {!groqConfigured && (
            <span className="topbar__warning">GROQ_API_KEY not set on backend -- classification will fail</span>
          )}
          <label className="toggle">
            <input type="checkbox" checked={autoPatrol} onChange={(e) => setAutoPatrol(e.target.checked)} />
            Auto-patrol
          </label>
          <button className="btn" onClick={handleGenerate}>Simulate sensor event</button>
          <button className="btn btn-ghost" onClick={handleReset}>Reset</button>
        </div>
      </header>

      <KpiStrip kpis={kpis} />

      <main className="app-grid">
        <div className="app-grid__col-map">
          <TopologyMap
            assets={assets}
            events={events}
            selectedAsset={selectedAsset}
            onSelectAsset={setSelectedAsset}
          />
        </div>
        <div className="app-grid__col-feed">
          <EventFeed
            events={events}
            selectedEventId={selectedEventId}
            onSelect={setSelectedEventId}
            filterAssetId={selectedAsset}
          />
        </div>
        <div className="app-grid__col-incident">
          <IncidentPanel
            event={selectedEvent}
            onAnalyze={handleAnalyze}
            analyzing={analyzing}
            error={error}
          />
        </div>
      </main>

      <TaskBoard tasks={tasks} onAdvance={handleAdvanceTask} />
    </div>
  );
}
