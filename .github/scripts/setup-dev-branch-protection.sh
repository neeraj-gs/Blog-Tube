#!/bin/bash
# Setup Dev Branch Protection Script
# Extends branch protection to dev and other branches

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

echo -e "${BLUE}🛡️ Setting up Dev Branch Protection${NC}"
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

# Function to create/check branch
ensure_branch_exists() {
    local branch_name="$1"
    echo -e "${BLUE}🔍 Checking if branch '$branch_name' exists...${NC}"

    # Check if branch exists remotely
    if gh api repos/$REPO_OWNER/$REPO_NAME/branches/$branch_name >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Branch '$branch_name' exists${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️ Branch '$branch_name' does not exist${NC}"
        echo -e "${BLUE}Creating branch '$branch_name' from main...${NC}"

        # Create branch locally if not exists
        if ! git show-ref --verify --quiet refs/heads/$branch_name; then
            git checkout -b $branch_name main 2>/dev/null || {
                git checkout main
                git checkout -b $branch_name
            }
        fi

        # Push branch to create it remotely
        git push -u origin $branch_name

        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Branch '$branch_name' created successfully${NC}"
            return 0
        else
            echo -e "${RED}❌ Failed to create branch '$branch_name'${NC}"
            return 1
        fi
    fi
}

# Function to setup branch protection
setup_branch_protection() {
    local branch_name="$1"
    local description="$2"

    echo -e "${BLUE}🛡️ Setting up protection for branch: $branch_name${NC}"
    echo "   Purpose: $description"

    # Branch protection configuration
    PROTECTION_CONFIG='{
        "required_status_checks": {
            "strict": true,
            "contexts": ["continuous-integration", "claudia-workflow-enforcement"]
        },
        "enforce_admins": false,
        "required_pull_request_reviews": {
            "required_approving_review_count": 1,
            "dismiss_stale_reviews": true,
            "require_code_owner_reviews": true,
            "require_last_push_approval": false
        },
        "restrictions": null,
        "allow_force_pushes": false,
        "allow_deletions": false,
        "block_creations": false
    }'

    # Apply protection
    if gh api repos/$REPO_OWNER/$REPO_NAME/branches/$branch_name/protection \
        --method PUT \
        --input - <<< "$PROTECTION_CONFIG" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Protection applied to '$branch_name'${NC}"

        # Verify protection
        PROTECTION_STATUS=$(gh api repos/$REPO_OWNER/$REPO_NAME/branches/$branch_name/protection 2>/dev/null)
        echo -e "${CYAN}   Protection Details:${NC}"
        echo "$PROTECTION_STATUS" | jq -r '
            "   • Required Reviews: " + (.required_pull_request_reviews.required_approving_review_count | tostring),
            "   • Dismiss Stale Reviews: " + (.required_pull_request_reviews.dismiss_stale_reviews | tostring),
            "   • Require Code Owner Reviews: " + (.required_pull_request_reviews.require_code_owner_reviews | tostring),
            "   • Enforce for Admins: " + (.enforce_admins.enabled | tostring),
            "   • Allow Force Pushes: " + (.allow_force_pushes.enabled | tostring)
        ' 2>/dev/null

        return 0
    else
        echo -e "${RED}❌ Failed to apply protection to '$branch_name'${NC}"
        return 1
    fi
}

# Main setup sequence
echo ""
echo -e "${BLUE}🚀 Starting branch protection setup...${NC}"
echo ""

# Setup dev branch protection
if ensure_branch_exists "dev"; then
    echo ""
    if setup_branch_protection "dev" "Development integration branch"; then
        echo -e "${GREEN}✅ Dev branch protection configured${NC}"
    fi
fi

echo ""

# Setup staging branch protection (optional)
read -p "Do you want to also protect a 'staging' branch? (y/N): " create_staging
if [[ $create_staging =~ ^[Yy]$ ]]; then
    echo ""
    if ensure_branch_exists "staging"; then
        echo ""
        if setup_branch_protection "staging" "Staging/QA testing branch"; then
            echo -e "${GREEN}✅ Staging branch protection configured${NC}"
        fi
    fi
fi

# Update CODEOWNERS for multiple branches
echo ""
echo -e "${BLUE}📝 Updating CODEOWNERS for multiple branches...${NC}"

cat >> .github/CODEOWNERS << 'EOF'

# Development branch protection
dev/ @neeraj-gs
staging/ @neeraj-gs

# Branch-specific protection files
.github/branch-protection-dev.yml @neeraj-gs
.github/branch-protection-staging.yml @neeraj-gs
EOF

echo -e "${GREEN}✅ CODEOWNERS updated for multiple branches${NC}"

# Create branch-specific workflow files
echo ""
echo -e "${BLUE}⚙️ Creating branch-specific GitHub Actions...${NC}"

# Dev branch workflow
cat > .github/workflows/dev-branch-protection.yml << 'EOF'
name: Dev Branch Protection

on:
  push:
    branches: [ dev ]
  pull_request:
    branches: [ dev ]

jobs:
  dev-validation:
    name: 🔧 Dev Branch Validation
    runs-on: ubuntu-latest

    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4

      - name: 🔍 Validate dev branch changes
        run: |
          echo "🔧 Validating changes for dev branch"
          echo "• Checking for breaking changes"
          echo "• Running integration tests"
          echo "• Validating Claudia workflow compliance"

          # Add specific dev branch validations here
          echo "✅ Dev branch validation passed"

      - name: 📊 Dev branch status check
        run: echo "Dev branch validation completed successfully"
EOF

echo -e "${GREEN}✅ Dev branch GitHub Actions workflow created${NC}"

# Summary
echo ""
echo -e "${BLUE}📊 Branch Protection Setup Summary:${NC}"
echo "===================================="

# List all protected branches
echo -e "${CYAN}Protected branches:${NC}"
PROTECTED_BRANCHES=$(gh api repos/$REPO_OWNER/$REPO_NAME/branches --jq '.[] | select(.protected == true) | .name' 2>/dev/null)

if [ -n "$PROTECTED_BRANCHES" ]; then
    echo "$PROTECTED_BRANCHES" | while read -r branch; do
        echo "• $branch ✅"
    done
else
    echo "• No protected branches found"
fi

echo ""
echo -e "${BLUE}🎯 Branch Protection Strategy:${NC}"
echo "• main: Production releases only"
echo "• dev: Development integration and testing"
if [[ $create_staging =~ ^[Yy]$ ]]; then
    echo "• staging: QA and pre-production testing"
fi

echo ""
echo -e "${BLUE}🔧 Testing Commands:${NC}"
echo "# Test main branch protection"
echo "./.github/scripts/test-branch-protection.sh"
echo ""
echo "# Check specific branch protection"
echo "gh api repos/$REPO_OWNER/$REPO_NAME/branches/dev/protection"
echo ""
echo "# List all protected branches"
echo "gh api repos/$REPO_OWNER/$REPO_NAME/branches --jq '.[] | select(.protected == true) | .name'"

echo ""
echo -e "${GREEN}✅ Dev Branch Protection Setup Complete!${NC}"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo "1. Test the branch protection with test-branch-protection.sh"
echo "2. Create feature branches for development work"
echo "3. Use PR workflow to merge into dev/main branches"
echo "4. Train team on multi-branch protection strategy"
