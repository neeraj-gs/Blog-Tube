#!/bin/bash
# GitHub Repository-Level Projects Setup Script
# Creates projects directly under the repository (not user-level)

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

echo -e "${BLUE}🏗️ Creating Repository-Level GitHub Projects for Blog-Tube${NC}"
echo "================================================================="

# Check prerequisites
echo -e "${BLUE}📋 Checking prerequisites...${NC}"

if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) is not installed${NC}"
    exit 1
fi

if ! gh auth status &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI not authenticated${NC}"
    echo "Run: gh auth login"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites met${NC}"

# Function to create repository-level project using GitHub API v4 (GraphQL)
create_repo_project() {
    local project_name="$1"
    local description="$2"

    echo -e "${BLUE}📋 Creating repository project: $project_name${NC}"

    # Get repository ID first
    REPO_ID=$(gh api graphql -f query='
        query($owner: String!, $name: String!) {
            repository(owner: $owner, name: $name) {
                id
            }
        }' -f owner="$REPO_OWNER" -f name="$REPO_NAME" --jq '.data.repository.id')

    if [ -z "$REPO_ID" ]; then
        echo -e "${RED}❌ Failed to get repository ID${NC}"
        return 1
    fi

    # Create project using GraphQL mutation
    PROJECT_URL=$(gh api graphql -f query='
        mutation($repositoryId: ID!, $title: String!, $body: String!) {
            createProjectV2(input: {
                repositoryId: $repositoryId
                title: $title
                body: $body
            }) {
                projectV2 {
                    id
                    url
                }
            }
        }' -f repositoryId="$REPO_ID" -f title="$project_name" -f body="$description" --jq '.data.createProjectV2.projectV2.url' 2>/dev/null)

    if [ -n "$PROJECT_URL" ] && [ "$PROJECT_URL" != "null" ]; then
        echo -e "${GREEN}✅ Created: $project_name${NC}"
        echo -e "${CYAN}   URL: $PROJECT_URL${NC}"
        echo "   Description: $description"
        return 0
    else
        # Fallback to legacy API if GraphQL fails
        echo -e "${YELLOW}⚠️ GraphQL failed, trying REST API...${NC}"

        PROJECT_RESPONSE=$(gh api repos/"$REPO_OWNER"/"$REPO_NAME"/projects \
            --method POST \
            --field name="$project_name" \
            --field body="$description" 2>/dev/null || echo "failed")

        if [ "$PROJECT_RESPONSE" != "failed" ]; then
            PROJECT_URL=$(echo "$PROJECT_RESPONSE" | jq -r '.html_url')
            echo -e "${GREEN}✅ Created: $project_name${NC}"
            echo -e "${CYAN}   URL: $PROJECT_URL${NC}"
            echo "   Description: $description"
            return 0
        else
            echo -e "${RED}❌ Failed to create project: $project_name${NC}"
            echo -e "${YELLOW}   Note: Repository-level projects may not be available for this repository${NC}"
            return 1
        fi
    fi
}

# Create projects
echo -e "${BLUE}🚀 Creating Claudia workflow projects...${NC}"
echo ""

# Track success/failure
created_count=0
total_count=4

# 1. Sprint Management Project
if create_repo_project "Claudia Sprint Management" "Sprint-based development workflow with automated tracking. Links to .claude-shared/project-management/3-sprints/"; then
    created_count=$((created_count + 1))
fi
echo ""

# 2. Requirements Project
if create_repo_project "Claudia Requirements Tracking" "Requirement definition and tracking. Links to .claude-shared/project-management/4-requirements/"; then
    created_count=$((created_count + 1))
fi
echo ""

# 3. Implementation Project
if create_repo_project "Claudia Implementation Pipeline" "Ticket implementation and development tracking. Links to .claude-shared/project-management/5-tickets/"; then
    created_count=$((created_count + 1))
fi
echo ""

# 4. Quality Gates Project
if create_repo_project "Claudia Quality Gates" "Code review, testing, and deployment tracking for mandatory workflow compliance"; then
    created_count=$((created_count + 1))
fi
echo ""

# Summary
echo -e "${BLUE}📊 Summary:${NC}"
echo -e "${GREEN}✅ Successfully created: $created_count/$total_count projects${NC}"

if [ $created_count -gt 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 Repository-Level Projects Created!${NC}"
    echo ""
    echo -e "${BLUE}🌐 Access your repository projects:${NC}"
    echo "https://github.com/$REPO_OWNER/$REPO_NAME/projects"
    echo ""
    echo -e "${YELLOW}📝 Next Steps:${NC}"
    echo "1. Configure project fields and workflows"
    echo "2. Add project views (Board, Table, etc.)"
    echo "3. Set up automated issue assignment"
    echo "4. Link issues and PRs to projects"
else
    echo ""
    echo -e "${YELLOW}⚠️ No repository-level projects were created${NC}"
    echo ""
    echo -e "${BLUE}💡 Alternative Options:${NC}"
    echo "1. Use user-level projects (already created): https://github.com/neeraj-gs?tab=projects"
    echo "2. Enable Projects v2 in repository settings if not already enabled"
    echo "3. Check if you have admin access to the repository"
    echo ""
    echo -e "${CYAN}🔧 Troubleshooting:${NC}"
    echo "1. Verify repository permissions: gh repo view $REPO_OWNER/$REPO_NAME"
    echo "2. Check if Projects are enabled in repository settings"
    echo "3. Try the user-level projects script: ./.github/scripts/setup-github-projects.sh"
fi

echo ""
echo -e "${BLUE}📋 Project configuration files created in .github/project-configs/${NC}"

# Create project configuration files
mkdir -p .github/project-configs

cat > .github/project-configs/repository-projects-guide.md << 'EOF'
# Repository-Level Projects Guide

## Created Projects

### 1. Claudia Sprint Management
- **Purpose**: Sprint-based development workflow with automated tracking
- **Links to**: `.claude-shared/project-management/3-sprints/`
- **Usage**: Track sprint progress, requirements completion, velocity metrics

### 2. Claudia Requirements Tracking
- **Purpose**: Requirement definition and tracking
- **Links to**: `.claude-shared/project-management/4-requirements/`
- **Usage**: Monitor requirement lifecycle from definition to completion

### 3. Claudia Implementation Pipeline
- **Purpose**: Ticket implementation and development tracking
- **Links to**: `.claude-shared/project-management/5-tickets/`
- **Usage**: Track development work, code reviews, deployment status

### 4. Claudia Quality Gates
- **Purpose**: Code review, testing, and deployment tracking
- **Usage**: Ensure quality standards, track review cycles, monitor deployments

## Project Configuration

### Fields to Add
- Sprint Number (Single Select)
- Status (Single Select: Todo, In Progress, Review, Done)
- Priority (Single Select: Low, Medium, High, Critical)
- Assignee (Person)
- Labels (Multi Select)
- Story Points (Number)

### Views to Create
- **Sprint Board**: Kanban view filtered by current sprint
- **Requirements Backlog**: Table view of all requirements
- **Implementation Pipeline**: Flow view showing development stages
- **Quality Dashboard**: Metrics view for quality gates

### Automation Rules
- Auto-assign issues based on labels
- Move items to "In Progress" when PR is opened
- Move items to "Done" when PR is merged
- Update sprint fields based on issue milestones

## Integration with Claudia Commands

The projects integrate automatically with Claudia workflow commands:

- `/claudia:sprint:create` → Creates sprint milestone and project items
- `/claudia:issues:create` → Adds items to appropriate projects
- `/claudia:pr:create` → Updates project status automatically
- `/claudia:tickets:complete` → Moves items to completion

## Access URLs

- Repository Projects: https://github.com/neeraj-gs/Blog-Tube/projects
- Project 1: [Will be filled in after creation]
- Project 2: [Will be filled in after creation]
- Project 3: [Will be filled in after creation]
- Project 4: [Will be filled in after creation]
EOF

echo -e "${GREEN}✅ Setup complete!${NC}"
