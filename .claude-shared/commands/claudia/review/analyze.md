---
description: "Perform automated code analysis on Pull Request changes"
allowed-tools: ["Read", "Write", "Edit", "Bash"]
---

# 🤖 Automated PR Code Analysis

Performs comprehensive automated analysis of Pull Request changes including code quality, security, and architectural assessment.

## Processing Automated Analysis: $ARGUMENTS

!bash -c 'echo "🤖 Starting automated analysis for PR: $ARGUMENTS"'

## Parse and Validate PR Number

!bash -c '
PR_NUMBER=$(echo "$ARGUMENTS" | sed "s/[\"#]//g")

if ! [[ "$PR_NUMBER" =~ ^[0-9]+$ ]]; then
    echo "❌ ERROR: Invalid PR number format. Use: /claudia:review:analyze \"21\""
    exit 1
fi

echo "✅ Processing Analysis for PR #$PR_NUMBER"
echo "PR_NUMBER=$PR_NUMBER" > /tmp/claudia_analysis_context
echo "ANALYSIS_ID=analysis-$(date +%s)-$PR_NUMBER" >> /tmp/claudia_analysis_context
'

## Validate GitHub CLI Setup

!bash -c '
source /tmp/claudia_analysis_context

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

## Initialize Analysis Session

!bash -c '
source /tmp/claudia_analysis_context

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
ANALYZER=$(gh api user --jq .login)

echo "TIMESTAMP=$TIMESTAMP" >> /tmp/claudia_analysis_context
echo "ANALYZER=$ANALYZER" >> /tmp/claudia_analysis_context

echo "🤖 Analysis Session Initialized:"
echo "   🆔 Analysis ID: $ANALYSIS_ID"
echo "   👤 Analyzer: $ANALYZER"
echo "   🕒 Started: $TIMESTAMP"
'

## Fetch PR Data for Analysis

!bash -c '
source /tmp/claudia_analysis_context

echo "📥 Fetching PR data for analysis..."

# Get PR information
PR_INFO=$(gh pr view $PR_NUMBER --json number,title,author,headRefName,baseRefName,files,url 2>/dev/null)

if [ $? -ne 0 ]; then
    echo "❌ ERROR: Cannot fetch PR #$PR_NUMBER. Check if it exists."
    exit 1
fi

PR_TITLE=$(echo "$PR_INFO" | jq -r ".title")
PR_AUTHOR=$(echo "$PR_INFO" | jq -r ".author.login")
HEAD_BRANCH=$(echo "$PR_INFO" | jq -r ".headRefName")
BASE_BRANCH=$(echo "$PR_INFO" | jq -r ".baseRefName")
PR_URL=$(echo "$PR_INFO" | jq -r ".url")

# Get changed files with their patch information
CHANGED_FILES=$(echo "$PR_INFO" | jq -r ".files[].path")
FILE_COUNT=$(echo "$CHANGED_FILES" | wc -l | xargs)

echo "PR_TITLE=$PR_TITLE" >> /tmp/claudia_analysis_context
echo "PR_AUTHOR=$PR_AUTHOR" >> /tmp/claudia_analysis_context
echo "HEAD_BRANCH=$HEAD_BRANCH" >> /tmp/claudia_analysis_context
echo "BASE_BRANCH=$BASE_BRANCH" >> /tmp/claudia_analysis_context
echo "PR_URL=$PR_URL" >> /tmp/claudia_analysis_context
echo "FILE_COUNT=$FILE_COUNT" >> /tmp/claudia_analysis_context

echo "✅ PR Data Retrieved for Analysis"
'

## Analyze File Types and Patterns

!bash -c '
source /tmp/claudia_analysis_context

echo "📊 Analyzing file types and patterns..."

# Categorize files by type and calculate metrics
JS_TS_FILES=$(echo "$CHANGED_FILES" | grep -E "\.(js|jsx|ts|tsx)$" | wc -l | xargs)
STYLE_FILES=$(echo "$CHANGED_FILES" | grep -E "\.(css|scss|sass|less)$" | wc -l | xargs)
TEST_FILES=$(echo "$CHANGED_FILES" | grep -E "(test|spec)\." | wc -l | xargs)
CONFIG_FILES=$(echo "$CHANGED_FILES" | grep -E "\.(json|yml|yaml|xml|env|config)$" | wc -l | xargs)
MARKDOWN_FILES=$(echo "$CHANGED_FILES" | grep -E "\.md$" | wc -l | xargs)
PACKAGE_FILES=$(echo "$CHANGED_FILES" | grep -E "package\.json|package-lock\.json|yarn\.lock" | wc -l | xargs)

# Store metrics
echo "JS_TS_FILES=$JS_TS_FILES" >> /tmp/claudia_analysis_context
echo "STYLE_FILES=$STYLE_FILES" >> /tmp/claudia_analysis_context
echo "TEST_FILES=$TEST_FILES" >> /tmp/claudia_analysis_context
echo "CONFIG_FILES=$CONFIG_FILES" >> /tmp/claudia_analysis_context
echo "MARKDOWN_FILES=$MARKDOWN_FILES" >> /tmp/claudia_analysis_context
echo "PACKAGE_FILES=$PACKAGE_FILES" >> /tmp/claudia_analysis_context

echo "📈 File Analysis Results:"
echo "   📄 Total Files: $FILE_COUNT"
[ "$JS_TS_FILES" -gt 0 ] && echo "   🔧 JavaScript/TypeScript: $JS_TS_FILES"
[ "$STYLE_FILES" -gt 0 ] && echo "   🎨 Styling Files: $STYLE_FILES"
[ "$TEST_FILES" -gt 0 ] && echo "   🧪 Test Files: $TEST_FILES"
[ "$CONFIG_FILES" -gt 0 ] && echo "   ⚙️  Config Files: $CONFIG_FILES"
[ "$MARKDOWN_FILES" -gt 0 ] && echo "   📝 Documentation: $MARKDOWN_FILES"
[ "$PACKAGE_FILES" -gt 0 ] && echo "   📦 Package Files: $PACKAGE_FILES"
'

## Security Analysis

!bash -c '
source /tmp/claudia_analysis_context

echo ""
echo "🛡️  Performing security analysis..."

# Get PR diff for security analysis
PR_DIFF=$(gh pr diff $PR_NUMBER 2>/dev/null || echo "Diff unavailable")

# Security pattern checks
SECURITY_ISSUES=""
SECURITY_WARNINGS=""

# Check for common security issues in the diff
if echo "$PR_DIFF" | grep -q -E "(password|secret|key|token).*=.*['\"]"; then
    SECURITY_ISSUES="$SECURITY_ISSUES\n🚨 Potential hardcoded credentials detected"
fi

if echo "$PR_DIFF" | grep -q -E "console\.(log|debug|info)"; then
    SECURITY_WARNINGS="$SECURITY_WARNINGS\n⚠️  Console logging statements found (consider removing for production)"
fi

if echo "$PR_DIFF" | grep -q -E "eval\(|innerHTML.*="; then
    SECURITY_ISSUES="$SECURITY_ISSUES\n🚨 Potentially dangerous JavaScript patterns (eval, innerHTML)"
fi

if echo "$PR_DIFF" | grep -q -E "process\.env\.[A-Z_]+.*="; then
    SECURITY_WARNINGS="$SECURITY_WARNINGS\n⚠️  Environment variable assignments detected"
fi

# SQL injection checks
if echo "$PR_DIFF" | grep -q -E "SELECT|INSERT|UPDATE|DELETE.*\$\{"; then
    SECURITY_ISSUES="$SECURITY_ISSUES\n🚨 Potential SQL injection vulnerability (string interpolation in SQL)"
fi

# Store security results
SECURITY_SCORE=100
if [ -n "$SECURITY_ISSUES" ]; then
    SECURITY_SCORE=60
elif [ -n "$SECURITY_WARNINGS" ]; then
    SECURITY_SCORE=80
fi

echo "SECURITY_SCORE=$SECURITY_SCORE" >> /tmp/claudia_analysis_context
echo "SECURITY_ISSUES=$SECURITY_ISSUES" >> /tmp/claudia_analysis_context
echo "SECURITY_WARNINGS=$SECURITY_WARNINGS" >> /tmp/claudia_analysis_context

echo "🔒 Security Analysis Complete:"
echo "   📊 Security Score: $SECURITY_SCORE/100"

if [ -n "$SECURITY_ISSUES" ]; then
    echo "   🚨 Critical Issues Found:"
    echo -e "$SECURITY_ISSUES"
fi

if [ -n "$SECURITY_WARNINGS" ]; then
    echo "   ⚠️  Warnings:"
    echo -e "$SECURITY_WARNINGS"
fi

if [ -z "$SECURITY_ISSUES" ] && [ -z "$SECURITY_WARNINGS" ]; then
    echo "   ✅ No obvious security issues detected"
fi
'

## Code Quality Analysis

!bash -c '
source /tmp/claudia_analysis_context

echo ""
echo "🔍 Performing code quality analysis..."

# Get PR diff for analysis
PR_DIFF=$(gh pr diff $PR_NUMBER 2>/dev/null || echo "Diff unavailable")

# Code quality checks
QUALITY_ISSUES=""
QUALITY_SUGGESTIONS=""

# Check for code smells
if echo "$PR_DIFF" | grep -E "^\+.*function.*\{$" | wc -l | xargs | awk '{if($1>10) print $1}' | grep -q .; then
    QUALITY_SUGGESTIONS="$QUALITY_SUGGESTIONS\n💡 Large number of new functions added - consider breaking into smaller modules"
fi

if echo "$PR_DIFF" | grep -E "^\+.*if.*if.*if" | wc -l | xargs | awk '{if($1>3) print $1}' | grep -q .; then
    QUALITY_ISSUES="$QUALITY_ISSUES\n🔍 Deeply nested conditional statements detected"
fi

# Check for TODO/FIXME comments
TODO_COUNT=$(echo "$PR_DIFF" | grep -E "^\+.*TODO|^\+.*FIXME" | wc -l | xargs)
if [ "$TODO_COUNT" -gt 0 ]; then
    QUALITY_SUGGESTIONS="$QUALITY_SUGGESTIONS\n💡 $TODO_COUNT TODO/FIXME comments added - consider addressing before merge"
fi

# Check for proper TypeScript usage
if [ "$JS_TS_FILES" -gt 0 ]; then
    ANY_COUNT=$(echo "$PR_DIFF" | grep -E "^\+.*: any" | wc -l | xargs)
    if [ "$ANY_COUNT" -gt 3 ]; then
        QUALITY_ISSUES="$QUALITY_ISSUES\n🔍 Excessive use of 'any' type in TypeScript ($ANY_COUNT instances)"
    fi
fi

# Calculate quality score
QUALITY_SCORE=100
ISSUE_COUNT=$(echo -e "$QUALITY_ISSUES" | grep -c "🔍" 2>/dev/null || echo "0")
SUGGESTION_COUNT=$(echo -e "$QUALITY_SUGGESTIONS" | grep -c "💡" 2>/dev/null || echo "0")

QUALITY_SCORE=$((QUALITY_SCORE - (ISSUE_COUNT * 15) - (SUGGESTION_COUNT * 5)))
if [ "$QUALITY_SCORE" -lt 0 ]; then
    QUALITY_SCORE=0
fi

echo "QUALITY_SCORE=$QUALITY_SCORE" >> /tmp/claudia_analysis_context
echo "QUALITY_ISSUES=$QUALITY_ISSUES" >> /tmp/claudia_analysis_context
echo "QUALITY_SUGGESTIONS=$QUALITY_SUGGESTIONS" >> /tmp/claudia_analysis_context
echo "TODO_COUNT=$TODO_COUNT" >> /tmp/claudia_analysis_context

echo "📊 Code Quality Analysis:"
echo "   📈 Quality Score: $QUALITY_SCORE/100"

if [ -n "$QUALITY_ISSUES" ]; then
    echo "   🔍 Issues Detected:"
    echo -e "$QUALITY_ISSUES"
fi

if [ -n "$QUALITY_SUGGESTIONS" ]; then
    echo "   💡 Suggestions:"
    echo -e "$QUALITY_SUGGESTIONS"
fi

if [ -z "$QUALITY_ISSUES" ] && [ -z "$QUALITY_SUGGESTIONS" ]; then
    echo "   ✅ Code quality looks good"
fi
'

## Test Coverage Analysis

!bash -c '
source /tmp/claudia_analysis_context

echo ""
echo "🧪 Analyzing test coverage and practices..."

# Calculate test file ratio
if [ "$FILE_COUNT" -gt 0 ]; then
    TEST_RATIO=$((TEST_FILES * 100 / FILE_COUNT))
else
    TEST_RATIO=0
fi

# Test analysis
TEST_COVERAGE_SCORE=0
TEST_FEEDBACK=""

if [ "$TEST_FILES" -eq 0 ]; then
    if [ "$JS_TS_FILES" -gt 0 ]; then
        TEST_FEEDBACK="⚠️  No test files found for code changes"
        TEST_COVERAGE_SCORE=20
    else
        TEST_FEEDBACK="ℹ️  No code files requiring tests"
        TEST_COVERAGE_SCORE=100
    fi
elif [ "$TEST_RATIO" -lt 20 ]; then
    TEST_FEEDBACK="📊 Low test coverage ratio: ${TEST_RATIO}% (${TEST_FILES} tests for ${FILE_COUNT} files)"
    TEST_COVERAGE_SCORE=40
elif [ "$TEST_RATIO" -lt 50 ]; then
    TEST_FEEDBACK="📊 Moderate test coverage: ${TEST_RATIO}% (${TEST_FILES} tests for ${FILE_COUNT} files)"
    TEST_COVERAGE_SCORE=70
else
    TEST_FEEDBACK="✅ Good test coverage: ${TEST_RATIO}% (${TEST_FILES} tests for ${FILE_COUNT} files)"
    TEST_COVERAGE_SCORE=100
fi

echo "TEST_COVERAGE_SCORE=$TEST_COVERAGE_SCORE" >> /tmp/claudia_analysis_context
echo "TEST_RATIO=$TEST_RATIO" >> /tmp/claudia_analysis_context
echo "TEST_FEEDBACK=$TEST_FEEDBACK" >> /tmp/claudia_analysis_context

echo "🧪 Test Coverage Analysis:"
echo "   📊 Coverage Score: $TEST_COVERAGE_SCORE/100"
echo "   $TEST_FEEDBACK"
'

## Calculate Overall Analysis Score

!bash -c '
source /tmp/claudia_analysis_context

echo ""
echo "📊 Calculating overall analysis score..."

# Weight factors
SECURITY_WEIGHT=40
QUALITY_WEIGHT=35
TEST_WEIGHT=25

# Calculate weighted score
OVERALL_SCORE=$(( (SECURITY_SCORE * SECURITY_WEIGHT + QUALITY_SCORE * QUALITY_WEIGHT + TEST_COVERAGE_SCORE * TEST_WEIGHT) / 100 ))

# Determine risk level
RISK_LEVEL=""
RISK_COLOR=""
if [ "$OVERALL_SCORE" -ge 90 ]; then
    RISK_LEVEL="LOW"
    RISK_COLOR="🟢"
elif [ "$OVERALL_SCORE" -ge 70 ]; then
    RISK_LEVEL="MEDIUM"
    RISK_COLOR="🟡"
else
    RISK_LEVEL="HIGH"
    RISK_COLOR="🔴"
fi

echo "OVERALL_SCORE=$OVERALL_SCORE" >> /tmp/claudia_analysis_context
echo "RISK_LEVEL=$RISK_LEVEL" >> /tmp/claudia_analysis_context

echo "🎯 Overall Analysis Score: $OVERALL_SCORE/100"
echo "⚡ Risk Level: $RISK_COLOR $RISK_LEVEL"
'

## Generate Analysis Report

!bash -c '
source /tmp/claudia_analysis_context

echo ""
echo "📄 Generating comprehensive analysis report..."

REPORT_DIR=".claude-shared/project-management/data/reviews"
mkdir -p "$REPORT_DIR"

ANALYSIS_REPORT="$REPORT_DIR/analysis-$ANALYSIS_ID.json"

# Create detailed analysis report
cat > "$ANALYSIS_REPORT" << EOF
{
  "analysis_id": "$ANALYSIS_ID",
  "pr_number": $PR_NUMBER,
  "pr_title": "$PR_TITLE",
  "pr_author": "$PR_AUTHOR",
  "analyzer": "$ANALYZER",
  "timestamp": "$TIMESTAMP",
  "pr_url": "$PR_URL",
  "file_analysis": {
    "total_files": $FILE_COUNT,
    "js_ts_files": $JS_TS_FILES,
    "style_files": $STYLE_FILES,
    "test_files": $TEST_FILES,
    "config_files": $CONFIG_FILES,
    "markdown_files": $MARKDOWN_FILES,
    "package_files": $PACKAGE_FILES
  },
  "security_analysis": {
    "score": $SECURITY_SCORE,
    "issues": "$SECURITY_ISSUES",
    "warnings": "$SECURITY_WARNINGS"
  },
  "quality_analysis": {
    "score": $QUALITY_SCORE,
    "issues": "$QUALITY_ISSUES",
    "suggestions": "$QUALITY_SUGGESTIONS",
    "todo_count": $TODO_COUNT
  },
  "test_analysis": {
    "score": $TEST_COVERAGE_SCORE,
    "test_ratio": $TEST_RATIO,
    "feedback": "$TEST_FEEDBACK"
  },
  "overall_assessment": {
    "score": $OVERALL_SCORE,
    "risk_level": "$RISK_LEVEL"
  },
  "recommendations": []
}
EOF

echo "ANALYSIS_REPORT=$ANALYSIS_REPORT" >> /tmp/claudia_analysis_context
echo "✅ Analysis report generated: $ANALYSIS_REPORT"
'

## Log Analysis Activity

!bash -c '
source /tmp/claudia_analysis_context

echo "📊 Logging analysis activity..."
mkdir -p .claude-shared/project-management/data

LOG_ENTRY="{\"timestamp\":\"$TIMESTAMP\",\"action\":\"pr_analyzed\",\"analysis_id\":\"$ANALYSIS_ID\",\"pr_number\":$PR_NUMBER,\"analyzer\":\"$ANALYZER\",\"overall_score\":$OVERALL_SCORE,\"risk_level\":\"$RISK_LEVEL\",\"file_count\":$FILE_COUNT}"

echo "$LOG_ENTRY" >> .claude-shared/project-management/data/github-sync.jsonl

echo "✅ Analysis activity logged to audit trail"
'

## Display Analysis Summary

!bash -c '
source /tmp/claudia_analysis_context

echo ""
echo "✨ AUTOMATED ANALYSIS COMPLETE"
echo "==============================="
echo ""
echo "📊 Analysis Results Summary:"
echo "   🆔 Analysis ID: $ANALYSIS_ID"
echo "   🔢 PR Number: #$PR_NUMBER"
echo "   👤 Author: $PR_AUTHOR"
echo "   🤖 Analyzer: $ANALYZER"
echo ""
echo "📈 Detailed Scores:"
echo "   🛡️  Security: $SECURITY_SCORE/100"
echo "   🔍 Quality: $QUALITY_SCORE/100"
echo "   🧪 Testing: $TEST_COVERAGE_SCORE/100"
echo ""
echo "🎯 Overall Assessment:"
echo "   📊 Score: $OVERALL_SCORE/100"
echo "   ⚡ Risk Level: $RISK_LEVEL"
echo ""
echo "🔗 Next Steps:"
echo "   1. 👤 Interactive Review:"
echo "      /claudia:review:interactive \"$PR_NUMBER\""
echo ""
echo "   2. 📝 Submit GitHub Review:"
echo "      gh pr review $PR_NUMBER --approve"
echo "      gh pr review $PR_NUMBER --request-changes"
echo ""
echo "   3. 🔀 Merge if Ready:"
echo "      /claudia:pr:merge \"$PR_NUMBER\""
echo ""
echo "📄 Detailed report: $ANALYSIS_REPORT"

rm -f /tmp/claudia_analysis_context
'