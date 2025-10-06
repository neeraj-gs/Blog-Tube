---
description: "Enhanced sprint-based automated TDD implementation with multi-commit workflow support"
allowed-tools: ["Read", "Write", "Edit", "Bash", "Task"]
---

# 🤖 Automated TDD Implementation

Implement an issue using Test-Driven Development methodology with automated code generation and complete traceability.

## Processing Issue: $ARGUMENTS

!bash -c 'echo "🚀 Starting automated TDD implementation for: $ARGUMENTS"'

## Validate Issue and Load Context

!bash -c '
ISSUE_ID="$ARGUMENTS"

# Clean up issue ID (remove quotes)
ISSUE_ID=$(echo "$ISSUE_ID" | sed "s/^[\"'\'' ]*//" | sed "s/[\"'\'' ]*$//")

# Extract sprint number and issue number
# Format: 001-issue-57 or just 57
if [[ "$ISSUE_ID" =~ ^([0-9]{3})-issue-([0-9]+) ]]; then
    SPRINT_NUMBER="${BASH_REMATCH[1]}"
    ISSUE_NUMBER="${BASH_REMATCH[2]}"
elif [[ "$ISSUE_ID" =~ ^[0-9]+$ ]]; then
    ISSUE_NUMBER="$ISSUE_ID"
    # Try to find sprint number from ticket files
    SPRINT_NUMBER=$(find .claude-shared/project-management/5-tickets -name "*-issue-${ISSUE_NUMBER}-*.md" | head -1 | cut -d/ -f5)
else
    echo "❌ ERROR: Invalid issue format"
    echo "Expected: 001-issue-57 or 57"
    echo "Received: $ISSUE_ID"
    exit 1
fi

# Find ticket file
TICKET_FILE=$(find .claude-shared/project-management/5-tickets -name "*-issue-${ISSUE_NUMBER}-*.md" | head -1)

if [ -z "$TICKET_FILE" ]; then
    echo "❌ ERROR: Ticket file not found for issue #${ISSUE_NUMBER}"
    echo "Please create the issue first using /claudia:issues:create"
    exit 1
fi

echo "✅ Issue validation passed"
echo "ISSUE_NUMBER=$ISSUE_NUMBER" > /tmp/claudia_auto_context
echo "SPRINT_NUMBER=$SPRINT_NUMBER" >> /tmp/claudia_auto_context
echo "TICKET_FILE=$TICKET_FILE" >> /tmp/claudia_auto_context
'

Now I'\''ll load the issue context, read the sprint document for requirements, and automatically implement the solution using TDD with Claude Code tools.
