#!/bin/bash

# Consolidated system setup script
# Combines setup-claude-shared.sh functionality with streamlined approach

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_SHARED_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_ROOT="$(dirname "$CLAUDE_SHARED_DIR")"

echo "🚀 Setting up streamlined Claude system..."

# Create necessary directories
mkdir -p "$PROJECT_ROOT/.claude/commands"
mkdir -p "$PROJECT_ROOT/.claude/systems"

# Run sync to populate commands and systems
echo "📦 Syncing shared configurations..."
"$SCRIPT_DIR/sync-all.sh"

# Initialize project management structure if needed
if [ ! -d "$CLAUDE_SHARED_DIR/project-management/data" ]; then
    echo "📋 Initializing project management structure..."
    mkdir -p "$CLAUDE_SHARED_DIR/project-management/data"
    
    # Create initial audit log files
    touch "$CLAUDE_SHARED_DIR/project-management/data/sprints-log.jsonl"
    touch "$CLAUDE_SHARED_DIR/project-management/data/requirements-log.jsonl"
    touch "$CLAUDE_SHARED_DIR/project-management/data/tickets-log.jsonl"
    touch "$CLAUDE_SHARED_DIR/project-management/data/commits-log.jsonl"
    touch "$CLAUDE_SHARED_DIR/project-management/data/github-sync.jsonl"
    
    echo "   ✅ Audit log files initialized"
fi

echo ""
echo "✨ Claude system setup complete!"
echo ""
echo "📚 Next steps:"
echo "   • Review documentation: $CLAUDE_SHARED_DIR/project-management/CLAUDE.md"
echo "   • Set up Notion integration: $CLAUDE_SHARED_DIR/setup-notion.sh"
echo "   • Create your first sprint: /claudia:sprint:create"
echo ""
echo "🔧 System files located in:"
echo "   • Commands: $PROJECT_ROOT/.claude/commands/claudia/"
echo "   • Systems: $PROJECT_ROOT/.claude/systems/claudia/"
echo "   • Project Management: $CLAUDE_SHARED_DIR/project-management/"