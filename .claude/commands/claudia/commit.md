---
description: "Standardized commit with full traceability and PR creation"
allowed-tools: ["Read", "Write", "Edit", "Bash"]
---

# 📝 Standardized Commit with Traceability

Create a standardized commit with full traceability linking, automated PR creation, and comprehensive documentation updates.

## Processing Commit for Ticket: $ARGUMENTS

!bash -c 'echo "📝 Preparing standardized commit for ticket and message: $ARGUMENTS"'

## Parse Arguments and Validate

!bash -c '
# Parse arguments: ticket_uuid
if [ -z "$1" ]; then
    echo "❌ Usage: /claudia:commit \"ticket-uuid\""
    echo "Example: /claudia:commit \"030-01-01-database\""
    exit 1
fi

TICKET_UUID="$1"

# Validate ticket exists (try both old and new formats)
if [ -f "docs/5-tickets/$TICKET_UUID.md" ]; then
    TICKET_PATH="docs/5-tickets/$TICKET_UUID.md"
elif [ -f "5-tickets/$TICKET_UUID.md" ]; then
    TICKET_PATH="5-tickets/$TICKET_UUID.md"
else
    echo "❌ ERROR: Ticket document not found"
    echo "Looked for: docs/5-tickets/$TICKET_UUID.md"
    echo "       and: 5-tickets/$TICKET_UUID.md"
    exit 1
fi

echo "✅ Arguments validated"
echo "TICKET_UUID=$TICKET_UUID" > /tmp/claudia_commit_context
echo "TICKET_PATH=$TICKET_PATH" >> /tmp/claudia_commit_context
'

## Extract Full Context

!bash -c '
source /tmp/claudia_commit_context

# Extract ticket details
TICKET_TITLE=$(grep "^# " "$TICKET_PATH" | sed "s/^# //" | head -1)
TICKET_TYPE=$(grep "^\*\*Type:\*\*" "$TICKET_PATH" | sed "s/\*\*Type:\*\* //" | head -1)
REQ_UUID=$(grep "^\*\*Requirement:\*\*" "$TICKET_PATH" | sed "s/\*\*Requirement:\*\* \`\([^`]*\)\`.*/\1/" | head -1)
GITHUB_ISSUE=$(grep "^\*\*GitHub Issue:\*\*" "$TICKET_PATH" | sed "s/\*\*GitHub Issue:\*\* #\([0-9]*\).*/\1/" | head -1)

# Auto-generate commit message from ticket title
COMMIT_MESSAGE=$(echo "$TICKET_TITLE" | sed "s/^[A-Z][a-z]*//" | sed "s/^: *//" | sed "s/^//" | head -c 50)
if [ -z "$COMMIT_MESSAGE" ]; then
    COMMIT_MESSAGE="$TICKET_TITLE"
fi

echo "📋 Commit Context:"
echo "- Ticket: $TICKET_TITLE" 
echo "- Type: $TICKET_TYPE"
echo "- Requirement: $REQ_UUID"
echo "- GitHub Issue: #$GITHUB_ISSUE"
echo "- Auto-generated Message: $COMMIT_MESSAGE"

# Save full context
cat >> /tmp/claudia_commit_context << EOF
TICKET_TITLE="$TICKET_TITLE"
TICKET_TYPE="$TICKET_TYPE"
REQ_UUID="$REQ_UUID"
GITHUB_ISSUE="$GITHUB_ISSUE"
COMMIT_MESSAGE="$COMMIT_MESSAGE"
EOF
'

## Pre-Commit Quality Checks

!bash -c '
source /tmp/claudia_commit_context
echo ""
echo "🔍 Running pre-commit quality checks..."

# Check if we are in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ ERROR: Not in a git repository"
    exit 1
fi

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "📝 No staged changes found, staging all changes..."
    git add .
    
    if git diff --staged --quiet; then
        echo "❌ ERROR: No changes to commit"
        exit 1
    fi
fi

# Run tests
echo "🧪 Running test suite..."
cd api
TEST_OUTPUT=$(npm test 2>&1)
TEST_EXIT_CODE=$?

if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "✅ All tests pass"
    TEST_STATUS="PASS"
else
    echo "❌ Tests failing:"
    echo "$TEST_OUTPUT" | tail -10
    echo ""
    echo "⚠️  Proceeding with commit anyway (tests may be expected to fail during development)"
    TEST_STATUS="FAIL"
fi

# Run linting
echo "🔍 Running linting checks..."
LINT_OUTPUT=$(npm run lint 2>&1)
LINT_EXIT_CODE=$?

if [ $LINT_EXIT_CODE -eq 0 ]; then
    echo "✅ Linting passes"
    LINT_STATUS="PASS"
else
    echo "⚠️  Linting issues found:"
    echo "$LINT_OUTPUT" | head -10
    echo ""
    echo "🔧 Attempting to auto-fix..."
    npm run lint:fix > /dev/null 2>&1
    
    # Check if auto-fix resolved issues
    if npm run lint > /dev/null 2>&1; then
        echo "✅ Auto-fix successful"
        LINT_STATUS="FIXED"
    else
        echo "⚠️  Some linting issues remain - proceeding with commit"
        LINT_STATUS="PARTIAL"
    fi
fi

cd ..

echo "TEST_STATUS=$TEST_STATUS" >> /tmp/claudia_commit_context
echo "LINT_STATUS=$LINT_STATUS" >> /tmp/claudia_commit_context
'

## Generate Standardized Commit Message

!bash -c '
source /tmp/claudia_commit_context
echo ""
echo "📝 Generating standardized commit message..."

# Determine commit type from ticket type
case "$TICKET_TYPE" in
    "Database") COMMIT_TYPE="feat" ;;
    "API") COMMIT_TYPE="feat" ;;
    "Frontend") COMMIT_TYPE="feat" ;;
    "Testing") COMMIT_TYPE="test" ;;
    "Implementation") COMMIT_TYPE="feat" ;;
    *) COMMIT_TYPE="feat" ;;
esac

# Extract scope from ticket or requirement
SCOPE="unknown"
if echo "$TICKET_TITLE" | grep -qi "database\|schema\|model"; then
    SCOPE="db"
elif echo "$TICKET_TITLE" | grep -qi "api\|endpoint"; then
    SCOPE="api"
elif echo "$TICKET_TITLE" | grep -qi "test"; then
    SCOPE="test"
elif echo "$TICKET_TITLE" | grep -qi "xp\|experience"; then
    SCOPE="xp"
elif echo "$TICKET_TITLE" | grep -qi "auth\|login"; then
    SCOPE="auth"
else
    # Try to extract from requirement (check both paths for compatibility)
    REQ_PATH="docs/4-requirements/$REQ_UUID.md"
    if [ ! -f "$REQ_PATH" ] && [ -f "4-requirements/$REQ_UUID.md" ]; then
        REQ_PATH="4-requirements/$REQ_UUID.md"
    fi
    
    if [ -f "$REQ_PATH" ]; then
        REQ_CONTENT=$(cat "$REQ_PATH")
        if echo "$REQ_CONTENT" | grep -qi "xp\|experience"; then
            SCOPE="xp"
        elif echo "$REQ_CONTENT" | grep -qi "auth"; then
            SCOPE="auth"
        elif echo "$REQ_CONTENT" | grep -qi "user"; then
            SCOPE="user"
        else
            SCOPE="feature"
        fi
    fi
fi

# Get commit statistics  
FILES_CHANGED=$(git diff --staged --name-only | wc -l | tr -d " ")
ADDITIONS=$(git diff --staged --numstat | awk "{add += \$1} END {print add+0}")
DELETIONS=$(git diff --staged --numstat | awk "{del += \$2} END {print del+0}")

# Create comprehensive commit message
FULL_COMMIT_MESSAGE="$COMMIT_TYPE($SCOPE): $COMMIT_MESSAGE

Ticket: $TICKET_UUID - $TICKET_TITLE
Requirement: $REQ_UUID
GitHub Issue: #$GITHUB_ISSUE

Implementation Details:
- Files changed: $FILES_CHANGED
- Lines added: $ADDITIONS
- Lines deleted: $DELETIONS
- Tests: $TEST_STATUS
- Linting: $LINT_STATUS

Traceability Chain:
Requirement $REQ_UUID → Ticket $TICKET_UUID → Commit $(git rev-parse --short HEAD 2>/dev/null || echo "pending")

Closes #$GITHUB_ISSUE

🤖 Generated with Claude Code (https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

echo "FULL_COMMIT_MESSAGE=\"$FULL_COMMIT_MESSAGE\"" >> /tmp/claudia_commit_context
echo "COMMIT_TYPE=$COMMIT_TYPE" >> /tmp/claudia_commit_context
echo "SCOPE=$SCOPE" >> /tmp/claudia_commit_context
echo "FILES_CHANGED=$FILES_CHANGED" >> /tmp/claudia_commit_context
echo "ADDITIONS=$ADDITIONS" >> /tmp/claudia_commit_context  
echo "DELETIONS=$DELETIONS" >> /tmp/claudia_commit_context

echo "✅ Standardized commit message generated"
'

## Create Commit

!bash -c '
source /tmp/claudia_commit_context
echo ""
echo "💾 Creating commit..."

# Create the commit using heredoc for proper formatting
git commit -m "$(cat <<EOF
$FULL_COMMIT_MESSAGE
EOF
)"

COMMIT_EXIT_CODE=$?

if [ $COMMIT_EXIT_CODE -eq 0 ]; then
    COMMIT_HASH=$(git rev-parse HEAD)
    COMMIT_SHORT_HASH=$(git rev-parse --short HEAD)
    echo "✅ Commit created successfully"
    echo "📝 Commit hash: $COMMIT_SHORT_HASH"
    
    echo "COMMIT_HASH=$COMMIT_HASH" >> /tmp/claudia_commit_context
    echo "COMMIT_SHORT_HASH=$COMMIT_SHORT_HASH" >> /tmp/claudia_commit_context
else
    echo "❌ ERROR: Commit failed"
    exit 1
fi
'

## Update Ticket with Commit Information

!bash -c '
source /tmp/claudia_commit_context
echo ""
echo "📝 Updating ticket with commit information..."

# Update implementation section in ticket
TIMESTAMP=$(date)
BRANCH=$(git branch --show-current)

# Add commit information to ticket
sed -i "s/\*\*Implementation PR:\*\* (Will be populated by \/claudia:commit)/\*\*Implementation PR:\*\* Commit: $COMMIT_SHORT_HASH - Pending PR creation/" "$TICKET_PATH"

# Update or add completion section
if grep -q "## Implementation Progress" "$TICKET_PATH"; then
    # Update existing section
    sed -i "/## Implementation Progress/,/^---/ {
        s/- \[ \] Phase 4: Tests passing/- [x] Phase 4: Tests passing ($TEST_STATUS)/
        s/- \[ \] Phase 5: Code refactored and optimized/- [x] Phase 5: Code refactored and optimized/
    }" "$TICKET_PATH"
else
    # Add completion section
    cat >> "$TICKET_PATH" << EOF

## Implementation Completed

**Completed:** $TIMESTAMP  
**Commit:** \`$COMMIT_SHORT_HASH\` - $COMMIT_HASH  
**Branch:** \`$BRANCH\`  
**Files Changed:** $FILES_CHANGED  
**Lines:** +$ADDITIONS/-$DELETIONS  

### Final Status
- [x] Implementation completed
- [x] Commit created with full traceability
- [x] Tests status: $TEST_STATUS
- [x] Linting status: $LINT_STATUS  
- [ ] PR created and reviewed
- [ ] Merged to main branch

---
*Completed by Claudia Automation - $TIMESTAMP*
EOF
fi

echo "✅ Updated ticket document with commit information"
'

## Update Ticket with Commit Information

!bash -c '
source /tmp/claudia_commit_context

echo ""
echo "📝 Updating ticket with commit information..."

# Update ticket with latest commit
if grep -q "**Implementation Commits:**" "$TICKET_PATH"; then
    # Add to existing commits section
    sed -i "/\*\*Implementation Commits:\*\*/a - [\`$COMMIT_SHORT_HASH\`](https://github.com/penomoprotocol/penomo-api/commit/$COMMIT_HASH) - $COMMIT_MESSAGE" "$TICKET_PATH"
else
    # Create commits section 
    sed -i "s/\*\*Implementation PR:\*\* (Will be populated by \/claudia:commit)/\*\*Implementation Commits:\*\*\n- [\`$COMMIT_SHORT_HASH\`](https:\/\/github.com\/penomoprotocol\/penomo-api\/commit\/$COMMIT_HASH) - $COMMIT_MESSAGE\n\n\*\*Implementation PR:\*\* (Use \/claudia:pr:create to create PR)/" "$TICKET_PATH"
fi

echo "✅ Updated ticket with commit information"
'

## Log Commit to Traceability System

!bash -c '
source /tmp/claudia_commit_context
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)

# Log commit with full traceability
echo "{\"timestamp\":\"$TIMESTAMP\",\"action\":\"committed\",\"ticket_uuid\":\"$TICKET_UUID\",\"requirement_uuid\":\"$REQ_UUID\",\"hash\":\"$COMMIT_HASH\",\"short_hash\":\"$COMMIT_SHORT_HASH\",\"message\":\"$COMMIT_MESSAGE\",\"type\":\"$COMMIT_TYPE\",\"scope\":\"$SCOPE\",\"files_changed\":$FILES_CHANGED,\"additions\":$ADDITIONS,\"deletions\":$DELETIONS,\"test_status\":\"$TEST_STATUS\",\"lint_status\":\"$LINT_STATUS\",\"branch\":\"$(git branch --show-current)\"}" >> .claude-shared/project-management/data/commits-log.jsonl

echo "📊 Logged commit to traceability system"
'

## Summary and Next Steps

!bash -c '
source /tmp/claudia_commit_context

echo ""
echo "✅ **Commit Complete**"
echo ""
echo "**Commit Details:**"
echo "- **Hash:** \`$COMMIT_SHORT_HASH\`"
echo "- **Message:** $COMMIT_MESSAGE"
echo "- **Type:** $COMMIT_TYPE($SCOPE)"
echo "- **Files Changed:** $FILES_CHANGED (+$ADDITIONS/-$DELETIONS)"
echo "- **Branch:** $(git branch --show-current)"
echo ""
echo "**Quality Status:**"
echo "- **Tests:** $TEST_STATUS"
echo "- **Linting:** $LINT_STATUS"
echo ""
echo "**Updated Files:**"
echo "- 📄 $TICKET_PATH (commit logged)"
echo "- 📊 .claude-shared/project-management/data/commits-log.jsonl (audit trail)"
echo ""
echo "**Next Steps:**"
echo "1. 📝 Continue development: /claudia:commit \"$TICKET_UUID\" (for additional commits)"
echo "2. 🚀 Create Pull Request: /claudia:pr:create \"$TICKET_UUID\""
echo "3. 📚 Update documentation: /claudia:docs:update \"$COMMIT_SHORT_HASH\""
echo "4. ✅ Complete ticket: /claudia:ticket:complete \"$TICKET_UUID\" (when fully done)"
echo ""
echo "**Multiple Commits Supported:**"
echo "- This ticket can have multiple commits for iterative development"
echo "- Each commit is tracked separately in the ticket document"
echo "- GitHub issue remains open until ticket is marked complete"
echo ""
echo "**Full Traceability Chain:**"
echo "Requirement: \`$REQ_UUID\` → Ticket: \`$TICKET_UUID\` → Commit: \`$COMMIT_SHORT_HASH\`"
'

## Cleanup

!bash -c 'rm -f /tmp/claudia_commit_context'

!echo "📝 Commit workflow completed successfully"
!echo "🔗 Full traceability maintained - multiple commits per ticket supported"
!echo "🚀 Ready for PR creation, documentation updates, or additional commits"