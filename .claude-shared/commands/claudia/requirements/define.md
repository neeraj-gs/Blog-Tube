---
description: "Define structured requirements with sprint-based UUID tracking"
allowed-tools: ["Write", "Read", "Bash", "Edit"]
---

# 📋 Requirements Definition

Create a comprehensive, structured requirement document with sprint-based UUID tracking and interactive planning mode.

## Processing Requirements for: $ARGUMENTS

!bash -c 'echo "🔍 Analyzing requirement definition request: $ARGUMENTS"'

## Parse Arguments and Validate Sprint

!bash -c '
# Parse arguments: description --sprint XXX [--planning planning-doc]
DESCRIPTION=""
SPRINT_NUMBER=""
PLANNING_DOC=""

# Parse all arguments
ARGS=($ARGUMENTS)
i=0
while [ $i -lt ${#ARGS[@]} ]; do
    case "${ARGS[$i]}" in
        --sprint)
            i=$((i + 1))
            SPRINT_NUMBER="${ARGS[$i]}"
            ;;
        --planning)
            i=$((i + 1))
            PLANNING_DOC="${ARGS[$i]}"
            ;;
        *)
            if [ -z "$DESCRIPTION" ]; then
                DESCRIPTION="${ARGS[$i]}"
            else
                DESCRIPTION="$DESCRIPTION ${ARGS[$i]}"
            fi
            ;;
    esac
    i=$((i + 1))
done

# Clean up description (remove quotes if present)
DESCRIPTION=$(echo "$DESCRIPTION" | sed "s/^[\"']//" | sed "s/[\"']$//")

# Validate required parameters
if [ -z "$SPRINT_NUMBER" ]; then
    echo "❌ ERROR: Sprint number is required"
    echo "Usage: /claudia:requirements:define \"description\" --sprint 030"
    echo "       /claudia:requirements:define --sprint 030 --planning planning-doc"
    exit 1
fi

# Validate sprint number format
if [[ ! "$SPRINT_NUMBER" =~ ^[0-9]{3}$ ]]; then
    echo "❌ ERROR: Sprint number must be 3 digits (e.g., 030, 031, 032)"
    exit 1
fi

# Check if sprint exists
if [ ! -f ".claude-shared/project-management/3-sprints/$SPRINT_NUMBER.md" ]; then
    echo "❌ ERROR: Sprint $SPRINT_NUMBER does not exist"
    echo "Create it first: /claudia:sprint:create \"$SPRINT_NUMBER\""
    exit 1
fi

echo "✅ Arguments validated"
echo "DESCRIPTION=\"$DESCRIPTION\"" > /tmp/claudia_req_context
echo "SPRINT_NUMBER=\"$SPRINT_NUMBER\"" >> /tmp/claudia_req_context
echo "PLANNING_DOC=\"$PLANNING_DOC\"" >> /tmp/claudia_req_context
'

## Interactive Planning Mode

!bash -c '
source /tmp/claudia_req_context

# Enter interactive mode if no description provided
if [ -z "$DESCRIPTION" ]; then
    echo ""
    echo "🤖 **Interactive Requirements Planning Mode**"
    echo ""
    echo "I will help you define a comprehensive requirement. Please provide:"
    echo ""
    
    # Get requirement title
    echo -n "1. Requirement Title: "
    read REQUIREMENT_TITLE
    DESCRIPTION="$REQUIREMENT_TITLE"
    
    # Get problem statement
    echo -n "2. Problem Statement (what problem does this solve?): "
    read PROBLEM_STATEMENT
    
    # Get target users
    echo -n "3. Primary Target Users: "
    read PRIMARY_USERS
    
    # Get complexity estimate
    echo "4. Estimated Complexity:"
    echo "   a) Low (simple feature, minimal changes)"
    echo "   b) Medium (moderate feature, some database/API changes)"
    echo "   c) High (complex feature, significant system changes)"
    echo -n "   Select (a/b/c): "
    read COMPLEXITY_INPUT
    
    case "$COMPLEXITY_INPUT" in
        a|A) COMPLEXITY="Low" ;;
        b|B) COMPLEXITY="Medium" ;;
        c|C) COMPLEXITY="High" ;;
        *) COMPLEXITY="Medium" ;;
    esac
    
    # Get main functional requirements
    echo -n "5. Main Functional Requirements (comma-separated): "
    read FUNCTIONAL_REQS
    
    echo ""
    echo "✅ Interactive input collected"
    
    # Update context with interactive data
    cat >> /tmp/claudia_req_context << EOF
PROBLEM_STATEMENT="$PROBLEM_STATEMENT"
PRIMARY_USERS="$PRIMARY_USERS"
COMPLEXITY="$COMPLEXITY"
FUNCTIONAL_REQS="$FUNCTIONAL_REQS"
INTERACTIVE_MODE="true"
EOF
else
    echo "INTERACTIVE_MODE=\"false\"" >> /tmp/claudia_req_context
fi

echo "DESCRIPTION=\"$DESCRIPTION\"" >> /tmp/claudia_req_context
'

## Generate Sprint-Based UUID

!bash -c '
source /tmp/claudia_req_context

# Generate next requirement number for this sprint
mkdir -p .claude-shared/project-management/4-requirements
EXISTING_REQS=0
if ls .claude-shared/project-management/4-requirements/$SPRINT_NUMBER-*.md 1> /dev/null 2>&1; then
    EXISTING_REQS=$(ls .claude-shared/project-management/4-requirements/$SPRINT_NUMBER-*.md | wc -l)
fi
NEXT_REQ_NUM=$(printf "%02d" $((EXISTING_REQS + 1)))

# Create safe slug from description
SAFE_SLUG=$(echo "$DESCRIPTION" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9 ]//g' | tr ' ' '-' | sed 's/--*/-/g' | sed 's/^-\|-$//g' | cut -c1-30)

REQ_UUID="$SPRINT_NUMBER-$NEXT_REQ_NUM-$SAFE_SLUG"

echo "📝 Generated sprint-based UUID: $REQ_UUID"
echo "REQ_UUID=\"$REQ_UUID\"" >> /tmp/claudia_req_context
'

## Create Requirement Document

!bash -c '
source /tmp/claudia_req_context
TIMESTAMP=$(date)

echo ""
echo "📄 Creating requirement document..."

# Create requirement document with interactive or basic content
mkdir -p .claude-shared/project-management/4-requirements
cat > ".claude-shared/project-management/4-requirements/$REQ_UUID.md" << EOF
# $DESCRIPTION

**Requirement ID:** \`$REQ_UUID\`  
**Sprint:** $SPRINT_NUMBER  
**Created:** $TIMESTAMP  
**Status:** Draft  
$(if [ -n "$PLANNING_DOC" ]; then echo "**Planning Document:** $PLANNING_DOC"; fi)

## Problem Statement

$(if [ "$INTERACTIVE_MODE" = "true" ]; then echo "$PROBLEM_STATEMENT"; else echo "[Describe the problem this requirement solves]"; fi)

## Target Users

- **Primary Users:** $(if [ "$INTERACTIVE_MODE" = "true" ]; then echo "$PRIMARY_USERS"; else echo "[Who will use this feature?]"; fi)
- **Secondary Users:** $(if [ "$INTERACTIVE_MODE" = "true" ]; then echo "[Secondary stakeholders affected]"; else echo "[Who else is affected?]"; fi)

## Success Criteria

### Functional Requirements
$(if [ "$INTERACTIVE_MODE" = "true" ]; then
    echo "$FUNCTIONAL_REQS" | sed "s/,/\n2./g" | sed "s/^/1. /" | head -5
else
    echo "1. [Requirement 1 - What must the system do?]"
    echo "2. [Requirement 2]" 
    echo "3. [Requirement 3]"
fi)

### Non-Functional Requirements
- **Performance:** [Response time, throughput requirements]
- **Security:** [Authentication, authorization, data protection]
- **Scalability:** [Expected load, growth requirements]
- **Compatibility:** [Browser support, API versioning]

## Detailed Specification

### User Stories
1. **As a** [user type], **I want** [goal], **so that** [benefit]
2. **As a** [user type], **I want** [goal], **so that** [benefit]

### Acceptance Criteria
Given [context]  
When [action]  
Then [expected outcome]

### Business Rules
- [Rule 1: Constraints and business logic]
- [Rule 2: Validation requirements]

## Technical Considerations

### Database Changes
- [ ] New models required
- [ ] Schema migrations needed
- [ ] Index optimization required

### API Changes
- [ ] New endpoints required
- [ ] Existing endpoint modifications
- [ ] Breaking changes (version bump needed)

### External Integrations
- [ ] AWS services (S3, SES, etc.)
- [ ] Third-party APIs
- [ ] Socket.IO real-time features

### Frontend Impact
- [ ] New UI components needed
- [ ] Existing component modifications
- [ ] Mobile responsiveness required

## Scope & Boundaries

### In Scope
- [What will be implemented in this requirement]

### Out of Scope
- [What will NOT be implemented]
- [Future considerations]

## Risk Assessment

### Technical Risks
- **Risk 1:** [Description and mitigation strategy]
- **Risk 2:** [Description and mitigation strategy]

### Business Risks
- **Risk 1:** [Impact and mitigation]
- **Risk 2:** [Impact and mitigation]

## Dependencies

### Internal Dependencies
- [ ] [Other requirements or features this depends on]

### External Dependencies
- [ ] [Third-party services, APIs, or tools required]

## Testing Strategy

### Test Coverage Required
- [ ] Unit tests for business logic
- [ ] Integration tests for API endpoints
- [ ] E2E tests for user workflows
- [ ] Performance testing for scalability
- [ ] Security testing for vulnerabilities

## Implementation Notes

### Estimated Complexity: $(if [ "$INTERACTIVE_MODE" = "true" ]; then echo "$COMPLEXITY"; else echo "[Low/Medium/High]"; fi)

### Suggested Implementation Order
1. [Phase 1: Core functionality]
2. [Phase 2: Additional features]
3. [Phase 3: Optimization and polish]

---

## Traceability

**Sprint:** $SPRINT_NUMBER  
**Requirement UUID:** \`$REQ_UUID\`  
**Related Tickets:** (Will be populated by /claudia:tickets:create)  
**Implementation Commits:** (Will be populated by /claudia:commit)  
**Documentation Updates:** (Will be populated by /claudia:docs:update)

---
*Generated by Claudia Automation System - $TIMESTAMP*
EOF

echo "✅ Created requirement document: docs/4-requirements/$REQ_UUID.md"
'

## Update Sprint Document

!bash -c '
source /tmp/claudia_req_context

echo ""
echo "📄 Updating sprint document..."

# Add requirement to sprint document
if ! grep -q "^- \[\`$REQ_UUID\`\]" ".claude-shared/project-management/3-sprints/$SPRINT_NUMBER.md"; then
    # Add to requirements section
    sed -i "/<!-- Requirements will be added automatically when created with --sprint parameter -->/a - [\`$REQ_UUID\`](../4-requirements/$REQ_UUID.md) - $DESCRIPTION" ".claude-shared/project-management/3-sprints/$SPRINT_NUMBER.md"
    
    # Update metrics
    CURRENT_PLANNED=$(grep "Planned Requirements:" ".claude-shared/project-management/3-sprints/$SPRINT_NUMBER.md" | grep -o "[0-9]*")
    NEW_PLANNED=$((CURRENT_PLANNED + 1))
    sed -i "s/\*\*Planned Requirements:\*\* [0-9]*/\*\*Planned Requirements:\*\* $NEW_PLANNED/" ".claude-shared/project-management/3-sprints/$SPRINT_NUMBER.md"
    
    echo "✅ Updated sprint document with new requirement"
else
    echo "ℹ️  Requirement already exists in sprint document"
fi
'

## Log Requirement Creation

!bash -c '
source /tmp/claudia_req_context
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)

echo ""
echo "📊 Logging requirement creation..."

# Log to requirements log
echo "{\"timestamp\":\"$TIMESTAMP\",\"action\":\"created\",\"uuid\":\"$REQ_UUID\",\"sprint\":\"$SPRINT_NUMBER\",\"title\":\"$DESCRIPTION\",\"file\":\"docs/4-requirements/$REQ_UUID.md\",\"status\":\"draft\",\"interactive_mode\":$INTERACTIVE_MODE,\"planning_doc\":\"$PLANNING_DOC\"}" >> .claude-shared/project-management/data/requirements-log.jsonl

# Log to sprints log
echo "{\"timestamp\":\"$TIMESTAMP\",\"action\":\"requirement_added\",\"sprint_number\":\"$SPRINT_NUMBER\",\"requirement_uuid\":\"$REQ_UUID\",\"requirement_title\":\"$DESCRIPTION\"}" >> .claude-shared/project-management/data/sprints-log.jsonl

echo "✅ Logged requirement creation to audit system"
'

## Generate Summary

!bash -c '
source /tmp/claudia_req_context

echo ""
echo "✅ **Requirement Definition Complete**"
echo ""
echo "**Created:**"
echo "- 📄 Requirement Document: docs/4-requirements/$REQ_UUID.md"
echo "- 🚀 Added to Sprint: .claude-shared/project-management/3-sprints/$SPRINT_NUMBER.md"
echo "- 📊 Audit Logs: requirements-log.jsonl, sprints-log.jsonl"
echo ""
echo "**Requirement Details:**"
echo "- **UUID:** \`$REQ_UUID\`"
echo "- **Sprint:** $SPRINT_NUMBER"
echo "- **Title:** $DESCRIPTION"
if [ "$INTERACTIVE_MODE" = "true" ]; then
echo "- **Complexity:** $COMPLEXITY"
echo "- **Interactive Mode:** Enabled"
fi
if [ -n "$PLANNING_DOC" ]; then
echo "- **Planning Document:** $PLANNING_DOC"
fi
echo ""
echo "**Next Steps:**"
echo "1. 📝 Review and refine the requirement document"
echo "2. 🎫 Create tickets: /claudia:tickets:create \"$REQ_UUID\" --env dev"
echo "3. 📋 Assign tickets: /claudia:tickets:assign \"ticket-uuid\""
echo ""
echo "**Sprint Status Updated:**"
echo "- Sprint $SPRINT_NUMBER now has this requirement listed"
echo "- Sprint metrics updated with new planned requirement"
'

## Cleanup

!bash -c 'rm -f /tmp/claudia_req_context'

!echo "📋 Requirement definition workflow completed successfully"
!echo "🚀 Sprint-based traceability established"
!echo "📝 Ready for ticket breakdown and implementation planning"