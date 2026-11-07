# Claude Code build: sign-in, store billing and the app

© 2026 Adam Kornreich / R.A. Consulting ❤ Pops & Pippy

## Before you start

1. Put this site folder in a GitHub repository (Option B in `UPLOAD_STEPS.md`), then open Claude Code in that repository.
2. Have these accounts ready. You sign in to them yourself; never paste passwords or secret keys into chat. Claude Code will tell you which value goes in which environment variable.
   - Apple Developer Program, and App Store Connect
   - Google Play Console
   - Supabase (free tier is fine to start), for accounts and the question database
   - RevenueCat (free to start), which handles Apple and Google purchases in one place
   - Codemagic, which builds the iPhone and Android apps
   - Facebook for Developers and TikTok for Developers, if you want those sign-in buttons
3. Copy everything in the box below into Claude Code.

---

```
You are building the Pirates of Ybor app from this repository. The repo is a finished static website:
index.html (home) plus one folder per game (arcade, golf, pour-off, kraken, tavern, trivia, game-deck,
grotto-arcade, classics, play, crew, dashboard), policy pages (privacy, support, delete-my-data,
no-endorsement) and assets/ship.js, which adds the menu bar and the Pops & Pippy watermark to every page.
Work on a new branch called app-build. Do not rewrite games that work; wrap and extend them.

GOAL
One app for iPhone, Android phones and tablets, Samsung Galaxy Store and Amazon Appstore, built from this
same website, with accounts, store purchases and fresh trivia. The website keeps working on its own.

1. APP SHELL
   - Wrap the site with Capacitor (iOS + Android). App name "Pirates of Ybor", bundle id com.raconsulting.piratesofybor
     (ask me before changing it). Use assets/watermark.png and assets/poster.jpg to make the icon and splash.
   - Add a codemagic.yaml with iOS and Android workflows. Signing keys come from Codemagic environment groups, never the repo.
   - Keep ship.js working inside the app; add a bottom "Account" link to the bar when running inside the app.

2. BACKEND (Supabase)
   - Tables: profiles (id, display_name, avatar, created_at), scores (user_id, game, score, created_at),
     entitlements (user_id, product_id, source, expires_at), questions (as in the question generator design:
     category, difficulty, question, options, correct_index, explanation, source_hash, status, times_served, times_correct).
   - Row level security on every table: users read and write only their own rows; questions are read-only to players.
   - Move each game's on-device saves (localStorage) into scores when the player is signed in, and keep
     localStorage as the fallback when signed out. Playing must never require sign-in.

3. SIGN-IN
   - Supabase Auth with Sign in with Apple and Google first. Apple requires Sign in with Apple whenever other
     social sign-ins are offered, so ship both together.
   - Add Facebook next. Add TikTok through Supabase's custom OAuth support only if it works cleanly; otherwise
     leave a disabled button and tell me what's missing. Samsung has no standard sign-in for this; skip it and tell me.
   - Build an Account page: name, avatar, my scores, restore purchases, sign out, and Delete My Account.
     Delete My Account must remove the profile, scores and auth user (both app stores require in-app account deletion).
     Update delete-my-data/index.html so it explains this.

4. PURCHASES
   - Digital items must go through Apple and Google store billing. Use RevenueCat with the Capacitor plugin.
   - Products to set up (I will create them in App Store Connect and Play Console with these ids):
     poy_course_pack ($2.99, unlocks extra golf courses), poy_tournament_entry (consumable),
     poy_crew_pass_monthly (subscription: ad-free, all premium games, extra trivia packs).
   - A RevenueCat webhook (Supabase Edge Function) writes entitlements; games check entitlements to unlock content.
   - On the plain website, show premium items as "Available in the app" with store badges. Do not add card payments to the website.
   - Physical merch is separate and only through a normal web checkout link I'll provide later; never sell it in-app.

5. FRESH TRIVIA
   - Build the nightly question generator as a Supabase Edge Function on a cron schedule, following the design in
     my "Merge Prompt and Question Generator" doc: strict JSON, dedupe by hash, second-pass fact and tone check
     (mildly flirty at most, never explicit), borderline questions go to pending.
   - Add a simple admin page (only my account) to approve or reject pending questions.
   - Point the trivia games at the questions table, falling back to their built-in questions offline.
   - The AI key lives only in Supabase secrets.

6. REPLACE "ASK ANYTHING" ON /play
   - It currently only works inside Claude. Replace it with a call to a Supabase Edge Function that uses the
     Claude API (key in Supabase secrets), with a short pirate-voiced system prompt and a rate limit per user.

7. RULES THAT KEEP THE STORES HAPPY
   - Age rating: drink-themed games (pour-off and drinking bar games) sit behind a one-time "Are you 21 or older?" gate.
   - Privacy policy must list exactly what accounts, scores and purchases collect; update privacy/index.html to match
     what you built, and fill out the App Store privacy labels and Google Play data safety form from it (give me the answers).
   - Real people's likenesses appear only where I have releases; keep the no-endorsement notice linked in the footer.
   - Keep the copyright line "© 2026 Adam Kornreich / R.A. Consulting ❤ Pops & Pippy" and the watermark on every screen.

8. FINISH
   - Put every key and id in environment variables and add a .env.example listing them with plain-English notes.
   - Run the web build and both app builds, fix errors, and test sign-in, a sandbox purchase, restore and account deletion.
   - Write STORE_LISTING.md (name, subtitle, description, keywords, screenshots to take, review notes for Apple).
   - Open a pull request summarizing what changed and what I still need to click in each store. Do not merge to main without asking me.
```

---

## What you'll still do by hand

- Create the three products in App Store Connect and Google Play Console with the ids above, and connect both stores to RevenueCat.
- Add your signing certificates and keys in Codemagic.
- Fill in the store listings and press **Submit for Review**.
- Apple charges about $99 a year and Google about $25 once; confirm current amounts when you sign up. Both stores keep a share of each purchase.
