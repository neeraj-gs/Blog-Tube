---
description: "Create GitHub issue from sprint requirement with full context and ticket storage"
allowed-tools: ["Read", "Write", "Edit", "Bash"]
---

# 🎯 Create GitHub Issue from Sprint Requirement

Create a GitHub issue from a requirement embedded in a sprint document, with automatic ticket storage in 5-tickets/ folder.

## Processing Issue Creation: $ARGUMENTS

!bash -c 'echo "🎯 Creating GitHub issue from sprint requirement: $ARGUMENTS"'

## Parse Arguments and Validate

!bash -c '
# Parse arguments: sprint-number --requirement N [--title "Custom Title"] [--labels "label1,label2"]
SPRINT_NUMBER=""
REQUIREMENT_NUM=""
ISSUE_TITLE=""
LABELS=""

ARGS_STRING="$ARGUMENTS"

# Extract sprint number (first argument)
SPRINT_NUMBER=$(echo "$ARGS_STRING" | awk "{print \$1}" | sed "s/[\"\']//g")

# Extract requirement number
if echo "$ARGS_STRING" | grep -q "\--requirement"; then
    REQUIREMENT_NUM=$(echo "$ARGS_STRING" | sed "s/.*--requirement //" | awk "{print \$1}")
else
    echo "❌ ERROR: --requirement parameter is required"
    echo "Usage: /claudia:issues:create \"002\" --requirement 1 [--title \"Custom\"] [--labels \"bug,enhancement\"]"
    exit 1
fi

# Extract custom title if provided
if echo "$ARGS_STRING" | grep -q "\--title"; then
    ISSUE_TITLE=$(echo "$ARGS_STRING" | sed "s/.*--title //" | sed "s/\"//g" | sed "s/ --.*$//")
fi

# Extract labels if provided
if echo "$ARGS_STRING" | grep -q "\--labels"; then
    LABELS=$(echo "$ARGS_STRING" | sed "s/.*--labels //" | awk "{print \$1}" | sed "s/[\"\']//g")
fi

# Validate sprint number
if [[ ! "$SPRINT_NUMBER" =~ ^[0-9]{3}$ ]]; then
    echo "❌ ERROR: Sprint number must be 3 digits (e.g., 002, 030, 031)"
    echo "Usage: /claudia:issues:create \"002\" --requirement 1"
    exit 1
fi

# Check if sprint file exists
SPRINT_FILE=".claude-shared/project-management/3-sprints/$SPRINT_NUMBER.md"
if [ ! -f "$SPRINT_FILE" ]; then
    echo "❌ ERROR: Sprint file not found: $SPRINT_FILE"
    echo "Create sprint first: /claudia:sprint:create \"$SPRINT_NUMBER\""
    exit 1
fi

echo "✅ Arguments validated"
echo "SPRINT_NUMBER=$SPRINT_NUMBER" > /tmp/claudia_issue_context
echo "SPRINT_FILE=$SPRINT_FILE" >> /tmp/claudia_issue_context
echo "REQUIREMENT_NUM=$REQUIREMENT_NUM" >> /tmp/claudia_issue_context
echo "ISSUE_TITLE=\"$ISSUE_TITLE\"" >> /tmp/claudia_issue_context
echo "LABELS=$LABELS" >> /tmp/claudia_issue_context
'

## Extract Requirement from Sprint Document

!bash -c '
source /tmp/claudia_issue_context

echo ""
echo "📖 Reading sprint document: $SPRINT_FILE"
echo "Looking for Requirement $REQUIREMENT_NUM..."

# Extract the specific requirement section
# Look for "### Requirement N:" and capture until next "###" or "##"
REQUIREMENT_CONTENT=$(awk "/^### Requirement $REQUIREMENT_NUM:/{flag=1; next} /^### |^## /{flag=0} flag" "$SPRINT_FILE")

if [ -z "$REQUIREMENT_CONTENT" ]; then
    echo "❌ ERROR: Requirement $REQUIREMENT_NUM not found in sprint $SPRINT_NUMBER"
    echo "Available requirements in sprint:"
    grep "^### Requirement" "$SPRINT_FILE" || echo "  No requirements found"
    exit 1
fi

# Extract requirement title
REQ_TITLE_LINE=$(grep "^### Requirement $REQUIREMENT_NUM:" "$SPRINT_FILE")
REQ_TITLE=$(echo "$REQ_TITLE_LINE" | sed "s/^### Requirement $REQUIREMENT_NUM: //")

# Use custom title if provided, otherwise use extracted title
if [ -z "$ISSUE_TITLE" ]; then
    ISSUE_TITLE="$REQ_TITLE"
fi

echo "✅ Requirement found: $REQ_TITLE"
echo "REQ_TITLE=\"$REQ_TITLE\"" >> /tmp/claudia_issue_context
echo "$REQUIREMENT_CONTENT" > /tmp/requirement_content.txt
'

## Generate GitHub Issue Body

!bash -c '
source /tmp/claudia_issue_context

echo ""
echo "🔨 Generating GitHub issue body..."

# Create comprehensive issue body from requirement
cat > /tmp/issue_body.md << EOF
## 📋 Requirement from Sprint $SPRINT_NUMBER

This issue implements **Requirement $REQUIREMENT_NUM** from Sprint $SPRINT_NUMBER.

### Sprint Context
- **Sprint Document:** \`.claude-shared/project-management/3-sprints/$SPRINT_NUMBER.md\`
- **Requirement Number:** $REQUIREMENT_NUM
- **Requirement Title:** $REQ_TITLE

### 📖 Requirement Details

$(cat /tmp/requirement_content.txt)

### ✅ Definition of Done

All acceptance criteria from the requirement above must be met, plus:
- [ ] Code follows project standards and conventions
- [ ] Tests are written and passing
- [ ] Code review completed
- [ ] Documentation updated
- [ ] Feature tested in appropriate environment

### 🔗 Traceability

- **Sprint:** $SPRINT_NUMBER
- **Sprint Document:** \`.claude-shared/project-management/3-sprints/$SPRINT_NUMBER.md\`
- **Requirement:** $REQUIREMENT_NUM

### ⚠️ Implementation Instructions

**This issue does NOT auto-create PRs.** Manual implementation workflow:

1. Review the requirement details above
2. Make code changes manually or with Claude Code
3. Commit: \`/claudia:commit "$SPRINT_NUMBER-issue-NUMBER"\`
4. Create PR: \`/claudia:pr:create "$SPRINT_NUMBER-issue-NUMBER"\`

---
*Created from Claudia Sprint-Based System*
*⚠️ Manual implementation required - No automatic PR creation*
EOF

echo "✅ Issue body generated"
'

## Create GitHub Issue

!bash -c '
source /tmp/claudia_issue_context

echo ""
echo "🚀 Creating GitHub issue..."

# Check GitHub CLI
if ! command -v gh &> /dev/null; then
    echo "❌ ERROR: GitHub CLI (gh) is not installed"
    echo "Install from: https://cli.github.com/"
    exit 1
fi

if ! gh auth status > /dev/null 2>&1; then
    echo "❌ ERROR: GitHub CLI not authenticated"
    echo "Run: gh auth login"
    exit 1
fi

# Build command with labels
GH_COMMAND="gh issue create --title \"$ISSUE_TITLE\" --body-file /tmp/issue_body.md"

if [ -n "$LABELS" ]; then
    GH_COMMAND="$GH_COMMAND --label \"$LABELS\""
fi

echo "Command: $GH_COMMAND"

# Execute the command
eval $GH_COMMAND

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ GitHub issue created successfully!"

    # Get the issue number
    ISSUE_NUMBER=$(gh issue list --limit 1 --json number --jq ".[0].number")
    echo "📝 Issue Number: #$ISSUE_NUMBER"

    echo "ISSUE_NUMBER=$ISSUE_NUMBER" >> /tmp/claudia_issue_context
    echo "🔗 View issue: $(gh repo view --json url --jq .url)/issues/$ISSUE_NUMBER"
else
    echo "❌ Failed to create GitHub issue"
    exit 1
fi
'

## Store Issue Copy in 5-tickets/ Folder

!bash -c '
source /tmp/claudia_issue_context
TIMESTAMP=$(date -u +"%Y-%m-%d %H:%M:%S UTC")

echo ""
echo "📝 Storing issue copy in tickets folder..."

# Create safe filename
SAFE_TITLE=$(echo "$ISSUE_TITLE" | tr "[:upper:]" "[:lower:]" | sed "s/[^a-z0-9 ]//g" | tr " " "-" | cut -c1-50)
TICKET_FILE=".claude-shared/project-management/5-tickets/${SPRINT_NUMBER}-issue-${ISSUE_NUMBER}-${SAFE_TITLE}.md"

# Ensure tickets directory exists
mkdir -p .claude-shared/project-management/5-tickets

# Create ticket file
cat > "$TICKET_FILE" << EOF
# Issue #${ISSUE_NUMBER} - ${ISSUE_TITLE}

**Ticket ID:** \`${SPRINT_NUMBER}-issue-${ISSUE_NUMBER}\`
**Sprint:** ${SPRINT_NUMBER}
**Sprint Document:** \`.claude-shared/project-management/3-sprints/${SPRINT_NUMBER}.md\`
**Requirement:** $REQUIREMENT_NUM
**GitHub Issue:** #${ISSUE_NUMBER}
**Created:** $TIMESTAMP
**Status:** Open

## Issue Content (Copy from GitHub)

$(cat /tmp/issue_body.md)

## Implementation Tracking

### Commits
*Will be populated when commits are made using /claudia:commit*

### Pull Requests
*Will be populated when PRs are created using /claudia:pr:create*

### Status Updates
- **$TIMESTAMP**: Issue created from sprint requirement
- ⚠️ **Manual implementation required** - No automatic PR

## Implementation Instructions

To implement this issue:

1. **Review:** Read the requirement details in sprint document
2. **Implement:** Make code changes manually or with Claude Code
3. **Commit:** \`/claudia:commit "${SPRINT_NUMBER}-issue-${ISSUE_NUMBER}"\`
4. **Create PR:** \`/claudia:pr:create "${SPRINT_NUMBER}-issue-${ISSUE_NUMBER}"\`

## Traceability

**Sprint:** ${SPRINT_NUMBER}
**Sprint Document:** \`.claude-shared/project-management/3-sprints/${SPRINT_NUMBER}.md\`
**Requirement Number:** $REQUIREMENT_NUM
**Requirement Title:** $REQ_TITLE
**GitHub Issue:** #${ISSUE_NUMBER}
**Ticket File:** \`${TICKET_FILE}\`

---
*Managed by Claudia Automation System*
*⚠️ Automatic PR creation DISABLED - Manual implementation required*
EOF

echo "✅ Ticket copy stored: $TICKET_FILE"
'

## Update Sprint Document with Issue Link

!bash -c '
source /tmp/claudia_issue_context

echo ""
echo "📊 Updating sprint document with issue link..."

# Find the requirement section and add issue link
# Add issue number to "Related Issues:" line in the requirement
if grep -q "### Requirement $REQUIREMENT_NUM:" "$SPRINT_FILE"; then
    # Update the Related Issues line for this requirement
    sed -i "" "/### Requirement $REQUIREMENT_NUM:/,/^### /{
        s/\*\*Related Issues:\*\* (Will be populated.*/\*\*Related Issues:\*\* #${ISSUE_NUMBER}/
        s/\*\*Related Issues:\*\* (Will be populated)/\*\*Related Issues:\*\* #${ISSUE_NUMBER}/
        s/\*\*Related Issues:\*\*$/\*\*Related Issues:\*\* #${ISSUE_NUMBER}/
    }" "$SPRINT_FILE" 2>/dev/null || echo "  Note: Could not auto-update sprint doc"

    # Update sprint metrics
    CURRENT_ISSUES=$(grep "Open Issues:" "$SPRINT_FILE" | grep -o "[0-9]*" | head -1)
    NEW_ISSUES=$((CURRENT_ISSUES + 1))
    sed -i "" "s/- \*\*Open Issues:\*\* [0-9]*/- \*\*Open Issues:\*\* $NEW_ISSUES/" "$SPRINT_FILE"

    echo "✅ Sprint document updated with issue #${ISSUE_NUMBER}"
fi
'

## Log Issue Creation

!bash -c '
source /tmp/claudia_issue_context
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo ""
echo "📊 Logging issue creation to audit trail..."

mkdir -p .claude-shared/project-management/data

# Log to github-sync.jsonl
LOG_ENTRY="{\"timestamp\":\"$TIMESTAMP\",\"action\":\"issue_created_from_sprint\",\"sprint_number\":\"$SPRINT_NUMBER\",\"requirement_number\":$REQUIREMENT_NUM,\"issue_number\":$ISSUE_NUMBER,\"issue_title\":\"$ISSUE_TITLE\",\"ticket_file\":\"5-tickets/${SPRINT_NUMBER}-issue-${ISSUE_NUMBER}-*.md\",\"labels\":\"$LABELS\"}"

echo "$LOG_ENTRY" >> .claude-shared/project-management/data/github-sync.jsonl

echo "✅ Issue creation logged to audit trail"
'

## Display Summary

!bash -c '
source /tmp/claudia_issue_context

echo ""
echo "✨ ISSUE CREATION COMPLETE"
echo "=========================="
echo ""
echo "📋 Created Issue:"
echo "  - Issue #${ISSUE_NUMBER}: $ISSUE_TITLE"
echo "  - Sprint: $SPRINT_NUMBER"
echo "  - Requirement: $REQUIREMENT_NUM ($REQ_TITLE)"
echo ""
echo "📁 Files Created/Updated:"
echo "  - Ticket: .claude-shared/project-management/5-tickets/${SPRINT_NUMBER}-issue-${ISSUE_NUMBER}-*.md"
echo "  - Sprint doc updated: $SPRINT_FILE"
echo ""
echo "🔗 GitHub Issue: $(gh repo view --json url --jq .url)/issues/$ISSUE_NUMBER"
echo ""
echo "⚠️ NEXT STEPS (Manual Implementation):"
echo "  1. Review requirement in sprint document"
echo "  2. Implement the changes"
echo "  3. Commit: /claudia:commit \"${SPRINT_NUMBER}-issue-${ISSUE_NUMBER}\""
echo "  4. Create PR: /claudia:pr:create \"${SPRINT_NUMBER}-issue-${ISSUE_NUMBER}\""
echo ""
echo "💡 Create more issues:"
echo "  /claudia:issues:create \"$SPRINT_NUMBER\" --requirement 2"
echo "  /claudia:issues:create \"$SPRINT_NUMBER\" --requirement 3"
echo ""
echo "Or create all at once:"
echo "  /claudia:issues:create-from-sprint \"$SPRINT_NUMBER\" --all"
'

## Cleanup

!bash -c 'rm -f /tmp/claudia_issue_context /tmp/requirement_content.txt /tmp/issue_body.md'

!echo "🎯 Issue creation from sprint workflow completed successfully"
!echo "📝 Ticket stored in 5-tickets/ folder for offline tracking"
!echo "⚠️ Manual implementation required - No automatic PR creation"
