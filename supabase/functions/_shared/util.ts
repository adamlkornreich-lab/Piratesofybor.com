// Shared helpers for the Pirates of Ybor edge functions.
// © 2026 Adam Kornreich / R.A. Consulting ❤ Pops & Pippy
import { createClient, type SupabaseClient, type User } from "jsr:@supabase/supabase-js@2";

const ALLOWED = (Deno.env.get("ALLOWED_ORIGINS") ??
  "https://thepiratesofybor.com,https://www.thepiratesofybor.com,https://app.thepiratesofybor.com,capacitor://app.thepiratesofybor.com,http://localhost:8080")
  .split(",").map((s) => s.trim()).filter(Boolean);

export function cors(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  return {
    "Access-Control-Allow-Origin": ALLOWED.includes(origin) ? origin : ALLOWED[0],
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

export function json(req: Request, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors(req), "Content-Type": "application/json" },
  });
}

/** Service-role client. Never sent to a browser. */
export function admin(): SupabaseClient {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** The signed-in player making this request, or null. */
export async function caller(req: Request): Promise<User | null> {
  const auth = req.headers.get("Authorization") ?? "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const { data, error } = await admin().auth.getUser(token);
  return error ? null : data.user;
}

export async function isAdmin(userId: string): Promise<boolean> {
  const { data } = await admin().from("admins").select("user_id").eq("user_id", userId).maybeSingle();
  return !!data;
}

export const CLAUDE_URL = "https://api.anthropic.com/v1/messages";

export function claudeHeaders(): Record<string, string> {
  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) throw new Error("ANTHROPIC_API_KEY is not set in Supabase secrets");
  return { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" };
}

/** One non-streaming Claude call that returns the text of the reply. */
export async function claudeText(opts: {
  model: string; system: string; messages: { role: "user" | "assistant"; content: string }[];
  maxTokens?: number; temperature?: number;
}): Promise<string> {
  const res = await fetch(CLAUDE_URL, {
    method: "POST",
    headers: claudeHeaders(),
    body: JSON.stringify({
      model: opts.model, system: opts.system, messages: opts.messages,
      max_tokens: opts.maxTokens ?? 2048, temperature: opts.temperature ?? 0.7,
    }),
  });
  if (!res.ok) throw new Error(`Claude API ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return (data.content ?? []).filter((b: { type: string }) => b.type === "text").map((b: { text: string }) => b.text).join("");
}

/** Pull the first JSON array or object out of a reply, tolerating code fences. */
export function extractJson(text: string): unknown {
  const t = text.replace(/```(?:json)?/g, "").trim();
  const start = t.search(/[\[{]/);
  if (start < 0) throw new Error("no JSON in reply");
  const open = t[start], close = open === "[" ? "]" : "}";
  const end = t.lastIndexOf(close);
  return JSON.parse(t.slice(start, end + 1));
}

export async function sha256(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
