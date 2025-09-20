---
description: "Assign sprint-based tickets to GitHub Issues and Notion with enhanced multi-development workflow support"
allowed-tools: ["Read", "Write", "Bash", "Edit"]
---

# 🎯 Enhanced Sprint-Based Ticket Assignment & Synchronization

Assign a sprint-based ticket to GitHub Issues and Notion with full traceability, multi-commit/PR support, and enhanced status synchronization.

## Processing Sprint-Based Ticket: $ARGUMENTS

!bash -c 'echo "🔍 Preparing to assign sprint-based ticket: $ARGUMENTS"'

## Validate Sprint-Based Ticket Exists

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

# Check if ticket document exists in new sprint-based structure
if [ ! -f ".claude-shared/project-management/5-tickets/$TICKET_UUID.md" ]; then
    echo "❌ ERROR: Sprint-based ticket document not found: .claude-shared/project-management/5-tickets/$TICKET_UUID.md"
    echo "Please run: /claudia:tickets:create first with proper sprint-based format"
    exit 1
fi

# Check if ticket is in enhanced log system
if ! grep -q "\"uuid\":\"$TICKET_UUID\"" .claude-shared/project-management/data/tickets-log.jsonl 2>/dev/null; then
    echo "❌ ERROR: Ticket not found in enhanced audit trail"
    echo "Expected in: .claude-shared/project-management/data/tickets-log.jsonl"
    exit 1
fi

echo "✅ Sprint-based ticket document found and validated"
echo "✅ Enhanced audit trail confirmed"
echo "TICKET_UUID=$TICKET_UUID" > /tmp/claudia_assign_context
'

## Extract Enhanced Sprint-Based Ticket Information

!bash -c '
source /tmp/claudia_assign_context

# Extract sprint-based ticket details from enhanced structure
TICKET_TITLE=$(grep "^# " ".claude-shared/project-management/5-tickets/$TICKET_UUID.md" | sed "s/^# //" | head -1)
TICKET_TYPE=$(grep "^\*\*Type:\*\*" ".claude-shared/project-management/5-tickets/$TICKET_UUID.md" | sed "s/\*\*Type:\*\* //" | head -1)
TICKET_COMPLEXITY=$(grep "^\*\*Complexity:\*\*" ".claude-shared/project-management/5-tickets/$TICKET_UUID.md" | sed "s/\*\*Complexity:\*\* //" | head -1)
REQ_UUID=$(grep "^\*\*Requirement:\*\*" ".claude-shared/project-management/5-tickets/$TICKET_UUID.md" | sed "s/\*\*Requirement:\*\* \`\([^`]*\)\`.*/\1/" | head -1)
TARGET_ENV=$(grep "^\*\*Target Environment:\*\*" ".claude-shared/project-management/5-tickets/$TICKET_UUID.md" | sed "s/\*\*Target Environment:\*\* //" | head -1)
BRANCH_TYPE=$(grep "^\*\*Branch Type:\*\*" ".claude-shared/project-management/5-tickets/$TICKET_UUID.md" | sed "s/\*\*Branch Type:\*\* //" | head -1)

# Extract sprint information from UUID
SPRINT_NUMBER=$(echo "$TICKET_UUID" | cut -d"-" -f1)
REQ_NUMBER=$(echo "$TICKET_UUID" | cut -d"-" -f1,2)

echo "📋 Enhanced Sprint-Based Ticket Details:"
echo "- Title: $TICKET_TITLE"
echo "- Type: $TICKET_TYPE"
echo "- Complexity: $TICKET_COMPLEXITY"
echo "- Requirement: $REQ_UUID"
echo "- Sprint: $SPRINT_NUMBER"
echo "- Target Environment: $TARGET_ENV"
echo "- Branch Type: $BRANCH_TYPE"

# Save enhanced context
cat >> /tmp/claudia_assign_context << EOF
TICKET_TITLE="$TICKET_TITLE"
TICKET_TYPE="$TICKET_TYPE"
TICKET_COMPLEXITY="$TICKET_COMPLEXITY"
REQ_UUID="$REQ_UUID"
TARGET_ENV="$TARGET_ENV"
BRANCH_TYPE="$BRANCH_TYPE"
SPRINT_NUMBER="$SPRINT_NUMBER"
EOF
'

## Create Enhanced GitHub Issue with Multi-Development Support

!bash -c '
source /tmp/claudia_assign_context
echo ""
echo "🐙 Creating Enhanced GitHub Issue with Multi-Development Workflow Support..."

# CRITICAL: Actually CREATE the GitHub issue - never assume it exists
# Prepare enhanced GitHub issue body with multi-commit/PR support
ISSUE_BODY="**Enhanced Sprint-Based Ticket:** \`$TICKET_UUID\`
**Sprint:** \`$SPRINT_NUMBER\` 
**Requirement:** \`$REQ_UUID\`
**Type:** $TICKET_TYPE
**Complexity:** $TICKET_COMPLEXITY
**Target Environment:** \`$TARGET_ENV\`
**Branch Type:** \`$BRANCH_TYPE\`

## Multi-Development Workflow Support
**Important:** This issue supports **real-world development practices**:
- ✅ **Multiple commits per ticket** - Iterative development encouraged
- ✅ **Multiple PRs per ticket** - Complex features can span multiple PRs  
- ✅ **Issue stays open** - Issue will remain open until manual completion
- ✅ **Environment-aware** - All work targets $TARGET_ENV environment
- ✅ **Complete audit trail** - All commits and PRs tracked

## Description
$(grep -A 10 "^## Description" ".claude-shared/project-management/5-tickets/$TICKET_UUID.md" | tail -n +2 | head -n 10)

## Acceptance Criteria
$(grep -A 20 "^## Acceptance Criteria" ".claude-shared/project-management/5-tickets/$TICKET_UUID.md" | tail -n +2)

## Enhanced Implementation Notes
- **Multi-commit development:** Use multiple commits for iterative progress
- **Environment targeting:** All work targets $TARGET_ENV environment
- **Branch naming:** $BRANCH_TYPE$TICKET_UUID (auto-detected type)
- **PR workflow:** Multiple PRs supported - issue stays open until completion
- **Manual completion:** Use \`/claudia:ticket:complete \"$TICKET_UUID\"\` when fully done
- **TDD methodology:** Tests first approach required
- **Test coverage:** Maintain >95% coverage
- **Audit trail:** All work automatically tracked in enhanced logging

**Sprint Integration:** [Sprint $SPRINT_NUMBER](docs/3-sprints/$SPRINT_NUMBER.md)
**Requirement Details:** [Requirement $REQ_UUID](docs/4-requirements/$REQ_UUID.md)
**Full Ticket Details:** [Ticket Document](docs/5-tickets/$TICKET_UUID.md)

---
*Created by Enhanced Claudia Sprint-Based Automation System*  
*Sprint: $SPRINT_NUMBER | Requirement: $REQ_UUID | Environment: $TARGET_ENV*"

# Create GitHub issue using gh CLI
echo "$ISSUE_BODY" > /tmp/github_issue_body.md

# Enhanced label system with sprint and environment context
LABELS="claudia,sprint-based,sprint-$SPRINT_NUMBER,env-$TARGET_ENV"
case "$TICKET_TYPE" in
    "Analysis") LABELS="$LABELS,analysis,research" ;;
    "Implementation") LABELS="$LABELS,feature,implementation" ;;
    "Testing") LABELS="$LABELS,testing,quality,validation" ;;
    "Database") LABELS="$LABELS,database,backend" ;;
    "API") LABELS="$LABELS,api,backend" ;;
    "Frontend") LABELS="$LABELS,frontend,ui" ;;
    "Security") LABELS="$LABELS,security,critical" ;;
    "Performance") LABELS="$LABELS,performance,optimization" ;;
    "Documentation") LABELS="$LABELS,documentation" ;;
    *) LABELS="$LABELS,feature" ;;
esac

# Add branch type to labels
case "$BRANCH_TYPE" in
    "feature/") LABELS="$LABELS,feature-branch" ;;
    "fix/") LABELS="$LABELS,bugfix" ;;
    "test/") LABELS="$LABELS,testing" ;;
    "security/") LABELS="$LABELS,security" ;;
    "hotfix/") LABELS="$LABELS,hotfix,urgent" ;;
    "refactor/") LABELS="$LABELS,refactor,improvement" ;;
    "docs/") LABELS="$LABELS,documentation" ;;
    "chore/") LABELS="$LABELS,maintenance,chore" ;;
esac

# Create the issue
GITHUB_RESPONSE=$(gh issue create \
    --title "[$TICKET_UUID] $TICKET_TITLE" \
    --body-file /tmp/github_issue_body.md \
    --label "$LABELS" \
    --assignee "@me" 2>&1)

if [ $? -eq 0 ]; then
    GITHUB_URL=$(echo "$GITHUB_RESPONSE")
    GITHUB_ISSUE_NUM=$(echo "$GITHUB_URL" | grep -o "/[0-9]*$" | sed "s/\///")
    
    echo "✅ GitHub issue created: #$GITHUB_ISSUE_NUM"
    echo "🔗 URL: $GITHUB_URL"
    
    # CRITICAL: Validate the GitHub issue was actually created and is accessible
    echo "🔍 Validating GitHub issue creation..."
    VALIDATION_CHECK=$(gh issue view "$GITHUB_ISSUE_NUM" --json url 2>/dev/null)
    if [ $? -eq 0 ] && [ -n "$VALIDATION_CHECK" ]; then
        VALIDATED_URL=$(echo "$VALIDATION_CHECK" | node -e "
            let input = '';
            process.stdin.on('data', chunk => input += chunk);
            process.stdin.on('end', () => {
                try {
                    const result = JSON.parse(input);
                    console.log(result.url || '');
                } catch(e) {
                    console.log('');
                }
            });
        ")
        
        if [ -n "$VALIDATED_URL" ]; then
            echo "✅ GitHub issue validated and accessible: $VALIDATED_URL"
            echo "GITHUB_ISSUE_NUM=$GITHUB_ISSUE_NUM" >> /tmp/claudia_assign_context
            echo "GITHUB_URL=\"$VALIDATED_URL\"" >> /tmp/claudia_assign_context
        else
            echo "❌ CRITICAL ERROR: GitHub issue created but URL validation failed"
            echo "Cannot proceed with Notion ticket creation without validated GitHub issue"
            exit 1
        fi
    else
        echo "❌ CRITICAL ERROR: GitHub issue creation reported success but validation failed"
        echo "Issue #$GITHUB_ISSUE_NUM is not accessible or does not exist"
        exit 1
    fi
else
    echo "❌ ERROR: Failed to create GitHub issue"
    echo "$GITHUB_RESPONSE"
    exit 1
fi

rm -f /tmp/github_issue_body.md
'

## Create Notion Ticket with Full Integration

!bash -c '
source /tmp/claudia_assign_context
echo ""
echo "📋 Creating Notion ticket with full integration..."

# Prepare Notion ticket data
DESCRIPTION=$(grep -A 20 "## Description" "5-tickets/$TICKET_UUID.md" | tail -n +2 | head -n 10 | tr "\n" " ")
ACCEPTANCE_CRITERIA=$(grep -A 20 "## Acceptance Criteria" "5-tickets/$TICKET_UUID.md" | tail -n +2 | head -n 10 | tr "\n" " ")

# Map complexity to priority
PRIORITY="Medium"
case "$TICKET_COMPLEXITY" in
    "Simple") PRIORITY="Low" ;;
    "Medium") PRIORITY="Medium" ;;
    "Complex") PRIORITY="High" ;;
    "Critical") PRIORITY="Critical" ;;
esac

# CRITICAL VALIDATION: Check ticket file content before proceeding
TICKET_FILE=".claude-shared/project-management/5-tickets/$TICKET_UUID.md"
if [ ! -s "$TICKET_FILE" ]; then
    echo "❌ CRITICAL ERROR: Ticket file is empty or does not exist: $TICKET_FILE"
    echo "Cannot create incomplete Notion tickets - aborting"
    exit 1
fi

TICKET_SIZE=$(wc -c < "$TICKET_FILE" 2>/dev/null || echo "0")
if [ "$TICKET_SIZE" -lt 500 ]; then
    echo "❌ CRITICAL ERROR: Ticket file too small ($TICKET_SIZE bytes): $TICKET_FILE"
    echo "Cannot create incomplete Notion tickets - content must be substantial"
    exit 1
fi

echo "✅ Ticket file validation passed ($TICKET_SIZE bytes)"

# Check if Notion integration is available
if [ ! -f ".claude-shared/systems/claudia/scripts/notion-client.cjs" ]; then
    echo "⚠️  Notion integration not available - creating placeholder"
    echo "📝 To enable Notion integration:"
    echo "   1. Set NOTION_TOKEN environment variable"
    echo "   2. Update .claude-shared/systems/claudia/config/notion.json with database IDs"
    echo "   3. Install @notionhq/client package"
    
    # Create placeholder entry
    echo "NOTION_SUCCESS=false" >> /tmp/claudia_assign_context
    echo "NOTION_REASON=\"Integration not configured\"" >> /tmp/claudia_assign_context
    exit 0
fi

# Create Notion ticket using the actual integration
cd .claude-shared/systems/claudia/scripts/

# Check if Node.js and dependencies are available
if ! command -v node >/dev/null 2>&1; then
    echo "⚠️  Node.js not found. Notion integration requires Node.js."
    echo "NOTION_SUCCESS=false" >> /tmp/claudia_assign_context
    echo "NOTION_REASON=\"Node.js not available\"" >> /tmp/claudia_assign_context
    cd - >/dev/null
    exit 0
fi

# Try to create actual Notion ticket with VALIDATED GitHub issue
echo "🔄 Attempting to create Notion ticket with validated GitHub issue #$GITHUB_ISSUE_NUM..."
NOTION_RESULT=$(timeout 30 node -e "
const ClaudiaNotionClient = require('./notion-client.cjs');
const client = new ClaudiaNotionClient();

// CRITICAL: Only pass validated GitHub issue information
const ticketData = {
    uuid: '$TICKET_UUID',
    title: '$TICKET_TITLE',
    type: '$TICKET_TYPE',
    priority: '$PRIORITY',
    requirement: '$REQ_UUID',
    githubIssue: '$GITHUB_ISSUE_NUM',  // Use validated issue number
    description: '$DESCRIPTION',
    acceptanceCriteria: '$ACCEPTANCE_CRITERIA',
    status: 'To Do',
    assignee: process.env.NOTION_USER_ID || null,
    estimatedHours: null
};

client.createTicket(ticketData)
    .then(result => {
        console.log(JSON.stringify(result));
        process.exit(0);
    })
    .catch(error => {
        console.log(JSON.stringify({success: false, error: error.message}));
        process.exit(1);
    });
" 2>/dev/null)

NOTION_EXIT_CODE=$?
cd - >/dev/null

# Parse Notion result
if [ $NOTION_EXIT_CODE -eq 0 ] && echo "$NOTION_RESULT" | grep -q "\"success\":true"; then
    NOTION_PAGE_ID=$(echo "$NOTION_RESULT" | node -e "
        let input = '';
        process.stdin.on('data', chunk => input += chunk);
        process.stdin.on('end', () => {
            try {
                const result = JSON.parse(input);
                console.log(result.pageId || 'unknown');
            } catch(e) {
                console.log('parse_error');
            }
        });
    ")
    
    NOTION_URL=$(echo "$NOTION_RESULT" | node -e "
        let input = '';
        process.stdin.on('data', chunk => input += chunk);
        process.stdin.on('end', () => {
            try {
                const result = JSON.parse(input);
                console.log(result.url || 'unknown');
            } catch(e) {
                console.log('parse_error');
            }
        });
    ")
    
    echo "✅ Notion ticket created successfully"
    echo "🔗 Notion URL: $NOTION_URL"
    echo "📄 Page ID: $NOTION_PAGE_ID"
    
    echo "NOTION_PAGE_ID=\"$NOTION_PAGE_ID\"" >> /tmp/claudia_assign_context
    echo "NOTION_URL=\"$NOTION_URL\"" >> /tmp/claudia_assign_context
    echo "NOTION_SUCCESS=true" >> /tmp/claudia_assign_context
else
    echo "⚠️  Notion ticket creation failed"
    
    # Extract error message if available
    ERROR_MSG="Unknown error"
    if [ -n "$NOTION_RESULT" ]; then
        ERROR_MSG=$(echo "$NOTION_RESULT" | node -e "
            let input = '';
            process.stdin.on('data', chunk => input += chunk);
            process.stdin.on('end', () => {
                try {
                    const result = JSON.parse(input);
                    console.log(result.error || 'Parse error');
                } catch(e) {
                    console.log('JSON parse error');
                }
            });
        " 2>/dev/null || echo "Script error")
    fi
    
    echo "📝 Error: $ERROR_MSG"
    echo "🔧 Check Notion configuration and credentials"
    
    echo "NOTION_SUCCESS=false" >> /tmp/claudia_assign_context
    echo "NOTION_REASON=\"$ERROR_MSG\"" >> /tmp/claudia_assign_context
fi
    cat > ".claude/systems/claudia/scripts/notion-sync.sh" << "EOF"
#!/usr/bin/env bash
set -euo pipefail

# Simple Notion page creation script
# Usage: ./notion-sync.sh "title" "description"

TITLE="$1"
DESC="$2"

# Check if NOTION_TOKEN and NOTION_DB are set
if [ -z "${NOTION_TOKEN:-}" ] || [ -z "${NOTION_DB:-}" ]; then
    echo "⚠️  NOTION_TOKEN or NOTION_DB not set - skipping Notion creation"
    echo "Set these environment variables to enable Notion integration"
    exit 0
fi

# Create Notion page via API
RESPONSE=$(curl -s -X POST https://api.notion.com/v1/pages \
  -H "Authorization: Bearer $NOTION_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Notion-Version: 2022-06-28" \
  -d "{
    \"parent\": {\"database_id\": \"$NOTION_DB\"},
    \"properties\": {
      \"Name\": {\"title\": [{\"text\": {\"content\": \"$TITLE\"}}]},
      \"Status\": {\"select\": {\"name\": \"Backlog\"}}
    },
    \"children\": [
      {\"object\":\"block\",\"type\":\"paragraph\",
       \"paragraph\":{\"rich_text\":[{\"type\":\"text\",\"text\":{\"content\":\"$DESC\"}}]}}
    ]
  }")

# Extract page ID from response
PAGE_ID=$(echo "$RESPONSE" | jq -r '.id' 2>/dev/null || echo "error")

if [ "$PAGE_ID" != "error" ] && [ "$PAGE_ID" != "null" ]; then
    echo "$PAGE_ID"
else
    echo "error"
    echo "Response: $RESPONSE" >&2
fi
EOF
    
    chmod +x .claude/systems/claudia/scripts/notion-sync.sh
    echo "✅ Created basic Notion sync script"
fi

# Prepare Notion page content
NOTION_DESC="Ticket: $TICKET_UUID
Type: $TICKET_TYPE
Complexity: $TICKET_COMPLEXITY  
Requirement: $REQ_UUID
GitHub: $GITHUB_URL

$(head -20 "5-tickets/$TICKET_UUID.md" | tail -n +10)"

# Try to create Notion page
NOTION_RESULT=$(./.claude/systems/claudia/scripts/notion-sync.sh "[$TICKET_UUID] $TICKET_TITLE" "$NOTION_DESC" 2>/dev/null || echo "not_available")

if [ "$NOTION_RESULT" = "not_available" ]; then
    echo "⚠️  Notion integration not available - configure NOTION_TOKEN and NOTION_DB"
    NOTION_PAGE_ID="not_configured"
    NOTION_URL="not_configured"
elif [ "$NOTION_RESULT" = "error" ]; then
    echo "❌ ERROR: Failed to create Notion page"
    NOTION_PAGE_ID="error"  
    NOTION_URL="error"
else
    NOTION_PAGE_ID="$NOTION_RESULT"
    NOTION_URL="https://notion.so/$NOTION_PAGE_ID"
    echo "✅ Notion page created: $NOTION_PAGE_ID"
    echo "🔗 URL: $NOTION_URL"
fi

echo "NOTION_PAGE_ID=\"$NOTION_PAGE_ID\"" >> /tmp/claudia_assign_context
echo "NOTION_URL=\"$NOTION_URL\"" >> /tmp/claudia_assign_context
'

## Update Enhanced Sprint-Based Ticket Document with Assignment Info

!bash -c '
source /tmp/claudia_assign_context
echo ""
echo "🔗 Updating sprint-based ticket document with enhanced assignment information..."

# Update ticket status to Assigned
sed -i "s/\*\*Status:\*\* Active/\*\*Status:\*\* Assigned/" ".claude-shared/project-management/5-tickets/$TICKET_UUID.md"
sed -i "s/\*\*Status:\*\* Created/\*\*Status:\*\* Assigned/" ".claude-shared/project-management/5-tickets/$TICKET_UUID.md"

# Update GitHub issue reference with enhanced multi-development support
GITHUB_UPDATE_TEXT="**GitHub Issue:** #$GITHUB_ISSUE_NUM - $GITHUB_URL  
**Issue Status:** Open (supports multiple commits and PRs)  
**Multi-Development:** Issue will remain open until manual completion"

# Find and replace GitHub issue placeholder
sed -i "/\*\*GitHub Issue:\*\*.*To be populated/c\\
$GITHUB_UPDATE_TEXT" ".claude-shared/project-management/5-tickets/$TICKET_UUID.md"

# Update Notion page reference with enhanced context
if [ "$NOTION_PAGE_ID" = "not_configured" ]; then
    NOTION_UPDATE_TEXT="**Notion Page:** Not configured - set NOTION_TOKEN and NOTION_DB  
**Integration Status:** Available but not configured"
elif [ "$NOTION_PAGE_ID" = "error" ]; then
    NOTION_UPDATE_TEXT="**Notion Page:** Error creating page - check Notion configuration  
**Integration Status:** Failed - review configuration"
else
    NOTION_UPDATE_TEXT="**Notion Page:** $NOTION_PAGE_ID - $NOTION_URL  
**Integration Status:** Active and synchronized"
fi

# Find and replace Notion page placeholder
sed -i "/\*\*Notion Page:\*\*.*To be populated/c\\
$NOTION_UPDATE_TEXT" ".claude-shared/project-management/5-tickets/$TICKET_UUID.md"

# Add enhanced traceability section if not exists
if ! grep -q "## Enhanced Multi-Development Tracking" ".claude-shared/project-management/5-tickets/$TICKET_UUID.md"; then
    cat >> ".claude-shared/project-management/5-tickets/$TICKET_UUID.md" << EOF

## Enhanced Multi-Development Tracking

**Assignment Date:** $(date -u +%Y-%m-%dT%H:%M:%SZ)  
**GitHub Issue:** #$GITHUB_ISSUE_NUM (Open - supports multiple PRs)  
**Target Branch:** $BRANCH_TYPE$TICKET_UUID  
**Environment Context:** $TARGET_ENV  
**Sprint Integration:** Sprint $SPRINT_NUMBER  

**Multi-Development Workflow:**
- ✅ Multiple commits supported per ticket
- ✅ Multiple PRs supported per ticket
- ✅ Issue remains open until manual completion
- ✅ Complete audit trail maintained

**Next Steps:**
1. Create branch: \`$BRANCH_TYPE$TICKET_UUID\`
2. Begin development: \`/claudia:commit "$TICKET_UUID"\`
3. Create PRs as needed: \`/claudia:pr:create "$TICKET_UUID"\`
4. Complete when done: \`/claudia:ticket:complete "$TICKET_UUID"\`
EOF
fi

echo "✅ Updated ticket document with assignment details"
'

## Log Assignment to Enhanced Sprint-Based Traceability System

!bash -c '
source /tmp/claudia_assign_context
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)

# Log enhanced ticket assignment with sprint context and multi-development support
echo "{\"timestamp\":\"$TIMESTAMP\",\"action\":\"assigned\",\"uuid\":\"$TICKET_UUID\",\"sprint_uuid\":\"$SPRINT_NUMBER\",\"requirement_uuid\":\"$REQ_UUID\",\"target_env\":\"$TARGET_ENV\",\"branch_type\":\"$BRANCH_TYPE\",\"github_issue\":$GITHUB_ISSUE_NUM,\"github_url\":\"$GITHUB_URL\",\"notion_id\":\"$NOTION_PAGE_ID\",\"notion_url\":\"$NOTION_URL\",\"status\":\"assigned\",\"multi_development\":true,\"issue_lifecycle\":\"open_until_manual_completion\"}" >> .claude-shared/project-management/data/tickets-log.jsonl

# Log enhanced GitHub sync with multi-development context
echo "{\"timestamp\":\"$TIMESTAMP\",\"action\":\"issue_created\",\"ticket_uuid\":\"$TICKET_UUID\",\"sprint_uuid\":\"$SPRINT_NUMBER\",\"github_issue\":$GITHUB_ISSUE_NUM,\"github_url\":\"$GITHUB_URL\",\"target_env\":\"$TARGET_ENV\",\"branch_type\":\"$BRANCH_TYPE\",\"labels\":\"$LABELS\",\"multi_pr_support\":true,\"auto_close_issue\":false}" >> .claude-shared/project-management/data/github-sync.jsonl

# Log enhanced Notion sync with sprint integration (if applicable)
if [ "$NOTION_PAGE_ID" != "not_configured" ] && [ "$NOTION_PAGE_ID" != "error" ]; then
    echo "{\"timestamp\":\"$TIMESTAMP\",\"action\":\"page_created\",\"ticket_uuid\":\"$TICKET_UUID\",\"sprint_uuid\":\"$SPRINT_NUMBER\",\"notion_id\":\"$NOTION_PAGE_ID\",\"notion_url\":\"$NOTION_URL\",\"target_env\":\"$TARGET_ENV\",\"integration_status\":\"active\"}" >> .claude-shared/project-management/data/notion-sync.jsonl
fi

echo "📊 Logged assignment to enhanced sprint-based traceability system"
echo "✅ Multi-development workflow tracking active"
echo "✅ Sprint context preserved in audit trail"
'

## Enhanced Summary & Multi-Development Next Steps

!bash -c '
source /tmp/claudia_assign_context

echo ""
echo "✅ **Enhanced Sprint-Based Ticket Assignment Complete**"
echo ""
echo "**Assigned:** $TICKET_TITLE"
echo "**Sprint-Based Ticket UUID:** \`$TICKET_UUID\`"
echo "**Sprint:** $SPRINT_NUMBER"
echo "**Target Environment:** $TARGET_ENV"
echo "**Branch Type:** $BRANCH_TYPE"
echo ""
echo "**Created Resources with Multi-Development Support:**"
echo "- 🐙 GitHub Issue: #$GITHUB_ISSUE_NUM (Enhanced)"
echo "  - URL: $GITHUB_URL"
echo "  - Status: Open (supports multiple commits and PRs)"
echo "  - Labels: $LABELS"
echo "  - Multi-Development: Enabled"

if [ "$NOTION_PAGE_ID" != "not_configured" ] && [ "$NOTION_PAGE_ID" != "error" ]; then
    echo "- 📝 Notion Page: $NOTION_PAGE_ID"
    echo "  - URL: $NOTION_URL"
    echo "  - Sprint Integration: Active"
    echo "  - Environment Context: $TARGET_ENV"
elif [ "$NOTION_PAGE_ID" = "not_configured" ]; then
    echo "- 📝 Notion: Not configured (set NOTION_TOKEN and NOTION_DB to enable)"
else
    echo "- 📝 Notion: Error creating page (check configuration)"
fi

echo ""
echo "**Updated Files with Enhanced Tracking:**"
echo "- 📄 .claude-shared/project-management/5-tickets/$TICKET_UUID.md (status updated to Assigned + multi-dev tracking)"
echo "- 📊 .claude-shared/project-management/data/tickets-log.jsonl (enhanced audit)"
echo "- 📊 .claude-shared/project-management/data/github-sync.jsonl (multi-PR support)"
if [ "$NOTION_PAGE_ID" != "not_configured" ] && [ "$NOTION_PAGE_ID" != "error" ]; then
    echo "- 📊 .claude-shared/project-management/data/notion-sync.jsonl (sprint integration)"
fi

echo ""
echo "**Enhanced Multi-Development Workflow - Next Steps:**"
echo "1. 🔍 Review GitHub issue: $GITHUB_URL"
echo "2. 🌱 Create branch: git checkout -b $BRANCH_TYPE$TICKET_UUID"
echo "3. 💻 Begin iterative development:"
echo "   /claudia:commit \"$TICKET_UUID\"           # Multiple commits supported"
echo "4. 🔄 Create PRs as needed:"
echo "   /claudia:pr:create \"$TICKET_UUID\"        # Multiple PRs supported"
echo "5. ✅ Complete when fully done:"
echo "   /claudia:ticket:complete \"$TICKET_UUID\"  # Manual completion (closes issue)"
echo ""
echo "**Enhanced Sprint-Based Traceability Chain:**"
echo "Sprint: \`$SPRINT_NUMBER\` → Requirement: \`$REQ_UUID\` → Ticket: \`$TICKET_UUID\` → GitHub: #$GITHUB_ISSUE_NUM"
echo ""
echo "**Multi-Development Features Active:**"
echo "- ✅ Multiple commits per ticket supported"
echo "- ✅ Multiple PRs per ticket supported"
echo "- ✅ Issue lifecycle management (open until manual completion)"
echo "- ✅ Environment-aware development ($TARGET_ENV)"
echo "- ✅ Complete audit trail with sprint context"
'

## Enhanced Cleanup

!bash -c 'rm -f /tmp/claudia_assign_context'

!echo "🎯 Enhanced sprint-based ticket assignment workflow completed successfully"
!echo "🔗 Complete multi-development traceability maintained across all systems"
!echo "🚀 Ready for sprint-based multi-commit/PR implementation phase"
!echo "📊 Enhanced audit trail active with sprint context and environment awareness"