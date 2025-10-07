#!/bin/bash
# Link GitHub Projects to Repository Script
# Links existing user-level projects to the Blog-Tube repository

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

echo -e "${BLUE}🔗 Linking GitHub Projects to Repository${NC}"
echo "========================================"

# Check prerequisites
echo -e "${BLUE}📋 Checking prerequisites...${NC}"

if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) is not installed${NC}"
    exit 1
fi

if ! gh auth status &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI not authenticated${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites met${NC}"

# Get repository ID
echo -e "${BLUE}🔍 Getting repository information...${NC}"
REPO_ID=$(gh api graphql -f query='
    query($owner: String!, $name: String!) {
        repository(owner: $owner, name: $name) {
            id
        }
    }' -f owner="$REPO_OWNER" -f name="$REPO_NAME" --jq '.data.repository.id' 2>/dev/null)

if [ -z "$REPO_ID" ] || [ "$REPO_ID" = "null" ]; then
    echo -e "${RED}❌ Failed to get repository ID for $REPO_OWNER/$REPO_NAME${NC}"
    echo "Make sure the repository exists and you have access to it"
    exit 1
fi

echo -e "${GREEN}✅ Repository ID: $REPO_ID${NC}"

# Get Claudia projects
echo -e "${BLUE}🔍 Finding Claudia projects...${NC}"
CLAUDIA_PROJECTS=$(gh project list --owner @me --format json 2>/dev/null | jq -r '.projects[] | select(.title | contains("Claudia")) | "\(.id)|\(.number)|\(.title)|\(.url)"' 2>/dev/null)

if [ -z "$CLAUDIA_PROJECTS" ]; then
    echo -e "${RED}❌ No Claudia projects found${NC}"
    echo "Please run the project creation script first:"
    echo "./.github/scripts/setup-github-projects-working.sh"
    exit 1
fi

linked_count=0
total_count=0

# Link each Claudia project to repository
while IFS='|' read -r project_id project_num project_title project_url; do
    if [ -n "$project_id" ]; then
        total_count=$((total_count + 1))
        echo -e "${BLUE}🔗 Linking: $project_title${NC}"

        # Link project to repository using GraphQL
        LINK_RESULT=$(gh api graphql -f query='
            mutation($projectId: ID!, $repositoryId: ID!) {
                linkProjectV2ToRepository(input: {
                    projectId: $projectId
                    repositoryId: $repositoryId
                }) {
                    repository {
                        name
                    }
                }
            }' -f projectId="$project_id" -f repositoryId="$REPO_ID" --jq '.data.linkProjectV2ToRepository.repository.name' 2>/dev/null)

        if [ "$LINK_RESULT" = "$REPO_NAME" ]; then
            echo -e "${GREEN}✅ Successfully linked: $project_title${NC}"
            echo -e "${CYAN}   Project #$project_num: $project_url${NC}"
            linked_count=$((linked_count + 1))
        else
            echo -e "${YELLOW}⚠️ Already linked or failed: $project_title${NC}"
            # Check if already linked by trying to verify
            VERIFY_RESULT=$(gh api graphql -f query='
                query($owner: String!, $name: String!) {
                    repository(owner: $owner, name: $name) {
                        projectsV2(first: 10) {
                            nodes {
                                title
                                id
                            }
                        }
                    }
                }' -f owner="$REPO_OWNER" -f name="$REPO_NAME" --jq ".data.repository.projectsV2.nodes[] | select(.id == \"$project_id\") | .title" 2>/dev/null)

            if [ "$VERIFY_RESULT" = "$project_title" ]; then
                echo -e "${GREEN}   ✅ Already linked: $project_title${NC}"
                linked_count=$((linked_count + 1))
            else
                echo -e "${RED}   ❌ Failed to link: $project_title${NC}"
            fi
        fi
        echo ""
    fi
done <<< "$CLAUDIA_PROJECTS"

# Summary
echo -e "${BLUE}📊 Summary:${NC}"
echo -e "${GREEN}✅ Successfully linked: $linked_count/$total_count projects${NC}"

if [ $linked_count -gt 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 Projects Successfully Linked to Repository!${NC}"
    echo ""
    echo -e "${BLUE}🌐 Access repository projects:${NC}"
    echo "• Repository Projects: https://github.com/$REPO_OWNER/$REPO_NAME/projects"
    echo "• Repository URL: https://github.com/$REPO_OWNER/$REPO_NAME"
    echo ""
    echo -e "${BLUE}📋 Linked Projects:${NC}"
    while IFS='|' read -r project_id project_num project_title project_url; do
        if [ -n "$project_title" ]; then
            echo "• $project_title (#$project_num)"
        fi
    done <<< "$CLAUDIA_PROJECTS"
    echo ""
    echo -e "${GREEN}✅ Projects now appear under your repository's Projects tab!${NC}"
else
    echo ""
    echo -e "${YELLOW}⚠️ No projects were successfully linked${NC}"
    echo ""
    echo -e "${BLUE}🔧 Troubleshooting:${NC}"
    echo "1. Ensure you have admin access to the repository"
    echo "2. Verify the repository exists and is accessible"
    echo "3. Check GitHub CLI permissions"
    echo "4. Try running the project creation script first"
fi

echo ""
echo -e "${CYAN}🔗 GitHub Projects are now integrated with your repository!${NC}"
