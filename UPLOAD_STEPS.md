# Putting Pirates of Ybor on thepiratesofybor.com

© 2026 Adam Kornreich / R.A. Consulting ❤ Pops & Pippy

Everything in this folder is a finished website. There is nothing to install or build. You only copy the files to your web host.

## What's in the folder

| Web address | Folder | What it is |
|---|---|---|
| thepiratesofybor.com | `index.html` | The shipwreck entrance: tap the Game Room, Movie Room, Gaspar's Grotto, Family Room or the App |
| /arcade | `arcade/` | Game Room: Arcade & Marketplace hub |
| /app | `app/` | The App: store list and add-to-home-screen help |
| /golf | `golf/` | Andy Golf Club |
| /pour-off | `pour-off/` | Gaspar's Pour-Off and Mixology Showdown |
| /kraken | `kraken/` | Whack-a-Kraken |
| /tavern | `tavern/` | Tavern Games |
| /trivia | `trivia/` | Gaspar's Grotto Trivia |
| /game-deck | `game-deck/` | Chess, checkers, treasure, ping pong, beer pong |
| /grotto-arcade | `grotto-arcade/` | Gaspar's Grotto tavern and arcade |
| /classics | `classics/` | Arcade Classics, Shere's Revenge, jousting and more |
| /play | `play/` | Movie Room: Name That Reel movie night |
| /crew | `crew/` | Family Room: the crew, gallery and movie (large page, about 8 MB) |
| /dashboard | `dashboard/` | Captain's Dashboard |
| /account | `account/` | Sign in, my scores, the ship's store, sign out, delete account |
| /admin | `admin/` | Captain's Quarters: approve fresh trivia (your account only) |
| /privacy, /support, /delete-my-data, /no-endorsement | same names | The pages the app stores ask for |
| — | `assets/` | Poster, Pippy watermark, the menu bar every page shares, and `poy.js` / `poy-config.js` (accounts and the app layer) |

Upload only the website files: everything except `node_modules`, `www`, `android`, `ios`, `supabase`, `scripts`, `resources` and the `.md`/`package.json`/`codemagic.yaml` files (they are harmless if uploaded, just not needed). Keep the folder structure exactly as it is. Every page finds the menu and watermark in `assets/`.

## Option A: Netlify (easiest, free)

1. Unzip `piratesofybor-site.zip` on your computer.
2. Go to app.netlify.com and sign in (Google or GitHub works).
3. Open **Sites**, then drag the unzipped `piratesofybor-site` folder onto the page. Netlify gives you a test address in about a minute. Open it and click around.
4. In that site, open **Domain management**, choose **Add a domain**, and type `thepiratesofybor.com`.
5. Netlify shows the DNS records to add. Log in where you bought thepiratesofybor.com (GoDaddy, Namecheap, Squarespace and so on), open the DNS settings, and add those records exactly. Remove any old records it tells you to replace.
6. Wait for the domain to connect (minutes to a few hours). Netlify turns on the secure https lock by itself.
7. To update later, drag the new folder onto the site's **Deploys** tab.

## Option B: GitHub Pages (free, good for the Claude Code build later)

1. Make a new repository on github.com called `piratesofybor-site`.
2. Choose **Add file → Upload files**, drag in everything inside the unzipped folder (not the folder itself), and commit.
3. Open **Settings → Pages**. Under **Source** choose **Deploy from a branch**, branch `main`, folder `/ (root)`, and save.
4. In the same Pages screen, type `thepiratesofybor.com` under **Custom domain** and save, then tick **Enforce HTTPS** once it lets you.
5. At your domain registrar, add the DNS records GitHub's Pages guide lists for an apex domain (four A records and a CNAME for www).

## Option C: A host you already pay for (cPanel, Hostinger, Bluehost)

1. Log in and open **File Manager**.
2. Go into `public_html` (the folder your domain points to). Move any old site files into a backup folder first.
3. Upload `piratesofybor-site.zip` there, right-click it and choose **Extract**.
4. If the files landed inside a `piratesofybor-site` subfolder, move its contents up one level so `index.html` sits directly in `public_html`.
5. Visit thepiratesofybor.com to check.

## After it's live: a 2-minute check

- The home page shows the broken ship, and tapping each room opens it.
- Tap a few games, then tap **⚓ Pirates of Ybor** in the menu to get back home.
- The Pippy watermark and copyright line show in the corner.
- Privacy, Support and Delete My Data open from the footer. Copy their addresses; the App Store and Google Play ask for them.

## Good to know

- Until `assets/poy-config.js` has your Supabase address and key (see `APP_SETUP.md`), the site works exactly as before: no Account link, scores save on each device, and the Quartermaster on /play rests quietly.
- Once it's filled in, the Account page, cross-device scores, fresh trivia and the Quartermaster switch on by themselves on the website too. Store purchases only happen inside the app.
- The Pour-Off and any drink content is 21+. Keep that note on ads and store listings.
