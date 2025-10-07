#!/bin/bash
# GitHub Issues Integration Setup for Claudia Workflow
# This script configures GitHub Issues to work seamlessly with Claudia commands

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Phase 1A: Setting up GitHub Issues Integration${NC}"
echo "===================================================="

# Create issue templates directory
mkdir -p .github/ISSUE_TEMPLATE

echo -e "${BLUE}📝 Creating issue templates for Claudia workflow...${NC}"

# 1. Claudia Requirement Issue Template
cat > .github/ISSUE_TEMPLATE/claudia-requirement.yml << 'EOF'
name: 🔍 Claudia Requirement
description: Create a requirement through Claudia workflow system
title: "[REQ] "
labels: ["claudia:requirement", "type:requirement"]
assignees: []
body:
  - type: markdown
    attributes:
      value: |
        ## 🔍 Claudia Requirement Creation

        This issue was created through the Claudia requirements workflow.

        > **⚠️ IMPORTANT**: This issue should only be created via `/claudia:issues:create` command.
        > Manual creation may break workflow traceability.

  - type: input
    id: requirement-uuid
    attributes:
      label: "Requirement UUID"
      description: "The UUID from the requirement document (e.g., 002-01-theme-toggle-removal)"
      placeholder: "XXX-XX-requirement-name"
    validations:
      required: true

  - type: input
    id: sprint-number
    attributes:
      label: "Sprint Number"
      description: "The sprint this requirement belongs to"
      placeholder: "002"
    validations:
      required: true

  - type: textarea
    id: requirement-description
    attributes:
      label: "Requirement Description"
      description: "Brief description of what needs to be implemented"
      placeholder: "Describe the requirement..."
    validations:
      required: true

  - type: textarea
    id: acceptance-criteria
    attributes:
      label: "Acceptance Criteria"
      description: "List the specific criteria that must be met"
      placeholder: |
        - [ ] Criterion 1
        - [ ] Criterion 2
        - [ ] Criterion 3
    validations:
      required: true

  - type: dropdown
    id: complexity
    attributes:
      label: "Complexity"
      description: "Estimated complexity level"
      options:
        - Simple (1-2 days)
        - Medium (3-5 days)
        - Complex (1-2 weeks)
        - Epic (2+ weeks)
    validations:
      required: true

  - type: checkboxes
    id: claudia-workflow
    attributes:
      label: "Claudia Workflow Checklist"
      description: "Track progress through Claudia workflow"
      options:
        - label: "Requirements document created in `.claude-shared/project-management/4-requirements/`"
          required: false
        - label: "Issue created via `/claudia:issues:create` command"
          required: false
        - label: "Implementation started via `/claudia:implement:manual` or `/claudia:implement:auto`"
          required: false
        - label: "Code committed via `/claudia:commit` command"
          required: false
        - label: "Pull request created via `/claudia:pr:create` command"
          required: false

  - type: textarea
    id: links
    attributes:
      label: "Related Links"
      description: "Links to related documents, PRs, etc."
      placeholder: |
        - Requirements Doc: `.claude-shared/project-management/4-requirements/XXX-XX-requirement.md`
        - Sprint Doc: `.claude-shared/project-management/3-sprints/XXX.md`
        - Pull Request: #XXX
EOF

# 2. Claudia Sprint Issue Template
cat > .github/ISSUE_TEMPLATE/claudia-sprint.yml << 'EOF'
name: 🚀 Claudia Sprint
description: Sprint planning and tracking issue
title: "[SPRINT] Sprint XXX - "
labels: ["claudia:sprint", "type:sprint"]
assignees: []
body:
  - type: markdown
    attributes:
      value: |
        ## 🚀 Claudia Sprint Planning

        This issue tracks a complete sprint through the Claudia workflow system.

  - type: input
    id: sprint-number
    attributes:
      label: "Sprint Number"
      description: "3-digit sprint number"
      placeholder: "002"
    validations:
      required: true

  - type: input
    id: sprint-goal
    attributes:
      label: "Sprint Goal"
      description: "Main objective for this sprint"
      placeholder: "What is the primary goal of this sprint?"
    validations:
      required: true

  - type: textarea
    id: requirements-list
    attributes:
      label: "Requirements"
      description: "List of requirements for this sprint"
      placeholder: |
        - [ ] 002-01-requirement-name
        - [ ] 002-02-another-requirement
    validations:
      required: true

  - type: input
    id: duration
    attributes:
      label: "Sprint Duration"
      description: "Expected duration"
      placeholder: "2 weeks"
    validations:
      required: true

  - type: checkboxes
    id: sprint-phases
    attributes:
      label: "Sprint Phases"
      description: "Track sprint progress"
      options:
        - label: "Sprint created via `/claudia:sprint:create` command"
          required: false
        - label: "Requirements defined and linked"
          required: false
        - label: "All requirements have GitHub issues"
          required: false
        - label: "Implementation in progress"
          required: false
        - label: "All requirements completed"
          required: false
        - label: "Sprint retrospective completed"
          required: false
EOF

# 3. Claudia Bug/Hotfix Template for Emergency Bypass
cat > .github/ISSUE_TEMPLATE/claudia-emergency.yml << 'EOF'
name: 🚨 Emergency Hotfix
description: Critical issue requiring emergency bypass procedures
title: "[EMERGENCY] "
labels: ["priority:critical", "type:emergency", "bypass:approved"]
assignees: []
body:
  - type: markdown
    attributes:
      value: |
        ## 🚨 EMERGENCY HOTFIX PROCEDURE

        **⚠️ WARNING**: This template is for CRITICAL issues only that require bypassing normal Claudia workflow.

        All emergency bypasses are logged and require post-incident review.

  - type: dropdown
    id: severity
    attributes:
      label: "Severity Level"
      description: "How critical is this issue?"
      options:
        - "P0 - System Down (Complete Outage)"
        - "P1 - Critical Feature Broken"
        - "P2 - Major Feature Degraded"
        - "P3 - Minor Issue (Should use normal workflow)"
    validations:
      required: true

  - type: textarea
    id: impact-description
    attributes:
      label: "Impact Description"
      description: "What is broken and how does it affect users?"
      placeholder: "Describe the current impact..."
    validations:
      required: true

  - type: input
    id: business-justification
    attributes:
      label: "Business Justification"
      description: "Why can't this wait for normal Claudia workflow?"
      placeholder: "Why is emergency bypass necessary?"
    validations:
      required: true

  - type: checkboxes
    id: emergency-checklist
    attributes:
      label: "Emergency Procedure Checklist"
      description: "Required steps for emergency bypass"
      options:
        - label: "Incident commander assigned"
          required: true
        - label: "Stakeholders notified"
          required: true
        - label: "Rollback plan prepared"
          required: true
        - label: "Post-incident review scheduled"
          required: true

  - type: textarea
    id: rollback-plan
    attributes:
      label: "Rollback Plan"
      description: "How to revert changes if fix fails"
      placeholder: "Steps to rollback if necessary..."
    validations:
      required: true
EOF

echo -e "${GREEN}✅ Issue templates created${NC}"

# Create labels for Claudia workflow
echo -e "${BLUE}🏷️ Setting up Claudia workflow labels...${NC}"

# Check if we can create labels (requires repo access)
if gh label list &> /dev/null; then
    echo -e "${BLUE}Creating Claudia workflow labels...${NC}"

    # Claudia workflow labels
    gh label create "claudia:requirement" --description "Issue created via Claudia requirements workflow" --color "0052CC" --force
    gh label create "claudia:sprint" --description "Sprint tracking issue" --color "5319E7" --force
    gh label create "claudia:implementation" --description "Implementation in progress" --color "0E8A16" --force
    gh label create "claudia:review" --description "Code review required" --color "FBCA04" --force
    gh label create "claudia:emergency" --description "Emergency hotfix bypass" --color "D93F0B" --force

    # Type labels
    gh label create "type:requirement" --description "Requirement definition" --color "1F77B4" --force
    gh label create "type:sprint" --description "Sprint planning" --color "FF7F0E" --force
    gh label create "type:bug" --description "Bug fix" --color "D62728" --force
    gh label create "type:feature" --description "New feature" --color "2CA02C" --force
    gh label create "type:emergency" --description "Emergency fix" --color "8B0000" --force

    # Priority labels
    gh label create "priority:critical" --description "Critical priority" --color "B60205" --force
    gh label create "priority:high" --description "High priority" --color "D93F0B" --force
    gh label create "priority:medium" --description "Medium priority" --color "FBCA04" --force
    gh label create "priority:low" --description "Low priority" --color "0E8A16" --force

    # Bypass labels
    gh label create "bypass:approved" --description "Emergency bypass approved" --color "FF0000" --force
    gh label create "bypass:review" --description "Bypass requires review" --color "FF6600" --force

    echo -e "${GREEN}✅ Labels created successfully${NC}"
else
    echo -e "${YELLOW}⚠️ Cannot create labels - may need manual setup${NC}"
    echo "Run manually: gh label create [label-name] --description [description] --color [color]"
fi

# Create issue configuration
cat > .github/issue-config.yml << 'EOF'
# GitHub Issues Configuration for Claudia Workflow

# Issue Assignment Rules
assignment:
  # Auto-assign based on labels
  claudia:requirement: ["maintainer", "product-owner"]
  claudia:sprint: ["scrum-master", "team-lead"]
  claudia:emergency: ["incident-commander", "senior-dev"]

# Required Labels
required_labels:
  - type:*  # All issues must have a type
  - priority:*  # All issues must have priority (except emergency)

# Label Validation
label_validation:
  # Emergency issues must have specific labels
  emergency_required:
    - priority:critical
    - bypass:approved
    - type:emergency

# Auto-close Rules
auto_close:
  stale_days: 30
  exempt_labels:
    - priority:critical
    - claudia:sprint
    - bypass:*

# Workflow Integration
claudia_integration:
  # Commands that create issues
  issue_creators:
    - "/claudia:issues:create"
    - "/claudia:sprint:create"
    - "/claudia:emergency:create"

  # Required workflow progression
  workflow_progression:
    1: "claudia:requirement"
    2: "claudia:implementation"
    3: "claudia:review"
    4: "completed"

# Notifications
notifications:
  emergency: ["@incident-team"]
  critical: ["@dev-team"]
  sprint: ["@scrum-master"]
EOF

echo -e "${GREEN}✅ Issue configuration created${NC}"

echo ""
echo -e "${GREEN}🎉 GitHub Issues Setup Complete!${NC}"
echo ""
echo -e "${BLUE}📋 Created Templates:${NC}"
echo "1. Claudia Requirement Template - For requirement tracking"
echo "2. Claudia Sprint Template - For sprint management"
echo "3. Emergency Hotfix Template - For critical bypasses"
echo ""
echo -e "${BLUE}🏷️ Created Labels:${NC}"
echo "- Claudia workflow labels (claudia:*)"
echo "- Type labels (type:*)"
echo "- Priority labels (priority:*)"
echo "- Bypass labels (bypass:*)"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo "1. Test issue creation via Claudia commands"
echo "2. Configure project automation"
echo "3. Set up GitHub Actions for enforcement"
echo ""
