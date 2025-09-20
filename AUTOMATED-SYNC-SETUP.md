# Automated Claude-Shared Sync Setup

This document explains how to set up automated synchronization from the claude-shared repository to all target repositories using GitHub Actions.

## Overview

The automated sync system will:
- **Trigger**: Whenever changes are pushed to the `main` branch of claude-shared repository  
- **Target**: 5 repositories × 3 branches = 15 sync operations
- **Process**: Add/update `.claude-shared` subtree + sync to `.claude/` directory

## Required Setup

### 1. Personal Access Token (PAT)

Create a GitHub Personal Access Token with the following permissions:

**Required Scopes:**
- `repo` (Full control of private repositories)
- `workflow` (Update GitHub Action workflows)

**Steps:**
1. Go to GitHub Settings → Developer Settings → Personal Access Tokens → Tokens (classic)
2. Generate new token (classic) with required scopes
3. Copy the token - you'll need it for the next step

### 2. Repository Secret Configuration

**In the claude-shared repository**, add the PAT as a secret:

1. Go to claude-shared repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `SYNC_TOKEN`
4. Value: Your Personal Access Token from step 1
5. Click "Add secret"

### 3. Workflow File Location

The workflow file should be located at:
```
claude-shared/.github/workflows/sync-to-all-repos.yml
```

### 4. Target Repositories Configuration

The workflow is configured to sync to these repositories and branches:

**Repositories:**
- `penomoprotocol/penomo-api`
- `penomoprotocol/penomo-admin-app`
- `penomoprotocol/penomo-raise-app`
- `penomoprotocol/penomo-invest-app`
- `penomoprotocol/penomo-tokenization-engine`

**Branches:**
- `main`
- `staging` 
- `dev`

## How It Works

### Trigger Conditions
- **Automatic**: Push to `main` branch of claude-shared
- **Manual**: Can be triggered manually from GitHub Actions tab

### Sync Process for Each Repository/Branch
1. **Checkout** target repository and branch
2. **Check** if `.claude-shared` subtree already exists
3. **Add subtree** (if first time) OR **Pull updates** (if exists)
4. **Execute sync script** to update `.claude/` directory
5. **Commit and push** changes if any are detected
6. **Report status** of sync operation

### Safety Features
- **Checks for existing subtrees** before adding new ones
- **Only commits if changes detected** (no empty commits)
- **Error handling** for missing sync scripts
- **Detailed commit messages** with traceability

## Manual Sync (Fallback)

If automated sync fails, you can manually sync any repository:

```bash
# In target repository
git subtree pull --prefix=.claude-shared \
  https://github.com/penomoprotocol/claude-shared.git main --squash

./.claude-shared/sync-all-shared-commands.sh

git add . && git commit -m "sync: manual update from claude-shared"
git push origin [branch-name]
```

## Monitoring & Troubleshooting

### Check Sync Status
1. Go to claude-shared repository → Actions tab
2. Look for "Sync Claude-Shared to All Repositories" workflow
3. Click on latest run to see detailed logs

### Common Issues

**Issue: "Permission denied" errors**
- **Solution**: Check that `SYNC_TOKEN` secret is properly configured with correct permissions

**Issue: "Subtree conflicts"**
- **Solution**: May need to manually resolve conflicts in target repositories

**Issue: "Sync script not found"** 
- **Solution**: Ensure `sync-all-shared-commands.sh` exists in claude-shared repository

**Issue: "Branch doesn't exist"**
- **Solution**: Create missing branches in target repositories or update workflow config

## Security Considerations

### Token Security
- **PAT has broad access** - protect it carefully
- **Rotate token regularly** (GitHub recommends every 90 days)
- **Use fine-grained PATs** when available for better security

### Repository Access
- **Bot commits** are clearly identified in commit messages
- **All changes tracked** in git history
- **Failed syncs logged** in GitHub Actions

## Extending the System

### Adding New Repositories
Edit `.github/workflows/sync-to-all-repos.yml`:
```yaml
repository: 
  - 'penomoprotocol/existing-repo'
  - 'penomoprotocol/new-repo-name'  # Add here
```

### Adding New Branches
Edit the matrix strategy:
```yaml
branch: ['main', 'staging', 'dev', 'new-branch']  # Add here
```

### Custom Sync Scripts
The workflow looks for these sync scripts in order:
1. `sync-all-shared-commands.sh` (preferred)  
2. `sync-claudia.sh` (fallback)

## Testing

### Test Workflow
1. Make a small change to claude-shared repository
2. Push to `main` branch
3. Monitor GitHub Actions for successful completion
4. Verify changes appear in target repositories

### Manual Trigger
1. Go to claude-shared → Actions → "Sync Claude-Shared to All Repositories"
2. Click "Run workflow" → "Run workflow"
3. Monitor execution logs

---

**Last Updated:** August 2025  
**Repository:** https://github.com/penomoprotocol/claude-shared

**Status:** Improved error handling deployed - workflow now gracefully handles repository access issues