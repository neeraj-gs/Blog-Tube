---
description: "Create multiple GitHub issues from all requirements in a sprint document at once"
allowed-tools: ["Read", "Write", "Edit", "Bash"]
---

# 🎯 Create Multiple GitHub Issues from Sprint

I'll create GitHub issues for all requirements in a sprint document at once.

## Parse and Validate Arguments

!bash -c '
ARGS_STRING="$ARGUMENTS"

# Extract sprint number (first argument)
SPRINT_NUMBER=$(echo "$ARGS_STRING" | awk "{print \$1}" | sed "s/[\"\']//g")

# Extract labels if provided
LABELS=""
if echo "$ARGS_STRING" | grep -q "\--labels"; then
    LABELS=$(echo "$ARGS_STRING" | sed "s/.*--labels //" | awk "{print \$1}" | sed "s/[\"\']//g")
fi

# Extract requirements to skip if provided
SKIP_REQUIREMENTS=""
if echo "$ARGS_STRING" | grep -q "\--skip"; then
    SKIP_REQUIREMENTS=$(echo "$ARGS_STRING" | sed "s/.*--skip //" | awk "{print \$1}" | sed "s/[\"\']//g")
fi

# Validate sprint number
if [[ ! "$SPRINT_NUMBER" =~ ^[0-9]{3}$ ]]; then
    echo "ERROR: Sprint number must be 3 digits (e.g., 001, 002, 030)"
    exit 1
fi

# Check if sprint file exists
SPRINT_FILE=".claude-shared/project-management/3-sprints/$SPRINT_NUMBER.md"
if [ ! -f "$SPRINT_FILE" ]; then
    echo "ERROR: Sprint file not found: $SPRINT_FILE"
    exit 1
fi

# Output parsed values for Claude to use
echo "SPRINT_NUMBER=$SPRINT_NUMBER"
echo "SPRINT_FILE=$SPRINT_FILE"
echo "LABELS=$LABELS"
echo "SKIP_REQUIREMENTS=$SKIP_REQUIREMENTS"
echo "VALIDATED=SUCCESS"
'

Now I'll read the sprint document, discover all requirements, filter based on skip list, and create GitHub issues for each requirement using the Bash tool.
