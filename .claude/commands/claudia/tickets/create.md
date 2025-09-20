---
description: "Break down requirements into actionable tickets with sprint-based UUID tracking and environment specification"
allowed-tools: ["Read", "Write", "Bash", "Edit"]
---

# 🎫 Ticket Creation & Breakdown

Analyze sprint-based requirement document and break it down into actionable development tickets with environment awareness and auto-detected branch types.

## Processing Requirement: $ARGUMENTS

!bash -c 'echo "🔍 Analyzing requirement for ticket breakdown: $ARGUMENTS"'

## Parse Arguments and Validate

!bash -c '
# Parse arguments: requirement-uuid --env dev|staging
REQ_UUID=""
TARGET_ENV=""

# Parse all arguments
ARGS=($ARGUMENTS)
i=0
while [ $i -lt ${#ARGS[@]} ]; do
    case "${ARGS[$i]}" in
        --env)
            i=$((i + 1))
            TARGET_ENV="${ARGS[$i]}"
            ;;
        *)
            if [ -z "$REQ_UUID" ]; then
                REQ_UUID="${ARGS[$i]}"
            fi
            ;;
    esac
    i=$((i + 1))
done

# Clean up requirement UUID (remove quotes if present)
REQ_UUID=$(echo "$REQ_UUID" | sed "s/^[\"']//" | sed "s/[\"']$//")

# Validate required parameters
if [ -z "$REQ_UUID" ]; then
    echo "❌ ERROR: Requirement UUID is required"
    echo "Usage: /claudia:tickets:create \"030-01-feature\" --env dev"
    exit 1
fi

if [ -z "$TARGET_ENV" ]; then
    echo "❌ ERROR: Target environment is required"
    echo "Usage: /claudia:tickets:create \"$REQ_UUID\" --env dev"
    echo "       /claudia:tickets:create \"$REQ_UUID\" --env staging"
    exit 1
fi

# Validate environment
if [[ ! "$TARGET_ENV" =~ ^(dev|staging)$ ]]; then
    echo "❌ ERROR: Environment must be \"dev\" or \"staging\""
    exit 1
fi

# Validate sprint-based UUID format (XXX-YY-description)
if [[ ! "$REQ_UUID" =~ ^[0-9]{3}-[0-9]{2}-.+ ]]; then
    echo "❌ ERROR: Invalid requirement UUID format. Expected: XXX-YY-description (e.g., 030-01-feature)"
    exit 1
fi

# Check if requirement document exists
if [ ! -f "docs/4-requirements/$REQ_UUID.md" ]; then
    echo "❌ ERROR: Requirement document not found: docs/4-requirements/$REQ_UUID.md"
    echo "Please run: /claudia:requirements:define first"
    exit 1
fi

echo "✅ Arguments validated"
echo "REQ_UUID=\"$REQ_UUID\"" > /tmp/claudia_ticket_context
echo "TARGET_ENV=\"$TARGET_ENV\"" >> /tmp/claudia_ticket_context
'

## Extract Sprint Information

!bash -c '
source /tmp/claudia_ticket_context

# Extract sprint number from requirement UUID
SPRINT_NUMBER=$(echo "$REQ_UUID" | cut -d"-" -f1)
REQ_NUMBER=$(echo "$REQ_UUID" | cut -d"-" -f2)

# Verify sprint exists
if [ ! -f "docs/3-sprints/$SPRINT_NUMBER.md" ]; then
    echo "❌ ERROR: Sprint $SPRINT_NUMBER not found"
    exit 1
fi

echo "📊 Sprint information extracted"
echo "- Sprint: $SPRINT_NUMBER"
echo "- Requirement: $REQ_NUMBER"
echo "- Target Environment: $TARGET_ENV"

echo "SPRINT_NUMBER=\"$SPRINT_NUMBER\"" >> /tmp/claudia_ticket_context
echo "REQ_NUMBER=\"$REQ_NUMBER\"" >> /tmp/claudia_ticket_context
'

## Analyze Requirement Document

!bash -c '
source /tmp/claudia_ticket_context
echo ""
echo "📊 Analyzing requirement complexity and structure..."

# Read the requirement document
REQ_CONTENT=$(cat "docs/4-requirements/$REQ_UUID.md")
REQ_TITLE=$(echo "$REQ_CONTENT" | head -1 | sed "s/^# //")

# Analyze technical sections to determine ticket breakdown and branch types
DATABASE_NEEDED=$(echo "$REQ_CONTENT" | grep -c "New models required\|Schema migrations needed\|Index optimization required")
API_NEEDED=$(echo "$REQ_CONTENT" | grep -c "New endpoints required\|endpoint modifications") 
FRONTEND_NEEDED=$(echo "$REQ_CONTENT" | grep -c "New UI components\|component modifications")
TESTING_NEEDED=1  # Always need testing

# Analyze for branch type determination
SECURITY_KEYWORDS=$(echo "$REQ_CONTENT" | grep -ic "security\|auth\|vulnerab\|encrypt\|permission")
BUG_KEYWORDS=$(echo "$REQ_CONTENT" | grep -ic "fix\|bug\|error\|issue\|problem")
HOTFIX_KEYWORDS=$(echo "$REQ_CONTENT" | grep -ic "critical\|urgent\|hotfix\|production")
REFACTOR_KEYWORDS=$(echo "$REQ_CONTENT" | grep -ic "refactor\|cleanup\|optimize\|restructure")
DOCS_KEYWORDS=$(echo "$REQ_CONTENT" | grep -ic "documentation\|readme\|guide\|docs")
RELEASE_KEYWORDS=$(echo "$REQ_CONTENT" | grep -ic "release\|deploy\|version\|milestone")

# Determine primary branch type
if [ $HOTFIX_KEYWORDS -gt 0 ]; then
    PRIMARY_BRANCH_TYPE="hotfix"
elif [ $BUG_KEYWORDS -gt $SECURITY_KEYWORDS ] && [ $BUG_KEYWORDS -gt 1 ]; then
    PRIMARY_BRANCH_TYPE="fix"
elif [ $SECURITY_KEYWORDS -gt 1 ]; then
    PRIMARY_BRANCH_TYPE="security" 
elif [ $REFACTOR_KEYWORDS -gt 1 ]; then
    PRIMARY_BRANCH_TYPE="refactor"
elif [ $DOCS_KEYWORDS -gt 1 ]; then
    PRIMARY_BRANCH_TYPE="docs"
elif [ $RELEASE_KEYWORDS -gt 0 ]; then
    PRIMARY_BRANCH_TYPE="release"
else
    PRIMARY_BRANCH_TYPE="feature"  # Default
fi

echo "📈 Analysis Results:"
echo "- Database work needed: $DATABASE_NEEDED items"
echo "- API work needed: $API_NEEDED items"
echo "- Frontend work needed: $FRONTEND_NEEDED items" 
echo "- Testing work needed: $TESTING_NEEDED items"
echo "- Primary branch type: $PRIMARY_BRANCH_TYPE"

# Save analysis results
echo "REQ_TITLE=\"$REQ_TITLE\"" >> /tmp/claudia_ticket_context
echo "DATABASE_NEEDED=$DATABASE_NEEDED" >> /tmp/claudia_ticket_context
echo "API_NEEDED=$API_NEEDED" >> /tmp/claudia_ticket_context
echo "FRONTEND_NEEDED=$FRONTEND_NEEDED" >> /tmp/claudia_ticket_context
echo "TESTING_NEEDED=$TESTING_NEEDED" >> /tmp/claudia_ticket_context
echo "PRIMARY_BRANCH_TYPE=\"$PRIMARY_BRANCH_TYPE\"" >> /tmp/claudia_ticket_context
'

## Generate Ticket Breakdown Strategy

!bash -c '
source /tmp/claudia_ticket_context
echo ""
echo "🎯 Generating ticket breakdown strategy..."

# Determine ticket breakdown approach
TOTAL_COMPLEXITY=$((DATABASE_NEEDED + API_NEEDED + FRONTEND_NEEDED))

if [ $TOTAL_COMPLEXITY -gt 3 ]; then
    APPROACH="complex"
    echo "📋 Complex feature detected - creating specialized tickets"
elif [ $TOTAL_COMPLEXITY -gt 1 ]; then
    APPROACH="standard"
    echo "📋 Standard feature - creating layered tickets"
else
    APPROACH="simple"
    echo "📋 Simple feature - creating focused tickets"
fi

echo "APPROACH=$APPROACH" >> /tmp/claudia_ticket_context
'

## Create Ticket Documents

!bash -c '
source /tmp/claudia_ticket_context
TIMESTAMP=$(date)

# Ensure directories exist
mkdir -p docs/5-tickets

# Generate next ticket number for this requirement  
EXISTING_TICKETS=$(find docs/5-tickets/ -name "$REQ_UUID-*.md" 2>/dev/null | wc -l | tr -d " ")
NEXT_TICKET_NUM=$(printf "%02d" $((EXISTING_TICKETS + 1)))

TICKET_COUNTER=0
TICKETS_CREATED=""

# Function to create a ticket
create_ticket() {
    local TICKET_TYPE="$1"
    local TICKET_TITLE="$2"
    local TICKET_DESC="$3"
    local COMPLEXITY="$4"
    local BRANCH_TYPE="$5"
    
    CURRENT_TICKET_NUM=$(printf "%02d" $((EXISTING_TICKETS + TICKET_COUNTER + 1)))
    TICKET_UUID="$REQ_UUID-$CURRENT_TICKET_NUM-$(echo "$TICKET_TYPE" | tr "[:upper:]" "[:lower:]")"
    TICKET_COUNTER=$((TICKET_COUNTER + 1))
    
    # Create ticket document
    cat > "docs/5-tickets/$TICKET_UUID.md" << EOF
# $TICKET_TITLE

**Ticket ID:** \`$TICKET_UUID\`  
**Requirement:** \`$REQ_UUID\` - $REQ_TITLE  
**Sprint:** $SPRINT_NUMBER  
**Type:** $TICKET_TYPE  
**Target Environment:** $TARGET_ENV  
**Branch Type:** $BRANCH_TYPE  
**Complexity:** $COMPLEXITY  
**Created:** $TIMESTAMP  
**Status:** Created  

## Description

$TICKET_DESC

## Environment & Branching

**Target Environment:** $TARGET_ENV  
**Branch Name:** $BRANCH_TYPE/$TICKET_UUID  
**Base Branch:** $TARGET_ENV  
**PR Target:** $TARGET_ENV  

## Acceptance Criteria

### Functional Requirements
- [ ] Core functionality implemented according to requirement specifications
- [ ] Input validation and error handling properly implemented
- [ ] Business logic follows established patterns in codebase

### Technical Requirements
- [ ] Code follows project conventions (ES modules, async/await)
- [ ] Proper error handling with centralized response handlers
- [ ] Security considerations implemented (authentication, input sanitization)

### Testing Requirements
- [ ] Unit tests written with >90% coverage
- [ ] Integration tests for API endpoints (if applicable)
- [ ] Test data fixtures created for realistic scenarios
- [ ] All tests pass before PR submission

### Documentation Requirements
- [ ] Code properly documented with JSDoc comments
- [ ] API documentation updated (if endpoints changed)
- [ ] Implementation notes added to requirement document

## Technical Implementation Notes

### Dependencies
- Must be completed after: [List any blocking tickets]
- Blocks the following tickets: [List dependent tickets]

### Code Areas to Modify
- **Controllers:** [Which controller files need changes]
- **Services:** [Which service files need changes]
- **Models:** [Which model files need changes]  
- **Routes:** [Which route files need changes]

### Database Considerations
- [ ] New models or schema changes needed
- [ ] Migrations required for data structure changes
- [ ] Indexes needed for query optimization

### Testing Strategy
- **Unit Tests:** Focus on business logic in services
- **Integration Tests:** Test complete API workflows
- **Mock Strategy:** Mock external dependencies (AWS, third-party APIs)

## Definition of Done

- [ ] Feature implemented according to acceptance criteria
- [ ] All tests pass (unit, integration, existing regression tests)
- [ ] Code review completed and approved
- [ ] Documentation updated
- [ ] No security vulnerabilities introduced
- [ ] Performance impact assessed and acceptable

---

## Traceability

**Sprint:** $SPRINT_NUMBER  
**Requirement UUID:** \`$REQ_UUID\`  
**Ticket UUID:** \`$TICKET_UUID\`  
**GitHub Issue:** (Will be populated by /claudia:tickets:assign)  
**Notion Page:** (Will be populated by /claudia:tickets:assign)  
**Implementation PR:** (Will be populated by /claudia:commit)  

---
*Generated by Claudia Automation System - $TIMESTAMP*
EOF

    # Log ticket creation
    TIMESTAMP_ISO=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    echo "{\"timestamp\":\"$TIMESTAMP_ISO\",\"action\":\"created\",\"uuid\":\"$TICKET_UUID\",\"requirement_uuid\":\"$REQ_UUID\",\"sprint\":\"$SPRINT_NUMBER\",\"title\":\"$TICKET_TITLE\",\"type\":\"$TICKET_TYPE\",\"branch_type\":\"$BRANCH_TYPE\",\"target_env\":\"$TARGET_ENV\",\"complexity\":\"$COMPLEXITY\",\"file\":\"docs/5-tickets/$TICKET_UUID.md\",\"status\":\"created\"}" >> .claude-shared/project-management/data/tickets-log.jsonl
    
    TICKETS_CREATED="$TICKETS_CREATED $TICKET_UUID"
    echo "✅ Created ticket: $TICKET_UUID - $TICKET_TITLE"
}

# Create tickets based on analysis
echo ""
echo "🎫 Creating tickets for requirement: $REQ_TITLE"
echo ""

# Create tickets with appropriate branch types
if [ $DATABASE_NEEDED -gt 0 ]; then
    DB_BRANCH_TYPE="$PRIMARY_BRANCH_TYPE"
    if [ "$PRIMARY_BRANCH_TYPE" = "feature" ] && [ $DATABASE_NEEDED -gt 1 ]; then
        DB_BRANCH_TYPE="chore"  # Database setup is often chore work
    fi
    create_ticket "Database" "Database schema and models for $REQ_TITLE" "Implement database models, migrations, and schema changes required for this feature. Follow existing model patterns and ensure proper indexing for performance." "Medium" "$DB_BRANCH_TYPE"
fi

if [ $API_NEEDED -gt 0 ]; then
    create_ticket "API" "API endpoints for $REQ_TITLE" "Implement REST API endpoints with proper validation, authentication, and error handling. Use centralized response handlers and follow existing controller/service patterns." "Medium" "$PRIMARY_BRANCH_TYPE"
fi

if [ $FRONTEND_NEEDED -gt 0 ]; then
    create_ticket "Frontend" "UI components for $REQ_TITLE" "Implement user interface components following existing design patterns. Ensure responsive design and accessibility standards." "Medium" "$PRIMARY_BRANCH_TYPE"
fi

# Always create testing ticket
create_ticket "Testing" "Comprehensive testing for $REQ_TITLE" "Create complete test suite including unit tests for services, integration tests for APIs, and end-to-end tests for user workflows. Ensure >90% coverage." "Low" "test"

# If simple feature, create a single implementation ticket
if [ "$APPROACH" = "simple" ]; then
    create_ticket "Implementation" "Full implementation of $REQ_TITLE" "Complete end-to-end implementation of the feature including all necessary code changes, following TDD methodology." "Medium" "$PRIMARY_BRANCH_TYPE"
fi

# Save created tickets list
echo "TICKETS_CREATED=\"$TICKETS_CREATED\"" >> /tmp/claudia_ticket_context
echo "TICKET_COUNT=$TICKET_COUNTER" >> /tmp/claudia_ticket_context
'

## Update Requirement Document with Ticket Links

!bash -c '
source /tmp/claudia_ticket_context

echo ""
echo "🔗 Linking tickets to requirement document..."

# Update requirement document with ticket references
TICKET_LINKS=""
for TICKET_UUID in $TICKETS_CREATED; do
    TICKET_TITLE=$(grep "^# " "docs/5-tickets/$TICKET_UUID.md" | sed "s/^# //")
    TICKET_LINKS="$TICKET_LINKS- [\`$TICKET_UUID\`](../5-tickets/$TICKET_UUID.md) - $TICKET_TITLE\n"
done

# Update the requirement document traceability section
sed -i "s/\*\*Related Tickets:\*\* (Will be populated by \/claudia:tickets:create)/\*\*Related Tickets:\*\*\n$TICKET_LINKS/" "docs/4-requirements/$REQ_UUID.md"

echo "✅ Updated requirement document with ticket links"
'

## Update Sprint Document

!bash -c '
source /tmp/claudia_ticket_context

echo ""
echo "📄 Updating sprint document..."

# Update sprint metrics
SPRINT_FILE="docs/3-sprints/$SPRINT_NUMBER.md"
CURRENT_PLANNED_TICKETS=$(grep "Planned Tickets:" "$SPRINT_FILE" | grep -o "[0-9]*")
NEW_PLANNED_TICKETS=$((CURRENT_PLANNED_TICKETS + TICKET_COUNT))

sed -i "s/\*\*Planned Tickets:\*\* [0-9]*/\*\*Planned Tickets:\*\* $NEW_PLANNED_TICKETS/" "$SPRINT_FILE"

# Log sprint update
TIMESTAMP_ISO=$(date -u +%Y-%m-%dT%H:%M:%SZ)  
echo "{\"timestamp\":\"$TIMESTAMP_ISO\",\"action\":\"tickets_added\",\"sprint_number\":\"$SPRINT_NUMBER\",\"requirement_uuid\":\"$REQ_UUID\",\"ticket_count\":$TICKET_COUNT,\"target_env\":\"$TARGET_ENV\"}" >> .claude-shared/project-management/data/sprints-log.jsonl

echo "✅ Updated sprint document with ticket metrics"
'

## Generate Tasks Summary JSON

!bash -c '
source /tmp/claudia_ticket_context

echo ""
echo "📋 Generating tasks summary for external systems..."

# Create tasks.json for GitHub/Notion integration
cat > ".claude-shared/project-management/data/tasks-$REQ_UUID.json" << EOF
{
  "requirement_uuid": "$REQ_UUID",
  "requirement_title": "$REQ_TITLE",
  "sprint": "$SPRINT_NUMBER",
  "target_env": "$TARGET_ENV",
  "primary_branch_type": "$PRIMARY_BRANCH_TYPE",
  "created": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "ticket_count": $TICKET_COUNT,
  "tickets": [
EOF

FIRST_TICKET=true
for TICKET_UUID in $TICKETS_CREATED; do
    TICKET_TITLE=$(grep "^# " "docs/5-tickets/$TICKET_UUID.md" | sed "s/^# //")
    TICKET_TYPE=$(grep "^\*\*Type:\*\*" "docs/5-tickets/$TICKET_UUID.md" | sed "s/\*\*Type:\*\* //")
    TICKET_COMPLEXITY=$(grep "^\*\*Complexity:\*\*" "docs/5-tickets/$TICKET_UUID.md" | sed "s/\*\*Complexity:\*\* //")
    BRANCH_TYPE=$(grep "^\*\*Branch Type:\*\*" "docs/5-tickets/$TICKET_UUID.md" | sed "s/\*\*Branch Type:\*\* //")
    
    if [ "$FIRST_TICKET" = "true" ]; then
        FIRST_TICKET=false
    else
        echo "," >> ".claude-shared/project-management/data/tasks-$REQ_UUID.json"
    fi
    
    cat >> ".claude-shared/project-management/data/tasks-$REQ_UUID.json" << EOF
    {
      "uuid": "$TICKET_UUID",
      "title": "$TICKET_TITLE",
      "type": "$TICKET_TYPE",
      "branch_type": "$BRANCH_TYPE",
      "target_env": "$TARGET_ENV",
      "complexity": "$TICKET_COMPLEXITY",
      "file": "docs/5-tickets/$TICKET_UUID.md",
      "status": "created",
      "github_issue": null,
      "notion_page": null
    }EOF
done

cat >> ".claude-shared/project-management/data/tasks-$REQ_UUID.json" << EOF

  ]
}
EOF

echo "✅ Created tasks summary: .claude-shared/project-management/data/tasks-$REQ_UUID.json"
'

## Update Requirement Status

!bash -c '
source /tmp/claudia_ticket_context
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)

# Log requirement status update
echo "{\"timestamp\":\"$TIMESTAMP\",\"action\":\"tickets_created\",\"uuid\":\"$REQ_UUID\",\"sprint\":\"$SPRINT_NUMBER\",\"ticket_count\":$TICKET_COUNT,\"target_env\":\"$TARGET_ENV\",\"status\":\"tickets_ready\"}" >> .claude-shared/project-management/data/requirements-log.jsonl

echo "📊 Updated requirement status in traceability log"
'

## Summary & Next Steps

!bash -c '
source /tmp/claudia_ticket_context

echo ""
echo "✅ **Ticket Creation Complete**"
echo ""
echo "**Created $TICKET_COUNT tickets for requirement:** $REQ_TITLE"
echo "**Sprint:** $SPRINT_NUMBER | **Environment:** $TARGET_ENV | **Primary Branch Type:** $PRIMARY_BRANCH_TYPE"
echo ""
echo "**Tickets Created:**"
for TICKET_UUID in $TICKETS_CREATED; do
    TICKET_TITLE=$(grep "^# " "docs/5-tickets/$TICKET_UUID.md" | sed "s/^# //")
    BRANCH_TYPE=$(grep "^\*\*Branch Type:\*\*" "docs/5-tickets/$TICKET_UUID.md" | sed "s/\*\*Branch Type:\*\* //")
    echo "- 🎫 \`$TICKET_UUID\` - $TICKET_TITLE [$BRANCH_TYPE]"
done
echo ""
echo "**Files Generated:**"
for TICKET_UUID in $TICKETS_CREATED; do
    echo "- 📄 docs/5-tickets/$TICKET_UUID.md"
done
echo "- 📊 .claude-shared/project-management/data/tasks-$REQ_UUID.json"
echo "- 🔗 Updated docs/4-requirements/$REQ_UUID.md with ticket links"
echo "- 🚀 Updated docs/3-sprints/$SPRINT_NUMBER.md with metrics"
echo ""
echo "**Next Steps:**"
echo "1. Review generated tickets for completeness"
echo "2. Assign tickets to GitHub + Notion:"
for TICKET_UUID in $TICKETS_CREATED; do
    echo "   /claudia:tickets:assign \"$TICKET_UUID\""
done
echo ""
echo "**Environment-Aware Workflow:**"
echo "- All tickets configured for $TARGET_ENV environment"
echo "- Branch names: [branch-type]/$TICKET_UUID"
echo "- PR targets: $TARGET_ENV branch"
echo "- Auto-detected branch types based on requirement content"
echo ""
echo "**Full Traceability Maintained:**"
echo "Sprint $SPRINT_NUMBER → Requirement \`$REQ_UUID\` → Tickets → $TARGET_ENV Environment"
'

## Cleanup

!bash -c 'rm -f /tmp/claudia_ticket_context'

!echo "🎫 Ticket creation workflow completed successfully"
!echo "🚀 Sprint-based traceability with environment awareness established"
!echo "📝 Ready for ticket assignment to GitHub and Notion"