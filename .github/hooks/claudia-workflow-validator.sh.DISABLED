#!/bin/bash
# Claudia Workflow Validation Hook
# Validates that commits follow mandatory Claudia workflow

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 Validating Claudia Workflow Compliance...${NC}"

# Configuration
BYPASS_FILE=".github/emergency-bypass.active"
CLAUDIA_AUDIT_DIR=".claude-shared/project-management/data"

# Check for emergency bypass
if [ -f "$BYPASS_FILE" ]; then
    echo -e "${YELLOW}🚨 Emergency bypass detected${NC}"

    # Validate bypass authorization
    if grep -q "AUTHORIZED=true" "$BYPASS_FILE" 2>/dev/null; then
        echo -e "${YELLOW}✅ Emergency bypass authorized - skipping Claudia validation${NC}"
        echo -e "${YELLOW}📝 Bypass logged to audit system${NC}"

        # Log bypass usage
        mkdir -p "$CLAUDIA_AUDIT_DIR"
        echo "{\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"action\":\"emergency_bypass_used\",\"user\":\"$(git config user.email)\",\"commit\":\"$(git rev-parse HEAD 2>/dev/null || echo 'pre-commit')\",\"reason\":\"$(grep 'REASON=' "$BYPASS_FILE" | cut -d'=' -f2-)\"}" >> "$CLAUDIA_AUDIT_DIR/emergency-bypasses.jsonl"

        exit 0
    else
        echo -e "${RED}❌ Emergency bypass file found but not properly authorized${NC}"
        echo -e "${RED}   Remove $BYPASS_FILE or get proper authorization${NC}"
        exit 1
    fi
fi

# Function to check if commit was made via Claudia
validate_claudia_commit() {
    local commit_msg_file=".git/COMMIT_EDITMSG"

    if [ -f "$commit_msg_file" ]; then
        local commit_msg=$(cat "$commit_msg_file")

        # Check for Claudia signature in commit message
        if echo "$commit_msg" | grep -q "🤖 Generated with \[Claude Code\]"; then
            echo -e "${GREEN}✅ Commit created via Claudia workflow${NC}"
            return 0
        fi
    fi

    return 1
}

# Function to check for recent Claudia command usage
check_recent_claudia_usage() {
    local audit_files=("$CLAUDIA_AUDIT_DIR"/*.jsonl)
    local recent_threshold=$(date -d '1 hour ago' -u +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -v-1H -u +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || echo "")

    if [ -z "$recent_threshold" ]; then
        echo -e "${YELLOW}⚠️ Cannot validate recent Claudia usage (date utility issue)${NC}"
        return 0
    fi

    for audit_file in "${audit_files[@]}"; do
        if [ -f "$audit_file" ]; then
            # Check for recent Claudia commands
            if grep -q "claudia:" "$audit_file" 2>/dev/null; then
                local recent_commands=$(grep "$recent_threshold" "$audit_file" 2>/dev/null | grep "claudia:" | wc -l)
                if [ "$recent_commands" -gt 0 ]; then
                    echo -e "${GREEN}✅ Recent Claudia command usage detected${NC}"
                    return 0
                fi
            fi
        fi
    done

    return 1
}

# Function to provide helpful guidance
show_claudia_guidance() {
    echo -e "${BLUE}📚 Claudia Workflow Guide:${NC}"
    echo ""
    echo -e "${YELLOW}Required workflow for changes:${NC}"
    echo "1. Create/update requirements: /claudia:requirements:define \"description\""
    echo "2. Create GitHub issue: /claudia:issues:create \"req-uuid\""
    echo "3. Implement changes: /claudia:implement:manual \"req-uuid\""
    echo "4. Commit via Claudia: /claudia:commit \"issue-id\""
    echo "5. Create PR via Claudia: /claudia:pr:create \"issue-id\""
    echo ""
    echo -e "${YELLOW}For emergency hotfixes only:${NC}"
    echo "1. Create emergency bypass: .github/scripts/create-emergency-bypass.sh"
    echo "2. Get authorization from incident commander"
    echo "3. Make necessary changes"
    echo "4. Complete post-incident review"
    echo ""
    echo -e "${BLUE}💡 Need help? Check: .github/CLAUDIA_WORKFLOW_GUIDE.md${NC}"
}

# Main validation logic
echo -e "${BLUE}🔍 Checking commit compliance...${NC}"

# Check if this is a Claudia-generated commit
if validate_claudia_commit; then
    echo -e "${GREEN}🎉 Claudia workflow compliance validated!${NC}"
    exit 0
fi

# Check for recent Claudia usage (fallback)
if check_recent_claudia_usage; then
    echo -e "${YELLOW}⚠️ No Claudia signature in commit, but recent usage detected${NC}"
    echo -e "${YELLOW}   This may be a legitimate workflow step${NC}"
    exit 0
fi

# If we get here, the commit doesn't appear to follow Claudia workflow
echo -e "${RED}❌ CLAUDIA WORKFLOW VIOLATION${NC}"
echo ""
echo -e "${RED}This commit does not appear to follow the mandatory Claudia workflow.${NC}"
echo -e "${RED}All changes must be made through Claudia commands.${NC}"
echo ""

show_claudia_guidance

echo ""
echo -e "${RED}🚫 Commit blocked - please use Claudia workflow commands${NC}"
exit 1
