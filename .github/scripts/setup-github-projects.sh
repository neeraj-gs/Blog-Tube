#!/bin/bash
# GitHub Projects Setup Script - Interactive Repository-Level Project Creation
# This script sets up GitHub Projects V2 at repository level for Claudia workflow

set -euo pipefail

# Force interactive mode by redirecting input from terminal (if available)
if [ -t 0 ]; then
    # Already connected to terminal
    INPUT_SOURCE=""
else
    # Try to connect to /dev/tty if not already interactive
    if [ -e /dev/tty ]; then
        exec < /dev/tty
        INPUT_SOURCE=" < /dev/tty"
    else
        # Running in non-interactive environment
        INPUT_SOURCE=""
    fi
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}🏗️ GitHub Projects Setup - Repository Level${NC}"
echo "=============================================="
echo ""

# Check prerequisites
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

echo -e "${GREEN}✅ GitHub CLI authenticated and ready${NC}"
echo ""

# Get repository information interactively
echo -e "${BLUE}📋 Repository Configuration:${NC}"
echo ""

# Get repository owner
if [ -e /dev/tty ]; then
    read -p "Repository Owner (e.g., neeraj-gs): " REPO_OWNER < /dev/tty
else
    read -p "Repository Owner (e.g., neeraj-gs): " REPO_OWNER
fi

if [ -z "$REPO_OWNER" ]; then
    echo -e "${RED}❌ Repository owner cannot be empty${NC}"
    exit 1
fi

# Get repository name
if [ -e /dev/tty ]; then
    read -p "Repository Name (e.g., Blog-Tube): " REPO_NAME < /dev/tty
else
    read -p "Repository Name (e.g., Blog-Tube): " REPO_NAME
fi

if [ -z "$REPO_NAME" ]; then
    echo -e "${RED}❌ Repository name cannot be empty${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Repository: $REPO_OWNER/$REPO_NAME${NC}"
echo ""

# Verify repository exists and get IDs
echo -e "${BLUE}🔍 Verifying repository...${NC}"
REPO_INFO=$(gh repo view "$REPO_OWNER/$REPO_NAME" --json id,name,owner 2>&1)

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Repository not found or inaccessible${NC}"
    echo "$REPO_INFO"
    exit 1
fi

REPO_ID=$(echo "$REPO_INFO" | jq -r '.id')
OWNER_ID=$(echo "$REPO_INFO" | jq -r '.owner.id')

echo -e "${GREEN}✅ Repository verified${NC}"
echo -e "${CYAN}   Repository ID: $REPO_ID${NC}"
echo -e "${CYAN}   Owner ID: $OWNER_ID${NC}"
echo ""

# Ask how many projects to create
echo -e "${BLUE}📋 Project Creation Setup:${NC}"
echo ""

if [ -e /dev/tty ]; then
    read -p "How many projects do you want to create? (1-10): " num_projects < /dev/tty
else
    read -p "How many projects do you want to create? (1-10): " num_projects
fi

if [[ ! "$num_projects" =~ ^[1-9]$|^10$ ]]; then
    echo -e "${RED}❌ Invalid number. Please enter a number between 1 and 10.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Will create $num_projects project(s)${NC}"
echo ""

# Store project details
declare -a PROJECT_NAMES
declare -a PROJECT_DESCRIPTIONS
declare -a PROJECT_EMOJIS

# Get details for each project
for ((i=1; i<=num_projects; i++)); do
    echo -e "${BLUE}📝 Project $i of $num_projects:${NC}"

    # Get project name
    if [ -e /dev/tty ]; then
        read -p "  Project Name: " project_name < /dev/tty
    else
        read -p "  Project Name: " project_name
    fi

    if [ -z "$project_name" ]; then
        echo -e "${RED}❌ Project name cannot be empty${NC}"
        exit 1
    fi

    # Get project description (optional)
    if [ -e /dev/tty ]; then
        read -p "  Description (optional): " project_desc < /dev/tty
    else
        read -p "  Description (optional): " project_desc
    fi

    if [ -z "$project_desc" ]; then
        project_desc="Project managed with Claudia workflow"
    fi

    # Get emoji (optional)
    if [ -e /dev/tty ]; then
        read -p "  Emoji (optional, e.g., 🚀, 📋, 🛠️): " project_emoji < /dev/tty
    else
        read -p "  Emoji (optional, e.g., 🚀, 📋, 🛠️): " project_emoji
    fi

    if [ -z "$project_emoji" ]; then
        project_emoji="📦"
    fi

    PROJECT_NAMES+=("$project_name")
    PROJECT_DESCRIPTIONS+=("$project_desc")
    PROJECT_EMOJIS+=("$project_emoji")

    echo -e "${GREEN}  ✅ Project configured: $project_emoji $project_name${NC}"
    echo ""
done

# Confirm before creating
echo -e "${BLUE}📋 Projects to Create:${NC}"
for ((i=0; i<num_projects; i++)); do
    echo "  $((i+1)). ${PROJECT_EMOJIS[$i]} ${PROJECT_NAMES[$i]}"
    echo "     ${PROJECT_DESCRIPTIONS[$i]}"
done
echo ""

if [ -e /dev/tty ]; then
    read -p "Create these projects? (y/N): " confirm < /dev/tty
else
    read -p "Create these projects? (y/N): " confirm
fi

if [[ ! $confirm =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⚠️  Project creation cancelled by user${NC}"
    exit 0
fi

echo -e "${GREEN}✅ Confirmed. Creating projects...${NC}"

# Function to create repository-level project
create_repo_project() {
    local project_name="$1"
    local description="$2"
    local emoji="$3"

    echo ""
    echo -e "${BLUE}$emoji Creating: $project_name${NC}"
    echo -e "${CYAN}   Description: $description${NC}"

    # Create project using GraphQL API (repository-level)
    # For repository projects, we need ownerId + link to repository
    PROJECT_RESPONSE=$(gh api graphql -f query='
        mutation($ownerId: ID!, $title: String!, $repositoryId: ID!) {
            createProjectV2(input: {
                ownerId: $ownerId
                title: $title
                repositoryId: $repositoryId
            }) {
                projectV2 {
                    id
                    number
                    url
                    title
                }
            }
        }' -f ownerId="$OWNER_ID" -f repositoryId="$REPO_ID" -f title="$project_name" 2>&1)

    # Check for errors
    if echo "$PROJECT_RESPONSE" | grep -q "errors"; then
        echo -e "${RED}   ❌ Failed to create project${NC}"
        echo -e "${YELLOW}   Error details:${NC}"
        echo "$PROJECT_RESPONSE" | grep -A 5 "errors"
        return 1
    fi

    # Extract project details
    PROJECT_URL=$(echo "$PROJECT_RESPONSE" | jq -r '.data.createProjectV2.projectV2.url' 2>/dev/null)
    PROJECT_NUMBER=$(echo "$PROJECT_RESPONSE" | jq -r '.data.createProjectV2.projectV2.number' 2>/dev/null)
    PROJECT_ID=$(echo "$PROJECT_RESPONSE" | jq -r '.data.createProjectV2.projectV2.id' 2>/dev/null)

    if [ -n "$PROJECT_URL" ] && [ "$PROJECT_URL" != "null" ]; then
        echo -e "${GREEN}   ✅ Created successfully!${NC}"
        echo -e "${CYAN}   🔢 Project #$PROJECT_NUMBER${NC}"
        echo -e "${CYAN}   🔗 URL: $PROJECT_URL${NC}"
        echo -e "${CYAN}   📌 Linked to: $REPO_OWNER/$REPO_NAME${NC}"

        # Store project info
        echo "$project_name|$PROJECT_NUMBER|$PROJECT_URL|$PROJECT_ID" >> /tmp/created_projects.txt
        return 0
    else
        echo -e "${RED}   ❌ Failed to extract project URL${NC}"
        echo -e "${YELLOW}   Response:${NC}"
        echo "$PROJECT_RESPONSE"
        return 1
    fi
}

# Initialize tracking file
echo "" > /tmp/created_projects.txt

# Create all projects
echo ""
echo -e "${GREEN}🚀 Creating projects...${NC}"

for ((i=0; i<num_projects; i++)); do
    create_repo_project \
        "${PROJECT_NAMES[$i]}" \
        "${PROJECT_DESCRIPTIONS[$i]}" \
        "${PROJECT_EMOJIS[$i]}"

    # Small delay to avoid rate limiting
    sleep 1
done

# Summary
echo ""
echo -e "${GREEN}✨ Project Setup Complete!${NC}"
echo "=========================================="
echo ""

if [ -s /tmp/created_projects.txt ]; then
    echo -e "${BLUE}📋 Created Projects (Repository Level):${NC}"
    i=1
    while IFS='|' read -r name number url id; do
        if [ -n "$name" ]; then
            echo "   $i. $name"
            echo "      • Project #$number"
            echo "      • URL: $url"
            i=$((i + 1))
        fi
    done < /tmp/created_projects.txt

    echo ""
    echo -e "${BLUE}🌐 Access Your Projects:${NC}"
    echo "   • All Projects: https://github.com/$REPO_OWNER?tab=projects"
    echo "   • Repository Projects View: https://github.com/$REPO_OWNER/$REPO_NAME/projects"

    echo ""
    echo -e "${BLUE}🎯 Next Steps:${NC}"
    echo "   1. ✅ Projects are linked to $REPO_OWNER/$REPO_NAME"
    echo "   2. Configure project fields and custom views"
    echo "   3. Set up automation rules for issues/PRs"
    echo "   4. Start adding issues to projects"
    echo "   5. Integrate with Claudia workflow commands"

    echo ""
    echo -e "${CYAN}💡 Note: GitHub Projects V2 are user-owned but linked to repositories${NC}"
    echo -e "${CYAN}   You can view them from both your profile and the repository tabs${NC}"
else
    echo -e "${YELLOW}⚠️  No projects were created${NC}"
fi

# Create project configuration files
echo ""
echo -e "${BLUE}📝 Creating project configuration files...${NC}"

mkdir -p .github/project-configs

# Sprint Management Configuration
cat > .github/project-configs/sprint-management.yml << 'EOF'
# Sprint Management Project Configuration
name: "Claudia Sprint Management"
description: "Sprint-based development workflow with automated tracking"

custom_fields:
  - name: "Sprint Number"
    type: "single_select"
    options: ["001", "002", "003", "004", "005", "006", "007", "008", "009", "010"]

  - name: "Sprint Status"
    type: "single_select"
    options: ["Planning", "Active", "Review", "Completed", "Archived"]

  - name: "Requirements Count"
    type: "number"

  - name: "Completed Requirements"
    type: "number"

  - name: "Progress"
    type: "number"

views:
  - name: "Active Sprints"
    layout: "board"
    group_by: "Sprint Status"

  - name: "Sprint Timeline"
    layout: "timeline"

  - name: "All Sprints"
    layout: "table"
EOF

# Requirements Tracking Configuration
cat > .github/project-configs/requirements-tracking.yml << 'EOF'
# Requirements Tracking Project Configuration
name: "Claudia Requirements Tracking"
description: "Requirement definition and tracking system"

custom_fields:
  - name: "Requirement ID"
    type: "text"

  - name: "Sprint"
    type: "single_select"
    options: ["001", "002", "003", "004", "005"]

  - name: "Priority"
    type: "single_select"
    options: ["Critical", "High", "Medium", "Low"]

  - name: "Status"
    type: "single_select"
    options: ["Draft", "Approved", "In Progress", "Testing", "Completed"]

  - name: "Environment"
    type: "single_select"
    options: ["dev", "staging", "production"]

views:
  - name: "By Priority"
    layout: "board"
    group_by: "Priority"

  - name: "By Sprint"
    layout: "board"
    group_by: "Sprint"

  - name: "All Requirements"
    layout: "table"
EOF

# Implementation Pipeline Configuration
cat > .github/project-configs/implementation-pipeline.yml << 'EOF'
# Implementation Pipeline Project Configuration
name: "Claudia Implementation Pipeline"
description: "Ticket implementation and development tracking"

custom_fields:
  - name: "Ticket ID"
    type: "text"

  - name: "Implementation Status"
    type: "single_select"
    options: ["Backlog", "Ready", "In Progress", "Code Review", "Testing", "Done"]

  - name: "Developer"
    type: "text"

  - name: "TDD Status"
    type: "single_select"
    options: ["Tests Written", "Tests Passing", "No Tests", "Needs Tests"]

  - name: "Effort (Story Points)"
    type: "number"

views:
  - name: "Kanban Board"
    layout: "board"
    group_by: "Implementation Status"

  - name: "Current Sprint"
    layout: "table"

  - name: "By Developer"
    layout: "board"
    group_by: "Developer"
EOF

# Quality Gates Configuration
cat > .github/project-configs/quality-gates.yml << 'EOF'
# Quality Gates Project Configuration
name: "Claudia Quality Gates"
description: "Code review, testing, and deployment tracking"

custom_fields:
  - name: "Review Status"
    type: "single_select"
    options: ["Pending", "In Review", "Changes Requested", "Approved", "Merged"]

  - name: "Test Coverage"
    type: "number"

  - name: "Security Scan"
    type: "single_select"
    options: ["Not Run", "Passed", "Failed", "Warnings"]

  - name: "Quality Score"
    type: "number"

  - name: "Deployment Status"
    type: "single_select"
    options: ["Not Deployed", "Dev", "Staging", "Production"]

views:
  - name: "Review Pipeline"
    layout: "board"
    group_by: "Review Status"

  - name: "Quality Dashboard"
    layout: "table"

  - name: "Deployment Tracking"
    layout: "board"
    group_by: "Deployment Status"
EOF

echo -e "${GREEN}✅ Configuration files created in .github/project-configs/${NC}"

# Cleanup
rm -f /tmp/created_projects.txt

echo ""
echo -e "${GREEN}🎉 All done! Your repository-level projects are ready!${NC}"
echo ""
