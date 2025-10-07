# GitHub Projects Setup Guide

## Created Projects



## Project URLs
Check your projects at: https://github.com/neeraj-gs?tab=projects

## Linking Projects to Repository

To make projects appear under your repository's Projects tab:

1. **Open each project** from your projects dashboard
2. **Click Settings** (gear icon in the top right)
3. **Under "Linked repositories"**, click "Link a repository"
4. **Search and select** "neeraj-gs/Blog-Tube"
5. **Save changes**

After linking, projects will appear at: https://github.com/neeraj-gs/Blog-Tube/projects

## Project Configuration

### Recommended Fields to Add:
- **Status** (Single select): Todo, In Progress, Review, Done
- **Priority** (Single select): Low, Medium, High, Critical
- **Sprint** (Single select): 001, 002, 003, etc.
- **Assignee** (Person)
- **Labels** (Multi select)
- **Story Points** (Number)

### Views to Create:
- **Kanban Board**: Status-based board view
- **Sprint Planning**: Table view filtered by sprint
- **Backlog**: All items in priority order
- **Team Dashboard**: Assignee-based view

## Integration with Claudia Commands

These projects integrate with Claudia workflow:

- `/claudia:sprint:create` → Creates sprint milestones
- `/claudia:issues:create` → Adds items to projects automatically
- `/claudia:pr:create` → Links PRs to project items
- `/claudia:tickets:complete` → Moves items to completion

## Next Steps

1. Link projects to Blog-Tube repository
2. Configure project fields and views
3. Test integration with Claudia commands
4. Set up project automation rules

---
Generated: Mon Sep 22 09:55:11 IST 2025
