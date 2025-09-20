---
description: "Create a new sprint with numbered identifier"
allowed-tools: ["Read", "Write", "Edit", "Bash"]
---

# 🚀 Create New Sprint

Create a new sprint document with numbered identifier and initialize sprint tracking.

## Processing Sprint Creation: $ARGUMENTS

!bash -c 'echo "🚀 Creating new sprint: $ARGUMENTS"'

## Parse Arguments and Validate

!bash -c '
SPRINT_NUMBER="$ARGUMENTS"

# Validate sprint number format (3 digits)
if [[ ! "$SPRINT_NUMBER" =~ ^[0-9]{3}$ ]]; then
    echo "❌ ERROR: Sprint number must be 3 digits (e.g., 030, 031, 032)"
    echo "Usage: /claudia:sprint:create \"030\""
    exit 1
fi

# Check if sprint already exists
if [ -f "docs/3-sprints/$SPRINT_NUMBER.md" ]; then
    echo "❌ ERROR: Sprint $SPRINT_NUMBER already exists"
    echo "Existing file: docs/3-sprints/$SPRINT_NUMBER.md"
    exit 1
fi

echo "✅ Sprint number validation passed: $SPRINT_NUMBER"
echo "SPRINT_NUMBER=$SPRINT_NUMBER" > /tmp/claudia_sprint_context
'

## Create Sprint Document

!bash -c '
source /tmp/claudia_sprint_context
TIMESTAMP=$(date)

echo ""
echo "📄 Creating sprint document..."

# Create sprint document
cat > "docs/3-sprints/$SPRINT_NUMBER.md" << EOF
# Sprint $SPRINT_NUMBER

**Sprint Number:** $SPRINT_NUMBER  
**Created:** $TIMESTAMP  
**Status:** Active  

## Sprint Goals

*Define the main objectives and goals for this sprint*

## Requirements

*List of requirements planned for this sprint*

<!-- Requirements will be added automatically when created with --sprint parameter -->

## Sprint Metrics

- **Planned Requirements:** 0
- **Completed Requirements:** 0
- **Planned Tickets:** 0
- **Completed Tickets:** 0

## Sprint Timeline

**Start Date:** $TIMESTAMP  
**End Date:** *To be defined*  
**Duration:** *To be defined*  

## Notes

*Sprint-specific notes, decisions, and important information*

---
*Created by Claudia Automation System - $TIMESTAMP*
EOF

echo "✅ Sprint document created: docs/3-sprints/$SPRINT_NUMBER.md"
'

## Initialize Sprint Logging

!bash -c '
source /tmp/claudia_sprint_context
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)

echo ""
echo "📊 Initializing sprint logging..."

# Create sprints-log.jsonl if it doesnt exist
touch .claude-shared/project-management/data/sprints-log.jsonl

# Log sprint creation
echo "{\"timestamp\":\"$TIMESTAMP\",\"action\":\"sprint_created\",\"sprint_number\":\"$SPRINT_NUMBER\",\"status\":\"active\",\"planned_requirements\":0,\"completed_requirements\":0,\"planned_tickets\":0,\"completed_tickets\":0}" >> .claude-shared/project-management/data/sprints-log.jsonl

echo "✅ Sprint logging initialized"
'

## Generate Sprint Summary

!bash -c '
source /tmp/claudia_sprint_context

echo ""
echo "✅ **Sprint Creation Complete**"
echo ""
echo "**Sprint Details:**"
echo "- **Number:** $SPRINT_NUMBER"
echo "- **Document:** docs/3-sprints/$SPRINT_NUMBER.md"
echo "- **Status:** Active"
echo "- **Requirements:** 0 (ready for requirements creation)"
echo ""
echo "**Next Steps:**"
echo "1. 📋 Create requirements: /claudia:requirements:define \"description\" --sprint $SPRINT_NUMBER"
echo "2. ✏️ Edit sprint document to add goals and timeline"
echo "3. 📝 Update sprint document with specific objectives"
echo ""
echo "**Sprint Document Structure:**"
echo "- 📄 Sprint goals and objectives"
echo "- 📋 Requirements list (auto-populated)"
echo "- 📊 Sprint metrics tracking"
echo "- ⏱️ Timeline information"
echo ""
echo "**Sprint ready for requirement creation with --sprint $SPRINT_NUMBER parameter**"
'

## Cleanup

!bash -c 'rm -f /tmp/claudia_sprint_context'

!echo "🚀 Sprint creation workflow completed successfully"
!echo "📝 Sprint document ready for requirements and planning"
!echo "📊 Sprint tracking initialized in audit system"