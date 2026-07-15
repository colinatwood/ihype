import { z } from 'zod';

export const reportSchema = z.object({
  targetType: z.enum(['profile', 'show', 'track']),
  targetId: z.string().min(3).max(120),
  reason: z.string().trim().min(3).max(120),
  details: z.string().trim().max(1200).optional(),
  company: z.string().trim().max(120).optional()
});
