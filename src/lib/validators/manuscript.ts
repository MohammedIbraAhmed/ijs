import { z } from 'zod';

// Author schema
export const authorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  affiliation: z.string().optional(),
  corresponding: z.boolean().default(false),
});

// Suggested reviewer schema
export const suggestedReviewerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  affiliation: z.string().optional(),
  expertise: z.string().optional(),
});

// Complete manuscript submission schema
export const manuscriptSubmissionSchema = z.object({
  // Step 1: Basic Information
  title: z
    .string()
    .min(10, 'Title must be at least 10 characters')
    .max(500, 'Title cannot exceed 500 characters'),
  abstract: z
    .string()
    .min(50, 'Abstract must be at least 50 characters')
    .max(3000, 'Abstract cannot exceed 3000 characters'),
  manuscriptType: z.enum(['research', 'review', 'case-study', 'short-communication'], {
    required_error: 'Please select a manuscript type',
  }),
  category: z.string().optional(),

  // Step 2: Authors
  authors: z
    .array(authorSchema)
    .min(1, 'At least one author is required')
    .refine(
      (authors) => authors.some((author) => author.corresponding),
      'At least one corresponding author is required'
    ),

  // Step 3: Keywords
  keywords: z
    .array(z.string().min(2))
    .min(1, 'At least 1 keyword is required')
    .max(10, 'Maximum 10 keywords allowed'),

  // Step 4: Files (will be handled separately for upload)
  // manuscriptFile: handled by FormData
  // supplementaryFiles: handled by FormData
  // coverLetter: handled by FormData

  // Step 5: Suggested Reviewers (optional)
  suggestedReviewers: z.array(suggestedReviewerSchema).max(5).optional(),

  // Additional fields
  status: z.enum(['draft', 'submitted']).default('draft'),
});

// Type exports
export type AuthorFormData = z.infer<typeof authorSchema>;
export type SuggestedReviewerFormData = z.infer<typeof suggestedReviewerSchema>;
export type ManuscriptSubmissionFormData = z.infer<typeof manuscriptSubmissionSchema>;

// Individual step schemas for validation
export const step1Schema = manuscriptSubmissionSchema.pick({
  title: true,
  abstract: true,
  manuscriptType: true,
  category: true,
});

export const step2Schema = manuscriptSubmissionSchema.pick({
  authors: true,
});

export const step3Schema = manuscriptSubmissionSchema.pick({
  keywords: true,
});

export const step5Schema = manuscriptSubmissionSchema.pick({
  suggestedReviewers: true,
});
