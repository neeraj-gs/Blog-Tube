#!/bin/bash

# BlogTube Automation Setup Script

echo "🚀 Setting up BlogTube AI Automation System..."

# Check if we're in the right directory
if [ ! -d "automation" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Install automation dependencies
echo "📦 Installing automation dependencies..."
cd automation
npm install
cd ..

# Set up GitHub CLI if not already done
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI not found. Please install it:"
    echo "   brew install gh"
    echo "   Then run: gh auth login"
    exit 1
fi

# Check GitHub authentication
if ! gh auth status &> /dev/null; then
    echo "⚠️  GitHub CLI not authenticated. Please run:"
    echo "   gh auth login"
    echo "   Or set GITHUB_TOKEN environment variable"
fi

# Create logs directories
echo "📁 Creating log directories..."
mkdir -p automation/logs/communication
mkdir -p automation/logs/state
mkdir -p automation/logs/test-results

# Make scripts executable
echo "🔧 Making scripts executable..."
chmod +x automation/claude-commands.js
chmod +x automation/claude-code-integration.js
chmod +x automation/monitoring.js
chmod +x automation/coordination.js

# Run validation
echo "🧪 Running system validation..."
cd automation
node claude-commands.js validate

echo ""
echo "✅ Setup complete! Next steps:"
echo "1. Add ANTHROPIC_API_KEY to GitHub repository secrets"
echo "2. Set GITHUB_TOKEN environment variable for local testing"
echo "3. Create a test issue to verify automation works"
echo ""
echo "Test commands:"
echo "  cd automation"
echo "  node claude-commands.js validate"
echo "  node claude-commands.js agents"
echo ""