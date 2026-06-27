import { z } from "zod";

/** The fixed emoji palette for match reactions (shared by API + UI). */
export const REACTION_EMOJIS = ["🔥", "😂", "😭", "👏", "🐐", "💩"] as const;

export const MAX_COMMENT_LENGTH = 280;
export const MAX_AUTHOR_LENGTH = 24;

export const reactionSchema = z.object({
  matchId: z.number().int().positive(),
  emoji: z.enum(REACTION_EMOJIS),
  author: z.string().trim().min(1).max(MAX_AUTHOR_LENGTH),
});

export const commentSchema = z.object({
  author: z.string().trim().min(1).max(MAX_AUTHOR_LENGTH),
  body: z.string().trim().min(1).max(MAX_COMMENT_LENGTH),
});
