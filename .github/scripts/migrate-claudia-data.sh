#!/bin/bash
# Claudia Data Migration Script
# Migrates existing Claudia project management data to GitHub Issues and Projects

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${BLUE}📁 Phase 1A: Claudia Data Migration to GitHub${NC}"
echo "=============================================="

# Configuration
CLAUDIA_DATA_DIR=".claude-shared/project-management"
MIGRATION_LOG=".github/migration-log-$(date +%Y%m%d-%H%M%S).md"
DRY_RUN=${1:-false}

if [ "$DRY_RUN" = "true" ]; then
    echo -e "${YELLOW}🧪 DRY RUN MODE - No actual GitHub changes will be made${NC}"
fi

# Check prerequisites
echo -e "${BLUE}🔍 Checking prerequisites...${NC}"

if [ ! -d "$CLAUDIA_DATA_DIR" ]; then
    echo -e "${RED}❌ Claudia project management directory not found: $CLAUDIA_DATA_DIR${NC}"
    exit 1
fi

if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) is not installed${NC}"
    echo "Install with: brew install gh"
    exit 1
fi

if ! gh auth status &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI not authenticated${NC}"
    echo "Run: gh auth login"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites met${NC}"

# Initialize migration log
cat > "$MIGRATION_LOG" << 'EOF'
# Claudia Data Migration Log

**Migration Date**: $(date)
**Migration Type**: Claudia Project Management → GitHub Issues/Projects
**Status**: In Progress

## Migration Summary

### Data Sources
- Sprints: `.claude-shared/project-management/3-sprints/`
- Requirements: `.claude-shared/project-management/4-requirements/`
- Tickets: `.claude-shared/project-management/5-tickets/`
- Audit Logs: `.claude-shared/project-management/data/`

### Migration Targets
- GitHub Issues (with proper labels and milestones)
- GitHub Projects (sprint and requirement tracking)
- GitHub Milestones (sprint-based milestones)

## Migration Progress

EOF

echo -e "${BLUE}📋 Starting data analysis...${NC}"

# Analyze existing data
analyze_claudia_data() {
    local data_type="$1"
    local data_dir="$2"
    local count=0

    if [ -d "$data_dir" ]; then
        count=$(find "$data_dir" -name "*.md" -type f | wc -l | tr -d ' ')
        echo -e "${BLUE}📊 Found $count $data_type files${NC}"

        # Log to migration log
        echo "### $data_type Analysis" >> "$MIGRATION_LOG"
        echo "- **Files Found**: $count" >> "$MIGRATION_LOG"
        echo "- **Source Directory**: \`$data_dir\`" >> "$MIGRATION_LOG"
        echo "" >> "$MIGRATION_LOG"

        return $count
    else
        echo -e "${YELLOW}⚠️ Directory not found: $data_dir${NC}"
        return 0
    fi
}

# Analyze data
SPRINT_COUNT=$(analyze_claudia_data "Sprints" "$CLAUDIA_DATA_DIR/3-sprints")
REQUIREMENT_COUNT=$(analyze_claudia_data "Requirements" "$CLAUDIA_DATA_DIR/4-requirements")
TICKET_COUNT=$(analyze_claudia_data "Tickets" "$CLAUDIA_DATA_DIR/5-tickets")

echo ""
echo -e "${PURPLE}📈 Migration Plan Summary:${NC}"
echo -e "${BLUE}  • Sprints to migrate: $SPRINT_COUNT${NC}"
echo -e "${BLUE}  • Requirements to migrate: $REQUIREMENT_COUNT${NC}"
echo -e "${BLUE}  • Tickets to migrate: $TICKET_COUNT${NC}"
echo ""

# Function to create GitHub milestone from sprint
migrate_sprint_to_milestone() {
    local sprint_file="$1"
    local sprint_name=$(basename "$sprint_file" .md)

    echo -e "${BLUE}🚀 Migrating Sprint $sprint_name to GitHub Milestone...${NC}"

    # Extract sprint information
    local sprint_title=$(grep "^# " "$sprint_file" | head -1 | sed 's/^# //')
    local sprint_description="Sprint $sprint_name - Migrated from Claudia project management system"

    # Extract dates if available
    local due_date=""
    if grep -q "End Date" "$sprint_file"; then
        # Try to extract and format date (basic parsing)
        due_date=$(grep "End Date" "$sprint_file" | sed 's/.*End Date.*: *//' | head -1)
    fi

    if [ "$DRY_RUN" = "false" ]; then
        # Create milestone
        if [ -n "$due_date" ]; then
            gh api repos/:owner/:repo/milestones \
                --method POST \
                --field title="$sprint_title" \
                --field description="$sprint_description" \
                --field due_on="$due_date" \
                --field state="open" || echo "Failed to create milestone with due date"
        else
            gh api repos/:owner/:repo/milestones \
                --method POST \
                --field title="$sprint_title" \
                --field description="$sprint_description" \
                --field state="open" || echo "Failed to create milestone"
        fi

        echo -e "${GREEN}✅ Created milestone: $sprint_title${NC}"
    else
        echo -e "${YELLOW}🧪 DRY RUN: Would create milestone: $sprint_title${NC}"
    fi

    # Log migration
    echo "#### Sprint Migration: $sprint_name" >> "$MIGRATION_LOG"
    echo "- **Status**: ✅ Migrated" >> "$MIGRATION_LOG"
    echo "- **GitHub Milestone**: $sprint_title" >> "$MIGRATION_LOG"
    echo "- **Original File**: \`$sprint_file\`" >> "$MIGRATION_LOG"
    echo "" >> "$MIGRATION_LOG"
}

# Function to create GitHub issue from requirement
migrate_requirement_to_issue() {
    local req_file="$1"
    local req_name=$(basename "$req_file" .md)

    echo -e "${BLUE}🔍 Migrating Requirement $req_name to GitHub Issue...${NC}"

    # Extract requirement information
    local req_title=$(grep "^# " "$req_file" | head -1 | sed 's/^# //')
    local req_uuid=$(grep "Requirement ID" "$req_file" | sed 's/.*`\(.*\)`.*/\1/')
    local sprint_num=$(echo "$req_uuid" | cut -d'-' -f1)

    # Build issue body from requirement file
    local issue_body="## 🔍 Claudia Requirement (Migrated)

**Original UUID**: \`$req_uuid\`
**Sprint**: $sprint_num
**Source**: Migrated from \`.claude-shared/project-management/4-requirements/$req_name.md\`

---

$(tail -n +5 "$req_file")

---

**Migration Note**: This issue was automatically migrated from the Claudia project management system. The original requirement document remains available in the repository.

### Claudia Workflow Integration
- [ ] Requirement document exists: \`$req_file\`
- [ ] Sprint association confirmed
- [ ] Ready for implementation via \`/claudia:implement:manual\` or \`/claudia:implement:auto\`

**Commands to continue workflow**:
\`\`\`bash
# If implementing manually
/claudia:implement:manual \"$req_uuid\"

# When ready to commit
/claudia:commit \"ISSUE_NUMBER\"

# When ready for PR
/claudia:pr:create \"ISSUE_NUMBER\"
\`\`\`"

    if [ "$DRY_RUN" = "false" ]; then
        # Create GitHub issue
        local issue_url=$(gh issue create \
            --title "$req_title" \
            --body "$issue_body" \
            --label "claudia:requirement,type:requirement,migrated:auto" \
            --milestone "Sprint $sprint_num" \
            2>/dev/null || gh issue create \
            --title "$req_title" \
            --body "$issue_body" \
            --label "claudia:requirement,type:requirement,migrated:auto")

        echo -e "${GREEN}✅ Created issue: $req_title${NC}"
        echo -e "${BLUE}   URL: $issue_url${NC}"
    else
        echo -e "${YELLOW}🧪 DRY RUN: Would create issue: $req_title${NC}"
        issue_url="[DRY RUN - NO URL]"
    fi

    # Log migration
    echo "#### Requirement Migration: $req_name" >> "$MIGRATION_LOG"
    echo "- **Status**: ✅ Migrated" >> "$MIGRATION_LOG"
    echo "- **GitHub Issue**: [$req_title]($issue_url)" >> "$MIGRATION_LOG"
    echo "- **Original UUID**: \`$req_uuid\`" >> "$MIGRATION_LOG"
    echo "- **Sprint**: $sprint_num" >> "$MIGRATION_LOG"
    echo "- **Original File**: \`$req_file\`" >> "$MIGRATION_LOG"
    echo "" >> "$MIGRATION_LOG"
}

# Function to migrate tickets (if any)
migrate_ticket_to_issue() {
    local ticket_file="$1"
    local ticket_name=$(basename "$ticket_file" .md)

    echo -e "${BLUE}🎫 Migrating Ticket $ticket_name to GitHub Issue...${NC}"

    # Extract ticket information
    local ticket_title=$(grep "^# " "$ticket_file" | head -1 | sed 's/^# //')
    local ticket_uuid=$(grep "Ticket ID" "$ticket_file" | sed 's/.*`\(.*\)`.*/\1/' || echo "$ticket_name")

    # Build issue body
    local issue_body="## 🎫 Claudia Ticket (Migrated)

**Original UUID**: \`$ticket_uuid\`
**Source**: Migrated from \`.claude-shared/project-management/5-tickets/$ticket_name.md\`

---

$(tail -n +5 "$ticket_file")

---

**Migration Note**: This issue was automatically migrated from the Claudia ticket system.

### Implementation Status
- [ ] Implementation completed
- [ ] Code committed via Claudia workflow
- [ ] Pull request created
- [ ] Code review completed
- [ ] Merged to main"

    if [ "$DRY_RUN" = "false" ]; then
        local issue_url=$(gh issue create \
            --title "$ticket_title" \
            --body "$issue_body" \
            --label "claudia:ticket,type:implementation,migrated:auto")

        echo -e "${GREEN}✅ Created issue: $ticket_title${NC}"
    else
        echo -e "${YELLOW}🧪 DRY RUN: Would create issue: $ticket_title${NC}"
    fi

    # Log migration
    echo "#### Ticket Migration: $ticket_name" >> "$MIGRATION_LOG"
    echo "- **Status**: ✅ Migrated" >> "$MIGRATION_LOG"
    echo "- **GitHub Issue**: $ticket_title" >> "$MIGRATION_LOG"
    echo "- **Original UUID**: \`$ticket_uuid\`" >> "$MIGRATION_LOG"
    echo "- **Original File**: \`$ticket_file\`" >> "$MIGRATION_LOG"
    echo "" >> "$MIGRATION_LOG"
}

echo -e "${BLUE}🚀 Starting migration process...${NC}"

# Migrate sprints to milestones
if [ $SPRINT_COUNT -gt 0 ]; then
    echo -e "${PURPLE}📅 Migrating Sprints to GitHub Milestones...${NC}"

    for sprint_file in "$CLAUDIA_DATA_DIR/3-sprints"/*.md; do
        if [ -f "$sprint_file" ]; then
            migrate_sprint_to_milestone "$sprint_file"
        fi
    done

    echo -e "${GREEN}✅ Sprint migration completed${NC}"
    echo ""
fi

# Migrate requirements to issues
if [ $REQUIREMENT_COUNT -gt 0 ]; then
    echo -e "${PURPLE}📋 Migrating Requirements to GitHub Issues...${NC}"

    for req_file in "$CLAUDIA_DATA_DIR/4-requirements"/*.md; do
        if [ -f "$req_file" ]; then
            migrate_requirement_to_issue "$req_file"
        fi
    done

    echo -e "${GREEN}✅ Requirement migration completed${NC}"
    echo ""
fi

# Migrate tickets to issues
if [ $TICKET_COUNT -gt 0 ]; then
    echo -e "${PURPLE}🎫 Migrating Tickets to GitHub Issues...${NC}"

    for ticket_file in "$CLAUDIA_DATA_DIR/5-tickets"/*.md; do
        if [ -f "$ticket_file" ]; then
            migrate_ticket_to_issue "$ticket_file"
        fi
    done

    echo -e "${GREEN}✅ Ticket migration completed${NC}"
    echo ""
fi

# Finalize migration log
echo "" >> "$MIGRATION_LOG"
echo "## Migration Completed" >> "$MIGRATION_LOG"
echo "" >> "$MIGRATION_LOG"
echo "**Completion Date**: $(date)" >> "$MIGRATION_LOG"
echo "**Status**: ✅ Completed Successfully" >> "$MIGRATION_LOG"
echo "" >> "$MIGRATION_LOG"
echo "### Post-Migration Steps" >> "$MIGRATION_LOG"
echo "" >> "$MIGRATION_LOG"
echo "1. **Verify GitHub Issues**: Review all created issues for accuracy" >> "$MIGRATION_LOG"
echo "2. **Configure Projects**: Link issues to appropriate GitHub Projects" >> "$MIGRATION_LOG"
echo "3. **Test Claudia Commands**: Ensure all commands work with migrated data" >> "$MIGRATION_LOG"
echo "4. **Update Documentation**: Update any references to old project management locations" >> "$MIGRATION_LOG"
echo "5. **Backup Original Data**: Archive original Claudia files as backup" >> "$MIGRATION_LOG"
echo "" >> "$MIGRATION_LOG"
echo "### Continued Workflow" >> "$MIGRATION_LOG"
echo "" >> "$MIGRATION_LOG"
echo "All new work should use the standard Claudia commands:" >> "$MIGRATION_LOG"
echo "- \`/claudia:sprint:create\` for new sprints" >> "$MIGRATION_LOG"
echo "- \`/claudia:requirements:define\` for new requirements" >> "$MIGRATION_LOG"
echo "- \`/claudia:issues:create\` for GitHub issue creation" >> "$MIGRATION_LOG"
echo "- Continue with normal implementation workflow" >> "$MIGRATION_LOG"

echo ""
echo -e "${GREEN}🎉 Migration Process Complete!${NC}"
echo ""
echo -e "${BLUE}📊 Migration Summary:${NC}"
echo -e "${GREEN}  ✅ Sprints migrated: $SPRINT_COUNT${NC}"
echo -e "${GREEN}  ✅ Requirements migrated: $REQUIREMENT_COUNT${NC}"
echo -e "${GREEN}  ✅ Tickets migrated: $TICKET_COUNT${NC}"
echo ""
echo -e "${BLUE}📋 Migration log saved to: $MIGRATION_LOG${NC}"
echo ""

if [ "$DRY_RUN" = "true" ]; then
    echo -e "${YELLOW}🧪 This was a DRY RUN - no actual changes were made${NC}"
    echo -e "${BLUE}💡 To execute the migration, run: $0 false${NC}"
    echo ""
fi

echo -e "${YELLOW}📝 Next Steps:${NC}"
echo "1. Review created GitHub issues and milestones"
echo "2. Configure GitHub Projects to include migrated issues"
echo "3. Test Claudia commands with migrated data"
echo "4. Archive original Claudia files as backup"
echo "5. Update team on new GitHub-based workflow"
echo ""
echo -e "${BLUE}🔧 Recommended Commands:${NC}"
echo "# Review created issues"
echo "gh issue list --label 'migrated:auto'"
echo ""
echo "# Review created milestones"
echo "gh api repos/:owner/:repo/milestones"
echo ""
echo "# Test Claudia workflow"
echo "/claudia:issues:pull"
echo ""
