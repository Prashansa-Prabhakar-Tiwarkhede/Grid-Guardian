import "./IncidentPanel.css";

const ACTION_LABEL = {
  monitor_only: "Monitor only",
  autonomous_patrol: "Dispatch autonomous patrol",
  dispatch_robot: "Dispatch robotic unit",
  dispatch_technician: "Dispatch human technician",
};

export default function IncidentPanel({ event, onAnalyze, analyzing, error }) {
  if (!event) {
    return (
      <div className="incident-panel incident-panel--empty">
        <span className="eyebrow">INCIDENT DETAIL</span>
        <p>Select an event from the telemetry feed to view sensor context and run AI threat classification.</p>
      </div>
    );
  }

  const a = event.analysis;

  return (
    <div className="incident-panel">
      <span className="eyebrow">INCIDENT DETAIL — {event.id}</span>
      <h3>{event.asset_name}</h3>
      <dl className="incident-panel__facts">
        <div><dt>Sensor source</dt><dd>{event.sensor_source}</dd></div>
        <div><dt>Voltage class</dt><dd>{event.asset_voltage}</dd></div>
        <div><dt>Ambient conditions</dt><dd>{event.weather}</dd></div>
        <div><dt>Detection latency</dt><dd className="mono">{(event.detection_latency_ms / 1000).toFixed(2)}s</dd></div>
      </dl>
      <p className="incident-panel__raw">{event.raw_detail}</p>

      {!a && (
        <button className="btn btn-primary" onClick={() => onAnalyze(event.id)} disabled={analyzing}>
          {analyzing ? "Running contextual classification…" : "Run AI threat classification"}
        </button>
      )}

      {error && <div className="incident-panel__error">{error}</div>}

      {a && (
        <div className="incident-panel__analysis">
          <div className={`incident-panel__verdict verdict-${a.threat_level}`}>
            <span className="incident-panel__verdict-level">{a.threat_level.toUpperCase()}</span>
            <span className="mono">{a.confidence_pct}% confidence</span>
          </div>
          <p className="incident-panel__reasoning">{a.reasoning}</p>
          <div className="incident-panel__action">
            <span className="eyebrow">RECOMMENDED ACTION</span>
            <strong>{ACTION_LABEL[a.recommended_action] || a.recommended_action}</strong>
          </div>
          <div className="incident-panel__latency mono">
            reasoning latency: {(event.reasoning_latency_ms / 1000).toFixed(2)}s
          </div>
        </div>
      )}
    </div>
  );
}
