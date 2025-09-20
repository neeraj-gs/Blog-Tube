---
description: Nuclear option for dependency issues - complete clean install
---

# Dependency Reset (Nuclear Option)

Completely resets the dependency environment by removing all installed packages and performing a fresh installation. Use when experiencing persistent dependency conflicts or corruption.

## ⚠️ Warning

This command will:
- Delete `node_modules/` directory
- Delete `package-lock.json`
- Clear npm cache
- Perform fresh installation

**Backup your work before proceeding!**

## Reset Workflow

### 1. Pre-Reset Backup
!echo "💾 Creating backup of current package-lock.json..."
!cp package-lock.json package-lock.json.backup 2>/dev/null || echo "No package-lock.json to backup"

### 2. Clean Removal
!echo "🧹 Removing node_modules directory..."
!rm -rf node_modules

!echo "🗑️ Removing package-lock.json..."
!rm -f package-lock.json

### 3. Cache Cleanup
!echo "🧽 Clearing npm cache..."
!npm cache clean --force

### 4. Fresh Installation
!echo "📦 Performing fresh npm install..."
!npm install

### 5. Development Dependencies Verification
!echo "🛠️ Verifying development dependencies..."
!npm install --only=dev

## Post-Reset Verification

### Installation Integrity Check
!echo "✅ Verifying installation integrity..."
!npm ls --depth=0 | head -10

### Critical Dependencies Check
!echo "🔍 Checking critical dependencies..."
!node -e "console.log('Node.js version:', process.version)"
!node -e "console.log('NPM version:', require('child_process').execSync('npm --version', {encoding: 'utf8'}).trim())"

### Package Versions Comparison
!echo "📊 Comparing package versions..."
!test -f "package-lock.json.backup" && echo "Backup available for comparison" || echo "No backup available"

## Functionality Testing

### Basic Application Test
!echo "🧪 Testing basic application functionality..."
!node -e "require('./app.js'); console.log('✅ Application modules load successfully')" 2>/dev/null || echo "⚠️ Application loading issues detected"

### Dependencies Resolution Test
!echo "🔗 Testing dependency resolution..."
!npm list --depth=0 > /dev/null 2>&1 && echo "✅ All dependencies resolved" || echo "⚠️ Dependency resolution issues"

## Common Use Cases

### When to Use This Command
- Persistent `ENOENT` or `EACCES` errors
- Corrupted `node_modules` directory
- Inconsistent dependency versions across team
- Package installation loops or hangs
- After major Node.js version upgrades

### Recovery Steps if Issues Persist
1. Check Node.js version compatibility
2. Verify npm registry configuration
3. Check file system permissions
4. Consider using npm alternative (yarn, pnpm)

## Clean Installation Verification

!echo ""
!echo "🎯 Installation verification checklist:"
!echo "- node_modules/ recreated: $(test -d node_modules && echo "✅" || echo "❌")"
!echo "- package-lock.json regenerated: $(test -f package-lock.json && echo "✅" || echo "❌")"
!echo "- Dependencies count: $(npm ls --depth=0 2>/dev/null | grep -c "─" || echo "unknown")"

## Next Steps

!echo ""
!echo "✅ Dependency reset completed"
!echo "🧪 Recommended next steps:"
!echo "1. Run '/org:test:run' to verify tests pass"
!echo "2. Run '/org:quality:check' for full verification"
!echo "3. Test application startup: 'npm start'"
!echo "4. Remove backup: 'rm package-lock.json.backup' (if successful)"