---
description: "Initialize a new Node.js Express API project with Penomo's standard tech stack and configuration"
allowed-tools: ["Bash"]
---

# Project Initialization Command

Initialize a new Node.js Express API project with Penomo's standard tech stack and configuration.

## Usage

```bash
/org:init:project [project-name] [--type=api|frontend|fullstack]
```

## Implementation

```bash
#!/bin/bash

PROJECT_NAME="$1"
PROJECT_TYPE="${2:-api}"

# Validate input
if [[ -z "$PROJECT_NAME" ]]; then
    echo "❌ Error: Please specify a project name"
    echo "Usage: /org:init:project <project-name> [--type=api|frontend|fullstack]"
    exit 1
fi

# Validate project type
case "$PROJECT_TYPE" in
    --type=api|api)
        PROJECT_TYPE="api"
        ;;
    --type=frontend|frontend)
        PROJECT_TYPE="frontend"
        ;;
    --type=fullstack|fullstack)
        PROJECT_TYPE="fullstack"
        ;;
    *)
        PROJECT_TYPE="api"
        ;;
esac

echo "🚀 Initializing $PROJECT_TYPE project: $PROJECT_NAME"

# Create project directory
mkdir -p "$PROJECT_NAME"
cd "$PROJECT_NAME"

# Initialize git repository
git init
echo "✅ Git repository initialized"

# Create package.json for API projects
if [[ "$PROJECT_TYPE" == "api" || "$PROJECT_TYPE" == "fullstack" ]]; then
    cat > package.json << 'EOF'
{
  "name": "PROJECT_NAME_PLACEHOLDER",
  "version": "1.0.0",
  "description": "Node.js Express API with MongoDB",
  "type": "module",
  "main": "api/server.js",
  "scripts": {
    "start": "cd api && node server.js",
    "dev": "cd api && nodemon server.js",
    "test": "cd api && cross-env NODE_ENV=test jest",
    "test:watch": "cd api && cross-env NODE_ENV=test jest --watch",
    "test:coverage": "cd api && cross-env NODE_ENV=test jest --coverage",
    "lint": "cd api && eslint .",
    "lint:fix": "cd api && eslint . --fix",
    "format": "cd api && prettier --write ."
  },
  "keywords": ["nodejs", "express", "mongodb", "api"],
  "author": "Penomo Protocol",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.0",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "dotenv": "^16.3.1",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "express-validator": "^7.0.1",
    "multer": "^1.4.5-lts.1",
    "multer-s3": "^3.0.1",
    "aws-sdk": "^2.1500.0",
    "socket.io": "^4.7.4",
    "rate-limiter-flexible": "^3.0.8",
    "agenda": "^5.0.0",
    "pug": "^3.0.2",
    "nodemailer": "^6.9.7"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "jest": "^29.7.0",
    "supertest": "^6.3.3",
    "mongodb-memory-server": "^9.1.3",
    "cross-env": "^7.0.3",
    "eslint": "^8.55.0",
    "prettier": "^3.1.0"
  },
  "engines": {
    "node": ">=18.17.0"
  }
}
EOF

    # Replace placeholder with actual project name
    sed -i.bak "s/PROJECT_NAME_PLACEHOLDER/$PROJECT_NAME/g" package.json && rm package.json.bak
    echo "✅ package.json created"

    # Create API directory structure
    mkdir -p api/{controllers,services,models,routes,middleware,validator,config,utils,jobs,__tests__}
    echo "✅ API directory structure created"

    # Create basic server.js
    cat > api/server.js << 'EOF'
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/PROJECT_NAME_PLACEHOLDER');
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  connectDB().then(() => {
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  });
}

export { app, io };
EOF

    # Replace placeholder in server.js
    sed -i.bak "s/PROJECT_NAME_PLACEHOLDER/$PROJECT_NAME/g" api/server.js && rm api/server.js.bak
    echo "✅ server.js created"

    # Create .env template
    cat > .env.example << 'EOF'
# Database
MONGO_URI=mongodb://localhost:27017/PROJECT_NAME_PLACEHOLDER

# Server
PORT=5000
NODE_ENV=development

# JWT
SECRET_KEY=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Master API Keys
MASTER_API_KEY=your-master-api-key
VERIFY_ADMIN_API_KEY=your-admin-api-key

# AWS Configuration
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-s3-bucket
CLOUDFRONT_DOMAIN=your-cloudfront-domain

# Email Configuration (AWS SES)
SES_SENDER_EMAIL=noreply@yourdomain.com
SES_REGION=us-east-1

# Web3Auth
WEB3AUTH_CLIENT_ID=your-web3auth-client-id
WEB3AUTH_JWKS=your-web3auth-jwks-url

# Social Platform APIs
DISCORD_BOT_TOKEN=your-discord-bot-token
TWITTER_API_KEY=your-twitter-api-key
TELEGRAM_BOT_TOKEN=your-telegram-bot-token

# Feature Flags (GrowthBook)
GROWTHBOOK_API_HOST=https://cdn.growthbook.io
GROWTHBOOK_CLIENT_KEY=your-growthbook-key
EOF

    # Replace placeholder in .env.example
    sed -i.bak "s/PROJECT_NAME_PLACEHOLDER/$PROJECT_NAME/g" .env.example && rm .env.example.bak
    echo "✅ .env.example created"

    # Create basic response handler
    cat > api/utils/responseHandler.js << 'EOF'
export const handleResponse = (req, res, error, data, statusCode = 200) => {
  if (error) {
    console.error('API Error:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }

  return res.status(statusCode).json({
    success: true,
    data,
  });
};

export const handleResponseWithMessage = (req, res, error, message, data, statusCode = 200) => {
  if (error) {
    console.error('API Error:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }

  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

// Global response handlers
global._handleResponse = handleResponse;
global._handleResponseWithMessage = handleResponseWithMessage;
EOF
    echo "✅ Response handler created"

    # Create basic Jest configuration
    cat > api/jest.config.js << 'EOF'
export default {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
  collectCoverageFrom: [
    '**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/__tests__/**',
    '!**/server.js',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  transform: {},
  extensionsToTreatAsEsm: ['.js'],
  globals: {
    'jest': {
      useESM: true
    }
  }
};
EOF
    echo "✅ Jest configuration created"

    # Create test setup file
    cat > api/__tests__/setup.js << 'EOF'
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});
EOF
    echo "✅ Test setup created"
fi

# Create .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# ESLint cache
.eslintcache

# Prettier cache
.prettierrc.js

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# Build files
dist/
build/

# Temporary folders
tmp/
temp/

# Database files
*.sqlite
*.db

# AWS
.aws/

# Docker
docker-compose.override.yml
EOF
echo "✅ .gitignore created"

# Create README.md
cat > README.md << EOF
# $PROJECT_NAME

## Overview

A Node.js Express API built with the Penomo Protocol standard tech stack.

## Tech Stack

- **Runtime**: Node.js ≥18.17.0 with ES modules
- **Framework**: Express.js with Socket.IO for real-time features
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + Web3Auth integration
- **Testing**: Jest with MongoDB Memory Server and Supertest
- **File Storage**: AWS S3 with CloudFront CDN
- **Email**: AWS SES with Pug templates

## Quick Start

1. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

2. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your configuration
   \`\`\`

3. **Start development server**
   \`\`\`bash
   npm run dev
   \`\`\`

## Development Commands

\`\`\`bash
# Development server with auto-reload
npm run dev

# Testing
npm test                    # Run all tests
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Run tests with coverage

# Code quality
npm run lint               # Run ESLint
npm run lint:fix          # Auto-fix ESLint issues
npm run format            # Format with Prettier
\`\`\`

## Project Structure

\`\`\`
$PROJECT_NAME/
├── api/
│   ├── controllers/       # HTTP request handlers
│   ├── services/         # Business logic layer
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API endpoint definitions
│   ├── middleware/       # Express middleware
│   ├── validator/        # Input validation schemas
│   ├── config/           # Configuration files
│   ├── utils/            # Utility functions
│   ├── jobs/             # Background jobs
│   ├── __tests__/        # Test files
│   └── server.js         # Application entry point
├── .env.example          # Environment variables template
├── .gitignore           # Git ignore rules
└── package.json         # Project dependencies
\`\`\`

## API Endpoints

- \`GET /health\` - Health check endpoint

## Environment Variables

See \`.env.example\` for all required environment variables.

## Testing

Tests use Jest with MongoDB Memory Server for isolated testing:

\`\`\`bash
npm test
\`\`\`

## Deployment

1. Set production environment variables
2. Build and deploy using your preferred platform
3. Ensure MongoDB connection is configured

## Contributing

1. Follow the established project structure
2. Write tests for new features
3. Run linting and formatting before commits
4. Use conventional commit messages

## License

MIT
EOF
echo "✅ README.md created"

# Create basic ESLint configuration
cat > .eslintrc.json << 'EOF'
{
  "env": {
    "es2022": true,
    "node": true,
    "jest": true
  },
  "extends": ["eslint:recommended"],
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "rules": {
    "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "no-console": "off",
    "prefer-const": "error",
    "no-var": "error"
  }
}
EOF
echo "✅ ESLint configuration created"

# Create Prettier configuration
cat > .prettierrc << 'EOF'
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
EOF
echo "✅ Prettier configuration created"

# Set up Claude shared commands if not exists
if [[ ! -d ".claude-shared" ]]; then
    echo "📦 Setting up Claude shared commands..."
    git subtree add --prefix=.claude-shared https://github.com/penomoprotocol/claude-shared.git main --squash
    echo "✅ Claude shared commands added"
fi

# Create .claude directory if it doesn't exist
mkdir -p .claude/commands
echo "✅ Claude directory created"

# Initial git commit
git add .
git commit -m "feat: initialize $PROJECT_TYPE project with Penomo tech stack

- Node.js Express API with MongoDB
- JWT authentication and Socket.IO support
- AWS S3/SES integration setup
- Jest testing environment with MongoDB Memory Server
- ESLint and Prettier configuration
- Claude shared commands integration

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

echo ""
echo "🎉 Project initialization complete!"
echo ""
echo "📁 Project: $PROJECT_NAME ($PROJECT_TYPE)"
echo "📍 Location: $(pwd)"
echo ""
echo "🚀 Next steps:"
echo "   1. cd $PROJECT_NAME"
echo "   2. cp .env.example .env"
echo "   3. Edit .env with your configuration"
echo "   4. npm install"
echo "   5. npm run dev"
echo ""
echo "📚 Available commands:"
echo "   - npm run dev       # Start development server"
echo "   - npm test          # Run tests"
echo "   - npm run lint      # Check code quality"
echo "   - /org:*            # Organization shared commands"
echo ""
echo "✨ Happy coding!"
```

## Features

- **Complete Tech Stack**: Express.js, MongoDB, Socket.IO, AWS integrations
- **Testing Ready**: Jest with MongoDB Memory Server and coverage reporting
- **Code Quality**: ESLint and Prettier pre-configured
- **Environment Setup**: Comprehensive .env template with all required variables
- **Claude Integration**: Shared commands automatically included
- **Git Ready**: Initialized repository with proper .gitignore
- **Documentation**: Complete README with setup instructions

## Project Types

- `api` (default): Full Node.js Express API setup
- `frontend`: React/Next.js frontend setup (coming soon)
- `fullstack`: Combined API + frontend setup (coming soon)

## Examples

```bash
# Initialize new API project
/org:init:project my-investment-api

# Initialize with specific type
/org:init:project my-project --type=api

# Initialize frontend project
/org:init:project my-dashboard --type=frontend
```

## Generated Structure

```
my-project/
├── api/
│   ├── controllers/
│   ├── services/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── validator/
│   ├── config/
│   ├── utils/
│   ├── jobs/
│   ├── __tests__/
│   └── server.js
├── .claude-shared/     # Organization commands
├── .claude/           # Project-specific commands
├── .env.example       # Environment template
├── package.json       # Dependencies and scripts
├── README.md          # Project documentation
└── .gitignore         # Git ignore rules
```

## Notes

- Automatically includes Claude shared commands via git subtree
- Creates initial git commit with conventional commit format
- Sets up complete development environment in one command
- Includes all Penomo Protocol standard configurations
- Ready for immediate development after `npm install`