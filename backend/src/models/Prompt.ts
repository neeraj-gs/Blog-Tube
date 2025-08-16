import mongoose, { Document, Schema } from 'mongoose';

export interface IPrompt extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'youtube' | 'text';
  prompt: string;
  youtubeUrl?: string;
  transcript?: string;
  metadata?: {
    videoTitle?: string;
    videoAuthor?: string;
    videoDuration?: number;
    videoDescription?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const PromptSchema = new Schema<IPrompt>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['youtube', 'text'],
    required: true
  },
  prompt: {
    type: String,
    required: true
  },
  youtubeUrl: {
    type: String
  },
  transcript: {
    type: String
  },
  metadata: {
    videoTitle: String,
    videoAuthor: String,
    videoDuration: Number,
    videoDescription: String
  }
}, {
  timestamps: true
});

// Index for efficient querying
PromptSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<IPrompt>('Prompt', PromptSchema);