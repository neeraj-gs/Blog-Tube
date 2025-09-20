# Claudia Sprint-Based Synchronization Workflow

This document describes how to synchronize the enhanced sprint-based Claudia automation system across repositories using the claude-shared subtree system.

## Overview

The enhanced Claudia sprint-based automation system is synchronized across all repositories through the `.claude-shared` subtree, ensuring:
- ✅ Consistent sprint-based commands across all projects
- ✅ Multi-commit/multi-PR development workflow support
- ✅ Environment-aware development (dev/staging) 
- ✅ Enhanced audit trails with complete traceability
- ✅ Centralized logging and configuration management  
- ✅ Single source of truth for Claudia updates
- ✅ Automated project management integration with GitHub Issues and Notion

## Central Repository

**Claude Shared Repository:** https://github.com/penomoprotocol/claude-shared

This repository contains the master copy of all shared Claude configurations including:
- Enhanced Claudia sprint-based automation system
- Multi-commit/multi-PR development workflow commands
- Environment-aware development tools
- Organization utility commands
- Shared configurations and templates
- Comprehensive project management system

## Enhanced File Structure

```
Repository/
├── .claude/
│   ├── commands/claudia/          # Active sprint-based Claudia commands (synced from shared)
│   │   ├── sprint/create.md       # Sprint creation with numbered IDs
│   │   ├── requirements/define.md # Sprint-based requirement definition
│   │   ├── tickets/create.md      # Environment-aware ticket creation  
│   │   ├── tickets/assign.md      # GitHub Issues + Notion integration
│   │   ├── commit.md              # Multi-commit support (no PR creation)
│   │   ├── pr/create.md           # Multi-PR support per ticket
│   │   └── ticket/complete.md     # Manual ticket completion with issue closure
│   └── systems/claudia/          # Active Claudia systems (synced from shared)
└── .claude-shared/               # Git subtree of shared configurations
    ├── commands/claudia/         # Source of truth for sprint-based Claudia commands
    ├── systems/claudia/         # Source of truth for Claudia systems
    ├── project-management/       # Sprint-based project management
    │   ├── 2-planning/          # Optional high-level planning documents
    │   ├── 3-sprints/           # Sprint definitions (030.md, 031.md, etc.)
    │   ├── 4-requirements/      # Sprint requirements (030-01-auth.md)
    │   ├── 5-tickets/           # Implementation tickets (030-01-01-database.md)
    │   └── data/                # Enhanced audit logging system
    │       ├── sprints-log.jsonl      # Sprint creation and metrics
    │       ├── requirements-log.jsonl # Requirement lifecycle tracking
    │       ├── tickets-log.jsonl      # Multi-commit, multi-PR tracking
    │       ├── commits-log.jsonl      # All commits with environment context
    │       ├── github-sync.jsonl      # GitHub issue lifecycle management
    │       └── notion-sync.jsonl      # Notion workspace integration
    └── scripts/
        ├── sync-all.sh          # Streamlined sync for all components
        └── setup-system.sh      # System initialization
    ├── sync-claudia.sh          # Sync only Claudia
    └── CLAUDIA-SYNC-WORKFLOW.md # This file
```

## Enhanced Daily Sync Operations (REQUIRED)

### 1. Pull Latest Sprint-Based Updates (Before Starting Work)
```bash
# Get latest sprint-based commands from claude-shared repository
git subtree pull --prefix=.claude-shared \
  https://github.com/penomoprotocol/claude-shared.git main --squash

# Sync all enhanced commands to local .claude/ directory
./.claude-shared/scripts/sync-all.sh

# Verify sprint-based commands are available
echo "Available sprint-based commands:"
ls .claude/commands/claudia/sprint/
ls .claude/commands/claudia/pr/
ls .claude/commands/claudia/ticket/
```

### 2. Environment-Aware Claudia-Only Sync (Alternative)
```bash
# Pull latest updates (same as above)
git subtree pull --prefix=.claude-shared \
  https://github.com/penomoprotocol/claude-shared.git main --squash

# Sync only enhanced Claudia components
./.claude-shared/sync-claudia.sh

# Verify environment-aware commands are working
/claudia:sprint:create --help 2>/dev/null && echo "✅ Sprint commands available" || echo "❌ Sprint commands not found"
```

### 3. Sprint-Based Development Verification
```bash
# After sync, verify the enhanced system is ready
echo "Checking sprint-based system readiness..."

# Check if project management structure exists
[ -d ".claude-shared/project-management/data" ] && echo "✅ Enhanced audit system ready" || echo "❌ Audit system missing"

# Check if sprint commands are available
[ -f ".claude/commands/claudia/sprint/create.md" ] && echo "✅ Sprint creation available" || echo "❌ Sprint creation missing"

# Check if multi-PR commands are available  
[ -f ".claude/commands/claudia/pr/create.md" ] && echo "✅ Multi-PR support available" || echo "❌ Multi-PR support missing"

# Check if manual completion commands are available
[ -f ".claude/commands/claudia/ticket/complete.md" ] && echo "✅ Manual completion available" || echo "❌ Manual completion missing"
```

## Cross-Repository & Multi-Branch Sync

### Sync Enhanced Sprint System Across Multiple Branches
```bash
# Sync enhanced sprint-based system across all branches in current repository
for branch in main staging dev; do
  git checkout $branch
  git subtree pull --prefix=.claude-shared \
    https://github.com/penomoprotocol/claude-shared.git main --squash
  ./.claude-shared/scripts/sync-all.sh
  git add .claude/
  git commit -m "sync: update enhanced sprint-based Claudia system from claude-shared"
  
  # Verify enhanced commands after each branch sync
  echo "Branch $branch: Verifying sprint-based system..."
  [ -f ".claude/commands/claudia/sprint/create.md" ] && echo "✅ Sprint commands synced" || echo "❌ Sprint commands missing"
  [ -f ".claude/commands/claudia/pr/create.md" ] && echo "✅ Multi-PR support synced" || echo "❌ Multi-PR support missing"
done
```

### Sync Enhanced System Across Multiple Repositories
```bash
# Run this in each repository (penomo-api, other-repos...)
# This ensures all repositories have the same enhanced sprint-based system
git subtree pull --prefix=.claude-shared \
  https://github.com/penomoprotocol/claude-shared.git main --squash
./.claude-shared/scripts/sync-all.sh

# Verify sprint-based system consistency across repositories
echo "Repository $(basename $(pwd)): Enhanced system verification"
ls -la .claude/commands/claudia/sprint/ 2>/dev/null && echo "✅ Sprint commands available"
ls -la .claude/commands/claudia/pr/ 2>/dev/null && echo "✅ Multi-PR commands available"  
ls -la .claude/commands/claudia/ticket/ 2>/dev/null && echo "✅ Ticket management commands available"
[ -d ".claude-shared/project-management/data" ] && echo "✅ Enhanced audit system ready"
```

## Enhanced Development Workflow

### Making Changes to Sprint-Based Claudia System

1. **Make local changes to enhanced system**
   ```bash
   # Edit sprint-based commands in .claude-shared/commands/claudia/
   # Examples of enhanced commands:
   # - .claude-shared/commands/claudia/sprint/create.md
   # - .claude-shared/commands/claudia/pr/create.md  
   # - .claude-shared/commands/claudia/ticket/complete.md
   
   # Edit enhanced systems in .claude-shared/systems/claudia/
   ```

2. **Test enhanced commands locally before committing**
   ```bash
   # Sync changes to local .claude/ for testing
   ./.claude-shared/scripts/sync-all.sh
   
   # Test sprint-based functionality
   /claudia:sprint:create "030"
   /claudia:requirements:define "Test requirement" --sprint 030
   /claudia:tickets:create "030-01" --env dev
   
   # Verify multi-commit/multi-PR support works as expected
   echo "Testing enhanced command availability..."
   [ -f ".claude/commands/claudia/pr/create.md" ] && echo "✅ Multi-PR commands ready"
   [ -f ".claude/commands/claudia/ticket/complete.md" ] && echo "✅ Manual completion ready"
   ```

3. **Commit enhanced system changes locally**
   ```bash
   git add .claude-shared/
   git commit -m "feat(claudia): enhance sprint-based automation system with multi-PR support"
   ```

4. **Push enhanced system to claude-shared repository**
   ```bash
   git subtree push --prefix=.claude-shared \
     https://github.com/penomoprotocol/claude-shared.git main
   ```

5. **Other repositories/developers can pull enhanced updates**
   ```bash
   git subtree pull --prefix=.claude-shared \
     https://github.com/penomoprotocol/claude-shared.git main --squash
   ./.claude-shared/scripts/sync-all.sh
   
   # Verify enhanced system is available
   echo "Enhanced Claudia System Available:"
   ls .claude/commands/claudia/sprint/ 2>/dev/null | head -5
   ls .claude/commands/claudia/pr/ 2>/dev/null | head -5
   ls .claude/commands/claudia/ticket/ 2>/dev/null | head -5
   ```

## Repository Setup

### Adding Enhanced Sprint-Based Claudia to New Repository

1. **Add claude-shared subtree with enhanced system**
   ```bash
   git subtree add --prefix=.claude-shared \
     https://github.com/penomoprotocol/claude-shared.git main --squash
   ```

2. **Sync enhanced Claudia components locally**
   ```bash
   ./.claude-shared/scripts/sync-all.sh
   ```

3. **Initialize enhanced project management structure**
   ```bash
   # Create project management directories if they don't exist
   mkdir -p .claude-shared/project-management/{1-roadmap,2-planning,3-sprints,4-requirements,5-tickets}
   
   # Initialize audit logging system
   mkdir -p .claude-shared/project-management/data
   touch .claude-shared/project-management/data/{sprints-log.jsonl,requirements-log.jsonl,tickets-log.jsonl,commits-log.jsonl,github-sync.jsonl,notion-sync.jsonl}
   ```

4. **Commit the enhanced system**
   ```bash
   git add .claude/ .claude-shared/project-management/
   git commit -m "sync: initialize enhanced sprint-based Claudia system from claude-shared"
   ```

5. **Verify enhanced system initialization**
   ```bash
   echo "Verifying enhanced Claudia system setup..."
   
   # Check sprint-based commands
   [ -f ".claude/commands/claudia/sprint/create.md" ] && echo "✅ Sprint creation available"
   [ -f ".claude/commands/claudia/pr/create.md" ] && echo "✅ Multi-PR support available"
   [ -f ".claude/commands/claudia/ticket/complete.md" ] && echo "✅ Manual ticket completion available"
   
   # Check project structure  
   [ -d "3-sprints" ] && echo "✅ Sprint directory structure ready"
   [ -d ".claude-shared/project-management/data" ] && echo "✅ Enhanced audit system initialized"
   
   echo "Enhanced Claudia system ready for sprint-based development!"
   ```

### Updating Existing Repository to Enhanced Sprint-Based System

1. **Update subtree with enhanced system**
   ```bash
   git subtree pull --prefix=.claude-shared \
     https://github.com/penomoprotocol/claude-shared.git main --squash
   ```

2. **Sync latest enhanced Claudia system**
   ```bash
   ./.claude-shared/scripts/sync-all.sh
   ```

3. **Migrate to enhanced project structure (if needed)**
   ```bash
   # Create new sprint-based directories
   mkdir -p .claude-shared/project-management/{1-roadmap,2-planning,3-sprints,4-requirements,5-tickets}
   
   # Initialize enhanced audit system
   mkdir -p .claude-shared/project-management/data
   touch .claude-shared/project-management/data/{sprints-log.jsonl,requirements-log.jsonl,tickets-log.jsonl,commits-log.jsonl,github-sync.jsonl,notion-sync.jsonl}
   
   # Commit enhanced structure
   git add .claude-shared/project-management/
   git commit -m "migrate: update to enhanced sprint-based Claudia system"
   ```

4. **Verify enhanced system migration**
   ```bash
   echo "Verifying enhanced system migration..."
   
   # Check for new sprint-based commands
   [ -f ".claude/commands/claudia/sprint/create.md" ] && echo "✅ Sprint commands migrated"
   [ -f ".claude/commands/claudia/pr/create.md" ] && echo "✅ Multi-PR support migrated"
   [ -f ".claude/commands/claudia/ticket/complete.md" ] && echo "✅ Manual completion migrated"
   
   # Check enhanced audit system
   [ -d ".claude-shared/project-management/data" ] && echo "✅ Enhanced audit system ready"
   
   echo "Migration to enhanced sprint-based system complete!"
   ```

## Enhanced Troubleshooting

### Sprint-Based Commands Not Available
- Run `./.claude-shared/scripts/sync-all.sh` to ensure enhanced system sync
- Check that `.claude/commands/claudia/` directory has new sprint-based structure:
  ```bash
  ls -la .claude/commands/claudia/sprint/
  ls -la .claude/commands/claudia/pr/
  ls -la .claude/commands/claudia/ticket/
  ```
- Verify file permissions: `chmod +x .claude-shared/*.sh`

### Sprint System Initialization Issues
- Ensure project management structure exists:
  ```bash
  [ -d "3-sprints" ] || mkdir -p .claude-shared/project-management/{1-roadmap,2-planning,3-sprints,4-requirements,5-tickets}
  [ -d ".claude-shared/project-management/data" ] || mkdir -p .claude-shared/project-management/data
  ```
- Initialize audit logs if missing:
  ```bash
  touch .claude-shared/project-management/data/{sprints-log.jsonl,requirements-log.jsonl,tickets-log.jsonl,commits-log.jsonl,github-sync.jsonl,notion-sync.jsonl}
  ```

### Multi-Commit/Multi-PR Workflow Issues
- Verify enhanced commands are available:
  ```bash
  [ -f ".claude/commands/claudia/commit.md" ] && echo "✅ Multi-commit support"
  [ -f ".claude/commands/claudia/pr/create.md" ] && echo "✅ Multi-PR support"
  [ -f ".claude/commands/claudia/ticket/complete.md" ] && echo "✅ Manual completion"
  ```
- Check audit logging system:
  ```bash
  ls -la .claude-shared/project-management/data/
  ```

### Environment-Aware Development Issues
- Ensure environment parameters are specified: `--env dev` or `--env staging`
- Verify branch targeting works with target environments
- Check environment context in audit logs

### Subtree Sync Issues
- Ensure you have access to https://github.com/penomoprotocol/claude-shared
- Check git subtree configuration
- Try `git subtree pull` with `--strategy=subtree -X subtree=.claude-shared`

### Enhanced Script Execution Issues
```bash
# Make scripts executable
chmod +x .claude-shared/*.sh

# Check script paths and enhanced system
ls -la .claude-shared/*.sh
ls -la .claude-shared/commands/claudia/
ls -la .claude-shared/project-management/

# Verify enhanced system components
echo "Enhanced system check:"
[ -d ".claude-shared/commands/claudia/sprint" ] && echo "✅ Sprint commands present"
[ -d ".claude-shared/commands/claudia/pr" ] && echo "✅ Multi-PR commands present"
[ -d ".claude-shared/project-management/data" ] && echo "✅ Enhanced audit system present"
```

## Enhanced Best Practices

### Sprint-Based Development
1. **Daily Enhanced Syncing**: Always pull latest enhanced system before starting work
2. **Environment Specification**: Always specify `--env dev` or `--env staging` for all tickets
3. **Sprint Organization**: Create sprints first, then requirements, then tickets (030 → 030-01 → 030-01-01)
4. **Multi-Commit Embrace**: Use multiple commits per ticket for iterative development
5. **Multi-PR Strategy**: Don't hesitate to create multiple PRs per ticket when appropriate

### Enhanced System Maintenance  
6. **Test Enhanced Changes**: Verify sprint-based commands work before pushing
7. **Audit Trail Verification**: Ensure logging system captures all multi-commit/PR relationships
8. **Environment Consistency**: Maintain consistent environment targeting across all repositories
9. **Atomic Updates**: Make small, focused changes to enhanced Claudia system  
10. **Team Communication**: Announce major sprint-based system updates in team channels

### Quality & Compliance
11. **Sprint Metrics Monitoring**: Track sprint velocity and completion rates
12. **GitHub Issue Lifecycle**: Ensure issues stay open until manual completion
13. **Backup Strategy**: Enhanced audit trails tracked in git and JSONL logs
14. **Cross-Repository Consistency**: Ensure all repositories use the same enhanced system version

### Enhanced Development Workflow
15. **Interactive Requirement Definition**: Use interactive mode for complex requirements
16. **Branch Type Leverage**: Let system auto-detect appropriate branch types  
17. **Manual Completion**: Always use `/claudia:ticket:complete` for proper issue closure
18. **Audit Trail Review**: Regularly review JSONL logs for development patterns and compliance

## Enhanced Integration with Sprint-Based CLAUDE.md System

This enhanced workflow integrates seamlessly with the mandatory sprint-based Claudia usage requirements:

### Core Integration Features
- **Sprint-Based Commands**: All enhanced commands synchronized across repositories (030, 031, 032...)
- **Multi-Commit/Multi-PR Support**: Real-world development workflow supported across all projects  
- **Environment-Aware Development**: Consistent dev/staging targeting across repositories
- **Enhanced Audit Trails**: Complete traceability for multi-commit/PR workflows maintained
- **GitHub Issue Lifecycle**: Proper issue management (open → multiple PRs → manual close) across projects

### Cross-Repository Consistency
- **Sprint UUID Inheritance**: Hierarchical system (Sprint → Requirement → Ticket) preserved everywhere
- **Enhanced Compliance Monitoring**: Multi-PR development patterns tracked across all repositories
- **Centralized Project Management**: Sprint-based system works identically in all repositories
- **Audit Log Standardization**: JSONL format consistent across all projects for compliance reporting

### Enhanced Integration Benefits
- **Unified Development Experience**: Same enhanced commands available in every repository
- **Cross-Project Sprint Tracking**: Sprint metrics aggregated across multiple repositories
- **Consistent GitHub Integration**: Same issue management patterns across all projects  
- **Standardized Notion Integration**: Uniform project management across organization
- **Environment Deployment Consistency**: Same dev/staging patterns across all codebases

### Sprint-Based Workflow Standardization
```bash
# Same enhanced workflow works in ANY repository:
/claudia:sprint:create "030"                    # Create sprint (same across all repos)
/claudia:requirements:define "Auth System" --sprint 030  # Same requirement pattern
/claudia:tickets:create "030-01" --env dev      # Same ticket creation (environment-aware)
/claudia:commit "030-01-01-database"           # Same multi-commit support
/claudia:pr:create "030-01-01-database"        # Same multi-PR support
/claudia:ticket:complete "030-01-01-database"  # Same manual completion
```

## Enhanced Support

For issues with enhanced sprint-based Claudia synchronization:

### Basic Troubleshooting
1. **Check this enhanced workflow document** - Updated for sprint-based system
2. **Verify sync scripts are executable**: `chmod +x .claude-shared/*.sh`
3. **Test manual sync**: `./.claude-shared/scripts/sync-all.sh`
4. **Check git subtree status**: `git log --oneline --grep="subtree"`

### Enhanced System Diagnostics
5. **Verify sprint-based commands**:
   ```bash
   ls -la .claude/commands/claudia/sprint/
   ls -la .claude/commands/claudia/pr/
   ls -la .claude/commands/claudia/ticket/
   ```

6. **Check enhanced project structure**:
   ```bash
   [ -d "3-sprints" ] && echo "✅ Sprint structure ready"
   [ -d ".claude-shared/project-management/data" ] && echo "✅ Enhanced audit system ready"
   ```

7. **Test enhanced command availability**:
   ```bash
   /claudia:sprint:create --help 2>/dev/null && echo "✅ Sprint commands working"
   [ -f ".claude/commands/claudia/pr/create.md" ] && echo "✅ Multi-PR commands available"
   ```

### Multi-Commit/Multi-PR Support Issues
8. **Verify audit logging system**:
   ```bash
   ls -la .claude-shared/project-management/data/
   tail -1 .claude-shared/project-management/data/commits-log.jsonl 2>/dev/null || echo "No commits logged yet"
   ```

9. **Environment-aware development check**:
   ```bash
   echo "Testing environment awareness..."
   grep -q "env.*dev\|env.*staging" .claude/commands/claudia/tickets/create.md && echo "✅ Environment awareness present"
   ```

### Advanced Support
10. **Contact development team** for advanced troubleshooting with enhanced system issues
11. **Review audit logs** for development pattern issues: `.claude-shared/project-management/data/*.jsonl`
12. **Check cross-repository consistency** if using multiple repositories with enhanced system

### Emergency Recovery
- **Complete system reset**: Delete `.claude/` and re-run `./.claude-shared/scripts/sync-all.sh`
- **Enhanced audit recovery**: JSONL logs are append-only and can be used for complete workflow reconstruction
- **Sprint system rebuild**: Use sprint hierarchy (030 → 030-01 → 030-01-01) for systematic recovery

---

**Enhanced System Version:** Sprint-Based Multi-Commit/Multi-PR Development  
**Last Updated:** August 2025  
**Repository:** https://github.com/penomoprotocol/claude-shared  
**Enhanced Features:** Sprint-based UUIDs, Multi-commit support, Multi-PR workflows, Environment-aware development, Enhanced audit trails