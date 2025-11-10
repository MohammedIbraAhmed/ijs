import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IRating {
  category: string;
  score: number; // 1-5 scale
  comment?: string;
}

export interface IReviewContent {
  overallRecommendation:
    | 'accept'
    | 'minor-revision'
    | 'major-revision'
    | 'reject';
  ratings: IRating[];
  strengths: string;
  weaknesses: string;
  detailedComments: string;
  confidentialComments?: string;
  questionsForAuthors?: string;
}

export interface IRevision {
  date: Date;
  content: IReviewContent;
  roundNumber: number;
}

export interface IReview extends Document {
  _id: string;
  manuscript: Types.ObjectId;
  reviewer: Types.ObjectId;
  invitation: {
    sentAt: Date;
    deadline: Date;
    status: 'pending' | 'accepted' | 'declined';
    respondedAt?: Date;
    declineReason?: string;
  };
  reviewType: 'single-blind' | 'double-blind' | 'open';
  content?: IReviewContent;
  revisions: IRevision[];
  currentRound: number;
  status: 'invited' | 'in-progress' | 'submitted' | 'completed';
  submittedAt?: Date;
  completedAt?: Date;
  timeSpent?: number; // in minutes
  isLate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    manuscript: {
      type: Schema.Types.ObjectId,
      ref: 'Manuscript',
      required: true,
    },
    reviewer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    invitation: {
      sentAt: {
        type: Date,
        default: Date.now,
      },
      deadline: {
        type: Date,
        required: true,
      },
      status: {
        type: String,
        enum: ['pending', 'accepted', 'declined'],
        default: 'pending',
      },
      respondedAt: Date,
      declineReason: String,
    },
    reviewType: {
      type: String,
      enum: ['single-blind', 'double-blind', 'open'],
      default: 'double-blind',
    },
    content: {
      overallRecommendation: {
        type: String,
        enum: ['accept', 'minor-revision', 'major-revision', 'reject'],
      },
      ratings: [
        {
          category: {
            type: String,
            required: true,
          },
          score: {
            type: Number,
            min: 1,
            max: 5,
            required: true,
          },
          comment: String,
        },
      ],
      strengths: String,
      weaknesses: String,
      detailedComments: String,
      confidentialComments: String,
      questionsForAuthors: String,
    },
    revisions: [
      {
        date: {
          type: Date,
          default: Date.now,
        },
        content: {
          overallRecommendation: {
            type: String,
            enum: ['accept', 'minor-revision', 'major-revision', 'reject'],
            required: true,
          },
          ratings: [
            {
              category: String,
              score: {
                type: Number,
                min: 1,
                max: 5,
              },
              comment: String,
            },
          ],
          strengths: String,
          weaknesses: String,
          detailedComments: String,
          confidentialComments: String,
          questionsForAuthors: String,
        },
        roundNumber: Number,
      },
    ],
    currentRound: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ['invited', 'in-progress', 'submitted', 'completed'],
      default: 'invited',
    },
    submittedAt: Date,
    completedAt: Date,
    timeSpent: Number,
    isLate: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ReviewSchema.index({ manuscript: 1, reviewer: 1 });
ReviewSchema.index({ reviewer: 1, status: 1 });
ReviewSchema.index({ 'invitation.deadline': 1 });

// Virtual for days until deadline
ReviewSchema.virtual('daysUntilDeadline').get(function () {
  if (!this.invitation.deadline) return null;
  const now = new Date();
  const deadline = new Date(this.invitation.deadline);
  const diff = deadline.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Method to check if review is overdue
ReviewSchema.methods.checkIfOverdue = function (): boolean {
  if (this.status === 'submitted' || this.status === 'completed') {
    return false;
  }
  const now = new Date();
  const deadline = new Date(this.invitation.deadline);
  return now > deadline;
};

// Pre-save middleware to update isLate
ReviewSchema.pre('save', function (next) {
  if (this.status !== 'submitted' && this.status !== 'completed') {
    this.isLate = this.checkIfOverdue();
  }
  next();
});

// Prevent model recompilation
const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);

export default Review;
