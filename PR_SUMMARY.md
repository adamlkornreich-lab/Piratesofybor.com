# Pull request: app-build → main

© 2026 Adam Kornreich / R.A. Consulting ❤ Pops & Pippy

**Do not merge until you've tested a TestFlight / internal-testing build.** Nothing here changes how the website behaves until `assets/poy-config.js` has your Supabase URL and key.

## What changed

**App shell**
- `package.json`, `capacitor.config.json`: Capacitor 6 app "Pirates of Ybor", id `com.raconsulting.piratesofybor`.
- `resources/`: icon (Pops & Pippy poster), Android adaptive icon layers, splash (poster + Pippy watermark).
- `scripts/build-web.mjs` builds `www/` for the app; `scripts/native-setup.mjs` adds the sign-in return link, Sign in with Apple capability, version numbers and release signing to the native projects.
- `codemagic.yaml`: iOS → TestFlight, Android → Google Play internal, Amazon APK, Galaxy Store APK. Signing keys come from Codemagic, never the repo.

**Backend (Supabase)** — `supabase/`
- Tables `profiles`, `scores`, `entitlements`, `questions`, `admins`, `ai_usage`, all with row level security (players only see their own rows; questions are read-only, premium packs only with Crew Pass).
- Edge functions: `ask-quartermaster` (Claude, pirate system prompt, 40 questions/day per player), `generate-questions` (nightly strict-JSON writer → dedupe by hash → second-pass fact/tone check → approved / pending / rejected), `revenuecat-webhook` (writes entitlements), `delete-account`.
- Nightly cron at about 3:17 AM Eastern.

**Website / app pages**
- `assets/poy.js` (new, on every page): sign-in (native Apple sheet on iPhone; Google, Facebook and Apple through the browser elsewhere), store purchases through RevenueCat, quiet score sync (on-device saves stay the fallback), 21+ gate on the Pour-Off and tavern games, fresh trivia, the course pack, the Quartermaster.
- `account/`: name, avatar, my scores, the ship's store with Restore purchases, sign out, Delete my account. On the website, store items show "Available in the app" with store buttons; no card payments on the web.
- `admin/`: approve or reject pending questions, or write fresh ones now (your account only).
- Trivia mixes in approved questions and adds the Crew Pass packs; Andy Golf Club gets the **Ybor Links Back Nine** when the course pack is owned; /play's Ask anything now runs through the server.
- `assets/ship.js`: Account link in the menu; Privacy · Support · Delete My Data · No Endorsement footer on every page that lacked it.
- Privacy policy, Delete My Data, The App and the Grotto privacy page rewritten to match; domain changed to **thepiratesofybor.com** everywhere; Grotto service worker added (it was a 404).

**Docs**: `APP_SETUP.md` (every click, plus the App Store privacy labels and Google Play data-safety answers), `STORE_LISTING.md`, `.env.example`.

## Checked here
- All 24 pages load with no script errors, menu bar and watermark present (the two Grotto policy pages now have the watermark too).
- With a stand-in backend: sign-in buttons, Account page signed in/out, score upload and cross-device pull, trivia mixing, course pack unlock, 21+ gate, Quartermaster streaming and the AI trivia round.

## Not checked here (needs your accounts)
Real Supabase deploy, real sign-in, sandbox purchase, restore, account deletion and the native builds. The sandbox this was built in can't reach npm, so `npm install`, `cap add` and the icon generation run for the first time on Codemagic.

## Still to click
See "What you'll still do by hand" in `CLAUDE_CODE_PROMPT.md` and the full list in `APP_SETUP.md`. Open items: TikTok sign-in, Samsung sign-in and billing, the tournament game mode, Facebook Instant Games.
