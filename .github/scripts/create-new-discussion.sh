#!/bin/bash
# Create New Discussion Script
# Interactive script to create new discussions with templates

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

# Configuration
REPO_OWNER="neeraj-gs"
REPO_NAME="Blog-Tube"

echo -e "${BLUE}💬 Create New GitHub Discussion${NC}"
echo "==============================="

# Check prerequisites
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI not available${NC}"
    exit 1
fi

if ! gh auth status &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI not authenticated${NC}"
    exit 1
fi

# Get repository and categories
REPO_ID=$(gh api graphql -f query='
    query($owner: String!, $name: String!) {
        repository(owner: $owner, name: $name) {
            id
        }
    }' -f owner="$REPO_OWNER" -f name="$REPO_NAME" --jq '.data.repository.id' 2>/dev/null)

CATEGORIES=$(gh api graphql -f query='
    query($owner: String!, $name: String!) {
        repository(owner: $owner, name: $name) {
            discussionCategories(first: 20) {
                nodes {
                    id
                    name
                    emoji
                }
            }
        }
    }' -f owner="$REPO_OWNER" -f name="$REPO_NAME" --jq '.data.repository.discussionCategories.nodes[] | "\(.id)|\(.name)|\(.emoji)"' 2>/dev/null)

echo -e "${GREEN}✅ Repository connected${NC}"
echo ""

# Show available categories
echo -e "${BLUE}📋 Available Discussion Categories:${NC}"
category_list=()
i=1
while IFS='|' read -r cat_id cat_name cat_emoji; do
    if [ -n "$cat_name" ]; then
        echo "$i. $cat_emoji $cat_name"
        category_list+=("$cat_id|$cat_name|$cat_emoji")
        i=$((i + 1))
    fi
done <<< "$CATEGORIES"

echo ""

# Discussion type menu
echo -e "${BLUE}🎯 Select Discussion Type:${NC}"
echo "1. 🚀 Sprint Planning (with template)"
echo "2. 🔍 Requirements Analysis (with template)"
echo "3. 🛠️ Technical Discussion (with template)"
echo "4. 💡 Ideas & Enhancement (with template)"
echo "5. ❓ Q&A Discussion (with template)"
echo "6. 🗨️ Custom Discussion (blank)"
echo ""

# Force interactive input
if [ -e /dev/tty ]; then
    read -p "Select discussion type (1-6): " discussion_type < /dev/tty
else
    read -p "Select discussion type (1-6): " discussion_type
fi

# Validate input
if [[ ! "$discussion_type" =~ ^[1-6]$ ]]; then
    echo -e "${RED}❌ Invalid selection. Please enter a number between 1 and 6.${NC}"
    exit 1
fi

case $discussion_type in
    1)
        template_type="sprint"
        default_category="General"
        echo -e "${GREEN}✅ Selected: Sprint Planning${NC}"
        ;;
    2)
        template_type="requirements"
        default_category="General"
        echo -e "${GREEN}✅ Selected: Requirements Analysis${NC}"
        ;;
    3)
        template_type="technical"
        default_category="General"
        echo -e "${GREEN}✅ Selected: Technical Discussion${NC}"
        ;;
    4)
        template_type="ideas"
        default_category="Ideas"
        echo -e "${GREEN}✅ Selected: Ideas & Enhancement${NC}"
        ;;
    5)
        template_type="qa"
        default_category="Q&A"
        echo -e "${GREEN}✅ Selected: Q&A Discussion${NC}"
        ;;
    6)
        template_type="custom"
        default_category="General"
        echo -e "${GREEN}✅ Selected: Custom Discussion${NC}"
        ;;
esac

# Get discussion details
echo ""
echo -e "${BLUE}📝 Discussion Details:${NC}"

if [ "$template_type" = "sprint" ]; then
    if [ -e /dev/tty ]; then
        read -p "Sprint Number (e.g., 001, 032): " sprint_num < /dev/tty
    else
        read -p "Sprint Number (e.g., 001, 032): " sprint_num
    fi
    # Validate sprint number format
    if [[ ! "$sprint_num" =~ ^[0-9]{3}$ ]]; then
        echo -e "${YELLOW}⚠️  Sprint number should be 3 digits (e.g., 001, 032). Using as-is: $sprint_num${NC}"
    fi
    if [ -e /dev/tty ]; then
        read -p "Sprint Name (e.g., Authentication System): " sprint_name < /dev/tty
    else
        read -p "Sprint Name (e.g., Authentication System): " sprint_name
    fi
    if [ -z "$sprint_name" ]; then
        echo -e "${RED}❌ Sprint name cannot be empty${NC}"
        exit 1
    fi
    title="🚀 Sprint $sprint_num Planning - $sprint_name"
else
    if [ -e /dev/tty ]; then
        read -p "Discussion Title: " title < /dev/tty
    else
        read -p "Discussion Title: " title
    fi
    if [ -z "$title" ]; then
        echo -e "${RED}❌ Title cannot be empty${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ Title set: $title${NC}"

# Category selection
echo ""
echo -e "${BLUE}📂 Select Category:${NC}"
for i in "${!category_list[@]}"; do
    IFS='|' read -r cat_id cat_name cat_emoji <<< "${category_list[$i]}"
    echo "$((i+1)). $cat_emoji $cat_name"
done
echo ""
if [ -e /dev/tty ]; then
    read -p "Select category (1-${#category_list[@]}) or press Enter for default [$default_category]: " cat_selection < /dev/tty
else
    read -p "Select category (1-${#category_list[@]}) or press Enter for default [$default_category]: " cat_selection
fi

if [ -n "$cat_selection" ] && [ "$cat_selection" -ge 1 ] && [ "$cat_selection" -le ${#category_list[@]} ]; then
    selected_category_info="${category_list[$((cat_selection-1))]}"
    IFS='|' read -r selected_cat_id selected_cat_name selected_cat_emoji <<< "$selected_category_info"
    echo -e "${GREEN}✅ Category selected: $selected_cat_emoji $selected_cat_name${NC}"
else
    # Use default category
    selected_cat_id=$(echo "$CATEGORIES" | grep "|$default_category|" | cut -d'|' -f1 | head -1)
    selected_cat_name="$default_category"
    # Get emoji from categories
    selected_cat_emoji=$(echo "$CATEGORIES" | grep "|$default_category|" | cut -d'|' -f3 | head -1)
    if [ -z "$selected_cat_emoji" ]; then
        selected_cat_emoji="💬"
    fi
    echo -e "${GREEN}✅ Using default category: $selected_cat_emoji $selected_cat_name${NC}"
fi

# Validate category ID
if [ -z "$selected_cat_id" ] || [ "$selected_cat_id" = "null" ]; then
    echo -e "${RED}❌ Failed to determine discussion category${NC}"
    echo -e "${YELLOW}Available categories:${NC}"
    echo "$CATEGORIES"
    exit 1
fi

# Generate content based on template
case $template_type in
    "sprint")
        content="# 🚀 Sprint $sprint_num Planning - $sprint_name

## Sprint Overview
Planning discussion for **Sprint $sprint_num** - $sprint_name

## Sprint Details
- **Sprint ID**: \`$sprint_num\`
- **Duration**: [Start Date] - [End Date] (2 weeks)
- **Priority**: [High/Medium/Low]

## Sprint Goals
- [ ] Goal 1: [Description]
- [ ] Goal 2: [Description]
- [ ] Goal 3: [Description]

## Requirements to Include
- [ ] \`$sprint_num-01\` - [Requirement 1 description]
- [ ] \`$sprint_num-02\` - [Requirement 2 description]
- [ ] \`$sprint_num-03\` - [Requirement 3 description]

## Team Discussion Points
1. **Priority ordering** for requirements implementation
2. **Resource allocation** and assignment decisions
3. **Risk assessment** and mitigation strategies
4. **Testing strategy** and acceptance criteria

## Claudia Integration
This sprint will be managed using Claudia commands:
\`\`\`bash
# Create sprint
/claudia:sprint:create \"$sprint_num\"

# Define requirements
/claudia:requirements:define \"[description]\" --sprint $sprint_num

# Create implementation tickets
/claudia:tickets:create \"$sprint_num-XX\" --env dev
\`\`\`

## Team Coordination
Please share your:
- Availability for sprint duration
- Concerns or blockers
- Suggestions for implementation approach
- Resource needs

---
**Sprint Commander**: @neeraj-gs
**Status**: 🔄 Planning Phase
**Created**: $(date +%Y-%m-%d)
**Tags**: #claudia-sprint #sprint-$sprint_num #planning"
        ;;
    "requirements")
        content="# 🔍 Requirements Analysis: $title

## Context
[Describe the context and background for this requirements analysis]

## Current State Analysis
- ✅ [Current state item 1]
- ⚠️ [Current state item 2 - needs attention]
- ❌ [Current state item 3 - missing/broken]

## Requirements Under Analysis

### REQ-XXX-01: [Requirement Name]
**Status**: 🔄 In Analysis
**Description**: [Detailed requirement description]
**Acceptance Criteria**:
- [ ] Criteria 1
- [ ] Criteria 2
- [ ] Criteria 3

### REQ-XXX-02: [Requirement Name]
**Status**: 🔄 In Analysis
**Description**: [Detailed requirement description]
**Acceptance Criteria**:
- [ ] Criteria 1
- [ ] Criteria 2

## Architecture Decisions Needed
1. **Decision Point 1**: [Description and options]
2. **Decision Point 2**: [Description and options]
3. **Decision Point 3**: [Description and options]

## Success Criteria
- [ ] Success criteria 1
- [ ] Success criteria 2
- [ ] Success criteria 3

## Dependencies & Risks
- **Dependencies**: [List dependencies]
- **Risks**: [List potential risks]
- **Assumptions**: [List assumptions]

## Next Steps
1. [Next step 1]
2. [Next step 2]
3. [Next step 3]

---
**Analysis Lead**: @neeraj-gs
**Priority**: [High/Medium/Low]
**Created**: $(date +%Y-%m-%d)
**Tags**: #requirements-analysis #claudia-workflow"
        ;;
    "technical")
        content="# 🛠️ Technical Discussion: $title

## Overview
[Brief overview of the technical topic]

## Technical Context
[Provide technical background and context]

## Architecture/Implementation Details

### Current Approach
[Describe current implementation if applicable]

### Proposed Changes
[Describe proposed technical changes]

### Technical Considerations
1. **Performance Impact**: [Description]
2. **Security Implications**: [Description]
3. **Maintainability**: [Description]
4. **Scalability**: [Description]

## Implementation Options

### Option 1: [Option Name]
**Pros**:
- [Pro 1]
- [Pro 2]

**Cons**:
- [Con 1]
- [Con 2]

### Option 2: [Option Name]
**Pros**:
- [Pro 1]
- [Pro 2]

**Cons**:
- [Con 1]
- [Con 2]

## Code Examples
\`\`\`bash
# Example implementation
echo \"Technical implementation example\"
\`\`\`

## Testing Strategy
- [ ] Unit tests for [component]
- [ ] Integration tests for [workflow]
- [ ] Performance testing
- [ ] Security testing

## Discussion Points
1. [Technical question 1]
2. [Technical question 2]
3. [Technical question 3]

---
**Technical Lead**: @neeraj-gs
**Status**: Discussion
**Created**: $(date +%Y-%m-%d)
**Tags**: #technical-discussion #architecture #implementation"
        ;;
    "ideas")
        content="# 💡 Ideas & Enhancement: $title

## Idea Overview
[Brief description of the enhancement idea]

## Problem Statement
[What problem does this idea solve?]

## Proposed Solution
[Detailed description of the proposed solution]

## Benefits
- ✅ Benefit 1
- ✅ Benefit 2
- ✅ Benefit 3

## Implementation Approach
1. **Phase 1**: [Initial implementation steps]
2. **Phase 2**: [Advanced features]
3. **Phase 3**: [Future enhancements]

## Technical Requirements
- [Technical requirement 1]
- [Technical requirement 2]
- [Technical requirement 3]

## Resource Needs
- **Development Time**: [Estimate]
- **Team Members**: [Required skills]
- **Dependencies**: [External dependencies]

## Success Metrics
- [ ] Metric 1: [Specific measurable outcome]
- [ ] Metric 2: [Specific measurable outcome]
- [ ] Metric 3: [Specific measurable outcome]

## Alternatives Considered
1. **Alternative 1**: [Description and why not chosen]
2. **Alternative 2**: [Description and why not chosen]

## Discussion Questions
- [Question 1 for team feedback]
- [Question 2 for team feedback]
- [Question 3 for team feedback]

## Voting
Use GitHub reactions to vote:
- 👍 Support this idea
- 👎 Don't support
- 🚀 High priority
- 💡 Needs more discussion

---
**Idea Contributor**: @neeraj-gs
**Status**: Idea Collection
**Created**: $(date +%Y-%m-%d)
**Tags**: #enhancement-ideas #innovation #improvement"
        ;;
    "qa")
        content="# ❓ Q&A Discussion: $title

## Question
[State your question clearly]

## Context
[Provide context for the question - what are you trying to achieve?]

## What I've Tried
- [Attempt 1 and result]
- [Attempt 2 and result]
- [Attempt 3 and result]

## Expected Behavior
[Describe what you expect to happen]

## Actual Behavior
[Describe what actually happens]

## Environment
- **OS**: [Operating system]
- **Tools**: [Relevant tools and versions]
- **Repository**: Blog-Tube
- **Branch**: [Current branch]

## Relevant Code/Commands
\`\`\`bash
# Commands you ran
echo \"Example commands\"
\`\`\`

## Error Messages
\`\`\`
[Paste any error messages here]
\`\`\`

## Additional Information
[Any other relevant details]

---
**Question Asked By**: @neeraj-gs
**Created**: $(date +%Y-%m-%d)
**Tags**: #question #help-needed #claudia-workflow"
        ;;
    "custom")
        echo ""
        echo -e "${BLUE}✏️ Enter your discussion content:${NC}"
        echo "(Type your content, then press Ctrl+D when finished)"
        if [ -e /dev/tty ]; then
            content=$(cat < /dev/tty)
        else
            content=$(cat)
        fi
        if [ -z "$content" ]; then
            echo -e "${RED}❌ Content cannot be empty${NC}"
            exit 1
        fi
        ;;
esac

# Validate content was generated
if [ -z "$content" ]; then
    echo -e "${RED}❌ Failed to generate discussion content${NC}"
    exit 1
fi

# Confirmation
echo ""
echo -e "${BLUE}📋 Discussion Summary:${NC}"
echo -e "${CYAN}Title:${NC} $title"
echo -e "${CYAN}Category:${NC} $selected_cat_emoji $selected_cat_name"
echo -e "${CYAN}Type:${NC} $template_type"
echo ""
echo -e "${YELLOW}Content Preview (first 10 lines):${NC}"
echo "$content" | head -10
echo "..."
echo ""

if [ -e /dev/tty ]; then
    read -p "Create this discussion? (y/N): " confirm < /dev/tty
else
    read -p "Create this discussion? (y/N): " confirm
fi
if [[ ! $confirm =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⚠️  Discussion creation cancelled by user${NC}"
    exit 0
fi

echo -e "${GREEN}✅ Confirmed. Creating discussion...${NC}"

# Create the discussion
echo ""
echo -e "${BLUE}📝 Creating discussion via GitHub API...${NC}"

# Debug: Show what we're sending
echo -e "${CYAN}Repository ID: $REPO_ID${NC}"
echo -e "${CYAN}Category ID: $selected_cat_id${NC}"
echo -e "${CYAN}Title: $title${NC}"

# Create discussion and capture both URL and any errors
DISCUSSION_RESPONSE=$(gh api graphql -f query='
    mutation($repositoryId: ID!, $categoryId: ID!, $title: String!, $body: String!) {
        createDiscussion(input: {
            repositoryId: $repositoryId
            categoryId: $categoryId
            title: $title
            body: $body
        }) {
            discussion {
                url
                number
                id
            }
        }
    }' -f repositoryId="$REPO_ID" -f categoryId="$selected_cat_id" -f title="$title" -f body="$content" 2>&1)

# Check if the response contains errors
if echo "$DISCUSSION_RESPONSE" | grep -q "errors"; then
    echo -e "${RED}❌ Failed to create discussion${NC}"
    echo -e "${YELLOW}Error details:${NC}"
    echo "$DISCUSSION_RESPONSE" | grep -A 10 "errors"
    echo ""
    echo -e "${YELLOW}Troubleshooting:${NC}"
    echo "1. Check that GitHub Discussions are enabled for this repository"
    echo "2. Verify you have write permissions to the repository"
    echo "3. Ensure the category ID is valid"
    echo "4. Check your GitHub authentication: gh auth status"
    exit 1
fi

# Extract discussion URL
DISCUSSION_URL=$(echo "$DISCUSSION_RESPONSE" | jq -r '.data.createDiscussion.discussion.url' 2>/dev/null)
DISCUSSION_NUMBER=$(echo "$DISCUSSION_RESPONSE" | jq -r '.data.createDiscussion.discussion.number' 2>/dev/null)

if [ -n "$DISCUSSION_URL" ] && [ "$DISCUSSION_URL" != "null" ]; then
    echo ""
    echo -e "${GREEN}✅ Discussion created successfully!${NC}"
    echo ""
    echo -e "${CYAN}   📋 Title: $title${NC}"
    echo -e "${CYAN}   🔢 Number: #$DISCUSSION_NUMBER${NC}"
    echo -e "${CYAN}   🔗 URL: $DISCUSSION_URL${NC}"
    echo ""
    echo -e "${BLUE}🎯 Next Steps:${NC}"
    echo "   1. Visit the discussion URL to view it"
    echo "   2. Pin the discussion if it's important"
    echo "   3. Share with team members for collaboration"
    echo "   4. Add labels or reactions as needed"
    echo ""
    echo -e "${GREEN}🎉 Discussion '$title' is now live!${NC}"
    echo ""

    # Open in browser (optional)
    if [ -e /dev/tty ]; then
        read -p "Open discussion in browser? (y/N): " open_browser < /dev/tty
    else
        read -p "Open discussion in browser? (y/N): " open_browser
    fi
    if [[ $open_browser =~ ^[Yy]$ ]]; then
        if command -v open &> /dev/null; then
            open "$DISCUSSION_URL"
        elif command -v xdg-open &> /dev/null; then
            xdg-open "$DISCUSSION_URL"
        else
            echo -e "${YELLOW}⚠️  Cannot open browser automatically. Please visit: $DISCUSSION_URL${NC}"
        fi
    fi
else
    echo -e "${RED}❌ Failed to create discussion${NC}"
    echo -e "${YELLOW}Response received:${NC}"
    echo "$DISCUSSION_RESPONSE"
    echo ""
    echo "Check your GitHub permissions and repository settings"
    exit 1
fi
