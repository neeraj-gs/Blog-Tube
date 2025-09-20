---
description: Semantic version management and release preparation
---

# Version Bump and Release Manager

Handles semantic versioning, changelog generation, and release preparation for Node.js applications following conventional commit standards.

## Version Management Workflow

### 1. Current Version Analysis
!echo "📦 Analyzing current version and commit history..."
!current_version=$(node -p "require('./package.json').version" 2>/dev/null || echo "unknown")
!echo "Current version: $current_version"
!echo "## Release Management Report" > RELEASE_REPORT.md
!echo "Generated on $(date)" >> RELEASE_REPORT.md
!echo "Current Version: $current_version" >> RELEASE_REPORT.md
!echo "" >> RELEASE_REPORT.md

### 2. Commit Analysis Since Last Release
!echo "🔍 Analyzing commits since last release..."
!echo "### Commit Analysis" >> RELEASE_REPORT.md

# Get commits since last tag or from beginning
!if git describe --tags --abbrev=0 >/dev/null 2>&1; then
!  last_tag=$(git describe --tags --abbrev=0)
!  echo "Last release tag: $last_tag" >> RELEASE_REPORT.md
!  echo "Commits since $last_tag:"
!  commit_range="$last_tag..HEAD"
!else
!  echo "No previous tags found - analyzing all commits" >> RELEASE_REPORT.md
!  echo "All commits in repository:"
!  commit_range="HEAD"
!fi

!echo "" >> RELEASE_REPORT.md

### 3. Conventional Commit Analysis
!echo "📋 Analyzing conventional commits..."
!feat_count=$(git log $commit_range --oneline --grep="^feat" | wc -l)
!fix_count=$(git log $commit_range --oneline --grep="^fix" | wc -l)
!docs_count=$(git log $commit_range --oneline --grep="^docs" | wc -l)
!chore_count=$(git log $commit_range --oneline --grep="^chore" | wc -l)
!refactor_count=$(git log $commit_range --oneline --grep="^refactor" | wc -l)
!test_count=$(git log $commit_range --oneline --grep="^test" | wc -l)
!breaking_count=$(git log $commit_range --oneline --grep="BREAKING CHANGE\|!" | wc -l)

!echo "Commit Type Analysis:" >> RELEASE_REPORT.md
!echo "- Features (feat): $feat_count" >> RELEASE_REPORT.md
!echo "- Bug fixes (fix): $fix_count" >> RELEASE_REPORT.md
!echo "- Documentation (docs): $docs_count" >> RELEASE_REPORT.md
!echo "- Chores (chore): $chore_count" >> RELEASE_REPORT.md
!echo "- Refactoring (refactor): $refactor_count" >> RELEASE_REPORT.md
!echo "- Tests (test): $test_count" >> RELEASE_REPORT.md
!echo "- Breaking changes: $breaking_count" >> RELEASE_REPORT.md
!echo "" >> RELEASE_REPORT.md

### 4. Determine Version Bump Type
!echo "🎯 Determining appropriate version bump..."
!if [ $breaking_count -gt 0 ]; then
!  bump_type="major"
!  echo "🔴 MAJOR version bump required (breaking changes detected)"
!elif [ $feat_count -gt 0 ]; then
!  bump_type="minor"
!  echo "🟡 MINOR version bump required (new features detected)"
!elif [ $fix_count -gt 0 ]; then
!  bump_type="patch"
!  echo "🟢 PATCH version bump required (bug fixes detected)"
!else
!  bump_type="patch"
!  echo "🔵 PATCH version bump (default for other changes)"
!fi

!echo "Recommended bump type: $bump_type" >> RELEASE_REPORT.md
!echo "" >> RELEASE_REPORT.md

### 5. Version Bump Execution
!echo "⬆️ Executing version bump..."
!npm version $bump_type --no-git-tag-version
!new_version=$(node -p "require('./package.json').version")
!echo "✅ Version bumped from $current_version to $new_version"
!echo "New version: $new_version" >> RELEASE_REPORT.md

## Changelog Generation

### 6. Generate Changelog Entry
!echo ""
!echo "📝 Generating changelog entry..."
!echo "" >> RELEASE_REPORT.md
!echo "### Changelog Entry for v$new_version" >> RELEASE_REPORT.md
!echo "**Release Date:** $(date +%Y-%m-%d)" >> RELEASE_REPORT.md
!echo "" >> RELEASE_REPORT.md

### 7. Features and Improvements
!if [ $feat_count -gt 0 ]; then
!  echo "#### 🚀 Features" >> RELEASE_REPORT.md
!  git log $commit_range --oneline --grep="^feat" | while read commit; do
!    echo "- $commit" >> RELEASE_REPORT.md
!  done
!  echo "" >> RELEASE_REPORT.md
!fi

### 8. Bug Fixes
!if [ $fix_count -gt 0 ]; then
!  echo "#### 🐛 Bug Fixes" >> RELEASE_REPORT.md
!  git log $commit_range --oneline --grep="^fix" | while read commit; do
!    echo "- $commit" >> RELEASE_REPORT.md
!  done
!  echo "" >> RELEASE_REPORT.md
!fi

### 9. Breaking Changes
!if [ $breaking_count -gt 0 ]; then
!  echo "#### ⚠️ BREAKING CHANGES" >> RELEASE_REPORT.md
!  git log $commit_range --oneline --grep="BREAKING CHANGE\|!" | while read commit; do
!    echo "- $commit" >> RELEASE_REPORT.md
!  done
!  echo "" >> RELEASE_REPORT.md
!fi

### 10. Other Changes
!echo "#### 🔧 Other Changes" >> RELEASE_REPORT.md
!if [ $docs_count -gt 0 ]; then
!  echo "**Documentation:**" >> RELEASE_REPORT.md
!  git log $commit_range --oneline --grep="^docs" | head -5 | while read commit; do
!    echo "- $commit" >> RELEASE_REPORT.md
!  done
!fi

!if [ $chore_count -gt 0 ]; then
!  echo "**Maintenance:**" >> RELEASE_REPORT.md
!  git log $commit_range --oneline --grep="^chore" | head -5 | while read commit; do
!    echo "- $commit" >> RELEASE_REPORT.md
!  done
!fi

## Release Preparation

### 11. Pre-release Checklist
!echo ""
!echo "✅ Generating pre-release checklist..."
!echo "" >> RELEASE_REPORT.md
!echo "### Pre-release Checklist" >> RELEASE_REPORT.md

!echo "- [ ] Version bumped to v$new_version" >> RELEASE_REPORT.md
!echo "- [ ] CHANGELOG.md updated (if exists)" >> RELEASE_REPORT.md
!echo "- [ ] All tests passing" >> RELEASE_REPORT.md
!echo "- [ ] Documentation updated" >> RELEASE_REPORT.md
!echo "- [ ] Security audit completed" >> RELEASE_REPORT.md
!echo "- [ ] Build/compilation successful" >> RELEASE_REPORT.md
!echo "- [ ] Environment variables documented" >> RELEASE_REPORT.md
!echo "- [ ] Database migrations (if any) documented" >> RELEASE_REPORT.md
!echo "" >> RELEASE_REPORT.md

### 12. Update CHANGELOG.md (if exists)
!if [ -f CHANGELOG.md ]; then
!  echo "📄 Updating CHANGELOG.md..."
!  
!  # Create backup
!  cp CHANGELOG.md CHANGELOG.md.backup
!  
!  # Prepend new version to changelog
!  {
!    echo "# Changelog"
!    echo ""
!    echo "## [v$new_version] - $(date +%Y-%m-%d)"
!    echo ""
!    grep -A 20 "### Changelog Entry for v$new_version" RELEASE_REPORT.md | tail -n +2
!    echo ""
!    tail -n +3 CHANGELOG.md.backup 2>/dev/null || echo ""
!  } > CHANGELOG.md
!  
!  echo "✅ CHANGELOG.md updated"
!  echo "✅ CHANGELOG.md updated with v$new_version" >> RELEASE_REPORT.md
!else
!  echo "ℹ️ No CHANGELOG.md found - consider creating one"
!  echo "ℹ️ No CHANGELOG.md found - consider creating one" >> RELEASE_REPORT.md
!fi

### 13. Release Tag Preparation
!echo ""
!echo "🏷️ Preparing release tag..."
!echo "" >> RELEASE_REPORT.md
!echo "### Release Tag Information" >> RELEASE_REPORT.md
!echo "- Tag name: v$new_version" >> RELEASE_REPORT.md
!echo "- Tag command: \`git tag -a v$new_version -m \"Release v$new_version\"\`" >> RELEASE_REPORT.md
!echo "- Push command: \`git push origin v$new_version\`" >> RELEASE_REPORT.md

### 14. Build and Test Verification
!echo ""
!echo "🧪 Running pre-release verification..."
!echo "" >> RELEASE_REPORT.md
!echo "### Pre-release Verification" >> RELEASE_REPORT.md

# Test installation
!npm install --production --silent && echo "✅ Production install successful" >> RELEASE_REPORT.md || echo "❌ Production install failed" >> RELEASE_REPORT.md

# Check for missing dependencies
!npm ls --production --depth=0 >/dev/null 2>&1 && echo "✅ No missing dependencies" >> RELEASE_REPORT.md || echo "⚠️ Missing dependencies detected" >> RELEASE_REPORT.md

# Security audit
!npm audit --audit-level moderate >/dev/null 2>&1 && echo "✅ No moderate+ security vulnerabilities" >> RELEASE_REPORT.md || echo "⚠️ Security vulnerabilities detected" >> RELEASE_REPORT.md

## Release Commands

### 15. Generate Release Commands
!echo ""
!echo "🚀 Generating release commands..."
!echo "" >> RELEASE_REPORT.md
!echo "### Release Commands" >> RELEASE_REPORT.md
!echo "\`\`\`bash" >> RELEASE_REPORT.md
!echo "# Commit the version bump" >> RELEASE_REPORT.md
!echo "git add package.json package-lock.json CHANGELOG.md" >> RELEASE_REPORT.md
!echo "git commit -m \"chore(release): bump version to v$new_version\"" >> RELEASE_REPORT.md
!echo "" >> RELEASE_REPORT.md
!echo "# Create and push tag" >> RELEASE_REPORT.md
!echo "git tag -a v$new_version -m \"Release v$new_version\"" >> RELEASE_REPORT.md
!echo "git push origin main" >> RELEASE_REPORT.md
!echo "git push origin v$new_version" >> RELEASE_REPORT.md
!echo "" >> RELEASE_REPORT.md
!echo "# Create GitHub release (if using GitHub)" >> RELEASE_REPORT.md
!echo "gh release create v$new_version --title \"v$new_version\" --notes-file RELEASE_REPORT.md" >> RELEASE_REPORT.md
!echo "\`\`\`" >> RELEASE_REPORT.md

## Summary

!echo ""
!echo "✅ Release preparation completed"
!echo ""
!echo "📊 Release Summary:"
!echo "- Version: $current_version → $new_version ($bump_type bump)"
!echo "- Features: $feat_count"
!echo "- Bug fixes: $fix_count"
!echo "- Breaking changes: $breaking_count"
!echo "- Total commits: $(git log $commit_range --oneline | wc -l)"
!echo ""
!echo "📋 Reports generated:"
!echo "- RELEASE_REPORT.md: Complete release documentation"
!echo "- CHANGELOG.md: $([ -f CHANGELOG.md ] && echo "Updated" || echo "Not found")"
!echo ""
!echo "🎯 Next steps:"
!echo "1. Review RELEASE_REPORT.md"
!echo "2. Run final tests: npm test"
!echo "3. Execute release commands from the report"
!echo "4. Create GitHub release with generated notes"