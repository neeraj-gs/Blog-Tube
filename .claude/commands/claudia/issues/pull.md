---
description: "Pull all GitHub issues from repository with filtering and status information"
allowed-tools: ["Read", "Write", "Edit", "Bash"]
---

# 📥 Pull GitHub Issues

Fetch all GitHub issues from the current repository with filtering options and detailed status information.

## Processing Issues Pull: $ARGUMENTS

!bash -c 'echo "📥 Pulling GitHub issues: $ARGUMENTS"'

## Parse Arguments and Setup Filters

!bash -c '
STATE="open"
LABELS=""
MILESTONE=""
ASSIGNEE=""
LIMIT="50"
FORMAT="table"

# Parse arguments: [--state open|closed|all] [--labels "label1,label2"] [--milestone "Sprint 030"] [--assignee "username"] [--limit 50] [--format table|json]
ARGS=($ARGUMENTS)
i=0
while [ $i -lt ${#ARGS[@]} ]; do
    case "${ARGS[$i]}" in
        --state)
            i=$((i + 1))
            STATE="${ARGS[$i]}"
            ;;
        --labels)
            i=$((i + 1))
            LABELS="${ARGS[$i]}"
            ;;
        --milestone)
            i=$((i + 1))
            MILESTONE="${ARGS[$i]}"
            ;;
        --assignee)
            i=$((i + 1))
            ASSIGNEE="${ARGS[$i]}"
            ;;
        --limit)
            i=$((i + 1))
            LIMIT="${ARGS[$i]}"
            ;;
        --format)
            i=$((i + 1))
            FORMAT="${ARGS[$i]}"
            ;;
    esac
    i=$((i + 1))
done

# Validate state
case "$STATE" in
    open|closed|all) ;;
    *)
        echo "❌ ERROR: Invalid state. Must be: open, closed, or all"
        exit 1
        ;;
esac

# Validate format
case "$FORMAT" in
    table|json) ;;
    *)
        echo "❌ ERROR: Invalid format. Must be: table or json"
        exit 1
        ;;
esac

echo "✅ Filters configured:"
echo "   State: $STATE"
echo "   Labels: ${LABELS:-\"all\"}"
echo "   Milestone: ${MILESTONE:-\"all\"}"
echo "   Assignee: ${ASSIGNEE:-\"all\"}"
echo "   Limit: $LIMIT"
echo "   Format: $FORMAT"

echo "STATE=$STATE" > /tmp/claudia_pull_context
echo "LABELS=$LABELS" >> /tmp/claudia_pull_context
echo "MILESTONE=$MILESTONE" >> /tmp/claudia_pull_context
echo "ASSIGNEE=$ASSIGNEE" >> /tmp/claudia_pull_context
echo "LIMIT=$LIMIT" >> /tmp/claudia_pull_context
echo "FORMAT=$FORMAT" >> /tmp/claudia_pull_context
'

## Validate GitHub CLI Setup

!bash -c '
source /tmp/claudia_pull_context

echo ""
echo "🔍 Validating GitHub CLI setup..."

# Check if we have GitHub CLI available
if ! command -v gh &> /dev/null; then
    echo "❌ ERROR: GitHub CLI (gh) is not installed"
    echo "Please install GitHub CLI: https://cli.github.com/"
    exit 1
fi

# Check if we are in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ ERROR: Not in a git repository"
    exit 1
fi

# Check if GitHub CLI is authenticated
if ! gh auth status > /dev/null 2>&1; then
    echo "❌ ERROR: GitHub CLI is not authenticated"
    echo "Please run: gh auth login"
    exit 1
fi

# Get repository information
REPO_INFO=$(gh repo view --json name,owner)
REPO_NAME=$(echo "$REPO_INFO" | jq -r ".name")
REPO_OWNER=$(echo "$REPO_INFO" | jq -r ".owner.login")

echo "✅ GitHub CLI setup validated"
echo "📁 Repository: $REPO_OWNER/$REPO_NAME"

echo "REPO_NAME=$REPO_NAME" >> /tmp/claudia_pull_context
echo "REPO_OWNER=$REPO_OWNER" >> /tmp/claudia_pull_context
'

## Build and Execute GitHub CLI Command

!bash -c '
source /tmp/claudia_pull_context

echo ""
echo "🔍 Fetching GitHub issues..."

# Build command arguments array
GH_ARGS=("issue" "list" "--state" "$STATE" "--limit" "$LIMIT")

# Add filters
if [ ! -z "$LABELS" ]; then
    GH_ARGS+=("--label" "$LABELS")
fi

if [ ! -z "$MILESTONE" ]; then
    GH_ARGS+=("--milestone" "$MILESTONE")
fi

if [ ! -z "$ASSIGNEE" ]; then
    GH_ARGS+=("--assignee" "$ASSIGNEE")
fi

# Set output format
if [ "$FORMAT" == "json" ]; then
    GH_ARGS+=("--json" "number,title,state,labels,milestone,assignees,createdAt,updatedAt,url")
fi

echo "Command: gh ${GH_ARGS[@]}"
echo ""

# Execute the command and capture output
if [ "$FORMAT" == "json" ]; then
    gh "${GH_ARGS[@]}" > /tmp/issues_output.json 2>/dev/null
    COMMAND_STATUS=$?
else
    gh "${GH_ARGS[@]}" > /tmp/issues_output.txt 2>/dev/null
    COMMAND_STATUS=$?
fi

# If command failed, try a simpler version
if [ $COMMAND_STATUS -ne 0 ]; then
    echo "⚠️  Primary command failed, trying simplified version..."
    if [ "$FORMAT" == "json" ]; then
        gh issue list --state "$STATE" --json number,title,state,url > /tmp/issues_output.json 2>/dev/null
        COMMAND_STATUS=$?
    else
        gh issue list --state "$STATE" > /tmp/issues_output.txt 2>/dev/null
        COMMAND_STATUS=$?
    fi
fi

if [ $COMMAND_STATUS -eq 0 ]; then
    echo "✅ Issues fetched successfully!"
else
    echo "❌ Failed to fetch issues"
    echo "🔍 Trying direct repository specification..."

    # Try with explicit repo specification
    if [ "$FORMAT" == "json" ]; then
        gh issue list --repo "$REPO_OWNER/$REPO_NAME" --state "$STATE" --json number,title,state,url > /tmp/issues_output.json 2>/dev/null
        COMMAND_STATUS=$?
    else
        gh issue list --repo "$REPO_OWNER/$REPO_NAME" --state "$STATE" > /tmp/issues_output.txt 2>/dev/null
        COMMAND_STATUS=$?
    fi

    if [ $COMMAND_STATUS -eq 0 ]; then
        echo "✅ Issues fetched with explicit repo specification!"
    else
        echo "❌ All attempts failed - please check GitHub CLI setup"
        exit 1
    fi
fi
'

## Display Results

!bash -c '
source /tmp/claudia_pull_context

echo ""
echo "📊 GitHub Issues Summary:"
echo "=========================="

if [ "$FORMAT" == "json" ]; then
    # Process JSON output
    TOTAL_ISSUES=$(cat /tmp/issues_output.json | jq length)
    echo "📝 Total Issues: $TOTAL_ISSUES"

    if [ "$TOTAL_ISSUES" -gt 0 ]; then
        echo ""
        echo "📋 Issues List (JSON Format):"
        echo "------------------------------"
        cat /tmp/issues_output.json | jq -r ".[] | \"#\(.number): \(.title) [\(.state)] - \(.url)\""

        echo ""
        echo "📊 Detailed JSON Output:"
        echo "------------------------"
        cat /tmp/issues_output.json | jq .
    fi
else
    # Process table output
    TOTAL_ISSUES=$(cat /tmp/issues_output.txt | wc -l | tr -d " ")
    # Subtract header line if present
    if [ "$TOTAL_ISSUES" -gt 0 ]; then
        TOTAL_ISSUES=$((TOTAL_ISSUES - 1))
    fi

    echo "📝 Total Issues: $TOTAL_ISSUES"

    if [ "$TOTAL_ISSUES" -gt 0 ]; then
        echo ""
        echo "📋 Issues List (Table Format):"
        echo "------------------------------"
        cat /tmp/issues_output.txt
    fi
fi

echo ""
echo "🔗 Repository: https://github.com/$REPO_OWNER/$REPO_NAME/issues"
'

## Log Pull Operation

!bash -c '
source /tmp/claudia_pull_context

echo ""
echo "📊 Logging pull operation..."

# Count issues by reading the output
if [ "$FORMAT" == "json" ]; then
    ISSUE_COUNT=$(cat /tmp/issues_output.json | jq length 2>/dev/null || echo "0")
else
    ISSUE_COUNT=$(cat /tmp/issues_output.txt | wc -l | tr -d " " || echo "0")
    if [ "$ISSUE_COUNT" -gt 0 ]; then
        ISSUE_COUNT=$((ISSUE_COUNT - 1))
    fi
fi

# Log the pull operation
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
LOG_ENTRY="{\"timestamp\":\"$TIMESTAMP\",\"action\":\"issues_pulled\",\"state\":\"$STATE\",\"labels\":\"$LABELS\",\"milestone\":\"$MILESTONE\",\"assignee\":\"$ASSIGNEE\",\"limit\":$LIMIT,\"format\":\"$FORMAT\",\"issues_count\":$ISSUE_COUNT,\"repository\":\"$REPO_OWNER/$REPO_NAME\",\"author\":\"claudia\"}"

# Ensure data directory exists
mkdir -p .claude-shared/project-management/data

# Append to github-sync.jsonl
echo "$LOG_ENTRY" >> .claude-shared/project-management/data/github-sync.jsonl

echo "✅ Pull operation logged to audit trail"
'

## Provide Usage Examples

!bash -c '
echo ""
echo "💡 Usage Examples:"
echo "=================="
echo ""
echo "# Pull all open issues (default)"
echo "/claudia:issue:pull"
echo ""
echo "# Pull all issues (open and closed)"
echo "/claudia:issue:pull --state all"
echo ""
echo "# Pull issues with specific labels"
echo "/claudia:issue:pull --labels \"bug,enhancement\""
echo ""
echo "# Pull issues for specific milestone"
echo "/claudia:issue:pull --milestone \"Sprint 030\""
echo ""
echo "# Pull issues assigned to specific user"
echo "/claudia:issue:pull --assignee \"username\""
echo ""
echo "# Pull issues in JSON format for processing"
echo "/claudia:issue:pull --format json --limit 10"
echo ""
echo "# Complex filtering"
echo "/claudia:issue:pull --state open --labels \"bug\" --milestone \"Sprint 030\" --limit 20"
'

## Cleanup

!bash -c '
# Clean up temporary files
rm -f /tmp/claudia_pull_context
rm -f /tmp/issues_output.json
rm -f /tmp/issues_output.txt

echo ""
echo "✨ Issue pull complete!"
'