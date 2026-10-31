// Test mode on your own computer: no sign-in, no backend, nothing leaves the device.
//   npm run dev:local        then open http://localhost:8080
// Serves the site straight from this folder and hands the browser a test-mode settings file,
// so nothing in the repo changes and nothing you could commit turns test mode on.
// © 2026 Adam Kornreich / R.A. Consulting ❤ Pops & Pippy
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname, normalize, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.env.PORT || 8080);
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css", ".json": "application/json",
  ".webmanifest": "application/manifest+json", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml",
  ".mp3": "audio/mpeg", ".mp4": "video/mp4", ".ico": "image/x-icon" };

const CONFIG = `/* Served by scripts/dev-local.mjs: TEST MODE. Not a real file. */
window.POY_CONFIG = { mode: "local", siteUrl: "http://localhost:${PORT}", appScheme: "com.raconsulting.piratesofybor",
  supabaseUrl: "", supabaseAnonKey: "", revenuecat: {}, androidStore: "google", storeLinks: {}, signIn: {} };
`;

createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (path === "/assets/poy-config.js") { res.writeHead(200, { "Content-Type": TYPES[".js"], "Cache-Control": "no-store" }); return res.end(CONFIG); }
  let file = normalize(join(ROOT, path));
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  try { if ((await stat(file)).isDirectory()) file = join(file, "index.html"); const body = await readFile(file);
    res.writeHead(200, { "Content-Type": TYPES[extname(file).toLowerCase()] || "application/octet-stream", "Cache-Control": "no-store" }); res.end(body);
  } catch { res.writeHead(404, { "Content-Type": "text/plain" }); res.end("Not found"); }
}).listen(PORT, "127.0.0.1", () => console.log(`🧪 Pirates of Ybor TEST MODE at http://localhost:${PORT}  (Ctrl+C to stop)`));
