import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  clerkId: string;
  email: string;
  name: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  subscription?: {
    plan: 'free' | 'pro' | 'enterprise';
    creditsUsed: number;
    creditsLimit: number;
    resetDate: Date;
  };
}

const UserSchema = new Schema<IUser>({
  clerkId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  name: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free'
    },
    creditsUsed: {
      type: Number,
      default: 0
    },
    creditsLimit: {
      type: Number,
      default: 10
    },
    resetDate: {
      type: Date,
      default: () => new Date(new Date().setMonth(new Date().getMonth() + 1))
    }
  }
}, {
  timestamps: true
});

export default mongoose.model<IUser>('User', UserSchema);