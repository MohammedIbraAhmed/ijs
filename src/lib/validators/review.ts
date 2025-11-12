import { z } from 'zod';

export const reviewSubmissionSchema = z.object({
  overallRecommendation: z.enum([
    'accept',
    'minor_revision',
    'major_revision',
    'reject',
  ]),
  ratings: z.object({
    originality: z.number().min(1).max(5),
    methodology: z.number().min(1).max(5),
    clarity: z.number().min(1).max(5),
    significance: z.number().min(1).max(5),
    references: z.number().min(1).max(5),
  }),
  comments: z.object({
    strengths: z.string().min(50, 'Please provide detailed strengths (at least 50 characters)'),
    weaknesses: z.string().min(50, 'Please provide detailed weaknesses (at least 50 characters)'),
    suggestions: z.string().min(50, 'Please provide detailed suggestions (at least 50 characters)'),
    confidentialComments: z.string().optional(),
  }),
});

export type ReviewSubmission = z.infer<typeof reviewSubmissionSchema>;
