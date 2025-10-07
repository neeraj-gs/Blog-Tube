#!/bin/bash
# Create Initial Discussions Script
# Creates sample discussions for testing GitHub Discussions functionality

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

echo -e "${BLUE}💬 Creating Initial GitHub Discussions${NC}"
echo "===================================="

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

# Get repository ID
echo -e "${BLUE}🔍 Getting repository information...${NC}"
REPO_ID=$(gh api graphql -f query='
    query($owner: String!, $name: String!) {
        repository(owner: $owner, name: $name) {
            id
        }
    }' -f owner="$REPO_OWNER" -f name="$REPO_NAME" --jq '.data.repository.id' 2>/dev/null)

if [ -z "$REPO_ID" ] || [ "$REPO_ID" = "null" ]; then
    echo -e "${RED}❌ Failed to get repository ID${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Repository ID: $REPO_ID${NC}"

# Get discussion categories
echo -e "${BLUE}🔍 Getting discussion categories...${NC}"
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

    # Get category ID
    CATEGORY_ID=$(echo "$CATEGORIES" | grep "|$category_name|" | cut -d'|' -f1)

    if [ -z "$CATEGORY_ID" ]; then
        echo -e "${RED}❌ Category '$category_name' not found${NC}"
        return 1
    fi

    # Create discussion
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
        return 0
    else
        echo -e "${RED}❌ Failed to create: $title${NC}"
        return 1
    fi
}

echo ""
echo -e "${BLUE}🚀 Creating sample discussions...${NC}"
echo ""

created_count=0

# Discussion 1: Sprint Planning
SPRINT_BODY='# Sprint 032 Planning Discussion

## Sprint Overview
Planning discussion for **Sprint 032** - Blog-Tube Enhancement Phase

## Sprint Goals
- Implement Phase 1 Claudia workflow completion
- Enhance GitHub Projects integration
- Complete discussion system setup
- Test emergency bypass procedures

## Sprint Duration
- **Start Date**: September 22, 2025
- **End Date**: October 6, 2025 (2 weeks)
- **Sprint ID**: `032`

## Requirements to Include
- [ ] `032-01` - GitHub Projects repository-level integration
- [ ] `032-02` - GitHub Discussions category configuration
- [ ] `032-03` - Emergency bypass testing and documentation
- [ ] `032-04` - Pre-commit hooks validation enhancement

## Discussion Points
1. **Priority ordering** for requirements implementation
2. **Resource allocation** and assignment decisions
3. **Risk assessment** for emergency procedures
4. **Testing strategy** for workflow enforcement

## Claudia Integration
This sprint will be managed using Claudia commands:
- `/claudia:sprint:create "032"`
- `/claudia:requirements:define` for each requirement
- `/claudia:tickets:create` for implementation tasks

## Team Coordination
Please share your availability, concerns, and suggestions for this sprint.

---
**Sprint Commander**: @neeraj-gs
**Created via**: Claudia Automation System
**Tags**: `claudia:sprint`, `sprint:032`, `phase1:completion`'

if create_discussion "🚀 Sprint 032 Planning - Blog-Tube Enhancement Phase" "$SPRINT_BODY" "Sprint Planning"; then
    created_count=$((created_count + 1))
fi
echo ""

# Discussion 2: Requirements Analysis
REQUIREMENTS_BODY='# Requirements Analysis: GitHub Integration Enhancement

## Context
Analyzing requirements for complete GitHub integration as part of Phase 1 implementation.

## Current State Analysis
- ✅ GitHub Projects created and linked to repository
- ✅ GitHub Discussions enabled with custom categories
- ✅ Branch protection rules implemented
- ✅ Emergency bypass procedures configured
- ⚠️ Pre-commit hooks need refinement
- ⚠️ GitHub Actions workflow needs repository testing

## Requirements Under Analysis

### REQ-032-01: Repository-Level Project Management
**Status**: ✅ Complete
**Description**: Ensure all Claudia projects appear under repository Projects tab
**Implementation**: Successfully linked 4 projects using GraphQL API

### REQ-032-02: Discussion System Integration
**Status**: ✅ Complete
**Description**: Enable GitHub Discussions with Claudia-specific categories
**Implementation**: 9 categories configured, templates ready

### REQ-032-03: Workflow Enforcement
**Status**: 🔄 In Progress
**Description**: Mandatory Claudia workflow compliance
**Components**:
- Branch protection: ✅ Active
- Pre-commit hooks: ✅ Active
- GitHub Actions: ⚠️ Needs repository testing

### REQ-032-04: Emergency Procedures
**Status**: ✅ Complete
**Description**: Emergency bypass for critical incidents
**Implementation**: Script-based bypass with audit trail

## Architecture Decisions Needed

1. **Notification Strategy**: How should workflow violations be communicated?
2. **Audit Integration**: Where should compliance logs be stored?
3. **Team Training**: What documentation and training materials are needed?
4. **Rollback Procedures**: What happens if enforcement needs to be temporarily disabled?

## Success Criteria
- [ ] 100% commits go through Claudia workflow
- [ ] Zero direct pushes to main branch without bypass
- [ ] Complete audit trail for all actions
- [ ] Team can use emergency procedures when needed

## Next Steps
1. **Finalize workflow enforcement** testing
2. **Create team training materials**
3. **Test emergency procedures** end-to-end
4. **Document rollback procedures**

---
**Analysis Lead**: @neeraj-gs
**Related Sprint**: Sprint 032
**Priority**: High
**Tags**: `requirements:analysis`, `phase1:implementation`, `github:integration`'

if create_discussion "🔍 Requirements Analysis: GitHub Integration Enhancement" "$REQUIREMENTS_BODY" "Requirements Analysis"; then
    created_count=$((created_count + 1))
fi
echo ""

# Discussion 3: Technical Implementation
TECHNICAL_BODY='# Technical Implementation: Claudia Workflow Enforcement Architecture

## Overview
Technical discussion on the architecture and implementation details of the Claudia mandatory workflow enforcement system.

## System Architecture

### Components Overview
```
┌─────────────────────────────────────────────────────────────┐
│                  Claudia Workflow System                    │
├─────────────────────────────────────────────────────────────┤
│ GitHub Projects  │ GitHub Issues   │ GitHub Discussions     │
│ (4 Projects)     │ (Templates)     │ (9 Categories)         │
├─────────────────────────────────────────────────────────────┤
│ Branch Protection│ Pre-commit Hooks│ GitHub Actions         │
│ (main branch)    │ (validation)    │ (enforcement)          │
├─────────────────────────────────────────────────────────────┤
│ Emergency Bypass │ Audit Trail     │ Team Notifications     │
│ (script-based)   │ (JSONL logs)    │ (automated)           │
└─────────────────────────────────────────────────────────────┘
```

### Implementation Details

#### 1. **Pre-commit Hooks** (`/.git/hooks/pre-commit`)
- **Validation**: Claudia command compliance checking
- **Emergency Bypass**: File-based bypass mechanism
- **Audit Logging**: JSON log entries for all actions
- **User Guidance**: Clear error messages with next steps

#### 2. **GitHub Actions Workflow**
- **Triggers**: Push, PR events on main/develop branches
- **Validation Jobs**: 4-stage validation process
- **Emergency Detection**: Automatic bypass detection
- **Status Reporting**: PR comments and status checks

#### 3. **Emergency Bypass System**
```bash
# Create bypass
./.github/scripts/create-emergency-bypass.sh

# Bypass file structure
.github/emergency-bypass.active:
  INCIDENT_ID=xxx
  COMMANDER=xxx
  REASON=xxx
  EXPIRES=timestamp
  AUTHORIZED=true
```

## Technical Challenges & Solutions

### Challenge 1: Repository vs User-Level Projects
**Problem**: GitHub Projects v2 created at user level, need repository visibility
**Solution**: GraphQL API `linkProjectV2ToRepository` mutation to establish connection

### Challenge 2: Pre-commit Hook Performance
**Problem**: Validation might slow down commits
**Solution**: Efficient validation with caching and bypass mechanisms

### Challenge 3: Emergency Bypass Security
**Problem**: Bypass mechanism could be abused
**Solution**: Time-limited bypass with required authorization and audit trail

## Code Quality & Testing

### Static Analysis
- **ESLint**: Frontend code quality
- **TypeScript**: Type checking for both frontend/backend
- **Detect-secrets**: Prevent credential commits
- **Hadolint**: Docker file validation

### Testing Strategy
- **Unit Tests**: Core validation logic
- **Integration Tests**: End-to-end workflow testing
- **Manual Testing**: Emergency procedures verification

## Performance Considerations
- **Hook Execution Time**: < 5 seconds for validation
- **API Rate Limits**: Efficient GitHub API usage
- **Caching**: Local validation caches where appropriate
- **Fallback Mechanisms**: Graceful degradation on API failures

## Security Considerations
- **Secrets Management**: No credentials in repository
- **Bypass Logging**: Complete audit trail for bypasses
- **Access Control**: CODEOWNERS for critical files
- **Incident Response**: Automated logging and notification

## Monitoring & Observability
- **Audit Logs**: `.claude-shared/project-management/data/`
- **GitHub Actions**: Workflow run history and status
- **Discussion Tracking**: Team coordination visibility
- **Emergency Metrics**: Bypass usage statistics

## Future Enhancements
1. **Dashboard**: Web interface for workflow metrics
2. **Slack Integration**: Real-time notifications
3. **Advanced Analytics**: Team productivity insights
4. **API Endpoints**: Programmatic access to workflow data

---
**Technical Lead**: @neeraj-gs
**Architecture Review**: Phase 1 Implementation
**Status**: Implementation Complete, Testing in Progress
**Tags**: `technical:architecture`, `claudia:implementation`, `workflow:enforcement`'

if create_discussion "🛠️ Technical Implementation: Claudia Workflow Enforcement Architecture" "$TECHNICAL_BODY" "Technical Discussion"; then
    created_count=$((created_count + 1))
fi
echo ""

# Summary
echo -e "${BLUE}📊 Summary:${NC}"
echo -e "${GREEN}✅ Successfully created: $created_count/3 discussions${NC}"

if [ $created_count -gt 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 Initial Discussions Created Successfully!${NC}"
    echo ""
    echo -e "${BLUE}🌐 Access your discussions:${NC}"
    echo "• Repository Discussions: https://github.com/$REPO_OWNER/$REPO_NAME/discussions"
    echo "• Sprint Planning: Filter by 'Sprint Planning' category"
    echo "• Requirements Analysis: Filter by 'Requirements Analysis' category"
    echo "• Technical Discussion: Filter by 'Technical Discussion' category"
    echo ""
    echo -e "${CYAN}🔗 Created Discussions:${NC}"
    echo "1. 🚀 Sprint 032 Planning - Blog-Tube Enhancement Phase"
    echo "2. 🔍 Requirements Analysis: GitHub Integration Enhancement"
    echo "3. 🛠️ Technical Implementation: Claudia Workflow Enforcement Architecture"
    echo ""
    echo -e "${GREEN}✅ GitHub Discussions are now active with Claudia content!${NC}"
else
    echo ""
    echo -e "${YELLOW}⚠️ No discussions were created${NC}"
    echo "Check authentication and repository permissions"
fi

echo ""
echo -e "${BLUE}🎯 Next Steps:${NC}"
echo "1. Visit repository discussions to review content"
echo "2. Test discussion interaction (comments, reactions)"
echo "3. Create additional discussions as needed"
echo "4. Configure team notification preferences"
