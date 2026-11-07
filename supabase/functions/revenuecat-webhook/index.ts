// RevenueCat → Supabase entitlements.
// In RevenueCat: Project settings → Integrations → Webhooks, URL
//   https://<project>.supabase.co/functions/v1/revenuecat-webhook
// and set the Authorization header to the same value as REVENUECAT_WEBHOOK_AUTH.
// The app logs players into RevenueCat with their Supabase user id, so app_user_id is the user id.
// © 2026 Adam Kornreich / R.A. Consulting ❤ Pops & Pippy
import { admin } from "../_shared/util.ts";

const PRODUCTS = new Set(["poy_course_pack", "poy_tournament_entry", "poy_crew_pass_monthly"]);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SOURCE: Record<string, string> = { APP_STORE: "app_store", MAC_APP_STORE: "app_store", PLAY_STORE: "play_store", AMAZON: "amazon", PROMOTIONAL: "promotional" };

// Google subscriptions arrive as "product:base-plan"; keep the product part.
const productOf = (id: string) => String(id ?? "").split(":")[0];

function userOf(ev: Record<string, unknown>): string | null {
  const ids = [ev.app_user_id, ev.original_app_user_id, ...((ev.aliases as string[]) ?? [])];
  return (ids.find((x) => typeof x === "string" && UUID.test(x)) as string) ?? null;
}

const ok = (msg: string) => new Response(JSON.stringify({ ok: true, msg }), { headers: { "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  const expected = Deno.env.get("REVENUECAT_WEBHOOK_AUTH");
  if (!expected || req.headers.get("Authorization") !== expected) return new Response("forbidden", { status: 403 });

  let payload: { event?: Record<string, unknown> };
  try { payload = await req.json(); } catch { return new Response("bad request", { status: 400 }); }
  const ev = payload.event ?? {};
  const type = String(ev.type ?? "");
  if (type === "TEST") return ok("test received");

  const db = admin();

  if (type === "TRANSFER") {
    const from = ((ev.transferred_from as string[]) ?? []).filter((x) => UUID.test(x));
    const to = ((ev.transferred_to as string[]) ?? []).find((x) => UUID.test(x));
    if (to && from.length) await db.from("entitlements").update({ user_id: to }).in("user_id", from);
    return ok("transfer");
  }

  const product = productOf(ev.product_id as string);
  const user = userOf(ev);
  if (!PRODUCTS.has(product)) return ok(`ignored product ${product}`);
  if (!user) return ok("no supabase user id on event (anonymous purchase); restore after sign-in links it");

  const expires = typeof ev.expiration_at_ms === "number" ? new Date(ev.expiration_at_ms).toISOString() : null;
  const txn = String(ev.transaction_id ?? ev.id ?? "");
  const source = SOURCE[String(ev.store)] ?? String(ev.store ?? "unknown").toLowerCase();

  switch (type) {
    case "INITIAL_PURCHASE":
    case "RENEWAL":
    case "NON_RENEWING_PURCHASE":
    case "UNCANCELLATION":
    case "PRODUCT_CHANGE":
    case "SUBSCRIPTION_EXTENDED":
    case "TEMPORARY_ENTITLEMENT_GRANT": {
      const { error } = await db.from("entitlements").upsert({
        user_id: user, product_id: product, source, transaction_id: txn || null,
        expires_at: product === "poy_crew_pass_monthly" ? expires : null,
      }, { onConflict: "transaction_id" });
      if (error) { console.error(error); return new Response("db error", { status: 500 }); }
      if (product === "poy_crew_pass_monthly" && expires) {
        // Keep every row of the pass in step with the newest expiry.
        await db.from("entitlements").update({ expires_at: expires }).eq("user_id", user).eq("product_id", product).is("consumed_at", null);
      }
      return ok(type);
    }
    case "CANCELLATION": {
      // A normal cancel keeps access until the period ends. A refund (CUSTOMER_SUPPORT) ends it now.
      if (ev.cancel_reason === "CUSTOMER_SUPPORT") {
        const q = db.from("entitlements").update({ expires_at: new Date().toISOString() }).eq("user_id", user).eq("product_id", product);
        await (txn ? q.eq("transaction_id", txn) : q);
      }
      return ok(type);
    }
    case "EXPIRATION": {
      await db.from("entitlements").update({ expires_at: expires ?? new Date().toISOString() })
        .eq("user_id", user).eq("product_id", product);
      return ok(type);
    }
    default:
      return ok(`no action for ${type}`);
  }
});
