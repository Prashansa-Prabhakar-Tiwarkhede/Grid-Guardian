import "./TopologyMap.css";

// Static connections forming a plausible feeder network between assets.
const LINKS = [
  ["sub-001", "sub-002"],
  ["sub-001", "line-003"],
  ["line-003", "sub-005"],
  ["sub-002", "line-004"],
  ["line-004", "line-007"],
  ["sub-005", "und-006"],
  ["sub-002", "line-007"],
];

const SEVERITY_COLOR = {
  benign: "var(--green)",
  low: "var(--cyan)",
  medium: "var(--amber)",
  high: "var(--red)",
  critical: "var(--red)",
};

function assetStatus(assetId, events) {
  const relevant = events.filter((e) => e.asset_id === assetId);
  if (relevant.length === 0) return null;
  const unclassified = relevant.find((e) => e.status === "unclassified");
  if (unclassified) return { pending: true, color: "var(--amber)" };
  const worst = relevant
    .map((e) => e.analysis?.threat_level)
    .filter(Boolean)
    .sort((a, b) => severityRank(b) - severityRank(a))[0];
  return worst ? { pending: false, color: SEVERITY_COLOR[worst] || "var(--cyan)" } : null;
}

function severityRank(level) {
  return { benign: 0, low: 1, medium: 2, high: 3, critical: 4 }[level] ?? 0;
}

function NodeIcon({ type, color }) {
  if (type === "substation") {
    return <rect x="-6" y="-6" width="12" height="12" fill="none" stroke={color} strokeWidth="1.6" />;
  }
  if (type === "underground") {
    return <circle r="6" fill="none" stroke={color} strokeWidth="1.6" strokeDasharray="2 2" />;
  }
  return <polygon points="0,-7 7,0 0,7 -7,0" fill="none" stroke={color} strokeWidth="1.6" />;
}

export default function TopologyMap({ assets, events, selectedAsset, onSelectAsset }) {
  const byId = Object.fromEntries(assets.map((a) => [a.id, a]));

  return (
    <div className="topology-map">
      <div className="topology-map__header">
        <span className="eyebrow">NETWORK TOPOLOGY — LIVE</span>
        <span className="topology-map__legend">
          <i style={{ background: "var(--cyan)" }} /> nominal
          <i style={{ background: "var(--amber)" }} /> pending review
          <i style={{ background: "var(--red)" }} /> threat
        </span>
      </div>
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" className="topology-map__svg">
        {LINKS.map(([a, b], i) => {
          const na = byId[a];
          const nb = byId[b];
          if (!na || !nb) return null;
          return (
            <line
              key={i}
              x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
              stroke="var(--border)" strokeWidth="0.5"
            />
          );
        })}
        {assets.map((asset) => {
          const status = assetStatus(asset.id, events);
          const color = status ? status.color : "var(--text-dimmer)";
          const isSelected = selectedAsset === asset.id;
          return (
            <g
              key={asset.id}
              transform={`translate(${asset.x}, ${asset.y})`}
              className="topology-node"
              onClick={() => onSelectAsset(asset.id === selectedAsset ? null : asset.id)}
            >
              {status && status.pending && (
                <circle r="9" fill="none" stroke={color} strokeWidth="0.8" className="topology-pulse" />
              )}
              {isSelected && <circle r="10" fill="none" stroke="var(--cyan)" strokeWidth="0.6" />}
              <NodeIcon type={asset.type} color={color} />
            </g>
          );
        })}
      </svg>
      <div className="topology-map__labels">
        {assets.map((a) => (
          <button
            key={a.id}
            className={`topology-map__tag ${selectedAsset === a.id ? "is-active" : ""}`}
            onClick={() => onSelectAsset(a.id === selectedAsset ? null : a.id)}
          >
            {a.name.split(" (")[0]}
            <span className="mono">{a.voltage}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
