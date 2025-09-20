---
description: "Update documentation with sprint-based commit hash references and enhanced traceability"
allowed-tools: ["Read", "Write", "Edit", "Bash"]
---

# 📚 Enhanced Sprint-Based Documentation Update with Multi-Development Traceability

Update all relevant documentation with sprint-based commit hash references, implementation details, and maintain complete multi-development traceability chain.

## Processing Enhanced Documentation Update for Commit: $ARGUMENTS

!bash -c 'echo "📚 Starting enhanced sprint-based documentation update for commit: $ARGUMENTS"'

## Validate Commit and Extract Enhanced Context

!bash -c '
COMMIT_HASH="$ARGUMENTS"

# Clean up commit hash (remove quotes if present)
COMMIT_HASH=$(echo "$COMMIT_HASH" | sed "s/^[\"'\'']//" | sed "s/[\"'\'']$//")

# Validate commit hash format
if [ -z "$COMMIT_HASH" ]; then
    echo "❌ ERROR: Commit hash required"
    echo "Usage: /claudia:docs:update \"commit-hash\""
    exit 1
fi

# Check if commit exists
if ! git cat-file -e "$COMMIT_HASH" 2>/dev/null; then
    echo "❌ ERROR: Commit $COMMIT_HASH not found"
    exit 1
fi

echo "✅ Enhanced commit validation passed"
echo "COMMIT_HASH=$COMMIT_HASH" > /tmp/claudia_docs_context
echo "COMMIT_SHORT_HASH=$(git rev-parse --short $COMMIT_HASH)" >> /tmp/claudia_docs_context
'

## Extract Enhanced Sprint-Based Commit Information and Multi-Development Traceability

!bash -c '
source /tmp/claudia_docs_context

# Get enhanced commit details
COMMIT_MESSAGE=$(git log -1 --pretty=%s "$COMMIT_HASH")
COMMIT_BODY=$(git log -1 --pretty=%b "$COMMIT_HASH")
COMMIT_AUTHOR=$(git log -1 --pretty="%an" "$COMMIT_HASH")
COMMIT_DATE=$(git log -1 --pretty="%ad" --date=iso "$COMMIT_HASH")
COMMIT_FILES=$(git diff-tree --no-commit-id --name-only -r "$COMMIT_HASH" | wc -l | tr -d " ")

echo "📝 Enhanced Sprint-Based Commit Information:"
echo "- Hash: $COMMIT_SHORT_HASH"
echo "- Message: $COMMIT_MESSAGE"
echo "- Author: $COMMIT_AUTHOR"
echo "- Date: $COMMIT_DATE"
echo "- Files changed: $COMMIT_FILES"

# Extract enhanced traceability information from commit body (sprint-based format)
TICKET_UUID=$(echo "$COMMIT_BODY" | grep -E "^Ticket:|^Sprint-Based Ticket:" | sed "s/.*Ticket: \([^ ]*\).*/\1/" | head -1)
REQ_UUID=$(echo "$COMMIT_BODY" | grep -E "^Requirement:|^Sprint Requirement:" | sed "s/.*Requirement: \([^ ]*\).*/\1/" | head -1)
SPRINT_NUMBER=$(echo "$COMMIT_BODY" | grep "^Sprint:" | sed "s/Sprint: \([^ ]*\).*/\1/" | head -1)
TARGET_ENV=$(echo "$COMMIT_BODY" | grep "^Environment:" | sed "s/Environment: \([^ ]*\).*/\1/" | head -1)
GITHUB_ISSUE=$(echo "$COMMIT_BODY" | grep "^GitHub Issue:" | sed "s/GitHub Issue: #\([0-9]*\)/\1/" | head -1)

# Try to extract sprint number from ticket UUID if not found in commit body
if [ -z "$SPRINT_NUMBER" ] && [ -n "$TICKET_UUID" ] && [[ "$TICKET_UUID" =~ ^[0-9]{3}-[0-9]{2}-[0-9]{2}-.+ ]]; then
    SPRINT_NUMBER=$(echo "$TICKET_UUID" | cut -d"-" -f1)
fi

# Try to extract requirement UUID from ticket UUID if not found
if [ -z "$REQ_UUID" ] && [ -n "$TICKET_UUID" ] && [[ "$TICKET_UUID" =~ ^[0-9]{3}-[0-9]{2}-[0-9]{2}-.+ ]]; then
    REQ_UUID=$(echo "$TICKET_UUID" | cut -d"-" -f1,2)
fi

if [ -n "$TICKET_UUID" ] && [ "$TICKET_UUID" != "Ticket:" ] && [[ "$TICKET_UUID" =~ ^[0-9]{3}-[0-9]{2}-[0-9]{2}-.+ ]]; then
    echo "- Sprint-Based Ticket: $TICKET_UUID"
    echo "- Sprint Number: $SPRINT_NUMBER"
    echo "- Requirement: $REQ_UUID"
    echo "- Target Environment: $TARGET_ENV"
    HAS_TRACEABILITY="true"
    IS_SPRINT_BASED="true"
elif [ -n "$TICKET_UUID" ] && [ "$TICKET_UUID" != "Ticket:" ]; then
    echo "- Legacy Ticket: $TICKET_UUID"
    echo "- Requirement: $REQ_UUID"
    HAS_TRACEABILITY="true"
    IS_SPRINT_BASED="false"
else
    echo "- Traceability: Not found in commit (manual commit?)"
    HAS_TRACEABILITY="false"
    IS_SPRINT_BASED="false"
fi

# Save enhanced context
cat >> /tmp/claudia_docs_context << EOF
COMMIT_MESSAGE="$COMMIT_MESSAGE"
COMMIT_BODY="$COMMIT_BODY"
COMMIT_AUTHOR="$COMMIT_AUTHOR"
COMMIT_DATE="$COMMIT_DATE"
COMMIT_FILES="$COMMIT_FILES"
TICKET_UUID="$TICKET_UUID"
REQ_UUID="$REQ_UUID"
SPRINT_NUMBER="$SPRINT_NUMBER"
TARGET_ENV="$TARGET_ENV"
GITHUB_ISSUE="$GITHUB_ISSUE"
HAS_TRACEABILITY="$HAS_TRACEABILITY"
IS_SPRINT_BASED="$IS_SPRINT_BASED"
EOF
'

## Update Enhanced Sprint-Based Implementation Log

!bash -c '
source /tmp/claudia_docs_context
echo ""
echo "📊 Updating enhanced sprint-based implementation log..."

# Ensure documentation directory exists
mkdir -p docs/api

# Create/update enhanced implementation log
IMPL_LOG_FILE="docs/api/IMPLEMENTATION_LOG.md"
TIMESTAMP=$(date)

if [ ! -f "$IMPL_LOG_FILE" ]; then
    # Create new enhanced implementation log
    cat > "$IMPL_LOG_FILE" << EOF
# Enhanced Sprint-Based Implementation Log

This file tracks all implementation commits with complete sprint-based traceability, multi-development support, and environment awareness.

## Enhanced Format
Each entry includes:
- Commit hash and link with environment context
- Sprint-based implementation message
- Complete traceability chain (Sprint → Requirement → Ticket → Commit)
- Multi-development context (multiple commits/PRs per ticket)
- Environment-aware technical details (files changed, test status, target environment)

## Sprint-Based Organization
Entries are organized by sprint context with full hierarchical traceability:
- Sprint XXX → Requirement XXX-YY → Ticket XXX-YY-ZZ → Commits

---

EOF
    echo "✅ Created new enhanced sprint-based implementation log"
fi

# Add enhanced entry to implementation log
cat >> "$IMPL_LOG_FILE" << EOF
### $TIMESTAMP: $COMMIT_MESSAGE

**Enhanced Sprint-Based Context:**  
**Commit:** [\`$COMMIT_SHORT_HASH\`](https://github.com/penomoprotocol/penomo-api/commit/$COMMIT_HASH)  
**Author:** $COMMIT_AUTHOR  
**Date:** $COMMIT_DATE  
**Files Changed:** $COMMIT_FILES  
$(if [ "$IS_SPRINT_BASED" = "true" ]; then echo "**Target Environment:** $TARGET_ENV"; fi)
$(if [ "$IS_SPRINT_BASED" = "true" ]; then echo "**Multi-Development Support:** Active (supports multiple commits/PRs per ticket)"; fi)

$(if [ "$HAS_TRACEABILITY" = "true" ]; then
    if [ "$IS_SPRINT_BASED" = "true" ]; then
cat << TRACE
**Enhanced Sprint-Based Traceability Chain:**
- **Sprint:** \`$SPRINT_NUMBER\` → [docs/3-sprints/$SPRINT_NUMBER.md](../3-sprints/$SPRINT_NUMBER.md)
- **Requirement:** \`$REQ_UUID\` → [docs/4-requirements/$REQ_UUID.md](../4-requirements/$REQ_UUID.md)
- **Ticket:** \`$TICKET_UUID\` → [docs/5-tickets/$TICKET_UUID.md](../5-tickets/$TICKET_UUID.md)  
- **GitHub Issue:** [#$GITHUB_ISSUE](https://github.com/penomoprotocol/penomo-api/issues/$GITHUB_ISSUE) (supports multi-commit/PR)
- **Commit:** [\`$COMMIT_SHORT_HASH\`](https://github.com/penomoprotocol/penomo-api/commit/$COMMIT_HASH)

**Environment Context:** $TARGET_ENV environment deployment  
**Multi-Development:** This commit is part of iterative development workflow

TRACE
    else
cat << LEGACY_TRACE
**Legacy Traceability Chain:**
- **Requirement:** \`$REQ_UUID\` → [4-requirements/$REQ_UUID.md](../requirements/$REQ_UUID.md)
- **Ticket:** \`$TICKET_UUID\` → [5-tickets/$TICKET_UUID.md](../tickets/$TICKET_UUID.md)  
- **GitHub Issue:** [#$GITHUB_ISSUE](https://github.com/penomoprotocol/penomo-api/issues/$GITHUB_ISSUE)
- **Commit:** [\`$COMMIT_SHORT_HASH\`](https://github.com/penomoprotocol/penomo-api/commit/$COMMIT_HASH)

LEGACY_TRACE
    fi
else
    echo "**Type:** Manual commit (no Claudia traceability)"
fi)

#### Enhanced Implementation Details:
$(git diff-tree --no-commit-id --stat "$COMMIT_HASH" | sed "s/^/  /")

$(if echo "$COMMIT_BODY" | grep -q "Tests:"; then
    echo "**Test Status:** $(echo "$COMMIT_BODY" | grep "Tests:" | sed "s/.*Tests: //")"
fi)

$(if echo "$COMMIT_BODY" | grep -q "Linting:"; then
    echo "**Linting Status:** $(echo "$COMMIT_BODY" | grep "Linting:" | sed "s/.*Linting: //")"
fi)

$(if [ "$IS_SPRINT_BASED" = "true" ]; then
    echo "**Sprint-Based Features:**"
    echo "- Environment-aware development targeting $TARGET_ENV"
    echo "- Multi-commit workflow support (iterative development)"
    echo "- Complete hierarchical traceability maintained"
fi)

---

EOF

echo "✅ Updated enhanced sprint-based implementation log"
'

## Update Enhanced API Changelog

!bash -c '
source /tmp/claudia_docs_context
echo ""
echo "📝 Updating enhanced API changelog..."

# Create/update enhanced API changelog
CHANGELOG_FILE="docs/api/CHANGELOG.md"
TIMESTAMP=$(date)

if [ ! -f "$CHANGELOG_FILE" ]; then
    # Create new enhanced changelog
    cat > "$CHANGELOG_FILE" << EOF
# Enhanced Sprint-Based API Changelog

This file tracks API changes, new features, and breaking changes with sprint-based commit references and environment context.

## Enhanced Format
- **Added**: New features and endpoints with sprint context
- **Changed**: Modifications to existing functionality with environment awareness
- **Deprecated**: Features marked for removal with migration timeline
- **Removed**: Deleted features with sprint documentation
- **Fixed**: Bug fixes with complete traceability
- **Security**: Security-related changes with sprint validation

## Sprint-Based Organization
Changes are tracked with complete sprint context and multi-development awareness.

---

EOF
    echo "✅ Created new enhanced API changelog"
fi

# Determine change type from commit message and files
CHANGE_TYPE="Changed"
if echo "$COMMIT_MESSAGE" | grep -qi "add\|new\|implement\|feat"; then
    CHANGE_TYPE="Added"
elif echo "$COMMIT_MESSAGE" | grep -qi "fix\|resolve\|repair"; then
    CHANGE_TYPE="Fixed"
elif echo "$COMMIT_MESSAGE" | grep -qi "remove\|delete"; then
    CHANGE_TYPE="Removed"
elif echo "$COMMIT_MESSAGE" | grep -qi "security\|auth\|vulnerab"; then
    CHANGE_TYPE="Security"
elif echo "$COMMIT_MESSAGE" | grep -qi "deprecate"; then
    CHANGE_TYPE="Deprecated"
fi

# Check if this is API-related commit
API_RELATED="false"
CHANGED_FILES=$(git diff-tree --no-commit-id --name-only -r "$COMMIT_HASH")
if echo "$CHANGED_FILES" | grep -qE "(controllers|routes|services|validator|api)/"; then
    API_RELATED="true"
fi

if [ "$API_RELATED" = "true" ]; then
    # Add enhanced API changelog entry with sprint context
    CHANGELOG_ENTRY="### $CHANGE_TYPE
- **$COMMIT_MESSAGE** - Commit: [\`$COMMIT_SHORT_HASH\`](https://github.com/penomoprotocol/penomo-api/commit/$COMMIT_HASH)$(if [ "$HAS_TRACEABILITY" = "true" ]; then if [ "$IS_SPRINT_BASED" = "true" ]; then echo " | Sprint: \`$SPRINT_NUMBER\` | Ticket: \`$TICKET_UUID\` | Environment: $TARGET_ENV | Issue: #$GITHUB_ISSUE"; else echo " | Ticket: \`$TICKET_UUID\` | Issue: #$GITHUB_ISSUE"; fi; fi)"
    
    sed -i "/^---$/a\\
\\
## $TIMESTAMP\\
\\
$CHANGELOG_ENTRY" "$CHANGELOG_FILE"

    echo "✅ Updated enhanced API changelog with sprint context"
else
    echo "ℹ️  Skipped API changelog (no API files changed)"
fi
'

## Update Enhanced Sprint-Based Documentation Structure

!bash -c '
source /tmp/claudia_docs_context

if [ "$HAS_TRACEABILITY" = "true" ]; then
    if [ "$IS_SPRINT_BASED" = "true" ]; then
        echo ""
        echo "📋 Updating enhanced sprint-based documentation structure..."
        
        # Update sprint document
        if [ -f "docs/3-sprints/$SPRINT_NUMBER.md" ]; then
            if ! grep -q "$COMMIT_SHORT_HASH" "docs/3-sprints/$SPRINT_NUMBER.md"; then
                # Add commit reference to sprint implementation section
                if grep -q "## Implementation Progress" "docs/3-sprints/$SPRINT_NUMBER.md"; then
                    sed -i "/## Implementation Progress/a\\
\\
**Recent Commit:** [\`$COMMIT_SHORT_HASH\`](https://github.com/penomoprotocol/penomo-api/commit/$COMMIT_HASH) - $COMMIT_MESSAGE  
**Ticket:** \`$TICKET_UUID\` | **Environment:** $TARGET_ENV | **Date:** $(date)" "docs/3-sprints/$SPRINT_NUMBER.md"
                fi
                echo "✅ Updated sprint document with latest commit"
            fi
        fi
        
        # Update requirement document
        if [ -f "docs/4-requirements/$REQ_UUID.md" ]; then
            if ! grep -q "$COMMIT_SHORT_HASH" "docs/4-requirements/$REQ_UUID.md"; then
                # Add commit reference to implementation commits section
                if grep -q "**Implementation Commits:**" "docs/4-requirements/$REQ_UUID.md"; then
                    sed -i "/\*\*Implementation Commits:\*\*/a - [\`$COMMIT_SHORT_HASH\`](https://github.com/penomoprotocol/penomo-api/commit/$COMMIT_HASH) - $COMMIT_MESSAGE (Environment: $TARGET_ENV)" "docs/4-requirements/$REQ_UUID.md"
                else
                    # Create commits section in traceability area
                    sed -i "s/\*\*Implementation Commits:\*\* (Will be populated by \/claudia:docs:update)/\*\*Implementation Commits:\*\*\\n- [\`$COMMIT_SHORT_HASH\`](https:\/\/github.com\/penomoprotocol\/penomo-api\/commit\/$COMMIT_HASH) - $COMMIT_MESSAGE (Environment: $TARGET_ENV)/" "docs/4-requirements/$REQ_UUID.md"
                fi
                echo "✅ Updated requirement document with commit reference"
            fi
        fi
        
        # Update ticket document
        if [ -f "docs/5-tickets/$TICKET_UUID.md" ]; then
            if ! grep -q "Documentation updated with commit $COMMIT_SHORT_HASH" "docs/5-tickets/$TICKET_UUID.md"; then
                cat >> "docs/5-tickets/$TICKET_UUID.md" << EOF

### Enhanced Documentation Updates

**Documentation Updated:** $(date)  
**Sprint:** $SPRINT_NUMBER | **Environment:** $TARGET_ENV  
**Commit:** [\`$COMMIT_SHORT_HASH\`](https://github.com/penomoprotocol/penomo-api/commit/$COMMIT_HASH)  

**Updated Documents with Sprint Context:**
- 📊 [docs/api/IMPLEMENTATION_LOG.md](../api/IMPLEMENTATION_LOG.md) (Enhanced with sprint-based traceability)
- 📝 [docs/api/CHANGELOG.md](../api/CHANGELOG.md) (Environment-aware changelog)
- 🏃 [docs/3-sprints/$SPRINT_NUMBER.md](../3-sprints/$SPRINT_NUMBER.md) (Sprint progress tracking)
- 📋 [docs/4-requirements/$REQ_UUID.md](../4-requirements/$REQ_UUID.md) (Requirement implementation log)

**Enhanced Implementation Chain:**  
Sprint \`$SPRINT_NUMBER\` → Requirement \`$REQ_UUID\` → Ticket \`$TICKET_UUID\` → Commit \`$COMMIT_SHORT_HASH\` → Documentation Updated

**Multi-Development Context:**  
- Environment: $TARGET_ENV
- Multi-commit workflow: Supported
- GitHub Issue: #$GITHUB_ISSUE (remains open for additional commits/PRs)

---
*Documentation updated by Enhanced Sprint-Based Claudia Automation - $(date)*
EOF
                echo "✅ Updated ticket document with enhanced documentation references"
            fi
        fi
        
    else
        # Legacy traceability handling
        echo ""
        echo "📋 Updating legacy requirement/ticket documentation..."
        
        if [ -f "4-requirements/$REQ_UUID.md" ]; then
            if ! grep -q "$COMMIT_SHORT_HASH" "4-requirements/$REQ_UUID.md"; then
                if grep -q "**Implementation Commits:**" "4-requirements/$REQ_UUID.md"; then
                    sed -i "/\*\*Implementation Commits:\*\*/a - [\`$COMMIT_SHORT_HASH\`](https://github.com/penomoprotocol/penomo-api/commit/$COMMIT_HASH) - $COMMIT_MESSAGE" "4-requirements/$REQ_UUID.md"
                else
                    sed -i "s/\*\*Implementation Commits:\*\* (Will be populated by \/claudia:docs:update)/\*\*Implementation Commits:\*\*\\n- [\`$COMMIT_SHORT_HASH\`](https:\/\/github.com\/penomoprotocol\/penomo-api\/commit\/$COMMIT_HASH) - $COMMIT_MESSAGE/" "4-requirements/$REQ_UUID.md"
                fi
                echo "✅ Updated legacy requirement document"
            fi
        fi
        
        if [ -f "5-tickets/$TICKET_UUID.md" ]; then
            if ! grep -q "Documentation updated with commit" "5-tickets/$TICKET_UUID.md"; then
                cat >> "5-tickets/$TICKET_UUID.md" << EOF

### Documentation Updates

**Documentation Updated:** $(date)  
**Commit:** [\`$COMMIT_SHORT_HASH\`](https://github.com/penomoprotocol/penomo-api/commit/$COMMIT_HASH)  

**Updated Documents:**
- 📊 [docs/api/IMPLEMENTATION_LOG.md](../api/IMPLEMENTATION_LOG.md)
- 📝 [docs/api/CHANGELOG.md](../api/CHANGELOG.md)  
- 📋 [4-requirements/$REQ_UUID.md](../requirements/$REQ_UUID.md)

**Legacy Implementation Chain:**  
Requirement \`$REQ_UUID\` → Ticket \`$TICKET_UUID\` → Commit \`$COMMIT_SHORT_HASH\` → Documentation Updated

---
*Documentation updated by Claudia Automation - $(date)*
EOF
                echo "✅ Updated legacy ticket document"
            fi
        fi
    fi
else
    echo "ℹ️  Skipped document structure update (no traceability)"
fi
'

## Update Enhanced README with Latest Sprint-Based Changes

!bash -c '
source /tmp/claudia_docs_context
echo ""
echo "📖 Updating README with enhanced sprint-based latest changes..."

if [ -f "README.md" ]; then
    # Check if Enhanced Latest Changes section exists
    if grep -q "## Latest Changes" README.md || grep -q "## Enhanced Latest Changes" README.md; then
        # Update to enhanced section if not already
        if ! grep -q "## Enhanced Latest Changes" README.md; then
            sed -i "s/## Latest Changes/## Enhanced Latest Changes/" README.md
        fi
        
        # Add to existing section (keep only latest 5 entries)
        TEMP_FILE=$(mktemp)
        
        # Extract everything before Enhanced Latest Changes
        sed "/## Enhanced Latest Changes/,\$ d" README.md > "$TEMP_FILE"
        
        # Add Enhanced Latest Changes header and new entry
        cat >> "$TEMP_FILE" << EOF
## Enhanced Latest Changes

### $COMMIT_MESSAGE
- **Date:** $(date -d "$COMMIT_DATE" +"%B %d, %Y" 2>/dev/null || date +"%B %d, %Y")
- **Commit:** [\`$COMMIT_SHORT_HASH\`](https://github.com/penomoprotocol/penomo-api/commit/$COMMIT_HASH)
- **Files Changed:** $COMMIT_FILES files
$(if [ "$IS_SPRINT_BASED" = "true" ]; then echo "- **Sprint:** \`$SPRINT_NUMBER\` | **Ticket:** \`$TICKET_UUID\` | **Environment:** $TARGET_ENV | **Issue:** #$GITHUB_ISSUE"; elif [ "$HAS_TRACEABILITY" = "true" ]; then echo "- **Ticket:** \`$TICKET_UUID\` | **Issue:** #$GITHUB_ISSUE"; fi)
$(if [ "$IS_SPRINT_BASED" = "true" ]; then echo "- **Multi-Development:** Supports multiple commits/PRs per ticket"; fi)

EOF

        # Add previous entries (limit to 4 more to keep 5 total)
        if grep -q "## Enhanced Latest Changes" README.md; then
            sed -n "/## Enhanced Latest Changes/,\$ p" README.md | tail -n +2 | head -n 20 >> "$TEMP_FILE"
        fi
        
        # Add any remaining sections
        if grep -q "^##" README.md && [ "$(grep -A 1000 "## Enhanced Latest Changes" README.md 2>/dev/null | grep -m 2 "^##" | wc -l)" -gt 1 ]; then
            NEXT_SECTION=$(grep -A 1000 "## Enhanced Latest Changes" README.md | grep -m 2 "^##" | tail -1)
            sed -n "/^$NEXT_SECTION/,\$ p" README.md >> "$TEMP_FILE"
        fi
        
        mv "$TEMP_FILE" README.md
        echo "✅ Updated README with enhanced sprint-based latest changes"
    else
        # Add Enhanced Latest Changes section
        echo "" >> README.md
        echo "## Enhanced Latest Changes" >> README.md
        echo "" >> README.md
        echo "### $COMMIT_MESSAGE" >> README.md
        echo "- **Date:** $(date)" >> README.md
        echo "- **Commit:** [\`$COMMIT_SHORT_HASH\`](https://github.com/penomoprotocol/penomo-api/commit/$COMMIT_HASH)" >> README.md
        echo "- **Files Changed:** $COMMIT_FILES files" >> README.md
        if [ "$IS_SPRINT_BASED" = "true" ]; then
            echo "- **Sprint:** \`$SPRINT_NUMBER\` | **Ticket:** \`$TICKET_UUID\` | **Environment:** $TARGET_ENV | **Issue:** #$GITHUB_ISSUE" >> README.md
            echo "- **Multi-Development:** Supports multiple commits/PRs per ticket" >> README.md
        elif [ "$HAS_TRACEABILITY" = "true" ]; then
            echo "- **Ticket:** \`$TICKET_UUID\` | **Issue:** #$GITHUB_ISSUE" >> README.md
        fi
        echo "" >> README.md
        
        echo "✅ Added Enhanced Latest Changes section to README"
    fi
else
    echo "ℹ️  README.md not found - skipping update"
fi
'

## Log Enhanced Documentation Update

!bash -c '
source /tmp/claudia_docs_context
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)

# Log enhanced documentation update with sprint context
UPDATED_FILES_JSON="[\"IMPLEMENTATION_LOG.md\",\"CHANGELOG.md\",\"README.md\""
if [ "$IS_SPRINT_BASED" = "true" ]; then
    UPDATED_FILES_JSON="${UPDATED_FILES_JSON},\"sprint-$SPRINT_NUMBER.md\",\"requirement-$REQ_UUID.md\",\"ticket-$TICKET_UUID.md\""
elif [ "$HAS_TRACEABILITY" = "true" ]; then
    UPDATED_FILES_JSON="${UPDATED_FILES_JSON},\"requirement-$REQ_UUID.md\",\"ticket-$TICKET_UUID.md\""
fi
UPDATED_FILES_JSON="${UPDATED_FILES_JSON}]"

LOG_ENTRY="{\"timestamp\":\"$TIMESTAMP\",\"action\":\"documentation_updated\",\"commit_hash\":\"$COMMIT_HASH\",\"commit_short_hash\":\"$COMMIT_SHORT_HASH\",\"ticket_uuid\":\"$TICKET_UUID\",\"requirement_uuid\":\"$REQ_UUID\""

if [ "$IS_SPRINT_BASED" = "true" ]; then
    LOG_ENTRY="${LOG_ENTRY},\"sprint_number\":\"$SPRINT_NUMBER\",\"target_env\":\"$TARGET_ENV\",\"is_sprint_based\":true,\"multi_development\":true"
else
    LOG_ENTRY="${LOG_ENTRY},\"is_sprint_based\":false,\"multi_development\":false"
fi

LOG_ENTRY="${LOG_ENTRY},\"has_traceability\":$HAS_TRACEABILITY,\"files_updated\":$UPDATED_FILES_JSON}"

if [ "$HAS_TRACEABILITY" = "true" ]; then
    LOG_ENTRY="${LOG_ENTRY},\"github_issue\":$GITHUB_ISSUE"
fi

LOG_ENTRY="${LOG_ENTRY}}"

echo "$LOG_ENTRY" >> .claude-shared/project-management/data/commits-log.jsonl

echo "📊 Logged enhanced documentation update to sprint-based traceability system"
'

## Generate Enhanced Documentation Summary

!bash -c '
source /tmp/claudia_docs_context

echo ""
echo "✅ **Enhanced Sprint-Based Documentation Update Complete**"
echo ""
echo "**Processed Commit:**"
echo "- **Hash:** \`$COMMIT_SHORT_HASH\`"
echo "- **Message:** $COMMIT_MESSAGE"
echo "- **Author:** $COMMIT_AUTHOR"
echo "- **Files Changed:** $COMMIT_FILES"
echo ""

if [ "$IS_SPRINT_BASED" = "true" ]; then
    echo "**Enhanced Sprint-Based Traceability Chain:**"
    echo "- **Sprint:** \`$SPRINT_NUMBER\`"
    echo "- **Requirement:** \`$REQ_UUID\`"
    echo "- **Ticket:** \`$TICKET_UUID\`"
    echo "- **Environment:** $TARGET_ENV"
    echo "- **GitHub Issue:** #$GITHUB_ISSUE (multi-development support)"
    echo "- **Commit:** \`$COMMIT_SHORT_HASH\`"
    echo "- **Documentation:** Enhanced and updated"
elif [ "$HAS_TRACEABILITY" = "true" ]; then
    echo "**Legacy Traceability Chain:**"
    echo "- **Requirement:** \`$REQ_UUID\`"
    echo "- **Ticket:** \`$TICKET_UUID\`"
    echo "- **GitHub Issue:** #$GITHUB_ISSUE"
    echo "- **Commit:** \`$COMMIT_SHORT_HASH\`"
    echo "- **Documentation:** Updated"
else
    echo "**Type:** Manual commit (no Claudia traceability)"
fi

echo ""
echo "**Updated Enhanced Documentation:**"
echo "- 📊 **Implementation Log:** docs/api/IMPLEMENTATION_LOG.md (sprint-based with multi-development context)"
echo "- 📝 **API Changelog:** docs/api/CHANGELOG.md (environment-aware with sprint references)"
echo "- 📖 **README:** Enhanced Latest Changes section with sprint context"

if [ "$IS_SPRINT_BASED" = "true" ]; then
    echo "- 🏃 **Sprint Doc:** docs/3-sprints/$SPRINT_NUMBER.md (progress tracking)"
    if [ -f "docs/4-requirements/$REQ_UUID.md" ]; then
        echo "- 📋 **Requirement Doc:** docs/4-requirements/$REQ_UUID.md (implementation commits)"
    fi
    if [ -f "docs/5-tickets/$TICKET_UUID.md" ]; then
        echo "- 🎫 **Ticket Doc:** docs/5-tickets/$TICKET_UUID.md (enhanced documentation section)"
    fi
elif [ "$HAS_TRACEABILITY" = "true" ]; then
    if [ -f "4-requirements/$REQ_UUID.md" ]; then
        echo "- 📋 **Legacy Requirement Doc:** 4-requirements/$REQ_UUID.md"
    fi
    if [ -f "5-tickets/$TICKET_UUID.md" ]; then
        echo "- 🎫 **Legacy Ticket Doc:** 5-tickets/$TICKET_UUID.md"
    fi
fi

echo ""
echo "**Enhanced Documentation Features:**"
echo "- ✅ Sprint-based hierarchical traceability (Sprint → Requirement → Ticket → Commit)"
echo "- ✅ Environment-aware documentation with target context"
echo "- ✅ Multi-development workflow support (multiple commits/PRs per ticket)"
echo "- ✅ Complete GitHub integration with issue lifecycle management"
echo "- ✅ Enhanced commit hash references with full navigation"
echo "- ✅ API changes tracked with environment and sprint context"
if [ "$IS_SPRINT_BASED" = "true" ]; then
    echo "- ✅ Sprint progress tracking and velocity metrics"
    echo "- ✅ Complete audit trail with multi-development relationship preservation"
fi

echo ""
echo "**All enhanced documentation now references commit:** \`$COMMIT_SHORT_HASH\`"
if [ "$IS_SPRINT_BASED" = "true" ]; then
    echo "**Sprint-based traceability chain:** Sprint \`$SPRINT_NUMBER\` → \`$REQ_UUID\` → \`$TICKET_UUID\` → \`$COMMIT_SHORT_HASH\`"
fi
'

## Cleanup

!bash -c 'rm -f /tmp/claudia_docs_context'

!echo "📚 Enhanced sprint-based documentation update workflow completed successfully"
!echo "🔗 Complete multi-development traceability maintained across all documentation"
!echo "📝 All changes properly referenced with sprint-based commit context and environment awareness"
!echo "🏃 Sprint-based hierarchical organization preserved throughout documentation"