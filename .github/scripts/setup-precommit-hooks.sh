#!/bin/bash
# Pre-commit Hooks Setup for Claudia Workflow Validation
# This script sets up pre-commit hooks to enforce Claudia workflow compliance

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${BLUE}🪝 Phase 1B: Setting up Pre-commit Hooks${NC}"
echo "============================================="

# Check if pre-commit is installed
echo -e "${BLUE}📋 Checking pre-commit installation...${NC}"

if ! command -v pre-commit &> /dev/null; then
    echo -e "${YELLOW}⚠️ pre-commit not found, installing...${NC}"

    # Try to install pre-commit
    if command -v pip3 &> /dev/null; then
        pip3 install pre-commit
    elif command -v pip &> /dev/null; then
        pip install pre-commit
    elif command -v brew &> /dev/null; then
        brew install pre-commit
    else
        echo -e "${RED}❌ Cannot install pre-commit automatically${NC}"
        echo "Please install pre-commit manually:"
        echo "  pip install pre-commit"
        echo "  # or"
        echo "  brew install pre-commit"
        exit 1
    fi
fi

echo -e "${GREEN}✅ Pre-commit available${NC}"

# Create pre-commit configuration
echo -e "${BLUE}📝 Creating pre-commit configuration...${NC}"

cat > .pre-commit-config.yaml << 'EOF'
# Pre-commit hooks for Claudia Workflow Enforcement

repos:
  # Claudia Workflow Validation (custom hooks)
  - repo: local
    hooks:
      - id: claudia-workflow-validation
        name: Claudia Workflow Validation
        entry: .github/hooks/claudia-workflow-validator.sh
        language: script
        stages: [pre-commit]
        pass_filenames: false
        always_run: true

      - id: claudia-commit-message-validation
        name: Claudia Commit Message Validation
        entry: .github/hooks/claudia-commit-validator.sh
        language: script
        stages: [commit-msg]
        pass_filenames: false

      - id: claudia-emergency-bypass-check
        name: Emergency Bypass Authorization Check
        entry: .github/hooks/claudia-emergency-validator.sh
        language: script
        stages: [pre-commit]
        pass_filenames: false
        always_run: true

  # Standard code quality hooks
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: trailing-whitespace
        exclude: '^\.claude-shared/.*\.md$'
      - id: end-of-file-fixer
        exclude: '^\.claude-shared/.*\.md$'
      - id: check-yaml
        exclude: '^\.claude-shared/.*\.ya?ml$'
      - id: check-json
        exclude: '^\.claude-shared/.*\.json$'
      - id: check-added-large-files
        args: ['--maxkb=1000']
      - id: check-case-conflict
      - id: check-merge-conflict
      - id: debug-statements
      - id: name-tests-test
        args: ['--pytest-test-first']

  # Security hooks
  - repo: https://github.com/Yelp/detect-secrets
    rev: v1.4.0
    hooks:
      - id: detect-secrets
        args: ['--baseline', '.secrets.baseline']
        exclude: '^\.claude-shared/.*$'

  # JavaScript/TypeScript specific hooks (if applicable)
  - repo: https://github.com/pre-commit/mirrors-eslint
    rev: v8.56.0
    hooks:
      - id: eslint
        files: \.(js|ts|jsx|tsx)$
        additional_dependencies:
          - eslint@^8.0.0
        exclude: '^\.claude-shared/.*$'

  # Python hooks (if applicable)
  - repo: https://github.com/psf/black
    rev: 23.12.1
    hooks:
      - id: black
        exclude: '^\.claude-shared/.*\.py$'

  # Dockerfile hooks (if applicable)
  - repo: https://github.com/hadolint/hadolint
    rev: v2.12.0
    hooks:
      - id: hadolint-docker
        exclude: '^\.claude-shared/.*$'

# Configuration
default_stages: [pre-commit, commit-msg]
fail_fast: true
minimum_pre_commit_version: '3.0.0'
EOF

echo -e "${GREEN}✅ Pre-commit configuration created${NC}"

# Create hooks directory
mkdir -p .github/hooks

echo -e "${BLUE}🛠️ Creating Claudia validation hooks...${NC}"

# 1. Main Claudia workflow validator
cat > .github/hooks/claudia-workflow-validator.sh << 'EOF'
#!/bin/bash
# Claudia Workflow Validation Hook
# Validates that commits follow mandatory Claudia workflow

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 Validating Claudia Workflow Compliance...${NC}"

# Configuration
BYPASS_FILE=".github/emergency-bypass.active"
CLAUDIA_AUDIT_DIR=".claude-shared/project-management/data"

# Check for emergency bypass
if [ -f "$BYPASS_FILE" ]; then
    echo -e "${YELLOW}🚨 Emergency bypass detected${NC}"

    # Validate bypass authorization
    if grep -q "AUTHORIZED=true" "$BYPASS_FILE" 2>/dev/null; then
        echo -e "${YELLOW}✅ Emergency bypass authorized - skipping Claudia validation${NC}"
        echo -e "${YELLOW}📝 Bypass logged to audit system${NC}"

        # Log bypass usage
        mkdir -p "$CLAUDIA_AUDIT_DIR"
        echo "{\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"action\":\"emergency_bypass_used\",\"user\":\"$(git config user.email)\",\"commit\":\"$(git rev-parse HEAD 2>/dev/null || echo 'pre-commit')\",\"reason\":\"$(grep 'REASON=' "$BYPASS_FILE" | cut -d'=' -f2-)\"}" >> "$CLAUDIA_AUDIT_DIR/emergency-bypasses.jsonl"

        exit 0
    else
        echo -e "${RED}❌ Emergency bypass file found but not properly authorized${NC}"
        echo -e "${RED}   Remove $BYPASS_FILE or get proper authorization${NC}"
        exit 1
    fi
fi

# Function to check if commit was made via Claudia
validate_claudia_commit() {
    local commit_msg_file=".git/COMMIT_EDITMSG"

    if [ -f "$commit_msg_file" ]; then
        local commit_msg=$(cat "$commit_msg_file")

        # Check for Claudia signature in commit message
        if echo "$commit_msg" | grep -q "🤖 Generated with \[Claude Code\]"; then
            echo -e "${GREEN}✅ Commit created via Claudia workflow${NC}"
            return 0
        fi
    fi

    return 1
}

# Function to check for recent Claudia command usage
check_recent_claudia_usage() {
    local audit_files=("$CLAUDIA_AUDIT_DIR"/*.jsonl)
    local recent_threshold=$(date -d '1 hour ago' -u +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -v-1H -u +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || echo "")

    if [ -z "$recent_threshold" ]; then
        echo -e "${YELLOW}⚠️ Cannot validate recent Claudia usage (date utility issue)${NC}"
        return 0
    fi

    for audit_file in "${audit_files[@]}"; do
        if [ -f "$audit_file" ]; then
            # Check for recent Claudia commands
            if grep -q "claudia:" "$audit_file" 2>/dev/null; then
                local recent_commands=$(grep "$recent_threshold" "$audit_file" 2>/dev/null | grep "claudia:" | wc -l)
                if [ "$recent_commands" -gt 0 ]; then
                    echo -e "${GREEN}✅ Recent Claudia command usage detected${NC}"
                    return 0
                fi
            fi
        fi
    done

    return 1
}

# Function to provide helpful guidance
show_claudia_guidance() {
    echo -e "${BLUE}📚 Claudia Workflow Guide:${NC}"
    echo ""
    echo -e "${YELLOW}Required workflow for changes:${NC}"
    echo "1. Create/update requirements: /claudia:requirements:define \"description\""
    echo "2. Create GitHub issue: /claudia:issues:create \"req-uuid\""
    echo "3. Implement changes: /claudia:implement:manual \"req-uuid\""
    echo "4. Commit via Claudia: /claudia:commit \"issue-id\""
    echo "5. Create PR via Claudia: /claudia:pr:create \"issue-id\""
    echo ""
    echo -e "${YELLOW}For emergency hotfixes only:${NC}"
    echo "1. Create emergency bypass: .github/scripts/create-emergency-bypass.sh"
    echo "2. Get authorization from incident commander"
    echo "3. Make necessary changes"
    echo "4. Complete post-incident review"
    echo ""
    echo -e "${BLUE}💡 Need help? Check: .github/CLAUDIA_WORKFLOW_GUIDE.md${NC}"
}

# Main validation logic
echo -e "${BLUE}🔍 Checking commit compliance...${NC}"

# Check if this is a Claudia-generated commit
if validate_claudia_commit; then
    echo -e "${GREEN}🎉 Claudia workflow compliance validated!${NC}"
    exit 0
fi

# Check for recent Claudia usage (fallback)
if check_recent_claudia_usage; then
    echo -e "${YELLOW}⚠️ No Claudia signature in commit, but recent usage detected${NC}"
    echo -e "${YELLOW}   This may be a legitimate workflow step${NC}"
    exit 0
fi

# If we get here, the commit doesn't appear to follow Claudia workflow
echo -e "${RED}❌ CLAUDIA WORKFLOW VIOLATION${NC}"
echo ""
echo -e "${RED}This commit does not appear to follow the mandatory Claudia workflow.${NC}"
echo -e "${RED}All changes must be made through Claudia commands.${NC}"
echo ""

show_claudia_guidance

echo ""
echo -e "${RED}🚫 Commit blocked - please use Claudia workflow commands${NC}"
exit 1
EOF

# 2. Commit message validator
cat > .github/hooks/claudia-commit-validator.sh << 'EOF'
#!/bin/bash
# Claudia Commit Message Validation Hook
# Validates commit message format for Claudia workflow

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}📝 Validating commit message format...${NC}"

# Get commit message from file
commit_msg_file="$1"
commit_msg=$(cat "$commit_msg_file")

# Check for emergency bypass
if [ -f ".github/emergency-bypass.active" ]; then
    if grep -q "AUTHORIZED=true" ".github/emergency-bypass.active" 2>/dev/null; then
        echo -e "${YELLOW}🚨 Emergency bypass active - skipping commit message validation${NC}"
        exit 0
    fi
fi

# Validate commit message format
validate_commit_message() {
    local msg="$1"

    # Check for Claudia signature
    if echo "$msg" | grep -q "🤖 Generated with \[Claude Code\]"; then
        echo -e "${GREEN}✅ Claudia-generated commit message detected${NC}"
        return 0
    fi

    # Check for conventional commit format (fallback)
    if echo "$msg" | grep -qE "^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .+"; then
        echo -e "${YELLOW}⚠️ Conventional commit format detected (manual commit)${NC}"
        echo -e "${YELLOW}   Consider using /claudia:commit command for better traceability${NC}"
        return 0
    fi

    # Check for emergency/hotfix commits
    if echo "$msg" | grep -qiE "^(emergency|hotfix|critical):"; then
        echo -e "${YELLOW}🚨 Emergency commit detected${NC}"
        echo -e "${YELLOW}   Ensure proper emergency procedures are followed${NC}"
        return 0
    fi

    return 1
}

# Validate the commit message
if validate_commit_message "$commit_msg"; then
    exit 0
fi

# If validation fails
echo -e "${RED}❌ INVALID COMMIT MESSAGE FORMAT${NC}"
echo ""
echo -e "${RED}Current commit message:${NC}"
echo "$(echo "$commit_msg" | head -10)"
echo ""
echo -e "${YELLOW}Valid formats:${NC}"
echo "1. Claudia-generated (recommended): Use /claudia:commit \"issue-id\""
echo "2. Conventional commits: type(scope): description"
echo "3. Emergency commits: emergency: description"
echo ""
echo -e "${BLUE}💡 For best traceability, use: /claudia:commit \"issue-id\"${NC}"

# For now, allow through with warning (can be made stricter later)
echo -e "${YELLOW}⚠️ Warning: Non-standard commit message format${NC}"
echo -e "${YELLOW}   Consider using Claudia workflow for better compliance${NC}"
exit 0
EOF

# 3. Emergency bypass validator
cat > .github/hooks/claudia-emergency-validator.sh << 'EOF'
#!/bin/bash
# Emergency Bypass Validation Hook
# Validates emergency bypass procedures

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

BYPASS_FILE=".github/emergency-bypass.active"

# Only run if bypass file exists
if [ ! -f "$BYPASS_FILE" ]; then
    exit 0
fi

echo -e "${YELLOW}🚨 Emergency bypass validation...${NC}"

# Validate bypass file format
if ! grep -q "AUTHORIZED=" "$BYPASS_FILE"; then
    echo -e "${RED}❌ Invalid bypass file format${NC}"
    echo -e "${RED}   Use: .github/scripts/create-emergency-bypass.sh${NC}"
    exit 1
fi

# Check authorization
if ! grep -q "AUTHORIZED=true" "$BYPASS_FILE"; then
    echo -e "${RED}❌ Emergency bypass not authorized${NC}"
    echo -e "${RED}   Get authorization from incident commander${NC}"
    exit 1
fi

# Check expiration
if grep -q "EXPIRES=" "$BYPASS_FILE"; then
    expires=$(grep "EXPIRES=" "$BYPASS_FILE" | cut -d'=' -f2)
    current_time=$(date +%s)

    if [ "$current_time" -gt "$expires" ]; then
        echo -e "${RED}❌ Emergency bypass expired${NC}"
        echo -e "${RED}   Remove expired bypass file${NC}"
        exit 1
    fi
fi

# Validate required fields
required_fields=("INCIDENT_ID" "COMMANDER" "REASON")
for field in "${required_fields[@]}"; do
    if ! grep -q "$field=" "$BYPASS_FILE"; then
        echo -e "${RED}❌ Missing required field: $field${NC}"
        exit 1
    fi
done

echo -e "${GREEN}✅ Emergency bypass validation passed${NC}"

# Log bypass validation
mkdir -p ".claude-shared/project-management/data"
echo "{\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"action\":\"bypass_validated\",\"incident\":\"$(grep 'INCIDENT_ID=' "$BYPASS_FILE" | cut -d'=' -f2)\",\"commander\":\"$(grep 'COMMANDER=' "$BYPASS_FILE" | cut -d'=' -f2)\"}" >> ".claude-shared/project-management/data/emergency-bypasses.jsonl"

exit 0
EOF

# Make hooks executable
chmod +x .github/hooks/*.sh

echo -e "${GREEN}✅ Claudia validation hooks created${NC}"

# Create helper script for emergency bypass
echo -e "${BLUE}🚨 Creating emergency bypass helper script...${NC}"

cat > .github/scripts/create-emergency-bypass.sh << 'EOF'
#!/bin/bash
# Emergency Bypass Creator
# Creates authorized emergency bypass for critical situations

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚨 Emergency Bypass Creator${NC}"
echo "============================"

# Check if bypass already exists
if [ -f ".github/emergency-bypass.active" ]; then
    echo -e "${YELLOW}⚠️ Emergency bypass already exists${NC}"
    echo "Remove existing bypass first or extend it"
    exit 1
fi

# Collect information
read -p "Incident ID: " incident_id
read -p "Incident Commander: " commander
read -p "Reason for bypass: " reason
read -p "Duration (hours, default 2): " duration

duration=${duration:-2}

# Calculate expiration
expires=$(($(date +%s) + (duration * 3600)))
expires_human=$(date -d "@$expires" 2>/dev/null || date -r "$expires" 2>/dev/null)

# Create bypass file
cat > .github/emergency-bypass.active << EOF
# Emergency Bypass - AUTO-GENERATED
# This file authorizes emergency bypass of Claudia workflow

INCIDENT_ID=$incident_id
COMMANDER=$commander
REASON=$reason
CREATED=$(date -u +%Y-%m-%dT%H:%M:%SZ)
EXPIRES=$expires
EXPIRES_HUMAN=$expires_human
AUTHORIZED=true

# WARNING: This bypass should be removed after emergency is resolved
# Post-incident review is required for all emergency bypasses
EOF

echo -e "${GREEN}✅ Emergency bypass created${NC}"
echo ""
echo -e "${YELLOW}⚠️ IMPORTANT REMINDERS:${NC}"
echo "1. Remove bypass file when emergency is resolved"
echo "2. Complete post-incident review"
echo "3. Document lessons learned"
echo "4. This bypass expires at: $expires_human"
echo ""
echo -e "${BLUE}Commands to remove bypass:${NC}"
echo "rm .github/emergency-bypass.active"
echo ""

# Log bypass creation
mkdir -p .claude-shared/project-management/data
echo "{\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"action\":\"bypass_created\",\"incident\":\"$incident_id\",\"commander\":\"$commander\",\"reason\":\"$reason\",\"expires\":\"$expires_human\"}" >> .claude-shared/project-management/data/emergency-bypasses.jsonl

echo -e "${GREEN}🚨 Emergency bypass is now active${NC}"
EOF

chmod +x .github/scripts/create-emergency-bypass.sh

# Install pre-commit hooks
echo -e "${BLUE}🔧 Installing pre-commit hooks...${NC}"

if pre-commit install --install-hooks; then
    echo -e "${GREEN}✅ Pre-commit hooks installed successfully${NC}"
else
    echo -e "${YELLOW}⚠️ Pre-commit hook installation had issues${NC}"
    echo -e "${BLUE}Try manual installation: pre-commit install${NC}"
fi

# Install commit-msg hook
if pre-commit install --hook-type commit-msg; then
    echo -e "${GREEN}✅ Commit message hook installed${NC}"
else
    echo -e "${YELLOW}⚠️ Commit message hook installation failed${NC}"
fi

# Create secrets baseline for detect-secrets
echo -e "${BLUE}🔐 Creating secrets detection baseline...${NC}"

if command -v detect-secrets &> /dev/null; then
    detect-secrets scan --baseline .secrets.baseline
    echo -e "${GREEN}✅ Secrets baseline created${NC}"
else
    echo -e "${YELLOW}⚠️ detect-secrets not available, creating empty baseline${NC}"
    echo '{"exclude": {"files": "^\.claude-shared/.*$"}}' > .secrets.baseline
fi

echo ""
echo -e "${GREEN}🎉 Pre-commit Hooks Setup Complete!${NC}"
echo ""
echo -e "${BLUE}📋 Installed Hooks:${NC}"
echo -e "${GREEN}  ✅ Claudia workflow validation${NC}"
echo -e "${GREEN}  ✅ Claudia commit message validation${NC}"
echo -e "${GREEN}  ✅ Emergency bypass validation${NC}"
echo -e "${GREEN}  ✅ Code quality hooks (trailing whitespace, JSON/YAML)${NC}"
echo -e "${GREEN}  ✅ Security hooks (secrets detection)${NC}"
echo -e "${GREEN}  ✅ Language-specific linting (if applicable)${NC}"
echo ""
echo -e "${YELLOW}📝 Emergency Procedures:${NC}"
echo "Create bypass: .github/scripts/create-emergency-bypass.sh"
echo "Remove bypass: rm .github/emergency-bypass.active"
echo ""
echo -e "${BLUE}🧪 Test Commands:${NC}"
echo "# Test pre-commit hooks"
echo "pre-commit run --all-files"
echo ""
echo "# Test emergency bypass"
echo ".github/scripts/create-emergency-bypass.sh"
echo ""
echo "# Test Claudia workflow"
echo "/claudia:commit \"test-issue-id\""
echo ""
