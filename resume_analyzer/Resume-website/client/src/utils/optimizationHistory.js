const STORAGE_KEY = "atsify_optimization_history";
const MAX_ENTRIES = 50;

export function getOptimizationHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function saveOptimizationHistory(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
  window.dispatchEvent(new CustomEvent("atsify-history-updated"));
}

export function addOptimizationEntry(entry) {
  const list = getOptimizationHistory();
  const record = {
    id: entry.id || `${Date.now()}`,
    fileName: entry.fileName || "resume",
    fileSize: entry.fileSize || 0,
    role: entry.role || "",
    jobDescPreview: (entry.jobDesc || "").slice(0, 120),
    score: entry.score ?? null,
    scoreAfter: entry.scoreAfter ?? null,
    createdAt: entry.createdAt || new Date().toISOString(),
    feedback: entry.feedback || null,
    fixedResumeData: entry.fixedResumeData || null,
  };
  saveOptimizationHistory([record, ...list.filter((e) => e.id !== record.id)]);
  return record;
}

export function updateOptimizationEntry(id, patch) {
  const list = getOptimizationHistory();
  const next = list.map((e) => (e.id === id ? { ...e, ...patch } : e));
  saveOptimizationHistory(next);
}

export function clearOptimizationHistory() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent("atsify-history-updated"));
}

export function formatRelativeTime(iso) {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  return new Date(iso).toLocaleDateString();
}

export function formatFileSize(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
