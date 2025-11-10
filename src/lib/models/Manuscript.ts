import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type ManuscriptStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'revision_required'
  | 'accepted'
  | 'rejected'
  | 'published';

export interface IAuthor {
  name: string;
  email: string;
  affiliation?: string;
  corresponding: boolean;
}

export interface IFile {
  filename: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
}

export interface IVersion {
  version: number;
  date: Date;
  files: {
    manuscript?: IFile;
    supplementary: IFile[];
  };
  changelog?: string;
}

export interface ITimelineEvent {
  event: string;
  actor: Types.ObjectId;
  date: Date;
  metadata?: Record<string, any>;
}

export interface IManuscript extends Document {
  _id: string;
  title: string;
  abstract: string;
  keywords: string[];
  authors: IAuthor[];
  submittedBy: Types.ObjectId;
  status: ManuscriptStatus;
  manuscriptType: 'research' | 'review' | 'case-study' | 'short-communication';
  category?: string;
  files: {
    manuscript?: IFile;
    supplementary: IFile[];
    coverLetter?: IFile;
  };
  versions: IVersion[];
  currentVersion: number;
  assignedEditor?: Types.ObjectId;
  reviewers: {
    user: Types.ObjectId;
    status: 'invited' | 'accepted' | 'declined' | 'completed';
    invitedAt: Date;
    respondedAt?: Date;
    completedAt?: Date;
  }[];
  suggestedReviewers: {
    name: string;
    email: string;
    affiliation?: string;
    expertise?: string;
  }[];
  reviews: Types.ObjectId[];
  editorialDecisions: {
    editor: Types.ObjectId;
    decision: 'accept' | 'reject' | 'revision' | 'desk-reject';
    comments: string;
    confidentialComments?: string;
    date: Date;
  }[];
  timeline: ITimelineEvent[];
  metrics: {
    views: number;
    downloads: number;
  };
  doi?: string;
  publishedDate?: Date;
  issue?: string;
  volume?: string;
  pages?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ManuscriptSchema = new Schema<IManuscript>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [500, 'Title cannot exceed 500 characters'],
    },
    abstract: {
      type: String,
      required: [true, 'Abstract is required'],
      maxlength: [3000, 'Abstract cannot exceed 3000 characters'],
    },
    keywords: {
      type: [String],
      required: [true, 'At least one keyword is required'],
      validate: {
        validator: function (v: string[]) {
          return v.length >= 1 && v.length <= 10;
        },
        message: 'Keywords must be between 1 and 10',
      },
    },
    authors: [
      {
        name: {
          type: String,
          required: true,
        },
        email: {
          type: String,
          required: true,
        },
        affiliation: String,
        corresponding: {
          type: Boolean,
          default: false,
        },
      },
    ],
    submittedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: [
        'draft',
        'submitted',
        'under_review',
        'revision_required',
        'accepted',
        'rejected',
        'published',
      ],
      default: 'draft',
    },
    manuscriptType: {
      type: String,
      enum: ['research', 'review', 'case-study', 'short-communication'],
      required: true,
    },
    category: String,
    files: {
      manuscript: {
        filename: String,
        url: String,
        size: Number,
        mimeType: String,
        uploadedAt: Date,
      },
      supplementary: [
        {
          filename: String,
          url: String,
          size: Number,
          mimeType: String,
          uploadedAt: Date,
        },
      ],
      coverLetter: {
        filename: String,
        url: String,
        size: Number,
        mimeType: String,
        uploadedAt: Date,
      },
    },
    versions: [
      {
        version: Number,
        date: Date,
        files: {
          manuscript: {
            filename: String,
            url: String,
            size: Number,
            mimeType: String,
            uploadedAt: Date,
          },
          supplementary: [
            {
              filename: String,
              url: String,
              size: Number,
              mimeType: String,
              uploadedAt: Date,
            },
          ],
        },
        changelog: String,
      },
    ],
    currentVersion: {
      type: Number,
      default: 1,
    },
    assignedEditor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewers: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        status: {
          type: String,
          enum: ['invited', 'accepted', 'declined', 'completed'],
          default: 'invited',
        },
        invitedAt: {
          type: Date,
          default: Date.now,
        },
        respondedAt: Date,
        completedAt: Date,
      },
    ],
    suggestedReviewers: [
      {
        name: String,
        email: String,
        affiliation: String,
        expertise: String,
      },
    ],
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Review',
      },
    ],
    editorialDecisions: [
      {
        editor: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        decision: {
          type: String,
          enum: ['accept', 'reject', 'revision', 'desk-reject'],
          required: true,
        },
        comments: {
          type: String,
          required: true,
        },
        confidentialComments: String,
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    timeline: [
      {
        event: {
          type: String,
          required: true,
        },
        actor: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        date: {
          type: Date,
          default: Date.now,
        },
        metadata: Schema.Types.Mixed,
      },
    ],
    metrics: {
      views: {
        type: Number,
        default: 0,
      },
      downloads: {
        type: Number,
        default: 0,
      },
    },
    doi: String,
    publishedDate: Date,
    issue: String,
    volume: String,
    pages: String,
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
ManuscriptSchema.index({ submittedBy: 1, status: 1 });
ManuscriptSchema.index({ status: 1, createdAt: -1 });
ManuscriptSchema.index({ assignedEditor: 1 });
ManuscriptSchema.index({ 'reviewers.user': 1 });
ManuscriptSchema.index({ keywords: 1 });
ManuscriptSchema.index({ title: 'text', abstract: 'text' });

// Virtual for manuscript ID
ManuscriptSchema.virtual('manuscriptId').get(function () {
  return `MS-${this._id.toString().substring(0, 8).toUpperCase()}`;
});

// Method to add timeline event
ManuscriptSchema.methods.addTimelineEvent = function (
  event: string,
  actor: Types.ObjectId,
  metadata?: Record<string, any>
) {
  this.timeline.push({
    event,
    actor,
    date: new Date(),
    metadata,
  });
};

// Prevent model recompilation
const Manuscript: Model<IManuscript> =
  mongoose.models.Manuscript ||
  mongoose.model<IManuscript>('Manuscript', ManuscriptSchema);

export default Manuscript;
