---
description: "Merge Pull Request with repository owner authorization checks"
allowed-tools: ["Read", "Write", "Edit", "Bash"]
---

# 🔀 Merge Pull Request (Repo Owners Only)

Merges a Pull Request after verifying repository owner permissions and performing safety checks.

## Processing PR Merge Request: $ARGUMENTS

!bash -c 'echo "🔀 Processing Pull Request merge: $ARGUMENTS"'

## Parse and Validate PR Number

!bash -c '
PR_NUMBER=$(echo "$ARGUMENTS" | sed "s/[\"#]//g")

if ! [[ "$PR_NUMBER" =~ ^[0-9]+$ ]]; then
    echo "❌ ERROR: Invalid PR number format. Use: /claudia:pr:merge \"21\""
    exit 1
fi

echo "✅ Processing Pull Request #$PR_NUMBER"
echo "PR_NUMBER=$PR_NUMBER" > /tmp/claudia_pr_merge_context
'

## Validate GitHub CLI Setup

!bash -c '
source /tmp/claudia_pr_merge_context

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

## Verify Repository Owner Permissions

!bash -c '
source /tmp/claudia_pr_merge_context

echo "🔐 Checking repository permissions..."

# Get current user
CURRENT_USER=$(gh api user --jq .login)
if [ $? -ne 0 ]; then
    echo "❌ ERROR: Failed to get current user information"
    exit 1
fi

# Get repository information
REPO_INFO=$(gh repo view --json owner,name,permissions)
if [ $? -ne 0 ]; then
    echo "❌ ERROR: Failed to get repository information"
    exit 1
fi

REPO_OWNER=$(echo "$REPO_INFO" | jq -r ".owner.login")
REPO_NAME=$(echo "$REPO_INFO" | jq -r ".name")
USER_PERMISSION=$(echo "$REPO_INFO" | jq -r ".permissions.admin // false")

echo "CURRENT_USER=$CURRENT_USER" >> /tmp/claudia_pr_merge_context
echo "REPO_OWNER=$REPO_OWNER" >> /tmp/claudia_pr_merge_context
echo "REPO_NAME=$REPO_NAME" >> /tmp/claudia_pr_merge_context
echo "USER_PERMISSION=$USER_PERMISSION" >> /tmp/claudia_pr_merge_context

echo "👤 Current User: $CURRENT_USER"
echo "📁 Repository: $REPO_OWNER/$REPO_NAME"
echo "🔑 Admin Permission: $USER_PERMISSION"

# Check if user is repo owner or has admin permissions
if [ "$CURRENT_USER" != "$REPO_OWNER" ] && [ "$USER_PERMISSION" != "true" ]; then
    echo ""
    echo "❌ PERMISSION DENIED"
    echo "==================="
    echo ""
    echo "🚫 Only repository owners can merge pull requests."
    echo ""
    echo "👤 Current User: $CURRENT_USER"
    echo "👑 Repository Owner: $REPO_OWNER"
    echo "🔑 Admin Permission: $USER_PERMISSION"
    echo ""
    echo "💡 Contact $REPO_OWNER to merge this PR, or request admin permissions."
    exit 1
fi

echo "✅ Permission granted - User authorized to merge PRs"
'

## Fetch PR Details

!bash -c '
source /tmp/claudia_pr_merge_context

echo "📥 Fetching PR #$PR_NUMBER details..."

PR_INFO=$(gh pr view $PR_NUMBER --json number,title,state,author,headRefName,baseRefName,mergeable,reviewDecision,isDraft,url,body,labels 2>/dev/null)

if [ $? -ne 0 ]; then
    echo "❌ ERROR: Cannot fetch PR #$PR_NUMBER. Check if it exists."
    exit 1
fi

PR_TITLE=$(echo "$PR_INFO" | jq -r ".title")
PR_STATE=$(echo "$PR_INFO" | jq -r ".state")
PR_AUTHOR=$(echo "$PR_INFO" | jq -r ".author.login")
HEAD_BRANCH=$(echo "$PR_INFO" | jq -r ".headRefName")
BASE_BRANCH=$(echo "$PR_INFO" | jq -r ".baseRefName")
MERGEABLE=$(echo "$PR_INFO" | jq -r ".mergeable")
REVIEW_DECISION=$(echo "$PR_INFO" | jq -r ".reviewDecision // \"PENDING\"")
IS_DRAFT=$(echo "$PR_INFO" | jq -r ".isDraft")
PR_URL=$(echo "$PR_INFO" | jq -r ".url")

echo "PR_TITLE=$PR_TITLE" >> /tmp/claudia_pr_merge_context
echo "PR_STATE=$PR_STATE" >> /tmp/claudia_pr_merge_context
echo "PR_AUTHOR=$PR_AUTHOR" >> /tmp/claudia_pr_merge_context
echo "HEAD_BRANCH=$HEAD_BRANCH" >> /tmp/claudia_pr_merge_context
echo "BASE_BRANCH=$BASE_BRANCH" >> /tmp/claudia_pr_merge_context
echo "MERGEABLE=$MERGEABLE" >> /tmp/claudia_pr_merge_context
echo "REVIEW_DECISION=$REVIEW_DECISION" >> /tmp/claudia_pr_merge_context
echo "IS_DRAFT=$IS_DRAFT" >> /tmp/claudia_pr_merge_context
echo "PR_URL=$PR_URL" >> /tmp/claudia_pr_merge_context

echo "✅ PR Information Retrieved:"
echo "   📝 Title: $PR_TITLE"
echo "   👤 Author: $PR_AUTHOR"
echo "   🌿 Branch: $HEAD_BRANCH → $BASE_BRANCH"
echo "   📊 State: $PR_STATE"
'

## Pre-Merge Safety Checks

!bash -c '
source /tmp/claudia_pr_merge_context

echo "🛡️  Performing pre-merge safety checks..."

SAFETY_ISSUES=""

# Check if PR is open
if [ "$PR_STATE" != "OPEN" ]; then
    SAFETY_ISSUES="$SAFETY_ISSUES\n❌ PR state is \"$PR_STATE\" (must be OPEN)"
fi

# Check if PR is draft
if [ "$IS_DRAFT" = "true" ]; then
    SAFETY_ISSUES="$SAFETY_ISSUES\n❌ PR is marked as DRAFT"
fi

# Check if PR is mergeable
if [ "$MERGEABLE" = "CONFLICTING" ]; then
    SAFETY_ISSUES="$SAFETY_ISSUES\n❌ PR has merge conflicts"
fi

# Check review status (optional warning, not blocking)
REVIEW_WARNING=""
if [ "$REVIEW_DECISION" = "CHANGES_REQUESTED" ]; then
    REVIEW_WARNING="⚠️  Warning: Changes have been requested by reviewers"
elif [ "$REVIEW_DECISION" = "PENDING" ] || [ "$REVIEW_DECISION" = "null" ]; then
    REVIEW_WARNING="⚠️  Warning: No reviews completed yet"
fi

if [ -n "$SAFETY_ISSUES" ]; then
    echo ""
    echo "❌ SAFETY CHECK FAILED"
    echo "====================="
    echo ""
    echo "The following issues prevent merging:"
    echo -e "$SAFETY_ISSUES"
    echo ""
    echo "🔧 Please resolve these issues before merging:"
    echo "   1. Ensure PR is in OPEN state"
    echo "   2. Mark PR as ready for review (not draft)"
    echo "   3. Resolve any merge conflicts"
    exit 1
fi

echo "✅ Safety checks passed"

if [ -n "$REVIEW_WARNING" ]; then
    echo "$REVIEW_WARNING"
fi

echo "REVIEW_WARNING=$REVIEW_WARNING" >> /tmp/claudia_pr_merge_context
'

## Merge Confirmation

!bash -c '
source /tmp/claudia_pr_merge_context

echo ""
echo "🔀 MERGE CONFIRMATION REQUIRED"
echo "=============================="
echo ""
echo "📋 PR Details:"
echo "   🔢 Number: #$PR_NUMBER"
echo "   📝 Title: $PR_TITLE"
echo "   👤 Author: $PR_AUTHOR"
echo "   🌿 Branch: $HEAD_BRANCH → $BASE_BRANCH"
echo "   📊 Review: $REVIEW_DECISION"
echo "   🔗 URL: $PR_URL"

if [ -n "$REVIEW_WARNING" ]; then
    echo ""
    echo "$REVIEW_WARNING"
fi

echo ""
echo "❓ Are you sure you want to merge this PR? (y/N):"

read -r CONFIRM
if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ] && [ "$CONFIRM" != "yes" ] && [ "$CONFIRM" != "Yes" ] && [ "$CONFIRM" != "YES" ]; then
    echo ""
    echo "❌ Merge cancelled by user"
    echo "💡 Run the command again when ready to merge"
    exit 1
fi

echo ""
echo "✅ Merge confirmed by user"
echo "CONFIRMED=true" >> /tmp/claudia_pr_merge_context
'

## Execute PR Merge

!bash -c '
source /tmp/claudia_pr_merge_context

if [ "$CONFIRMED" = "true" ]; then
    echo "🔀 Merging Pull Request #$PR_NUMBER..."

    # Use squash merge by default for cleaner history
    MERGE_RESULT=$(gh pr merge $PR_NUMBER --squash --delete-branch 2>&1)
    MERGE_STATUS=$?

    if [ $MERGE_STATUS -eq 0 ]; then
        echo ""
        echo "✅ MERGE SUCCESSFUL!"
        echo "==================="
        echo ""
        echo "🎉 PR #$PR_NUMBER has been merged successfully"
        echo "🗑️  Branch $HEAD_BRANCH has been deleted"
        echo "🔗 PR URL: $PR_URL"

        # Get the merge commit SHA if possible
        MERGE_SHA=$(git log --oneline -1 --grep="Merge pull request #$PR_NUMBER" --format="%H" 2>/dev/null || echo "unknown")
        echo "MERGE_SHA=$MERGE_SHA" >> /tmp/claudia_pr_merge_context
        echo "MERGE_STATUS=success" >> /tmp/claudia_pr_merge_context
    else
        echo ""
        echo "❌ MERGE FAILED"
        echo "==============="
        echo ""
        echo "Error details:"
        echo "$MERGE_RESULT"
        echo ""
        echo "🔧 Common solutions:"
        echo "   1. Check if PR has merge conflicts"
        echo "   2. Verify branch protection rules"
        echo "   3. Ensure all status checks pass"
        echo "   4. Try manual merge: gh pr checkout $PR_NUMBER && git merge"

        echo "MERGE_STATUS=failed" >> /tmp/claudia_pr_merge_context
        exit 1
    fi
fi
'

## Log Merge Activity

!bash -c '
source /tmp/claudia_pr_merge_context

if [ "$MERGE_STATUS" = "success" ]; then
    echo "📊 Logging merge activity..."
    mkdir -p .claude-shared/project-management/data

    TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    LOG_ENTRY="{\"timestamp\":\"$TIMESTAMP\",\"action\":\"pr_merged\",\"pr_number\":$PR_NUMBER,\"title\":\"$PR_TITLE\",\"author\":\"$PR_AUTHOR\",\"merged_by\":\"$CURRENT_USER\",\"head_branch\":\"$HEAD_BRANCH\",\"base_branch\":\"$BASE_BRANCH\",\"merge_sha\":\"$MERGE_SHA\",\"pr_url\":\"$PR_URL\"}"

    echo "$LOG_ENTRY" >> .claude-shared/project-management/data/github-sync.jsonl

    echo "✅ Merge activity logged to audit trail"
fi
'

## Post-Merge Summary

!bash -c '
source /tmp/claudia_pr_merge_context

if [ "$MERGE_STATUS" = "success" ]; then
    echo ""
    echo "✨ PULL REQUEST MERGE COMPLETE"
    echo "=============================="
    echo ""
    echo "📋 Summary:"
    echo "   ✅ PR #$PR_NUMBER merged successfully"
    echo "   ✅ Branch $HEAD_BRANCH deleted"
    echo "   ✅ Changes merged into $BASE_BRANCH"
    echo "   ✅ Merged by: $CURRENT_USER"
    echo "   ✅ Audit trail updated"
    echo ""
    echo "🔗 Next steps:"
    echo "   1. Pull latest changes: git pull origin $BASE_BRANCH"
    echo "   2. Verify merge in repository"
    echo "   3. Deploy if applicable"
    echo "   4. Close related issues if not auto-closed"

    # Cleanup
    rm -f /tmp/claudia_pr_merge_context
fi
'