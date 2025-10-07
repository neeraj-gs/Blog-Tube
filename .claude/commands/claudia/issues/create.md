---
description: "Create GitHub issue from sprint requirement with full context and ticket storage"
allowed-tools: ["Read", "Write", "Edit", "Bash"]
---

# 🎯 Create GitHub Issue from Sprint Requirement

I'll create a GitHub issue from a requirement embedded in a sprint document and store it in the tickets folder.

## Parse and Validate Arguments

!bash -c '
ARGS_STRING="$ARGUMENTS"

# Extract sprint number (first argument)
SPRINT_NUMBER=$(echo "$ARGS_STRING" | awk "{print \$1}" | sed "s/[\"\']//g")

# Extract requirement number
if echo "$ARGS_STRING" | grep -q "\--requirement"; then
    REQUIREMENT_NUM=$(echo "$ARGS_STRING" | sed "s/.*--requirement //" | awk "{print \$1}")
else
    echo "ERROR: --requirement parameter is required"
    exit 1
fi

# Extract custom title if provided
ISSUE_TITLE=""
if echo "$ARGS_STRING" | grep -q "\--title"; then
    ISSUE_TITLE=$(echo "$ARGS_STRING" | sed "s/.*--title //" | sed "s/\"//g" | sed "s/ --.*$//")
fi

# Extract labels if provided
LABELS=""
if echo "$ARGS_STRING" | grep -q "\--labels"; then
    LABELS=$(echo "$ARGS_STRING" | sed "s/.*--labels //" | awk "{print \$1}" | sed "s/[\"\']//g")
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

# Create sprint folder in tickets directory
TICKETS_DIR=".claude-shared/project-management/5-tickets/$SPRINT_NUMBER"
mkdir -p "$TICKETS_DIR"

# Output parsed values for Claude to use
echo "SPRINT_NUMBER=$SPRINT_NUMBER"
echo "SPRINT_FILE=$SPRINT_FILE"
echo "REQUIREMENT_NUM=$REQUIREMENT_NUM"
echo "ISSUE_TITLE=$ISSUE_TITLE"
echo "LABELS=$LABELS"
echo "TICKETS_DIR=$TICKETS_DIR"
echo "VALIDATED=SUCCESS"
'

Now I'll read the sprint document, extract the requirement, create the GitHub issue, and store the ticket file in the sprint-organized folder structure.
