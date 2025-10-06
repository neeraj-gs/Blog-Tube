#!/bin/bash
# Claudia Commit Message Validation Hook
# Validates commit message format for Claudia workflow

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}📝 Validating commit message format...${NC}"

# Get commit message from file
commit_msg_file="$1"
commit_msg=$(cat "$commit_msg_file")

# Check for emergency bypass
if [ -f ".github/emergency-bypass.active" ]; then
    if grep -q "AUTHORIZED=true" ".github/emergency-bypass.active" 2>/dev/null; then
        echo -e "${YELLOW}🚨 Emergency bypass active - skipping commit message validation${NC}"
        exit 0
    fi
fi

# Validate commit message format
validate_commit_message() {
    local msg="$1"

    # Check for Claudia signature
    if echo "$msg" | grep -q "🤖 Generated with \[Claude Code\]"; then
        echo -e "${GREEN}✅ Claudia-generated commit message detected${NC}"
        return 0
    fi

    # Check for conventional commit format (fallback)
    if echo "$msg" | grep -qE "^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .+"; then
        echo -e "${YELLOW}⚠️ Conventional commit format detected (manual commit)${NC}"
        echo -e "${YELLOW}   Consider using /claudia:commit command for better traceability${NC}"
        return 0
    fi

    # Check for emergency/hotfix commits
    if echo "$msg" | grep -qiE "^(emergency|hotfix|critical):"; then
        echo -e "${YELLOW}🚨 Emergency commit detected${NC}"
        echo -e "${YELLOW}   Ensure proper emergency procedures are followed${NC}"
        return 0
    fi

    return 1
}

# Validate the commit message
if validate_commit_message "$commit_msg"; then
    exit 0
fi

# If validation fails
echo -e "${RED}❌ INVALID COMMIT MESSAGE FORMAT${NC}"
echo ""
echo -e "${RED}Current commit message:${NC}"
echo "$(echo "$commit_msg" | head -10)"
echo ""
echo -e "${YELLOW}Valid formats:${NC}"
echo "1. Claudia-generated (recommended): Use /claudia:commit \"issue-id\""
echo "2. Conventional commits: type(scope): description"
echo "3. Emergency commits: emergency: description"
echo ""
echo -e "${BLUE}💡 For best traceability, use: /claudia:commit \"issue-id\"${NC}"

# For now, allow through with warning (can be made stricter later)
echo -e "${YELLOW}⚠️ Warning: Non-standard commit message format${NC}"
echo -e "${YELLOW}   Consider using Claudia workflow for better compliance${NC}"
exit 0
