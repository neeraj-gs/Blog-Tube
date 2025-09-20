# Claude Code Shared Configurations

This repository contains shared Claude Code configurations, commands, and templates for the Penomo organization.

## Structure

```
├── commands/
│   ├── org/           # Organization-wide commands
│   └── claudia/       # Claudia automation system commands
├── systems/
│   └── claudia/       # Claudia automation system data and scripts
├── planning/          # Planning documents and ideas
├── templates/         # Reusable templates
├── sync-commands.sh   # Main synchronization script
├── sync-claudia.sh    # Claudia-specific sync script
├── claudia-sync.sh    # Advanced Claudia push/pull tool
└── README.md          # This file
```

## Usage

This repository is designed to be used as a git subtree in your projects:

```bash
# Add to existing project
git subtree add --prefix=.claude git@github.com:penomoprotocol/claude-shared.git main --squash

# Update shared configs
git subtree pull --prefix=.claude git@github.com:penomoprotocol/claude-shared.git main --squash

# Push local changes back to shared repo
git subtree push --prefix=.claude git@github.com:penomoprotocol/claude-shared.git main
```

## Contributing

1. Make changes in your project's `.claude/` folder
2. Push changes back to shared repo using `git subtree push`
3. Other team members can pull updates with `git subtree pull`

## Synchronization

### Quick Sync
```bash
# Sync all shared components (org + claudia)
./.claude-shared/sync-commands.sh

# Sync only Claudia components
./.claude-shared/sync-claudia.sh
```

### Advanced Claudia Management
```bash
# Check Claudia sync status
./.claude-shared/claudia-sync.sh status

# Pull latest Claudia from shared source
./.claude-shared/claudia-sync.sh pull

# Push local Claudia changes to shared source
./.claude-shared/claudia-sync.sh push
```

## Commands Available

### Organization Commands (/org:*)
- Available after running sync scripts
- See synced commands in `.claude/commands/org/`

### Claudia Automation System (/claudia:*)
- `/claudia:requirements:define` - Define project requirements
- `/claudia:tickets:create` - Break requirements into tickets  
- `/claudia:tickets:assign` - Assign to GitHub Issues + Notion
- `/claudia:implement:manual` - Collaborative TDD implementation
- `/claudia:implement:auto` - Fully automated implementation
- `/claudia:commit` - Commit with full traceability
- `/claudia:docs:update` - Update documentation
- `/claudia:status` - View current work status
- `/claudia:report` - Generate traceability reports

## Team Guidelines

- Keep commands generic enough to work across projects
- Use `$ARGUMENTS` for project-specific parameters
- Document any new commands in the planning folder first
- Test commands thoroughly before pushing to shared repo