---
description: "Standardized commit with full traceability and interactive branch creation"
allowed-tools: ["Read", "Write", "Edit", "Bash"]
---

# 📝 Standardized Commit with Traceability

Create a standardized commit with full traceability linking to GitHub issues, with interactive branch creation option.

## Processing Commit: $ARGUMENTS

!bash -c 'echo "📝 Preparing standardized commit: $ARGUMENTS"'

## Parse Arguments and Validate

!bash -c '
# Parse arguments: issue-id [description]
ARGS_STRING="$*"

if [ -z "$ARGS_STRING" ]; then
    echo "❌ Usage: /claudia:commit \"issue-id\" [\"description\"]"
    echo "Example: /claudia:commit \"030-issue-21\" \"implement authentication system\""
    echo "Example: /claudia:commit \"21\" \"add user login feature\""
    exit 1
fi

# Extract issue ID (support both "030-issue-21" and "21" formats)
ISSUE_ID=$(echo "$ARGS_STRING" | awk "{print \$1}" | sed "s/[\"\']//g")

# Extract description (everything after first argument)
DESCRIPTION=$(echo "$ARGS_STRING" | sed "s/^[^ ]* *//" | sed "s/^[\"\']//;s/[\"\']$//")

# Normalize issue ID to just the number
if echo "$ISSUE_ID" | grep -q "issue-"; then
    ISSUE_NUMBER=$(echo "$ISSUE_ID" | sed "s/.*issue-//")
else
    ISSUE_NUMBER="$ISSUE_ID"
fi

echo "✅ Arguments parsed"
echo "ISSUE_NUMBER=$ISSUE_NUMBER" > /tmp/claudia_commit_context
echo "DESCRIPTION=$DESCRIPTION" >> /tmp/claudia_commit_context
'

## Fetch Issue Details from GitHub

!bash -c '
source /tmp/claudia_commit_context
echo ""
echo "🔍 Fetching issue #$ISSUE_NUMBER from GitHub..."

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ ERROR: GitHub CLI (gh) not installed"
    echo "Install: brew install gh"
    exit 1
fi

# Fetch issue details
ISSUE_JSON=$(gh issue view "$ISSUE_NUMBER" --json number,title,body,labels,state 2>/dev/null)

if [ $? -ne 0 ]; then
    echo "❌ ERROR: Could not find issue #$ISSUE_NUMBER"
    echo "Make sure the issue exists and you have access to the repository"
    exit 1
fi

ISSUE_TITLE=$(echo "$ISSUE_JSON" | jq -r ".title")
ISSUE_STATE=$(echo "$ISSUE_JSON" | jq -r ".state")
ISSUE_LABELS=$(echo "$ISSUE_JSON" | jq -r ".labels[].name" | tr "\n" "," | sed "s/,$//")

if [ "$ISSUE_STATE" = "CLOSED" ]; then
    echo "⚠️  Warning: Issue #$ISSUE_NUMBER is CLOSED"
fi

echo "📋 Issue Details:"
echo "- Title: $ISSUE_TITLE"
echo "- State: $ISSUE_STATE"
echo "- Labels: $ISSUE_LABELS"

# Save to context
cat >> /tmp/claudia_commit_context << EOF
ISSUE_TITLE="$ISSUE_TITLE"
ISSUE_STATE="$ISSUE_STATE"
ISSUE_LABELS="$ISSUE_LABELS"
EOF
'

## Interactive Branch Creation

!bash -c '
source /tmp/claudia_commit_context
echo ""
echo "🌿 Branch Management"
echo ""

CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"
echo ""

# Check if already on a feature branch for this issue
EXPECTED_BRANCH="feature/issue-${ISSUE_NUMBER}"
if echo "$CURRENT_BRANCH" | grep -q "issue-${ISSUE_NUMBER}"; then
    echo "✅ Already on branch for issue #$ISSUE_NUMBER"
    echo "BRANCH_CREATED=false" >> /tmp/claudia_commit_context
    echo "TARGET_BRANCH=$CURRENT_BRANCH" >> /tmp/claudia_commit_context
else
    echo "❓ Would you like to create a new branch for this issue?"
    echo ""
    echo "Options:"
    echo "  1) Create new branch from current branch ($CURRENT_BRANCH)"
    echo "  2) Create new branch from main"
    echo "  3) Create new branch from staging"
    echo "  4) No, stay on current branch"
    echo ""
    read -p "Enter your choice (1-4): " BRANCH_CHOICE

    case "$BRANCH_CHOICE" in
        1)
            BASE_BRANCH="$CURRENT_BRANCH"
            CREATE_BRANCH=true
            ;;
        2)
            BASE_BRANCH="main"
            CREATE_BRANCH=true
            ;;
        3)
            BASE_BRANCH="staging"
            CREATE_BRANCH=true
            ;;
        4)
            echo "✅ Staying on current branch: $CURRENT_BRANCH"
            CREATE_BRANCH=false
            ;;
        *)
            echo "❌ Invalid choice, staying on current branch"
            CREATE_BRANCH=false
            ;;
    esac

    if [ "$CREATE_BRANCH" = true ]; then
        # Generate safe branch name from issue title
        SAFE_TITLE=$(echo "$ISSUE_TITLE" | tr "[:upper:]" "[:lower:]" | sed "s/[^a-z0-9 ]//g" | tr " " "-" | cut -c1-50)
        NEW_BRANCH="feature/issue-${ISSUE_NUMBER}-${SAFE_TITLE}"

        echo ""
        echo "🌿 Creating new branch: $NEW_BRANCH"
        echo "📍 Base branch: $BASE_BRANCH"

        # Ensure base branch is up to date if not current branch
        if [ "$BASE_BRANCH" != "$CURRENT_BRANCH" ]; then
            echo "📥 Fetching latest from origin..."
            git fetch origin "$BASE_BRANCH"
        fi

        # Create and checkout new branch
        git checkout -b "$NEW_BRANCH" "origin/$BASE_BRANCH" 2>/dev/null || git checkout -b "$NEW_BRANCH" "$BASE_BRANCH"

        if [ $? -eq 0 ]; then
            echo "✅ Created and switched to: $NEW_BRANCH"
            echo "BRANCH_CREATED=true" >> /tmp/claudia_commit_context
            echo "TARGET_BRANCH=$NEW_BRANCH" >> /tmp/claudia_commit_context
        else
            echo "❌ ERROR: Failed to create branch"
            exit 1
        fi
    else
        echo "BRANCH_CREATED=false" >> /tmp/claudia_commit_context
        echo "TARGET_BRANCH=$CURRENT_BRANCH" >> /tmp/claudia_commit_context
    fi
fi
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

echo "✅ Changes staged and ready to commit"
'

## Generate Commit Message

!bash -c '
source /tmp/claudia_commit_context
echo ""
echo "📝 Generating commit message..."

# Determine commit type from labels
COMMIT_TYPE="feat"
if echo "$ISSUE_LABELS" | grep -qi "bug\|fix"; then
    COMMIT_TYPE="fix"
elif echo "$ISSUE_LABELS" | grep -qi "docs\|documentation"; then
    COMMIT_TYPE="docs"
elif echo "$ISSUE_LABELS" | grep -qi "test"; then
    COMMIT_TYPE="test"
elif echo "$ISSUE_LABELS" | grep -qi "refactor"; then
    COMMIT_TYPE="refactor"
elif echo "$ISSUE_LABELS" | grep -qi "chore"; then
    COMMIT_TYPE="chore"
fi

# Determine scope from labels or title
SCOPE=""
if echo "$ISSUE_LABELS" | grep -qi "frontend\|ui"; then
    SCOPE="frontend"
elif echo "$ISSUE_LABELS" | grep -qi "backend\|api"; then
    SCOPE="backend"
elif echo "$ISSUE_LABELS" | grep -qi "database\|db"; then
    SCOPE="db"
elif echo "$ISSUE_LABELS" | grep -qi "auth"; then
    SCOPE="auth"
fi

# Use description if provided, otherwise use issue title
if [ -n "$DESCRIPTION" ]; then
    COMMIT_SUMMARY="$DESCRIPTION"
else
    COMMIT_SUMMARY=$(echo "$ISSUE_TITLE" | head -c 72)
fi

# Get commit statistics
FILES_CHANGED=$(git diff --staged --name-only | wc -l | tr -d " ")
ADDITIONS=$(git diff --staged --numstat | awk "{add += \$1} END {print add+0}")
DELETIONS=$(git diff --staged --numstat | awk "{del += \$2} END {print del+0}")

# Generate full commit message
if [ -n "$SCOPE" ]; then
    COMMIT_PREFIX="$COMMIT_TYPE($SCOPE)"
else
    COMMIT_PREFIX="$COMMIT_TYPE"
fi

FULL_COMMIT_MESSAGE="$COMMIT_PREFIX: $COMMIT_SUMMARY

Resolves #$ISSUE_NUMBER

Implementation Details:
- Files changed: $FILES_CHANGED
- Lines: +$ADDITIONS / -$DELETIONS
- Branch: $TARGET_BRANCH

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

echo "FULL_COMMIT_MESSAGE=\"$FULL_COMMIT_MESSAGE\"" >> /tmp/claudia_commit_context
echo "COMMIT_TYPE=$COMMIT_TYPE" >> /tmp/claudia_commit_context
echo "SCOPE=$SCOPE" >> /tmp/claudia_commit_context
echo "COMMIT_SUMMARY=$COMMIT_SUMMARY" >> /tmp/claudia_commit_context
echo "FILES_CHANGED=$FILES_CHANGED" >> /tmp/claudia_commit_context
echo "ADDITIONS=$ADDITIONS" >> /tmp/claudia_commit_context
echo "DELETIONS=$DELETIONS" >> /tmp/claudia_commit_context

echo ""
echo "📋 Commit Preview:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "$FULL_COMMIT_MESSAGE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Commit message generated"
'

## Create Commit

!bash -c '
source /tmp/claudia_commit_context
echo ""
echo "💾 Creating commit..."

# Create the commit using heredoc for proper formatting
git commit -m "$FULL_COMMIT_MESSAGE"

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

## Update Ticket File (if exists)

!bash -c '
source /tmp/claudia_commit_context
echo ""
echo "📝 Updating ticket file..."

# Look for ticket file in 5-tickets/ folder
TICKET_FILE=$(find .claude-shared/project-management/5-tickets/ -name "*-issue-${ISSUE_NUMBER}-*.md" 2>/dev/null | head -1)

if [ -z "$TICKET_FILE" ]; then
    echo "ℹ️  No local ticket file found (this is okay)"
else
    echo "📄 Found ticket: $TICKET_FILE"

    # Update ticket with commit information
    TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")

    # Check if commits section exists
    if grep -q "### Commits" "$TICKET_FILE"; then
        # Add to existing commits section
        sed -i "" "/### Commits/a\\
- [\`$COMMIT_SHORT_HASH\`] $COMMIT_SUMMARY ($TIMESTAMP)
" "$TICKET_FILE"
    else
        # Create commits section
        cat >> "$TICKET_FILE" << EOF

## Implementation Tracking

### Commits
- [\`$COMMIT_SHORT_HASH\`] $COMMIT_SUMMARY ($TIMESTAMP)

EOF
    fi

    echo "✅ Updated ticket file with commit information"
fi
'

## Log Commit to Audit Trail

!bash -c '
source /tmp/claudia_commit_context
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)

# Ensure data directory exists
mkdir -p .claude-shared/project-management/data

# Log commit with full traceability
echo "{\"timestamp\":\"$TIMESTAMP\",\"action\":\"commit\",\"issue_number\":$ISSUE_NUMBER,\"commit_hash\":\"$COMMIT_HASH\",\"short_hash\":\"$COMMIT_SHORT_HASH\",\"message\":\"$COMMIT_SUMMARY\",\"type\":\"$COMMIT_TYPE\",\"scope\":\"$SCOPE\",\"files_changed\":$FILES_CHANGED,\"additions\":$ADDITIONS,\"deletions\":$DELETIONS,\"branch\":\"$TARGET_BRANCH\"}" >> .claude-shared/project-management/data/commits-log.jsonl

echo "📊 Logged commit to audit trail"
'

## Summary and Next Steps

!bash -c '
source /tmp/claudia_commit_context

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ COMMIT COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Commit Details:"
echo "   Hash: $COMMIT_SHORT_HASH"
echo "   Type: $COMMIT_TYPE"
echo "   Issue: #$ISSUE_NUMBER - $ISSUE_TITLE"
echo "   Branch: $TARGET_BRANCH"
echo "   Changes: $FILES_CHANGED files (+$ADDITIONS/-$DELETIONS lines)"
echo ""
echo "🔗 GitHub Issue: https://github.com/$(git remote get-url origin | sed "s/.*github.com[:/]\(.*\)\.git/\1/")/issues/$ISSUE_NUMBER"
echo ""
echo "📋 Next Steps:"
echo "   1. Continue development: /claudia:commit \"$ISSUE_NUMBER\" \"description\""
echo "   2. Push changes: git push -u origin $TARGET_BRANCH"
echo "   3. Create PR: /claudia:pr:create \"$ISSUE_NUMBER\""
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
'

## Cleanup

!bash -c 'rm -f /tmp/claudia_commit_context'

!echo "✅ Commit workflow completed successfully"
