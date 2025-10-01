---
description: "Enhanced sprint-based human-AI collaborative TDD implementation with GitHub issue support and multi-commit workflow"
allowed-tools: ["Read", "Write", "Edit", "Bash"]
---

# 👥 Enhanced Sprint-Based Manual TDD Implementation (Human-AI Collaboration)

Collaborate with developer on enhanced sprint-based TDD implementation with guided assistance, multi-commit workflow support, and complete traceability. **Now supports GitHub issue numbers!**

## Processing Input: $ARGUMENTS

!bash -c 'echo "🤝 Starting enhanced sprint-based collaborative implementation for: $ARGUMENTS"'

## Smart Input Detection and Resolution

!bash -c '
INPUT="$ARGUMENTS"

# Clean up input (remove quotes, hash symbols)
INPUT=$(echo "$INPUT" | sed "s/^[\"'#]//" | sed "s/[\"']$//")

echo "🔍 Analyzing input: $INPUT"
echo ""

TICKET_UUID=""
GITHUB_ISSUE=""
REQUIREMENT_UUID=""

# Detect input type
if [[ "$INPUT" =~ ^[0-9]+$ ]]; then
    # Pure number - treat as GitHub issue
    GITHUB_ISSUE="$INPUT"
    echo "📌 Detected: GitHub Issue #$GITHUB_ISSUE"

    # Try to find corresponding ticket or requirement
    echo "🔎 Searching for associated ticket or requirement..."

    # Check github-sync.jsonl for this issue
    if grep -q "\"issue_number\":$GITHUB_ISSUE" .claude-shared/project-management/data/github-sync.jsonl 2>/dev/null; then
        # Extract requirement UUID from the issue creation log
        REQ_FROM_LOG=$(grep "\"issue_number\":$GITHUB_ISSUE" .claude-shared/project-management/data/github-sync.jsonl | tail -1 | grep -o "\"requirements_file\":\"[^\"]*\"" | cut -d\" -f4)

        if [ ! -z "$REQ_FROM_LOG" ]; then
            REQUIREMENT_UUID="$REQ_FROM_LOG"
            echo "✅ Found requirement: $REQUIREMENT_UUID"

            # Check if tickets exist for this requirement
            if ls .claude-shared/project-management/5-tickets/$REQUIREMENT_UUID-*.md 1> /dev/null 2>&1; then
                echo "📋 Tickets found for this requirement"
                echo ""
                echo "Available tickets:"
                ls .claude-shared/project-management/5-tickets/$REQUIREMENT_UUID-*.md | while read ticket_file; do
                    TICKET_NAME=$(basename "$ticket_file" .md)
                    TICKET_TITLE=$(grep "^# " "$ticket_file" | sed "s/^# //" | head -1)
                    echo "  - $TICKET_NAME: $TICKET_TITLE"
                done

                # Auto-select if only one ticket
                TICKET_COUNT=$(ls .claude-shared/project-management/5-tickets/$REQUIREMENT_UUID-*.md 2>/dev/null | wc -l)
                if [ "$TICKET_COUNT" -eq 1 ]; then
                    TICKET_UUID=$(basename $(ls .claude-shared/project-management/5-tickets/$REQUIREMENT_UUID-*.md) .md)
                    echo ""
                    echo "✅ Auto-selected ticket: $TICKET_UUID"
                else
                    echo ""
                    echo "⚠️  Multiple tickets found. Creating implementation plan from requirement..."
                    TICKET_UUID=""
                fi
            else
                echo "ℹ️  No tickets found yet for requirement: $REQUIREMENT_UUID"
                echo "💡 Will create implementation plan from requirement directly"
                TICKET_UUID=""
            fi
        else
            echo "⚠️  Could not find requirement for issue #$GITHUB_ISSUE"
            echo "💡 Will fetch issue details from GitHub and create implementation plan"
        fi
    else
        echo "ℹ️  Issue #$GITHUB_ISSUE not found in audit logs"
        echo "💡 Will fetch issue details from GitHub and create implementation plan"
    fi

elif [[ "$INPUT" =~ ^[0-9]{3}-[0-9]{2}-.+ ]]; then
    # Requirement UUID format
    REQUIREMENT_UUID="$INPUT"
    echo "📋 Detected: Requirement UUID ($REQUIREMENT_UUID)"

    # Check if tickets exist
    if ls .claude-shared/project-management/5-tickets/$REQUIREMENT_UUID-*.md 1> /dev/null 2>&1; then
        TICKET_COUNT=$(ls .claude-shared/project-management/5-tickets/$REQUIREMENT_UUID-*.md 2>/dev/null | wc -l)
        if [ "$TICKET_COUNT" -eq 1 ]; then
            TICKET_UUID=$(basename $(ls .claude-shared/project-management/5-tickets/$REQUIREMENT_UUID-*.md) .md)
            echo "✅ Found ticket: $TICKET_UUID"
        else
            echo "ℹ️  Multiple tickets found ($TICKET_COUNT tickets)"
            echo "💡 Will create implementation plan from requirement"
        fi
    fi

elif [[ "$INPUT" =~ ^[0-9]{3}-[0-9]{2}-[0-9]{2}-.+ ]]; then
    # Ticket UUID format
    TICKET_UUID="$INPUT"
    echo "🎫 Detected: Ticket UUID ($TICKET_UUID)"

else
    echo "❌ ERROR: Invalid input format"
    echo "Expected formats:"
    echo "  - GitHub Issue: 31 or #31"
    echo "  - Requirement: 001-01-theme-toggle"
    echo "  - Ticket: 001-01-01-remove-console-log"
    exit 1
fi

# Save context
echo "INPUT=$INPUT" > /tmp/claudia_manual_context
echo "TICKET_UUID=$TICKET_UUID" >> /tmp/claudia_manual_context
echo "GITHUB_ISSUE=$GITHUB_ISSUE" >> /tmp/claudia_manual_context
echo "REQUIREMENT_UUID=$REQUIREMENT_UUID" >> /tmp/claudia_manual_context
'

## Fetch GitHub Issue Details (if applicable)

!bash -c '
source /tmp/claudia_manual_context

if [ ! -z "$GITHUB_ISSUE" ] && [ -z "$TICKET_UUID" ]; then
    echo ""
    echo "📥 Fetching GitHub Issue #$GITHUB_ISSUE details..."

    # Check if gh CLI is available
    if ! command -v gh &> /dev/null; then
        echo "⚠️  GitHub CLI not available, continuing with limited info"
    else
        # Fetch issue details
        ISSUE_DATA=$(gh issue view $GITHUB_ISSUE --json title,body,labels,state 2>/dev/null)

        if [ $? -eq 0 ]; then
            ISSUE_TITLE=$(echo "$ISSUE_DATA" | jq -r ".title")
            ISSUE_BODY=$(echo "$ISSUE_DATA" | jq -r ".body")
            ISSUE_STATE=$(echo "$ISSUE_DATA" | jq -r ".state")

            echo "✅ Issue Details:"
            echo "   Title: $ISSUE_TITLE"
            echo "   State: $ISSUE_STATE"

            # Save to context
            echo "ISSUE_TITLE=$ISSUE_TITLE" >> /tmp/claudia_manual_context
            echo "ISSUE_STATE=$ISSUE_STATE" >> /tmp/claudia_manual_context

            # Save body for later analysis
            echo "$ISSUE_BODY" > /tmp/issue_body.txt
        else
            echo "⚠️  Could not fetch issue details"
        fi
    fi
fi
'

## Load or Create Implementation Context

!bash -c '
source /tmp/claudia_manual_context

echo ""
echo "🎯 Implementation Context Setup"
echo "================================"

if [ ! -z "$TICKET_UUID" ]; then
    # We have a ticket - load ticket context
    echo "📋 Loading ticket context..."

    # Check if ticket exists
    if [ ! -f ".claude-shared/project-management/5-tickets/$TICKET_UUID.md" ]; then
        echo "❌ ERROR: Ticket document not found"
        exit 1
    fi

    # Extract ticket details
    TICKET_TITLE=$(grep "^# " ".claude-shared/project-management/5-tickets/$TICKET_UUID.md" | sed "s/^# //" | head -1)
    TICKET_TYPE=$(grep "^\*\*Type:\*\*" ".claude-shared/project-management/5-tickets/$TICKET_UUID.md" | sed "s/\*\*Type:\*\* //" | head -1)
    TICKET_COMPLEXITY=$(grep "^\*\*Complexity:\*\*" ".claude-shared/project-management/5-tickets/$TICKET_UUID.md" | sed "s/\*\*Complexity:\*\* //" | head -1)
    REQ_UUID=$(grep "^\*\*Requirement:\*\*" ".claude-shared/project-management/5-tickets/$TICKET_UUID.md" | sed "s/\*\*Requirement:\*\* \`\([^`]*\)\`.*/\1/" | head -1)
    TARGET_ENV=$(grep "^\*\*Target Environment:\*\*" ".claude-shared/project-management/5-tickets/$TICKET_UUID.md" | sed "s/\*\*Target Environment:\*\* \`\([^`]*\)\`.*/\1/" | head -1)
    BRANCH_TYPE=$(grep "^\*\*Branch Type:\*\*" ".claude-shared/project-management/5-tickets/$TICKET_UUID.md" | sed "s/\*\*Branch Type:\*\* \`\([^`]*\)\`.*/\1/" | head -1)
    SPRINT_NUMBER=$(echo "$TICKET_UUID" | cut -d"-" -f1)

    if [ -z "$GITHUB_ISSUE" ]; then
        GITHUB_ISSUE=$(grep "^\*\*GitHub Issue:\*\*" ".claude-shared/project-management/5-tickets/$TICKET_UUID.md" | sed "s/\*\*GitHub Issue:\*\* #\([0-9]*\).*/\1/" | head -1)
    fi

    echo "✅ Ticket context loaded"

elif [ ! -z "$REQUIREMENT_UUID" ]; then
    # We have a requirement - create implementation plan from it
    echo "📋 Loading requirement context..."

    if [ ! -f ".claude-shared/project-management/4-requirements/$REQUIREMENT_UUID.md" ]; then
        echo "❌ ERROR: Requirement document not found"
        exit 1
    fi

    TICKET_TITLE="Implementation: $(grep "^# " ".claude-shared/project-management/4-requirements/$REQUIREMENT_UUID.md" | sed "s/^# //" | head -1)"
    TICKET_TYPE="Implementation"
    TICKET_COMPLEXITY="Medium"
    REQ_UUID="$REQUIREMENT_UUID"
    TARGET_ENV="dev"
    BRANCH_TYPE="feature/"
    SPRINT_NUMBER=$(echo "$REQUIREMENT_UUID" | cut -d"-" -f1)

    echo "✅ Requirement context loaded"
    echo "💡 Working directly from requirement (no tickets created)"

else
    # We only have GitHub issue - create basic context
    echo "📋 Creating context from GitHub issue..."

    TICKET_TITLE="${ISSUE_TITLE:-Implementation from GitHub Issue #$GITHUB_ISSUE}"
    TICKET_TYPE="Implementation"
    TICKET_COMPLEXITY="Medium"
    REQ_UUID=""
    TARGET_ENV="dev"
    BRANCH_TYPE="fix/"
    SPRINT_NUMBER="001"

    echo "✅ Basic context created from issue"
fi

# Save full context
cat >> /tmp/claudia_manual_context << EOF
TICKET_TITLE="$TICKET_TITLE"
TICKET_TYPE="$TICKET_TYPE"
TICKET_COMPLEXITY="$TICKET_COMPLEXITY"
REQ_UUID="$REQ_UUID"
TARGET_ENV="$TARGET_ENV"
BRANCH_TYPE="$BRANCH_TYPE"
SPRINT_NUMBER="$SPRINT_NUMBER"
EOF
'

## Display Implementation Context

!bash -c '
source /tmp/claudia_manual_context

echo ""
echo "📊 **Implementation Context Summary**"
echo "====================================="
echo ""
echo "**Task Information:**"
echo "- 🎯 Title: $TICKET_TITLE"
echo "- 📝 Type: $TICKET_TYPE"
echo "- ⚡ Complexity: $TICKET_COMPLEXITY"
echo "- 🏃 Sprint: $SPRINT_NUMBER"
echo "- 🌍 Target Environment: $TARGET_ENV"
echo "- 🌳 Branch Type: $BRANCH_TYPE"

if [ ! -z "$GITHUB_ISSUE" ]; then
    echo "- 🐙 GitHub Issue: #$GITHUB_ISSUE"
fi

if [ ! -z "$REQ_UUID" ]; then
    echo "- 📋 Requirement: $REQ_UUID"
fi

if [ ! -z "$TICKET_UUID" ]; then
    echo "- 🎫 Ticket UUID: $TICKET_UUID"
fi

echo ""
'

## Multi-Development Workflow Preparation

!bash -c '
source /tmp/claudia_manual_context
echo "## 🔄 **Multi-Development Workflow Preparation**"
echo ""

# Check current git status
echo "**Current Git Status:**"
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
echo "- Current Branch: $CURRENT_BRANCH"

# Suggest branch creation
if [ ! -z "$TICKET_UUID" ]; then
    SUGGESTED_BRANCH="${BRANCH_TYPE}${TICKET_UUID}"
elif [ ! -z "$REQUIREMENT_UUID" ]; then
    SUGGESTED_BRANCH="${BRANCH_TYPE}${REQUIREMENT_UUID}"
else
    SUGGESTED_BRANCH="${BRANCH_TYPE}issue-${GITHUB_ISSUE}"
fi

if [ "$CURRENT_BRANCH" != "$SUGGESTED_BRANCH" ]; then
    echo "- Suggested Branch: $SUGGESTED_BRANCH"
    echo ""
    echo "💡 **Branch Suggestion:** Consider creating the recommended branch:"
    echo "   \`git checkout -b $SUGGESTED_BRANCH\`"
else
    echo "- ✅ Already on recommended branch"
fi

echo ""
echo "**Workflow Features:**"
echo "- ✅ Multiple commits supported"
echo "- ✅ Multiple PRs supported"
echo "- ✅ Complete audit trail"
echo "- ✅ Environment-aware development ($TARGET_ENV)"
echo ""

# Save branch suggestion
echo "SUGGESTED_BRANCH=$SUGGESTED_BRANCH" >> /tmp/claudia_manual_context
'

## Load Issue/Requirement Details for AI Analysis

!bash -c '
source /tmp/claudia_manual_context

echo "## 📖 **Task Details for Implementation**"
echo ""

# Load relevant content for AI to analyze
if [ ! -z "$TICKET_UUID" ] && [ -f ".claude-shared/project-management/5-tickets/$TICKET_UUID.md" ]; then
    echo "**From Ticket Document:**"
    echo ""

    # Show acceptance criteria
    if grep -q "## Acceptance Criteria" ".claude-shared/project-management/5-tickets/$TICKET_UUID.md"; then
        echo "**Acceptance Criteria:**"
        grep -A 10 "## Acceptance Criteria" ".claude-shared/project-management/5-tickets/$TICKET_UUID.md" | tail -n +2 | head -10
        echo ""
    fi

    # Show implementation notes
    if grep -q "## Implementation Notes" ".claude-shared/project-management/5-tickets/$TICKET_UUID.md"; then
        echo "**Implementation Notes:**"
        grep -A 5 "## Implementation Notes" ".claude-shared/project-management/5-tickets/$TICKET_UUID.md" | tail -n +2 | head -5
        echo ""
    fi

elif [ ! -z "$REQUIREMENT_UUID" ] && [ -f ".claude-shared/project-management/4-requirements/$REQUIREMENT_UUID.md" ]; then
    echo "**From Requirement Document:**"
    echo ""

    # Show problem statement
    if grep -q "## Problem Statement" ".claude-shared/project-management/4-requirements/$REQUIREMENT_UUID.md"; then
        echo "**Problem Statement:**"
        grep -A 3 "## Problem Statement" ".claude-shared/project-management/4-requirements/$REQUIREMENT_UUID.md" | tail -n +2
        echo ""
    fi

    # Show functional requirements
    if grep -q "### Functional Requirements" ".claude-shared/project-management/4-requirements/$REQUIREMENT_UUID.md"; then
        echo "**Functional Requirements:**"
        grep -A 5 "### Functional Requirements" ".claude-shared/project-management/4-requirements/$REQUIREMENT_UUID.md" | tail -n +2
        echo ""
    fi

elif [ ! -z "$GITHUB_ISSUE" ] && [ -f "/tmp/issue_body.txt" ]; then
    echo "**From GitHub Issue #$GITHUB_ISSUE:**"
    echo ""
    head -20 /tmp/issue_body.txt
    echo ""
fi
'

## AI Implementation Guidance

!bash -c '
source /tmp/claudia_manual_context

echo "## 🤖 **AI Implementation Assistant Ready**"
echo ""

echo "**I can help you with:**"
echo ""
echo "**Code Development:**"
echo "- 🧪 Writing tests (TDD approach)"
echo "- 💻 Implementing functionality"
echo "- 🔍 Code review and suggestions"
echo "- 📚 Documentation updates"
echo ""

echo "**TDD Approach for $TICKET_TYPE:**"

case "$TICKET_TYPE" in
    "Implementation")
        echo "- 🧪 Write failing tests first"
        echo "- ✅ Implement to make tests pass"
        echo "- 🔄 Refactor and improve"
        echo "- 📝 Document as you go"
        ;;
    "Testing")
        echo "- 🧪 Create comprehensive test coverage"
        echo "- 🔍 Test edge cases and error conditions"
        echo "- 📊 Measure and report coverage"
        ;;
    "Bug Fix")
        echo "- 🧪 Write test that reproduces the bug"
        echo "- 🔧 Fix the issue"
        echo "- ✅ Verify test now passes"
        echo "- 🔍 Check for similar issues"
        ;;
    *)
        echo "- 🧪 Test-driven development approach"
        echo "- 🔄 Iterative implementation"
        echo "- 📝 Continuous documentation"
        ;;
esac

echo ""
echo "**Ready to Start:**"
echo "1. Review the task details above"
echo "2. Ask me to help implement specific parts"
echo "3. I'\''ll guide you through TDD steps"
echo "4. We'\''ll commit progress regularly"
echo ""
echo "💬 **What would you like to implement first?**"
'

## Log Implementation Start

!bash -c '
source /tmp/claudia_manual_context
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)

# Determine what to log
LOG_TARGET="${TICKET_UUID:-${REQUIREMENT_UUID:-issue-$GITHUB_ISSUE}}"

# Log implementation start
if [ ! -z "$TICKET_UUID" ]; then
    echo "{\"timestamp\":\"$TIMESTAMP\",\"action\":\"manual_implementation_started\",\"uuid\":\"$TICKET_UUID\",\"sprint_uuid\":\"$SPRINT_NUMBER\",\"target_env\":\"$TARGET_ENV\",\"github_issue\":${GITHUB_ISSUE:-null},\"collaboration_mode\":\"human_ai\",\"ticket_type\":\"$TICKET_TYPE\"}" >> .claude-shared/project-management/data/tickets-log.jsonl
else
    echo "{\"timestamp\":\"$TIMESTAMP\",\"action\":\"manual_implementation_started\",\"target\":\"$LOG_TARGET\",\"sprint_uuid\":\"$SPRINT_NUMBER\",\"target_env\":\"$TARGET_ENV\",\"github_issue\":${GITHUB_ISSUE:-null},\"collaboration_mode\":\"human_ai\",\"type\":\"$TICKET_TYPE\"}" >> .claude-shared/project-management/data/github-sync.jsonl
fi

echo "📊 Implementation session logged to audit trail"
'

## Next Steps

!bash -c '
source /tmp/claudia_manual_context

echo ""
echo "## ⚡ **Next Steps**"
echo ""

echo "**Immediate Actions:**"
echo "1. 🌱 Create branch: \`git checkout -b $SUGGESTED_BRANCH\`"
echo "2. 💻 Start development (ask me for help!)"
echo "3. 🔄 Commit progress regularly"
echo ""

echo "**Resources:**"
if [ ! -z "$TICKET_UUID" ]; then
    echo "- 📄 Ticket: .claude-shared/project-management/5-tickets/$TICKET_UUID.md"
fi
if [ ! -z "$REQ_UUID" ]; then
    echo "- 📋 Requirement: .claude-shared/project-management/4-requirements/$REQ_UUID.md"
fi
if [ ! -z "$GITHUB_ISSUE" ]; then
    echo "- 🐙 GitHub Issue: https://github.com/$(git config remote.origin.url | sed "s/.*github.com[:/]//" | sed "s/.git$//")/issues/$GITHUB_ISSUE"
fi
echo ""

echo "**Workflow Commands:**"
if [ ! -z "$TICKET_UUID" ]; then
    echo "- 📝 Commit: \`/claudia:commit \"$TICKET_UUID\"\`"
    echo "- 🔀 Create PR: \`/claudia:pr:create \"$TICKET_UUID\"\`"
    echo "- ✅ Complete: \`/claudia:ticket:complete \"$TICKET_UUID\"\`"
else
    echo "- 💡 Create tickets first: \`/claudia:tickets:create \"$REQUIREMENT_UUID\" --env dev\`"
    echo "- Or work directly and commit to issue #$GITHUB_ISSUE"
fi
'

## Cleanup

!bash -c '
rm -f /tmp/claudia_manual_context
rm -f /tmp/issue_body.txt
'

!echo ""
!echo "🤝 Enhanced implementation guidance complete"
!echo "💡 Now supports: Ticket UUIDs | Requirement UUIDs | GitHub Issue Numbers"
!echo "🚀 Ready to collaborate - just ask for help with specific tasks!"
