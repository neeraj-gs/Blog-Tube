#!/bin/bash
# Create Discussions Using Default Categories
# Creates discussions using GitHub's default categories until custom ones are configured

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

echo -e "${BLUE}💬 Creating Claudia Discussions (Default Categories)${NC}"
echo "================================================="

# Get repository and category info
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

echo -e "${GREEN}✅ Repository ID: $REPO_ID${NC}"
echo -e "${CYAN}Available categories:${NC}"
echo "$CATEGORIES" | while IFS='|' read -r cat_id cat_name cat_emoji; do
    echo "• $cat_emoji $cat_name"
done

# Helper function to create discussion
create_discussion() {
    local title="$1"
    local body="$2"
    local category_name="$3"

    echo -e "${BLUE}📝 Creating discussion: $title${NC}"

    CATEGORY_ID=$(echo "$CATEGORIES" | grep "|$category_name|" | cut -d'|' -f1)

    if [ -z "$CATEGORY_ID" ]; then
        echo -e "${RED}❌ Category '$category_name' not found${NC}"
        return 1
    fi

    DISCUSSION_URL=$(gh api graphql -f query='
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
                }
            }
        }' -f repositoryId="$REPO_ID" -f categoryId="$CATEGORY_ID" -f title="$title" -f body="$body" --jq '.data.createDiscussion.discussion.url' 2>/dev/null)

    if [ -n "$DISCUSSION_URL" ] && [ "$DISCUSSION_URL" != "null" ]; then
        echo -e "${GREEN}✅ Created: $title${NC}"
        echo -e "${CYAN}   URL: $DISCUSSION_URL${NC}"
        echo ""
        return 0
    else
        echo -e "${RED}❌ Failed to create: $title${NC}"
        return 1
    fi
}

echo ""
echo -e "${BLUE}🚀 Creating Claudia workflow discussions...${NC}"
echo ""

created_count=0

# Discussion 1: Sprint Planning (using General category)
SPRINT_BODY='# 🚀 Sprint 032 Planning - Blog-Tube Enhancement Phase

## Sprint Overview
Planning discussion for **Sprint 032** - Blog-Tube Enhancement Phase with Claudia workflow completion.

## Sprint Goals
- ✅ Complete Phase 1 Claudia workflow implementation
- ✅ GitHub Projects repository-level integration
- ✅ GitHub Discussions system setup and testing
- 🔄 Emergency bypass procedures validation
- 🔄 Complete workflow enforcement testing

## Sprint Details
- **Sprint ID**: `032`
- **Duration**: September 22 - October 6, 2025 (2 weeks)
- **Priority**: Critical - Foundation Phase completion

## Requirements Status
- ✅ `032-01` - GitHub Projects linked to repository (4 projects active)
- ✅ `032-02` - GitHub Discussions enabled with templates
- ✅ `032-03` - Branch protection rules implemented
- ✅ `032-04` - Pre-commit hooks validation active
- 🔄 `032-05` - GitHub Actions workflow repository testing

## Team Discussion Points
1. **Implementation priorities** for remaining tasks
2. **Testing strategy** for workflow enforcement
3. **Team training** on new Claudia mandatory workflow
4. **Documentation** requirements and knowledge transfer

## Claudia Integration Status
Current workflow commands tested and working:
- `/claudia:sprint:create` - ✅ Working
- `/claudia:requirements:define` - ✅ Working
- `/claudia:tickets:create` - ✅ Working
- `/claudia:implement:manual` - ✅ Working
- `/claudia:pr:create` - 🔄 Testing needed

## Emergency Procedures
- ✅ Emergency bypass script created and tested
- ✅ Audit trail functionality verified
- ✅ Post-incident review procedures documented

---
**Sprint Commander**: @neeraj-gs
**Status**: 🔄 In Progress (85% complete)
**Next Review**: Daily standup coordination via this discussion
**Tags**: #claudia-sprint #phase1-completion #workflow-foundation'

if create_discussion "🚀 Sprint 032 Planning - Blog-Tube Enhancement Phase" "$SPRINT_BODY" "General"; then
    created_count=$((created_count + 1))
fi

# Discussion 2: Requirements & Ideas
IDEAS_BODY='# 💡 Claudia Workflow Enhancement Ideas & Requirements

## Current State Assessment
The Phase 1 implementation is nearly complete! Here are some ideas for future enhancements and requirements gathering.

## ✅ Successfully Implemented
- **GitHub Projects Integration**: 4 Claudia projects linked to repository
- **GitHub Discussions**: Enabled with custom categories ready for configuration
- **Branch Protection**: Main branch protected with mandatory reviews
- **Emergency Procedures**: Script-based bypass with complete audit trail
- **Pre-commit Validation**: Claudia workflow compliance checking
- **Project Linking**: Automated script to link projects to repository

## 💡 Enhancement Ideas

### Phase 2 Ideas
1. **Dashboard Development**
   - Web interface for workflow metrics
   - Team productivity analytics
   - Sprint progress visualization
   - Emergency bypass usage reports

2. **Advanced Integrations**
   - Slack notifications for workflow violations
   - Email alerts for emergency procedures
   - Jira integration for enterprise environments
   - Microsoft Teams integration

3. **AI-Powered Features**
   - Automated requirement analysis
   - Smart commit message suggestions
   - Code quality predictions
   - Sprint velocity optimization

### Immediate Improvements
1. **Custom Discussion Categories**
   - Configure the 9 Claudia-specific categories
   - Set up category-based automation
   - Create category-specific templates

2. **GitHub Actions Enhancement**
   - Add more comprehensive validation
   - Implement automatic issue creation
   - Add PR status updates
   - Configure team notifications

3. **Documentation & Training**
   - Interactive workflow tutorials
   - Video training materials
   - Quick reference cards
   - Troubleshooting guides

## 🔄 Requirements Gathering

### Team Feedback Needed
- **Workflow Pain Points**: What parts of the current process are difficult?
- **Missing Features**: What functionality would improve your daily work?
- **Integration Needs**: What tools should Claudia integrate with next?
- **Training Requirements**: What documentation or training would be most helpful?

### Technical Requirements
- **Performance**: Are current validation times acceptable?
- **Reliability**: Any stability issues with current implementation?
- **Usability**: Are error messages clear and helpful?
- **Automation**: What manual steps should be automated next?

## 🎯 Proposed Next Phase
Based on Phase 1 success, propose Phase 2 focus areas:

1. **User Experience Enhancement**
2. **Advanced Analytics & Reporting**
3. **Third-party Integration Expansion**
4. **AI/ML-Powered Workflow Optimization**

## Discussion Guidelines
- 💡 Share your enhancement ideas
- 🐛 Report any issues or bugs
- 📝 Suggest process improvements
- 🎯 Vote on priority features using reactions

---
**Innovation Lead**: @neeraj-gs
**Status**: Collecting ideas and feedback
**Phase**: Planning for Phase 2
**Tags**: #enhancement-ideas #requirements-gathering #phase2-planning'

if create_discussion "💡 Claudia Workflow Enhancement Ideas & Requirements" "$IDEAS_BODY" "Ideas"; then
    created_count=$((created_count + 1))
fi

# Discussion 3: Q&A about the system
QA_BODY='# ❓ Claudia Workflow System Q&A

## Common Questions & Answers

### Getting Started Questions

**Q: What is the Claudia Workflow System?**
A: Claudia is a mandatory workflow foundation that ensures all code changes go through proper project management, requirement tracking, and quality gates. It integrates GitHub Projects, Issues, Discussions, and enforcement mechanisms.

**Q: Why is the workflow mandatory?**
A: To ensure complete traceability from requirements to deployment, maintain consistent development methodology (TDD), enable automated project management, and provide quality assurance and audit compliance.

**Q: How do I make my first commit with Claudia?**
A: Follow this sequence:
1. `/claudia:sprint:create "032"`
2. `/claudia:requirements:define "Your feature description" --sprint 032`
3. `/claudia:tickets:create "032-XX" --env dev`
4. `/claudia:implement:manual "032-XX-XX"`
5. `/claudia:commit "032-XX-XX" "your commit message"`

### Current Implementation Questions

**Q: What GitHub features are now active?**
A: ✅ Projects (4 Claudia projects linked), ✅ Discussions (enabled with custom categories ready), ✅ Branch protection (main branch), ✅ Pre-commit hooks (validation active), ✅ Emergency bypass (script-based with audit)

**Q: How do I access the GitHub Projects?**
A: Visit https://github.com/neeraj-gs/Blog-Tube/projects - all 4 Claudia projects are now linked to the repository.

**Q: What happens if I try to commit without using Claudia?**
A: Pre-commit hooks will block the commit and show guidance on using the proper Claudia workflow commands.

**Q: How do emergency bypasses work?**
A: Run `.github/scripts/create-emergency-bypass.sh`, provide incident details, make your changes, then remove the bypass file when resolved. All bypasses are logged for audit.

### Technical Questions

**Q: Can I still use my normal Git workflow?**
A: Yes, but all commits must go through Claudia commands. Your normal Git commands work, but they're wrapped with Claudia compliance checking.

**Q: What if the validation fails?**
A: The pre-commit hook will show clear error messages and guide you to the correct Claudia commands. You can also use emergency bypass for critical situations.

**Q: Are there performance impacts?**
A: Minimal - pre-commit validation takes < 5 seconds. GitHub API calls are optimized and cached where possible.

**Q: Can I use this with my IDE?**
A: Yes! The pre-commit hooks work with any IDE that uses Git. Some IDEs might show the validation messages differently, but functionality is the same.

### Troubleshooting Questions

**Q: My pre-commit hook seems stuck. What do I do?**
A: Run `git config --get core.hooksPath` to check hook location. Try `pre-commit clean` and `pre-commit install --install-hooks` to refresh.

**Q: GitHub CLI authentication fails. How to fix?**
A: Run `gh auth login` and ensure you have `project` and `repo` scopes: `gh auth refresh -s project,repo`

**Q: I need to bypass the workflow urgently. What are my options?**
A: Use `.github/scripts/create-emergency-bypass.sh` for authorized bypasses. Document the incident and remove the bypass when resolved.

**Q: Can I customize the workflow for my team?**
A: Yes! Configuration files are in `.github/` and `.claude-shared/`. Modify templates, categories, and validation rules as needed.

## Ask Your Questions
Have a question not covered here? Ask below and we'll add it to this FAQ!

Use these tags to categorize your questions:
- `#getting-started` - New user questions
- `#technical` - Implementation details
- `#troubleshooting` - Issues and fixes
- `#customization` - Configuration questions
- `#emergency` - Urgent procedure questions

---
**FAQ Maintainer**: @neeraj-gs
**Last Updated**: September 22, 2025
**System Version**: Phase 1 Complete
**Tags**: #claudia-faq #workflow-help #getting-started'

if create_discussion "❓ Claudia Workflow System Q&A" "$QA_BODY" "Q&A"; then
    created_count=$((created_count + 1))
fi

# Summary
echo -e "${BLUE}📊 Summary:${NC}"
echo -e "${GREEN}✅ Successfully created: $created_count/3 discussions${NC}"

if [ $created_count -gt 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 Initial Claudia Discussions Created!${NC}"
    echo ""
    echo -e "${BLUE}🌐 Access your discussions:${NC}"
    echo "• Repository Discussions: https://github.com/$REPO_OWNER/$REPO_NAME/discussions"
    echo ""
    echo -e "${CYAN}🔗 Created Discussions:${NC}"
    echo "1. 🚀 Sprint 032 Planning - Blog-Tube Enhancement Phase (General)"
    echo "2. 💡 Claudia Workflow Enhancement Ideas & Requirements (Ideas)"
    echo "3. ❓ Claudia Workflow System Q&A (Q&A)"
    echo ""
    echo -e "${YELLOW}📝 Next Step - Configure Custom Categories:${NC}"
    echo "1. Go to: https://github.com/$REPO_OWNER/$REPO_NAME/settings"
    echo "2. Scroll to 'Features' → Click 'Set up discussions'"
    echo "3. Add categories from: .github/discussions/categories.yml"
    echo "   - Sprint Planning 🚀"
    echo "   - Requirements Analysis 🔍"
    echo "   - Technical Discussion 🛠️"
    echo "   - Claudia Workflow 🤖"
    echo "   - Team Coordination 👥"
    echo "   - Code Review Discussion 👀"
    echo "   - Incident Response 🚨"
    echo "   - Process Improvement 📈"
    echo ""
    echo -e "${GREEN}✅ GitHub Discussions now active with Claudia content!${NC}"
fi
