import type { Player } from "./types";

/** The eight players, in draw order. */
export const PLAYERS: Player[] = [
  "Shadi",
  "Leon",
  "Cole",
  "Fergus",
  "Josh",
  "Yaro",
  "Connor",
  "Emanuele",
];

/**
 * The draw: each player and the six teams they were assigned.
 * This is fixed for the whole tournament — it is the source of truth for
 * who "owns" each team. Team names are exactly as provided.
 */
export const DRAW: Record<Player, string[]> = {
  Shadi: ["Turkey", "Japan", "Belgium", "Portugal", "Korea Republic", "Jordan"],
  Leon: ["South Africa", "Sweden", "Iran", "Germany", "Mexico", "Panama"],
  Cole: ["Canada", "Egypt", "Côte d'Ivoire", "Czech Republic", "Ghana", "Norway"],
  Fergus: ["Congo DR", "Bosnia and Herzegovina", "Curaçao", "Australia", "Morocco", "Croatia"],
  Josh: ["Spain", "Tunisia", "Netherlands", "Cape Verde Islands", "Switzerland", "New Zealand"],
  Yaro: ["Argentina", "Iraq", "Uzbekistan", "England", "United States", "Colombia"],
  Connor: ["Senegal", "Brazil", "Paraguay", "Saudi Arabia", "Haiti", "Ecuador"],
  Emanuele: ["Algeria", "Austria", "France", "Qatar", "Scotland", "Uruguay"],
};

/** All 48 teams, alphabetically sorted (used to populate the match dropdowns). */
export const TEAMS: string[] = Object.values(DRAW)
  .flat()
  .sort((a, b) => a.localeCompare(b));

/** Reverse lookup: team name → the player who owns it. */
export const TEAM_OWNER: Record<string, Player> = (() => {
  const owners: Record<string, Player> = {};
  for (const player of PLAYERS) {
    for (const team of DRAW[player]) {
      owners[team] = player;
    }
  }
  return owners;
})();
