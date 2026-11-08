# Pirates of Ybor — deploy to Netlify in 2 minutes

Everything in this zip is a plain static website. No build step.

## Fastest: drag and drop
1. Go to https://app.netlify.com/drop
2. Drag this unzipped folder (the one containing index.html) onto the page.
3. Netlify gives you a live URL in about 10 seconds.

## Better: connect GitHub (auto-deploys every push)
1. Netlify → Add new site → Import an existing project → GitHub
2. Pick adamlkornreich-lab/Piratesofybor.com
3. Build command: leave empty. Publish directory: `.`  (netlify.toml already says this)
4. Deploy. Then Domain settings → Add custom domain → thepiratesofybor.com
   and point the GoDaddy DNS where Netlify tells you.

## Where things live
- index.html — the ship home page (rooms)
- ship/ — the full island site: ship/index.html (Welcome Aboard), ship/world/ (Ybor Cay 3D open world, Vanicular, parrots), ship/arcade.html and every game page
- play/, golf/, arcade/, tavern/, trivia/ … — the original game rooms
- assets/ — watermark, poster, icons

## Making changes
Open any .html or .js in a text editor, save, and either drag the folder onto Netlify Drop again or commit + push to GitHub.
Keep the watermark and © 2026 Adam Kornreich / R.A. Consulting ❤ Pops & Pippy line on every page.
