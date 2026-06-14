# World Cup Sweepstake ⚽

A small Next.js app for our World Cup sweepstake. Enter match results, and a live
leaderboard ranks the 8 players by the football points (3 for a win, 1 for a draw)
earned across the 6 teams each of them drew.

## How scoring works

- Every team earns **3 points for a win, 1 for a draw, 0 for a loss**, credited to its owner.
- A player's total is the sum across all 6 of their teams.
- Players are ranked by **points → goal difference → goals for → name**.
- Penalty shootouts don't change points (a draw stays 1 pt each); they only record who advanced.

The players, the 48 teams, and the draw (who owns which team) are fixed in
[`src/lib/teams.ts`](src/lib/teams.ts). The only data stored in the database is the list of matches.

## Automatic scores (optional)

Set a free **football-data.org** API token (`FOOTBALL_DATA_TOKEN`) and the app will sync live
World Cup scores automatically:

- Get a token at [football-data.org/client/register](https://www.football-data.org/client/register)
  and add it as an env var (locally in `.env.local`, on Vercel under Settings → Environment Variables).
- Fixtures are pulled in the background whenever the page is viewed (throttled to once every ~90s),
  and there's a **Sync now** button on the Matches page.
- **Manual override always wins:** if you edit a synced match by hand it becomes locked and the
  sync won't overwrite it (shown as "Edited"). Manually added matches are independent of the sync.
- Team names from the API are mapped to our draw in [`src/lib/team-matching.ts`](src/lib/team-matching.ts).
  If a name can't be matched it's reported in the Sync now result so an alias can be added.

If the token is unset, the app stays manual-entry only — nothing breaks.

## Running locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

**No database needed for local dev** — if `DATABASE_URL` is not set, results are saved to a local
file at `.data/matches.json`. This is for development only; the deployed version needs a real
database (Vercel filesystems are read-only).

## Deploying to Vercel (shared, live data)

1. Push this folder to a Git repo and import it in [Vercel](https://vercel.com).
2. In the project, go to **Storage → Create Database → Neon** (free tier). Vercel adds a
   `DATABASE_URL` env var automatically. (You can also bring your own Neon/Postgres URL — see
   [`.env.example`](.env.example).)
3. Create the tables once by running [`db/schema.sql`](db/schema.sql) in the Neon SQL editor.
   (If you set the database up before the auto-sync feature, run
   [`db/migrations/001_auto_sync.sql`](db/migrations/001_auto_sync.sql) instead — it's idempotent.)
4. (Optional) Add `FOOTBALL_DATA_TOKEN` to enable automatic scores — see above.
5. Deploy and share the URL. Anyone with the link can add, edit, or delete results.

## Tech

Next.js (App Router) · TypeScript · Tailwind CSS v4 · Neon Postgres
(`@neondatabase/serverless`) · SWR · zod.
