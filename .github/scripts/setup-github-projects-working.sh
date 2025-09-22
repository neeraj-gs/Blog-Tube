#!/bin/bash
# Working GitHub Projects Setup Script
# Uses modern GitHub CLI commands that actually work

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}🏗️ Setting up GitHub Projects (Working Version)${NC}"
echo "=================================================="

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

# Function to create user-level project (this actually works)
create_project() {
    local project_name="$1"
    local description="$2"

    echo -e "${BLUE}📋 Creating project: $project_name${NC}"

    # Create user-level project (the only reliable method)
    PROJECT_RESPONSE=$(gh project create --title "$project_name" --owner @me --format json 2>/dev/null)

    if [ -n "$PROJECT_RESPONSE" ]; then
        PROJECT_URL=$(echo "$PROJECT_RESPONSE" | jq -r '.url')
        PROJECT_NUM=$(echo "$PROJECT_RESPONSE" | jq -r '.number')

        echo -e "${GREEN}✅ Created: $project_name${NC}"
        echo -e "${CYAN}   URL: $PROJECT_URL${NC}"
        echo "   Description: $description"
        echo "   Project Number: $PROJECT_NUM"

        return 0
    else
        echo -e "${RED}❌ Failed to create: $project_name${NC}"
        return 1
    fi
}

# Create projects
echo -e "${BLUE}🚀 Creating Claudia workflow projects...${NC}"
echo ""

created_projects=()

# Create all 4 projects
projects=(
    "Claudia Sprint Management|Sprint-based development workflow with automated tracking"
    "Claudia Requirements Tracking|Requirement definition and tracking"
    "Claudia Implementation Pipeline|Ticket implementation and development tracking"
    "Claudia Quality Gates|Code review, testing, and deployment tracking"
)

for project_info in "${projects[@]}"; do
    IFS='|' read -r name description <<< "$project_info"

    if create_project "$name" "$description"; then
        created_projects+=("$name")
    fi
    echo ""
done

# Summary
echo -e "${BLUE}📊 Summary:${NC}"
echo -e "${GREEN}✅ Successfully created: ${#created_projects[@]}/4 projects${NC}"

if [ ${#created_projects[@]} -gt 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 Projects Created Successfully!${NC}"
    echo ""
    echo -e "${BLUE}📋 Created Projects:${NC}"
    for project in "${created_projects[@]}"; do
        echo "• $project"
    done
    echo ""
    echo -e "${BLUE}🌐 Access your projects:${NC}"
    echo "• All Projects: https://github.com/neeraj-gs?tab=projects"
    echo "• Or run: gh project list --owner @me"
    echo ""
    echo -e "${YELLOW}📝 To link projects to your Blog-Tube repository:${NC}"
    echo "1. Open each project URL"
    echo "2. Click Settings (gear icon)"
    echo "3. Under 'Linked repositories', add 'Blog-Tube'"
    echo "4. Projects will then appear in your repository's Projects tab"
    echo ""
    echo -e "${CYAN}🔗 Commands to view projects:${NC}"
    echo "gh project list --owner @me"
    echo "gh project view 1 --owner @me  # View first project"
fi

# Create configuration guide
mkdir -p .github/project-configs

cat > .github/project-configs/projects-setup-guide.md << EOF
# GitHub Projects Setup Guide

## Created Projects

$(printf "### %s\n" "${created_projects[@]}")

## Project URLs
Check your projects at: https://github.com/neeraj-gs?tab=projects

## Linking Projects to Repository

To make projects appear under your repository's Projects tab:

1. **Open each project** from your projects dashboard
2. **Click Settings** (gear icon in the top right)
3. **Under "Linked repositories"**, click "Link a repository"
4. **Search and select** "neeraj-gs/Blog-Tube"
5. **Save changes**

After linking, projects will appear at: https://github.com/neeraj-gs/Blog-Tube/projects

## Project Configuration

### Recommended Fields to Add:
- **Status** (Single select): Todo, In Progress, Review, Done
- **Priority** (Single select): Low, Medium, High, Critical
- **Sprint** (Single select): 001, 002, 003, etc.
- **Assignee** (Person)
- **Labels** (Multi select)
- **Story Points** (Number)

### Views to Create:
- **Kanban Board**: Status-based board view
- **Sprint Planning**: Table view filtered by sprint
- **Backlog**: All items in priority order
- **Team Dashboard**: Assignee-based view

## Integration with Claudia Commands

These projects integrate with Claudia workflow:

- \`/claudia:sprint:create\` → Creates sprint milestones
- \`/claudia:issues:create\` → Adds items to projects automatically
- \`/claudia:pr:create\` → Links PRs to project items
- \`/claudia:tickets:complete\` → Moves items to completion

## Next Steps

1. Link projects to Blog-Tube repository
2. Configure project fields and views
3. Test integration with Claudia commands
4. Set up project automation rules

---
Generated: $(date)
EOF

echo -e "${BLUE}📋 Configuration guide created: .github/project-configs/projects-setup-guide.md${NC}"
echo -e "${GREEN}✅ Setup complete!${NC}"
