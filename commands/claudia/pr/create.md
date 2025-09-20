---
description: "Create Pull Request for ticket with environment-aware targeting and issue linking (not closing)"
allowed-tools: ["Read", "Write", "Edit", "Bash"]
---

# 🚀 Pull Request Creation

Create a Pull Request for a ticket with proper environment targeting, comprehensive traceability, and GitHub issue linking (without closing the issue).

## Processing PR Creation for Ticket: $ARGUMENTS

!bash -c 'echo "🚀 Creating Pull Request for ticket: $ARGUMENTS"'

## Parse Arguments and Validate

!bash -c '
TICKET_UUID="$ARGUMENTS"

# Clean up ticket UUID (remove quotes if present)
TICKET_UUID=$(echo "$TICKET_UUID" | sed "s/^[\"']//" | sed "s/[\"']$//")

# Validate required parameters
if [ -z "$TICKET_UUID" ]; then
    echo "❌ ERROR: Ticket UUID is required"
    echo "Usage: /claudia:pr:create \"030-01-01-database\""
    echo "       /claudia:pr:create \"030-01-01-database\" --title \"Custom PR title\""
    exit 1
fi

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
echo "TICKET_UUID=$TICKET_UUID" > /tmp/claudia_pr_context
echo "TICKET_PATH=$TICKET_PATH" >> /tmp/claudia_pr_context
'

## Extract Ticket and Environment Information

!bash -c '
source /tmp/claudia_pr_context

echo ""
echo "📊 Extracting ticket and environment information..."

# Extract ticket details
TICKET_TITLE=$(grep "^# " "$TICKET_PATH" | sed "s/^# //" | head -1)
TICKET_TYPE=$(grep "^\*\*Type:\*\*" "$TICKET_PATH" | sed "s/\*\*Type:\*\* //" | head -1)
TARGET_ENV=$(grep "^\*\*Target Environment:\*\*" "$TICKET_PATH" | sed "s/\*\*Target Environment:\*\* //" | head -1)
BRANCH_TYPE=$(grep "^\*\*Branch Type:\*\*" "$TICKET_PATH" | sed "s/\*\*Branch Type:\*\* //" | head -1)
REQ_UUID=$(grep "^\*\*Requirement:\*\*" "$TICKET_PATH" | sed "s/\*\*Requirement:\*\* \`\([^`]*\)\`.*/\1/" | head -1)
SPRINT_NUMBER=$(grep "^\*\*Sprint:\*\*" "$TICKET_PATH" | sed "s/\*\*Sprint:\*\* //" | head -1)
GITHUB_ISSUE=$(grep "^\*\*GitHub Issue:\*\*" "$TICKET_PATH" | sed "s/\*\*GitHub Issue:\*\* #\([0-9]*\).*/\1/" | head -1)

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)

# Determine target branch from environment
if [ "$TARGET_ENV" = "staging" ]; then
    TARGET_BRANCH="staging"
elif [ "$TARGET_ENV" = "dev" ]; then
    TARGET_BRANCH="dev"
else
    echo "❌ ERROR: Invalid target environment: $TARGET_ENV"
    echo "Expected: dev or staging"
    exit 1
fi

echo "📋 Ticket Information:"
echo "- Title: $TICKET_TITLE"
echo "- Type: $TICKET_TYPE"
echo "- Environment: $TARGET_ENV"
echo "- Branch Type: $BRANCH_TYPE"
echo "- Current Branch: $CURRENT_BRANCH"
echo "- Target Branch: $TARGET_BRANCH"
echo "- GitHub Issue: #$GITHUB_ISSUE"
echo "- Sprint: $SPRINT_NUMBER"

# Save context
cat >> /tmp/claudia_pr_context << EOF
TICKET_TITLE="$TICKET_TITLE"
TICKET_TYPE="$TICKET_TYPE"
TARGET_ENV="$TARGET_ENV"
BRANCH_TYPE="$BRANCH_TYPE"
REQ_UUID="$REQ_UUID"
SPRINT_NUMBER="$SPRINT_NUMBER"
GITHUB_ISSUE="$GITHUB_ISSUE"
CURRENT_BRANCH="$CURRENT_BRANCH"
TARGET_BRANCH="$TARGET_BRANCH"
EOF
'

## Validate Branch and Commits

!bash -c '
source /tmp/claudia_pr_context

echo ""
echo "🔍 Validating branch and commits..."

# Check if we are on the right branch
EXPECTED_BRANCH="$BRANCH_TYPE/$TICKET_UUID"
if [ "$CURRENT_BRANCH" != "$EXPECTED_BRANCH" ] && [ "$CURRENT_BRANCH" != "dev" ] && [ "$CURRENT_BRANCH" != "staging" ]; then
    echo "⚠️  WARNING: Current branch ($CURRENT_BRANCH) does not match expected ($EXPECTED_BRANCH)"
    echo "Continue anyway? (y/n)"
    read -r CONTINUE
    if [ "$CONTINUE" != "y" ] && [ "$CONTINUE" != "Y" ]; then
        echo "❌ PR creation cancelled"
        exit 1
    fi
fi

# Check if there are commits to PR
COMMITS_AHEAD=$(git rev-list --count "$TARGET_BRANCH..$CURRENT_BRANCH" 2>/dev/null || echo "0")
if [ "$COMMITS_AHEAD" = "0" ]; then
    echo "❌ ERROR: No commits found ahead of $TARGET_BRANCH branch"
    echo "Make sure you have committed changes on this branch"
    exit 1
fi

echo "✅ Branch validation passed"
echo "- Commits ahead of $TARGET_BRANCH: $COMMITS_AHEAD"

echo "COMMITS_AHEAD=$COMMITS_AHEAD" >> /tmp/claudia_pr_context
'

## Push Branch to Remote

!bash -c '
source /tmp/claudia_pr_context

echo ""
echo "📤 Pushing branch to remote..."

# Push current branch to remote
git push -u origin "$CURRENT_BRANCH" 2>&1

if [ $? -ne 0 ]; then
    echo "❌ ERROR: Failed to push branch to remote"
    exit 1
fi

echo "✅ Branch pushed successfully"
'

## Generate PR Body with Commit List

!bash -c '
source /tmp/claudia_pr_context

echo ""
echo "📝 Generating comprehensive PR body..."

# Get commit list
COMMIT_LIST=$(git log --oneline "$TARGET_BRANCH..$CURRENT_BRANCH" | sed "s/^/- /" | head -20)
FILES_CHANGED=$(git diff --name-only "$TARGET_BRANCH..$CURRENT_BRANCH" | wc -l | tr -d " ")
ADDITIONS=$(git diff --numstat "$TARGET_BRANCH..$CURRENT_BRANCH" | awk "{add += \$1} END {print add+0}")
DELETIONS=$(git diff --numstat "$TARGET_BRANCH..$CURRENT_BRANCH" | awk "{del += \$2} END {print del+0}")

# Determine requirement path (try both formats)
REQ_PATH="docs/4-requirements/$REQ_UUID.md"
if [ ! -f "$REQ_PATH" ] && [ -f "4-requirements/$REQ_UUID.md" ]; then
    REQ_PATH="4-requirements/$REQ_UUID.md"
fi

# Create comprehensive PR body
PR_BODY="## Implementation: $TICKET_TITLE

**Ticket:** \`$TICKET_UUID\`  
**Requirement:** \`$REQ_UUID\`  
**Sprint:** $SPRINT_NUMBER  
**Type:** $TICKET_TYPE  
**Environment:** $TARGET_ENV  
**Branch:** \`$CURRENT_BRANCH\` → \`$TARGET_BRANCH\`

### 📋 Implementation Summary

This PR implements the changes for ticket $TICKET_UUID as part of requirement $REQ_UUID.

### 🔗 Traceability  
- **Sprint Document:** [docs/3-sprints/$SPRINT_NUMBER.md](docs/3-sprints/$SPRINT_NUMBER.md)
- **Requirement Document:** [$REQ_PATH]($REQ_PATH)
- **Ticket Document:** [$TICKET_PATH]($TICKET_PATH)
- **GitHub Issue:** #$GITHUB_ISSUE *(remains open until ticket completion)*

### 📊 Changes Overview
- **Files Changed:** $FILES_CHANGED
- **Lines Added:** $ADDITIONS  
- **Lines Removed:** $DELETIONS
- **Commits:** $COMMITS_AHEAD

### 📝 Commit History
$COMMIT_LIST

### 🧪 Testing Status
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] No regressions introduced

### 📋 Review Checklist
- [ ] Code follows project conventions
- [ ] Security considerations addressed
- [ ] Performance impact assessed
- [ ] Documentation updated if needed
- [ ] Breaking changes documented

### 🔗 Related Work
**Note:** This PR is linked to GitHub Issue #$GITHUB_ISSUE but does **NOT** automatically close it. The issue will remain open until the entire ticket is marked complete using \`/claudia:ticket:complete\`.

Multiple PRs may be created for the same ticket if additional work is needed.

---
*Generated by Claudia Automation System*  
*Sprint $SPRINT_NUMBER → Requirement \`$REQ_UUID\` → Ticket \`$TICKET_UUID\` → PR*"

echo "PR_BODY=\"$PR_BODY\"" >> /tmp/claudia_pr_context
echo "FILES_CHANGED=$FILES_CHANGED" >> /tmp/claudia_pr_context
echo "ADDITIONS=$ADDITIONS" >> /tmp/claudia_pr_context  
echo "DELETIONS=$DELETIONS" >> /tmp/claudia_pr_context
echo "COMMIT_LIST=\"$COMMIT_LIST\"" >> /tmp/claudia_pr_context
'

## Create Pull Request

!bash -c '
source /tmp/claudia_pr_context

echo ""
echo "🚀 Creating Pull Request..."

# Create PR title
PR_TITLE="[$TICKET_UUID] $TICKET_TITLE"

# Write PR body to temp file
echo "$PR_BODY" > /tmp/pr_body.md

# Create PR using GitHub CLI with issue linking (not closing)
PR_OUTPUT=$(gh pr create \
    --title "$PR_TITLE" \
    --body-file /tmp/pr_body.md \
    --base "$TARGET_BRANCH" \
    --head "$CURRENT_BRANCH" \
    --assignee "@me" \
    --label "claudia,automated,$TICKET_TYPE,$TARGET_ENV" 2>&1)

PR_EXIT_CODE=$?

if [ $PR_EXIT_CODE -eq 0 ]; then
    PR_URL=$(echo "$PR_OUTPUT" | grep -o "https://github.com/[^[:space:]]*")
    PR_NUMBER=$(echo "$PR_URL" | grep -o "/[0-9]*$" | sed "s/\///")
    
    echo "✅ Pull Request created successfully"
    echo "📝 PR URL: $PR_URL"
    echo "📝 PR Number: #$PR_NUMBER"
    
    echo "PR_URL=\"$PR_URL\"" >> /tmp/claudia_pr_context
    echo "PR_NUMBER=\"$PR_NUMBER\"" >> /tmp/claudia_pr_context
else
    echo "❌ ERROR: Failed to create Pull Request"
    echo "$PR_OUTPUT"
    exit 1
fi

# Clean up temp file
rm -f /tmp/pr_body.md
'

## Update Ticket with PR Information

!bash -c '
source /tmp/claudia_pr_context

echo ""
echo "📝 Updating ticket with PR information..."

# Update or add PR reference in ticket
if grep -q "**Pull Requests:**" "$TICKET_PATH"; then
    # Add to existing PRs section
    sed -i "/\*\*Pull Requests:\*\*/a - [#$PR_NUMBER]($PR_URL) - Ready for review (\`$CURRENT_BRANCH\` → \`$TARGET_BRANCH\`)" "$TICKET_PATH"
else
    # Create PRs section
    sed -i "s/\*\*Implementation PR:\*\* (Use \/claudia:pr:create to create PR)/\*\*Pull Requests:\*\*\n- [#$PR_NUMBER]($PR_URL) - Ready for review (\`$CURRENT_BRANCH\` → \`$TARGET_BRANCH\`)/" "$TICKET_PATH"
fi

echo "✅ Updated ticket with PR information"
'

## Log PR Creation

!bash -c '
source /tmp/claudia_pr_context
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)

echo ""
echo "📊 Logging PR creation to audit system..."

# Log PR creation
echo "{\"timestamp\":\"$TIMESTAMP\",\"action\":\"pr_created\",\"ticket_uuid\":\"$TICKET_UUID\",\"requirement_uuid\":\"$REQ_UUID\",\"sprint\":\"$SPRINT_NUMBER\",\"pr_number\":$PR_NUMBER,\"pr_url\":\"$PR_URL\",\"target_env\":\"$TARGET_ENV\",\"target_branch\":\"$TARGET_BRANCH\",\"source_branch\":\"$CURRENT_BRANCH\",\"commits_count\":$COMMITS_AHEAD,\"files_changed\":$FILES_CHANGED,\"github_issue\":$GITHUB_ISSUE,\"issue_auto_close\":false}" >> .claude-shared/project-management/data/tickets-log.jsonl

echo "✅ Logged PR creation to audit trail"
'

## Summary and Next Steps

!bash -c '
source /tmp/claudia_pr_context

echo ""
echo "✅ **Pull Request Creation Complete**"
echo ""
echo "**PR Details:**"
echo "- **Number:** #$PR_NUMBER"
echo "- **URL:** $PR_URL"
echo "- **Title:** [$TICKET_UUID] $TICKET_TITLE"
echo "- **Base:** $TARGET_BRANCH ← **Head:** $CURRENT_BRANCH"
echo "- **Environment:** $TARGET_ENV"
echo ""
echo "**Changes Summary:**"
echo "- **Commits:** $COMMITS_AHEAD"
echo "- **Files:** $FILES_CHANGED"
echo "- **Lines:** +$ADDITIONS/-$DELETIONS"
echo ""
echo "**Traceability:**"
echo "- **Sprint:** $SPRINT_NUMBER"
echo "- **Requirement:** \`$REQ_UUID\`"
echo "- **Ticket:** \`$TICKET_UUID\`"
echo "- **GitHub Issue:** #$GITHUB_ISSUE (remains open)"
echo ""
echo "**Important Notes:**"
echo "- 🔗 **GitHub Issue #$GITHUB_ISSUE stays OPEN**"
echo "- 🔄 **Multiple PRs supported** for the same ticket"
echo "- ✅ **Issue closes only when ticket is completed**"
echo "- 📝 **Additional commits can be made** to this ticket"
echo ""
echo "**Next Steps:**"
echo "1. 🔍 **Review PR:** $PR_URL"
echo "2. ✅ **Merge PR** after approval (issue stays open)"
echo "3. 🔄 **Continue work:** /claudia:commit \"$TICKET_UUID\" (if needed)"
echo "4. 🚀 **Create additional PRs:** /claudia:pr:create \"$TICKET_UUID\" (if needed)"
echo "5. ✅ **Complete ticket:** /claudia:ticket:complete \"$TICKET_UUID\" (when fully done)"
echo ""
echo "**Multi-PR Workflow:**"
echo "This workflow supports multiple commits and PRs per ticket, reflecting real development practices where features may need multiple iterations, feedback cycles, or split implementations."
'

## Cleanup

!bash -c 'rm -f /tmp/claudia_pr_context'

!echo "🚀 Pull Request creation workflow completed successfully"
!echo "🔗 Full traceability maintained with issue linking (not closing)"
!echo "📝 Ready for code review - ticket remains active for additional work"