---
description: "Create a new sprint with numbered identifier and optionally embed requirements from planning document"
allowed-tools: ["Read", "Write", "Edit", "Bash"]
---

# 🚀 Create New Sprint

I'll create Sprint $ARGUMENTS with embedded requirements.

First, let me parse and validate the arguments:

!bash -c '
ARGS="$ARGUMENTS"
SPRINT_NUMBER=$(echo "$ARGS" | awk "{print \$1}" | sed "s/[\"\047]//g")
PLANNING_DOC=$(echo "$ARGS" | sed "s/.*--with-planning *//" | awk "{print \$1}" | sed "s/[\"\047@]//g")
SPRINT_TITLE=$(echo "$ARGS" | sed "s/.*--title *//" | sed "s/ --.*$//" | sed "s/[\"\047]//g")

# Default title
if [ -z "$SPRINT_TITLE" ]; then
    SPRINT_TITLE="Sprint $SPRINT_NUMBER"
fi

# Validate sprint number (3 digits)
if [[ ! "$SPRINT_NUMBER" =~ ^[0-9]{3}$ ]]; then
    echo "ERROR: Sprint number must be 3 digits (e.g., 030, 031, 032)"
    exit 1
fi

# Check if already exists
if [ -f ".claude-shared/project-management/3-sprints/$SPRINT_NUMBER.md" ]; then
    echo "ERROR: Sprint $SPRINT_NUMBER already exists at .claude-shared/project-management/3-sprints/$SPRINT_NUMBER.md"
    exit 1
fi

# Check planning doc
if [ -n "$PLANNING_DOC" ] && [ -f "$PLANNING_DOC" ]; then
    HAS_PLANNING="true"
else
    HAS_PLANNING="false"
    if [ -n "$PLANNING_DOC" ]; then
        echo "WARNING: Planning document not found: $PLANNING_DOC"
    fi
fi

# Output parsed values for Claude to use
echo "SPRINT_NUMBER=$SPRINT_NUMBER"
echo "SPRINT_TITLE=$SPRINT_TITLE"
echo "PLANNING_DOC=$PLANNING_DOC"
echo "HAS_PLANNING=$HAS_PLANNING"
echo "VALIDATED=SUCCESS"
'

Now I'll read the planning document if provided and create the sprint file using the Write tool.
