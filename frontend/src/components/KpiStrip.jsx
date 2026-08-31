import "./KpiStrip.css";

export default function KpiStrip({ kpis }) {
  const cards = [
    { label: "Avg. detection latency", value: `${kpis.avg_detection_latency_s ?? 0}s`, target: "target <10s" },
    { label: "AI reasoning latency", value: `${kpis.avg_reasoning_latency_s ?? 0}s`, target: "target <2s edge" },
    { label: "Threats detected", value: kpis.threats_detected ?? 0, target: `of ${kpis.classified_events ?? 0} classified` },
    { label: "False positive rate", value: `${kpis.false_positive_rate_pct ?? 0}%`, target: "target <10%" },
    { label: "Robot-assigned tasks", value: kpis.robot_dispatched ?? 0, target: "vs live-line exposure" },
    { label: "Workforce multiplier", value: `${kpis.workforce_multiplier ?? 1}x`, target: "supervised task volume" },
  ];

  return (
    <div className="kpi-strip">
      {cards.map((c) => (
        <div key={c.label} className="kpi-card">
          <span className="kpi-card__value mono">{c.value}</span>
          <span className="kpi-card__label">{c.label}</span>
          <span className="kpi-card__target mono">{c.target}</span>
        </div>
      ))}
    </div>
  );
}
