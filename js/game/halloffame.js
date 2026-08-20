// js/game/halloffame.js
// Local "how far have I gotten" record of past runs on THIS device.
// This is not a shared/online leaderboard on its own -- see
// game/backend.js for the Supabase-backed global one. This file is
// the offline fallback / always-available local record.

const KEY = "zedempire-halloffame-v1";
const MAX_ENTRIES = 25;

export function getRuns() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

// entry: { player_name, chapter, province, day, outcome
//          ("setback"|"robbed"|"completed"), stats: {...}, headline, timestamp }
export function recordRun(entry) {
  const runs = getRuns();
  runs.push({ ...entry, timestamp: Date.now() });
  runs.sort((a, b) =>
    (b.chapter - a.chapter) ||
    (b.day - a.day) ||
    ((b.outcome === "completed") - (a.outcome === "completed")) ||
    (b.timestamp - a.timestamp)
  );
  runs.length = Math.min(runs.length, MAX_ENTRIES);
  try {
    localStorage.setItem(KEY, JSON.stringify(runs));
  } catch {
    /* storage full or unavailable -- not fatal, just skip archiving */
  }
  return runs;
}

export function clearRuns() {
  localStorage.removeItem(KEY);
}
