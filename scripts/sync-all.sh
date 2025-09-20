#!/bin/bash

# Streamlined sync script for enhanced Claudia system
# Syncs shared commands and systems from .claude-shared to .claude/

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_SHARED_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_ROOT="$(dirname "$CLAUDE_SHARED_DIR")"

echo "🔄 Syncing streamlined Claude configurations..."

# Sync Claudia commands
SHARED_CLAUDIA_COMMANDS_SOURCE="$CLAUDE_SHARED_DIR/commands/claudia"
LOCAL_CLAUDIA_COMMANDS_TARGET="$PROJECT_ROOT/.claude/commands/claudia"

if [ -d "$SHARED_CLAUDIA_COMMANDS_SOURCE" ]; then
    mkdir -p "$(dirname "$LOCAL_CLAUDIA_COMMANDS_TARGET")"
    echo "   🤖 Claudia commands: $SHARED_CLAUDIA_COMMANDS_SOURCE → $LOCAL_CLAUDIA_COMMANDS_TARGET"
    rm -rf "$LOCAL_CLAUDIA_COMMANDS_TARGET"
    cp -r "$SHARED_CLAUDIA_COMMANDS_SOURCE" "$LOCAL_CLAUDIA_COMMANDS_TARGET"
    echo "   ✅ Claudia commands synced"
else
    echo "   ❌ Claudia commands source not found: $SHARED_CLAUDIA_COMMANDS_SOURCE"
    exit 1
fi

# Sync Claudia systems
SHARED_CLAUDIA_SYSTEMS_SOURCE="$CLAUDE_SHARED_DIR/systems/claudia"
LOCAL_CLAUDIA_SYSTEMS_TARGET="$PROJECT_ROOT/.claude/systems/claudia"

if [ -d "$SHARED_CLAUDIA_SYSTEMS_SOURCE" ]; then
    mkdir -p "$(dirname "$LOCAL_CLAUDIA_SYSTEMS_TARGET")"
    echo "   🔧 Claudia systems: $SHARED_CLAUDIA_SYSTEMS_SOURCE → $LOCAL_CLAUDIA_SYSTEMS_TARGET"
    rm -rf "$LOCAL_CLAUDIA_SYSTEMS_TARGET"
    cp -r "$SHARED_CLAUDIA_SYSTEMS_SOURCE" "$LOCAL_CLAUDIA_SYSTEMS_TARGET"
    echo "   ✅ Claudia systems synced"
else
    echo "   ❌ Claudia systems source not found: $SHARED_CLAUDIA_SYSTEMS_SOURCE"
    exit 1
fi

echo ""
echo "🚀 Streamlined configuration sync complete!"

# List available commands
echo ""
echo "📋 Available Claudia commands:"

if [ -d "$LOCAL_CLAUDIA_COMMANDS_TARGET" ]; then
    find "$LOCAL_CLAUDIA_COMMANDS_TARGET" -name "*.md" -type f | \
        sed "s|$LOCAL_CLAUDIA_COMMANDS_TARGET/||" | \
        sed 's|/|:|g' | \
        sed 's|\.md$||' | \
        sed 's|^|      /claudia:|' | \
        sort
fi

echo ""
echo "💡 Archived org commands available in: $CLAUDE_SHARED_DIR/archive/org/"