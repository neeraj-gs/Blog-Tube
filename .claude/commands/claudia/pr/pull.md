---
description: "List all open pull requests with detailed information"
allowed-tools: ["Read", "Write", "Edit", "Bash"]
---

# 📋 List Open PRs

!bash -c '
# Validate GitHub CLI
if ! command -v gh &> /dev/null || ! gh auth status > /dev/null 2>&1; then
    echo "❌ ERROR: GitHub CLI not installed or not authenticated"
    exit 1
fi

# Fetch and display PRs directly
PRS=$(gh pr list --state open --json number,title,headRefName,baseRefName,author,createdAt,reviewDecision,mergeable,isDraft,url --limit 20)
PR_COUNT=$(echo "$PRS" | jq length)

if [ "$PR_COUNT" -eq 0 ]; then
    echo "✨ No open pull requests found"
    exit 0
fi

echo "📋 OPEN PULL REQUESTS ($PR_COUNT)"
echo "================================"
echo ""

# Display each PR
for i in $(seq 0 $((PR_COUNT - 1))); do
    NUMBER=$(echo "$PRS" | jq -r ".[$i].number")
    TITLE=$(echo "$PRS" | jq -r ".[$i].title")
    AUTHOR=$(echo "$PRS" | jq -r ".[$i].author.login")
    HEAD_BRANCH=$(echo "$PRS" | jq -r ".[$i].headRefName")
    BASE_BRANCH=$(echo "$PRS" | jq -r ".[$i].baseRefName")
    CREATED=$(echo "$PRS" | jq -r ".[$i].createdAt" | cut -d"T" -f1)
    URL=$(echo "$PRS" | jq -r ".[$i].url")
    IS_DRAFT=$(echo "$PRS" | jq -r ".[$i].isDraft")
    REVIEW_DECISION=$(echo "$PRS" | jq -r ".[$i].reviewDecision // \"PENDING\"")
    MERGEABLE=$(echo "$PRS" | jq -r ".[$i].mergeable // \"UNKNOWN\"")

    # Status indicators
    DRAFT=""
    [ "$IS_DRAFT" = "true" ] && DRAFT=" [DRAFT]"

    REVIEW=""
    case "$REVIEW_DECISION" in
        "APPROVED") REVIEW=" ✅" ;;
        "CHANGES_REQUESTED") REVIEW=" 🔄" ;;
        "REVIEW_REQUIRED") REVIEW=" 👀" ;;
        *) REVIEW=" ⏳" ;;
    esac

    MERGE=""
    case "$MERGEABLE" in
        "MERGEABLE") MERGE=" 🟢" ;;
        "CONFLICTING") MERGE=" 🔴" ;;
        *) MERGE=" 🟡" ;;
    esac

    echo "PR #$NUMBER - \"$TITLE\"$DRAFT$REVIEW$MERGE"
    echo "  Branch: $HEAD_BRANCH → $BASE_BRANCH"
    echo "  Author: $AUTHOR | Created: $CREATED"
    echo "  URL: $URL"
    echo ""
done

echo "Actions: /claudia:review:start <pr-number> | /claudia:pr:merge <pr-number>"
'