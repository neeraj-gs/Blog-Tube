---
description: "Create GitHub issue from requirements file with full context and traceability"
allowed-tools: ["Read", "Write", "Edit", "Bash", "WebFetch"]
---

# 🎯 Create GitHub Issue from Requirements

Create a GitHub issue using a requirements file as context, with full traceability and proper formatting.

## Processing Issue Creation: $ARGUMENTS

!bash -c 'echo "🎯 Creating GitHub issue from requirements: $ARGUMENTS"'

## Parse Arguments and Validate

!bash -c '
REQUIREMENTS_FILE=""
ISSUE_TITLE=""
LABELS=""
MILESTONE=""

# Parse arguments: requirements-file [--title "Custom Title"] [--labels "label1,label2"] [--milestone "Sprint 030"]
ARGS=($ARGUMENTS)
i=0
while [ $i -lt ${#ARGS[@]} ]; do
    case "${ARGS[$i]}" in
        --title)
            i=$((i + 1))
            ISSUE_TITLE="${ARGS[$i]}"
            ;;
        --labels)
            i=$((i + 1))
            LABELS="${ARGS[$i]}"
            ;;
        --milestone)
            i=$((i + 1))
            MILESTONE="${ARGS[$i]}"
            ;;
        *)
            if [ -z "$REQUIREMENTS_FILE" ]; then
                REQUIREMENTS_FILE="${ARGS[$i]}"
            fi
            ;;
    esac
    i=$((i + 1))
done

# Clean up requirements file path
REQUIREMENTS_FILE=$(echo "$REQUIREMENTS_FILE" | sed "s/^[\"']//" | sed "s/[\"']$//")

# Validate requirements file exists
if [ -z "$REQUIREMENTS_FILE" ]; then
    echo "❌ ERROR: Requirements file is required"
    echo "Usage: /claudia:issue:create \"030-01-user-auth\" [--title \"Custom Title\"] [--labels \"bug,enhancement\"] [--milestone \"Sprint 030\"]"
    exit 1
fi

# Determine requirements file path
REQUIREMENTS_PATH=""
if [ -f ".claude-shared/project-management/4-requirements/$REQUIREMENTS_FILE.md" ]; then
    REQUIREMENTS_PATH=".claude-shared/project-management/4-requirements/$REQUIREMENTS_FILE.md"
elif [ -f "docs/4-requirements/$REQUIREMENTS_FILE.md" ]; then
    REQUIREMENTS_PATH="docs/4-requirements/$REQUIREMENTS_FILE.md"
elif [ -f "$REQUIREMENTS_FILE" ]; then
    REQUIREMENTS_PATH="$REQUIREMENTS_FILE"
else
    echo "❌ ERROR: Requirements file not found: $REQUIREMENTS_FILE"
    echo "Looked in:"
    echo "  - .claude-shared/project-management/4-requirements/$REQUIREMENTS_FILE.md"
    echo "  - docs/4-requirements/$REQUIREMENTS_FILE.md"
    echo "  - $REQUIREMENTS_FILE"
    exit 1
fi

echo "✅ Requirements file found: $REQUIREMENTS_PATH"
echo "REQUIREMENTS_PATH=$REQUIREMENTS_PATH" > /tmp/claudia_issue_context
echo "ISSUE_TITLE=$ISSUE_TITLE" >> /tmp/claudia_issue_context
echo "LABELS=$LABELS" >> /tmp/claudia_issue_context
echo "MILESTONE=$MILESTONE" >> /tmp/claudia_issue_context
echo "REQUIREMENTS_FILE=$REQUIREMENTS_FILE" >> /tmp/claudia_issue_context
'

## Read Requirements File and Extract Information

!bash -c '
source /tmp/claudia_issue_context

echo ""
echo "📖 Reading requirements file..."

if [ ! -f "$REQUIREMENTS_PATH" ]; then
    echo "❌ ERROR: Cannot read requirements file: $REQUIREMENTS_PATH"
    exit 1
fi

# Extract title from requirements file if not provided
if [ -z "$ISSUE_TITLE" ]; then
    ISSUE_TITLE=$(head -10 "$REQUIREMENTS_PATH" | grep "^# " | head -1 | sed "s/^# //")
    if [ -z "$ISSUE_TITLE" ]; then
        ISSUE_TITLE="Implementation: $REQUIREMENTS_FILE"
    fi
fi

echo "📝 Issue Title: $ISSUE_TITLE"
echo "EXTRACTED_TITLE=$ISSUE_TITLE" >> /tmp/claudia_issue_context
'

## Generate GitHub Issue Content

!bash -c '
source /tmp/claudia_issue_context

echo ""
echo "🔨 Generating GitHub issue content..."

# Generate issue body from requirements file
ISSUE_BODY="## 📋 Requirements Implementation

This issue is created from requirements file: \`$REQUIREMENTS_FILE\`

### 🎯 Objective
Implementation of requirements as specified in the requirements document.

### 📖 Requirements Content

"

# Add requirements file content (first 50 lines to avoid too long issues)
echo "$ISSUE_BODY" > /tmp/issue_body.md
echo "\`\`\`markdown" >> /tmp/issue_body.md
head -50 "$REQUIREMENTS_PATH" >> /tmp/issue_body.md
echo "\`\`\`" >> /tmp/issue_body.md

# Add traceability section
echo "

### 🔗 Traceability
- **Requirements File:** \`$REQUIREMENTS_PATH\`
- **Created:** $(date '+%Y-%m-%d %H:%M:%S')
- **Sprint Context:** Based on requirements hierarchy
- **Repository:** $(basename $(pwd))

### ✅ Definition of Done
- [ ] All requirements from the specification are implemented
- [ ] Code follows project standards and conventions
- [ ] Tests are written and passing
- [ ] Documentation is updated
- [ ] Code review is completed
- [ ] Feature is tested in appropriate environment

### 🔧 Implementation Notes
Please refer to the original requirements file for detailed specifications and acceptance criteria.

---
*This issue was created automatically from requirements file using Claudia automation system.*" >> /tmp/issue_body.md

echo "✅ Issue content generated"
'

## Create GitHub Issue

!bash -c '
source /tmp/claudia_issue_context

echo ""
echo "🚀 Creating GitHub issue..."

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

# Build gh issue create command
GH_COMMAND="gh issue create --title \"$EXTRACTED_TITLE\" --body-file /tmp/issue_body.md"

# Add labels if specified
if [ ! -z "$LABELS" ]; then
    GH_COMMAND="$GH_COMMAND --label \"$LABELS\""
fi

# Add milestone if specified
if [ ! -z "$MILESTONE" ]; then
    GH_COMMAND="$GH_COMMAND --milestone \"$MILESTONE\""
fi

echo "Command: $GH_COMMAND"
echo ""

# Execute the command
eval $GH_COMMAND

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ GitHub issue created successfully!"

    # Get the issue number from the last created issue
    ISSUE_NUMBER=$(gh issue list --limit 1 --json number --jq ".[0].number")
    echo "📝 Issue Number: #$ISSUE_NUMBER"

    # Log the issue creation
    TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    LOG_ENTRY="{\"timestamp\":\"$TIMESTAMP\",\"action\":\"issue_created\",\"requirements_file\":\"$REQUIREMENTS_FILE\",\"issue_number\":$ISSUE_NUMBER,\"title\":\"$EXTRACTED_TITLE\",\"labels\":\"$LABELS\",\"milestone\":\"$MILESTONE\",\"repository\":\"$(basename $(pwd))\",\"author\":\"claudia\"}"

    # Ensure data directory exists
    mkdir -p .claude-shared/project-management/data

    # Append to github-sync.jsonl
    echo "$LOG_ENTRY" >> .claude-shared/project-management/data/github-sync.jsonl

    echo "📊 Issue creation logged to audit trail"
    echo ""
    echo "🔗 View issue: $(gh repo view --json url --jq .url)/issues/$ISSUE_NUMBER"
else
    echo "❌ Failed to create GitHub issue"
    exit 1
fi
'

## Cleanup

!bash -c '
# Clean up temporary files
rm -f /tmp/claudia_issue_context
rm -f /tmp/issue_body.md

echo ""
echo "✨ Issue creation complete!"
'