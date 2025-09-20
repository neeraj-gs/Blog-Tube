# Claude Shared Commands - Team Workflow

This document outlines how the Penomo organization uses shared Claude Code configurations across all repositories.

## 🏗️ **Architecture Overview**
### **Repository Structure**
```
your-repo/
├── .claude/                    # Project-specific (highest priority)
│   ├── commands/
│   │   └── deploy-staging.md   # Project-only command
│   └── planning/
├── .claude-shared/             # Organization shared (subtree)
│   ├── commands/org/
│   │   ├── commit-and-push.md  # /org:commit-and-push
│   │   ├── security-audit.md   # /org:security-audit
│   │   └── lint-and-format.md  # /org:lint-and-format
│   └── setup-claude-shared.sh
└── .github/workflows/
    └── claude-sync-check.yml    # Weekly sync automation
```

### **Command Resolution Hierarchy**
1. **`.claude/commands/`** ← **Highest Priority** (project-specific)
2. **`.claude-shared/commands/org/`** ← Shared organization commands
3. **`~/.claude/commands/`** ← Personal user commands

## 🔄 **Sync Strategy: Hybrid Approach**

### **Automated Components**
- **Weekly Check**: GitHub Actions runs every Sunday 8PM UTC
- **PR Creation**: Automatically creates PR if shared repo has updates
- **Team Notification**: PR includes change summary and review guidelines

### **Manual Components**
- **Review Required**: Team reviews PRs before merging
- **Merge Control**: Teams decide when to apply updates
- **Testing**: Commands tested in project context before adoption

## 🚀 **Getting Started**

### **For New Repositories**
```bash
# 1. Clone your new repository
git clone git@github.com:penomoprotocol/your-new-repo.git
cd your-new-repo

# 2. Run setup script (copy from existing repo or shared repo)
curl -sSL https://raw.githubusercontent.com/penomoprotocol/claude-shared/main/setup-claude-shared.sh | bash

# 3. Commit the setup
git add .
git commit -m "feat(claude): add shared configurations"
git push
```

### **For Existing Repositories**
```bash
# Add shared commands to existing repo
git subtree add --prefix=.claude-shared https://github.com/penomoprotocol/claude-shared.git main --squash

# Copy sync workflow
mkdir -p .github/workflows
cp .claude-shared/.github/workflows/claude-sync-check.yml .github/workflows/

# Commit
git add .
git commit -m "feat(claude): integrate shared command system"
```

## 📋 **Daily Workflow**

### **Using Commands**
```bash
# Organization commands (shared across all repos)
/org:commit-and-push          # Intelligent commit workflow
/org:security-audit           # Security analysis
/org:lint-and-format         # Code quality checks

# Project-specific commands (if they exist)
/deploy-staging              # Project-specific deployment
/run-integration-tests       # Project-specific testing
```

### **Command Priority Example**
If both exist:
- `.claude/commands/deploy.md` ← **Used**
- `.claude-shared/commands/org/deploy.md` ← Ignored

## 🔧 **Managing Updates**

### **Receiving Updates (Automatic)**
1. **Sunday Evening**: GitHub Actions checks for updates
2. **PR Created**: If updates available, PR is automatically created
3. **Review**: Team reviews changes in `.claude-shared/`
4. **Merge**: Merge PR when ready to apply updates

### **Contributing Updates (Manual)**
```bash
# Method 1: Update shared repo directly
cd ../claude-shared-temp  # (or clone penomoprotocol/claude-shared)
# Make changes
git commit -m "feat(org): add new deployment command"
git push

# Method 2: Push from project to shared repo
# Make changes in .claude-shared/
git subtree push --prefix=.claude-shared https://github.com/penomoprotocol/claude-shared.git main
```

### **Manual Sync Commands**
```bash
# Update shared commands from shared repo
git subtree pull --prefix=.claude-shared https://github.com/penomoprotocol/claude-shared.git main --squash

# Push local shared changes back to shared repo  
git subtree push --prefix=.claude-shared https://github.com/penomoprotocol/claude-shared.git main

# Force check for updates (triggers GitHub Action)
gh workflow run claude-sync-check.yml -f force_check=true
```

## 📖 **Command Development Guidelines**

### **Shared Commands** (`.claude-shared/commands/org/`)
- **Generic**: Must work across different Node.js projects
- **Stable**: Well-tested before adding to shared repo
- **Documented**: Include usage examples and prerequisites
- **Namespaced**: Use `/org:command-name` pattern

### **Project Commands** (`.claude/commands/`)
- **Specific**: Project-specific workflows and deployments
- **Override**: Can override shared commands by same name
- **Flexible**: Can be experimental or project-dependent

## 🚨 **Emergency Updates**

For critical security updates or urgent fixes:

### **Option 1: Manual Immediate Sync**
```bash
# In affected repositories
git subtree pull --prefix=.claude-shared https://github.com/penomoprotocol/claude-shared.git main --squash
git commit -m "fix(claude): apply emergency security updates"
git push
```

### **Option 2: Automated Emergency Workflow**
```bash
# Trigger emergency sync across all repositories
gh workflow run claude-sync-check.yml -f force_check=true
# (Would need additional automation for cross-repo deployment)
```

## 🎯 **Best Practices**

### **For Developers**
1. **Review Weekly PRs**: Check sync PRs every Monday morning
2. **Test Commands**: Test new shared commands in your project context
3. **Contribute Back**: Share useful project commands with the organization
4. **Document Overrides**: Document any local commands that override shared ones

### **For DevOps/Platform Teams**
1. **Stable Shared Commands**: Only add well-tested commands to shared repo
2. **Version Shared Commands**: Use git tags for major command updates
3. **Communication**: Announce breaking changes to shared commands
4. **Monitor Adoption**: Track which shared commands are being used

### **For Project Managers**
1. **Review Impact**: Consider sprint impact before merging sync PRs
2. **Coordinate Updates**: Align command updates with release cycles
3. **Team Training**: Ensure team knows about new shared commands

## 🔍 **Troubleshooting**

### **Common Issues**

**Subtree Conflicts**
```bash
# If subtree pull fails
git subtree pull --prefix=.claude-shared https://github.com/penomoprotocol/claude-shared.git main --strategy=subtree -X subtree
```

**Command Not Found**
- Check command name and namespace (`/org:command` vs `/command`)
- Verify `.claude-shared/` directory exists and has content
- Ensure Claude Code recognizes the command directory

**Sync PR Not Created**
- Check GitHub Actions permissions
- Verify workflow file exists in `.github/workflows/`
- Check if shared repository actually has new commits

### **Getting Help**
- **Repository Issues**: Check individual repository for project-specific issues
- **Shared Commands**: Open issues in `penomoprotocol/claude-shared`
- **Workflow Issues**: Contact DevOps team or @saschakubisch

## 📊 **Success Metrics**

This workflow aims to achieve:
- **90%+ Command Reuse**: Most common workflows shared across repos
- **Weekly Sync Adoption**: Teams regularly review and merge sync PRs
- **Reduced Setup Time**: New repositories get full Claude setup in minutes
- **Consistent Quality**: All repos use same linting, formatting, security checks

---

**Next Steps:**
1. Set up shared commands in your repository
2. Review and merge weekly sync PRs
3. Contribute useful commands back to shared repository
4. Provide feedback on workflow improvements