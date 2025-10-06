---
description: "Create multiple GitHub issues from all requirements in a sprint document at once"
allowed-tools: ["Read", "Write", "Edit", "Bash"]
---

# 🎯 Create Multiple GitHub Issues from Sprint

Create GitHub issues for all requirements in a sprint document at once, with automatic ticket storage in 5-tickets/ folder.

## Processing Multiple Issue Creation: $ARGUMENTS

!bash -c 'echo "🎯 Creating multiple GitHub issues from sprint: $ARGUMENTS"'

## Parse Arguments and Validate

!bash -c '
# Parse arguments: sprint-number [--labels "label1,label2"] [--skip "1,3"]
SPRINT_NUMBER=""
LABELS=""
SKIP_REQUIREMENTS=""

ARGS_STRING="$ARGUMENTS"

# Extract sprint number (first argument)
SPRINT_NUMBER=$(echo "$ARGS_STRING" | awk "{print \$1}" | sed "s/[\"\']//g")

# Extract labels if provided
if echo "$ARGS_STRING" | grep -q "\--labels"; then
    LABELS=$(echo "$ARGS_STRING" | sed "s/.*--labels //" | awk "{print \$1}" | sed "s/[\"\']//g")
fi

# Extract requirements to skip if provided
if echo "$ARGS_STRING" | grep -q "\--skip"; then
    SKIP_REQUIREMENTS=$(echo "$ARGS_STRING" | sed "s/.*--skip //" | awk "{print \$1}" | sed "s/[\"\']//g")
fi

# Validate sprint number
if [[ ! "$SPRINT_NUMBER" =~ ^[0-9]{3}$ ]]; then
    echo "❌ ERROR: Sprint number must be 3 digits (e.g., 002, 030, 031)"
    echo "Usage: /claudia:issues:multiple-create \"002\" [--labels \"enhancement,UI\"] [--skip \"1,3\"]"
    exit 1
fi

# Check if sprint file exists
SPRINT_FILE=".claude-shared/project-management/3-sprints/$SPRINT_NUMBER.md"
if [ ! -f "$SPRINT_FILE" ]; then
    echo "❌ ERROR: Sprint file not found: $SPRINT_FILE"
    echo "Create sprint first: /claudia:sprint:create \"$SPRINT_NUMBER\""
    exit 1
fi

echo "✅ Arguments validated"
echo "SPRINT_NUMBER=$SPRINT_NUMBER" > /tmp/claudia_multi_issue_context
echo "SPRINT_FILE=$SPRINT_FILE" >> /tmp/claudia_multi_issue_context
echo "LABELS=$LABELS" >> /tmp/claudia_multi_issue_context
echo "SKIP_REQUIREMENTS=$SKIP_REQUIREMENTS" >> /tmp/claudia_multi_issue_context
'

## Discover All Requirements in Sprint

!bash -c '
source /tmp/claudia_multi_issue_context

echo ""
echo "🔍 Discovering requirements in sprint document..."

# Find all requirement headers
REQUIREMENT_LINES=$(grep -n "^### Requirement [0-9]*:" "$SPRINT_FILE")

if [ -z "$REQUIREMENT_LINES" ]; then
    echo "❌ ERROR: No requirements found in sprint $SPRINT_NUMBER"
    echo "Sprint document should have requirements in format: ### Requirement N: Title"
    exit 1
fi

# Extract requirement numbers
REQUIREMENT_NUMBERS=$(echo "$REQUIREMENT_LINES" | sed "s/^[0-9]*:### Requirement //" | sed "s/:.*$//" | sort -n)

TOTAL_REQUIREMENTS=$(echo "$REQUIREMENT_NUMBERS" | wc -l | xargs)

echo "✅ Found $TOTAL_REQUIREMENTS requirements in sprint $SPRINT_NUMBER"
echo ""
echo "Requirements discovered:"
echo "$REQUIREMENT_NUMBERS" | while read num; do
    if [ -n "$num" ]; then
        title=$(grep "^### Requirement $num:" "$SPRINT_FILE" | sed "s/^### Requirement $num: //")
        echo "  - Requirement $num: $title"
    fi
done

echo "$REQUIREMENT_NUMBERS" > /tmp/requirement_numbers.txt
echo "TOTAL_REQUIREMENTS=$TOTAL_REQUIREMENTS" >> /tmp/claudia_multi_issue_context
'

## Filter Requirements to Skip

!bash -c '
source /tmp/claudia_multi_issue_context

if [ -n "$SKIP_REQUIREMENTS" ]; then
    echo ""
    echo "⚠️  Skipping requirements: $SKIP_REQUIREMENTS"

    # Convert skip list to array
    IFS="," read -ra SKIP_ARRAY <<< "$SKIP_REQUIREMENTS"

    # Filter out skipped requirements
    FILTERED_REQUIREMENTS=""
    while read num; do
        if [ -n "$num" ]; then
            SKIP=false
            for skip_num in "${SKIP_ARRAY[@]}"; do
                if [ "$num" = "$skip_num" ]; then
                    SKIP=true
                    break
                fi
            done

            if [ "$SKIP" = false ]; then
                FILTERED_REQUIREMENTS="$FILTERED_REQUIREMENTS $num"
            fi
        fi
    done < /tmp/requirement_numbers.txt

    echo "$FILTERED_REQUIREMENTS" | tr " " "\n" | grep -v "^$" > /tmp/filtered_requirements.txt
else
    cp /tmp/requirement_numbers.txt /tmp/filtered_requirements.txt
fi

FILTERED_COUNT=$(cat /tmp/filtered_requirements.txt | wc -l | xargs)
echo "FILTERED_COUNT=$FILTERED_COUNT" >> /tmp/claudia_multi_issue_context

echo "📊 Will create issues for $FILTERED_COUNT requirements"
'

## Create Issues for Each Requirement

!bash -c '
source /tmp/claudia_multi_issue_context

echo ""
echo "🚀 Creating GitHub issues for all requirements..."
echo "=================================================="

# Check GitHub CLI
if ! command -v gh &> /dev/null; then
    echo "❌ ERROR: GitHub CLI (gh) is not installed"
    exit 1
fi

if ! gh auth status > /dev/null 2>&1; then
    echo "❌ ERROR: GitHub CLI not authenticated"
    exit 1
fi

# Initialize counters
CREATED_COUNT=0
FAILED_COUNT=0
CREATED_ISSUES=""

# Process each requirement
while IFS= read -r REQ_NUM; do
    if [ -z "$REQ_NUM" ]; then
        continue
    fi

    echo ""
    echo "───────────────────────────────────────────────────"
    echo "📝 Processing Requirement $REQ_NUM..."
    echo "───────────────────────────────────────────────────"

    # Extract requirement content
    REQUIREMENT_CONTENT=$(awk "/^### Requirement $REQ_NUM:/{flag=1; next} /^### |^## /{flag=0} flag" "$SPRINT_FILE")

    if [ -z "$REQUIREMENT_CONTENT" ]; then
        echo "⚠️  Skipping: Requirement $REQ_NUM not found"
        FAILED_COUNT=$((FAILED_COUNT + 1))
        continue
    fi

    # Extract requirement title
    REQ_TITLE_LINE=$(grep "^### Requirement $REQ_NUM:" "$SPRINT_FILE")
    REQ_TITLE=$(echo "$REQ_TITLE_LINE" | sed "s/^### Requirement $REQ_NUM: //")

    echo "Title: $REQ_TITLE"

    # Generate issue body
    cat > /tmp/issue_body_${REQ_NUM}.md << EOF
## 📋 Requirement from Sprint $SPRINT_NUMBER

This issue implements **Requirement $REQ_NUM** from Sprint $SPRINT_NUMBER.

### Sprint Context
- **Sprint Document:** \`.claude-shared/project-management/3-sprints/$SPRINT_NUMBER.md\`
- **Requirement Number:** $REQ_NUM
- **Requirement Title:** $REQ_TITLE

### 📖 Requirement Details

$REQUIREMENT_CONTENT

### ✅ Definition of Done

All acceptance criteria from the requirement above must be met, plus:
- [ ] Code follows project standards and conventions
- [ ] Tests are written and passing
- [ ] Code review completed
- [ ] Documentation updated
- [ ] Feature tested in appropriate environment

### 🔗 Traceability

- **Sprint:** $SPRINT_NUMBER
- **Sprint Document:** \`.claude-shared/project-management/3-sprints/$SPRINT_NUMBER.md\`
- **Requirement:** $REQ_NUM

### ⚠️ Implementation Instructions

**This issue does NOT auto-create PRs.** Manual implementation workflow:

1. Review the requirement details above
2. Make code changes manually or with Claude Code
3. Commit: \`/claudia:commit "$SPRINT_NUMBER-issue-NUMBER"\`
4. Create PR: \`/claudia:pr:create "$SPRINT_NUMBER-issue-NUMBER"\`

---
*Created from Claudia Sprint-Based System (Bulk Creation)*
*⚠️ Manual implementation required - No automatic PR creation*
EOF

    # Create GitHub issue
    if [ -n "$LABELS" ]; then
        ISSUE_URL=$(gh issue create --title "$REQ_TITLE" --body-file /tmp/issue_body_${REQ_NUM}.md --label "$LABELS" 2>&1)
    else
        ISSUE_URL=$(gh issue create --title "$REQ_TITLE" --body-file /tmp/issue_body_${REQ_NUM}.md 2>&1)
    fi

    if [ $? -eq 0 ]; then
        # Extract issue number from URL
        ISSUE_NUMBER=$(echo "$ISSUE_URL" | grep -oE "[0-9]+$")

        echo "✅ Issue #$ISSUE_NUMBER created: $REQ_TITLE"

        CREATED_COUNT=$((CREATED_COUNT + 1))
        CREATED_ISSUES="$CREATED_ISSUES${REQ_NUM}:${ISSUE_NUMBER},"

        # Store issue info for ticket creation
        echo "$REQ_NUM|$ISSUE_NUMBER|$REQ_TITLE" >> /tmp/created_issues.txt

        # Small delay to avoid rate limiting
        sleep 1
    else
        echo "❌ Failed to create issue for Requirement $REQ_NUM"
        echo "Error: $ISSUE_URL"
        FAILED_COUNT=$((FAILED_COUNT + 1))
    fi

done < /tmp/filtered_requirements.txt

echo ""
echo "=================================================="
echo "✅ Issue creation completed"
echo "Created: $CREATED_COUNT issues"
echo "Failed: $FAILED_COUNT issues"
echo "=================================================="

echo "CREATED_COUNT=$CREATED_COUNT" >> /tmp/claudia_multi_issue_context
echo "FAILED_COUNT=$FAILED_COUNT" >> /tmp/claudia_multi_issue_context
echo "CREATED_ISSUES=$CREATED_ISSUES" >> /tmp/claudia_multi_issue_context
'

## Store Issue Copies in 5-tickets/ Folder

!bash -c '
source /tmp/claudia_multi_issue_context
TIMESTAMP=$(date -u +"%Y-%m-%d %H:%M:%S UTC")

echo ""
echo "📝 Storing issue copies in tickets folder..."

mkdir -p .claude-shared/project-management/5-tickets

if [ ! -f /tmp/created_issues.txt ]; then
    echo "⚠️  No issues to store"
    exit 0
fi

STORED_COUNT=0

while IFS="|" read -r REQ_NUM ISSUE_NUMBER REQ_TITLE; do
    if [ -z "$ISSUE_NUMBER" ]; then
        continue
    fi

    # Create safe filename
    SAFE_TITLE=$(echo "$REQ_TITLE" | tr "[:upper:]" "[:lower:]" | sed "s/[^a-z0-9 ]//g" | tr " " "-" | cut -c1-50)
    TICKET_FILE=".claude-shared/project-management/5-tickets/${SPRINT_NUMBER}-issue-${ISSUE_NUMBER}-${SAFE_TITLE}.md"

    # Read issue body
    ISSUE_BODY=$(cat /tmp/issue_body_${REQ_NUM}.md 2>/dev/null || echo "Issue body not found")

    # Create ticket file
    cat > "$TICKET_FILE" << EOF
# Issue #${ISSUE_NUMBER} - ${REQ_TITLE}

**Ticket ID:** \`${SPRINT_NUMBER}-issue-${ISSUE_NUMBER}\`
**Sprint:** ${SPRINT_NUMBER}
**Sprint Document:** \`.claude-shared/project-management/3-sprints/${SPRINT_NUMBER}.md\`
**Requirement:** $REQ_NUM
**GitHub Issue:** #${ISSUE_NUMBER}
**Created:** $TIMESTAMP
**Status:** Open
**Created Via:** Bulk creation from sprint

## Issue Content (Copy from GitHub)

$ISSUE_BODY

## Implementation Tracking

### Commits
*Will be populated when commits are made using /claudia:commit*

### Pull Requests
*Will be populated when PRs are created using /claudia:pr:create*

### Status Updates
- **$TIMESTAMP**: Issue created from sprint requirement (bulk creation)
- ⚠️ **Manual implementation required** - No automatic PR

## Implementation Instructions

To implement this issue:

1. **Review:** Read the requirement details in sprint document
2. **Implement:** Make code changes manually or with Claude Code
3. **Commit:** \`/claudia:commit "${SPRINT_NUMBER}-issue-${ISSUE_NUMBER}"\`
4. **Create PR:** \`/claudia:pr:create "${SPRINT_NUMBER}-issue-${ISSUE_NUMBER}"\`

## Traceability

**Sprint:** ${SPRINT_NUMBER}
**Sprint Document:** \`.claude-shared/project-management/3-sprints/${SPRINT_NUMBER}.md\`
**Requirement Number:** $REQ_NUM
**Requirement Title:** $REQ_TITLE
**GitHub Issue:** #${ISSUE_NUMBER}
**Ticket File:** \`${TICKET_FILE}\`

---
*Managed by Claudia Automation System*
*⚠️ Automatic PR creation DISABLED - Manual implementation required*
EOF

    echo "  ✅ Stored: $TICKET_FILE"
    STORED_COUNT=$((STORED_COUNT + 1))

done < /tmp/created_issues.txt

echo ""
echo "✅ Stored $STORED_COUNT ticket files in 5-tickets/ folder"
'

## Update Sprint Document with Issue Links

!bash -c '
source /tmp/claudia_multi_issue_context

echo ""
echo "📊 Updating sprint document with issue links..."

if [ ! -f /tmp/created_issues.txt ]; then
    echo "⚠️  No issues to update in sprint"
    exit 0
fi

UPDATED_COUNT=0

while IFS="|" read -r REQ_NUM ISSUE_NUMBER REQ_TITLE; do
    if [ -z "$ISSUE_NUMBER" ]; then
        continue
    fi

    # Update the Related Issues line for this requirement
    sed -i "" "/### Requirement $REQ_NUM:/,/^### /{
        s/\*\*Related Issues:\*\* (Will be populated.*/\*\*Related Issues:\*\* #${ISSUE_NUMBER}/
        s/\*\*Related Issues:\*\* (Will be populated)/\*\*Related Issues:\*\* #${ISSUE_NUMBER}/
        s/\*\*Related Issues:\*\*$/\*\*Related Issues:\*\* #${ISSUE_NUMBER}/
    }" "$SPRINT_FILE" 2>/dev/null

    UPDATED_COUNT=$((UPDATED_COUNT + 1))

done < /tmp/created_issues.txt

# Update sprint metrics
CURRENT_ISSUES=$(grep "Open Issues:" "$SPRINT_FILE" | grep -o "[0-9]*" | head -1)
NEW_ISSUES=$((CURRENT_ISSUES + CREATED_COUNT))
sed -i "" "s/- \*\*Open Issues:\*\* [0-9]*/- \*\*Open Issues:\*\* $NEW_ISSUES/" "$SPRINT_FILE"

echo "✅ Sprint document updated with $UPDATED_COUNT issue links"
echo "✅ Sprint metrics updated: Open Issues = $NEW_ISSUES"
'

## Log Bulk Issue Creation

!bash -c '
source /tmp/claudia_multi_issue_context
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo ""
echo "📊 Logging bulk issue creation to audit trail..."

mkdir -p .claude-shared/project-management/data

# Log to github-sync.jsonl
LOG_ENTRY="{\"timestamp\":\"$TIMESTAMP\",\"action\":\"bulk_issues_created\",\"sprint_number\":\"$SPRINT_NUMBER\",\"total_created\":$CREATED_COUNT,\"total_failed\":$FAILED_COUNT,\"created_issues\":\"$CREATED_ISSUES\",\"labels\":\"$LABELS\"}"

echo "$LOG_ENTRY" >> .claude-shared/project-management/data/github-sync.jsonl

echo "✅ Bulk issue creation logged to audit trail"
'

## Display Summary

!bash -c '
source /tmp/claudia_multi_issue_context

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║           MULTIPLE ISSUES CREATION COMPLETE                    ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "📊 Summary:"
echo "  Sprint: $SPRINT_NUMBER"
echo "  Total Requirements: $TOTAL_REQUIREMENTS"
echo "  Issues Created: $CREATED_COUNT"
echo "  Issues Failed: $FAILED_COUNT"
echo ""
echo "📁 Files Created/Updated:"
echo "  - Ticket Files: .claude-shared/project-management/5-tickets/${SPRINT_NUMBER}-issue-*"
echo "  - Sprint Document: $SPRINT_FILE (updated with issue links)"
echo ""

if [ -f /tmp/created_issues.txt ]; then
    echo "📋 Created Issues:"
    while IFS="|" read -r REQ_NUM ISSUE_NUMBER REQ_TITLE; do
        if [ -n "$ISSUE_NUMBER" ]; then
            echo "  ✅ Issue #${ISSUE_NUMBER} - Requirement $REQ_NUM: $REQ_TITLE"
        fi
    done < /tmp/created_issues.txt
fi

echo ""
echo "🔗 View All Issues:"
echo "  $(gh repo view --json url --jq .url)/issues"
echo ""
echo "⚠️ NEXT STEPS (Manual Implementation for Each Issue):"
echo "  1. Review requirements in sprint document"
echo "  2. Implement changes for each issue"
echo "  3. Commit: /claudia:commit \"${SPRINT_NUMBER}-issue-NUMBER\""
echo "  4. Create PR: /claudia:pr:create \"${SPRINT_NUMBER}-issue-NUMBER\""
echo ""
echo "💡 View issues:"
echo "  /claudia:issues:pull --state open"
'

## Cleanup

!bash -c '
# Clean up temporary files
rm -f /tmp/claudia_multi_issue_context
rm -f /tmp/requirement_numbers.txt
rm -f /tmp/filtered_requirements.txt
rm -f /tmp/created_issues.txt
rm -f /tmp/issue_body_*.md

echo ""
echo "🎯 Bulk issue creation workflow completed successfully"
echo "📝 All tickets stored in 5-tickets/ folder for offline tracking"
echo "⚠️ Manual implementation required for each issue - No automatic PR creation"
'
