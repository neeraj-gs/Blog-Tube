---
description: "Test sprint creation with simple commands"
allowed-tools: ["Bash"]
---

# 🧪 Test Sprint Creation

Simple test to create a sprint file.

## Test Sprint Creation: $ARGUMENTS

!bash -c 'echo "Testing sprint creation with: $ARGUMENTS"'

## Create Sprint File

!bash -c '
SPRINT_NUMBER="$ARGUMENTS"
echo "Sprint number received: $SPRINT_NUMBER"

# Remove quotes if present
SPRINT_NUMBER=$(echo "$SPRINT_NUMBER" | sed "s/[\"\']//g")
echo "Cleaned sprint number: $SPRINT_NUMBER"

# Create sprint file
mkdir -p docs/3-sprints
cat > "docs/3-sprints/$SPRINT_NUMBER.md" << EOF
# Sprint $SPRINT_NUMBER

**Sprint Number:** $SPRINT_NUMBER
**Created:** $(date)
**Status:** Active

## Sprint Goals

Test sprint creation

EOF

echo "✅ Sprint file created: docs/3-sprints/$SPRINT_NUMBER.md"
ls -la docs/3-sprints/$SPRINT_NUMBER.md
'