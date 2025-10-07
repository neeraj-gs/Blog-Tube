---
description: "Start comprehensive code review process for a Pull Request"
allowed-tools: ["Read", "Write", "Edit", "Bash"]
---

# 🔍 Start Code Review Process

Initiates a comprehensive code review process for the specified Pull Request with automated analysis and structured feedback.

## Processing Code Review Start: $ARGUMENTS

!bash -c 'echo "🔍 Starting code review for PR: $ARGUMENTS"'

## Parse and Validate PR Number

!bash -c '
PR_NUMBER=$(echo "$ARGUMENTS" | sed "s/[\"#]//g")

if ! [[ "$PR_NUMBER" =~ ^[0-9]+$ ]]; then
    echo "❌ ERROR: Invalid PR number format. Use: /claudia:review:start \"21\""
    exit 1
fi

echo "✅ Processing Code Review for PR #$PR_NUMBER"
echo "PR_NUMBER=$PR_NUMBER" > /tmp/claudia_review_context
echo "REVIEW_ID=review-$(date +%s)-$PR_NUMBER" >> /tmp/claudia_review_context
'

## Validate GitHub CLI Setup

!bash -c '
source /tmp/claudia_review_context

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

## Initialize Review Session

!bash -c '
source /tmp/claudia_review_context

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
REVIEWER=$(gh api user --jq .login)

echo "TIMESTAMP=$TIMESTAMP" >> /tmp/claudia_review_context
echo "REVIEWER=$REVIEWER" >> /tmp/claudia_review_context

echo "📊 Review Session Initialized:"
echo "   🆔 Review ID: $REVIEW_ID"
echo "   👤 Reviewer: $REVIEWER"
echo "   🕒 Started: $TIMESTAMP"
'

## Fetch PR Details and Changes

!bash -c '
source /tmp/claudia_review_context

echo "📥 Fetching PR #$PR_NUMBER details and changes..."

# Get PR information
PR_INFO=$(gh pr view $PR_NUMBER --json number,title,author,headRefName,baseRefName,state,isDraft,reviewDecision,mergeable,body,labels,url 2>/dev/null)

if [ $? -ne 0 ]; then
    echo "❌ ERROR: Cannot fetch PR #$PR_NUMBER. Check if it exists."
    exit 1
fi

# Get PR diff
PR_DIFF=$(gh pr diff $PR_NUMBER 2>/dev/null)
if [ $? -ne 0 ]; then
    echo "⚠️  Warning: Could not fetch PR diff"
    PR_DIFF="Diff unavailable"
fi

# Extract PR details
PR_TITLE=$(echo "$PR_INFO" | jq -r ".title")
PR_AUTHOR=$(echo "$PR_INFO" | jq -r ".author.login")
HEAD_BRANCH=$(echo "$PR_INFO" | jq -r ".headRefName")
BASE_BRANCH=$(echo "$PR_INFO" | jq -r ".baseRefName")
PR_STATE=$(echo "$PR_INFO" | jq -r ".state")
IS_DRAFT=$(echo "$PR_INFO" | jq -r ".isDraft")
REVIEW_DECISION=$(echo "$PR_INFO" | jq -r ".reviewDecision // \"PENDING\"")
MERGEABLE=$(echo "$PR_INFO" | jq -r ".mergeable")
PR_BODY=$(echo "$PR_INFO" | jq -r ".body // \"\"")
PR_URL=$(echo "$PR_INFO" | jq -r ".url")

# Store PR context
echo "PR_TITLE=$PR_TITLE" >> /tmp/claudia_review_context
echo "PR_AUTHOR=$PR_AUTHOR" >> /tmp/claudia_review_context
echo "HEAD_BRANCH=$HEAD_BRANCH" >> /tmp/claudia_review_context
echo "BASE_BRANCH=$BASE_BRANCH" >> /tmp/claudia_review_context
echo "PR_STATE=$PR_STATE" >> /tmp/claudia_review_context
echo "IS_DRAFT=$IS_DRAFT" >> /tmp/claudia_review_context
echo "REVIEW_DECISION=$REVIEW_DECISION" >> /tmp/claudia_review_context
echo "MERGEABLE=$MERGEABLE" >> /tmp/claudia_review_context
echo "PR_URL=$PR_URL" >> /tmp/claudia_review_context

# Save diff for analysis
mkdir -p /tmp/claudia_review_data
echo "$PR_DIFF" > "/tmp/claudia_review_data/pr-${PR_NUMBER}-diff.txt"
echo "$PR_BODY" > "/tmp/claudia_review_data/pr-${PR_NUMBER}-description.txt"

echo "✅ PR Details Retrieved:"
echo "   📝 Title: $PR_TITLE"
echo "   👤 Author: $PR_AUTHOR"
echo "   🌿 Branch: $HEAD_BRANCH → $BASE_BRANCH"
echo "   📊 State: $PR_STATE ($REVIEW_DECISION)"
'

## Analyze Changed Files

!bash -c '
source /tmp/claudia_review_context

echo "📁 Analyzing changed files..."

# Get list of changed files
CHANGED_FILES=$(gh pr view $PR_NUMBER --json files --jq ".files[].path")
FILE_COUNT=$(echo "$CHANGED_FILES" | wc -l | xargs)

if [ -z "$CHANGED_FILES" ]; then
    FILE_COUNT=0
fi

echo "CHANGED_FILES<<EOF" >> /tmp/claudia_review_context
echo "$CHANGED_FILES" >> /tmp/claudia_review_context
echo "EOF" >> /tmp/claudia_review_context
echo "FILE_COUNT=$FILE_COUNT" >> /tmp/claudia_review_context

if [ "$FILE_COUNT" -gt 0 ]; then
    echo "📊 Files Changed: $FILE_COUNT"
    echo ""
    echo "📂 Changed Files List:"

    echo "$CHANGED_FILES" | while IFS= read -r file; do
        if [ -n "$file" ]; then
            echo "   📄 $file"
        fi
    done

    # Categorize files by type
    JS_FILES=$(echo "$CHANGED_FILES" | grep -E "\.(js|jsx|ts|tsx)$" | wc -l | xargs)
    CSS_FILES=$(echo "$CHANGED_FILES" | grep -E "\.(css|scss|sass)$" | wc -l | xargs)
    TEST_FILES=$(echo "$CHANGED_FILES" | grep -E "test|spec" | wc -l | xargs)
    CONFIG_FILES=$(echo "$CHANGED_FILES" | grep -E "\.(json|yml|yaml|env|config)$" | wc -l | xargs)

    echo ""
    echo "📊 File Type Analysis:"
    [ "$JS_FILES" -gt 0 ] && echo "   🔧 JavaScript/TypeScript: $JS_FILES files"
    [ "$CSS_FILES" -gt 0 ] && echo "   🎨 Styling: $CSS_FILES files"
    [ "$TEST_FILES" -gt 0 ] && echo "   🧪 Tests: $TEST_FILES files"
    [ "$CONFIG_FILES" -gt 0 ] && echo "   ⚙️  Configuration: $CONFIG_FILES files"
else
    echo "⚠️  No files changed in this PR"
fi
'

## Generate Review Checklist

!bash -c '
source /tmp/claudia_review_context

echo ""
echo "📋 REVIEW CHECKLIST GENERATED"
echo "============================="
echo ""
echo "🔍 Code Quality Review:"
echo "   □ Code follows project coding standards"
echo "   □ Functions and variables have meaningful names"
echo "   □ Code is properly commented where necessary"
echo "   □ No code smells or anti-patterns detected"
echo "   □ Error handling is appropriate and comprehensive"
echo ""
echo "🏗️  Architecture Review:"
echo "   □ Changes align with existing architecture"
echo "   □ No unnecessary complexity introduced"
echo "   □ Proper separation of concerns maintained"
echo "   □ Dependencies are justified and minimal"
echo ""
echo "🛡️  Security Review:"
echo "   □ No sensitive data exposed (keys, passwords, tokens)"
echo "   □ Input validation and sanitization implemented"
echo "   □ Authentication and authorization properly handled"
echo "   □ No SQL injection or XSS vulnerabilities"
echo ""
echo "🧪 Testing Review:"
echo "   □ New functionality has appropriate tests"
echo "   □ Existing tests still pass"
echo "   □ Edge cases are covered in tests"
echo "   □ Test coverage is adequate"
echo ""
echo "📚 Documentation Review:"
echo "   □ Code changes are documented"
echo "   □ README updated if necessary"
echo "   □ API documentation updated if applicable"
echo "   □ Breaking changes clearly documented"
'

## Create Review Report

!bash -c '
source /tmp/claudia_review_context

echo ""
echo "📄 Creating detailed review report..."

REPORT_DIR=".claude-shared/project-management/data/reviews"
mkdir -p "$REPORT_DIR"

REPORT_FILE="$REPORT_DIR/review-$REVIEW_ID.json"

# Create comprehensive review report
cat > "$REPORT_FILE" << EOF
{
  "review_id": "$REVIEW_ID",
  "pr_number": $PR_NUMBER,
  "pr_title": "$PR_TITLE",
  "pr_author": "$PR_AUTHOR",
  "reviewer": "$REVIEWER",
  "timestamp": "$TIMESTAMP",
  "pr_url": "$PR_URL",
  "branch_info": {
    "head": "$HEAD_BRANCH",
    "base": "$BASE_BRANCH"
  },
  "pr_status": {
    "state": "$PR_STATE",
    "is_draft": $IS_DRAFT,
    "review_decision": "$REVIEW_DECISION",
    "mergeable": "$MERGEABLE"
  },
  "files_analysis": {
    "total_files": $FILE_COUNT,
    "changed_files": $(echo "$CHANGED_FILES" | jq -R . | jq -s .)
  },
  "review_status": "started",
  "checklist": {
    "code_quality": "pending",
    "architecture": "pending",
    "security": "pending",
    "testing": "pending",
    "documentation": "pending"
  },
  "next_actions": [
    "Run automated analysis with /claudia:review:analyze $PR_NUMBER",
    "Perform interactive review with /claudia:review:interactive $PR_NUMBER",
    "Submit review feedback on GitHub"
  ]
}
EOF

echo "REPORT_FILE=$REPORT_FILE" >> /tmp/claudia_review_context
echo "✅ Review report created: $REPORT_FILE"
'

## Log Review Start

!bash -c '
source /tmp/claudia_review_context

echo "📊 Logging review start activity..."
mkdir -p .claude-shared/project-management/data

LOG_ENTRY="{\"timestamp\":\"$TIMESTAMP\",\"action\":\"review_started\",\"review_id\":\"$REVIEW_ID\",\"pr_number\":$PR_NUMBER,\"reviewer\":\"$REVIEWER\",\"pr_title\":\"$PR_TITLE\",\"pr_author\":\"$PR_AUTHOR\",\"file_count\":$FILE_COUNT}"

echo "$LOG_ENTRY" >> .claude-shared/project-management/data/github-sync.jsonl

echo "✅ Review activity logged to audit trail"
'

## Display Next Steps

!bash -c '
source /tmp/claudia_review_context

echo ""
echo "✨ CODE REVIEW STARTED"
echo "======================"
echo ""
echo "📋 Review Session Details:"
echo "   🆔 Review ID: $REVIEW_ID"
echo "   🔢 PR Number: #$PR_NUMBER"
echo "   📝 Title: $PR_TITLE"
echo "   👤 Author: $PR_AUTHOR"
echo "   👥 Reviewer: $REVIEWER"
echo "   📁 Files Changed: $FILE_COUNT"
echo "   🔗 PR URL: $PR_URL"
echo ""
echo "🔗 Next Steps:"
echo "   1. 🤖 Automated Analysis:"
echo "      /claudia:review:analyze \"$PR_NUMBER\""
echo ""
echo "   2. 👤 Interactive Review:"
echo "      /claudia:review:interactive \"$PR_NUMBER\""
echo ""
echo "   3. 🔍 Manual Review Options:"
echo "      gh pr checkout $PR_NUMBER  # Checkout PR locally"
echo "      gh pr view $PR_NUMBER      # View PR details"
echo "      gh pr diff $PR_NUMBER      # View changes"
echo ""
echo "📄 Review report saved: $REPORT_FILE"

rm -f /tmp/claudia_review_context
'