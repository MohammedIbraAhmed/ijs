// Export all models from a single entry point
export { default as User } from './User';
export type { IUser } from './User';

export { default as Manuscript } from './Manuscript';
export type {
  IManuscript,
  IAuthor,
  IFile,
  IVersion,
  ITimelineEvent,
  ManuscriptStatus,
} from './Manuscript';

export { default as Review } from './Review';
export type { IReview, IRating, IReviewContent, IRevision } from './Review';
