import "./TaskBoard.css";

const COLUMNS = [
  { key: "queued", label: "Queued" },
  { key: "in_progress", label: "In Progress" },
  { key: "resolved", label: "Resolved" },
];

export default function TaskBoard({ tasks, onAdvance }) {
  return (
    <div className="task-board">
      <div className="task-board__header">
        <span className="eyebrow">WORKFORCE TASK QUEUE — AUGMENT, NOT REPLACE</span>
      </div>
      <div className="task-board__columns">
        {COLUMNS.map((col) => (
          <div key={col.key} className="task-column">
            <div className="task-column__title">
              {col.label}
              <span className="mono">{tasks.filter((t) => t.status === col.key).length}</span>
            </div>
            <div className="task-column__cards">
              {tasks.filter((t) => t.status === col.key).length === 0 && (
                <div className="task-column__empty">—</div>
              )}
              {tasks.filter((t) => t.status === col.key).map((t) => (
                <div key={t.id} className="task-card">
                  <div className="task-card__top">
                    <span className={`chip chip-${t.assignment}`}>
                      {t.assignment === "robot" ? "ROBOT" : "TECHNICIAN"}
                    </span>
                    <span className={`chip chip-priority-${t.priority}`}>{t.priority}</span>
                  </div>
                  <div className="task-card__title">{t.title}</div>
                  <div className="task-card__asset">{t.asset}</div>
                  {col.key !== "resolved" && (
                    <button className="task-card__advance" onClick={() => onAdvance(t.id)}>
                      {col.key === "queued" ? "Start task →" : "Mark resolved →"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
