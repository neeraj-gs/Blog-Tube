import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { clerkMiddleware } from './middleware/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
import authRoutes from './routes/auth';
import blogRoutes from './routes/blog';
import promptRoutes from './routes/prompt';
import youtubeRoutes from './routes/youtube';

app.use('/api/auth', authRoutes);
app.use('/api/blogs', clerkMiddleware, blogRoutes);
app.use('/api/prompts', clerkMiddleware, promptRoutes);
app.use('/api/youtube', clerkMiddleware, youtubeRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'BlogTube API is running' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blogtube')
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });