// The Quartermaster: the "Ask anything aboard" assistant on /play, plus the
// "fresh round" trivia writer on the same page. Runs on the Claude API with the
// key kept in Supabase secrets. Signed-in players only, with a daily limit each.
// © 2026 Adam Kornreich / R.A. Consulting ❤ Pops & Pippy
import { admin, caller, claudeHeaders, claudeText, CLAUDE_URL, cors, json } from "../_shared/util.ts";

const CHAT_MODEL = Deno.env.get("QUARTERMASTER_MODEL") ?? "claude-haiku-5-5";
const DAILY_LIMIT = Number(Deno.env.get("QUARTERMASTER_DAILY_LIMIT") ?? "40");

const SYSTEM = `You are the Quartermaster aboard Pirates of Ybor, a pirate-themed game and entertainment app from Ybor City in Tampa, Florida, inspired by Gaspar's Grotto, the pirate bar at 1805 E 7th Ave. The mascots are Pops, the bar cat, and Pippy, a pirate chihuahua.
Games aboard: trivia (movies, science, history, pirates, the Florida Pirate Trail), Treasure Hunt, Name That Reel movie night and Reel Maker, Andy Golf Club, Whack-a-Kraken, Shere's Revenge swordplay, pirate chess and checkers, ping pong, darts, bingo, crosswords and the tavern games. The Pour-Off and drinking bar games are for players 21 and over.
Speak with warm, playful pirate flair and make every player feel welcome aboard the ship. Keep it family-friendly: students and kids play too. Never write anything sexual, hateful or dangerous, never give medical, legal or financial advice, and never claim a real person endorses the app. If you don't know something, say so plainly. Keep answers under 120 words unless asked for more.`;

const JSON_SYSTEM = `You write content for Pirates of Ybor, a family-friendly pirate game app from Ybor City, Tampa. Follow the user's format instructions exactly and reply with only the JSON they ask for, no commentary.`;

type Turn = { role: "user" | "assistant"; content: string };

function cleanTurns(raw: unknown): Turn[] {
  if (!Array.isArray(raw)) return [];
  let turns = raw
    .filter((t) => t && (t.role === "user" || t.role === "assistant") && typeof t.content === "string")
    .map((t) => ({ role: t.role, content: String(t.content).slice(0, 2000) })) as Turn[];
  turns = turns.slice(-16);
  while (turns.length && turns[0].role !== "user") turns.shift();
  return turns;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(req) });
  if (req.method !== "POST") return json(req, { error: "method" }, 405);

  const user = await caller(req);
  if (!user) return json(req, { error: "signin" }, 401);

  const { data: ok, error: rlErr } = await admin().rpc("bump_ai_usage", { p_user: user.id, p_limit: DAILY_LIMIT });
  if (rlErr) return json(req, { error: "server" }, 500);
  if (!ok) return json(req, { error: "rate_limited" }, 429);

  let body: { mode?: string; messages?: unknown; prompt?: string };
  try { body = await req.json(); } catch { return json(req, { error: "bad_request" }, 400); }

  try {
    // Trivia writer: one prompt in, raw JSON text out (the page validates the shape).
    if (body.mode === "json") {
      const prompt = String(body.prompt ?? "").slice(0, 4000);
      if (!prompt) return json(req, { error: "bad_request" }, 400);
      const text = await claudeText({ model: CHAT_MODEL, system: JSON_SYSTEM, messages: [{ role: "user", content: prompt }], maxTokens: 3000 });
      return json(req, { text });
    }

    // Chat: stream plain text back so the reply types out as it arrives.
    const turns = cleanTurns(body.messages);
    if (!turns.length) return json(req, { error: "bad_request" }, 400);
    const upstream = await fetch(CLAUDE_URL, {
      method: "POST",
      headers: claudeHeaders(),
      body: JSON.stringify({ model: CHAT_MODEL, system: SYSTEM, messages: turns, max_tokens: 600, stream: true }),
    });
    if (!upstream.ok || !upstream.body) return json(req, { error: "upstream", status: upstream.status }, 502);

    const enc = new TextEncoder(), dec = new TextDecoder();
    const stream = new ReadableStream({
      async start(ctrl) {
        const reader = upstream.body!.getReader();
        let buf = "";
        try {
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            buf += dec.decode(value, { stream: true });
            let nl;
            while ((nl = buf.indexOf("\n")) >= 0) {
              const line = buf.slice(0, nl).trim(); buf = buf.slice(nl + 1);
              if (!line.startsWith("data:")) continue;
              try {
                const ev = JSON.parse(line.slice(5));
                if (ev.type === "content_block_delta" && ev.delta?.type === "text_delta") ctrl.enqueue(enc.encode(ev.delta.text));
              } catch { /* keep-alive or partial line */ }
            }
          }
        } finally { ctrl.close(); }
      },
    });
    return new Response(stream, { headers: { ...cors(req), "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
  } catch (e) {
    console.error(e);
    return json(req, { error: "server" }, 500);
  }
});
