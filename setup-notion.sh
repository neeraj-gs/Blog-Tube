#!/bin/bash

# Claudia Notion Integration Setup Script
# This script helps configure Notion integration for the Claudia automation system

echo "🔧 Claudia Notion Integration Setup"
echo "=================================="
echo

# Check if local.env exists
if [ ! -f ".claude-shared/local.env" ]; then
    echo "❌ local.env file not found"
    echo "Please run this script from the project root directory"
    exit 1
fi

echo "✅ Found local.env file"
echo

# Check if @notionhq/client is installed
echo "📦 Checking Notion client dependency..."
if ! npm list @notionhq/client > /dev/null 2>&1; then
    echo "⚠️  @notionhq/client not found. Installing..."
    npm install @notionhq/client --save-dev
    if [ $? -eq 0 ]; then
        echo "✅ Successfully installed @notionhq/client"
    else
        echo "❌ Failed to install @notionhq/client"
        echo "You may need to run: sudo npm install @notionhq/client --save-dev"
    fi
else
    echo "✅ @notionhq/client is already installed"
fi
echo

# Provide setup instructions
echo "🔑 Notion Integration Setup Instructions:"
echo "1. Go to https://www.notion.so/my-integrations"
echo "2. Create a new integration or use existing one"
echo "3. Copy the 'Internal Integration Token'"
echo "4. Edit .claude-shared/local.env and replace:"
echo "   NOTION_TOKEN=your-notion-integration-token-here"
echo
echo "5. Create Notion databases for:"
echo "   - Tickets database (for tracking all tickets)"
echo "   - Requirements database (for requirements management)"
echo "   - Commits database (for commit tracking)"
echo
echo "6. Share each database with your integration"
echo "7. Copy database IDs from URLs and update local.env"
echo
echo "8. Test the setup:"
echo "   node .claude-shared/systems/claudia/scripts/notion-client.cjs status-report"
echo
echo "📝 Configuration file: .claude-shared/local.env"
echo "🔗 Setup guide: https://developers.notion.com/docs/getting-started"
echo

# Test current configuration
echo "🧪 Testing current configuration..."
if [ -f ".claude-shared/local.env" ]; then
    source .claude-shared/local.env
    if [ "$NOTION_TOKEN" == "your-notion-integration-token-here" ]; then
        echo "⚠️  NOTION_TOKEN still has placeholder value"
        echo "Please edit .claude-shared/local.env with your actual token"
    else
        echo "✅ NOTION_TOKEN is configured"
        # Test the Notion client
        echo "Testing Notion client..."
        node .claude-shared/systems/claudia/scripts/notion-client.cjs status-report 2>/dev/null
        if [ $? -eq 0 ]; then
            echo "✅ Notion integration test successful!"
        else
            echo "⚠️  Notion integration test failed - check your configuration"
        fi
    fi
fi

echo
echo "🎉 Setup complete! Remember to:"
echo "   - Keep .claude-shared/local.env secure and never commit it"
echo "   - Always assign tickets to both GitHub AND Notion"
echo "   - Use the Claudia automation system for all ticket management"