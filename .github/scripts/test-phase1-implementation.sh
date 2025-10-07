#!/bin/bash
# Phase 1 Implementation Testing Suite
# Comprehensive testing of all Phase 1 Claudia workflow components

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Phase 1 Implementation Testing Suite${NC}"
echo "========================================="

# Configuration
TEST_RESULTS_DIR=".github/test-results"
TEST_LOG="$TEST_RESULTS_DIR/phase1-test-$(date +%Y%m%d-%H%M%S).log"
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
WARNINGS=0

# Create test results directory
mkdir -p "$TEST_RESULTS_DIR"

# Initialize test log
echo "# Phase 1 Implementation Test Results" > "$TEST_LOG"
echo "Test Date: $(date)" >> "$TEST_LOG"
echo "Repository: $(pwd)" >> "$TEST_LOG"
echo "" >> "$TEST_LOG"

# Utility functions
log_test() {
    local test_name="$1"
    local status="$2"
    local message="$3"

    TOTAL_TESTS=$((TOTAL_TESTS + 1))

    case "$status" in
        "PASS")
            PASSED_TESTS=$((PASSED_TESTS + 1))
            echo -e "${GREEN}✅ $test_name${NC}"
            echo "✅ PASS: $test_name - $message" >> "$TEST_LOG"
            ;;
        "FAIL")
            FAILED_TESTS=$((FAILED_TESTS + 1))
            echo -e "${RED}❌ $test_name${NC}"
            echo "❌ FAIL: $test_name - $message" >> "$TEST_LOG"
            ;;
        "WARN")
            WARNINGS=$((WARNINGS + 1))
            echo -e "${YELLOW}⚠️ $test_name${NC}"
            echo "⚠️ WARN: $test_name - $message" >> "$TEST_LOG"
            ;;
    esac

    if [ -n "$message" ]; then
        echo "   $message"
    fi
}

run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_result="${3:-0}"

    echo -e "${CYAN}Running: $test_name${NC}"

    if eval "$test_command" &>/dev/null; then
        if [ "$expected_result" = "0" ]; then
            log_test "$test_name" "PASS" "Command executed successfully"
        else
            log_test "$test_name" "FAIL" "Command succeeded but failure was expected"
        fi
    else
        if [ "$expected_result" = "1" ]; then
            log_test "$test_name" "PASS" "Command failed as expected"
        else
            log_test "$test_name" "FAIL" "Command failed unexpectedly"
        fi
    fi
}

echo -e "${PURPLE}🏗️ Testing Sub-Phase 1A: Foundation Components${NC}"
echo "================================================="

# Test 1: GitHub Projects Setup Script
echo -e "${BLUE}Testing GitHub Projects setup...${NC}"
if [ -f ".github/scripts/setup-github-projects.sh" ]; then
    if [ -x ".github/scripts/setup-github-projects.sh" ]; then
        log_test "GitHub Projects Script Exists and Executable" "PASS" "Script ready for execution"
    else
        log_test "GitHub Projects Script Permissions" "FAIL" "Script exists but not executable"
    fi
else
    log_test "GitHub Projects Script Exists" "FAIL" "Script not found"
fi

# Test 2: GitHub Issues Configuration
echo -e "${BLUE}Testing GitHub Issues setup...${NC}"
if [ -f ".github/scripts/setup-github-issues.sh" ]; then
    log_test "GitHub Issues Script Exists" "PASS" "Script found"

    # Test issue templates
    if [ -d ".github/ISSUE_TEMPLATE" ]; then
        template_count=$(ls -1 .github/ISSUE_TEMPLATE/*.yml 2>/dev/null | wc -l)
        if [ "$template_count" -ge 3 ]; then
            log_test "Issue Templates Created" "PASS" "$template_count templates found"
        else
            log_test "Issue Templates Created" "FAIL" "Only $template_count templates found, expected 3+"
        fi
    else
        log_test "Issue Templates Directory" "FAIL" "Issue templates directory not found"
    fi
else
    log_test "GitHub Issues Script Exists" "FAIL" "Script not found"
fi

# Test 3: GitHub Discussions Configuration
echo -e "${BLUE}Testing GitHub Discussions setup...${NC}"
if [ -f ".github/scripts/setup-github-discussions.sh" ]; then
    log_test "GitHub Discussions Script Exists" "PASS" "Script found"

    # Test discussion templates
    if [ -d ".github/DISCUSSION_TEMPLATE" ]; then
        template_count=$(ls -1 .github/DISCUSSION_TEMPLATE/*.md 2>/dev/null | wc -l)
        if [ "$template_count" -ge 2 ]; then
            log_test "Discussion Templates Created" "PASS" "$template_count templates found"
        else
            log_test "Discussion Templates Created" "WARN" "Only $template_count templates found"
        fi
    else
        log_test "Discussion Templates Directory" "FAIL" "Discussion templates directory not found"
    fi

    # Test discussion guidelines
    if [ -f ".github/DISCUSSION_GUIDELINES.md" ]; then
        log_test "Discussion Guidelines Created" "PASS" "Guidelines document exists"
    else
        log_test "Discussion Guidelines Created" "FAIL" "Guidelines document not found"
    fi
else
    log_test "GitHub Discussions Script Exists" "FAIL" "Script not found"
fi

# Test 4: Migration Scripts
echo -e "${BLUE}Testing data migration capabilities...${NC}"
if [ -f ".github/scripts/migrate-claudia-data.sh" ]; then
    log_test "Migration Script Exists" "PASS" "Script found"

    # Test migration with dry run
    if ./.github/scripts/migrate-claudia-data.sh true &>/dev/null; then
        log_test "Migration Dry Run" "PASS" "Dry run completed successfully"
    else
        log_test "Migration Dry Run" "WARN" "Dry run had issues (may be expected if no data exists)"
    fi
else
    log_test "Migration Script Exists" "FAIL" "Script not found"
fi

echo ""
echo -e "${PURPLE}🛡️ Testing Sub-Phase 1B: Enforcement Components${NC}"
echo "=================================================="

# Test 5: Branch Protection Setup
echo -e "${BLUE}Testing branch protection setup...${NC}"
if [ -f ".github/scripts/setup-branch-protection.sh" ]; then
    log_test "Branch Protection Script Exists" "PASS" "Script found"

    # Test CODEOWNERS file creation
    if [ -f ".github/CODEOWNERS" ]; then
        log_test "CODEOWNERS File Created" "PASS" "File exists"
    else
        log_test "CODEOWNERS File Created" "FAIL" "File not found"
    fi

    # Test PR template
    if [ -f ".github/pull_request_template.md" ]; then
        log_test "PR Template Created" "PASS" "Template exists"

        # Check for Claudia workflow integration
        if grep -q "Claudia Workflow" ".github/pull_request_template.md"; then
            log_test "PR Template Claudia Integration" "PASS" "Template includes Claudia workflow"
        else
            log_test "PR Template Claudia Integration" "FAIL" "Template missing Claudia workflow integration"
        fi
    else
        log_test "PR Template Created" "FAIL" "Template not found"
    fi

    # Test branch protection policy
    if [ -f ".github/BRANCH_PROTECTION_POLICY.md" ]; then
        log_test "Branch Protection Policy Created" "PASS" "Policy document exists"
    else
        log_test "Branch Protection Policy Created" "FAIL" "Policy document not found"
    fi
else
    log_test "Branch Protection Script Exists" "FAIL" "Script not found"
fi

# Test 6: Pre-commit Hooks Setup
echo -e "${BLUE}Testing pre-commit hooks setup...${NC}"
if [ -f ".github/scripts/setup-precommit-hooks.sh" ]; then
    log_test "Pre-commit Setup Script Exists" "PASS" "Script found"

    # Test pre-commit configuration
    if [ -f ".pre-commit-config.yaml" ]; then
        log_test "Pre-commit Configuration Created" "PASS" "Configuration file exists"

        # Check for Claudia-specific hooks
        if grep -q "claudia-workflow-validation" ".pre-commit-config.yaml"; then
            log_test "Claudia Hooks in Pre-commit Config" "PASS" "Claudia validation hooks configured"
        else
            log_test "Claudia Hooks in Pre-commit Config" "FAIL" "Claudia hooks not found in configuration"
        fi
    else
        log_test "Pre-commit Configuration Created" "FAIL" "Configuration file not found"
    fi

    # Test hook scripts
    hook_scripts=("claudia-workflow-validator.sh" "claudia-commit-validator.sh" "claudia-emergency-validator.sh")
    for hook in "${hook_scripts[@]}"; do
        if [ -f ".github/hooks/$hook" ]; then
            if [ -x ".github/hooks/$hook" ]; then
                log_test "Hook Script: $hook" "PASS" "Script exists and is executable"
            else
                log_test "Hook Script Permissions: $hook" "FAIL" "Script exists but not executable"
            fi
        else
            log_test "Hook Script: $hook" "FAIL" "Script not found"
        fi
    done

    # Test emergency bypass script
    if [ -f ".github/scripts/create-emergency-bypass.sh" ]; then
        if [ -x ".github/scripts/create-emergency-bypass.sh" ]; then
            log_test "Emergency Bypass Script" "PASS" "Script exists and is executable"
        else
            log_test "Emergency Bypass Script Permissions" "FAIL" "Script not executable"
        fi
    else
        log_test "Emergency Bypass Script" "FAIL" "Script not found"
    fi
else
    log_test "Pre-commit Setup Script Exists" "FAIL" "Script not found"
fi

# Test 7: GitHub Actions Workflow
echo -e "${BLUE}Testing GitHub Actions workflow...${NC}"
if [ -f ".github/workflows/claudia-workflow-enforcement.yml" ]; then
    log_test "GitHub Actions Workflow Exists" "PASS" "Workflow file found"

    # Test workflow syntax (basic YAML validation)
    if command -v yamllint &>/dev/null; then
        if yamllint ".github/workflows/claudia-workflow-enforcement.yml" &>/dev/null; then
            log_test "Workflow YAML Syntax" "PASS" "Valid YAML syntax"
        else
            log_test "Workflow YAML Syntax" "FAIL" "Invalid YAML syntax"
        fi
    else
        log_test "Workflow YAML Syntax" "WARN" "yamllint not available, skipping validation"
    fi

    # Check for required jobs
    required_jobs=("claudia-workflow-validation" "code-quality-check" "security-scan" "audit-trail-check")
    for job in "${required_jobs[@]}"; do
        if grep -q "$job:" ".github/workflows/claudia-workflow-enforcement.yml"; then
            log_test "Workflow Job: $job" "PASS" "Job found in workflow"
        else
            log_test "Workflow Job: $job" "FAIL" "Job not found in workflow"
        fi
    done
else
    log_test "GitHub Actions Workflow Exists" "FAIL" "Workflow file not found"
fi

# Test 8: Emergency Procedures Documentation
echo -e "${BLUE}Testing emergency procedures...${NC}"
if [ -f ".github/EMERGENCY_PROCEDURES.md" ]; then
    log_test "Emergency Procedures Document Exists" "PASS" "Documentation found"

    # Check for required sections
    required_sections=("Emergency Bypass Process" "Post-Incident Review" "Emergency Contact Information")
    for section in "${required_sections[@]}"; do
        if grep -q "$section" ".github/EMERGENCY_PROCEDURES.md"; then
            log_test "Emergency Procedures Section: $section" "PASS" "Section found"
        else
            log_test "Emergency Procedures Section: $section" "FAIL" "Section missing"
        fi
    done
else
    log_test "Emergency Procedures Document Exists" "FAIL" "Documentation not found"
fi

echo ""
echo -e "${PURPLE}✅ Testing Sub-Phase 1C: Validation Components${NC}"
echo "=============================================="

# Test 9: Claudia Command Integration
echo -e "${BLUE}Testing Claudia command integration...${NC}"
if [ -d ".claude/commands/claudia" ]; then
    command_count=$(find .claude/commands/claudia -name "*.md" | wc -l)
    if [ "$command_count" -ge 10 ]; then
        log_test "Claudia Commands Available" "PASS" "$command_count commands found"
    else
        log_test "Claudia Commands Available" "WARN" "Only $command_count commands found"
    fi

    # Test key commands
    key_commands=("sprint/create.md" "requirements/define.md" "issues/create.md" "commit.md" "pr/create.md")
    for cmd in "${key_commands[@]}"; do
        if [ -f ".claude/commands/claudia/$cmd" ]; then
            log_test "Key Command: $cmd" "PASS" "Command file exists"
        else
            log_test "Key Command: $cmd" "FAIL" "Command file not found"
        fi
    done
else
    log_test "Claudia Commands Directory" "FAIL" "Commands directory not found"
fi

# Test 10: Claudia Project Management Structure
echo -e "${BLUE}Testing Claudia project management structure...${NC}"
if [ -d ".claude-shared/project-management" ]; then
    log_test "Claudia Project Management Directory" "PASS" "Directory exists"

    # Test subdirectories
    required_dirs=("1-roadmap" "2-planning" "3-sprints" "4-requirements" "5-tickets" "data")
    for dir in "${required_dirs[@]}"; do
        if [ -d ".claude-shared/project-management/$dir" ]; then
            log_test "Project Management Directory: $dir" "PASS" "Directory exists"
        else
            log_test "Project Management Directory: $dir" "FAIL" "Directory not found"
        fi
    done
else
    log_test "Claudia Project Management Directory" "FAIL" "Directory not found"
fi

# Test 11: Integration Tests
echo -e "${BLUE}Testing system integration...${NC}"

# Test GitHub CLI availability (required for many workflows)
if command -v gh &>/dev/null; then
    log_test "GitHub CLI Available" "PASS" "gh command found"

    # Test GitHub authentication (if available)
    if gh auth status &>/dev/null; then
        log_test "GitHub CLI Authenticated" "PASS" "Authentication verified"
    else
        log_test "GitHub CLI Authenticated" "WARN" "Not authenticated (may be intentional in CI)"
    fi
else
    log_test "GitHub CLI Available" "FAIL" "gh command not found"
fi

# Test pre-commit installation (if available)
if command -v pre-commit &>/dev/null; then
    log_test "Pre-commit Available" "PASS" "pre-commit command found"
else
    log_test "Pre-commit Available" "WARN" "pre-commit not installed (will be installed by setup script)"
fi

# Test 12: File Permissions and Security
echo -e "${BLUE}Testing file permissions and security...${NC}"

# Check script permissions
script_files=(.github/scripts/*.sh)
for script in "${script_files[@]}"; do
    if [ -f "$script" ]; then
        if [ -x "$script" ]; then
            log_test "Script Permissions: $(basename "$script")" "PASS" "Script is executable"
        else
            log_test "Script Permissions: $(basename "$script")" "FAIL" "Script not executable"
        fi
    fi
done

# Check hook permissions
if [ -d ".github/hooks" ]; then
    hook_files=(.github/hooks/*.sh)
    for hook in "${hook_files[@]}"; do
        if [ -f "$hook" ]; then
            if [ -x "$hook" ]; then
                log_test "Hook Permissions: $(basename "$hook")" "PASS" "Hook is executable"
            else
                log_test "Hook Permissions: $(basename "$hook")" "FAIL" "Hook not executable"
            fi
        fi
    done
fi

# Test 13: Documentation Completeness
echo -e "${BLUE}Testing documentation completeness...${NC}"

required_docs=(
    ".github/PHASE1_IMPLEMENTATION.md"
    ".github/EMERGENCY_PROCEDURES.md"
    ".github/BRANCH_PROTECTION_POLICY.md"
    ".github/DISCUSSION_GUIDELINES.md"
)

for doc in "${required_docs[@]}"; do
    if [ -f "$doc" ]; then
        # Check if file has substantial content (more than just headers)
        if [ "$(wc -l < "$doc")" -gt 50 ]; then
            log_test "Documentation: $(basename "$doc")" "PASS" "Document exists with substantial content"
        else
            log_test "Documentation: $(basename "$doc")" "WARN" "Document exists but may be incomplete"
        fi
    else
        log_test "Documentation: $(basename "$doc")" "FAIL" "Document not found"
    fi
done

echo ""
echo -e "${PURPLE}📊 Test Results Summary${NC}"
echo "======================="

# Calculate success rate
if [ $TOTAL_TESTS -gt 0 ]; then
    SUCCESS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
else
    SUCCESS_RATE=0
fi

echo -e "${BLUE}Total Tests: $TOTAL_TESTS${NC}"
echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
echo -e "${RED}Failed: $FAILED_TESTS${NC}"
echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
echo -e "${CYAN}Success Rate: $SUCCESS_RATE%${NC}"

# Add summary to log
echo "" >> "$TEST_LOG"
echo "## Test Summary" >> "$TEST_LOG"
echo "Total Tests: $TOTAL_TESTS" >> "$TEST_LOG"
echo "Passed: $PASSED_TESTS" >> "$TEST_LOG"
echo "Failed: $FAILED_TESTS" >> "$TEST_LOG"
echo "Warnings: $WARNINGS" >> "$TEST_LOG"
echo "Success Rate: $SUCCESS_RATE%" >> "$TEST_LOG"

echo ""
echo -e "${BLUE}📋 Detailed test log saved to: $TEST_LOG${NC}"

# Determine overall result
if [ $FAILED_TESTS -eq 0 ]; then
    if [ $WARNINGS -eq 0 ]; then
        echo -e "${GREEN}🎉 All tests passed! Phase 1 implementation is complete.${NC}"
        exit 0
    else
        echo -e "${YELLOW}⚠️ All tests passed with warnings. Review warnings before proceeding.${NC}"
        exit 0
    fi
else
    echo -e "${RED}❌ Some tests failed. Please address failures before using Phase 1 implementation.${NC}"
    exit 1
fi
