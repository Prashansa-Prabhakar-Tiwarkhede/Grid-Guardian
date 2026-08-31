import "./EventFeed.css";

const LEVEL_LABEL = {
  benign: "BENIGN",
  low: "LOW",
  medium: "MEDIUM",
  high: "HIGH",
  critical: "CRITICAL",
};

function timeAgo(iso) {
  const diff = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export default function EventFeed({ events, selectedEventId, onSelect, filterAssetId }) {
  const filtered = filterAssetId ? events.filter((e) => e.asset_id === filterAssetId) : events;

  return (
    <div className="event-feed">
      <div className="event-feed__header">
        <span className="eyebrow">TELEMETRY FEED{filterAssetId ? " — FILTERED" : ""}</span>
        <span className="mono event-feed__count">{filtered.length} EVENTS</span>
      </div>
      <div className="event-feed__list">
        {filtered.length === 0 && (
          <div className="event-feed__empty">
            No telemetry yet. Trigger a simulated sensor event to begin vigilance monitoring.
          </div>
        )}
        {filtered.map((e) => {
          const level = e.analysis?.threat_level;
          return (
            <button
              key={e.id}
              className={`event-row ${selectedEventId === e.id ? "is-active" : ""}`}
              onClick={() => onSelect(e.id)}
            >
              <span className={`event-row__dot status-${level || (e.status === "unclassified" ? "pending" : "idle")}`} />
              <span className="event-row__main">
                <span className="event-row__asset">{e.asset_name}</span>
                <span className="event-row__detail">{e.raw_detail}</span>
              </span>
              <span className="event-row__meta">
                {level && <span className={`badge badge-${level}`}>{LEVEL_LABEL[level]}</span>}
                {!level && e.status === "unclassified" && <span className="badge badge-pending">PENDING</span>}
                <span className="mono event-row__time">{timeAgo(e.timestamp)}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
