---
description: "Create a new sprint with numbered identifier and optionally embed requirements from planning document"
allowed-tools: ["Read", "Write", "Edit", "Bash"]
---

# 🚀 Create New Sprint (Enhanced with Embedded Requirements)

Create a new sprint document with numbered identifier and optionally generate embedded requirements from a planning document.

## Processing Sprint Creation: $ARGUMENTS

!bash -c 'echo "🚀 Creating new sprint: $ARGUMENTS"'

## Parse Arguments and Validate

!bash -c '
# Parse arguments: sprint-number [--with-planning "path/to/planning.md"] [--title "Sprint Title"]
SPRINT_NUMBER=""
PLANNING_DOC=""
SPRINT_TITLE=""

ARGS_STRING="$ARGUMENTS"

# Extract sprint number (first argument)
SPRINT_NUMBER=$(echo "$ARGS_STRING" | awk "{print \$1}" | sed "s/[\"\']//g")

# Extract planning document if provided
if echo "$ARGS_STRING" | grep -q "\--with-planning"; then
    PLANNING_DOC=$(echo "$ARGS_STRING" | sed "s/.*--with-planning //" | awk "{print \$1}" | sed "s/[\"\']//g")
fi

# Extract sprint title if provided
if echo "$ARGS_STRING" | grep -q "\--title"; then
    SPRINT_TITLE=$(echo "$ARGS_STRING" | sed "s/.*--title //" | sed "s/ --.*$//" | sed "s/[\"\']//g")
fi

# Validate sprint number format (3 digits)
if [[ ! "$SPRINT_NUMBER" =~ ^[0-9]{3}$ ]]; then
    echo "❌ ERROR: Sprint number must be 3 digits (e.g., 030, 031, 032)"
    echo "Usage: /claudia:sprint:create \"030\" [--with-planning \"path/to/planning.md\"] [--title \"Sprint Title\"]"
    echo "Received: $ARGUMENTS (cleaned: $SPRINT_NUMBER)"
    exit 1
fi

# Check if sprint already exists
if [ -f ".claude-shared/project-management/3-sprints/$SPRINT_NUMBER.md" ]; then
    echo "❌ ERROR: Sprint $SPRINT_NUMBER already exists"
    echo "Existing file: .claude-shared/project-management/3-sprints/$SPRINT_NUMBER.md"
    exit 1
fi

echo "✅ Sprint number validation passed: $SPRINT_NUMBER"
echo "SPRINT_NUMBER=$SPRINT_NUMBER" > /tmp/claudia_sprint_context
echo "PLANNING_DOC=$PLANNING_DOC" >> /tmp/claudia_sprint_context
echo "SPRINT_TITLE=$SPRINT_TITLE" >> /tmp/claudia_sprint_context

if [ -n "$PLANNING_DOC" ]; then
    echo "📖 Planning document provided: $PLANNING_DOC"
    if [ ! -f "$PLANNING_DOC" ]; then
        echo "⚠️  Warning: Planning document not found: $PLANNING_DOC"
        echo "Will create sprint without embedded requirements"
        echo "PLANNING_DOC=" >> /tmp/claudia_sprint_context
    fi
fi
'

## Read Planning Document (if provided)

!bash -c '
source /tmp/claudia_sprint_context

if [ -n "$PLANNING_DOC" ] && [ -f "$PLANNING_DOC" ]; then
    echo ""
    echo "📖 Reading planning document for requirements extraction..."
    echo "Planning doc: $PLANNING_DOC"

    # Read planning document content
    PLANNING_CONTENT=$(cat "$PLANNING_DOC")

    echo "HAS_PLANNING=true" >> /tmp/claudia_sprint_context
    echo "$PLANNING_CONTENT" > /tmp/planning_content.txt

    echo "✅ Planning document loaded"
else
    echo "HAS_PLANNING=false" >> /tmp/claudia_sprint_context
fi
'

## Create Sprint Document with Embedded Requirements

!bash -c '
source /tmp/claudia_sprint_context
TIMESTAMP=$(date)

echo ""
echo "📄 Creating sprint document..."

# Determine sprint title
if [ -z "$SPRINT_TITLE" ]; then
    SPRINT_TITLE="Sprint $SPRINT_NUMBER"
fi

# Create sprint document
mkdir -p .claude-shared/project-management/3-sprints

if [ "$HAS_PLANNING" = "true" ]; then
    echo "📝 Generating sprint with embedded requirements from planning doc..."

    # Create sprint with template for requirements
    cat > ".claude-shared/project-management/3-sprints/$SPRINT_NUMBER.md" << EOF
# $SPRINT_TITLE

**Sprint Number:** $SPRINT_NUMBER
**Created:** $TIMESTAMP
**Status:** Active
**Planning Document:** \`$PLANNING_DOC\`

## Sprint Goals

*Goals will be extracted from planning document. Edit this section to add specific sprint objectives.*

## Requirements

### Requirement 1: [Title from Planning Doc]
**Priority:** High
**Complexity:** Medium

**Problem Statement:**
[Extract from planning document - describe what problem this solves]

**Success Criteria:**
1. [Criterion 1 from planning doc]
2. [Criterion 2 from planning doc]
3. [Criterion 3 from planning doc]

**Technical Considerations:**
- [Technical note 1]
- [Technical note 2]

**Acceptance Criteria:**
- [ ] [Acceptance criterion 1]
- [ ] [Acceptance criterion 2]
- [ ] [Acceptance criterion 3]

**Related Issues:** (Will be populated when issues are created)

---

### Requirement 2: [Another Requirement]
**Priority:** Medium
**Complexity:** Low

**Problem Statement:**
[Second requirement from planning doc]

**Success Criteria:**
1. [Criterion 1]
2. [Criterion 2]

**Technical Considerations:**
- [Technical consideration]

**Acceptance Criteria:**
- [ ] [Acceptance 1]
- [ ] [Acceptance 2]

**Related Issues:** (Will be populated)

---

*⚠️ Review and refine the requirements above based on planning document: \`$PLANNING_DOC\`*
*Add more requirements as needed by copying the template structure*

## Sprint Metrics

- **Planned Requirements:** 2
- **Completed Requirements:** 0
- **Open Issues:** 0
- **Closed Issues:** 0

## Sprint Timeline

**Start Date:** $TIMESTAMP
**End Date:** *To be defined*
**Duration:** *2 weeks (typical)*

## Notes

*Sprint-specific notes, decisions, and important information*

Planning document content:
\`\`\`
$(head -20 /tmp/planning_content.txt)
... (see full planning doc for complete details)
\`\`\`

---
*Created by Claudia Automation System - $TIMESTAMP*
*Requirements embedded from planning document*
EOF

else
    echo "📝 Creating sprint with template for manual requirements..."

    # Create sprint without planning doc
    cat > ".claude-shared/project-management/3-sprints/$SPRINT_NUMBER.md" << EOF
# $SPRINT_TITLE

**Sprint Number:** $SPRINT_NUMBER
**Created:** $TIMESTAMP
**Status:** Active

## Sprint Goals

*Define the main objectives and goals for this sprint*

## Requirements

### Requirement 1: [Requirement Title]
**Priority:** High / Medium / Low
**Complexity:** Low / Medium / High

**Problem Statement:**
[Describe what problem this requirement solves]

**Success Criteria:**
1. [What must be accomplished]
2. [Key deliverable 2]
3. [Key deliverable 3]

**Technical Considerations:**
- [Technical implementation notes]
- [Technology choices]
- [Architecture decisions]

**Acceptance Criteria:**
- [ ] [Testable criterion 1]
- [ ] [Testable criterion 2]
- [ ] [Testable criterion 3]

**Related Issues:** (Will be populated when issues are created)

---

*Add more requirements by copying the template above*
*Each requirement should be self-contained and implementable*

## Sprint Metrics

- **Planned Requirements:** 1
- **Completed Requirements:** 0
- **Open Issues:** 0
- **Closed Issues:** 0

## Sprint Timeline

**Start Date:** $TIMESTAMP
**End Date:** *To be defined*
**Duration:** *To be defined*

## Notes

*Sprint-specific notes, decisions, and important information*

---
*Created by Claudia Automation System - $TIMESTAMP*
*Requirements can be added directly in this document*
EOF

fi

echo "✅ Sprint document created: .claude-shared/project-management/3-sprints/$SPRINT_NUMBER.md"
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
echo "- **Title:** $SPRINT_TITLE"
echo "- **Document:** .claude-shared/project-management/3-sprints/$SPRINT_NUMBER.md"
echo "- **Status:** Active"

if [ "$HAS_PLANNING" = "true" ]; then
    echo "- **Planning Document:** $PLANNING_DOC"
    echo "- **Requirements:** Embedded in sprint document (template generated)"
else
    echo "- **Requirements:** Template provided in sprint document"
fi

echo ""
echo "**✨ NEW: Requirements are now EMBEDDED in the sprint document!**"
echo ""
echo "**Next Steps:**"
echo "1. ✏️ Edit sprint document to refine requirements:"
echo "   - Open: .claude-shared/project-management/3-sprints/$SPRINT_NUMBER.md"
echo "   - Fill in requirement details based on your planning"
echo "   - Add more requirements by copying the template"
echo ""
echo "2. 📋 Create GitHub issues from requirements:"
echo "   /claudia:issues:create \"$SPRINT_NUMBER\" --requirement 1"
echo "   /claudia:issues:create \"$SPRINT_NUMBER\" --requirement 2"
echo ""
echo "3. 🚀 Or create all issues at once:"
echo "   /claudia:issues:create-from-sprint \"$SPRINT_NUMBER\" --all"
echo ""
echo "**Sprint Document Structure:**"
echo "- 📄 Sprint goals and objectives"
echo "- 📋 Requirements (embedded - no separate files!)"
echo "- 📊 Sprint metrics tracking"
echo "- ⏱️ Timeline information"
echo ""
echo "**⚠️ IMPORTANT CHANGES:**"
echo "- Requirements are NO LONGER in separate 4-requirements/ files"
echo "- All requirements live directly in the sprint document"
echo "- Issues are created from sprint document, not requirements files"
echo "- Each issue gets a copy stored in 5-tickets/ folder"
'

## Cleanup

!bash -c 'rm -f /tmp/claudia_sprint_context /tmp/planning_content.txt'

!echo "🚀 Sprint creation workflow completed successfully"
!echo "📝 Sprint document ready with embedded requirements"
!echo "📊 Sprint tracking initialized in audit system"
!echo "✨ Use /claudia:issues:create to generate issues from sprint requirements"