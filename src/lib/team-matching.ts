import { TEAMS } from "./teams";

/**
 * Maps a team name as returned by football-data.org to the exact team name
 * used in our draw (src/lib/teams.ts).
 *
 * Most names match after normalisation (lowercasing + stripping accents and
 * punctuation). The ALIASES table covers the known spelling differences. If a
 * fixture's team can't be resolved, the sync reports it under `unmatchedTeams`
 * so a new alias can be added here.
 */

function normalize(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics (é → e, ç → c)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// normalized canonical name -> our exact team name
const CANONICAL: Record<string, string> = Object.fromEntries(
  TEAMS.map((t) => [normalize(t), t]),
);

// normalized API spelling -> our exact team name (only the deltas).
// NB: "Korea Republic" is South Korea; North Korea (Korea DPR) is not in the draw.
const ALIASES: Record<string, string> = {
  [normalize("South Korea")]: "Korea Republic",
  [normalize("USA")]: "United States",
  [normalize("United States of America")]: "United States",
  [normalize("Ivory Coast")]: "Côte d'Ivoire",
  [normalize("DR Congo")]: "Congo DR",
  [normalize("Democratic Republic of Congo")]: "Congo DR",
  [normalize("Congo Democratic Republic")]: "Congo DR",
  [normalize("Cape Verde")]: "Cape Verde Islands",
  [normalize("Cabo Verde")]: "Cape Verde Islands",
  [normalize("Czechia")]: "Czech Republic",
  [normalize("Türkiye")]: "Turkey",
  [normalize("Bosnia Herzegovina")]: "Bosnia and Herzegovina",
};

/** Resolve an API team name to our team name, or null if unknown. */
export function resolveTeam(apiName: string): string | null {
  if (!apiName) return null;
  const key = normalize(apiName);
  return CANONICAL[key] ?? ALIASES[key] ?? null;
}
