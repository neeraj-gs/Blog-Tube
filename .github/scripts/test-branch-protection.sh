#!/bin/bash
# Test Branch Protection Script
# Tests branch protection rules and demonstrates how they work

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
REPO_OWNER="neeraj-gs"
REPO_NAME="Blog-Tube"

echo -e "${BLUE}🛡️ Testing Branch Protection Rules${NC}"
echo "=================================="

# Check prerequisites
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI not available${NC}"
    exit 1
fi

if ! gh auth status &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI not authenticated${NC}"
    exit 1
fi

echo -e "${GREEN}✅ GitHub CLI ready${NC}"

# Function to check branch protection
check_branch_protection() {
    local branch_name="$1"
    echo -e "${BLUE}🔍 Checking protection for branch: $branch_name${NC}"

    # Get branch protection status
    PROTECTION_STATUS=$(gh api repos/$REPO_OWNER/$REPO_NAME/branches/$branch_name/protection 2>/dev/null || echo "not_protected")

    if [ "$PROTECTION_STATUS" = "not_protected" ]; then
        echo -e "${RED}❌ Branch '$branch_name' is NOT protected${NC}"
        return 1
    else
        echo -e "${GREEN}✅ Branch '$branch_name' is protected${NC}"

        # Show protection details
        echo -e "${CYAN}   Protection Details:${NC}"
        echo "$PROTECTION_STATUS" | jq -r '
            "   • Required Reviews: " + (.required_pull_request_reviews.required_approving_review_count | tostring),
            "   • Dismiss Stale Reviews: " + (.required_pull_request_reviews.dismiss_stale_reviews | tostring),
            "   • Require Code Owner Reviews: " + (.required_pull_request_reviews.require_code_owner_reviews | tostring),
            "   • Restrict Pushes: " + (.restrictions.users // [] | length > 0 or .restrictions.teams // [] | length > 0 | tostring),
            "   • Enforce for Admins: " + (.enforce_admins.enabled | tostring),
            "   • Required Status Checks: " + ((.required_status_checks.contexts // []) | join(", "))
        ' 2>/dev/null || echo "   • Basic protection enabled"

        return 0
    fi
}

# Function to test direct push (should fail)
test_direct_push() {
    local branch_name="$1"
    echo -e "${BLUE}🧪 Testing direct push to $branch_name (should fail)${NC}"

    # Check current branch
    CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
    echo -e "${CYAN}   Current branch: $CURRENT_BRANCH${NC}"

    if [ "$CURRENT_BRANCH" = "$branch_name" ]; then
        echo -e "${YELLOW}⚠️ Already on $branch_name branch${NC}"
        echo -e "${YELLOW}   Direct commits to $branch_name should be blocked by pre-commit hooks${NC}"

        # Test with a simple change
        echo "# Branch Protection Test - $(date)" > .branch-protection-test.md
        git add .branch-protection-test.md

        echo -e "${BLUE}   Testing commit (should be blocked)...${NC}"
        if git commit -m "test: branch protection test commit" 2>&1; then
            echo -e "${RED}❌ Commit was NOT blocked! Branch protection may not be working${NC}"
            # Clean up
            git reset HEAD~1
            rm -f .branch-protection-test.md
        else
            echo -e "${GREEN}✅ Commit was blocked by pre-commit hooks${NC}"
            # Clean up staged changes
            git reset HEAD .branch-protection-test.md
            rm -f .branch-protection-test.md
        fi
    else
        echo -e "${YELLOW}⚠️ Not on $branch_name branch, cannot test direct push${NC}"
        echo -e "${CYAN}   To test: checkout $branch_name and try to commit directly${NC}"
    fi
}

# Function to demonstrate proper workflow
demonstrate_proper_workflow() {
    echo -e "${BLUE}📚 Demonstrating Proper Claudia Workflow${NC}"
    echo "======================================="

    echo -e "${CYAN}Instead of direct commits, use Claudia workflow:${NC}"
    echo ""
    echo -e "${GREEN}1. Create a feature branch:${NC}"
    echo "   git checkout -b feature/branch-protection-test"
    echo ""
    echo -e "${GREEN}2. Use Claudia commands for changes:${NC}"
    echo "   /claudia:sprint:create \"032\""
    echo "   /claudia:requirements:define \"Test branch protection\" --sprint 032"
    echo "   /claudia:tickets:create \"032-XX\" --env dev"
    echo "   /claudia:implement:manual \"032-XX-XX\""
    echo ""
    echo -e "${GREEN}3. Commit via Claudia:${NC}"
    echo "   /claudia:commit \"032-XX-XX\" \"feat: implement branch protection testing\""
    echo ""
    echo -e "${GREEN}4. Create PR via Claudia:${NC}"
    echo "   /claudia:pr:create \"032-XX-XX\""
    echo ""
    echo -e "${YELLOW}This workflow will bypass pre-commit restrictions and work with branch protection${NC}"
}

# Main testing sequence
echo ""
echo -e "${BLUE}🔍 Starting Branch Protection Tests...${NC}"
echo ""

# Test 1: Check main branch protection
if check_branch_protection "main"; then
    echo ""
    # Test 2: Try direct push to main (should fail)
    test_direct_push "main"
    echo ""
else
    echo -e "${YELLOW}⚠️ Main branch protection not found${NC}"
    echo -e "${BLUE}💡 Run this to enable main branch protection:${NC}"
    echo "   ./.github/scripts/setup-branch-protection.sh"
    echo ""
fi

# Test 3: Check dev branch protection
echo ""
if check_branch_protection "dev"; then
    echo ""
    test_direct_push "dev"
else
    echo -e "${YELLOW}⚠️ Dev branch protection not found${NC}"
fi

# Show how to create proper workflow
echo ""
demonstrate_proper_workflow

# Summary and next steps
echo ""
echo -e "${BLUE}📊 Branch Protection Test Summary:${NC}"
echo "=================================="

# Check all protected branches
echo -e "${CYAN}All protected branches:${NC}"
PROTECTED_BRANCHES=$(gh api repos/$REPO_OWNER/$REPO_NAME/branches --jq '.[] | select(.protected == true) | .name' 2>/dev/null || echo "")

if [ -n "$PROTECTED_BRANCHES" ]; then
    echo "$PROTECTED_BRANCHES" | while read -r branch; do
        echo "• $branch ✅"
    done
else
    echo "• No protected branches found ❌"
fi

echo ""
echo -e "${BLUE}🎯 Next Steps:${NC}"
echo "1. If main branch protection failed: Run setup script"
echo "2. To protect dev branch: Use the protection setup commands below"
echo "3. Test PR workflow: Create feature branch → Make changes → Create PR"
echo "4. Verify team members cannot force push to protected branches"

echo ""
echo -e "${GREEN}✅ Branch Protection Testing Complete!${NC}"
