---
description: "Enhanced sprint-based human-AI collaborative TDD implementation with multi-commit workflow support"
allowed-tools: ["Read", "Write", "Edit", "Bash"]
---

# 👥 Enhanced Sprint-Based Manual TDD Implementation (Human-AI Collaboration)

Collaborate with developer on enhanced sprint-based TDD implementation with guided assistance, multi-commit workflow support, and complete traceability.

## Processing Sprint-Based Ticket: $ARGUMENTS

!bash -c 'echo "🤝 Starting enhanced sprint-based collaborative implementation for: $ARGUMENTS"'

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

# Check if sprint-based ticket document exists and is assigned
if [ ! -f "docs/5-tickets/$TICKET_UUID.md" ]; then
    echo "❌ ERROR: Sprint-based ticket document not found: docs/5-tickets/$TICKET_UUID.md"
    exit 1
fi

# Enhanced assignment check with multi-development support
if ! grep -q "GitHub Issue:" "docs/5-tickets/$TICKET_UUID.md" || ! grep -q "#[0-9]" "docs/5-tickets/$TICKET_UUID.md"; then
    echo "❌ ERROR: Sprint-based ticket not assigned to GitHub"
    echo "Please run: /claudia:tickets:assign \"$TICKET_UUID\" first"
    exit 1
fi

# Check enhanced audit trail
if ! grep -q "\"uuid\":\"$TICKET_UUID\"" .claude-shared/project-management/data/tickets-log.jsonl 2>/dev/null; then
    echo "❌ WARNING: Ticket not found in enhanced audit trail"
    echo "Continuing, but audit tracking may be incomplete"
fi

echo "✅ Enhanced sprint-based ticket validation passed"
echo "TICKET_UUID=$TICKET_UUID" > /tmp/claudia_manual_context
'

## Load Enhanced Sprint-Based Ticket Context and Requirements

!bash -c '
source /tmp/claudia_manual_context

# Extract enhanced sprint-based ticket details
TICKET_TITLE=$(grep "^# " "docs/5-tickets/$TICKET_UUID.md" | sed "s/^# //" | head -1)
TICKET_TYPE=$(grep "^\*\*Type:\*\*" "docs/5-tickets/$TICKET_UUID.md" | sed "s/\*\*Type:\*\* //" | head -1)
TICKET_COMPLEXITY=$(grep "^\*\*Complexity:\*\*" "docs/5-tickets/$TICKET_UUID.md" | sed "s/\*\*Complexity:\*\* //" | head -1)
REQ_UUID=$(grep "^\*\*Requirement:\*\*" "docs/5-tickets/$TICKET_UUID.md" | sed "s/\*\*Requirement:\*\* \`\([^`]*\)\`.*/\1/" | head -1)
TARGET_ENV=$(grep "^\*\*Target Environment:\*\*" "docs/5-tickets/$TICKET_UUID.md" | sed "s/\*\*Target Environment:\*\* \`\([^`]*\)\`.*/\1/" | head -1)
BRANCH_TYPE=$(grep "^\*\*Branch Type:\*\*" "docs/5-tickets/$TICKET_UUID.md" | sed "s/\*\*Branch Type:\*\* \`\([^`]*\)\`.*/\1/" | head -1)

# Extract GitHub issue and sprint info
GITHUB_ISSUE=$(grep "^\*\*GitHub Issue:\*\*" "docs/5-tickets/$TICKET_UUID.md" | sed "s/\*\*GitHub Issue:\*\* #\([0-9]*\).*/\1/" | head -1)
SPRINT_NUMBER=$(echo "$TICKET_UUID" | cut -d"-" -f1)

echo "📋 Enhanced Sprint-Based Collaborative Implementation Context:"
echo ""
echo "**Ticket Information:**"
echo "- 🎫 Ticket: $TICKET_TITLE"
echo "- 📝 Type: $TICKET_TYPE"
echo "- ⚡ Complexity: $TICKET_COMPLEXITY"
echo "- 🏃 Sprint: $SPRINT_NUMBER"
echo "- 🌍 Target Environment: $TARGET_ENV"
echo "- 🌳 Branch Type: $BRANCH_TYPE"
echo "- 🐙 GitHub Issue: #$GITHUB_ISSUE (supports multi-commit/PR)"
echo ""

# Load requirement context for better understanding
if [ -f "docs/4-requirements/$REQ_UUID.md" ]; then
    echo "**Requirement Context:**"
    echo "- 📋 Requirement: $REQ_UUID"
    REQ_TITLE=$(grep "^# " "docs/4-requirements/$REQ_UUID.md" | sed "s/^# //" | head -1)
    echo "- 📄 Title: $REQ_TITLE"
else
    echo "**Requirement Context:** Unable to load (docs/4-requirements/$REQ_UUID.md not found)"
fi

# Save enhanced context
cat >> /tmp/claudia_manual_context << EOF
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

## Enhanced Multi-Development Workflow Preparation

!bash -c '
source /tmp/claudia_manual_context
echo ""
echo "## 🔄 **Enhanced Multi-Development Workflow Preparation**"
echo ""

# Check current git status
echo "**Current Git Status:**"
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
echo "- Current Branch: $CURRENT_BRANCH"

# Suggest branch creation if not on feature branch
EXPECTED_BRANCH="$BRANCH_TYPE$TICKET_UUID"
if [ "$CURRENT_BRANCH" != "$EXPECTED_BRANCH" ]; then
    echo "- Suggested Branch: $EXPECTED_BRANCH"
    echo ""
    echo "💡 **Branch Suggestion:** Consider creating the recommended branch:"
    echo "   \`git checkout -b $EXPECTED_BRANCH\`"
else
    echo "- ✅ Already on recommended branch"
fi

echo ""
echo "**Multi-Development Workflow Features:**"
echo "- ✅ Multiple commits supported per ticket"
echo "- ✅ Multiple PRs supported per ticket"
echo "- ✅ GitHub issue remains open until manual completion"
echo "- ✅ Environment-aware development ($TARGET_ENV)"
echo "- ✅ Complete audit trail maintained"
echo ""

# Check for existing commits on this ticket
if grep -q "\"ticket_uuid\":\"$TICKET_UUID\"" .claude-shared/project-management/data/commits-log.jsonl 2>/dev/null; then
    EXISTING_COMMITS=$(grep "\"ticket_uuid\":\"$TICKET_UUID\"" .claude-shared/project-management/data/commits-log.jsonl 2>/dev/null | wc -l)
    echo "**Existing Development:**"
    echo "- 💻 Commits already made: $EXISTING_COMMITS"
    echo "- 📝 This supports iterative development - continue with additional commits"
else
    echo "**Development Status:**"
    echo "- 🆕 First implementation session for this ticket"
    echo "- 💻 Ready to begin with initial commit"
fi

echo ""
'

## Enhanced Implementation Planning and TDD Guidance

!bash -c '
source /tmp/claudia_manual_context
echo "## 📋 **Enhanced TDD Implementation Planning**"
echo ""

# Load acceptance criteria from ticket
echo "**Acceptance Criteria from Ticket:**"
if grep -q "## Acceptance Criteria" "docs/5-tickets/$TICKET_UUID.md"; then
    grep -A 20 "## Acceptance Criteria" "docs/5-tickets/$TICKET_UUID.md" | tail -n +2 | head -10 | while read -r line; do
        if [[ "$line" =~ ^[[:space:]]*$ ]] || [[ "$line" =~ ^## ]]; then
            break
        fi
        echo "$line"
    done
else
    echo "- No acceptance criteria found in ticket document"
fi

echo ""
echo "**Enhanced TDD Approach for $TICKET_TYPE:**"

case "$TICKET_TYPE" in
    "Analysis")
        echo "- 🔍 **Analysis Focus:** Research and documentation"
        echo "- 🧪 **Testing:** Create validation scripts for findings"
        echo "- 📝 **Output:** Comprehensive analysis document"
        echo "- 🔄 **Multi-Commit:** Document findings incrementally"
        ;;
    "Implementation")
        echo "- 🧪 **Test First:** Write failing tests before implementation"
        echo "- ✅ **Red-Green-Refactor:** Classic TDD cycle"
        echo "- 🔄 **Multi-Commit:** Each TDD cycle can be its own commit"
        echo "- 🎯 **Target:** $TARGET_ENV environment"
        ;;
    "Testing")
        echo "- 🧪 **Test Coverage:** Ensure comprehensive coverage"
        echo "- 🔍 **Edge Cases:** Test boundary conditions and error cases"
        echo "- 🚀 **Environment:** Focus on $TARGET_ENV validation"
        echo "- 📊 **Metrics:** Aim for >95% test coverage"
        ;;
    "Database")
        echo "- 🗃️  **Schema First:** Design and validate schema structure"
        echo "- 🧪 **Migration Tests:** Test both up and down migrations"
        echo "- 🔄 **Multi-Commit:** Schema design → Migration → Validation"
        echo "- 🎯 **Environment:** Target $TARGET_ENV database"
        ;;
    *)
        echo "- 🧪 **Test-Driven:** Write tests before implementation"
        echo "- 🔄 **Iterative:** Break work into small, testable chunks"
        echo "- 📝 **Document:** Update documentation with changes"
        echo "- 🌍 **Environment:** Consider $TARGET_ENV implications"
        ;;
esac

echo ""
echo "**Multi-Development Strategy:**"
echo "1. 📝 **Plan Implementation:** Break work into logical commits"
echo "2. 🧪 **Write Tests First:** Follow TDD principles"
echo "3. ✅ **Implement & Commit:** Use /claudia:commit \"$TICKET_UUID\" for each step"
echo "4. 🔄 **Create PRs:** Use /claudia:pr:create \"$TICKET_UUID\" when ready"
echo "5. 🏁 **Complete:** Use /claudia:ticket:complete \"$TICKET_UUID\" when fully done"
echo ""
'

## Interactive Implementation Guidance

!bash -c '
source /tmp/claudia_manual_context
echo "## 🤖 **AI Implementation Assistance**"
echo ""

echo "**I am ready to assist you with:**"
echo ""
echo "**Code Development:**"
echo "- 🧪 Writing comprehensive tests"
echo "- 💻 Implementing functionality following TDD"
echo "- 🔍 Code review and optimization suggestions"
echo "- 📚 Documentation updates"
echo ""
echo "**Sprint-Based Integration:**"
echo "- 🏃 Sprint $SPRINT_NUMBER context and requirements"
echo "- 🌍 $TARGET_ENV environment-specific considerations"
echo "- 🌳 $BRANCH_TYPE branch management guidance"
echo "- 🔗 Traceability to requirement $REQ_UUID"
echo ""
echo "**Multi-Development Workflow:**"
echo "- 📝 Commit message suggestions for iterative development"
echo "- 🔄 PR creation strategies for complex features"
echo "- 🎯 Testing approaches for $TARGET_ENV environment"
echo "- 📊 Progress tracking and completion criteria"
echo ""

if [ "$TICKET_COMPLEXITY" = "Complex" ]; then
    echo "**⚠️  Complex Ticket Guidance:**"
    echo "- 🧩 Break implementation into smaller, manageable pieces"
    echo "- 🔄 Use multiple commits to track incremental progress"
    echo "- 🔀 Consider multiple PRs if implementation becomes too large"
    echo "- 👥 Request code review at intermediate stages"
    echo ""
fi

echo "**How to proceed:**"
echo "1. **Start Implementation:** Begin with TDD approach"
echo "2. **Ask for Help:** Request specific assistance as needed"
echo "3. **Commit Progress:** Use enhanced commit workflow regularly"
echo "4. **Create PRs:** When ready for review or deployment"
echo "5. **Complete Ticket:** When all acceptance criteria met"
echo ""
echo "💬 **Ready to collaborate! What would you like to work on first?**"
'

## Enhanced Implementation Tracking

!bash -c '
source /tmp/claudia_manual_context
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)

# Log manual implementation start in enhanced audit system
echo "{\"timestamp\":\"$TIMESTAMP\",\"action\":\"manual_implementation_started\",\"uuid\":\"$TICKET_UUID\",\"sprint_uuid\":\"$SPRINT_NUMBER\",\"target_env\":\"$TARGET_ENV\",\"branch_type\":\"$BRANCH_TYPE\",\"github_issue\":$GITHUB_ISSUE,\"collaboration_mode\":\"human_ai\",\"ticket_type\":\"$TICKET_TYPE\",\"complexity\":\"$TICKET_COMPLEXITY\"}" >> .claude-shared/project-management/data/tickets-log.jsonl

echo "📊 Enhanced manual implementation session logged to audit trail"
'

## Enhanced Next Steps

!bash -c '
source /tmp/claudia_manual_context
echo ""
echo "## ⚡ **Enhanced Next Steps & Quick Actions**"
echo ""

echo "**Immediate Actions:**"
echo "- 🌱 Create branch: \`git checkout -b $BRANCH_TYPE$TICKET_UUID\`"
echo "- 💻 Start development with TDD approach"
echo "- 🔄 Commit progress: \`/claudia:commit \"$TICKET_UUID\"\`"
echo ""

echo "**Sprint-Based Resources:**"
echo "- 📄 Ticket Document: \`docs/5-tickets/$TICKET_UUID.md\`"
echo "- 📋 Requirement: \`docs/4-requirements/$REQ_UUID.md\`"
echo "- 🏃 Sprint: \`docs/3-sprints/$SPRINT_NUMBER.md\`"
echo "- 🐙 GitHub Issue: https://github.com/$(git config remote.origin.url | sed \"s/.*github.com[:/]//\" | sed \"s/.git$//\")/issues/$GITHUB_ISSUE"
echo ""

echo "**Enhanced Workflow Commands:**"
echo "- 📝 Commit work: \`/claudia:commit \"$TICKET_UUID\"\`"
echo "- 🔀 Create PR: \`/claudia:pr:create \"$TICKET_UUID\"\`"
echo "- ✅ Complete ticket: \`/claudia:ticket:complete \"$TICKET_UUID\"\`"
echo "- 📊 Check status: \`/claudia:utils:status\`"
echo ""

echo "**Multi-Development Support:**"
echo "- 🔄 Multiple commits encouraged for iterative development"
echo "- 🔀 Multiple PRs supported for complex features"
echo "- 🔓 GitHub issue stays open until manual completion"
echo "- 📊 Complete audit trail maintained automatically"
'

## Cleanup

!bash -c 'rm -f /tmp/claudia_manual_context'

!echo ""
!echo "🤝 Enhanced sprint-based manual implementation guidance complete"
!echo "📋 Ready for collaborative TDD development with multi-commit workflow"
!echo "🚀 Sprint-based context loaded - begin implementation when ready"