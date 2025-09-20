---
description: "View enhanced sprint-based status with multi-development workflow tracking"
allowed-tools: ["Read", "Bash"]
---

# 📊 Enhanced Sprint-Based Claudia System Status

View comprehensive status of all sprints, requirements, tickets, and multi-development workflow progress across the enhanced sprint-based system.

## Enhanced System Overview

!bash -c 'echo "🔍 Analyzing enhanced sprint-based Claudia automation system status..."'

## Sprint Status Overview

!bash -c '
echo ""
echo "## 🏃 **Sprint Status Overview**"
echo ""

if [ -f ".claude-shared/project-management/data/sprints-log.jsonl" ]; then
    # Count sprints by status
    TOTAL_SPRINTS=$(grep -c "\"action\":\"sprint_created\"" .claude-shared/project-management/data/sprints-log.jsonl 2>/dev/null || echo "0")
    ACTIVE_SPRINTS=$(grep "\"action\":\"sprint_created\"" .claude-shared/project-management/data/sprints-log.jsonl 2>/dev/null | grep -c "\"status\":\"active\"" || echo "0")
    
    echo "**Sprint Summary:**"
    echo "- 🏃 Total Sprints: $TOTAL_SPRINTS"  
    echo "- ✅ Active Sprints: $ACTIVE_SPRINTS"
    echo ""
    
    if [ $TOTAL_SPRINTS -gt 0 ]; then
        echo "**Current Sprints:**"
        grep "\"action\":\"sprint_created\"" .claude-shared/project-management/data/sprints-log.jsonl 2>/dev/null | while read -r line; do
            SPRINT_NUM=$(echo "$line" | jq -r .sprint_number 2>/dev/null || echo "unknown")
            TITLE=$(echo "$line" | jq -r .title 2>/dev/null || echo "unknown")  
            STATUS=$(echo "$line" | jq -r .status 2>/dev/null || echo "unknown")
            TIMESTAMP=$(echo "$line" | jq -r .timestamp 2>/dev/null || echo "unknown")
            echo "- **Sprint $SPRINT_NUM:** $TITLE [$STATUS] ($(echo $TIMESTAMP | cut -d T -f 1))"
        done
    fi
else
    echo "No sprints found. Create your first sprint with:"
    echo "\`/claudia:sprint:create \"030\"\`"
fi
'

## Enhanced Requirements Status

!bash -c '
echo ""
echo "## 📋 **Enhanced Requirements Status**"
echo ""

if [ -f ".claude-shared/project-management/data/requirements-log.jsonl" ]; then
    # Count requirements by status and sprint
    TOTAL_REQS=$(grep -c "\"action\":\"requirement_created\|requirement_migrated\"" .claude-shared/project-management/data/requirements-log.jsonl 2>/dev/null || echo "0")
    
    # Group by sprints
    SPRINTS_WITH_REQS=$(grep "\"action\":\"requirement_created\|requirement_migrated\"" .claude-shared/project-management/data/requirements-log.jsonl 2>/dev/null | jq -r .sprint_uuid 2>/dev/null | sort -u | wc -l || echo "0")
    
    echo "**Requirements Summary:**"
    echo "- 📝 Total Requirements: $TOTAL_REQS"
    echo "- 🏃 Sprints with Requirements: $SPRINTS_WITH_REQS"
    echo ""
    
    if [ $TOTAL_REQS -gt 0 ]; then
        echo "**Recent Sprint-Based Requirements:**"
        grep "\"action\":\"requirement_created\|requirement_migrated\"" .claude-shared/project-management/data/requirements-log.jsonl 2>/dev/null | tail -5 | while read -r line; do
            UUID=$(echo "$line" | jq -r .uuid 2>/dev/null || echo "unknown")
            TITLE=$(echo "$line" | jq -r .title 2>/dev/null || echo "unknown")  
            SPRINT_UUID=$(echo "$line" | jq -r .sprint_uuid 2>/dev/null || echo "unknown")
            TIMESTAMP=$(echo "$line" | jq -r .timestamp 2>/dev/null || echo "unknown")
            echo "- \`$UUID\` (Sprint $SPRINT_UUID) - $TITLE ($(echo $TIMESTAMP | cut -d T -f 1))"
        done
    fi
else
    echo "No requirements found. Create your first requirement with:"
    echo "\`/claudia:requirements:define \"Feature Name\" --sprint 030\`"
fi
'

## Enhanced Multi-Development Tickets Status

!bash -c '
echo ""
echo "## 🎫 **Enhanced Multi-Development Tickets Status**"
echo ""

if [ -f ".claude-shared/project-management/data/tickets-log.jsonl" ]; then
    # Count tickets by status with enhanced multi-development context
    TOTAL_TICKETS=$(grep -c "\"action\":\"created\|ticket_created\|tickets_migrated\"" .claude-shared/project-management/data/tickets-log.jsonl 2>/dev/null || echo "0")
    ASSIGNED_TICKETS=$(grep -c "\"action\":\"assigned\"" .claude-shared/project-management/data/tickets-log.jsonl 2>/dev/null || echo "0")
    COMPLETED_TICKETS=$(grep -c "\"action\":\"ticket_completed\"" .claude-shared/project-management/data/tickets-log.jsonl 2>/dev/null || echo "0")
    
    # Environment distribution
    DEV_TICKETS=$(grep "\"target_env\":\"dev\"" .claude-shared/project-management/data/tickets-log.jsonl 2>/dev/null | wc -l || echo "0")
    STAGING_TICKETS=$(grep "\"target_env\":\"staging\"" .claude-shared/project-management/data/tickets-log.jsonl 2>/dev/null | wc -l || echo "0")
    
    echo "**Multi-Development Tickets Summary:**"
    echo "- 🎫 Total Tickets: $TOTAL_TICKETS"
    echo "- ✅ Assigned Tickets: $ASSIGNED_TICKETS"
    echo "- 🏁 Completed Tickets: $COMPLETED_TICKETS"
    echo "- 🚧 In Progress: $((ASSIGNED_TICKETS - COMPLETED_TICKETS))"
    echo ""
    echo "**Environment Distribution:**"
    echo "- 🔧 Development Environment: $DEV_TICKETS tickets"
    echo "- 🚀 Staging Environment: $STAGING_TICKETS tickets"
    echo ""
    
    if [ $TOTAL_TICKETS -gt 0 ]; then
        echo "**Recent Sprint-Based Tickets:**"
        grep "\"action\":\"created\|ticket_created\|assigned\"" .claude-shared/project-management/data/tickets-log.jsonl 2>/dev/null | tail -5 | while read -r line; do
            UUID=$(echo "$line" | jq -r .uuid 2>/dev/null || echo "unknown")
            SPRINT_UUID=$(echo "$line" | jq -r .sprint_uuid 2>/dev/null || echo "unknown")
            TARGET_ENV=$(echo "$line" | jq -r .target_env 2>/dev/null || echo "unknown")
            ACTION=$(echo "$line" | jq -r .action 2>/dev/null || echo "unknown")
            TIMESTAMP=$(echo "$line" | jq -r .timestamp 2>/dev/null || echo "unknown")
            
            if [ "$ACTION" = "assigned" ]; then
                GITHUB_ISSUE=$(echo "$line" | jq -r .github_issue 2>/dev/null || echo "unknown")
                echo "- \`$UUID\` (Sprint $SPRINT_UUID, $TARGET_ENV) - Assigned to GitHub #$GITHUB_ISSUE ($(echo $TIMESTAMP | cut -d T -f 1))"
            else
                echo "- \`$UUID\` (Sprint $SPRINT_UUID, $TARGET_ENV) - $ACTION ($(echo $TIMESTAMP | cut -d T -f 1))"
            fi
        done
    fi
else
    echo "No tickets found. Create your first tickets with:"
    echo "\`/claudia:tickets:create \"030-01\" --env dev\`"
fi
'

## Multi-Development Workflow Status

!bash -c '
echo ""
echo "## 🔄 **Multi-Development Workflow Status**"
echo ""

# Check commits status
if [ -f ".claude-shared/project-management/data/commits-log.jsonl" ]; then
    TOTAL_COMMITS=$(grep -c "\"action\":\"commit_logged\"" .claude-shared/project-management/data/commits-log.jsonl 2>/dev/null || echo "0")
    
    # Count unique tickets with commits
    TICKETS_WITH_COMMITS=$(grep "\"action\":\"commit_logged\"" .claude-shared/project-management/data/commits-log.jsonl 2>/dev/null | jq -r .ticket_uuid 2>/dev/null | sort -u | wc -l || echo "0")
    
    echo "**Multi-Commit Development:**"
    echo "- 💻 Total Commits: $TOTAL_COMMITS"
    echo "- 🎫 Tickets with Commits: $TICKETS_WITH_COMMITS"
    
    if [ $TICKETS_WITH_COMMITS -gt 0 ]; then
        AVG_COMMITS=$(echo "scale=1; $TOTAL_COMMITS / $TICKETS_WITH_COMMITS" | bc 2>/dev/null || echo "N/A")
        echo "- 📊 Average Commits per Ticket: $AVG_COMMITS"
    fi
else
    echo "**Multi-Commit Development:** No commits tracked yet"
fi

# Check PR status  
if [ -f ".claude-shared/project-management/data/github-sync.jsonl" ]; then
    TOTAL_PRS=$(grep -c "\"action\":\"pr_created\"" .claude-shared/project-management/data/github-sync.jsonl 2>/dev/null || echo "0")
    GITHUB_ISSUES=$(grep -c "\"action\":\"issue_created\"" .claude-shared/project-management/data/github-sync.jsonl 2>/dev/null || echo "0")
    
    echo ""
    echo "**Multi-PR Development:**"
    echo "- 🔀 Total PRs Created: $TOTAL_PRS"
    echo "- 🐙 GitHub Issues Created: $GITHUB_ISSUES"
    
    # Calculate tickets with multiple PRs
    if [ $TOTAL_PRS -gt 0 ] && [ $GITHUB_ISSUES -gt 0 ]; then
        if [ $GITHUB_ISSUES -ne 0 ]; then
            AVG_PRS=$(echo "scale=1; $TOTAL_PRS / $GITHUB_ISSUES" | bc 2>/dev/null || echo "N/A")
            echo "- 📊 Average PRs per Ticket: $AVG_PRS"
        fi
    fi
    
    # Show multi-PR tickets
    MULTI_PR_TICKETS=$(grep "\"action\":\"pr_created\"" .claude-shared/project-management/data/github-sync.jsonl 2>/dev/null | jq -r .ticket_uuid 2>/dev/null | sort | uniq -c | awk "$1 > 1 {count++} END {print count+0}")
    echo "- 🔄 Tickets with Multiple PRs: $MULTI_PR_TICKETS"
else
    echo ""
    echo "**Multi-PR Development:** No PRs tracked yet"
fi
'

## GitHub Integration Status

!bash -c '
echo ""
echo "## 🐙 **GitHub Integration Status**"
echo ""

if [ -f ".claude-shared/project-management/data/github-sync.jsonl" ]; then
    # Enhanced GitHub integration metrics
    ISSUES_CREATED=$(grep -c "\"action\":\"issue_created\"" .claude-shared/project-management/data/github-sync.jsonl 2>/dev/null || echo "0")
    ISSUES_CLOSED=$(grep -c "\"action\":\"issue_closed\"" .claude-shared/project-management/data/github-sync.jsonl 2>/dev/null || echo "0")
    OPEN_ISSUES=$((ISSUES_CREATED - ISSUES_CLOSED))
    
    echo "**GitHub Issues (Enhanced Lifecycle):**"
    echo "- 🐙 Issues Created: $ISSUES_CREATED"
    echo "- 🔓 Issues Currently Open: $OPEN_ISSUES"
    echo "- ✅ Issues Closed (Manual): $ISSUES_CLOSED"
    
    if [ $OPEN_ISSUES -gt 0 ]; then
        echo ""
        echo "**⚠️  Open Issues Supporting Multi-Development:**"
        grep "\"action\":\"issue_created\"" .claude-shared/project-management/data/github-sync.jsonl 2>/dev/null | tail -$OPEN_ISSUES | while read -r line; do
            TICKET_UUID=$(echo "$line" | jq -r .ticket_uuid 2>/dev/null || echo "unknown")
            GITHUB_ISSUE=$(echo "$line" | jq -r .github_issue 2>/dev/null || echo "unknown")
            SPRINT_UUID=$(echo "$line" | jq -r .sprint_uuid 2>/dev/null || echo "unknown")
            echo "- Issue #$GITHUB_ISSUE: \`$TICKET_UUID\` (Sprint $SPRINT_UUID) - Open for multi-commit/PR development"
        done
        echo ""
        echo "💡 **Note:** Issues remain open to support multiple commits and PRs per ticket"
        echo "💡 Use \`/claudia:ticket:complete\` to manually close issues when fully done"
    fi
else
    echo "**GitHub Integration:** Not active or no issues tracked"
fi
'

## Environment-Aware Development Status

!bash -c '
echo ""
echo "## 🌍 **Environment-Aware Development Status**"
echo ""

# Development environment status
if [ -f ".claude-shared/project-management/data/tickets-log.jsonl" ]; then
    echo "**Environment Distribution Analysis:**"
    
    # Count by environment
    DEV_TOTAL=$(grep "\"target_env\":\"dev\"" .claude-shared/project-management/data/tickets-log.jsonl 2>/dev/null | wc -l || echo "0")
    STAGING_TOTAL=$(grep "\"target_env\":\"staging\"" .claude-shared/project-management/data/tickets-log.jsonl 2>/dev/null | wc -l || echo "0")
    
    DEV_ASSIGNED=$(grep "\"action\":\"assigned\"" .claude-shared/project-management/data/tickets-log.jsonl 2>/dev/null | grep "\"target_env\":\"dev\"" | wc -l || echo "0")
    STAGING_ASSIGNED=$(grep "\"action\":\"assigned\"" .claude-shared/project-management/data/tickets-log.jsonl 2>/dev/null | grep "\"target_env\":\"staging\"" | wc -l || echo "0")
    
    echo "- 🔧 **Development Environment:**"
    echo "  - Total Tickets: $DEV_TOTAL"
    echo "  - Assigned & Active: $DEV_ASSIGNED"
    echo "- 🚀 **Staging Environment:**"
    echo "  - Total Tickets: $STAGING_TOTAL" 
    echo "  - Assigned & Active: $STAGING_ASSIGNED"
    
    # Branch type distribution
    echo ""
    echo "**Branch Type Distribution:**"
    if [ -f ".claude-shared/project-management/data/tickets-log.jsonl" ]; then
        echo "- feature/ branches: $(grep "\"branch_type\":\"feature/\"" .claude-shared/project-management/data/tickets-log.jsonl 2>/dev/null | wc -l || echo "0")"
        echo "- test/ branches: $(grep "\"branch_type\":\"test/\"" .claude-shared/project-management/data/tickets-log.jsonl 2>/dev/null | wc -l || echo "0")"
        echo "- fix/ branches: $(grep "\"branch_type\":\"fix/\"" .claude-shared/project-management/data/tickets-log.jsonl 2>/dev/null | wc -l || echo "0")"
        echo "- security/ branches: $(grep "\"branch_type\":\"security/\"" .claude-shared/project-management/data/tickets-log.jsonl 2>/dev/null | wc -l || echo "0")"
    fi
else
    echo "No environment data available. Create environment-aware tickets with:"
    echo "\`/claudia:tickets:create \"030-01\" --env dev\`"
    echo "\`/claudia:tickets:create \"030-02\" --env staging\`"
fi
'

## System Health & Compliance

!bash -c '
echo ""
echo "## 🏥 **System Health & Compliance**"
echo ""

# Check audit trail completeness
AUDIT_FILES=(
    ".claude-shared/project-management/data/sprints-log.jsonl"
    ".claude-shared/project-management/data/requirements-log.jsonl"
    ".claude-shared/project-management/data/tickets-log.jsonl" 
    ".claude-shared/project-management/data/commits-log.jsonl"
    ".claude-shared/project-management/data/github-sync.jsonl"
    ".claude-shared/project-management/data/notion-sync.jsonl"
)

echo "**Audit Trail Health:**"
HEALTHY_LOGS=0
for file in "${AUDIT_FILES[@]}"; do
    if [ -f "$file" ]; then
        SIZE=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo "0")
        if [ "$SIZE" -gt 0 ]; then
            echo "- ✅ $(basename "$file"): Active (${SIZE} bytes)"
            HEALTHY_LOGS=$((HEALTHY_LOGS + 1))
        else
            echo "- ⚠️ $(basename "$file"): Empty"
        fi
    else
        echo "- ❌ $(basename "$file"): Missing"
    fi
done

TOTAL_LOGS=${#AUDIT_FILES[@]}
HEALTH_PERCENTAGE=$((HEALTHY_LOGS * 100 / TOTAL_LOGS))

echo ""
echo "**Compliance Status:**"
echo "- 📊 Audit Trail Health: $HEALTHY_LOGS/$TOTAL_LOGS logs active ($HEALTH_PERCENTAGE%)"

if [ $HEALTH_PERCENTAGE -ge 80 ]; then
    echo "- ✅ System Health: EXCELLENT"
elif [ $HEALTH_PERCENTAGE -ge 60 ]; then
    echo "- 🟡 System Health: GOOD"  
else
    echo "- ⚠️ System Health: NEEDS ATTENTION"
fi

# Sprint-based compliance
if [ -f ".claude-shared/project-management/data/sprints-log.jsonl" ]; then
    TOTAL_SPRINTS=$(grep -c "\"action\":\"sprint_created\"" .claude-shared/project-management/data/sprints-log.jsonl 2>/dev/null || echo "0")
    if [ $TOTAL_SPRINTS -gt 0 ]; then
        echo "- ✅ Sprint-Based Organization: ACTIVE ($TOTAL_SPRINTS sprints)"
    else
        echo "- ⚠️ Sprint-Based Organization: NOT STARTED"
    fi
else
    echo "- ❌ Sprint-Based Organization: NOT CONFIGURED"
fi

# Multi-development compliance
if [ -f ".claude-shared/project-management/data/commits-log.jsonl" ] && [ -f ".claude-shared/project-management/data/github-sync.jsonl" ]; then
    echo "- ✅ Multi-Development Workflow: SUPPORTED"
else
    echo "- ⚠️ Multi-Development Workflow: PARTIAL SUPPORT"
fi
'

## Quick Actions

!bash -c '
echo ""
echo "## ⚡ **Quick Actions**"
echo ""
echo "**Sprint Management:**"
echo "- Create new sprint: \`/claudia:sprint:create \"031\"\`"
echo "- View sprint details: Check \`docs/3-sprints/030.md\`"
echo ""
echo "**Requirements & Tickets:**"
echo "- Create requirement: \`/claudia:requirements:define \"Feature Name\" --sprint 030\`"
echo "- Create tickets: \`/claudia:tickets:create \"030-01\" --env dev\`"
echo "- Assign tickets: \`/claudia:tickets:assign \"030-01-01-implementation\"\`"
echo ""
echo "**Multi-Development Workflow:**"
echo "- Start development: \`/claudia:commit \"030-01-01-implementation\"\`"
echo "- Create PR: \`/claudia:pr:create \"030-01-01-implementation\"\`"
echo "- Complete ticket: \`/claudia:ticket:complete \"030-01-01-implementation\"\`"
echo ""
echo "**System Status:**"
echo "- Generate detailed report: \`/claudia:utils:report\`"
echo "- Check specific sprint: Review audit logs in \`.claude-shared/project-management/data/\`"
'

!echo ""
!echo "📊 Enhanced sprint-based Claudia system status complete"
!echo "🔄 Multi-development workflow tracking active" 
!echo "🏃 Sprint-based organization operational"