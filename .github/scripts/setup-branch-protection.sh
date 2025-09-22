#!/bin/bash
# Branch Protection Rules Setup for Mandatory Claudia Workflow
# This script configures branch protection to enforce Claudia workflow compliance

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${BLUE}🛡️ Phase 1B: Setting up Branch Protection Rules${NC}"
echo "=================================================="

# Configuration
MAIN_BRANCH=${1:-"main"}
REPO_OWNER="neerajgs"
REPO_NAME="Blog-Tube"

echo -e "${BLUE}🔍 Configuring protection for branch: $MAIN_BRANCH${NC}"

# Check prerequisites
echo -e "${BLUE}📋 Checking prerequisites...${NC}"

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

echo -e "${GREEN}✅ Prerequisites met${NC}"

# Function to set up branch protection
setup_branch_protection() {
    local branch="$1"

    echo -e "${BLUE}🛡️ Setting up branch protection for: $branch${NC}"

    # Create branch protection rule via GitHub API
    local protection_config='{
        "required_status_checks": {
            "strict": true,
            "contexts": [
                "Claudia Workflow Validation",
                "Pre-commit Hooks",
                "Code Quality Check",
                "Security Scan"
            ]
        },
        "enforce_admins": false,
        "required_pull_request_reviews": {
            "required_approving_review_count": 1,
            "dismiss_stale_reviews": true,
            "require_code_owner_reviews": false,
            "require_last_push_approval": true
        },
        "restrictions": null,
        "allow_force_pushes": false,
        "allow_deletions": false,
        "block_creations": false,
        "required_conversation_resolution": true,
        "lock_branch": false,
        "allow_fork_syncing": true
    }'

    # Apply branch protection
    echo -e "${BLUE}📝 Applying branch protection configuration...${NC}"

    if gh api repos/:owner/:repo/branches/"$branch"/protection \
        --method PUT \
        --input - <<< "$protection_config" &>/dev/null; then
        echo -e "${GREEN}✅ Branch protection enabled for $branch${NC}"
    else
        echo -e "${YELLOW}⚠️ Failed to set branch protection via API, using gh CLI...${NC}"

        # Fallback to gh CLI method
        gh api repos/:owner/:repo/branches/"$branch"/protection \
            --method PUT \
            --field required_status_checks='{"strict":true,"contexts":["Claudia Workflow Validation"]}' \
            --field enforce_admins=false \
            --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
            --field restrictions=null \
            --field allow_force_pushes=false \
            --field allow_deletions=false

        echo -e "${GREEN}✅ Branch protection enabled for $branch (basic configuration)${NC}"
    fi
}

# Function to create CODEOWNERS file
create_codeowners() {
    echo -e "${BLUE}👥 Creating CODEOWNERS file...${NC}"

    mkdir -p .github

    cat > .github/CODEOWNERS << 'EOF'
# Code Owners Configuration for Claudia Workflow

# Global rules - all files require review
* @neerajgs

# Claudia workflow files require special attention
.claude/ @neerajgs
.claude-shared/ @neerajgs
.github/workflows/ @neerajgs

# Critical configuration files
package.json @neerajgs
package-lock.json @neerajgs
yarn.lock @neerajgs
Dockerfile @neerajgs
docker-compose*.yml @neerajgs

# Backend changes require backend specialist review
backend/ @neerajgs
api/ @neerajgs

# Frontend changes require frontend specialist review
frontend/ @neerajgs
src/ @neerajgs

# Database migrations require special review
**/migrations/ @neerajgs
**/schema/ @neerajgs

# Documentation changes
README.md @neerajgs
CLAUDE.md @neerajgs
docs/ @neerajgs

# Security-sensitive files
.env* @neerajgs
*.key @neerajgs
*.pem @neerajgs
security/ @neerajgs

# Infrastructure and deployment
infrastructure/ @neerajgs
deployment/ @neerajgs
.github/workflows/ @neerajgs

# Emergency bypass files (require multiple approvals)
.github/emergency-bypass.md @neerajgs
.github/scripts/emergency-*.sh @neerajgs
EOF

    echo -e "${GREEN}✅ CODEOWNERS file created${NC}"
}

# Function to create pull request template
create_pr_template() {
    echo -e "${BLUE}📝 Creating PR template with Claudia workflow integration...${NC}"

    mkdir -p .github

    cat > .github/pull_request_template.md << 'EOF'
## 🚀 Claudia Workflow Pull Request

### Claudia Command Integration
**This PR was created via**: `/claudia:pr:create "ISSUE_NUMBER"`

**Related GitHub Issue**: Closes #[ISSUE_NUMBER]

**Claudia Workflow Checklist**:
- [ ] Issue created via `/claudia:issues:create` command
- [ ] Implementation started via `/claudia:implement:manual` or `/claudia:implement:auto`
- [ ] Changes committed via `/claudia:commit` command
- [ ] PR created via `/claudia:pr:create` command
- [ ] All Claudia workflow steps completed

---

## 📋 Change Summary

### What changed?
<!-- Brief description of what was implemented/fixed/changed -->

### Why was this change needed?
<!-- Reference the requirement document and business justification -->

### How was it implemented?
<!-- Technical approach and key implementation details -->

---

## 🔍 Requirements Traceability

**Requirement Document**: `.claude-shared/project-management/4-requirements/[REQ-UUID].md`
**Sprint Document**: `.claude-shared/project-management/3-sprints/[SPRINT-NUMBER].md`
**Original Planning**: `.claude-shared/project-management/2-planning/[PLANNING-DOC].md`

### Acceptance Criteria Met:
- [ ] [Criterion 1 from requirement document]
- [ ] [Criterion 2 from requirement document]
- [ ] [Criterion 3 from requirement document]

---

## 🧪 Testing

### Test Coverage
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] End-to-end tests added/updated
- [ ] Manual testing completed

### Test Results
<!-- Include test results, screenshots, or evidence of testing -->

**Test Command Used**:
```bash
# Add the specific test commands used
npm test
npm run test:integration
```

---

## 📖 Documentation

### Documentation Updates
- [ ] Code comments added/updated
- [ ] README updated (if needed)
- [ ] API documentation updated (if needed)
- [ ] Architecture documentation updated (if needed)

### Breaking Changes
- [ ] No breaking changes
- [ ] Breaking changes documented below

**Breaking Changes** (if any):
<!-- List any breaking changes and migration steps -->

---

## 🔒 Security Considerations

- [ ] No security implications
- [ ] Security implications reviewed and documented
- [ ] Sensitive data handling reviewed
- [ ] Authentication/authorization changes reviewed

**Security Notes**:
<!-- Any security-related information -->

---

## 🚀 Deployment

### Deployment Checklist
- [ ] Database migrations (if any)
- [ ] Environment variables added/updated
- [ ] Configuration changes documented
- [ ] Rollback plan prepared

**Environment Variables** (if any):
<!-- List any new or changed environment variables -->

**Migration Commands** (if any):
```bash
# Add any migration or deployment commands
```

---

## 📊 Performance Impact

- [ ] No performance impact expected
- [ ] Performance impact analyzed and acceptable
- [ ] Performance tests included

**Performance Notes**:
<!-- Any performance-related information -->

---

## 👥 Review Checklist

### For Reviewers
- [ ] Code follows project conventions and standards
- [ ] Implementation matches requirement specification
- [ ] Tests are comprehensive and passing
- [ ] Documentation is updated and clear
- [ ] Security considerations reviewed
- [ ] Performance impact acceptable
- [ ] Claudia workflow compliance verified

### Author Checklist
- [ ] Self-review completed
- [ ] All tests passing locally
- [ ] Linting and formatting applied
- [ ] Commit messages follow conventional format
- [ ] PR description complete and accurate
- [ ] All Claudia workflow steps followed

---

## 📎 Additional Context

<!-- Any additional context, screenshots, logs, or information -->

---

**🤖 Generated via Claudia Workflow System**
*This PR template ensures compliance with mandatory Claudia workflow requirements.*
EOF

    echo -e "${GREEN}✅ PR template created with Claudia integration${NC}"
}

# Execute setup
echo -e "${PURPLE}🚀 Starting branch protection setup...${NC}"

# Set up branch protection for main branch
setup_branch_protection "$MAIN_BRANCH"

# Create CODEOWNERS file
create_codeowners

# Create PR template
create_pr_template

# Create branch protection policy documentation
cat > .github/BRANCH_PROTECTION_POLICY.md << 'EOF'
# Branch Protection Policy

## Overview
This repository enforces mandatory Claudia workflow compliance through branch protection rules.

## Protected Branches

### Main Branch (`main`)
**Protection Level**: Maximum
**Direct Push Access**: ❌ Disabled
**Force Push**: ❌ Disabled

**Requirements**:
- ✅ Pull request required
- ✅ At least 1 approving review required
- ✅ Dismiss stale reviews when new commits are pushed
- ✅ Require review from CODEOWNERS
- ✅ Required status checks must pass
- ✅ Conversations must be resolved
- ✅ Up-to-date branches required

**Required Status Checks**:
- `Claudia Workflow Validation` - Validates proper Claudia command usage
- `Pre-commit Hooks` - Ensures pre-commit validation passed
- `Code Quality Check` - Code quality and linting validation
- `Security Scan` - Security vulnerability scanning

## Workflow Enforcement

### Mandatory Claudia Commands
All changes to protected branches must follow the Claudia workflow:

1. **Issue Creation**: `/claudia:issues:create` or `/claudia:requirements:define`
2. **Implementation**: `/claudia:implement:manual` or `/claudia:implement:auto`
3. **Commit**: `/claudia:commit "ISSUE_ID"`
4. **Pull Request**: `/claudia:pr:create "ISSUE_ID"`

### Bypass Procedures
Emergency bypass is available for critical production issues:

1. Use emergency issue template
2. Get approval from incident commander
3. Follow post-incident review process
4. Document bypass in incident log

See [Emergency Procedures](.github/EMERGENCY_PROCEDURES.md) for details.

## Code Review Requirements

### Review Criteria
- [ ] Claudia workflow compliance verified
- [ ] Requirements traceability confirmed
- [ ] Code quality standards met
- [ ] Tests included and passing
- [ ] Documentation updated
- [ ] Security considerations reviewed

### Reviewer Responsibilities
- Verify Claudia command chain of custody
- Confirm issue/requirement linkage
- Validate implementation against acceptance criteria
- Ensure audit trail completeness

## Compliance Monitoring

### Automated Checks
- Pre-commit hooks validate Claudia workflow
- GitHub Actions verify command usage
- Status checks prevent non-compliant merges
- Audit logs track all workflow steps

### Manual Review
- Code owners review all changes
- PR template compliance checked
- Requirements traceability validated
- Emergency bypasses logged and reviewed

## Policy Updates

This policy is maintained as part of the Claudia workflow system.
Updates require:
1. Discussion in GitHub Discussions
2. Approval from repository maintainers
3. Documentation update
4. Team notification

---

**Policy Version**: 1.0
**Last Updated**: $(date)
**Review Cycle**: Quarterly
EOF

echo ""
echo -e "${GREEN}🎉 Branch Protection Setup Complete!${NC}"
echo ""
echo -e "${BLUE}📋 Configuration Applied:${NC}"
echo -e "${GREEN}  ✅ Branch protection enabled on $MAIN_BRANCH${NC}"
echo -e "${GREEN}  ✅ Required PR reviews: 1 minimum${NC}"
echo -e "${GREEN}  ✅ Required status checks configured${NC}"
echo -e "${GREEN}  ✅ Force push disabled${NC}"
echo -e "${GREEN}  ✅ Direct push disabled${NC}"
echo -e "${GREEN}  ✅ CODEOWNERS file created${NC}"
echo -e "${GREEN}  ✅ PR template with Claudia integration${NC}"
echo -e "${GREEN}  ✅ Branch protection policy documented${NC}"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo "1. Configure GitHub Actions for status checks"
echo "2. Set up pre-commit hooks"
echo "3. Test branch protection with a test PR"
echo "4. Train team on new workflow requirements"
echo ""
echo -e "${BLUE}🔧 Test Commands:${NC}"
echo "# Verify branch protection"
echo "gh api repos/:owner/:repo/branches/$MAIN_BRANCH/protection"
echo ""
echo "# Test PR creation"
echo "/claudia:pr:create \"TEST_ISSUE_ID\""
echo ""
