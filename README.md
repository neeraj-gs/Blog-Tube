# BlogTube - AI-Powered Blog Generator

Transform YouTube videos and prompts into SEO-optimized blog posts using advanced AI.

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- ShadCN UI
- Clerk Authentication
- React Markdown Editor

### Backend
- Express.js
- TypeScript
- MongoDB with Mongoose
- OpenAI API
- YouTube Transcript API
- Clerk SDK

## Features

- 🎥 YouTube to Blog conversion
- ✨ AI-powered content generation
- 📝 Markdown editor with live preview
- 🔍 SEO optimization
- 👤 User authentication with Clerk
- 📊 Usage tracking and credits system
- 📱 Responsive design
- 🎨 Modern UI with dark mode support

## Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Clerk account
- OpenAI API key

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd Blog-Tube
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in backend directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/blogtube

# Clerk Authentication
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

# OpenAI API
OPENAI_API_KEY=your_openai_api_key

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

Start the backend server:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create `.env.local` file in frontend directory:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

### 4. Clerk Configuration

1. Create a Clerk account at https://clerk.com
2. Create a new application
3. Copy the API keys to your `.env` files
4. Configure webhook endpoint: `http://localhost:5000/api/auth/webhook/user`
5. Set allowed redirect URLs in Clerk dashboard

### 5. MongoDB Setup

For local MongoDB:
```bash
mongod
```

For MongoDB Atlas:
1. Create a cluster at https://cloud.mongodb.com
2. Get your connection string
3. Update `MONGODB_URI` in backend `.env`

### 6. OpenAI Configuration

1. Get API key from https://platform.openai.com
2. Add to backend `.env` file

## Project Structure

```
Blog-Tube/
├── frontend/
│   ├── app/
│   │   ├── dashboard/     # Main chat interface
│   │   ├── blogs/         # Blog management
│   │   ├── editor/        # Blog editor
│   │   ├── sign-in/       # Authentication
│   │   └── sign-up/       # Authentication
│   ├── components/
│   │   └── ui/           # ShadCN components
│   └── lib/              # Utilities
│
└── backend/
    ├── src/
    │   ├── models/       # MongoDB schemas
    │   ├── routes/       # API routes
    │   ├── services/     # Business logic
    │   ├── middleware/   # Auth & validation
    │   └── index.ts      # Server entry
    └── dist/            # Compiled JS
```

## API Endpoints

### Authentication
- `POST /api/auth/webhook/user` - Clerk webhook
- `POST /api/auth/sync` - Sync user data

### YouTube
- `POST /api/youtube/transcript` - Get video transcript
- `POST /api/youtube/validate` - Validate YouTube URL

### Prompts
- `GET /api/prompts` - Get user prompts
- `POST /api/prompts` - Create new prompt and generate blog
- `POST /api/prompts/:id/regenerate` - Regenerate blog

### Blogs
- `GET /api/blogs` - Get all blogs
- `GET /api/blogs/:id` - Get single blog
- `POST /api/blogs` - Create blog
- `PUT /api/blogs/:id` - Update blog
- `DELETE /api/blogs/:id` - Delete blog
- `PATCH /api/blogs/:id/publish` - Publish/unpublish

## Usage

1. Sign up or sign in using Clerk authentication
2. Navigate to the dashboard
3. Choose input method:
   - **Text Prompt**: Enter any topic or description
   - **YouTube URL**: Paste a YouTube video URL
4. Click "Generate Blog" to create content
5. Edit the generated blog in the markdown editor
6. Save, publish, or export your blog

## Deployment

### Frontend (Vercel)

```bash
cd frontend
vercel
```

### Backend (Railway/Render)

1. Push code to GitHub
2. Connect repository to Railway/Render
3. Set environment variables
4. Deploy

## Future Enhancements

The project is designed to support GitHub Actions automation:

1. Create GitHub workflow files
2. Set up issue templates
3. Configure AI agents to:
   - Monitor new issues
   - Automatically create PRs
   - Run tests and deploy

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

MIT

## Support

For issues and questions, please open a GitHub issue.

---

Built with ❤️ using Next.js, Express, and AI