// Builds preview/: the whole site in TEST MODE, for a private preview link that needs nothing installed.
// Never deployed to thepiratesofybor.com (test mode is switched off there in assets/poy.js regardless).
// © 2026 Adam Kornreich / R.A. Consulting ❤ Pops & Pippy
import { cpSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "preview");
if (process.env.CI || process.env.CM_BUILD_ID) { console.error("Preview builds are not made on CI."); process.exit(1); }
const SKIP = new Set(["node_modules", "www", "preview", "android", "ios", "supabase", "scripts", "resources", "package.json", "package-lock.json", "capacitor.config.json", "codemagic.yaml"]);
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT);
for (const n of readdirSync(ROOT)) { if (SKIP.has(n) || n.startsWith(".") || n.endsWith(".md")) continue; cpSync(join(ROOT, n), join(OUT, n), { recursive: true }); }
writeFileSync(join(OUT, "assets", "poy-config.js"), `/* PREVIEW: test mode, no sign-in, nothing leaves the device. */
window.POY_CONFIG = { mode: "local", preview: true, siteUrl: "https://thepiratesofybor.com", appScheme: "com.raconsulting.piratesofybor",
  supabaseUrl: "", supabaseAnonKey: "", revenuecat: {}, androidStore: "google", storeLinks: {}, signIn: {} };
`);
console.log("preview/ ready");
