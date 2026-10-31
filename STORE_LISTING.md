# Pirates of Ybor: store listing

© 2026 Adam Kornreich / R.A. Consulting ❤ Pops & Pippy

Copy these into App Store Connect, Google Play Console, Amazon Developer Console and Samsung Seller Portal.

## Name and subtitle

- **App name:** Pirates of Ybor
- **Subtitle (Apple, 30 characters max):** Pirate trivia, golf & bar games
- **Short description (Google, 80 max):** Pirate trivia, Andy Golf Club, tavern games and movie night from Ybor City, Tampa.

## Description

Welcome aboard, matey. Pirates of Ybor brings the spirit of Ybor City and Gaspar's Grotto to your phone, with Pops the bar cat and Pippy the pirate chihuahua keeping watch.

**Game Room**
- Andy Golf Club: a full nine of pirate golf with drives, chips, sand saves and water hazards
- Whack-a-Kraken, Shere's Revenge swordplay, jousting and arcade classics
- Pirate chess, checkers, Treasure Hunt, ping pong and the Game Deck
- Gaspar's Grotto Trivia with movies, science, history, sports, pirates and the Florida Pirate Trail, with fresh questions every night

**Movie Room**
- Name That Reel movie night and Reel Maker: turn your photos into a short pirate movie
- The Quartermaster, a friendly pirate helper powered by Claude, for game rules, crew names and game-night plans

**Gaspar's Grotto tavern (21+)**
- The Pour-Off mixology showdown and tavern games, for adults 21 and over

Every game plays free with no account. Sign in with Apple, Google or Facebook to keep your best scores on every device.

**Ship's store (optional)**
- Ybor Links Back Nine: nine new holes for Andy Golf Club
- Tournament Entry: a ticket into a bar tournament night
- Crew Pass (monthly): the extra trivia packs (Silver Screen Deep Cuts and, for 21+, Ybor After Dark) with new questions every night, plus each premium game as it launches

Crew Pass renews monthly until cancelled in your store account settings at least 24 hours before the period ends. Privacy: https://thepiratesofybor.com/privacy/ · Terms: Apple's standard EULA.

Mentioning a person, place or brand is not an endorsement: https://thepiratesofybor.com/no-endorsement/

## Keywords (Apple, 100 characters, comma separated)

pirate,trivia,golf,bar games,tampa,ybor,gasparilla,chess,checkers,treasure,movie,quiz,arcade,tavern

## Category and rating

- **Primary category:** Games → Trivia. **Secondary:** Games → Family (Apple) / Casual (Google)
- **Age rating:** answer the questionnaires honestly; the drink content means **Apple 17+** (Frequent/Intense Alcohol, Tobacco, or Drug Use or References) and **Google: Teen or Mature 17+** depending on the IARC answers (alcohol references; no gambling, no real money, no simulated gambling). Contests and the tournament entry award no cash or prizes.
- **Contains ads:** No. **In-app purchases:** Yes.

## Links

- Support URL: https://thepiratesofybor.com/support/
- Privacy policy: https://thepiratesofybor.com/privacy/
- Account deletion (Google Play asks for this): https://thepiratesofybor.com/delete-my-data/
- Marketing URL: https://thepiratesofybor.com/

## In-app products (create with exactly these ids)

| Product id | Type | Price | Display name | Description |
|---|---|---|---|---|
| poy_course_pack | Non-consumable | $2.99 | Ybor Links Back Nine | Nine new holes for Andy Golf Club. |
| poy_tournament_entry | Consumable | your choice (e.g. $0.99) | Tournament Entry | One ticket into a bar tournament night. No cash prizes. |
| poy_crew_pass_monthly | Auto-renewable subscription, 1 month (Apple group "Crew Pass"; Google base plan "monthly") | your choice (e.g. $2.99/mo) | Crew Pass | Extra trivia packs with new questions nightly, plus premium games as they launch. |

In RevenueCat: add all three products, make an entitlement **crew_pass** with poy_crew_pass_monthly and **course_pack** with poy_course_pack, and put them in a default offering.

## Screenshots to take

Take them in the iOS Simulator (6.9" iPhone and 13" iPad) and an Android phone, at 1290×2796 / 2064×2752 / 1080×1920 or larger.

1. The shipwreck home screen with the rooms
2. Andy Golf Club mid-swing on a fairway
3. Trivia with a question on screen and the score streak
4. Whack-a-Kraken in play
5. Pirate chess or the Game Deck
6. Name That Reel / Reel Maker
7. The Quartermaster chat answering "Plan a game night for 8"
8. Account page with My scores

Keep the Pops & Pippy watermark and copyright line visible. Do not use screenshots of the Pour-Off as the first image (keeps the listing all-ages friendly).

## Notes for Apple App Review

> Pirates of Ybor is a collection of HTML5 games packaged with Capacitor. Every game is playable without an account.
>
> **Sign-in** is optional (Account in the top menu). We offer Sign in with Apple alongside Google and Facebook.
>
> **Account deletion:** Account → Delete my account → type DELETE. It removes the profile, scores, purchase records and the auth user immediately.
>
> **In-app purchases** (Account → The ship's store) use StoreKit through RevenueCat. Signing in is required before purchasing so purchases follow the player across devices; "Restore purchases" is on the same screen. The Ybor Links Back Nine unlocks in Andy Golf Club with the "Play the Ybor Links Back Nine" button near the top of the golf screen, shown before the first tee shot.
>
> **AI:** the Quartermaster (Movie Room → Ask anything) and the nightly trivia use Anthropic's Claude through our server, with a family-friendly system prompt, a second-pass content review for generated questions, and a daily limit per player.
>
> **Age:** drink-themed games ask "Are you 21 or older?" before play.
>
> **Demo account:** none needed. Sign in with Apple works for review, and purchases can be tested in the sandbox.
>
> Physical Gaspar's Grotto merch is not sold in the app.
