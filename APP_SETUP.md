# Pirates of Ybor app: what was built and what you click

© 2026 Adam Kornreich / R.A. Consulting ❤ Pops & Pippy

This branch (`app-build`) turns the website into the Pirates of Ybor app for iPhone, iPad, Android, Amazon and Samsung, with accounts, store purchases, nightly trivia and the Quartermaster. The website keeps working exactly as before until you switch the backend on.

You sign in to every service yourself. Never paste a password or secret key into chat.

---

## 1. Supabase (accounts, scores, questions) — about 20 minutes

1. Create a project at supabase.com (free tier is fine). Pick a US East region.
2. Install the Supabase CLI on your computer, open a terminal in this repo and run:
   ```
   supabase login
   supabase link --project-ref <your project ref>
   supabase db push
   supabase functions deploy ask-quartermaster delete-account generate-questions revenuecat-webhook
   ```
   (Codemagic does not need to do this; it's a one-time setup from your computer. Claude Code can run these for you.)
3. **Edge Function secrets** (Dashboard → Edge Functions → Secrets): add `ANTHROPIC_API_KEY`, `CRON_SECRET`, `REVENUECAT_WEBHOOK_AUTH` and optionally `REVENUECAT_SECRET_KEY` (see `.env.example` for what each is).
4. **Nightly trivia:** in the SQL editor run, with your own values:
   ```sql
   select vault.create_secret('https://<project-ref>.supabase.co', 'project_url');
   select vault.create_secret('<same as CRON_SECRET>', 'cron_secret');
   ```
   The job `poy-nightly-questions` then runs every night at about 3:17 AM Eastern.
5. **Make yourself captain** (unlocks /admin): sign in once on the Account page, then in the SQL editor:
   ```sql
   insert into public.admins (user_id) select id from auth.users where email = 'adamlkornreich@gmail.com';
   ```
6. **Sign-in providers** (Authentication → Providers):
   - **Apple:** in Apple Developer create a Services ID (`com.raconsulting.piratesofybor.signin`), enable Sign in with Apple on the App ID `com.raconsulting.piratesofybor`, make a Sign in with Apple key. In Supabase enter both ids in *Client IDs* (`com.raconsulting.piratesofybor.signin,com.raconsulting.piratesofybor`) and the generated secret. Apple's secret expires every 6 months; Supabase's Apple page shows how to renew it.
   - **Google:** Google Cloud Console → OAuth consent screen + a Web client id/secret. Paste them in Supabase.
   - **Facebook:** developers.facebook.com → create an app with Facebook Login → paste App ID and secret.
   - **URL configuration:** Site URL `https://thepiratesofybor.com`; Redirect URLs `https://thepiratesofybor.com/account/index.html`, `https://www.thepiratesofybor.com/account/index.html`, `com.raconsulting.piratesofybor://auth-callback`.
7. Put the **Project URL** and **anon key** in `.env` (website) and in Codemagic (app). Run `npm run build:web` and commit `assets/poy-config.js`; the website's Account link, synced scores, fresh trivia and Quartermaster switch on.

## 2. RevenueCat (store purchases)

1. Create a project; add an **App Store** app, a **Play Store** app and an **Amazon** app.
2. Connect each store (App Store Connect API key / in-app purchase key; Play service account; Amazon shared key). RevenueCat's dashboard walks you through each.
3. Add the three products from `STORE_LISTING.md`, the entitlements and a default offering.
4. Webhooks: URL `https://<project-ref>.supabase.co/functions/v1/revenuecat-webhook`, Authorization header = your `REVENUECAT_WEBHOOK_AUTH`. Press **Send test event**; it should succeed.
5. Copy the three **public** SDK keys into Codemagic (`POY_REVENUECAT_APPLE_KEY`, `..._GOOGLE_KEY`, `..._AMAZON_KEY`).

## 3. The stores

- **App Store Connect:** create the app with bundle id `com.raconsulting.piratesofybor`, create the three products, fill in the listing from `STORE_LISTING.md`, the privacy labels below, and age rating.
- **Google Play Console:** create the app, upload the first AAB from Codemagic to Internal testing, create the products (the subscription with base plan id `monthly`), fill in Data safety from below.
- **Amazon Appstore:** upload the APK from the `android-amazon` workflow; add the products under In-App Items.
- **Samsung Galaxy Store:** upload the APK from `android-galaxy`. That build has the store switched off (Samsung requires its own billing for digital items); everything else works, and players can still sign in and keep scores.

## 4. Codemagic (builds the apps)

1. Sign in at codemagic.io with GitHub and add this repository.
2. **Team settings → Integrations → Developer Portal:** add your App Store Connect API key and name it `poy_asc`.
3. **Code signing identities → Android keystores:** upload or generate an upload keystore, reference name `poy_upload`. **Keep a backup of this keystore**; Google Play needs the same one for every update.
4. **Environment variables:** group `poy_public` with every `POY_` value from `.env.example`; group `google_play` with `GCLOUD_SERVICE_ACCOUNT_CREDENTIALS`.
5. Start **iOS → TestFlight**, then **Android → Google Play**. The first build creates the native `ios/` and `android/` projects, the icons and splash from `resources/`, the sign-in return link and the Sign in with Apple capability automatically.

## Test mode (no sign-in, no backend)

To try every feature on your own computer before any accounts exist:

```
npm run dev:local
```

Open http://localhost:8080. A red **🧪 TEST MODE** label sits in the corner. You play as "Local Pirate" with no sign-in; scores, the Account page, the ship's store and Captain's Quarters all work, but everything stays in that browser and store items unlock for free. Account → **Erase test data** wipes it. The Quartermaster and writing new questions need the real server, so they rest in test mode.

Test mode is controlled by `POY_APP_MODE` (`cloud` or `local`, default `cloud`). Three guards keep it out of real use:
- It only switches on at localhost (or in a developer app build). At thepiratesofybor.com the same setting is ignored and normal sign-in applies.
- `npm run build:web` refuses `POY_APP_MODE=local` on Codemagic, so a store build can never ship with it, and any other value stops the build.
- Test unlocks are stored separately from real purchases, so switching back to `cloud` never leaves a free course pack behind.

## 5. Test before you submit

- Sign in with Apple on an iPhone (TestFlight) and Google on Android. You should land back on the Account page signed in.
- Play a game, then check Account → My scores. Sign in on a second device: your bests come with you.
- Buy the course pack with a sandbox tester (Apple: Settings → App Store → Sandbox Account; Google: license testers). "Play the Ybor Links Back Nine" appears at the bottom of Andy Golf Club.
- Delete the app, reinstall, sign in, tap **Restore purchases**.
- Delete the account; confirm the user is gone in Supabase → Authentication.
- Open /admin and press **Write fresh questions now**; approve a few; they show up in Gaspar's Grotto Trivia within 12 hours (or after clearing the app's data).

---

## App Store privacy labels (App Store Connect → App Privacy)

Tracking: **No** (no data is used to track you across other companies' apps or websites).

| Data type | Collected | Linked to the user | Used for tracking | Purpose |
|---|---|---|---|---|
| Contact Info → Email Address | Yes (only when signing in) | Yes | No | App Functionality |
| Contact Info → Name | Yes (display name) | Yes | No | App Functionality |
| User Content → Other User Content (Quartermaster messages) | Yes | No (not stored; sent to Claude to answer) | No | App Functionality |
| Identifiers → User ID | Yes | Yes | No | App Functionality |
| Purchases → Purchase History | Yes | Yes | No | App Functionality |
| Usage Data → Product Interaction (game scores) | Yes | Yes | No | App Functionality |
| Everything else (location, contacts, health, financial info, browsing, diagnostics, advertising data) | No | | | |

## Google Play Data safety

- **Does your app collect or share any of the required user data types?** Yes.
- **Is all of the user data encrypted in transit?** Yes.
- **Do you provide a way for users to request that their data is deleted?** Yes: in-app (Account → Delete my account) and https://thepiratesofybor.com/delete-my-data/
- **Data collected** (all *optional* — only when the player signs in; none is *shared* with third parties for their own use; processing by Supabase, RevenueCat and Anthropic counts as service providers, not sharing):
  - Personal info → **Name** (display name) and **Email address** — App functionality, Account management
  - Personal info → **User IDs** — App functionality, Account management
  - Financial info → **Purchase history** — App functionality
  - App activity → **App interactions** (game scores) — App functionality
  - App activity → **Other user-generated content** (Quartermaster messages, processed and not stored) — App functionality
- **Not collected:** location, contacts, photos/videos (Reel Maker photos never leave the device), audio, health, messages, files, calendar, web history, device IDs, crash logs.

## What is not done yet

- **TikTok sign-in:** shows as "coming soon". Supabase has no built-in TikTok provider, and TikTok Login Kit does not return a standard OpenID token, so it needs a small custom bridge (a TikTok developer app plus an edge function that exchanges TikTok's code and creates the Supabase session). Worth adding once the app is approved.
- **Samsung sign-in:** skipped. Samsung Account has no standard sign-in that Supabase or most apps can use; Samsung players use Google, which is on every Galaxy phone.
- **Samsung billing:** the Galaxy build has purchases off. Turning them on means adding Samsung In-App Purchase, which RevenueCat does not support.
- **Tournament night:** the Tournament Entry product, purchase records and `use_tournament_entry()` are ready, but there is no tournament game mode yet to spend the ticket in. Either build the mode before listing that product, or leave it out of the first submission.
- **Facebook Instant Games:** a separate submission with Facebook's own SDK; not part of this build.
- **The QR flag** picture in the Game Room is artwork; it doesn't scan to the site. Make a real QR for thepiratesofybor.com before printing flags.
