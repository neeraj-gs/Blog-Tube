---
description: "Create Pull Request from GitHub issue with commit history"
allowed-tools: ["Read", "Write", "Edit", "Bash"]
---

# 🚀 Create PR from GitHub Issue

Creates a Pull Request from an existing issue and branch with all commit history and proper linking.

## Processing PR Creation for Issue: $ARGUMENTS

!bash -c 'echo "🚀 Creating Pull Request for GitHub issue: $ARGUMENTS"'

## Parse and Validate Issue ID

!bash -c '
ISSUE_ID=$(echo "$ARGUMENTS" | sed "s/[\"#]//g")

if ! [[ "$ISSUE_ID" =~ ^[0-9]+$ ]]; then
    echo "❌ ERROR: Invalid issue ID format. Use: /claudia:pr:create \"21\""
    exit 1
fi

echo "✅ Processing GitHub Issue #$ISSUE_ID"
echo "ISSUE_ID=$ISSUE_ID" > /tmp/claudia_pr_context
'

## Validate GitHub CLI Setup

!bash -c '
source /tmp/claudia_pr_context

if ! command -v gh &> /dev/null; then
    echo "❌ ERROR: GitHub CLI (gh) not installed. Install from: https://cli.github.com/"
    exit 1
fi

if ! gh auth status > /dev/null 2>&1; then
    echo "❌ ERROR: GitHub CLI not authenticated. Run: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI validated"
'

## Check Current Branch and Commits

!bash -c '
source /tmp/claudia_pr_context

echo ""
echo "📍 Checking current branch and commits..."

CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"

# Check if on correct branch for this issue
if ! echo "$CURRENT_BRANCH" | grep -q "issue-${ISSUE_ID}"; then
    echo "⚠️  Warning: Current branch name does not contain issue-${ISSUE_ID}"
    echo "   Current: $CURRENT_BRANCH"
    echo "   Expected pattern: feature/issue-${ISSUE_ID}-*"
    echo ""
    read -p "Continue anyway? (y/N): " CONTINUE
    if [ "$CONTINUE" != "y" ] && [ "$CONTINUE" != "Y" ]; then
        echo "❌ Aborted"
        exit 1
    fi
fi

# Check if there are commits
COMMIT_COUNT=$(git rev-list --count origin/main..HEAD 2>/dev/null || echo "0")
if [ "$COMMIT_COUNT" = "0" ]; then
    echo "❌ ERROR: No commits found on this branch"
    echo "   Please commit your changes first using: /claudia:commit \"$ISSUE_ID\" \"description\""
    exit 1
fi

echo "✅ Found $COMMIT_COUNT commit(s) ready for PR"

echo "CURRENT_BRANCH=$CURRENT_BRANCH" >> /tmp/claudia_pr_context
echo "COMMIT_COUNT=$COMMIT_COUNT" >> /tmp/claudia_pr_context
'

## Push Branch if Needed

!bash -c '
source /tmp/claudia_pr_context

echo ""
echo "📤 Checking if branch needs to be pushed..."

# Check if branch exists on remote
if git ls-remote --heads origin "$CURRENT_BRANCH" | grep -q "$CURRENT_BRANCH"; then
    echo "📍 Branch exists on remote"

    # Check if local is ahead
    LOCAL_COMMIT=$(git rev-parse HEAD)
    REMOTE_COMMIT=$(git rev-parse origin/$CURRENT_BRANCH 2>/dev/null || echo "none")

    if [ "$LOCAL_COMMIT" != "$REMOTE_COMMIT" ]; then
        echo "📤 Pushing latest commits to remote..."
        git push origin $CURRENT_BRANCH

        if [ $? -ne 0 ]; then
            echo "❌ Failed to push to remote"
            exit 1
        fi
        echo "✅ Branch updated on remote"
    else
        echo "✅ Branch is up to date with remote"
    fi
else
    echo "🆕 Branch not on remote, pushing..."
    git push -u origin $CURRENT_BRANCH

    if [ $? -ne 0 ]; then
        echo "❌ Failed to push branch to remote"
        exit 1
    fi
    echo "✅ Branch pushed to remote"
fi
'

## Fetch Issue Details

!bash -c '
source /tmp/claudia_pr_context

echo ""
echo "📥 Fetching issue #$ISSUE_ID details..."
ISSUE_INFO=$(gh issue view $ISSUE_ID --json title,body,state,labels 2>/dev/null)

if [ $? -ne 0 ]; then
    echo "❌ ERROR: Cannot fetch issue #$ISSUE_ID. Check if it exists."
    exit 1
fi

ISSUE_TITLE=$(echo "$ISSUE_INFO" | jq -r ".title")
ISSUE_BODY=$(echo "$ISSUE_INFO" | jq -r ".body // \"No description provided\"")
ISSUE_STATE=$(echo "$ISSUE_INFO" | jq -r ".state")

echo "✅ Issue: $ISSUE_TITLE ($ISSUE_STATE)"

echo "ISSUE_TITLE=\"$ISSUE_TITLE\"" >> /tmp/claudia_pr_context
cat >> /tmp/claudia_pr_context << EOF
ISSUE_BODY="$ISSUE_BODY"
EOF
echo "ISSUE_STATE=$ISSUE_STATE" >> /tmp/claudia_pr_context
'

## Gather Commit Information

!bash -c '
source /tmp/claudia_pr_context

echo ""
echo "📝 Gathering commit information for PR description..."

# Get all commits on this branch (compared to main)
COMMITS=$(git log origin/main..HEAD --pretty=format:"%h|%s|%an|%ar" 2>/dev/null)

if [ -z "$COMMITS" ]; then
    echo "❌ ERROR: No commits found between main and current branch"
    exit 1
fi

# Format commits for PR body
COMMIT_LIST=""
while IFS="|" read -r hash subject author date; do
    COMMIT_LIST="${COMMIT_LIST}- \`${hash}\` ${subject} (${author}, ${date})\n"
done <<< "$COMMITS"

# Get files changed
FILES_CHANGED=$(git diff --name-status origin/main..HEAD | wc -l | tr -d " ")

# Get line changes
STATS=$(git diff --stat origin/main..HEAD | tail -1)

echo "✅ Collected commit history: $COMMIT_COUNT commits, $FILES_CHANGED files changed"

cat >> /tmp/claudia_pr_context << COMMITEOF
COMMIT_LIST="$COMMIT_LIST"
FILES_CHANGED="$FILES_CHANGED"
STATS="$STATS"
COMMITEOF
'

## Create Pull Request with Commit Details

!bash -c '
source /tmp/claudia_pr_context

echo ""
echo "🚀 Creating Pull Request..."

# Check if PR already exists
EXISTING_PR=$(gh pr list --head "$CURRENT_BRANCH" --json number --jq ".[0].number" 2>/dev/null)

if [ -n "$EXISTING_PR" ] && [ "$EXISTING_PR" != "null" ]; then
    echo "⚠️  PR already exists for this branch: #$EXISTING_PR"
    PR_URL=$(gh pr view $EXISTING_PR --json url --jq .url)
    echo "🔗 Existing PR: $PR_URL"
    echo "PR_URL=$PR_URL" >> /tmp/claudia_pr_context
    echo "PR_NUMBER=$EXISTING_PR" >> /tmp/claudia_pr_context
    exit 0
fi

# Create PR body with commit details
cat > /tmp/pr_body.md << PREOF
## 🎯 Overview

This PR implements: **$ISSUE_TITLE**

## 📋 Issue Details
- **Issue:** #$ISSUE_ID
- **Branch:** \`$CURRENT_BRANCH\`
- **Commits:** $COMMIT_COUNT
- **Files Changed:** $FILES_CHANGED

## 📖 Issue Description

$ISSUE_BODY

## 📝 Commits in this PR

$COMMIT_LIST

## 📊 Changes Summary

\`\`\`
$STATS
\`\`\`

## ✅ Checklist
- [ ] Code reviewed and tested
- [ ] Tests passing
- [ ] Documentation updated (if needed)
- [ ] Ready for review

---
🤖 Generated with [Claude Code](https://claude.com/claude-code)

**Resolves #$ISSUE_ID**
PREOF

# Create the PR
PR_OUTPUT=$(gh pr create --title "$ISSUE_TITLE" --body-file /tmp/pr_body.md --head "$CURRENT_BRANCH" --base "main" 2>&1)
PR_EXIT_CODE=$?

if [ $PR_EXIT_CODE -eq 0 ]; then
    echo ""
    echo "✅ SUCCESS! Pull Request created"

    # Get PR number and URL
    PR_NUMBER=$(echo "$PR_OUTPUT" | grep -o "pull/[0-9]*" | grep -o "[0-9]*" | head -1)
    PR_URL=$(gh pr view $PR_NUMBER --json url --jq .url 2>/dev/null)

    if [ -z "$PR_URL" ]; then
        PR_URL=$(echo "$PR_OUTPUT" | grep -o "https://[^ ]*" | head -1)
    fi

    echo "🔗 View PR: $PR_URL"
    echo "📝 Issue #$ISSUE_ID linked to PR #$PR_NUMBER"
    echo "🌿 Branch: $CURRENT_BRANCH"

    echo "PR_URL=$PR_URL" >> /tmp/claudia_pr_context
    echo "PR_NUMBER=$PR_NUMBER" >> /tmp/claudia_pr_context
else
    echo "❌ Failed to create PR"
    echo "$PR_OUTPUT"
    rm -f /tmp/pr_body.md
    exit 1
fi

rm -f /tmp/pr_body.md
'

## Update Ticket File

!bash -c '
source /tmp/claudia_pr_context

echo ""
echo "📝 Updating ticket file..."

# Look for ticket file
TICKET_FILE=$(find .claude-shared/project-management/5-tickets/ -name "*-issue-${ISSUE_ID}-*.md" 2>/dev/null | head -1)

if [ -z "$TICKET_FILE" ]; then
    echo "ℹ️  No local ticket file found (this is okay)"
else
    echo "📄 Found ticket: $TICKET_FILE"

    # Update ticket with PR information
    if grep -q "### Pull Request" "$TICKET_FILE"; then
        # Update existing PR section
        sed -i "" "s|### Pull Request.*|### Pull Request\n- PR #$PR_NUMBER: $PR_URL|" "$TICKET_FILE"
    else
        # Add PR section to implementation tracking
        if grep -q "## Implementation Tracking" "$TICKET_FILE"; then
            sed -i "" "/## Implementation Tracking/a\\
\\
### Pull Request\\
- PR #$PR_NUMBER: $PR_URL
" "$TICKET_FILE"
        else
            cat >> "$TICKET_FILE" << EOF

## Implementation Tracking

### Pull Request
- PR #$PR_NUMBER: $PR_URL

EOF
        fi
    fi

    echo "✅ Updated ticket file with PR information"
fi
'

## Log PR Creation

!bash -c '
source /tmp/claudia_pr_context

if [ -n "$PR_NUMBER" ]; then
    echo "📊 Logging PR creation..."
    mkdir -p .claude-shared/project-management/data

    TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    LOG_ENTRY="{\"timestamp\":\"$TIMESTAMP\",\"action\":\"pr_created\",\"issue_id\":$ISSUE_ID,\"pr_number\":$PR_NUMBER,\"branch\":\"$CURRENT_BRANCH\",\"title\":\"$ISSUE_TITLE\",\"commits\":$COMMIT_COUNT,\"files_changed\":$FILES_CHANGED,\"pr_url\":\"$PR_URL\"}"

    echo "$LOG_ENTRY" >> .claude-shared/project-management/data/github-sync.jsonl

    echo "✅ PR creation logged to audit trail"
fi
'

## Summary

!bash -c '
source /tmp/claudia_pr_context

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ PULL REQUEST CREATION COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Summary:"
echo "   ✅ Issue: #$ISSUE_ID - $ISSUE_TITLE"
echo "   ✅ Branch: $CURRENT_BRANCH"
echo "   ✅ Pull Request: #$PR_NUMBER"
echo "   ✅ Commits included: $COMMIT_COUNT"
echo "   ✅ Files changed: $FILES_CHANGED"
echo "   ✅ Audit trail updated"
echo ""
echo "🔗 PR URL: $PR_URL"
echo ""
echo "📋 Next steps:"
echo "   1. Review PR description and commits"
echo "   2. Request code review: gh pr review $PR_NUMBER --request @reviewer"
echo "   3. Wait for CI/CD checks to pass"
echo "   4. Merge PR: /claudia:pr:merge \"$PR_NUMBER\""
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

rm -f /tmp/claudia_pr_context
'
