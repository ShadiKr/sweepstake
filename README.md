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
3. Create the table once by running [`db/schema.sql`](db/schema.sql) in the Neon SQL editor.
4. Deploy and share the URL. Anyone with the link can add, edit, or delete results.

## Tech

Next.js (App Router) · TypeScript · Tailwind CSS v4 · Neon Postgres
(`@neondatabase/serverless`) · SWR · zod.
