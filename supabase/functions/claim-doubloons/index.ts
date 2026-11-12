// claim-doubloons: turns one paid Stripe Checkout session into doubloons, once.
// © 2026 Adam Kornreich / R.A. Consulting ❤ Pops & Pippy
// Needs the secret STRIPE_SECRET_KEY (a restricted key with read access to Checkout Sessions is enough).
// The browser sends only the session id from the Payment Link's success URL; the amount is checked with Stripe here.
// Deployed with verify_jwt = false: the function does its own check against Stripe.
import { createClient } from "jsr:@supabase/supabase-js@2";

// Price paid (in cents, USD) -> doubloons. Keep in step with assets/store-config.js.
const PACKS: Record<number, number> = { 99: 500, 249: 1500, 699: 5000 };

const ALLOWED = [
  "https://thepiratesofybor.netlify.app",
  "https://thepiratesofybor.com",
  "https://www.thepiratesofybor.com",
  "https://piratesofybor.com",
  "https://www.piratesofybor.com",
];

function cors(origin: string | null) {
  const o = origin && ALLOWED.includes(origin) ? origin : ALLOWED[0];
  return {
    "Access-Control-Allow-Origin": o,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
    "Vary": "Origin",
  };
}

function reply(status: number, body: unknown, origin: string | null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...cors(origin) },
  });
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("Origin");
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(origin) });
  if (req.method !== "POST") return reply(405, { ok: false, error: "method" }, origin);

  const key = Deno.env.get("STRIPE_SECRET_KEY");
  if (!key) return reply(503, { ok: false, error: "payments_not_configured" }, origin);

  let sessionId = "";
  try {
    sessionId = String((await req.json()).session_id || "");
  } catch {
    return reply(400, { ok: false, error: "bad_request" }, origin);
  }
  if (!/^cs_(test|live)_[A-Za-z0-9]{10,200}$/.test(sessionId)) {
    return reply(400, { ok: false, error: "bad_session" }, origin);
  }

  const r = await fetch("https://api.stripe.com/v1/checkout/sessions/" + encodeURIComponent(sessionId), {
    headers: { Authorization: "Bearer " + key },
  });
  if (!r.ok) return reply(404, { ok: false, error: "session_not_found" }, origin);
  const s = await r.json();

  if (s.payment_status !== "paid") return reply(402, { ok: false, error: "not_paid" }, origin);
  if (String(s.currency).toLowerCase() !== "usd") return reply(400, { ok: false, error: "currency" }, origin);
  const doubloons = PACKS[Number(s.amount_subtotal ?? s.amount_total)];
  if (!doubloons) return reply(400, { ok: false, error: "unknown_pack" }, origin);

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });
  const { error } = await db.from("stripe_claims").insert({
    session_id: sessionId,
    doubloons,
    amount_total: Number(s.amount_total),
    currency: String(s.currency).toLowerCase(),
  });
  if (error) {
    if (error.code === "23505") return reply(409, { ok: false, error: "already_claimed" }, origin);
    return reply(500, { ok: false, error: "db" }, origin);
  }
  return reply(200, { ok: true, doubloons }, origin);
});
