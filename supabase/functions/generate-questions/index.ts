// Nightly fresh-trivia generator.
// 1. Ask Claude for strict-JSON questions in a rotating set of categories.
// 2. Validate the shape and dedupe by a hash of the normalized question + answer.
// 3. A second Claude pass checks every question for facts and tone
//    (mildly flirty at most, never explicit). Clear passes are approved,
//    borderline ones wait in "pending" for the admin page, failures are stored
//    as "rejected" so they are never generated again.
// Called by pg_cron with the CRON_SECRET, or by an admin from /admin.
// © 2026 Adam Kornreich / R.A. Consulting ❤ Pops & Pippy
import { admin, caller, claudeText, cors, extractJson, isAdmin, json, sha256 } from "../_shared/util.ts";

const WRITER_MODEL = Deno.env.get("QUESTION_WRITER_MODEL") ?? "claude-sonnet-5-5";
const CHECKER_MODEL = Deno.env.get("QUESTION_CHECKER_MODEL") ?? "claude-sonnet-5-5";
const PER_CATEGORY = Number(Deno.env.get("QUESTIONS_PER_CATEGORY") ?? "10");
const CATEGORIES_PER_RUN = Number(Deno.env.get("CATEGORIES_PER_RUN") ?? "4");

// premium = extra trivia packs for Crew Pass members. flirty = may be mildly flirty (21+ tavern nights).
const CATEGORIES: { name: string; about: string; premium?: boolean; flirty?: boolean }[] = [
  { name: "Movies", about: "well-known movies, actors, directors and famous film lines (paraphrased, never quoted at length)" },
  { name: "Science", about: "everyday science, space, the human body and inventions" },
  { name: "Famous People", about: "famous historical figures, artists, scientists and athletes (facts only, nothing political or controversial)" },
  { name: "World", about: "world geography, capitals, landmarks and cultures" },
  { name: "Sports", about: "sports rules, records and famous moments" },
  { name: "History", about: "world and American history" },
  { name: "Animals", about: "animals and nature" },
  { name: "Pirates", about: "real pirate history, ships, sailing terms and pirate legends" },
  { name: "Florida Pirate Trail", about: "Tampa, Ybor City, the Gasparilla Pirate Festival, Florida history and Florida pirate legends" },
  { name: "Silver Screen Deep Cuts", about: "harder movie trivia: behind-the-scenes facts, Oscar history and classic cinema", premium: true },
  { name: "Ybor After Dark", about: "playful tavern-night trivia about cocktails history, famous bars, music and pop culture; may be mildly flirty and cheeky but never sexual or explicit; for adults 21+", premium: true, flirty: true },
];

type Q = { question: string; options: string[]; correct_index: number; difficulty: number; explanation: string };

function writerPrompt(cat: (typeof CATEGORIES)[number], n: number, avoid: string[]): string {
  return `Write ${n} multiple-choice trivia questions about ${cat.about} for Pirates of Ybor, a pirate-themed game app from Ybor City, Tampa.
Rules:
- Use only well-documented facts. Skip anything disputed, rumored, or likely to have changed recently (current office holders, records that may have been broken, prices, "latest" anything).
- Exactly 4 options, exactly one correct, wrong options plausible but clearly wrong.
- Mix difficulty: about a third each of 1 (easy), 2 (medium), 3 (hard).
- ${cat.flirty ? "Tone may be playful and mildly flirty, like a cheeky bartender, but never sexual, crude or explicit." : "Keep it family-friendly; students and kids play."}
- No questions about living private individuals, nothing political, religious or hateful.
- Do not repeat any of these existing questions: ${avoid.slice(0, 40).map((a) => JSON.stringify(a)).join("; ") || "(none yet)"}
Reply with ONLY a JSON array, no prose, of objects shaped exactly:
{"question":"...","options":["a","b","c","d"],"correct_index":0,"difficulty":1,"explanation":"one short sentence of context"}`;
}

const CHECKER_SYSTEM = `You are a strict fact-checker and content reviewer for a family pirate trivia app. You judge each question independently.`;

function checkerPrompt(cat: (typeof CATEGORIES)[number], qs: Q[]): string {
  return `Review these ${cat.name} trivia questions. For each one decide:
- "approve": the marked answer is definitely correct, the other three are definitely wrong, the fact is stable and well documented, and the tone is ${cat.flirty ? "at most mildly flirty and never sexual or explicit" : "family-friendly"}.
- "pending": probably fine but you are not fully certain of the fact, the wording is ambiguous, or the tone is borderline.
- "reject": wrong answer, more than one defensible answer, outdated, offensive, explicit, political, or about a private person.
Reply with ONLY a JSON array with one object per question in the same order:
{"i":0,"verdict":"approve","reason":"short reason"}

Questions:
${JSON.stringify(qs.map((q, i) => ({ i, question: q.question, options: q.options, marked_answer: q.options[q.correct_index], explanation: q.explanation })))}`;
}

function valid(x: unknown): x is Q {
  const q = x as Q;
  return !!q && typeof q.question === "string" && q.question.length > 8 && q.question.length <= 300 &&
    Array.isArray(q.options) && q.options.length === 4 && q.options.every((o) => typeof o === "string" && o.trim() && o.length <= 120) &&
    new Set(q.options.map((o) => o.trim().toLowerCase())).size === 4 &&
    Number.isInteger(q.correct_index) && q.correct_index >= 0 && q.correct_index <= 3 &&
    [1, 2, 3].includes(Number(q.difficulty));
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

async function runCategory(cat: (typeof CATEGORIES)[number]) {
  const db = admin();
  const { data: existing } = await db.from("questions").select("question").eq("category", cat.name)
    .order("created_at", { ascending: false }).limit(40);
  const avoid = (existing ?? []).map((r) => r.question);

  const raw = extractJson(await claudeText({
    model: WRITER_MODEL, system: "You write accurate trivia. Reply with JSON only.",
    messages: [{ role: "user", content: writerPrompt(cat, PER_CATEGORY, avoid) }], maxTokens: 4000, temperature: 0.9,
  }));
  const fresh: (Q & { hash: string })[] = [];
  const seen = new Set<string>();
  for (const x of Array.isArray(raw) ? raw : []) {
    if (!valid(x)) continue;
    const q: Q = { question: x.question.trim(), options: x.options.map((o) => o.trim()), correct_index: x.correct_index, difficulty: Number(x.difficulty), explanation: String(x.explanation ?? "").slice(0, 400) };
    const hash = await sha256(norm(q.question) + "|" + norm(q.options[q.correct_index]));
    if (seen.has(hash)) continue;
    seen.add(hash); fresh.push({ ...q, hash });
  }
  if (!fresh.length) return { category: cat.name, written: 0, approved: 0, pending: 0, rejected: 0, duplicates: 0 };

  const { data: dupes } = await db.from("questions").select("source_hash").in("source_hash", fresh.map((q) => q.hash));
  const dupeSet = new Set((dupes ?? []).map((d) => d.source_hash));
  const todo = fresh.filter((q) => !dupeSet.has(q.hash));
  if (!todo.length) return { category: cat.name, written: fresh.length, approved: 0, pending: 0, rejected: 0, duplicates: fresh.length };

  let verdicts: { i: number; verdict: string; reason?: string }[] = [];
  try {
    verdicts = extractJson(await claudeText({
      model: CHECKER_MODEL, system: CHECKER_SYSTEM,
      messages: [{ role: "user", content: checkerPrompt(cat, todo) }], maxTokens: 3000, temperature: 0,
    })) as typeof verdicts;
  } catch (e) { console.error("checker failed; everything goes to pending", e); }

  const counts = { approved: 0, pending: 0, rejected: 0 };
  const rows = todo.map((q, i) => {
    const v = verdicts.find((x) => x && x.i === i);
    const status = v?.verdict === "approve" ? "approved" : v?.verdict === "reject" ? "rejected" : "pending";
    counts[status as keyof typeof counts]++;
    return {
      category: cat.name, difficulty: q.difficulty, question: q.question, options: q.options,
      correct_index: q.correct_index, explanation: q.explanation, source_hash: q.hash, status,
      premium: !!cat.premium, tone: cat.flirty ? "flirty" : "clean",
      review_note: v?.reason ? `checker: ${String(v.reason).slice(0, 300)}` : "checker: no verdict",
      reviewed_at: status === "pending" ? null : new Date().toISOString(),
    };
  });
  const { error } = await db.from("questions").upsert(rows, { onConflict: "source_hash", ignoreDuplicates: true });
  if (error) throw error;
  return { category: cat.name, written: fresh.length, duplicates: fresh.length - todo.length, ...counts };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(req) });
  const secret = Deno.env.get("CRON_SECRET");
  const auth = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  let allowed = !!secret && auth === secret;
  if (!allowed) { const u = await caller(req); allowed = !!u && await isAdmin(u.id); }
  if (!allowed) return json(req, { error: "forbidden" }, 403);

  // Rotate through categories by day so every category gets fresh questions each few nights.
  let body: { categories?: string[] } = {};
  try { body = await req.json(); } catch { /* cron sends an empty body */ }
  let picks = CATEGORIES.filter((c) => body.categories?.includes(c.name));
  if (!picks.length) {
    const day = Math.floor(Date.now() / 86_400_000);
    picks = Array.from({ length: Math.min(CATEGORIES_PER_RUN, CATEGORIES.length) }, (_, k) => CATEGORIES[(day * CATEGORIES_PER_RUN + k) % CATEGORIES.length]);
  }
  const results = [];
  for (const c of picks) {
    try { results.push(await runCategory(c)); }
    catch (e) { console.error(c.name, e); results.push({ category: c.name, error: String(e).slice(0, 200) }); }
  }
  return json(req, { ran_at: new Date().toISOString(), results });
});
