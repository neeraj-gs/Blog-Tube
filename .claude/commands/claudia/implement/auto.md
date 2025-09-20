---
description: "Enhanced sprint-based automated TDD implementation with multi-commit workflow support"
allowed-tools: ["Read", "Write", "Edit", "Bash", "Task"]
---

# 🤖 Enhanced Sprint-Based Automated TDD Implementation

Implement a sprint-based ticket using Test-Driven Development methodology with automated code generation, multi-commit workflow support, and complete traceability.

## Processing Sprint-Based Ticket: $ARGUMENTS

!bash -c 'echo "🚀 Starting enhanced sprint-based automated TDD implementation for: $ARGUMENTS"'

## Validate Sprint-Based Ticket and Context

!bash -c '
TICKET_UUID="$ARGUMENTS"

# Clean up ticket UUID (remove quotes if present)
TICKET_UUID=$(echo "$TICKET_UUID" | sed "s/^[\"']//" | sed "s/[\"']$//")

# Validate sprint-based UUID format (XXX-YY-ZZ-description)
if [[ ! "$TICKET_UUID" =~ ^[0-9]{3}-[0-9]{2}-[0-9]{2}-.+ ]]; then
    echo "❌ ERROR: Invalid sprint-based ticket UUID format"
    echo "Expected: XXX-YY-ZZ-description (e.g., 030-01-01-database)"
    echo "Received: $TICKET_UUID"
    exit 1
fi

# Check if sprint-based ticket document exists
if [ ! -f "docs/5-tickets/$TICKET_UUID.md" ]; then
    echo "❌ ERROR: Sprint-based ticket document not found: docs/5-tickets/$TICKET_UUID.md"
    echo "Please run: /claudia:tickets:create and /claudia:tickets:assign first"
    exit 1
fi

# Check if ticket is assigned to GitHub (enhanced check)
if ! grep -q "GitHub Issue:" "docs/5-tickets/$TICKET_UUID.md" || ! grep -q "#[0-9]" "docs/5-tickets/$TICKET_UUID.md"; then
    echo "❌ ERROR: Sprint-based ticket not assigned to GitHub"
    echo "Please run: /claudia:tickets:assign \"$TICKET_UUID\" first"
    exit 1
fi

# Check if ticket is in enhanced audit system
if ! grep -q "\"uuid\":\"$TICKET_UUID\"" .claude-shared/project-management/data/tickets-log.jsonl 2>/dev/null; then
    echo "❌ ERROR: Ticket not found in enhanced audit trail"
    echo "Expected in: .claude-shared/project-management/data/tickets-log.jsonl"
    exit 1
fi

echo "✅ Enhanced sprint-based ticket validation passed"
echo "TICKET_UUID=$TICKET_UUID" > /tmp/claudia_implement_context
'

## Extract Enhanced Sprint-Based Ticket and Context

!bash -c '
source /tmp/claudia_implement_context

# Extract enhanced sprint-based ticket details
TICKET_TITLE=$(grep "^# " "docs/5-tickets/$TICKET_UUID.md" | sed "s/^# //" | head -1)
TICKET_TYPE=$(grep "^\*\*Type:\*\*" "docs/5-tickets/$TICKET_UUID.md" | sed "s/\*\*Type:\*\* //" | head -1)
TICKET_COMPLEXITY=$(grep "^\*\*Complexity:\*\*" "docs/5-tickets/$TICKET_UUID.md" | sed "s/\*\*Complexity:\*\* //" | head -1)
REQ_UUID=$(grep "^\*\*Requirement:\*\*" "docs/5-tickets/$TICKET_UUID.md" | sed "s/\*\*Requirement:\*\* \`\([^`]*\)\`.*/\1/" | head -1)
TARGET_ENV=$(grep "^\*\*Target Environment:\*\*" "docs/5-tickets/$TICKET_UUID.md" | sed "s/\*\*Target Environment:\*\* \`\([^`]*\)\`.*/\1/" | head -1)
BRANCH_TYPE=$(grep "^\*\*Branch Type:\*\*" "docs/5-tickets/$TICKET_UUID.md" | sed "s/\*\*Branch Type:\*\* \`\([^`]*\)\`.*/\1/" | head -1)

# Extract GitHub issue with enhanced multi-development support
GITHUB_ISSUE=$(grep "^\*\*GitHub Issue:\*\*" "docs/5-tickets/$TICKET_UUID.md" | sed "s/\*\*GitHub Issue:\*\* #\([0-9]*\).*/\1/" | head -1)

# Extract sprint information
SPRINT_NUMBER=$(echo "$TICKET_UUID" | cut -d"-" -f1)

echo "📋 Enhanced Sprint-Based Implementation Context:"
echo "- Ticket: $TICKET_TITLE"
echo "- Type: $TICKET_TYPE"  
echo "- Complexity: $TICKET_COMPLEXITY"
echo "- Requirement: $REQ_UUID"
echo "- Sprint: $SPRINT_NUMBER"
echo "- Target Environment: $TARGET_ENV"
echo "- Branch Type: $BRANCH_TYPE"
echo "- GitHub Issue: #$GITHUB_ISSUE (supports multi-commit/PR)"

# Save enhanced context with all sprint-based information
cat >> /tmp/claudia_implement_context << EOF
TICKET_TITLE="$TICKET_TITLE"
TICKET_TYPE="$TICKET_TYPE"
TICKET_COMPLEXITY="$TICKET_COMPLEXITY" 
REQ_UUID="$REQ_UUID"
TARGET_ENV="$TARGET_ENV"
BRANCH_TYPE="$BRANCH_TYPE"
GITHUB_ISSUE="$GITHUB_ISSUE"
SPRINT_NUMBER="$SPRINT_NUMBER"
EOF
'

## Read Enhanced Sprint-Based Requirements and Ticket Details

!bash -c '
source /tmp/claudia_implement_context
echo ""
echo "📖 Reading enhanced sprint-based requirement and ticket specifications..."

# Read requirement document from enhanced structure (try both paths)
REQ_CONTENT=""
if [ -f "docs/4-requirements/$REQ_UUID.md" ]; then
    REQ_CONTENT=$(cat "docs/4-requirements/$REQ_UUID.md")
    echo "✅ Enhanced requirement context loaded from docs/4-requirements/"
elif [ -f "4-requirements/$REQ_UUID.md" ]; then
    REQ_CONTENT=$(cat "4-requirements/$REQ_UUID.md")
    echo "✅ Legacy requirement context loaded"
else
    echo "⚠️  Requirement document not found, using ticket context only"
    REQ_CONTENT=""
fi

# Read full ticket specification from enhanced structure
TICKET_CONTENT=$(cat "docs/5-tickets/$TICKET_UUID.md")
echo "✅ Enhanced sprint-based ticket specification loaded"

# Save content for implementation with sprint context
echo "TICKET_CONTENT_FILE=/tmp/ticket_content.md" >> /tmp/claudia_implement_context
echo "$TICKET_CONTENT" > /tmp/ticket_content.md

if [ -n "$REQ_CONTENT" ]; then
    echo "REQ_CONTENT_FILE=/tmp/req_content.md" >> /tmp/claudia_implement_context
    echo "$REQ_CONTENT" > /tmp/req_content.md
fi

# Load sprint context for enhanced implementation guidance
if [ -f "docs/3-sprints/$SPRINT_NUMBER.md" ]; then
    SPRINT_CONTENT=$(cat "docs/3-sprints/$SPRINT_NUMBER.md")
    echo "SPRINT_CONTENT_FILE=/tmp/sprint_content.md" >> /tmp/claudia_implement_context
    echo "$SPRINT_CONTENT" > /tmp/sprint_content.md
    echo "✅ Sprint context loaded for enhanced guidance"
fi
'

## Create Enhanced Sprint-Based Implementation Branch

!bash -c '
source /tmp/claudia_implement_context
echo ""
echo "🌿 Creating enhanced sprint-based implementation branch..."

# Create branch name using auto-detected branch type and ticket UUID
BRANCH_NAME="$BRANCH_TYPE$TICKET_UUID"
echo "BRANCH_NAME=$BRANCH_NAME" >> /tmp/claudia_implement_context

echo "📋 Branch Details:"
echo "- Branch Type: $BRANCH_TYPE (auto-detected)"
echo "- Ticket UUID: $TICKET_UUID"
echo "- Full Branch: $BRANCH_NAME"
echo "- Target Environment: $TARGET_ENV"
echo "- Sprint: $SPRINT_NUMBER"

# Check if branch already exists
if git show-ref --verify --quiet "refs/heads/$BRANCH_NAME"; then
    echo "⚠️  Branch $BRANCH_NAME already exists, switching to it"
    git checkout "$BRANCH_NAME"
    echo "✅ Switched to existing enhanced sprint-based branch"
elif git ls-remote --exit-code --heads origin "$BRANCH_NAME" >/dev/null 2>&1; then
    echo "⚠️  Remote branch exists, checking out"
    git checkout -b "$BRANCH_NAME" "origin/$BRANCH_NAME"
    echo "✅ Checked out existing remote branch"
else
    echo "✅ Creating new enhanced sprint-based branch: $BRANCH_NAME"
    git checkout -b "$BRANCH_NAME"
    echo "✅ Ready for $TARGET_ENV environment development"
fi

echo "📍 Current branch: $(git branch --show-current)"
echo "🎯 Targeting: $TARGET_ENV environment"
echo "🏃 Sprint: $SPRINT_NUMBER context active"
'

## Analyze Implementation Strategy

!bash -c '
source /tmp/claudia_implement_context
echo ""
echo "🎯 Analyzing implementation strategy based on ticket type..."

case "$TICKET_TYPE" in
    "Database")
        IMPL_STRATEGY="database"
        echo "📊 Database implementation strategy selected"
        echo "- Focus: Models, migrations, schema changes"
        echo "- Test approach: Model validation, database operations"
        echo "- Files: models/, migrations (if applicable)"
        ;;
    "API") 
        IMPL_STRATEGY="api"
        echo "🔌 API implementation strategy selected"
        echo "- Focus: Controllers, services, routes, validation"
        echo "- Test approach: Unit tests for services, integration tests for endpoints"
        echo "- Files: controllers/, services/, routes/, validator/"
        ;;
    "Frontend")
        IMPL_STRATEGY="frontend"
        echo "🎨 Frontend implementation strategy selected"
        echo "- Focus: UI components, client-side logic"
        echo "- Test approach: Component tests, user interaction tests"
        echo "- Note: This is a backend-focused system, may need manual implementation"
        ;;
    "Testing")
        IMPL_STRATEGY="testing"
        echo "🧪 Testing implementation strategy selected"
        echo "- Focus: Comprehensive test suite creation"
        echo "- Test approach: Unit, integration, E2E test coverage"
        echo "- Files: __tests__/ directory structure"
        ;;
    *)
        IMPL_STRATEGY="general"
        echo "⚙️ General implementation strategy selected"
        echo "- Focus: Multi-layered implementation"
        echo "- Test approach: Comprehensive testing across all layers"
        ;;
esac

echo "IMPL_STRATEGY=$IMPL_STRATEGY" >> /tmp/claudia_implement_context
'

## TDD Phase 1: Write Failing Tests

!bash -c '
source /tmp/claudia_implement_context
echo ""
echo "🔴 TDD Phase 1: Writing failing tests..."

case "$IMPL_STRATEGY" in
    "database")
        echo "📊 Creating database model tests..."
        echo "⚠️  Database tests require manual analysis of schema requirements"
        echo "Recommended approach:"
        echo "1. Analyze requirement for data models needed"  
        echo "2. Create model test files in api/__tests__/models/"
        echo "3. Test model validation, relationships, methods"
        echo ""
        echo "Run: npm test to see failing tests, then implement models"
        ;;
    "api")
        echo "🔌 Creating API endpoint tests..."
        echo "Creating test structure for API implementation..."
        
        # Create basic test structure
        mkdir -p api/__tests__/controllers api/__tests__/services api/__tests__/routes
        
        echo "✅ Test directories created"
        echo "⚠️  API tests require analysis of endpoint requirements"
        echo "Recommended approach:"
        echo "1. Create controller tests for HTTP request/response"
        echo "2. Create service tests for business logic"  
        echo "3. Create integration tests for full API workflows"
        echo ""
        echo "Run: npm test to see current state, then add failing tests"
        ;;
    "testing")
        echo "🧪 Analyzing existing test coverage..."
        
        # Run test coverage to see gaps
        cd api && npm test -- --coverage --silent 2>/dev/null | grep -E "All files|Lines|Functions|Branches" || echo "Test coverage analysis failed"
        
        echo ""
        echo "✅ Coverage analysis complete"
        echo "Focus areas for test improvement:"
        echo "1. Increase line coverage in services/"
        echo "2. Add integration tests for untested routes"
        echo "3. Re-enable disabled test files (.disabled)"
        echo ""
        ;;
    *)
        echo "⚙️ General test creation approach..."
        echo "1. Analyze ticket requirements"
        echo "2. Identify code areas that need testing"
        echo "3. Create failing tests first (TDD red phase)"
        echo "4. Implement code to pass tests (TDD green phase)"
        ;;
esac
'

## TDD Phase 2: Implement Code to Pass Tests

!bash -c '
source /tmp/claudia_implement_context
echo ""
echo "🟢 TDD Phase 2: Implementing code to pass tests..."

# This is where the actual implementation would happen
# For now, we provide guidance and structure

echo "🤖 Automated implementation guidance:"
echo ""

case "$IMPL_STRATEGY" in
    "database")
        echo "📊 Database Implementation Steps:"
        echo "1. Create/modify models in api/models/"
        echo "2. Follow existing model patterns (Mongoose schemas)"
        echo "3. Add proper validation and indexes"
        echo "4. Test with: npm test"
        ;;
    "api")
        echo "🔌 API Implementation Steps:"
        echo "1. Create/modify controllers in api/controllers/"
        echo "2. Create/modify services in api/services/"
        echo "3. Update routes in api/routes/"
        echo "4. Add validation in api/validator/"
        echo "5. Test with: npm test"
        ;;
    "testing")
        echo "🧪 Testing Implementation Steps:"
        echo "1. Re-enable disabled test files"
        echo "2. Add missing test coverage"
        echo "3. Create integration tests"
        echo "4. Verify with: npm test -- --coverage"
        ;;
esac

echo ""
echo "⚠️  AUTOMATED IMPLEMENTATION PLACEHOLDER"
echo "This is where AI agent would:"
echo "1. Read ticket requirements in detail"
echo "2. Analyze existing codebase patterns"
echo "3. Generate code following TDD methodology"
echo "4. Ensure all tests pass"
echo "5. Follow project conventions from CLAUDE.md"
echo ""
echo "For full automation, integrate with Task tool for complex code generation"
'

## Run Tests and Verify Implementation

!bash -c '
source /tmp/claudia_implement_context
echo ""
echo "🧪 Running tests to verify implementation..."

cd api

# Run tests and capture results
echo "Running test suite..."
TEST_RESULT=$(npm test 2>&1)
TEST_EXIT_CODE=$?

if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "✅ All tests pass!"
    TEST_STATUS="PASS"
else
    echo "❌ Tests failing - this is expected in TDD red phase"
    TEST_STATUS="FAIL"
    echo ""
    echo "Failed test output (last 20 lines):"
    echo "$TEST_RESULT" | tail -20
fi

echo "TEST_STATUS=$TEST_STATUS" >> /tmp/claudia_implement_context

# Run linting
echo ""
echo "🔍 Running code quality checks..."
LINT_RESULT=$(npm run lint 2>&1)
LINT_EXIT_CODE=$?

if [ $LINT_EXIT_CODE -eq 0 ]; then
    echo "✅ Code quality checks pass"
    LINT_STATUS="PASS"
else
    echo "⚠️  Code quality issues found:"
    echo "$LINT_RESULT" | head -10
    LINT_STATUS="FAIL"
fi

echo "LINT_STATUS=$LINT_STATUS" >> /tmp/claudia_implement_context
'

## Update Enhanced Sprint-Based Ticket Status and Implementation Notes

!bash -c '
source /tmp/claudia_implement_context
echo ""
echo "📝 Updating enhanced sprint-based ticket with implementation progress..."

# Update ticket document status
TIMESTAMP=$(date)
CURRENT_BRANCH=$(git branch --show-current)

# Add enhanced implementation section to ticket with sprint context
cat >> "docs/5-tickets/$TICKET_UUID.md" << EOF

## Enhanced Sprint-Based Implementation Progress

**Started:** $TIMESTAMP  
**Sprint:** $SPRINT_NUMBER  
**Target Environment:** $TARGET_ENV  
**Branch:** \`$CURRENT_BRANCH\` ($BRANCH_TYPE auto-detected)  
**Strategy:** $IMPL_STRATEGY  
**Status:** In Progress (Enhanced Automated TDD with Multi-Development Support)
**GitHub Issue:** #$GITHUB_ISSUE (open for multi-commit/PR development)

### Enhanced TDD Progress with Multi-Development Support
- [x] Phase 1: Test strategy defined with sprint context
- [ ] Phase 2: Failing tests written (environment-aware)
- [ ] Phase 3: Implementation code written (iterative commits supported)
- [ ] Phase 4: Tests passing ($TARGET_ENV validation)
- [ ] Phase 5: Code refactored and optimized
- [ ] Phase 6: Multi-commit development (as needed)
- [ ] Phase 7: Multi-PR creation (as needed)
- [ ] Phase 8: Manual ticket completion

### Current State
- **Tests:** $TEST_STATUS
- **Linting:** $LINT_STATUS  
- **Branch:** $CURRENT_BRANCH
- **Environment:** $TARGET_ENV
- **Sprint Context:** $SPRINT_NUMBER
- **Multi-Development:** Enabled (multiple commits/PRs supported)

### Enhanced Next Steps (Multi-Development Workflow)
1. Complete failing test implementation with environment awareness
2. Write minimal code to pass tests (targeting $TARGET_ENV)
3. Refactor and optimize iteratively
4. Multiple commits supported: /claudia:commit "$TICKET_UUID"
5. Create PRs when ready: /claudia:pr:create "$TICKET_UUID" 
6. Manual completion: /claudia:ticket:complete "$TICKET_UUID"

---
*Updated by Enhanced Claudia Sprint-Based Automation System - $TIMESTAMP*  
*Sprint: $SPRINT_NUMBER | Environment: $TARGET_ENV | Multi-Development: Enabled*
EOF

echo "✅ Updated enhanced sprint-based ticket document with implementation progress"
echo "✅ Sprint context and multi-development features documented"
echo "✅ Environment awareness ($TARGET_ENV) preserved"
'

## Log Implementation Start

!bash -c '
source /tmp/claudia_implement_context
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)

# Log enhanced implementation start with sprint context and multi-development support
echo "{\"timestamp\":\"$TIMESTAMP\",\"action\":\"implementation_started\",\"uuid\":\"$TICKET_UUID\",\"sprint_uuid\":\"$SPRINT_NUMBER\",\"requirement_uuid\":\"$REQ_UUID\",\"target_env\":\"$TARGET_ENV\",\"branch_type\":\"$BRANCH_TYPE\",\"branch\":\"$(git branch --show-current)\",\"strategy\":\"$IMPL_STRATEGY\",\"automated\":true,\"test_status\":\"$TEST_STATUS\",\"lint_status\":\"$LINT_STATUS\",\"multi_development\":true,\"github_issue\":$GITHUB_ISSUE}" >> .claude-shared/project-management/data/tickets-log.jsonl

echo "📊 Logged enhanced implementation start to sprint-based traceability system"
echo "✅ Multi-development workflow context preserved"
echo "✅ Environment awareness ($TARGET_ENV) logged"
'

## Summary and Next Steps

!bash -c '
source /tmp/claudia_implement_context

echo ""
echo "✅ **Automated TDD Implementation Started**"
echo ""
echo "**Ticket:** $TICKET_TITLE"
echo "**UUID:** \`$TICKET_UUID\`"
echo "**Branch:** \`$(git branch --show-current)\`"
echo "**Strategy:** $IMPL_STRATEGY"
echo ""
echo "**Current Status:**"
echo "- Tests: $TEST_STATUS"
echo "- Linting: $LINT_STATUS"
echo "- Implementation: In Progress"
echo ""
echo "**Next Actions Required:**"

if [ "$TEST_STATUS" = "FAIL" ]; then
    echo "1. 🔴 Complete failing test implementation (TDD Red phase)"
    echo "2. 🟢 Write minimal code to pass tests (TDD Green phase)"
    echo "3. 🔵 Refactor and optimize code (TDD Refactor phase)"
else
    echo "1. ✅ Tests already passing - proceed to code review"
    echo "2. 🔍 Verify implementation meets acceptance criteria"
    echo "3. 🚀 Ready for commit phase"
fi

echo "4. 📝 Multi-commit development: /claudia:commit \"$TICKET_UUID\"" (multiple commits supported)"
echo "5. 🔄 Create PRs when ready: /claudia:pr:create \"$TICKET_UUID\"" (multiple PRs supported)"
echo "6. ✅ Complete when done: /claudia:ticket:complete \"$TICKET_UUID\"" (manual completion)"
echo ""
echo "**Enhanced Multi-Development Features:**"
echo "- ✅ Multiple commits supported per ticket"
echo "- ✅ Multiple PRs supported per ticket  "
echo "- ✅ GitHub issue stays open until manual completion"
echo "- ✅ Environment-aware development ($TARGET_ENV)"
echo "- ✅ Complete sprint-based audit trail"
echo ""
echo "**Manual Implementation Alternative:**"
echo "If automated implementation needs refinement, run:"
echo "/claudia:implement:manual \"$TICKET_UUID\""
echo ""
echo "**Enhanced Files Modified:**"
echo "- docs/5-tickets/$TICKET_UUID.md (progress updated with sprint context)"
echo "- .claude-shared/project-management/data/tickets-log.jsonl (enhanced logging)"
echo ""
echo "**Enhanced Sprint-Based Traceability Chain:**"
echo "Sprint: \`$SPRINT_NUMBER\` → Requirement: \`$REQ_UUID\` → Ticket: \`$TICKET_UUID\` → Branch: \`$(git branch --show-current)\` → GitHub: #$GITHUB_ISSUE"
'

## Cleanup

!bash -c 'rm -f /tmp/claudia_implement_context /tmp/ticket_content.md /tmp/req_content.md /tmp/sprint_content.md'

!echo "🤖 Enhanced sprint-based automated TDD implementation workflow initiated"
!echo "🔗 Complete sprint-based traceability maintained with multi-development support"
!echo "🚀 Ready for iterative development with multiple commits and PRs"
!echo "🎯 Environment-aware development active for $TARGET_ENV"
!echo "🏃 Sprint $SPRINT_NUMBER context preserved throughout implementation"