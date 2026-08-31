const BASE = "http://localhost:5000/api";

async function req(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  health: () => req("/health"),
  getAssets: () => req("/assets"),
  getEvents: () => req("/events"),
  generateEvent: () => req("/events/generate", { method: "POST" }),
  analyzeEvent: (id) => req(`/events/${id}/analyze`, { method: "POST" }),
  getTasks: () => req("/tasks"),
  advanceTask: (id) => req(`/tasks/${id}/advance`, { method: "POST" }),
  getKpis: () => req("/kpis"),
  reset: () => req("/reset", { method: "POST" }),
};
