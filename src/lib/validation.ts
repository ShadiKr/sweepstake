import { z } from "zod";
import { TEAMS } from "./teams";

/**
 * Validation for creating/updating a match. Teams must be real (in the draw),
 * must differ, scores are non-negative integers, and an optional penalty winner
 * must be one of the two teams.
 */
export const matchSchema = z
  .object({
    home_team: z.string().refine((t) => TEAMS.includes(t), "Unknown home team"),
    away_team: z.string().refine((t) => TEAMS.includes(t), "Unknown away team"),
    home_score: z.number().int().min(0).max(99),
    away_score: z.number().int().min(0).max(99),
    stage: z.string().trim().max(40).optional().nullable(),
    pen_winner: z.string().optional().nullable(),
  })
  .refine((d) => d.home_team !== d.away_team, {
    message: "A team can't play itself",
    path: ["away_team"],
  })
  .refine(
    (d) => !d.pen_winner || d.pen_winner === d.home_team || d.pen_winner === d.away_team,
    { message: "Penalty winner must be one of the two teams", path: ["pen_winner"] },
  );

export type MatchInput = z.infer<typeof matchSchema>;
