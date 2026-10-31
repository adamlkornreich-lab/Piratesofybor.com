// Delete My Account: removes the player's profile, scores, entitlements, AI usage
// and the sign-in account itself. Apple and Google both require this in-app.
// Store subscriptions are billed by Apple/Google, so the page reminds players to
// cancel there; this also asks RevenueCat to forget the customer when a key is set.
// © 2026 Adam Kornreich / R.A. Consulting ❤ Pops & Pippy
import { admin, caller, cors, json } from "../_shared/util.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(req) });
  if (req.method !== "POST") return json(req, { error: "method" }, 405);
  const user = await caller(req);
  if (!user) return json(req, { error: "signin" }, 401);

  const db = admin();
  // Rows also cascade from auth.users, but delete explicitly so nothing lingers if a step fails later.
  for (const table of ["scores", "entitlements", "ai_usage", "admins"]) {
    const { error } = await db.from(table).delete().eq("user_id", user.id);
    if (error) { console.error(table, error); return json(req, { error: "server", step: table }, 500); }
  }
  const { error: pErr } = await db.from("profiles").delete().eq("id", user.id);
  if (pErr) return json(req, { error: "server", step: "profiles" }, 500);

  const rcKey = Deno.env.get("REVENUECAT_SECRET_KEY");
  if (rcKey) {
    try {
      await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(user.id)}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${rcKey}` },
      });
    } catch (e) { console.error("revenuecat delete", e); }
  }

  const { error } = await db.auth.admin.deleteUser(user.id);
  if (error) return json(req, { error: "server", step: "auth" }, 500);
  return json(req, { deleted: true });
});
