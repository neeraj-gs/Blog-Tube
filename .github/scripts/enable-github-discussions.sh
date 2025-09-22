#!/bin/bash
# Enable and Verify GitHub Discussions Script
# Guides user through enabling GitHub Discussions and verifies setup

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

echo -e "${BLUE}💬 GitHub Discussions Enablement Guide${NC}"
echo "====================================="

# Check if GitHub CLI is available
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI not found${NC}"
    exit 1
fi

# Check authentication
if ! gh auth status &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI not authenticated${NC}"
    exit 1
fi

echo -e "${GREEN}✅ GitHub CLI ready${NC}"

# Check if Discussions are enabled
echo -e "${BLUE}🔍 Checking if Discussions are enabled...${NC}"

DISCUSSIONS_ENABLED=$(gh api repos/$REPO_OWNER/$REPO_NAME --jq '.has_discussions' 2>/dev/null || echo "false")

if [ "$DISCUSSIONS_ENABLED" = "true" ]; then
    echo -e "${GREEN}✅ GitHub Discussions are already enabled!${NC}"

    # Check existing discussions
    echo -e "${BLUE}📋 Checking existing discussions...${NC}"
    DISCUSSION_COUNT=$(gh api graphql -f query='
        query($owner: String!, $name: String!) {
            repository(owner: $owner, name: $name) {
                discussions(first: 1) {
                    totalCount
                }
            }
        }' -f owner="$REPO_OWNER" -f name="$REPO_NAME" --jq '.data.repository.discussions.totalCount' 2>/dev/null || echo "0")

    echo -e "${CYAN}   Found $DISCUSSION_COUNT existing discussions${NC}"

    # List recent discussions if any
    if [ "$DISCUSSION_COUNT" != "0" ]; then
        echo -e "${BLUE}🔗 Recent discussions:${NC}"
        gh api graphql -f query='
            query($owner: String!, $name: String!) {
                repository(owner: $owner, name: $name) {
                    discussions(first: 5) {
                        nodes {
                            title
                            url
                            createdAt
                        }
                    }
                }
            }' -f owner="$REPO_OWNER" -f name="$REPO_NAME" --jq '.data.repository.discussions.nodes[] | "• \(.title) - \(.url)"' 2>/dev/null
    fi

else
    echo -e "${RED}❌ GitHub Discussions are NOT enabled${NC}"
    echo ""
    echo -e "${YELLOW}📋 MANUAL STEPS REQUIRED:${NC}"
    echo ""
    echo -e "${BLUE}1. Open your repository in web browser:${NC}"
    echo "   https://github.com/$REPO_OWNER/$REPO_NAME"
    echo ""
    echo -e "${BLUE}2. Go to repository Settings:${NC}"
    echo "   Click 'Settings' tab → Scroll to 'Features' section"
    echo ""
    echo -e "${BLUE}3. Enable Discussions:${NC}"
    echo "   ✅ Check the 'Discussions' checkbox"
    echo "   Click 'Set up discussions' button"
    echo ""
    echo -e "${BLUE}4. Configure categories (optional):${NC}"
    echo "   Use the categories defined in .github/discussions/categories.yml"
    echo ""
    echo -e "${CYAN}🔗 Direct link to settings:${NC}"
    echo "https://github.com/$REPO_OWNER/$REPO_NAME/settings"
    echo ""
    echo -e "${YELLOW}⚠️ After enabling, run this script again to verify!${NC}"

    exit 1
fi

# Verify configuration files exist
echo -e "${BLUE}🔍 Verifying discussion configuration files...${NC}"

config_files=(
    ".github/discussions/categories.yml:Discussion categories"
    ".github/DISCUSSION_GUIDELINES.md:Discussion guidelines"
    ".github/DISCUSSION_TEMPLATE/technical-discussion.md:Technical discussion template"
    ".github/workflows/discussions-automation.yml:Discussion automation"
)

missing_files=()
for file_info in "${config_files[@]}"; do
    IFS=':' read -r file_path description <<< "$file_info"
    if [ -f "$file_path" ]; then
        echo -e "${GREEN}   ✅ $description${NC}"
    else
        echo -e "${RED}   ❌ $description (missing: $file_path)${NC}"
        missing_files+=("$file_path")
    fi
done

if [ ${#missing_files[@]} -gt 0 ]; then
    echo ""
    echo -e "${YELLOW}⚠️ Some configuration files are missing. Run:${NC}"
    echo "   ./.github/scripts/setup-github-discussions.sh"
fi

# Show next steps
echo ""
echo -e "${GREEN}🎉 GitHub Discussions Setup Complete!${NC}"
echo ""
echo -e "${BLUE}📋 Available Discussion Categories:${NC}"
if [ -f ".github/discussions/categories.yml" ]; then
    grep -A1 "name:" .github/discussions/categories.yml | grep "name:" | sed 's/.*name: "/• /' | sed 's/"$//'
fi

echo ""
echo -e "${BLUE}🌐 Access your discussions:${NC}"
echo "• Repository Discussions: https://github.com/$REPO_OWNER/$REPO_NAME/discussions"
echo "• Create Discussion: https://github.com/$REPO_OWNER/$REPO_NAME/discussions/new"

echo ""
echo -e "${CYAN}🎯 Test Commands:${NC}"
echo "# Check discussions via API"
echo "gh api repos/$REPO_OWNER/$REPO_NAME/discussions"
echo ""
echo "# Create a test discussion"
echo "gh api graphql -f query='mutation { createDiscussion(input: { repositoryId: \"REPO_ID\", categoryId: \"CAT_ID\", title: \"Test Discussion\", body: \"Testing discussions setup\" }) { discussion { url } } }'"

echo ""
echo -e "${GREEN}✅ GitHub Discussions ready for Claudia workflow integration!${NC}"
