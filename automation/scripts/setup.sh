#!/bin/bash

# BlogTube AI Automation Setup Script
# This script sets up the complete automation system

set -e

echo "🤖 Setting up BlogTube AI Automation System..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "CLAUDE.md" ]; then
    print_error "Please run this script from the BlogTube project root directory"
    exit 1
fi

print_status "Installing automation dependencies..."
cd automation
npm install
cd ..

print_status "Setting up GitHub repository secrets..."
cat << 'EOF'
🔑 Required GitHub Repository Secrets:

Please add these secrets to your GitHub repository:
(Settings → Secrets and variables → Actions → New repository secret)

1. ANTHROPIC_API_KEY
   - Your Claude API key from https://console.anthropic.com
   
2. DEFAULT_REVIEWERS (optional)
   - Comma-separated list of GitHub usernames for PR reviews
   - Example: "user1,user2,user3"

EOF

print_status "Creating automation environment file..."
if [ ! -f "automation/.env" ]; then
    cp automation/.env.example automation/.env 2>/dev/null || cat > automation/.env << 'EOF'
# Automation Environment Variables
LOG_LEVEL=info
NODE_ENV=development

# GitHub (automatically provided by GitHub Actions)
# GITHUB_TOKEN=
# REPOSITORY_NAME=
# ISSUE_NUMBER=

# Anthropic Claude API (add to GitHub secrets)
# ANTHROPIC_API_KEY=

# Optional: Default reviewers for PRs
# DEFAULT_REVIEWERS=username1,username2
EOF
    print_success "Created automation/.env file"
else
    print_warning "automation/.env already exists"
fi

print_status "Setting up git hooks..."
mkdir -p .git/hooks

# Pre-commit hook to run automation tests
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# BlogTube pre-commit hook

echo "🤖 Running automation pre-commit checks..."

# Check if automation files are modified
if git diff --cached --name-only | grep -q "automation/"; then
    echo "Automation files modified, running tests..."
    cd automation
    npm test
    if [ $? -ne 0 ]; then
        echo "❌ Automation tests failed"
        exit 1
    fi
    cd ..
    echo "✅ Automation tests passed"
fi
EOF

chmod +x .git/hooks/pre-commit
print_success "Git hooks configured"

print_status "Testing automation system..."
cd automation

# Test TypeScript compilation
npm run build 2>/dev/null || {
    npx tsc --noEmit
    if [ $? -ne 0 ]; then
        print_error "TypeScript compilation failed"
        exit 1
    fi
}

cd ..

print_status "Creating monitoring dashboard..."
mkdir -p automation/logs
touch automation/logs/orchestrator.log
touch automation/logs/agents.log
touch automation/logs/error.log

print_success "Automation system setup complete!"

cat << 'EOF'

🎉 BlogTube AI Automation is now ready!

📋 Next Steps:

1. Add your Anthropic API key to GitHub repository secrets:
   - Go to Settings → Secrets and variables → Actions
   - Add ANTHROPIC_API_KEY with your Claude API key

2. Test the system by creating a GitHub issue:
   - The system will automatically analyze and assign agents
   - Agents will implement solutions and create PRs

3. Monitor automation activity:
   - Check automation/logs/ for detailed logs
   - View GitHub Actions for workflow execution

📚 Usage Examples:

# Analyze an issue manually
cd automation && tsx orchestrator.ts

# Run a specific agent
cd automation && tsx run-agent.ts --type=frontend

# Create a PR manually  
cd automation && tsx create-pr.ts

🔧 Claude Code Commands:
You can now use these commands in Claude Code:
- /analyze-issue
- /run-frontend-agent
- /run-backend-agent
- /run-database-agent
- /create-pr
- /setup-automation

Happy automating! 🚀

EOF