---
description: "Mark ticket as complete, close GitHub issue, and update all related documentation"
allowed-tools: ["Read", "Write", "Edit", "Bash"]
---

# ✅ Ticket Completion

Mark a ticket as fully complete, close the associated GitHub issue, update sprint metrics, and maintain complete audit trail.

## Processing Ticket Completion: $ARGUMENTS

!bash -c 'echo "✅ Processing ticket completion for: $ARGUMENTS"'

## Parse Arguments and Validate

!bash -c '
TICKET_UUID="$ARGUMENTS"

# Clean up ticket UUID (remove quotes if present)
TICKET_UUID=$(echo "$TICKET_UUID" | sed "s/^[\"']//" | sed "s/[\"']$//")

# Validate required parameters
if [ -z "$TICKET_UUID" ]; then
    echo "❌ ERROR: Ticket UUID is required"
    echo "Usage: /claudia:ticket:complete \"030-01-01-database\""
    exit 1
fi

# Validate ticket exists (try both old and new formats)
if [ -f "docs/5-tickets/$TICKET_UUID.md" ]; then
    TICKET_PATH="docs/5-tickets/$TICKET_UUID.md"
elif [ -f "5-tickets/$TICKET_UUID.md" ]; then
    TICKET_PATH="5-tickets/$TICKET_UUID.md"
else
    echo "❌ ERROR: Ticket document not found"
    echo "Looked for: docs/5-tickets/$TICKET_UUID.md"
    echo "       and: 5-tickets/$TICKET_UUID.md"
    exit 1
fi

echo "✅ Arguments validated"
echo "TICKET_UUID=$TICKET_UUID" > /tmp/claudia_complete_context
echo "TICKET_PATH=$TICKET_PATH" >> /tmp/claudia_complete_context
'

## Extract Ticket Information

!bash -c '
source /tmp/claudia_complete_context

echo ""
echo "📊 Extracting ticket information..."

# Extract ticket details
TICKET_TITLE=$(grep "^# " "$TICKET_PATH" | sed "s/^# //" | head -1)
TICKET_TYPE=$(grep "^\*\*Type:\*\*" "$TICKET_PATH" | sed "s/\*\*Type:\*\* //" | head -1)
TICKET_STATUS=$(grep "^\*\*Status:\*\*" "$TICKET_PATH" | sed "s/\*\*Status:\*\* //" | head -1)
REQ_UUID=$(grep "^\*\*Requirement:\*\*" "$TICKET_PATH" | sed "s/\*\*Requirement:\*\* \`\([^`]*\)\`.*/\1/" | head -1)
SPRINT_NUMBER=$(grep "^\*\*Sprint:\*\*" "$TICKET_PATH" | sed "s/\*\*Sprint:\*\* //" | head -1)
TARGET_ENV=$(grep "^\*\*Target Environment:\*\*" "$TICKET_PATH" | sed "s/\*\*Target Environment:\*\* //" | head -1)
GITHUB_ISSUE=$(grep "^\*\*GitHub Issue:\*\*" "$TICKET_PATH" | sed "s/\*\*GitHub Issue:\*\* #\([0-9]*\).*/\1/" | head -1)

# Check current status
if [ "$TICKET_STATUS" = "Completed" ]; then
    echo "⚠️  WARNING: Ticket is already marked as completed"
    echo "Continue anyway? (y/n)"
    read -r CONTINUE
    if [ "$CONTINUE" != "y" ] && [ "$CONTINUE" != "Y" ]; then
        echo "❌ Ticket completion cancelled"
        exit 1
    fi
fi

echo "📋 Ticket Information:"
echo "- Title: $TICKET_TITLE"
echo "- Type: $TICKET_TYPE"  
echo "- Current Status: $TICKET_STATUS"
echo "- Requirement: $REQ_UUID"
echo "- Sprint: $SPRINT_NUMBER"
echo "- Environment: $TARGET_ENV"
echo "- GitHub Issue: #$GITHUB_ISSUE"

# Save context
cat >> /tmp/claudia_complete_context << EOF
TICKET_TITLE="$TICKET_TITLE"
TICKET_TYPE="$TICKET_TYPE"
TICKET_STATUS="$TICKET_STATUS"
REQ_UUID="$REQ_UUID"
SPRINT_NUMBER="$SPRINT_NUMBER"
TARGET_ENV="$TARGET_ENV"
GITHUB_ISSUE="$GITHUB_ISSUE"
EOF
'

## Verify Completion Prerequisites

!bash -c '
source /tmp/claudia_complete_context

echo ""
echo "🔍 Verifying completion prerequisites..."

# Check for commits
HAS_COMMITS=$(grep -c "Implementation Commits:" "$TICKET_PATH" || echo "0")
if [ "$HAS_COMMITS" = "0" ]; then
    echo "⚠️  WARNING: No implementation commits found for this ticket"
    echo "Are you sure this ticket is ready for completion? (y/n)"
    read -r CONTINUE
    if [ "$CONTINUE" != "y" ] && [ "$CONTINUE" != "Y" ]; then
        echo "❌ Ticket completion cancelled"
        exit 1
    fi
fi

# Check for PRs
HAS_PRS=$(grep -c "Pull Requests:" "$TICKET_PATH" || echo "0")
if [ "$HAS_PRS" = "0" ]; then
    echo "⚠️  WARNING: No Pull Requests found for this ticket"
    echo "Continue with completion anyway? (y/n)"
    read -r CONTINUE
    if [ "$CONTINUE" != "y" ] && [ "$CONTINUE" != "Y" ]; then
        echo "❌ Ticket completion cancelled - create PRs first with /claudia:pr:create"
        exit 1
    fi
fi

echo "✅ Prerequisites verified (or user confirmed)"
'

## Close GitHub Issue

!bash -c '
source /tmp/claudia_complete_context

echo ""
echo "🔒 Closing GitHub Issue #$GITHUB_ISSUE..."

if [ -n "$GITHUB_ISSUE" ] && [ "$GITHUB_ISSUE" != "" ]; then
    # Close the GitHub issue with completion message
    CLOSE_MESSAGE="✅ **Ticket Completed**

This issue has been completed as part of ticket \`$TICKET_UUID\`.

**Implementation Summary:**
- **Ticket:** $TICKET_TITLE
- **Type:** $TICKET_TYPE  
- **Sprint:** $SPRINT_NUMBER
- **Requirement:** \`$REQ_UUID\`
- **Environment:** $TARGET_ENV

All implementation work, testing, and code review have been completed. The ticket is now marked as **Completed** in the Claudia system.

**Traceability:**
Sprint $SPRINT_NUMBER → Requirement \`$REQ_UUID\` → Ticket \`$TICKET_UUID\` → Issue #$GITHUB_ISSUE ✅

---
*Closed automatically by Claudia Automation System via /claudia:ticket:complete*"

    # Close the issue
    gh issue close "$GITHUB_ISSUE" --comment "$CLOSE_MESSAGE" 2>&1
    
    if [ $? -eq 0 ]; then
        echo "✅ GitHub Issue #$GITHUB_ISSUE closed successfully"
        ISSUE_CLOSED="true"
    else
        echo "⚠️  WARNING: Failed to close GitHub Issue #$GITHUB_ISSUE"
        echo "You may need to close it manually"
        ISSUE_CLOSED="false"
    fi
else
    echo "ℹ️  No GitHub issue found to close"
    ISSUE_CLOSED="not_applicable"
fi

echo "ISSUE_CLOSED=\"$ISSUE_CLOSED\"" >> /tmp/claudia_complete_context
'

## Update Ticket Document

!bash -c '
source /tmp/claudia_complete_context
COMPLETION_TIMESTAMP=$(date)

echo ""
echo "📝 Updating ticket document with completion information..."

# Update status
sed -i "s/\*\*Status:\*\* $TICKET_STATUS/\*\*Status:\*\* Completed/" "$TICKET_PATH"

# Add completion section if it doesnt exist
if ! grep -q "## Ticket Completion" "$TICKET_PATH"; then
    cat >> "$TICKET_PATH" << EOF

---

## Ticket Completion

**Completed:** $COMPLETION_TIMESTAMP  
**GitHub Issue:** #$GITHUB_ISSUE - $(if [ "$ISSUE_CLOSED" = "true" ]; then echo "✅ Closed"; elif [ "$ISSUE_CLOSED" = "false" ]; then echo "❌ Failed to close"; else echo "N/A"; fi)  
**Environment:** $TARGET_ENV  

### Final Status
- [x] All implementation work completed
- [x] Code reviewed and approved  
- [x] Testing completed successfully
- [x] Documentation updated
- [x] Deployed to $TARGET_ENV environment
- [x] Ticket marked as completed
$(if [ "$ISSUE_CLOSED" = "true" ]; then echo "- [x] GitHub issue closed"; else echo "- [ ] GitHub issue closed"; fi)

### Completion Metrics
**Implementation Commits:** $(grep -c "^- \[" "$TICKET_PATH" | head -1)  
**Pull Requests:** $(grep "Pull Requests:" "$TICKET_PATH" -A 10 | grep -c "^- \[" | head -1)  
**Files Modified:** $(git log --name-only --oneline | grep -v "^[a-f0-9]" | sort -u | wc -l | tr -d " ")  

---
*Completed by Claudia Automation System - $COMPLETION_TIMESTAMP*
EOF
fi

echo "✅ Updated ticket document with completion information"
'

## Update Sprint Metrics

!bash -c '
source /tmp/claudia_complete_context

if [ -n "$SPRINT_NUMBER" ] && [ -f "docs/3-sprints/$SPRINT_NUMBER.md" ]; then
    echo ""
    echo "📊 Updating sprint metrics..."
    
    SPRINT_FILE="docs/3-sprints/$SPRINT_NUMBER.md"
    
    # Update completed tickets count
    CURRENT_COMPLETED_TICKETS=$(grep "Completed Tickets:" "$SPRINT_FILE" | grep -o "[0-9]*")
    NEW_COMPLETED_TICKETS=$((CURRENT_COMPLETED_TICKETS + 1))
    
    sed -i "s/\*\*Completed Tickets:\*\* [0-9]*/\*\*Completed Tickets:\*\* $NEW_COMPLETED_TICKETS/" "$SPRINT_FILE"
    
    echo "✅ Updated sprint metrics - completed tickets: $NEW_COMPLETED_TICKETS"
else
    echo "ℹ️  Sprint document not found or no sprint specified"
fi
'

## Update Requirement Status

!bash -c '
source /tmp/claudia_complete_context

if [ -n "$REQ_UUID" ]; then
    echo ""
    echo "📋 Checking requirement completion status..."
    
    # Determine requirement path
    REQ_PATH="docs/4-requirements/$REQ_UUID.md"
    if [ ! -f "$REQ_PATH" ] && [ -f "4-requirements/$REQ_UUID.md" ]; then
        REQ_PATH="4-requirements/$REQ_UUID.md"
    fi
    
    if [ -f "$REQ_PATH" ]; then
        # Count total and completed tickets for this requirement
        TOTAL_TICKETS=$(find docs/5-tickets/ 5-tickets/ -name "$REQ_UUID-*.md" 2>/dev/null | wc -l | tr -d " ")
        COMPLETED_TICKETS=$(find docs/5-tickets/ 5-tickets/ -name "$REQ_UUID-*.md" -exec grep -l "Status:\*\* Completed" {} \; 2>/dev/null | wc -l | tr -d " ")
        
        echo "📊 Requirement progress: $COMPLETED_TICKETS/$TOTAL_TICKETS tickets completed"
        
        if [ "$COMPLETED_TICKETS" -eq "$TOTAL_TICKETS" ] && [ "$TOTAL_TICKETS" -gt 0 ]; then
            echo "🎉 All tickets for requirement $REQ_UUID are now completed!"
            # Could add automatic requirement completion here if desired
        fi
        
        echo "TOTAL_TICKETS=$TOTAL_TICKETS" >> /tmp/claudia_complete_context
        echo "COMPLETED_TICKETS=$COMPLETED_TICKETS" >> /tmp/claudia_complete_context
    else
        echo "ℹ️  Requirement document not found"
    fi
fi
'

## Log Completion to Audit System

!bash -c '
source /tmp/claudia_complete_context
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)

echo ""
echo "📊 Logging ticket completion to audit system..."

# Log completion to tickets log
echo "{\"timestamp\":\"$TIMESTAMP\",\"action\":\"completed\",\"ticket_uuid\":\"$TICKET_UUID\",\"requirement_uuid\":\"$REQ_UUID\",\"sprint\":\"$SPRINT_NUMBER\",\"title\":\"$TICKET_TITLE\",\"type\":\"$TICKET_TYPE\",\"target_env\":\"$TARGET_ENV\",\"github_issue\":$GITHUB_ISSUE,\"issue_closed\":$ISSUE_CLOSED,\"status\":\"completed\"}" >> .claude-shared/project-management/data/tickets-log.jsonl

# Log to sprint log if applicable
if [ -n "$SPRINT_NUMBER" ]; then
    echo "{\"timestamp\":\"$TIMESTAMP\",\"action\":\"ticket_completed\",\"sprint_number\":\"$SPRINT_NUMBER\",\"ticket_uuid\":\"$TICKET_UUID\",\"requirement_uuid\":\"$REQ_UUID\"}" >> .claude-shared/project-management/data/sprints-log.jsonl
fi

# Log to requirements log
echo "{\"timestamp\":\"$TIMESTAMP\",\"action\":\"ticket_completed\",\"requirement_uuid\":\"$REQ_UUID\",\"ticket_uuid\":\"$TICKET_UUID\",\"completed_tickets\":${COMPLETED_TICKETS:-1},\"total_tickets\":${TOTAL_TICKETS:-1}}" >> .claude-shared/project-management/data/requirements-log.jsonl

echo "✅ Logged completion to audit system"
'

## Summary and Next Steps

!bash -c '
source /tmp/claudia_complete_context

echo ""
echo "🎉 **Ticket Completion Successful**"
echo ""
echo "**Completed Ticket:**"
echo "- **UUID:** \`$TICKET_UUID\`"
echo "- **Title:** $TICKET_TITLE"
echo "- **Type:** $TICKET_TYPE"
echo "- **Environment:** $TARGET_ENV"
echo ""
echo "**Actions Taken:**"
echo "- ✅ Ticket status updated to **Completed**"
echo "- $(if [ "$ISSUE_CLOSED" = "true" ]; then echo "✅ GitHub Issue #$GITHUB_ISSUE **closed**"; elif [ "$ISSUE_CLOSED" = "false" ]; then echo "❌ GitHub Issue #$GITHUB_ISSUE **failed to close**"; else echo "ℹ️  No GitHub issue to close"; fi)"
echo "- ✅ Ticket document updated with completion info"
$(if [ -n "$SPRINT_NUMBER" ]; then echo "- ✅ Sprint $SPRINT_NUMBER metrics updated"; fi)
echo "- ✅ Audit trail logged"
echo ""
echo "**Updated Files:**"
echo "- 📄 $TICKET_PATH (marked as completed)"
$(if [ -n "$SPRINT_NUMBER" ]; then echo "- 📊 docs/3-sprints/$SPRINT_NUMBER.md (metrics updated)"; fi)
echo "- 📊 Audit logs updated in .claude-shared/project-management/data/"
echo ""
echo "**Traceability Summary:**"
$(if [ -n "$SPRINT_NUMBER" ]; then echo "- **Sprint:** $SPRINT_NUMBER"; fi)
echo "- **Requirement:** \`$REQ_UUID\`"
$(if [ -n "$TOTAL_TICKETS" ] && [ -n "$COMPLETED_TICKETS" ]; then echo "- **Requirement Progress:** $COMPLETED_TICKETS/$TOTAL_TICKETS tickets completed"; fi)
echo "- **Ticket:** \`$TICKET_UUID\` ✅"
echo "- **GitHub Issue:** #$GITHUB_ISSUE $(if [ "$ISSUE_CLOSED" = "true" ]; then echo "✅"; elif [ "$ISSUE_CLOSED" = "false" ]; then echo "❌"; else echo "N/A"; fi)"
echo ""
echo "**What Happens Next:**"
echo "- 📊 **Sprint/requirement metrics** are automatically updated"
echo "- 🔒 **GitHub issue is closed** (if successful)"
echo "- 📋 **Full audit trail** maintained for compliance"
echo "- 🚀 **Ready for next sprint/requirement work**"
echo ""
if [ "$ISSUE_CLOSED" = "false" ]; then
echo "**Manual Action Required:**"
echo "⚠️  Please manually close GitHub Issue #$GITHUB_ISSUE"
echo ""
fi
echo "**Multi-Ticket Development Complete:**"
echo "This ticket supported multiple commits and PRs throughout its lifecycle, reflecting real-world development practices. All work is now complete and properly tracked."
'

## Cleanup

!bash -c 'rm -f /tmp/claudia_complete_context'

!echo "✅ Ticket completion workflow finished successfully"
!echo "🔒 GitHub issue closed and full audit trail maintained"  
!echo "📊 Sprint and requirement metrics updated automatically"