# BlogTube - AI-Powered Blog Generator

## Project Overview
BlogTube is a full-stack application that transforms YouTube videos and text prompts into SEO-optimized blog posts using AI. The system features a ChatGPT-like interface, markdown editor, and comprehensive blog management.

## Tech Stack

### Frontend (Next.js App)
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: ShadCN UI
- **Authentication**: Clerk
- **Editor**: React Markdown Editor (@uiw/react-md-editor)
- **State Management**: React hooks
- **API Communication**: Fetch API with Clerk authentication

### Backend (Express API)
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Clerk Express middleware
- **AI Provider**: OpenAI API (GPT-4o-mini)
- **YouTube Integration**: youtube-transcript package
- **Build System**: TypeScript compiler with tsx for development

### Database Schema
```
Users:
- clerkId (unique identifier from Clerk)
- email, name, imageUrl
- subscription (plan, creditsUsed, creditsLimit, resetDate)

Prompts:
- userId (reference to User)
- type ('youtube' | 'text')
- prompt (user's instructions)
- youtubeUrl, transcript, metadata (for YouTube prompts)

Blogs:
- userId, promptId (references)
- title, content (markdown), summary
- tags, status ('draft' | 'published' | 'archived')
- seoMeta (metaTitle, metaDescription, keywords)
- stats (wordCount, readTime)
```

## Project Structure
```
Blog-Tube/
├── frontend/                    # Next.js application
│   ├── app/
│   │   ├── dashboard/           # Main ChatGPT-like interface
│   │   ├── blogs/               # Blog listing and management
│   │   ├── editor/[id]/         # Markdown editor for blogs
│   │   ├── sign-in/             # Clerk authentication
│   │   ├── sign-up/             # Clerk authentication
│   │   ├── layout.tsx           # Root layout with ClerkProvider
│   │   └── page.tsx             # Landing page
│   ├── components/ui/           # ShadCN components
│   ├── lib/utils.ts             # Utility functions
│   ├── middleware.ts            # Clerk authentication middleware
│   └── .env.local               # Environment variables
├── backend/                     # Express API
│   ├── src/
│   │   ├── models/              # Mongoose schemas
│   │   │   ├── User.ts
│   │   │   ├── Prompt.ts
│   │   │   └── Blog.ts
│   │   ├── routes/              # API endpoints
│   │   │   ├── auth.ts          # User sync and webhooks
│   │   │   ├── blogs.ts         # Blog CRUD operations
│   │   │   ├── prompts.ts       # Prompt creation and blog generation
│   │   │   └── youtube.ts       # YouTube transcript extraction
│   │   ├── services/            # Business logic
│   │   │   └── openai.ts        # AI blog generation
│   │   ├── middleware/          # Express middleware
│   │   │   └── auth.ts          # Clerk authentication
│   │   └── index.ts             # Server entry point
│   ├── .env                     # Environment variables
│   └── dist/                    # Compiled JavaScript
├── automation/                  # AI Agent System (NEW)
└── .github/                     # GitHub Actions workflows
```

## API Endpoints

### Authentication
- `POST /api/auth/webhook/user` - Clerk user sync webhook
- `POST /api/auth/sync` - Manual user synchronization

### YouTube Processing
- `POST /api/youtube/transcript` - Extract transcript from YouTube URL
- `POST /api/youtube/validate` - Validate YouTube URL

### Prompt & Blog Generation
- `GET /api/prompts` - Get user's prompt history
- `POST /api/prompts` - Create prompt and generate blog
- `POST /api/prompts/:id/regenerate` - Regenerate blog from existing prompt

### Blog Management
- `GET /api/blogs` - Get all user blogs (with filtering)
- `GET /api/blogs/:id` - Get specific blog
- `POST /api/blogs` - Create new blog
- `PUT /api/blogs/:id` - Update blog
- `DELETE /api/blogs/:id` - Delete blog
- `PATCH /api/blogs/:id/publish` - Publish/unpublish blog

## Environment Configuration

### Frontend (.env.local)
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Backend (.env)
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://...
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
OPENAI_API_KEY=sk-proj-...
FRONTEND_URL=http://localhost:3000
```

## Development Commands

### Frontend
```bash
cd frontend
npm run dev      # Start development server (localhost:3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Backend
```bash
cd backend
npm run dev      # Start development server with tsx (localhost:5000)
npm run build    # Compile TypeScript
npm run start    # Start production server
```

## Key Features Implementation

### 1. Blog Generation Flow
1. User inputs prompt or YouTube URL in dashboard
2. Frontend validates input and calls API
3. Backend extracts YouTube transcript (if applicable)
4. OpenAI generates structured blog content
5. Blog saved to database with auto-calculated stats
6. User can edit in markdown editor

### 2. Authentication Flow
1. Clerk handles all authentication
2. Frontend middleware protects routes
3. Backend middleware validates tokens
4. User sync via webhooks and manual sync

### 3. Blog Editor Features
- Live markdown preview
- Split view editing
- Auto-save functionality
- Tag management
- SEO metadata editing
- Publish/draft status
- Export capabilities

## Common Development Tasks

### Adding New API Endpoint
1. Create route in `backend/src/routes/`
2. Add authentication middleware if needed
3. Import and mount in `backend/src/index.ts`
4. Update frontend API calls

### Adding New Frontend Page
1. Create page in `frontend/app/`
2. Add to middleware for protection if needed
3. Update navigation/routing

### Database Schema Changes
1. Update model in `backend/src/models/`
2. Consider migration strategy
3. Update TypeScript interfaces

### Adding New UI Component
1. Use ShadCN: `npx shadcn@latest add [component]`
2. Import from `@/components/ui/`
3. Follow existing patterns for styling

## Testing Guidelines
- Frontend: Test user interactions and API calls
- Backend: Test API endpoints and business logic
- Integration: Test full user flows
- Always test authentication flows

## Deployment Notes
- Frontend: Deploy to Vercel
- Backend: Deploy to Railway/Render
- Database: MongoDB Atlas
- Environment variables must be set in deployment platforms

## Troubleshooting Common Issues

### Authentication Issues
- Check Clerk keys in both frontend and backend
- Verify webhook endpoints are configured
- Ensure token validation is working

### API Connection Issues
- Check CORS configuration
- Verify API URLs in environment variables
- Check network requests in browser dev tools

### Database Issues
- Verify MongoDB connection string
- Check network access in MongoDB Atlas
- Ensure proper authentication

## Code Style Guidelines
- Use TypeScript for all new code
- Follow existing naming conventions
- Use ShadCN components for UI
- Implement proper error handling
- Add loading states for async operations

## Performance Considerations
- Optimize images and assets
- Implement proper caching
- Use pagination for large datasets
- Monitor API response times
- Optimize database queries

---

This context should help you understand the BlogTube project structure, make informed decisions about code changes, and maintain consistency with the existing codebase.