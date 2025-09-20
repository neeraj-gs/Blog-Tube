# BlogTube - AI-Powered Blog Generator

## Project Overview
BlogTube is a full-stack application that transforms YouTube videos and text prompts into SEO-optimized blog posts using AI. The system features a ChatGPT-like interface, markdown editor, and comprehensive blog management.

## 🚨 CRITICAL: Git Operations Policy

**NEVER commit or push code without explicit user consent.**

- ❌ **FORBIDDEN**: Automatically running `git commit` or `git push` commands
- ❌ **FORBIDDEN**: Committing changes during problem-solving or refactoring
- ✅ **REQUIRED**: Always ask for explicit permission before any git operations
- ✅ **REQUIRED**: Wait for user confirmation: "commit and push" or "please commit these changes"

**This applies to ALL git operations including:**
- `git add` (only with permission)
- `git commit` (NEVER without explicit consent)
- `git push` (NEVER without explicit consent)
- Any automated git workflows

**Remember**: The user maintains full control over when and how their code is committed to version control.

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

## Claudia Automation System - MANDATORY USAGE

**ALL ENGINEERS MUST USE CLAUDIA** for feature development, bug fixes, and project management. This is a company-wide requirement to ensure:
- Complete traceability from requirements to deployment
- Consistent development methodology (TDD)
- Automated project management integration
- Quality assurance and audit compliance

### Sprint UUID Hierarchical System (Critical)

**All Claudia UUIDs follow strict hierarchical inheritance:**

**Format:**
- **Sprints:** `XXX` (e.g., `030`, `031`, `032`)
- **Requirements:** `XXX-YY` (e.g., `030-01`, `030-02`)
- **Tickets:** `XXX-YY-ZZ` (e.g., `030-01-01`, `030-01-02`)

**Inheritance Rules:**
- **Always use numbered sprint IDs** (030, 031, 032, etc.)
- **Hierarchy:** Sprint → Requirement → Ticket
- **Implementation timing irrelevant** - children keep parent's sprint prefix

**Example Chain:**
```
Sprint 030 → Requirement 030-01 → Ticket 030-01-01
```

### Core Claudia Workflow (Required)

```bash
# 1. ALWAYS start with sprint creation
/claudia:sprint:create "030"
# → Creates: Sprint 030

# 2. Define requirements for sprint
/claudia:requirements:define "Authentication System" --sprint 030
# → Generates: 030-01-auth-system

# 3. Break requirements into actionable tickets
/claudia:tickets:create "030-01" --env dev
# → Generates: 030-01-01-implementation

# 4. Assign to GitHub Issues + Notion
/claudia:tickets:assign "030-01-01"

# 5. Implement using TDD methodology
/claudia:implement:manual "030-01-01"  # Collaborative mode (recommended)
/claudia:implement:auto "030-01-01"    # Fully automated mode

# 6. Commit with full traceability
/claudia:commit "030-01-01" "feat: implement user authentication system"

# 7. Create pull request
/claudia:pr:create "030-01-01"

# 8. Mark ticket complete (closes GitHub issue)
/claudia:tickets:complete "030-01-01"
```

### GitHub Integration Commands

```bash
# Pull all GitHub issues for current repository
/claudia:tickets:list --source github

# Create GitHub issue from ticket
/claudia:tickets:assign "030-01-01" --create-issue

# Update GitHub issue status
/claudia:tickets:update "030-01-01" --status "in-progress"

# Close GitHub issue when ticket complete
/claudia:tickets:complete "030-01-01" --close-issue
```

### Monitoring & Compliance
- **System monitoring** tracks all Claudia usage across teams
- **Compliance reports** generated weekly for management review
- **Quality metrics** measured: test coverage, TDD compliance, traceability
- **Non-compliance** will be flagged in performance reviews

### Quick Status Checks
- `/claudia:utils:status` - View your current work and system health
- `/claudia:utils:report` - Generate comprehensive traceability report

## Claudia System Synchronization (Required)

**BEFORE starting work**, engineers must sync the latest Claudia system:

```bash
# 1. Pull latest from claude-shared repository
git subtree pull --prefix=.claude-shared \
  https://github.com/penomoprotocol/claude-shared.git main --squash

# 2. Sync all shared commands to local .claude/ directory
./.claude-shared/scripts/sync-all.sh
```

### Multi-Branch Sync Process

To keep all branches (main, staging, dev) synchronized:

```bash
# Sync across all branches
for branch in main staging dev; do
  git checkout $branch
  git subtree pull --prefix=.claude-shared \
    https://github.com/penomoprotocol/claude-shared.git main --squash
  ./.claude-shared/scripts/sync-all.sh
  git add .claude/
  git commit -m "sync: update Claudia system from claude-shared"
done
```

### Pushing Claudia Updates

When modifying the Claudia system:

```bash
# 1. Sync and commit local changes
git add .claude-shared/
git commit -m "feat(claudia): update automation system"

# 2. Push back to claude-shared repository
git subtree push --prefix=.claude-shared \
  https://github.com/penomoprotocol/claude-shared.git main
```

---

This context should help you understand the BlogTube project structure, make informed decisions about code changes, and maintain consistency with the existing codebase.