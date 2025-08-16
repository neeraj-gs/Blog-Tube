import mongoose, { Document, Schema } from 'mongoose';

export interface IBlog extends Document {
  userId: mongoose.Types.ObjectId;
  promptId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  summary?: string;
  tags?: string[];
  status: 'draft' | 'published' | 'archived';
  seoMeta?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  stats?: {
    wordCount: number;
    readTime: number; // in minutes
  };
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema = new Schema<IBlog>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  promptId: {
    type: Schema.Types.ObjectId,
    ref: 'Prompt',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    maxlength: 500
  },
  tags: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  seoMeta: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  stats: {
    wordCount: {
      type: Number,
      default: 0
    },
    readTime: {
      type: Number,
      default: 0
    }
  },
  publishedAt: Date
}, {
  timestamps: true
});

// Indexes for efficient querying
BlogSchema.index({ userId: 1, status: 1, createdAt: -1 });
BlogSchema.index({ tags: 1 });
BlogSchema.index({ 'seoMeta.keywords': 1 });

// Calculate stats before saving
BlogSchema.pre('save', function(next) {
  if (this.content) {
    const words = this.content.split(/\s+/).length;
    this.stats = {
      wordCount: words,
      readTime: Math.ceil(words / 200) // Average reading speed: 200 words per minute
    };
  }
  
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

export default mongoose.model<IBlog>('Blog', BlogSchema);