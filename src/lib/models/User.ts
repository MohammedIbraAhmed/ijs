import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  email: string;
  password?: string;
  name: string;
  image?: string;
  role: 'author' | 'reviewer' | 'editor' | 'admin';
  profile: {
    affiliation?: string;
    orcid?: string;
    bio?: string;
    expertise: string[];
    website?: string;
  };
  preferences: {
    theme: 'light' | 'dark';
    notifications: {
      email: boolean;
      inApp: boolean;
    };
    language: string;
  };
  stats: {
    submissions: number;
    reviews: number;
    citations: number;
  };
  emailVerified?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      select: false, // Don't return password by default
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    image: {
      type: String,
    },
    role: {
      type: String,
      enum: ['author', 'reviewer', 'editor', 'admin'],
      default: 'author',
    },
    profile: {
      affiliation: String,
      orcid: String,
      bio: String,
      expertise: [String],
      website: String,
    },
    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light',
      },
      notifications: {
        email: {
          type: Boolean,
          default: true,
        },
        inApp: {
          type: Boolean,
          default: true,
        },
      },
      language: {
        type: String,
        default: 'en',
      },
    },
    stats: {
      submissions: {
        type: Number,
        default: 0,
      },
      reviews: {
        type: Number,
        default: 0,
      },
      citations: {
        type: Number,
        default: 0,
      },
    },
    emailVerified: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ 'profile.expertise': 1 });

// Virtual for full name
UserSchema.virtual('fullName').get(function () {
  return this.name;
});

// Method to check if user has role
UserSchema.methods.hasRole = function (role: string): boolean {
  return this.role === role;
};

// Prevent model recompilation in development
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
