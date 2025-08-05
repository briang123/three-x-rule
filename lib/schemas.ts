import { z } from 'zod';

// Structured remix response schema
export const RemixResponseSchema = z.object({
  combinedAnswer: z.string(),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
  sources: z.array(z.string()),
  improvements: z.array(z.string()),
});

// Social post schema
export const SocialPostSchema = z.object({
  content: z.string(),
  hashtags: z.array(z.string()),
  characterCount: z.number().min(0),
  platform: z.enum(['twitter', 'linkedin', 'facebook', 'instagram']),
});

// Content enhancement schema
export const ContentEnhancementSchema = z.object({
  enhancedContent: z.string(),
  improvements: z.array(z.string()),
  factCheckResults: z.array(
    z.object({
      claim: z.string(),
      verified: z.boolean(),
      source: z.string().optional(),
    }),
  ),
  suggestions: z.array(z.string()),
});

// Export all schemas for easy access
export const schemas = {
  remix: RemixResponseSchema,
  socialPost: SocialPostSchema,
  contentEnhancement: ContentEnhancementSchema,
} as const;

// Type exports for use in other files
export type RemixResponse = z.infer<typeof RemixResponseSchema>;
export type SocialPost = z.infer<typeof SocialPostSchema>;
export type ContentEnhancement = z.infer<typeof ContentEnhancementSchema>;
