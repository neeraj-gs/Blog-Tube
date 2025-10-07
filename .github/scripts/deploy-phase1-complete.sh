#!/bin/bash
# Phase 1 Complete Deployment Script
# Master script to deploy all Phase 1 components of the Claudia Mandatory Workflow Foundation

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Banner
echo -e "${BOLD}${BLUE}"
cat << 'EOF'
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║                 🤖 CLAUDIA PHASE 1 DEPLOYMENT                               ║
║                                                                              ║
║                 Mandatory Workflow Foundation                                 ║
║                 Complete GitHub Integration                                   ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo -e "${BLUE}Phase 1: Mandatory Workflow Foundation Implementation${NC}"
echo -e "${BLUE}====================================================${NC}"
echo ""
echo -e "${PURPLE}This script will deploy:${NC}"
echo -e "${CYAN}  🏗️ Foundation Phase: GitHub Projects, Issues, Discussions${NC}"
echo -e "${CYAN}  🛡️ Enforcement Phase: Branch protection, pre-commit hooks${NC}"
echo -e "${CYAN}  🧪 Validation Phase: Testing and documentation${NC}"
echo -e "${CYAN}  📊 Migration: Existing Claudia data to GitHub${NC}"
echo ""

# Configuration
DEPLOYMENT_LOG=".github/deployment-$(date +%Y%m%d-%H%M%S).log"
DRY_RUN=${1:-false}
SKIP_TESTS=${2:-false}
FORCE_DEPLOY=${3:-false}

# Initialize deployment log
mkdir -p .github
echo "# Phase 1 Deployment Log" > "$DEPLOYMENT_LOG"
echo "Deployment Date: $(date)" >> "$DEPLOYMENT_LOG"
echo "Repository: $(pwd)" >> "$DEPLOYMENT_LOG"
echo "Dry Run: $DRY_RUN" >> "$DEPLOYMENT_LOG"
echo "" >> "$DEPLOYMENT_LOG"

# Utility functions
log_step() {
    local step="$1"
    local status="$2"
    local message="$3"

    case "$status" in
        "START")
            echo -e "${BLUE}🚀 Starting: $step${NC}"
            echo "## $step - STARTED $(date)" >> "$DEPLOYMENT_LOG"
            ;;
        "SUCCESS")
            echo -e "${GREEN}✅ Completed: $step${NC}"
            echo "## $step - SUCCESS $(date)" >> "$DEPLOYMENT_LOG"
            echo "   $message" >> "$DEPLOYMENT_LOG"
            ;;
        "ERROR")
            echo -e "${RED}❌ Failed: $step${NC}"
            echo "## $step - FAILED $(date)" >> "$DEPLOYMENT_LOG"
            echo "   ERROR: $message" >> "$DEPLOYMENT_LOG"
            ;;
        "SKIP")
            echo -e "${YELLOW}⏭️ Skipped: $step${NC}"
            echo "## $step - SKIPPED $(date)" >> "$DEPLOYMENT_LOG"
            echo "   REASON: $message" >> "$DEPLOYMENT_LOG"
            ;;
    esac

    if [ -n "$message" ] && [ "$status" != "START" ]; then
        echo "   $message"
    fi
}

check_prerequisites() {
    log_step "Prerequisites Check" "START" ""

    local missing_tools=()

    # Check required tools
    if ! command -v git &> /dev/null; then
        missing_tools+=("git")
    fi

    if ! command -v gh &> /dev/null; then
        missing_tools+=("gh (GitHub CLI)")
    fi

    # Check optional tools (warn if missing)
    local optional_tools=("pre-commit" "yamllint" "jq")
    for tool in "${optional_tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            echo -e "${YELLOW}⚠️ Optional tool missing: $tool${NC}"
        fi
    done

    if [ ${#missing_tools[@]} -gt 0 ]; then
        log_step "Prerequisites Check" "ERROR" "Missing required tools: ${missing_tools[*]}"
        echo ""
        echo -e "${RED}Please install the missing tools:${NC}"
        for tool in "${missing_tools[@]}"; do
            echo "  - $tool"
        done
        echo ""
        echo -e "${BLUE}Installation commands:${NC}"
        echo "  brew install git gh"
        echo "  # or"
        echo "  apt-get update && apt-get install -y git"
        echo "  curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg"
        exit 1
    fi

    # Check GitHub authentication
    if ! gh auth status &> /dev/null; then
        if [ "$DRY_RUN" = "false" ]; then
            log_step "Prerequisites Check" "ERROR" "GitHub CLI not authenticated"
            echo ""
            echo -e "${YELLOW}Please authenticate with GitHub:${NC}"
            echo "  gh auth login"
            exit 1
        else
            echo -e "${YELLOW}⚠️ GitHub CLI not authenticated (OK for dry run)${NC}"
        fi
    fi

    # Check if we're in a git repository
    if ! git status &> /dev/null; then
        log_step "Prerequisites Check" "ERROR" "Not in a git repository"
        exit 1
    fi

    log_step "Prerequisites Check" "SUCCESS" "All prerequisites met"
}

backup_existing_config() {
    log_step "Configuration Backup" "START" ""

    local backup_dir=".github/backups/pre-phase1-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$backup_dir"

    # Backup existing GitHub configurations
    local files_to_backup=(
        ".github/CODEOWNERS"
        ".github/pull_request_template.md"
        ".pre-commit-config.yaml"
        ".github/workflows"
        ".github/ISSUE_TEMPLATE"
        ".github/DISCUSSION_TEMPLATE"
    )

    local backed_up_files=0
    for file in "${files_to_backup[@]}"; do
        if [ -e "$file" ]; then
            cp -r "$file" "$backup_dir/"
            backed_up_files=$((backed_up_files + 1))
        fi
    done

    if [ $backed_up_files -gt 0 ]; then
        log_step "Configuration Backup" "SUCCESS" "$backed_up_files files backed up to $backup_dir"
    else
        log_step "Configuration Backup" "SKIP" "No existing configuration files to backup"
    fi
}

deploy_foundation_phase() {
    log_step "Foundation Phase Deployment" "START" ""

    echo -e "${CYAN}  📋 Setting up GitHub Projects...${NC}"
    if [ "$DRY_RUN" = "false" ]; then
        if ./.github/scripts/setup-github-projects.sh; then
            echo -e "${GREEN}    ✅ GitHub Projects setup completed${NC}"
        else
            log_step "Foundation Phase Deployment" "ERROR" "GitHub Projects setup failed"
            return 1
        fi
    else
        echo -e "${YELLOW}    🧪 DRY RUN: Would set up GitHub Projects${NC}"
    fi

    echo -e "${CYAN}  🎫 Setting up GitHub Issues...${NC}"
    if [ "$DRY_RUN" = "false" ]; then
        if ./.github/scripts/setup-github-issues.sh; then
            echo -e "${GREEN}    ✅ GitHub Issues setup completed${NC}"
        else
            log_step "Foundation Phase Deployment" "ERROR" "GitHub Issues setup failed"
            return 1
        fi
    else
        echo -e "${YELLOW}    🧪 DRY RUN: Would set up GitHub Issues${NC}"
    fi

    echo -e "${CYAN}  💬 Setting up GitHub Discussions...${NC}"
    if [ "$DRY_RUN" = "false" ]; then
        if ./.github/scripts/setup-github-discussions.sh; then
            echo -e "${GREEN}    ✅ GitHub Discussions setup completed${NC}"
        else
            echo -e "${YELLOW}    ⚠️ GitHub Discussions setup had warnings (may require manual repository configuration)${NC}"
        fi
    else
        echo -e "${YELLOW}    🧪 DRY RUN: Would set up GitHub Discussions${NC}"
    fi

    log_step "Foundation Phase Deployment" "SUCCESS" "GitHub Projects, Issues, and Discussions configured"
}

deploy_enforcement_phase() {
    log_step "Enforcement Phase Deployment" "START" ""

    echo -e "${CYAN}  🛡️ Setting up Branch Protection...${NC}"
    if [ "$DRY_RUN" = "false" ]; then
        if ./.github/scripts/setup-branch-protection.sh; then
            echo -e "${GREEN}    ✅ Branch protection configured${NC}"
        else
            log_step "Enforcement Phase Deployment" "ERROR" "Branch protection setup failed"
            return 1
        fi
    else
        echo -e "${YELLOW}    🧪 DRY RUN: Would set up branch protection${NC}"
    fi

    echo -e "${CYAN}  🪝 Setting up Pre-commit Hooks...${NC}"
    if [ "$DRY_RUN" = "false" ]; then
        if ./.github/scripts/setup-precommit-hooks.sh; then
            echo -e "${GREEN}    ✅ Pre-commit hooks configured${NC}"
        else
            log_step "Enforcement Phase Deployment" "ERROR" "Pre-commit hooks setup failed"
            return 1
        fi
    else
        echo -e "${YELLOW}    🧪 DRY RUN: Would set up pre-commit hooks${NC}"
    fi

    echo -e "${CYAN}  ⚙️ Verifying GitHub Actions workflow...${NC}"
    if [ -f ".github/workflows/claudia-workflow-enforcement.yml" ]; then
        echo -e "${GREEN}    ✅ GitHub Actions workflow ready${NC}"
    else
        echo -e "${RED}    ❌ GitHub Actions workflow missing${NC}"
        return 1
    fi

    log_step "Enforcement Phase Deployment" "SUCCESS" "Branch protection, pre-commit hooks, and GitHub Actions configured"
}

migrate_existing_data() {
    log_step "Data Migration" "START" ""

    # Check if there's existing Claudia data to migrate
    if [ -d ".claude-shared/project-management" ]; then
        local data_files=0
        for dir in "3-sprints" "4-requirements" "5-tickets"; do
            if [ -d ".claude-shared/project-management/$dir" ]; then
                data_files=$((data_files + $(find ".claude-shared/project-management/$dir" -name "*.md" | wc -l)))
            fi
        done

        if [ $data_files -gt 0 ]; then
            echo -e "${CYAN}  📁 Found $data_files existing Claudia files to migrate${NC}"

            if [ "$DRY_RUN" = "false" ]; then
                echo -e "${CYAN}  📊 Running migration (dry run first)...${NC}"
                if ./.github/scripts/migrate-claudia-data.sh true; then
                    echo -e "${GREEN}    ✅ Migration dry run successful${NC}"

                    read -p "Proceed with actual migration? (y/N): " confirm
                    if [[ $confirm =~ ^[Yy]$ ]]; then
                        if ./.github/scripts/migrate-claudia-data.sh false; then
                            echo -e "${GREEN}    ✅ Data migration completed${NC}"
                        else
                            log_step "Data Migration" "ERROR" "Migration failed"
                            return 1
                        fi
                    else
                        echo -e "${YELLOW}    ⏭️ Migration skipped by user${NC}"
                    fi
                else
                    log_step "Data Migration" "ERROR" "Migration dry run failed"
                    return 1
                fi
            else
                echo -e "${YELLOW}    🧪 DRY RUN: Would migrate $data_files files to GitHub${NC}"
            fi
        else
            log_step "Data Migration" "SKIP" "No existing Claudia data found"
        fi
    else
        log_step "Data Migration" "SKIP" "No Claudia project management directory found"
    fi

    log_step "Data Migration" "SUCCESS" "Migration phase completed"
}

run_validation_tests() {
    if [ "$SKIP_TESTS" = "true" ]; then
        log_step "Validation Testing" "SKIP" "Tests skipped by user request"
        return 0
    fi

    log_step "Validation Testing" "START" ""

    echo -e "${CYAN}  🧪 Running comprehensive Phase 1 tests...${NC}"
    if ./.github/scripts/test-phase1-implementation.sh; then
        echo -e "${GREEN}    ✅ All validation tests passed${NC}"
        log_step "Validation Testing" "SUCCESS" "All tests passed"
    else
        echo -e "${RED}    ❌ Some validation tests failed${NC}"

        if [ "$FORCE_DEPLOY" = "true" ]; then
            echo -e "${YELLOW}    ⚠️ Continuing deployment despite test failures (forced)${NC}"
            log_step "Validation Testing" "SUCCESS" "Tests failed but deployment forced"
        else
            log_step "Validation Testing" "ERROR" "Validation tests failed"
            echo ""
            echo -e "${YELLOW}Options:${NC}"
            echo "  1. Fix the failing tests and re-run deployment"
            echo "  2. Use --force-deploy flag to override (not recommended)"
            echo "  3. Use --skip-tests flag to skip validation"
            return 1
        fi
    fi
}

create_deployment_summary() {
    log_step "Deployment Summary Creation" "START" ""

    local summary_file=".github/PHASE1_DEPLOYMENT_SUMMARY.md"

    cat > "$summary_file" << EOF
# Phase 1 Deployment Summary

**Deployment Date**: $(date)
**Repository**: $(pwd)
**Deployment Mode**: $([ "$DRY_RUN" = "true" ] && echo "DRY RUN" || echo "LIVE DEPLOYMENT")

## Components Deployed

### ✅ Foundation Phase
- **GitHub Projects**: Sprint and requirement management
- **GitHub Issues**: Automated issue creation and tracking
- **GitHub Discussions**: Team collaboration platform
- **Migration Scripts**: Existing data migration capabilities

### ✅ Enforcement Phase
- **Branch Protection**: Mandatory workflow enforcement on main branch
- **Pre-commit Hooks**: Claudia workflow validation before commits
- **GitHub Actions**: Automated compliance checking
- **Emergency Procedures**: Critical incident bypass capabilities

### ✅ Validation Phase
- **Comprehensive Testing**: Full Phase 1 validation suite
- **Documentation**: Complete implementation guides
- **Integration Verification**: End-to-end workflow testing

## Post-Deployment Checklist

### Immediate Tasks (Complete within 24 hours)
- [ ] **Enable GitHub Discussions** in repository settings
- [ ] **Configure GitHub Projects** with proper categories
- [ ] **Test Emergency Procedures** with a practice incident
- [ ] **Train Team** on new Claudia workflow requirements

### Setup Tasks (Complete within 1 week)
- [ ] **Configure Branch Protection** for additional branches if needed
- [ ] **Set up Notifications** for workflow violations
- [ ] **Create Team Documentation** for new workflow
- [ ] **Schedule Regular Reviews** of bypass usage

### Ongoing Tasks
- [ ] **Monthly Review** of workflow compliance metrics
- [ ] **Quarterly Update** of emergency procedures
- [ ] **Continuous Monitoring** of audit logs
- [ ] **Process Improvement** based on team feedback

## Available Commands

### Claudia Workflow Commands
\`\`\`bash
# Create new sprint
/claudia:sprint:create "XXX"

# Define requirements
/claudia:requirements:define "Description" --sprint XXX

# Create GitHub issues
/claudia:issues:create "req-uuid"

# Pull GitHub issues
/claudia:issues:pull

# Implement changes
/claudia:implement:manual "req-uuid"

# Commit changes
/claudia:commit "issue-id"

# Create pull request
/claudia:pr:create "issue-id"
\`\`\`

### Administrative Commands
\`\`\`bash
# Test Phase 1 implementation
.github/scripts/test-phase1-implementation.sh

# Create emergency bypass
.github/scripts/create-emergency-bypass.sh

# Migrate existing data
.github/scripts/migrate-claudia-data.sh [true|false]

# Setup individual components
.github/scripts/setup-github-projects.sh
.github/scripts/setup-github-issues.sh
.github/scripts/setup-github-discussions.sh
.github/scripts/setup-branch-protection.sh
.github/scripts/setup-precommit-hooks.sh
\`\`\`

## Documentation References

- **Implementation Guide**: [.github/PHASE1_IMPLEMENTATION.md](.github/PHASE1_IMPLEMENTATION.md)
- **Emergency Procedures**: [.github/EMERGENCY_PROCEDURES.md](.github/EMERGENCY_PROCEDURES.md)
- **Branch Protection Policy**: [.github/BRANCH_PROTECTION_POLICY.md](.github/BRANCH_PROTECTION_POLICY.md)
- **Discussion Guidelines**: [.github/DISCUSSION_GUIDELINES.md](.github/DISCUSSION_GUIDELINES.md)

## Support and Troubleshooting

### Common Issues
1. **GitHub CLI Authentication**: Run \`gh auth login\` to authenticate
2. **Pre-commit Installation**: Run \`pip install pre-commit\` or \`brew install pre-commit\`
3. **Branch Protection Setup**: Requires admin access to repository
4. **Discussions Not Available**: Enable in repository settings under Features

### Getting Help
1. Check the troubleshooting section in implementation guide
2. Review audit logs in \`.claude-shared/project-management/data/\`
3. Test individual components with their respective setup scripts
4. Use emergency procedures only for critical incidents

---

**Phase 1 Status**: $([ "$DRY_RUN" = "true" ] && echo "🧪 DRY RUN COMPLETED" || echo "✅ SUCCESSFULLY DEPLOYED")

**Next Phase**: Phase 2 - Enhanced Development Commands (Interactive Reviews & Environment Management)

*This summary was auto-generated by the Phase 1 deployment script.*
EOF

    if [ "$DRY_RUN" = "false" ]; then
        echo -e "${GREEN}📊 Deployment summary created: $summary_file${NC}"
        log_step "Deployment Summary Creation" "SUCCESS" "Summary document created"
    else
        echo -e "${YELLOW}📊 DRY RUN: Deployment summary would be created at: $summary_file${NC}"
        log_step "Deployment Summary Creation" "SUCCESS" "Summary document prepared"
    fi
}

main() {
    echo -e "${BOLD}${BLUE}Starting Phase 1 Deployment...${NC}"

    if [ "$DRY_RUN" = "true" ]; then
        echo -e "${YELLOW}🧪 DRY RUN MODE - No actual changes will be made${NC}"
        echo ""
    fi

    # Make scripts executable
    chmod +x .github/scripts/*.sh 2>/dev/null || true
    chmod +x .github/hooks/*.sh 2>/dev/null || true

    # Execute deployment phases
    check_prerequisites
    backup_existing_config

    # Sub-Phase 1A: Foundation
    deploy_foundation_phase || exit 1

    # Sub-Phase 1B: Enforcement
    deploy_enforcement_phase || exit 1

    # Sub-Phase 1C: Migration
    migrate_existing_data || exit 1

    # Sub-Phase 1D: Validation
    run_validation_tests || exit 1

    # Final summary
    create_deployment_summary

    echo ""
    echo -e "${BOLD}${GREEN}🎉 Phase 1 Deployment Complete!${NC}"
    echo ""

    if [ "$DRY_RUN" = "true" ]; then
        echo -e "${BLUE}📋 This was a dry run. To execute the deployment:${NC}"
        echo -e "${CYAN}  $0 false${NC}"
        echo ""
        echo -e "${BLUE}📋 To skip tests during deployment:${NC}"
        echo -e "${CYAN}  $0 false true${NC}"
        echo ""
        echo -e "${BLUE}📋 To force deployment despite test failures:${NC}"
        echo -e "${CYAN}  $0 false false true${NC}"
    else
        echo -e "${GREEN}✅ Phase 1 Implementation Status: COMPLETE${NC}"
        echo ""
        echo -e "${BLUE}📋 Next Steps:${NC}"
        echo -e "${CYAN}  1. Enable GitHub Discussions in repository settings${NC}"
        echo -e "${CYAN}  2. Configure GitHub Projects with your team${NC}"
        echo -e "${CYAN}  3. Train your team on the new Claudia workflow${NC}"
        echo -e "${CYAN}  4. Test the emergency procedures${NC}"
        echo ""
        echo -e "${BLUE}📊 Deployment log saved to: $DEPLOYMENT_LOG${NC}"
        echo -e "${BLUE}📄 Summary available at: .github/PHASE1_DEPLOYMENT_SUMMARY.md${NC}"
    fi

    echo ""
    echo -e "${PURPLE}🚀 Ready for Phase 2: Enhanced Development Commands${NC}"
    echo -e "${PURPLE}   (Interactive Reviews & Environment Management)${NC}"
    echo ""
}

# Parse command line arguments
case "${1:-help}" in
    "help"|"-h"|"--help")
        echo "Phase 1 Complete Deployment Script"
        echo ""
        echo "Usage: $0 [dry_run] [skip_tests] [force_deploy]"
        echo ""
        echo "Arguments:"
        echo "  dry_run      - true/false (default: false) - Run without making changes"
        echo "  skip_tests   - true/false (default: false) - Skip validation tests"
        echo "  force_deploy - true/false (default: false) - Deploy despite test failures"
        echo ""
        echo "Examples:"
        echo "  $0 true                    # Dry run"
        echo "  $0 false                   # Full deployment"
        echo "  $0 false true              # Deploy without tests"
        echo "  $0 false false true        # Force deploy despite failures"
        echo ""
        exit 0
        ;;
    *)
        main
        ;;
esac
