#!/bin/bash
# GitHub Discussions Setup for Team Collaboration
# This script configures GitHub Discussions for Claudia workflow collaboration

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}💬 Phase 1A: Setting up GitHub Discussions${NC}"
echo "============================================="

# Check if discussions are enabled
echo -e "${BLUE}📋 Checking GitHub Discussions availability...${NC}"

# Note: GitHub Discussions must be enabled manually in repository settings
# This script creates the structure and guidelines

# Create discussions configuration
mkdir -p .github/discussions

echo -e "${BLUE}📝 Creating discussion categories and templates...${NC}"

# 1. Discussion Categories Configuration
cat > .github/discussions/categories.yml << 'EOF'
# GitHub Discussions Categories for Claudia Workflow

categories:
  # Sprint Planning & Review
  - name: "Sprint Planning"
    emoji: "🚀"
    description: "Sprint planning discussions, retrospectives, and sprint-related coordination"
    format: "open-ended-discussion"

  # Requirements & Architecture
  - name: "Requirements Analysis"
    emoji: "🔍"
    description: "Requirements discussion, clarification, and architectural decisions"
    format: "open-ended-discussion"

  # Technical Implementation
  - name: "Technical Discussion"
    emoji: "🛠️"
    description: "Technical implementation discussions, code architecture, and development approaches"
    format: "open-ended-discussion"

  # Claudia Workflow
  - name: "Claudia Workflow"
    emoji: "🤖"
    description: "Questions, issues, and improvements related to Claudia automation workflow"
    format: "question-answer"

  # Team Coordination
  - name: "Team Coordination"
    emoji: "👥"
    description: "Team coordination, announcements, and general project communication"
    format: "announcement"

  # Code Review & Quality
  - name: "Code Review Discussion"
    emoji: "👀"
    description: "Code review discussions, quality gates, and best practices"
    format: "open-ended-discussion"

  # Emergency & Incidents
  - name: "Incident Response"
    emoji: "🚨"
    description: "Emergency response coordination and post-incident reviews"
    format: "open-ended-discussion"

  # Process Improvement
  - name: "Process Improvement"
    emoji: "📈"
    description: "Suggestions for improving development processes and workflows"
    format: "idea"

  # General Q&A
  - name: "General Q&A"
    emoji: "❓"
    description: "General questions about the project, tools, or processes"
    format: "question-answer"
EOF

# 2. Discussion Templates
mkdir -p .github/DISCUSSION_TEMPLATE

# Sprint Planning Discussion Template
cat > .github/DISCUSSION_TEMPLATE/sprint-planning.md << 'EOF'
---
labels: ["claudia:sprint", "discussion:planning"]
---

# Sprint XXX Planning Discussion

## Sprint Overview
- **Sprint Number**: XXX
- **Sprint Goal**: [Main objective for this sprint]
- **Duration**: [Start Date - End Date]
- **Sprint Lead**: @[username]

## Proposed Requirements
<!-- List requirements to be included in this sprint -->

- [ ] **002-01-requirement-name** - Brief description
  - Complexity: [Simple/Medium/Complex/Epic]
  - Estimated effort: [X days]
  - Dependencies: [List any dependencies]

- [ ] **002-02-another-requirement** - Brief description
  - Complexity: [Simple/Medium/Complex/Epic]
  - Estimated effort: [X days]
  - Dependencies: [List any dependencies]

## Team Capacity
- **Available developers**: X
- **Total capacity**: X story points / X days
- **Planned capacity**: X story points / X days
- **Buffer**: X% for unexpected issues

## Discussion Points
<!-- Add specific items for discussion -->

1. **Requirement Prioritization**
   - Which requirements are must-have vs nice-to-have?
   - Any blocked requirements from previous sprints?

2. **Technical Risks**
   - What are the main technical challenges?
   - Do we need any research spikes?

3. **Dependencies & Blockers**
   - External dependencies?
   - Team availability considerations?

## Decision Items
<!-- Items that need team decision -->

- [ ] **Final requirement list approved**
- [ ] **Sprint goal confirmed**
- [ ] **Capacity planning approved**
- [ ] **Risk mitigation plans agreed**

## Action Items
<!-- Track commitments and next steps -->

- [ ] @[username] - Create sprint document via `/claudia:sprint:create`
- [ ] @[username] - Define requirements via `/claudia:requirements:define`
- [ ] @[username] - Set up GitHub issues for all requirements
- [ ] @[username] - Configure project board

---

**Sprint Creation Command**:
```bash
/claudia:sprint:create "XXX"
```

**Next Steps After Planning**:
1. Execute `/claudia:sprint:create` command
2. Create requirement documents for each approved item
3. Generate GitHub issues via `/claudia:issues:create`
4. Begin implementation planning
EOF

# Sprint Retrospective Template
cat > .github/DISCUSSION_TEMPLATE/sprint-retrospective.md << 'EOF'
---
labels: ["claudia:sprint", "discussion:retrospective"]
---

# Sprint XXX Retrospective

## Sprint Summary
- **Sprint Number**: XXX
- **Duration**: [Actual dates]
- **Sprint Goal**: [Was the goal achieved? ✅/❌]
- **Requirements Completed**: X/Y
- **Team**: [List team members]

## Sprint Metrics
- **Planned Story Points**: X
- **Completed Story Points**: X
- **Velocity**: X points/week
- **Claudia Command Usage**: X commands executed
- **Emergency Bypasses**: X (if any)

## What Went Well ✅
<!-- Celebrate successes and positive aspects -->

1. **Technical Achievements**
   - [What worked well technically?]

2. **Process Improvements**
   - [What process improvements worked?]

3. **Team Collaboration**
   - [How did team collaboration go?]

4. **Claudia Workflow**
   - [How well did the Claudia automation work?]

## What Didn't Go Well ❌
<!-- Identify challenges and areas for improvement -->

1. **Technical Challenges**
   - [What technical issues occurred?]

2. **Process Issues**
   - [What process problems did we encounter?]

3. **Team Coordination**
   - [Any team coordination issues?]

4. **Workflow Problems**
   - [Any Claudia workflow issues?]

## Action Items for Next Sprint 🎯
<!-- Specific, actionable improvements -->

- [ ] **@[username]** - [Specific action with deadline]
- [ ] **@[username]** - [Specific action with deadline]
- [ ] **Team** - [Team-wide improvement]

## Claudia Workflow Analysis
<!-- Evaluate how well the mandatory workflow performed -->

### Workflow Compliance
- **Total Commits**: X
- **Claudia Commands Used**: X
- **Direct Pushes**: X (should be 0)
- **Emergency Bypasses**: X

### Command Effectiveness
- **Most Used Commands**:
  - `/claudia:commit` - X uses
  - `/claudia:pr:create` - X uses
  - `/claudia:issues:create` - X uses

- **Command Issues**:
  - [Any commands that had problems?]
  - [Any commands that need improvement?]

### Process Improvements
- [Suggestions for improving Claudia workflow]
- [New commands or features needed]

## Next Sprint Preparation
- **Sprint Goal Ideas**: [Ideas for next sprint]
- **Backlog Grooming**: [Items that need refinement]
- **Process Changes**: [Any process changes for next sprint]

---

**Post-Retrospective Actions**:
1. Update process documentation
2. Create improvement tickets if needed
3. Plan next sprint based on learnings
4. Update Claudia commands if improvements identified
EOF

# Technical Discussion Template
cat > .github/DISCUSSION_TEMPLATE/technical-discussion.md << 'EOF'
---
labels: ["discussion:technical", "claudia:architecture"]
---

# Technical Discussion: [Topic Title]

## Context
<!-- Provide background and context for this technical discussion -->

**Related to**: [Sprint/Requirement/Feature]
**Stakeholders**: @[username1] @[username2]
**Priority**: [High/Medium/Low]

## Problem Statement
<!-- Clearly describe the technical problem or decision needed -->

[Describe the technical challenge, architectural decision, or implementation question]

## Proposed Solutions
<!-- Present different approaches or solutions -->

### Option 1: [Approach Name]
**Description**: [Brief description]

**Pros**:
- [Advantage 1]
- [Advantage 2]

**Cons**:
- [Disadvantage 1]
- [Disadvantage 2]

**Implementation effort**: [Low/Medium/High]

### Option 2: [Approach Name]
**Description**: [Brief description]

**Pros**:
- [Advantage 1]
- [Advantage 2]

**Cons**:
- [Disadvantage 1]
- [Disadvantage 2]

**Implementation effort**: [Low/Medium/High]

## Technical Considerations
<!-- List important technical factors to consider -->

- **Performance Impact**: [How will this affect performance?]
- **Scalability**: [Scalability considerations]
- **Maintainability**: [Long-term maintenance implications]
- **Testing Strategy**: [How will this be tested?]
- **Security Implications**: [Any security concerns?]
- **Integration Points**: [How does this integrate with existing systems?]

## Decision Criteria
<!-- What factors will drive the decision? -->

1. [Criterion 1]
2. [Criterion 2]
3. [Criterion 3]

## Implementation Plan
<!-- If decision is made, outline implementation approach -->

**Chosen Solution**: [Which option was selected]

**Implementation Steps**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Timeline**: [Expected timeframe]
**Assignee**: @[username]

## Follow-up Actions
<!-- Track next steps -->

- [ ] **@[username]** - [Specific action]
- [ ] **@[username]** - [Specific action]
- [ ] Create implementation ticket
- [ ] Update architecture documentation

---

**Claudia Integration**:
If this requires new implementation, create via:
```bash
/claudia:requirements:define "[Technical implementation name]"
```
EOF

echo -e "${GREEN}✅ Discussion templates created${NC}"

# Create discussion guidelines
cat > .github/DISCUSSION_GUIDELINES.md << 'EOF'
# GitHub Discussions Guidelines

## Purpose
GitHub Discussions serve as the primary collaboration platform for the Claudia workflow system, facilitating team communication, decision-making, and knowledge sharing.

## Discussion Categories

### 🚀 Sprint Planning
- Sprint planning meetings and coordination
- Sprint retrospectives and reviews
- Sprint goal discussions and adjustments
- Capacity planning and resource allocation

**Best Practices**:
- Use sprint planning template for new sprints
- Tag all relevant team members
- Link to corresponding sprint documents
- Follow up with actual `/claudia:sprint:create` command execution

### 🔍 Requirements Analysis
- Requirement clarification and refinement
- Business logic discussions
- User story elaboration
- Acceptance criteria validation

**Best Practices**:
- Reference related planning documents
- Include stakeholder input
- Document decisions made
- Link to requirement documents in `.claude-shared/`

### 🛠️ Technical Discussion
- Architecture decisions
- Implementation approaches
- Technology choices
- Code design patterns

**Best Practices**:
- Use technical discussion template
- Include code examples where relevant
- Consider performance and scalability
- Document architectural decisions (ADRs)

### 🤖 Claudia Workflow
- Questions about Claudia commands
- Workflow improvement suggestions
- Command issues or bugs
- Process optimization ideas

**Best Practices**:
- Include command examples
- Describe expected vs actual behavior
- Suggest improvements with rationale
- Test proposed changes in dev environment

### 👥 Team Coordination
- Team announcements
- Schedule coordination
- Role assignments
- General team communication

**Best Practices**:
- Keep announcements clear and actionable
- Use @mentions for specific assignments
- Include relevant deadlines
- Follow up on action items

### 👀 Code Review Discussion
- Complex code review discussions
- Coding standards clarification
- Quality gate discussions
- Best practices sharing

**Best Practices**:
- Link to specific PRs or code
- Focus on constructive feedback
- Share learning opportunities
- Document consensus decisions

### 🚨 Incident Response
- Emergency situation coordination
- Post-incident analysis
- Process improvement after incidents
- Emergency bypass procedure discussions

**Best Practices**:
- Use clear, urgent communication
- Document timeline of events
- Include root cause analysis
- Plan prevention measures

## Discussion Etiquette

### DO:
- ✅ Use appropriate categories and labels
- ✅ Provide clear context and background
- ✅ Tag relevant team members
- ✅ Follow up on action items
- ✅ Document decisions and outcomes
- ✅ Link to related issues, PRs, or documents
- ✅ Use markdown for formatting
- ✅ Be respectful and constructive

### DON'T:
- ❌ Use discussions for urgent issues (use Slack/direct communication)
- ❌ Duplicate information from issues or PRs
- ❌ Leave discussions without resolution
- ❌ Use vague titles or descriptions
- ❌ Ignore team member responses
- ❌ Make decisions without proper stakeholder input

## Integration with Claudia Workflow

### Command Planning
Use discussions to plan before executing Claudia commands:
- Discuss sprint goals before `/claudia:sprint:create`
- Refine requirements before `/claudia:requirements:define`
- Plan implementation approach before `/claudia:implement:*`

### Decision Documentation
- Document architectural decisions made in discussions
- Link decisions to implementation tickets
- Update process documentation based on discussion outcomes

### Workflow Improvements
- Suggest Claudia command improvements
- Discuss new workflow features
- Share command usage tips and best practices

## Moderation and Maintenance

### Discussion Lifecycle
1. **Active Discussion**: Ongoing conversation and collaboration
2. **Decision Made**: Clear outcome documented
3. **Action Items**: Follow-up tasks assigned
4. **Closed**: Discussion completed with documented outcome

### Cleanup Process
- Monthly review of open discussions
- Archive completed discussions
- Update documentation based on outcomes
- Remove outdated or duplicate discussions

## Templates Usage

### When to Use Templates
- **Always** use templates for structured discussions (sprint planning, technical decisions)
- **Consider** templates for complex discussions requiring specific information
- **Customize** templates as needed for specific situations

### Template Maintenance
- Update templates based on team feedback
- Add new templates for recurring discussion patterns
- Remove or modify templates that aren't useful

---

**Remember**: Discussions complement but don't replace the mandatory Claudia workflow. All implementation work must still go through proper Claudia commands and GitHub Issues.
EOF

echo -e "${GREEN}✅ Discussion guidelines created${NC}"

# Create automation for discussions
cat > .github/workflows/discussions-automation.yml << 'EOF'
name: Discussions Automation

on:
  discussion:
    types: [created, edited, answered, category_changed]
  discussion_comment:
    types: [created, edited]

jobs:
  auto-label:
    runs-on: ubuntu-latest
    if: github.event.action == 'created'
    steps:
      - name: Auto-label based on category
        uses: actions/github-script@v7
        with:
          script: |
            const categoryLabels = {
              'Sprint Planning': ['claudia:sprint', 'discussion:planning'],
              'Requirements Analysis': ['claudia:requirement', 'discussion:requirements'],
              'Technical Discussion': ['discussion:technical'],
              'Claudia Workflow': ['claudia:workflow', 'discussion:process'],
              'Team Coordination': ['discussion:team'],
              'Code Review Discussion': ['discussion:review'],
              'Incident Response': ['priority:critical', 'discussion:incident'],
              'Process Improvement': ['discussion:improvement']
            };

            const category = context.payload.discussion.category.name;
            const labels = categoryLabels[category] || [];

            if (labels.length > 0) {
              await github.rest.issues.addLabels({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: context.payload.discussion.number,
                labels: labels
              });
            }

  notify-team:
    runs-on: ubuntu-latest
    if: github.event.action == 'created' && contains(github.event.discussion.category.name, 'Sprint Planning')
    steps:
      - name: Notify team of sprint planning
        uses: actions/github-script@v7
        with:
          script: |
            const message = `
            🚀 New Sprint Planning Discussion Created!

            **Title**: ${context.payload.discussion.title}
            **Created by**: @${context.payload.discussion.user.login}
            **Link**: ${context.payload.discussion.html_url}

            Please review and participate in the planning discussion.
            `;

            // Add comment mentioning team (customize as needed)
            await github.rest.discussions.createDiscussionComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              discussion_number: context.payload.discussion.number,
              body: `👥 Team members please review and participate:\n\n@${context.repo.owner} - Please assign relevant team members`
            });

  track-decisions:
    runs-on: ubuntu-latest
    if: contains(github.event.discussion.body, 'Decision:') || contains(github.event.discussion.body, 'DECIDED:')
    steps:
      - name: Track architectural decisions
        uses: actions/github-script@v7
        with:
          script: |
            // Create an issue to track the decision implementation
            const title = `[ADR] Implement decision from discussion: ${context.payload.discussion.title}`;
            const body = `
            ## Architectural Decision Record

            **Source Discussion**: ${context.payload.discussion.html_url}
            **Decision Date**: ${new Date().toISOString().split('T')[0]}
            **Status**: To Be Implemented

            ## Context
            Decision made in team discussion: ${context.payload.discussion.title}

            ## Decision
            [Extract decision details from discussion]

            ## Implementation Tasks
            - [ ] Update documentation
            - [ ] Implement changes
            - [ ] Update tests
            - [ ] Communicate to team

            ---
            *Auto-created from discussion decision tracking*
            `;

            await github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: title,
              body: body,
              labels: ['type:decision', 'claudia:implementation', 'auto-created']
            });
EOF

echo -e "${GREEN}✅ Discussions automation created${NC}"

echo ""
echo -e "${GREEN}🎉 GitHub Discussions Setup Complete!${NC}"
echo ""
echo -e "${BLUE}📋 Created Components:${NC}"
echo "1. Discussion Categories Configuration"
echo "2. Discussion Templates (Sprint, Retrospective, Technical)"
echo "3. Discussion Guidelines and Best Practices"
echo "4. Automated Discussion Management"
echo ""
echo -e "${YELLOW}📝 Manual Steps Required:${NC}"
echo "1. Enable GitHub Discussions in repository settings"
echo "2. Configure discussion categories using categories.yml"
echo "3. Pin important guidelines discussion"
echo "4. Set up team notification preferences"
echo ""
echo -e "${BLUE}🔧 To Enable Discussions:${NC}"
echo "1. Go to repository Settings"
echo "2. Scroll to Features section"
echo "3. Check 'Discussions' checkbox"
echo "4. Configure categories based on categories.yml"
echo ""
