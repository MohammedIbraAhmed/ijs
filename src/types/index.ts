// User roles and permissions
export type UserRole = 'author' | 'reviewer' | 'editor' | 'admin';

// Manuscript statuses
export type ManuscriptStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'revision_required'
  | 'accepted'
  | 'rejected'
  | 'published';

// Review statuses
export type ReviewStatus = 'invited' | 'in-progress' | 'submitted' | 'completed';

// Editorial decisions
export type EditorialDecision = 'accept' | 'reject' | 'revision' | 'desk-reject';

// Review recommendations
export type ReviewRecommendation =
  | 'accept'
  | 'minor-revision'
  | 'major-revision'
  | 'reject';

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
}

export interface SubmissionFormData {
  title: string;
  abstract: string;
  keywords: string[];
  manuscriptType: 'research' | 'review' | 'case-study' | 'short-communication';
  category?: string;
  authors: {
    name: string;
    email: string;
    affiliation?: string;
    corresponding: boolean;
  }[];
  suggestedReviewers?: {
    name: string;
    email: string;
    affiliation?: string;
    expertise?: string;
  }[];
}

// Dashboard statistics
export interface DashboardStats {
  totalSubmissions?: number;
  pendingReviews?: number;
  completedReviews?: number;
  acceptedManuscripts?: number;
  rejectedManuscripts?: number;
  inReview?: number;
}

// Notification types
export type NotificationType =
  | 'submission_received'
  | 'review_invitation'
  | 'review_completed'
  | 'decision_made'
  | 'revision_requested'
  | 'manuscript_accepted'
  | 'manuscript_rejected';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  link?: string;
}

// File upload types
export interface UploadedFile {
  filename: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
}

// Search and filter types
export interface SearchFilters {
  status?: ManuscriptStatus[];
  keywords?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  author?: string;
  category?: string;
}

// Table column types for data tables
export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

// Session user type (extends NextAuth User)
export interface SessionUser {
  id: string;
  email: string;
  name: string;
  image?: string;
  role: UserRole;
}

// Action types for forms
export type ActionState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};
