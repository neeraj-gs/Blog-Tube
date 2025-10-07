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
