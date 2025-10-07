---
description: "Interactive guided code review process with step-by-step evaluation"
allowed-tools: ["Read", "Write", "Edit", "Bash"]
---

# 👤 Interactive Code Review Process

Provides a guided, interactive code review process with step-by-step evaluation and feedback collection.

## Processing Interactive Review: $ARGUMENTS

!bash -c 'echo "👤 Starting interactive review for PR: $ARGUMENTS"'

## Parse and Validate PR Number

!bash -c '
PR_NUMBER=$(echo "$ARGUMENTS" | sed "s/[\"#]//g")

if ! [[ "$PR_NUMBER" =~ ^[0-9]+$ ]]; then
    echo "❌ ERROR: Invalid PR number format. Use: /claudia:review:interactive \"21\""
    exit 1
fi

echo "✅ Processing Interactive Review for PR #$PR_NUMBER"
echo "PR_NUMBER=$PR_NUMBER" > /tmp/claudia_interactive_context
echo "INTERACTIVE_ID=interactive-$(date +%s)-$PR_NUMBER" >> /tmp/claudia_interactive_context
'

## Validate GitHub CLI Setup

!bash -c '
source /tmp/claudia_interactive_context

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

## Initialize Interactive Session

!bash -c '
source /tmp/claudia_interactive_context

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
REVIEWER=$(gh api user --jq .login)

echo "TIMESTAMP=$TIMESTAMP" >> /tmp/claudia_interactive_context
echo "REVIEWER=$REVIEWER" >> /tmp/claudia_interactive_context

echo "👤 Interactive Review Session:"
echo "   🆔 Session ID: $INTERACTIVE_ID"
echo "   👥 Reviewer: $REVIEWER"
echo "   🕒 Started: $TIMESTAMP"
'

## Load PR Information

!bash -c '
source /tmp/claudia_interactive_context

echo "📥 Loading PR information..."

# Get PR details
PR_INFO=$(gh pr view $PR_NUMBER --json number,title,author,headRefName,baseRefName,state,isDraft,reviewDecision,body,url,files 2>/dev/null)

if [ $? -ne 0 ]; then
    echo "❌ ERROR: Cannot fetch PR #$PR_NUMBER. Check if it exists."
    exit 1
fi

PR_TITLE=$(echo "$PR_INFO" | jq -r ".title")
PR_AUTHOR=$(echo "$PR_INFO" | jq -r ".author.login")
HEAD_BRANCH=$(echo "$PR_INFO" | jq -r ".headRefName")
BASE_BRANCH=$(echo "$PR_INFO" | jq -r ".baseRefName")
PR_STATE=$(echo "$PR_INFO" | jq -r ".state")
PR_BODY=$(echo "$PR_INFO" | jq -r ".body // \"\"")
PR_URL=$(echo "$PR_INFO" | jq -r ".url")

# Store context
echo "PR_TITLE=$PR_TITLE" >> /tmp/claudia_interactive_context
echo "PR_AUTHOR=$PR_AUTHOR" >> /tmp/claudia_interactive_context
echo "HEAD_BRANCH=$HEAD_BRANCH" >> /tmp/claudia_interactive_context
echo "BASE_BRANCH=$BASE_BRANCH" >> /tmp/claudia_interactive_context
echo "PR_STATE=$PR_STATE" >> /tmp/claudia_interactive_context
echo "PR_URL=$PR_URL" >> /tmp/claudia_interactive_context

echo ""
echo "📋 PR Overview:"
echo "   🔢 Number: #$PR_NUMBER"
echo "   📝 Title: $PR_TITLE"
echo "   👤 Author: $PR_AUTHOR"
echo "   🌿 Branch: $HEAD_BRANCH → $BASE_BRANCH"
echo "   🔗 URL: $PR_URL"
'

## Display PR Description

!bash -c '
source /tmp/claudia_interactive_context

echo ""
echo "📖 PR Description:"
echo "=================="

if [ -n "$PR_BODY" ] && [ "$PR_BODY" != "null" ]; then
    echo "$PR_BODY" | head -20  # Show first 20 lines
    LINE_COUNT=$(echo "$PR_BODY" | wc -l | xargs)
    if [ "$LINE_COUNT" -gt 20 ]; then
        echo ""
        echo "... (${LINE_COUNT} total lines, showing first 20)"
    fi
else
    echo "No description provided"
fi

echo ""
echo "❓ Review Question 1: Description Clarity"
echo "========================================="
echo "Is the PR description clear and comprehensive?"
echo ""
echo "Options:"
echo "  1) ✅ Clear and comprehensive"
echo "  2) ⚠️  Needs improvement"
echo "  3) ❌ Insufficient description"
echo ""
echo -n "Your choice (1-3): "

read DESCRIPTION_SCORE
case "$DESCRIPTION_SCORE" in
    1) DESCRIPTION_RESULT="clear" ;;
    2) DESCRIPTION_RESULT="needs_improvement" ;;
    3) DESCRIPTION_RESULT="insufficient" ;;
    *) DESCRIPTION_RESULT="skipped" ;;
esac

echo "DESCRIPTION_RESULT=$DESCRIPTION_RESULT" >> /tmp/claudia_interactive_context
echo "✅ Description review recorded: $DESCRIPTION_RESULT"
'

## Show Changed Files

!bash -c '
source /tmp/claudia_interactive_context

echo ""
echo "📁 Changed Files Analysis"
echo "========================"

CHANGED_FILES=$(gh pr view $PR_NUMBER --json files --jq ".files[].path")
FILE_COUNT=$(echo "$CHANGED_FILES" | wc -l | xargs)

echo "📊 Files changed: $FILE_COUNT"
echo ""

if [ "$FILE_COUNT" -gt 0 ]; then
    echo "📂 File List:"
    echo "$CHANGED_FILES" | head -10 | while IFS= read -r file; do
        if [ -n "$file" ]; then
            # Get file extension for icon
            case "$file" in
                *.js|*.jsx) echo "   🟨 $file" ;;
                *.ts|*.tsx) echo "   🔷 $file" ;;
                *.css|*.scss) echo "   🎨 $file" ;;
                *.json) echo "   📄 $file" ;;
                *.md) echo "   📝 $file" ;;
                *test*|*spec*) echo "   🧪 $file" ;;
                *) echo "   📄 $file" ;;
            esac
        fi
    done

    if [ "$FILE_COUNT" -gt 10 ]; then
        echo "   ... and $((FILE_COUNT - 10)) more files"
    fi
fi

echo ""
echo "❓ Review Question 2: File Scope"
echo "==============================="
echo "Is the scope of file changes appropriate for this PR?"
echo ""
echo "Options:"
echo "  1) ✅ Appropriate scope"
echo "  2) ⚠️  Slightly too broad"
echo "  3) ❌ Too many unrelated changes"
echo ""
echo -n "Your choice (1-3): "

read SCOPE_SCORE
case "$SCOPE_SCORE" in
    1) SCOPE_RESULT="appropriate" ;;
    2) SCOPE_RESULT="broad" ;;
    3) SCOPE_RESULT="too_broad" ;;
    *) SCOPE_RESULT="skipped" ;;
esac

echo "SCOPE_RESULT=$SCOPE_RESULT" >> /tmp/claudia_interactive_context
echo "FILE_COUNT=$FILE_COUNT" >> /tmp/claudia_interactive_context
echo "✅ File scope review recorded: $SCOPE_RESULT"
'

## Code Quality Interactive Review

!bash -c '
source /tmp/claudia_interactive_context

echo ""
echo "🔍 Code Quality Review"
echo "====================="

echo "Opening PR diff for review..."
echo "🔗 View changes at: $PR_URL/files"
echo ""
echo "Please review the code changes and answer the following questions:"
echo ""

# Show a sample of the diff
SAMPLE_DIFF=$(gh pr diff $PR_NUMBER 2>/dev/null | head -30)
if [ -n "$SAMPLE_DIFF" ]; then
    echo "📋 Sample Changes Preview:"
    echo "-------------------------"
    echo "$SAMPLE_DIFF"
    echo "-------------------------"
    echo ""
fi

echo "❓ Review Question 3: Code Quality"
echo "================================="
echo "Rate the overall code quality of the changes:"
echo ""
echo "Options:"
echo "  1) 🟢 Excellent (clean, well-structured, follows best practices)"
echo "  2) 🟡 Good (minor issues, generally good practices)"
echo "  3) 🟠 Fair (some issues, needs improvement)"
echo "  4) 🔴 Poor (significant issues, major improvements needed)"
echo ""
echo -n "Your choice (1-4): "

read QUALITY_SCORE
case "$QUALITY_SCORE" in
    1) QUALITY_RESULT="excellent" ;;
    2) QUALITY_RESULT="good" ;;
    3) QUALITY_RESULT="fair" ;;
    4) QUALITY_RESULT="poor" ;;
    *) QUALITY_RESULT="skipped" ;;
esac

echo "QUALITY_RESULT=$QUALITY_RESULT" >> /tmp/claudia_interactive_context
echo "✅ Code quality review recorded: $QUALITY_RESULT"
'

## Security Review

!bash -c '
source /tmp/claudia_interactive_context

echo ""
echo "🛡️  Security Review"
echo "==================="

echo "Please check for the following security considerations:"
echo ""
echo "🔍 Security Checklist:"
echo "  □ No hardcoded secrets, passwords, or API keys"
echo "  □ Proper input validation and sanitization"
echo "  □ No SQL injection vulnerabilities"
echo "  □ No XSS vulnerabilities"
echo "  □ Authentication and authorization handled correctly"
echo "  □ No sensitive data exposed in logs or responses"
echo ""

echo "❓ Review Question 4: Security"
echo "=============================="
echo "Rate the security aspects of this PR:"
echo ""
echo "Options:"
echo "  1) 🟢 Secure (no security issues found)"
echo "  2) 🟡 Minor concerns (small issues that should be addressed)"
echo "  3) 🟠 Moderate risks (security issues need fixing)"
echo "  4) 🔴 High risk (significant security vulnerabilities)"
echo ""
echo -n "Your choice (1-4): "

read SECURITY_SCORE
case "$SECURITY_SCORE" in
    1) SECURITY_RESULT="secure" ;;
    2) SECURITY_RESULT="minor_concerns" ;;
    3) SECURITY_RESULT="moderate_risks" ;;
    4) SECURITY_RESULT="high_risk" ;;
    *) SECURITY_RESULT="skipped" ;;
esac

echo "SECURITY_RESULT=$SECURITY_RESULT" >> /tmp/claudia_interactive_context
echo "✅ Security review recorded: $SECURITY_RESULT"
'

## Testing Review

!bash -c '
source /tmp/claudia_interactive_context

echo ""
echo "🧪 Testing Review"
echo "=================="

# Check for test files
TEST_FILES=$(gh pr view $PR_NUMBER --json files --jq ".files[] | select(.path | test(\"test|spec\")) | .path")
TEST_COUNT=$(echo "$TEST_FILES" | wc -l | xargs)

echo "📊 Test files in this PR: $TEST_COUNT"

if [ "$TEST_COUNT" -gt 0 ]; then
    echo ""
    echo "🧪 Test Files Found:"
    echo "$TEST_FILES" | while IFS= read -r file; do
        if [ -n "$file" ]; then
            echo "   ✅ $file"
        fi
    done
fi

echo ""
echo "❓ Review Question 5: Testing"
echo "============================="
echo "Rate the testing coverage and quality:"
echo ""
echo "Options:"
echo "  1) 🟢 Excellent (comprehensive tests, good coverage)"
echo "  2) 🟡 Good (adequate tests, could be improved)"
echo "  3) 🟠 Fair (minimal tests, needs improvement)"
echo "  4) 🔴 Poor (no tests or inadequate testing)"
echo ""
echo -n "Your choice (1-4): "

read TESTING_SCORE
case "$TESTING_SCORE" in
    1) TESTING_RESULT="excellent" ;;
    2) TESTING_RESULT="good" ;;
    3) TESTING_RESULT="fair" ;;
    4) TESTING_RESULT="poor" ;;
    *) TESTING_RESULT="skipped" ;;
esac

echo "TESTING_RESULT=$TESTING_RESULT" >> /tmp/claudia_interactive_context
echo "TEST_COUNT=$TEST_COUNT" >> /tmp/claudia_interactive_context
echo "✅ Testing review recorded: $TESTING_RESULT"
'

## Final Recommendation

!bash -c '
source /tmp/claudia_interactive_context

echo ""
echo "🎯 Final Review Decision"
echo "========================"

echo "Based on your reviews:"
echo "  📖 Description: $DESCRIPTION_RESULT"
echo "  📁 File Scope: $SCOPE_RESULT"
echo "  🔍 Code Quality: $QUALITY_RESULT"
echo "  🛡️  Security: $SECURITY_RESULT"
echo "  🧪 Testing: $TESTING_RESULT"
echo ""

echo "❓ Final Question: Overall Recommendation"
echo "========================================"
echo "What is your overall recommendation for this PR?"
echo ""
echo "Options:"
echo "  1) ✅ APPROVE (ready to merge)"
echo "  2) 💬 COMMENT (feedback provided, no blocking issues)"
echo "  3) 🔄 REQUEST CHANGES (issues must be fixed before merge)"
echo ""
echo -n "Your choice (1-3): "

read FINAL_DECISION
case "$FINAL_DECISION" in
    1)
        FINAL_RESULT="approve"
        FINAL_ACTION="gh pr review $PR_NUMBER --approve"
        ;;
    2)
        FINAL_RESULT="comment"
        FINAL_ACTION="gh pr review $PR_NUMBER --comment"
        ;;
    3)
        FINAL_RESULT="request_changes"
        FINAL_ACTION="gh pr review $PR_NUMBER --request-changes"
        ;;
    *)
        FINAL_RESULT="skipped"
        FINAL_ACTION="# Review skipped"
        ;;
esac

echo "FINAL_RESULT=$FINAL_RESULT" >> /tmp/claudia_interactive_context
echo "FINAL_ACTION=$FINAL_ACTION" >> /tmp/claudia_interactive_context
echo "✅ Final decision recorded: $FINAL_RESULT"
'

## Collect Review Comments

!bash -c '
source /tmp/claudia_interactive_context

if [ "$FINAL_RESULT" != "approve" ] && [ "$FINAL_RESULT" != "skipped" ]; then
    echo ""
    echo "💬 Review Comments"
    echo "=================="
    echo "Please provide detailed feedback (press Enter twice to finish):"
    echo ""

    REVIEW_COMMENTS=""
    while IFS= read -r line; do
        if [ -z "$line" ] && [ -z "$REVIEW_COMMENTS" ]; then
            continue
        fi
        if [ -z "$line" ]; then
            break
        fi
        REVIEW_COMMENTS="$REVIEW_COMMENTS$line"$'\n'
    done

    if [ -n "$REVIEW_COMMENTS" ]; then
        echo "✅ Review comments collected"
        echo "$REVIEW_COMMENTS" > "/tmp/claudia_review_comments_${PR_NUMBER}.txt"
    else
        echo "ℹ️  No additional comments provided"
    fi
fi
'

## Generate Interactive Review Report

!bash -c '
source /tmp/claudia_interactive_context

echo ""
echo "📄 Generating interactive review report..."

REPORT_DIR=".claude-shared/project-management/data/reviews"
mkdir -p "$REPORT_DIR"

INTERACTIVE_REPORT="$REPORT_DIR/interactive-$INTERACTIVE_ID.json"

# Create comprehensive interactive review report
cat > "$INTERACTIVE_REPORT" << EOF
{
  "interactive_id": "$INTERACTIVE_ID",
  "pr_number": $PR_NUMBER,
  "pr_title": "$PR_TITLE",
  "pr_author": "$PR_AUTHOR",
  "reviewer": "$REVIEWER",
  "timestamp": "$TIMESTAMP",
  "pr_url": "$PR_URL",
  "review_results": {
    "description": "$DESCRIPTION_RESULT",
    "file_scope": "$SCOPE_RESULT",
    "code_quality": "$QUALITY_RESULT",
    "security": "$SECURITY_RESULT",
    "testing": "$TESTING_RESULT"
  },
  "final_decision": "$FINAL_RESULT",
  "file_count": $FILE_COUNT,
  "test_count": $TEST_COUNT,
  "github_action": "$FINAL_ACTION",
  "review_type": "interactive"
}
EOF

echo "INTERACTIVE_REPORT=$INTERACTIVE_REPORT" >> /tmp/claudia_interactive_context
echo "✅ Interactive review report generated: $INTERACTIVE_REPORT"
'

## Log Interactive Review Activity

!bash -c '
source /tmp/claudia_interactive_context

echo "📊 Logging interactive review activity..."
mkdir -p .claude-shared/project-management/data

LOG_ENTRY="{\"timestamp\":\"$TIMESTAMP\",\"action\":\"interactive_review_completed\",\"interactive_id\":\"$INTERACTIVE_ID\",\"pr_number\":$PR_NUMBER,\"reviewer\":\"$REVIEWER\",\"final_decision\":\"$FINAL_RESULT\",\"file_count\":$FILE_COUNT}"

echo "$LOG_ENTRY" >> .claude-shared/project-management/data/github-sync.jsonl

echo "✅ Interactive review activity logged to audit trail"
'

## Display Review Summary and Next Steps

!bash -c '
source /tmp/claudia_interactive_context

echo ""
echo "✨ INTERACTIVE REVIEW COMPLETE"
echo "==============================="
echo ""
echo "📋 Review Session Summary:"
echo "   🆔 Session ID: $INTERACTIVE_ID"
echo "   🔢 PR Number: #$PR_NUMBER"
echo "   👤 Author: $PR_AUTHOR"
echo "   👥 Reviewer: $REVIEWER"
echo "   📁 Files Reviewed: $FILE_COUNT"
echo ""
echo "📊 Review Results:"
echo "   📖 Description: $DESCRIPTION_RESULT"
echo "   📁 File Scope: $SCOPE_RESULT"
echo "   🔍 Code Quality: $QUALITY_RESULT"
echo "   🛡️  Security: $SECURITY_RESULT"
echo "   🧪 Testing: $TESTING_RESULT"
echo ""
echo "🎯 Final Decision: $FINAL_RESULT"
echo ""
echo "🔗 Suggested Next Actions:"

if [ "$FINAL_RESULT" = "approve" ]; then
    echo "   1. Submit GitHub review:"
    echo "      $FINAL_ACTION"
    echo ""
    echo "   2. Merge the PR:"
    echo "      /claudia:pr:merge \"$PR_NUMBER\""
elif [ "$FINAL_RESULT" = "request_changes" ]; then
    echo "   1. Submit change requests:"
    echo "      $FINAL_ACTION --body \"[Your feedback]\""
    echo ""
    echo "   2. Wait for author to address feedback"
    echo "   3. Re-review when changes are made"
elif [ "$FINAL_RESULT" = "comment" ]; then
    echo "   1. Submit review comments:"
    echo "      $FINAL_ACTION --body \"[Your feedback]\""
    echo ""
    echo "   2. Consider approving after author review"
else
    echo "   1. Consider running review again if needed"
    echo "   2. Submit manual review on GitHub"
fi

echo ""
echo "📄 Detailed report: $INTERACTIVE_REPORT"

# Cleanup
rm -f /tmp/claudia_interactive_context
rm -f "/tmp/claudia_review_comments_${PR_NUMBER}.txt"
'