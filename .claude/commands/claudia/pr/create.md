---
description: "Create Pull Request from GitHub issue with automatic branch creation"
allowed-tools: ["Read", "Write", "Edit", "Bash"]
---

# 🚀 Create PR from GitHub Issue

Creates a Pull Request automatically from a GitHub issue with branch creation and proper linking.

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

## Fetch Issue Details

!bash -c '
source /tmp/claudia_pr_context

echo "📥 Fetching issue #$ISSUE_ID details..."
ISSUE_INFO=$(gh issue view $ISSUE_ID --json title,body,state,labels 2>/dev/null)

if [ $? -ne 0 ]; then
    echo "❌ ERROR: Cannot fetch issue #$ISSUE_ID. Check if it exists."
    exit 1
fi

ISSUE_TITLE=$(echo "$ISSUE_INFO" | jq -r ".title")
ISSUE_BODY=$(echo "$ISSUE_INFO" | jq -r ".body")
ISSUE_STATE=$(echo "$ISSUE_INFO" | jq -r ".state")

echo "✅ Issue: $ISSUE_TITLE ($ISSUE_STATE)"

echo "ISSUE_TITLE=$ISSUE_TITLE" >> /tmp/claudia_pr_context
echo "ISSUE_BODY=$ISSUE_BODY" >> /tmp/claudia_pr_context
echo "ISSUE_STATE=$ISSUE_STATE" >> /tmp/claudia_pr_context
'

## Generate Branch Name

!bash -c '
source /tmp/claudia_pr_context

BRANCH_NAME="feature/issue-$ISSUE_ID-$(echo "$ISSUE_TITLE" | tr "[:upper:]" "[:lower:]" | sed "s/[^a-z0-9]/-/g" | sed "s/--*/-/g" | sed "s/^-\|-$//g" | cut -c1-40)"

echo "🌿 Generated branch name: $BRANCH_NAME"
echo "BRANCH_NAME=$BRANCH_NAME" >> /tmp/claudia_pr_context
'

## Check Git Status

!bash -c '
source /tmp/claudia_pr_context

if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "⚠️  You have uncommitted changes. Please commit them first:"
    echo "   Run: /claudia:commit \"$ISSUE_ID\""
    exit 1
fi

echo "✅ Git status clean"
'

## Create Feature Branch

!bash -c '
source /tmp/claudia_pr_context

echo "🌿 Creating feature branch: $BRANCH_NAME"

if git show-ref --quiet refs/heads/$BRANCH_NAME; then
    echo "📍 Branch exists, switching to it"
    git checkout $BRANCH_NAME
else
    echo "🆕 Creating new branch"
    git checkout -b $BRANCH_NAME
fi

if [ $? -eq 0 ]; then
    echo "✅ Branch ready: $BRANCH_NAME"
else
    echo "❌ Failed to create/switch to branch"
    exit 1
fi
'

## Push Branch to Remote

!bash -c '
source /tmp/claudia_pr_context

echo "📤 Pushing branch to remote..."
git push -u origin $BRANCH_NAME

if [ $? -eq 0 ]; then
    echo "✅ Branch pushed to remote"
else
    echo "❌ Failed to push branch"
    exit 1
fi
'

## Create Pull Request

!bash -c '
source /tmp/claudia_pr_context

echo "🚀 Creating Pull Request..."

# Create the PR using GitHub CLI with heredoc
cat << EOF | gh pr create --title "$ISSUE_TITLE" --body-file - --head "$BRANCH_NAME" --base "main"
## 🎯 Overview

This PR implements: $ISSUE_TITLE

## 📋 Issue Details
- **Issue:** #$ISSUE_ID
- **Status:** $ISSUE_STATE
- **Branch:** \`$BRANCH_NAME\`

## 📖 Description
$ISSUE_BODY

## ✅ Checklist
- [ ] Implementation complete
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Code review completed

---
🤖 Auto-generated from issue #$ISSUE_ID
**Resolves #$ISSUE_ID**
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SUCCESS! Pull Request created"

    # Get PR URL
    PR_URL=$(gh pr view --json url --jq .url)
    echo "🔗 View PR: $PR_URL"
    echo "📝 Issue #$ISSUE_ID linked to PR"
    echo "🌿 Branch: $BRANCH_NAME"

    echo "PR_URL=$PR_URL" >> /tmp/claudia_pr_context
else
    echo "❌ Failed to create PR"
    exit 1
fi
'

## Log PR Creation

!bash -c '
source /tmp/claudia_pr_context

echo "📊 Logging PR creation..."
mkdir -p .claude-shared/project-management/data

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
LOG_ENTRY="{\"timestamp\":\"$TIMESTAMP\",\"action\":\"pr_created\",\"issue_id\":$ISSUE_ID,\"branch\":\"$BRANCH_NAME\",\"title\":\"$ISSUE_TITLE\",\"pr_url\":\"$PR_URL\"}"

echo "$LOG_ENTRY" >> .claude-shared/project-management/data/github-sync.jsonl

echo "✅ PR creation logged to audit trail"
'

## Summary

!bash -c '
source /tmp/claudia_pr_context

echo ""
echo "✨ PULL REQUEST CREATION COMPLETE"
echo "================================="
echo ""
echo "📋 Summary:"
echo "   ✅ Issue #$ISSUE_ID processed"
echo "   ✅ Branch $BRANCH_NAME created"
echo "   ✅ Pull request created successfully"
echo "   ✅ Issue linked with Resolves #$ISSUE_ID"
echo "   ✅ Audit trail updated"
echo ""
echo "🔗 Next steps:"
echo "   1. Review PR: $PR_URL"
echo "   2. Update PR description if needed"
echo "   3. Request reviews"
echo "   4. Merge when ready"

rm -f /tmp/claudia_pr_context
'