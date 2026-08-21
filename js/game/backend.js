// js/game/backend.js
// Thin wrapper around a Supabase project for the GLOBAL leaderboard
// and the admin feedback inbox. Everything else in this game works
// fully offline; this is the one file that talks to the network.
//
// SETUP: replace the two constants below with your project's values
// from Project Settings -> API in the Supabase dashboard. Use the
// "anon public" key ONLY -- never the "service_role" key, which must
// never appear in client-side code.
//
// Until real values are set, every function here is a no-op that
// resolves to an empty/false result instead of throwing -- so the
// game runs fine offline or before setup is finished.

const SUPABASE_URL = "https://zmjtcpjxvcmcveaxjzvt.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptanRjcGp4dmNtY3ZlYXhqenZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyMTEzOTgsImV4cCI6MjEwMjc4NzM5OH0.BNwHvCTjVnLde5QxMWsfAFbvRhQ81leszYzsmwcb0F0";

const isConfigured =
  !SUPABASE_URL.startsWith("REPLACE_") && !SUPABASE_ANON_KEY.startsWith("REPLACE_");

let clientPromise = null;

// Loaded lazily (and only once) so a game that never touches the
// backend never pays for the network fetch of the Supabase library.
function getClient() {
  if (!isConfigured) return Promise.resolve(null);
  if (!clientPromise) {
    clientPromise = import("https://esm.sh/@supabase/supabase-js@2")
      .then(({ createClient }) => createClient(SUPABASE_URL, SUPABASE_ANON_KEY))
      .catch((err) => {
        console.warn("ZedEmpire: could not load Supabase client.", err);
        return null;
      });
  }
  return clientPromise;
}

// Fire-and-forget: submit a finished run to the global leaderboard.
// Never throws -- a failed submit just means that run only shows up
// in the player's local Hall of Fame, not the global one.
export async function submitRunOnline(entry, playerName) {
  const client = await getClient();
  if (!client) return false;
  const { error } = await client.from("leaderboard").insert({
    player_name: playerName || null,
    chapter: entry.chapter,
    province: entry.province,
    day: entry.day,
    outcome: entry.outcome,
    stats: entry.stats,
    headline: entry.headline || null,
  });
  if (error) {
    console.warn("ZedEmpire: leaderboard submit failed.", error);
    return false;
  }
  return true;
}

// Returns the top N global runs (furthest chapter/day first), or []
// if the backend isn't configured, is unreachable, or errors.
export async function fetchGlobalLeaderboard(limit = 25) {
  const client = await getClient();
  if (!client) return [];
  const { data, error } = await client
    .from("leaderboard")
    .select("*")
    .order("chapter", { ascending: false })
    .order("day", { ascending: false })
    .limit(limit);
  if (error) {
    console.warn("ZedEmpire: leaderboard fetch failed.", error);
    return [];
  }
  return data || [];
}

// Sends a message to the admin inbox. Returns true/false so the UI
// can show a real confirmation or a "try again later" message.
export async function submitFeedback({ message, playerName, contact }) {
  const client = await getClient();
  if (!client) return false;
  const trimmed = (message || "").trim();
  if (!trimmed) return false;
  const { error } = await client.from("feedback").insert({
    message: trimmed,
    player_name: playerName || null,
    contact: contact || null,
  });
  if (error) {
    console.warn("ZedEmpire: feedback submit failed.", error);
    return false;
  }
  return true;
}

export function backendConfigured() {
  return isConfigured;
}
