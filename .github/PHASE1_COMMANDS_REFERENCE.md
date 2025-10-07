# Phase 1 Commands Reference Guide

**Complete command reference for Phase 1: Mandatory Workflow Foundation implementation**

---

## 🚀 **Quick Setup Commands (Run Once)**

### **Complete Phase 1 Setup**
```bash
# Full automated setup (recommended)
./.github/scripts/deploy-phase1-complete.sh false

# Dry run first (optional)
./.github/scripts/deploy-phase1-complete.sh true
```

### **Individual Component Setup**
```bash
# 1. GitHub Projects Setup
./.github/scripts/setup-github-projects-working.sh

# 2. Link Projects to Repository
./.github/scripts/link-projects-to-repository.sh

# 3. GitHub Issues Templates
./.github/scripts/setup-github-issues.sh

# 4. GitHub Discussions Setup
./.github/scripts/setup-github-discussions.sh

# 5. Enable GitHub Discussions (verification)
./.github/scripts/enable-github-discussions.sh

# 6. Branch Protection Setup
./.github/scripts/setup-branch-protection.sh

# 7. Pre-commit Hooks Setup
./.github/scripts/setup-precommit-hooks.sh

# 8. Install Pre-commit Hooks
/Users/neerajgs/Library/Python/3.9/bin/pre-commit install
```

---

## 🧪 **Testing Commands**

### **Component Testing**
```bash
# Test all Phase 1 components
./.github/scripts/test-phase1-implementation.sh

# Test GitHub Projects functionality
gh project list --owner @me

# Test GitHub Discussions
./.github/scripts/enable-github-discussions.sh

# Test Branch Protection
./.github/scripts/test-branch-protection.sh

# Test Pre-commit Hooks
/Users/neerajgs/Library/Python/3.9/bin/pre-commit run --all-files

# Test Emergency Bypass
echo -e "TEST-001\nNeeraj GS\nTesting emergency bypass\n1\n" | ./.github/scripts/create-emergency-bypass.sh
```

### **Emergency Bypass Testing**
```bash
# Create emergency bypass
./.github/scripts/create-emergency-bypass.sh

# Check bypass file
cat .github/emergency-bypass.active

# Test bypass functionality (commit should work)
echo "# Emergency test - $(date)" > .emergency-test.md
git add .emergency-test.md && git commit -m "emergency: test bypass"

# Remove bypass
rm .github/emergency-bypass.active

# Clean up test
git reset HEAD~1 && rm -f .emergency-test.md
```

---

## 💬 **GitHub Discussions Commands**

### **Create New Discussions**
```bash
# Interactive discussion creator
./.github/scripts/create-new-discussion.sh

# Sprint Planning Discussion
echo -e "1\n001\nAuthentication System\n1\ny" | ./.github/scripts/create-new-discussion.sh

# Technical Discussion
echo -e "3\nEmergency Bypass Architecture\n2\ny" | ./.github/scripts/create-new-discussion.sh

# Ideas Discussion
echo -e "4\nPhase 2 Enhancement Ideas\n3\ny" | ./.github/scripts/create-new-discussion.sh

# Q&A Discussion
echo -e "5\nClaudia Workflow Questions\n5\ny" | ./.github/scripts/create-new-discussion.sh
```

### **Pre-built Discussions**
```bash
# Create initial set of discussions
./.github/scripts/create-discussions-default-categories.sh
```

---

## 🛡️ **Branch Protection Commands**

### **Setup Additional Branch Protection**
```bash
# Setup dev branch protection
./.github/scripts/setup-dev-branch-protection.sh

# Check branch protection status
gh api repos/neeraj-gs/Blog-Tube/branches/main/protection
gh api repos/neeraj-gs/Blog-Tube/branches/dev/protection

# List all protected branches
gh api repos/neeraj-gs/Blog-Tube/branches --jq '.[] | select(.protected == true) | .name'
```

---

## 🔍 **Verification & Status Commands**

### **GitHub Projects**
```bash
# List all projects
gh project list --owner @me

# View specific project
gh project view 6 --owner @me  # Claudia Sprint Management
gh project view 7 --owner @me  # Claudia Requirements Tracking
gh project view 8 --owner @me  # Claudia Implementation Pipeline
gh project view 9 --owner @me  # Claudia Quality Gates
```

### **GitHub API Checks**
```bash
# Check repository features
gh api repos/neeraj-gs/Blog-Tube --jq '{has_projects, has_discussions, has_issues}'

# Check discussions
gh api repos/neeraj-gs/Blog-Tube/discussions

# Check branch protection
gh api repos/neeraj-gs/Blog-Tube/branches --jq '.[] | {name, protected}'
```

### **System Status**
```bash
# Check GitHub CLI auth
gh auth status

# Check pre-commit installation
/Users/neerajgs/Library/Python/3.9/bin/pre-commit --version

# Check git hooks
ls -la .git/hooks/

# Verify configuration files
ls -la .github/workflows/
ls -la .github/ISSUE_TEMPLATE/
ls -la .github/DISCUSSION_TEMPLATE/
```

---

## 🎯 **Access URLs**

### **GitHub Repository URLs**
- **Repository**: https://github.com/neeraj-gs/Blog-Tube
- **Projects**: https://github.com/neeraj-gs/Blog-Tube/projects
- **Discussions**: https://github.com/neeraj-gs/Blog-Tube/discussions
- **Issues**: https://github.com/neeraj-gs/Blog-Tube/issues
- **Settings**: https://github.com/neeraj-gs/Blog-Tube/settings

### **Individual Project URLs**
- **Sprint Management**: https://github.com/users/neeraj-gs/projects/6
- **Requirements Tracking**: https://github.com/users/neeraj-gs/projects/7
- **Implementation Pipeline**: https://github.com/users/neeraj-gs/projects/8
- **Quality Gates**: https://github.com/users/neeraj-gs/projects/9

---

## 📁 **File Locations**

### **Scripts Directory**
```bash
ls -la .github/scripts/
```
**Available Scripts:**
- `setup-github-projects-working.sh` - Creates GitHub Projects
- `link-projects-to-repository.sh` - Links projects to repository
- `setup-github-discussions.sh` - Sets up discussions
- `enable-github-discussions.sh` - Verifies discussions
- `create-new-discussion.sh` - Interactive discussion creator
- `create-discussions-default-categories.sh` - Creates sample discussions
- `setup-branch-protection.sh` - Sets up branch protection
- `setup-dev-branch-protection.sh` - Protects additional branches
- `test-branch-protection.sh` - Tests branch protection
- `setup-precommit-hooks.sh` - Sets up pre-commit hooks
- `create-emergency-bypass.sh` - Creates emergency bypass
- `test-phase1-implementation.sh` - Tests all components
- `deploy-phase1-complete.sh` - Master deployment script

### **Configuration Files**
```bash
# GitHub Templates
ls -la .github/ISSUE_TEMPLATE/
ls -la .github/DISCUSSION_TEMPLATE/
ls -la .github/workflows/

# Key Files
.github/CODEOWNERS                    # Code ownership rules
.github/BRANCH_PROTECTION_POLICY.md   # Branch protection policy
.github/DISCUSSION_GUIDELINES.md      # Discussion guidelines
.github/EMERGENCY_PROCEDURES.md       # Emergency procedures
.github/discussions/categories.yml    # Custom discussion categories
.pre-commit-config.yaml               # Pre-commit configuration
```

---

## 🔧 **Troubleshooting Commands**

### **GitHub CLI Issues**
```bash
# Re-authenticate
gh auth login

# Refresh scopes
gh auth refresh -s project,repo,read:org

# Check current auth
gh auth status
```

### **Pre-commit Issues**
```bash
# Reinstall pre-commit
pip install --user pre-commit

# Reinstall hooks
/Users/neerajgs/Library/Python/3.9/bin/pre-commit install

# Clean and reinstall
/Users/neerajgs/Library/Python/3.9/bin/pre-commit clean
/Users/neerajgs/Library/Python/3.9/bin/pre-commit install --install-hooks
```

### **Reset Commands**
```bash
# Remove pre-commit hooks
/Users/neerajgs/Library/Python/3.9/bin/pre-commit uninstall

# Remove emergency bypass
rm -f .github/emergency-bypass.active

# Reset git hooks
rm -f .git/hooks/pre-commit
```

---

## 📊 **Status Check Commands**

### **Quick Health Check**
```bash
# All-in-one status check
echo "=== PHASE 1 STATUS CHECK ==="
echo "GitHub CLI: $(gh --version | head -1)"
echo "Pre-commit: $(/Users/neerajgs/Library/Python/3.9/bin/pre-commit --version)"
echo "Protected Branches: $(gh api repos/neeraj-gs/Blog-Tube/branches --jq '[.[] | select(.protected == true) | .name] | join(", ")')"
echo "Projects: $(gh project list --owner @me | wc -l) total"
echo "Discussions Enabled: $(gh api repos/neeraj-gs/Blog-Tube --jq '.has_discussions')"
```

### **Component Verification**
```bash
# Verify each component
echo "✅ Projects: $(test -f .github/scripts/setup-github-projects-working.sh && echo "Ready" || echo "Missing")"
echo "✅ Discussions: $(test -f .github/DISCUSSION_GUIDELINES.md && echo "Ready" || echo "Missing")"
echo "✅ Branch Protection: $(test -f .github/BRANCH_PROTECTION_POLICY.md && echo "Ready" || echo "Missing")"
echo "✅ Pre-commit: $(test -f .pre-commit-config.yaml && echo "Ready" || echo "Missing")"
echo "✅ Emergency Bypass: $(test -f .github/scripts/create-emergency-bypass.sh && echo "Ready" || echo "Missing")"
```

---

## 🎉 **Phase 1 Complete - Next Steps**

After running Phase 1 commands successfully:

1. **Manual GitHub Settings**:
   - Enable Discussions in repository settings
   - Configure custom discussion categories
   - Set up team notification preferences

2. **Team Training**:
   - Share this reference guide with team
   - Demonstrate emergency bypass procedures
   - Practice Claudia workflow commands

3. **Monitoring**:
   - Check GitHub Actions workflow results
   - Monitor pre-commit hook effectiveness
   - Review emergency bypass usage logs

---

**📅 Last Updated**: $(date)
**✅ Phase 1 Status**: Complete and Operational
**🎯 All Commands Tested**: Ready for Production Use
