#!/bin/bash
# GitHub Projects Setup Script for Phase 1 Implementation
# This script sets up GitHub Projects for sprint management

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_OWNER="@me"  # Use @me for current user, or specific username for organization
REPO_NAME="Blog-Tube"
ORG_NAME=""  # Leave empty if personal repo

echo -e "${BLUE}🏗️ Phase 1A: Setting up GitHub Projects for Claudia Workflow${NC}"
echo "=========================================================="

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) is not installed${NC}"
    echo "Install with: brew install gh"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}⚠️ GitHub CLI not authenticated${NC}"
    echo "Run: gh auth login"
    exit 1
fi

# Check if user has project scopes
if ! gh auth status 2>&1 | grep -q "project"; then
    echo -e "${YELLOW}⚠️ GitHub CLI missing project scopes${NC}"
    echo "Required scopes: project, read:project"
    echo ""
    echo "Run this command to add required scopes:"
    echo "  gh auth refresh -s project,read:project"
    echo ""
    read -p "Would you like me to run this command now? (y/N): " confirm
    if [[ $confirm =~ ^[Yy]$ ]]; then
        echo "Running: gh auth refresh -s project,read:project"
        gh auth refresh -s project,read:project
    else
        echo "Exiting. Please run the auth refresh command and try again."
        exit 1
    fi
fi

echo -e "${GREEN}✅ GitHub CLI authenticated and ready${NC}"

# Create Projects for each major workflow component
create_project() {
    local project_name="$1"
    local description="$2"
    local template="$3"

    echo -e "${BLUE}📋 Creating project: $project_name${NC}"

    # Create project (GitHub CLI v2 syntax - no body flag supported)
    if [ -n "$ORG_NAME" ]; then
        gh project create --org "$ORG_NAME" --title "$project_name"
    else
        gh project create --owner "$REPO_OWNER" --title "$project_name"
    fi

    echo "   Description: $description"

    echo -e "${GREEN}✅ Created project: $project_name${NC}"
}

# Create main projects
echo -e "${BLUE}📋 Creating Claudia workflow projects...${NC}"

# 1. Sprint Management Project
create_project "Claudia Sprint Management" \
    "Sprint-based development workflow with automated tracking. Links to .claude-shared/project-management/3-sprints/" \
    "basic"

# 2. Requirements Project
create_project "Claudia Requirements Tracking" \
    "Requirement definition and tracking. Links to .claude-shared/project-management/4-requirements/" \
    "feature_tracking"

# 3. Implementation Project
create_project "Claudia Implementation Pipeline" \
    "Ticket implementation and development tracking. Links to .claude-shared/project-management/5-tickets/" \
    "basic"

# 4. Quality Assurance Project
create_project "Claudia Quality Gates" \
    "Code review, testing, and deployment tracking for mandatory workflow compliance" \
    "basic"

echo ""
echo -e "${GREEN}🎉 GitHub Projects Setup Complete!${NC}"
echo ""
echo -e "${BLUE}📋 Created Projects (User-level):${NC}"
echo "1. Claudia Sprint Management - Sprint workflow automation"
echo "2. Claudia Requirements Tracking - Requirements management"
echo "3. Claudia Implementation Pipeline - Development tracking"
echo "4. Claudia Quality Gates - Quality assurance"
echo ""
echo -e "${BLUE}🌐 Access your projects:${NC}"
echo "• Your Projects: https://github.com/neeraj-gs?tab=projects"
echo "• Project 1: https://github.com/users/neeraj-gs/projects/1"
echo "• Project 2: https://github.com/users/neeraj-gs/projects/2"
echo "• Project 3: https://github.com/users/neeraj-gs/projects/3"
echo "• Project 4: https://github.com/users/neeraj-gs/projects/4"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo "1. Add repository to each project via GitHub web interface"
echo "2. Configure project fields and workflows"
echo "3. Link projects to repository issues and PRs"
echo "4. Set up automated issue assignment"
echo ""
echo -e "${CYAN}🔗 To link projects to repository:${NC}"
echo "1. Go to each project URL above"
echo "2. Click 'Settings' in the project"
echo "3. Add 'Blog-Tube' repository under 'Linked repositories'"
echo ""

# Create project configuration files
mkdir -p .github/project-configs

# Sprint Management Project Configuration
cat > .github/project-configs/sprint-management.yml << 'EOF'
# Sprint Management Project Configuration
name: "Claudia Sprint Management"
description: "Sprint-based development workflow with automated tracking"

fields:
  - name: "Sprint Number"
    type: "single_select"
    options:
      - "001"
      - "002"
      - "003"
      - "004"
      - "005"

  - name: "Sprint Status"
    type: "single_select"
    options:
      - "Planning"
      - "Active"
      - "Review"
      - "Completed"

  - name: "Requirements Count"
    type: "number"

  - name: "Tickets Count"
    type: "number"

  - name: "Completion Percentage"
    type: "number"

views:
  - name: "Active Sprints"
    filter: "Sprint Status:Active"
  - name: "Sprint Planning"
    filter: "Sprint Status:Planning"
  - name: "Sprint Review"
    filter: "Sprint Status:Review"

automation:
  - trigger: "issue_labeled"
    condition: "label:claudia:sprint"
    action: "add_to_project"
EOF

echo -e "${GREEN}✅ Project configuration files created${NC}"
echo "Location: .github/project-configs/"
