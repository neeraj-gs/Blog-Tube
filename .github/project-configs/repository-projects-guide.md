# Repository-Level Projects Guide

## Created Projects

### 1. Claudia Sprint Management
- **Purpose**: Sprint-based development workflow with automated tracking
- **Links to**: `.claude-shared/project-management/3-sprints/`
- **Usage**: Track sprint progress, requirements completion, velocity metrics

### 2. Claudia Requirements Tracking
- **Purpose**: Requirement definition and tracking
- **Links to**: `.claude-shared/project-management/4-requirements/`
- **Usage**: Monitor requirement lifecycle from definition to completion

### 3. Claudia Implementation Pipeline
- **Purpose**: Ticket implementation and development tracking
- **Links to**: `.claude-shared/project-management/5-tickets/`
- **Usage**: Track development work, code reviews, deployment status

### 4. Claudia Quality Gates
- **Purpose**: Code review, testing, and deployment tracking
- **Usage**: Ensure quality standards, track review cycles, monitor deployments

## Project Configuration

### Fields to Add
- Sprint Number (Single Select)
- Status (Single Select: Todo, In Progress, Review, Done)
- Priority (Single Select: Low, Medium, High, Critical)
- Assignee (Person)
- Labels (Multi Select)
- Story Points (Number)

### Views to Create
- **Sprint Board**: Kanban view filtered by current sprint
- **Requirements Backlog**: Table view of all requirements
- **Implementation Pipeline**: Flow view showing development stages
- **Quality Dashboard**: Metrics view for quality gates

### Automation Rules
- Auto-assign issues based on labels
- Move items to "In Progress" when PR is opened
- Move items to "Done" when PR is merged
- Update sprint fields based on issue milestones

## Integration with Claudia Commands

The projects integrate automatically with Claudia workflow commands:

- `/claudia:sprint:create` → Creates sprint milestone and project items
- `/claudia:issues:create` → Adds items to appropriate projects
- `/claudia:pr:create` → Updates project status automatically
- `/claudia:tickets:complete` → Moves items to completion

## Access URLs

- Repository Projects: https://github.com/neeraj-gs/Blog-Tube/projects
- Project 1: [Will be filled in after creation]
- Project 2: [Will be filled in after creation]
- Project 3: [Will be filled in after creation]
- Project 4: [Will be filled in after creation]
