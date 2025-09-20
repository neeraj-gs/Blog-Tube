---
description: "Create intelligent commit message and push to specified branch"
allowed-tools: ["Bash"]
---

# 🚀 Commit and Push to Branch

I'll analyze the current changes, create an intelligent commit message, and push to the branch.

!bash -c 'if [ -z "$ARGUMENTS" ]; then echo "Target: Current branch ($(git branch --show-current))"; else echo "Target: $ARGUMENTS"; fi'

## 📊 Current Repository Status

!git status --short

!git branch --show-current

## 🔍 Analyzing Changes

Let me examine what files have been modified:

!git diff --staged --name-only 2>/dev/null || echo "No staged changes"

!git diff --name-only 2>/dev/null || echo "No unstaged changes"

!git diff --staged --stat 2>/dev/null || git diff --stat 2>/dev/null || echo "No changes detected"

## 📋 Comprehensive Change Analysis

!bash -c '
echo "📊 **CHANGE ANALYSIS SUMMARY:**"
echo ""

# Count different types of changes
STAGED_FILES=$(git diff --staged --name-only 2>/dev/null | wc -l | tr -d " ")
UNSTAGED_FILES=$(git diff --name-only 2>/dev/null | wc -l | tr -d " ")
UNTRACKED_FILES=$(git ls-files --others --exclude-standard 2>/dev/null | wc -l | tr -d " ")

echo "• Staged changes: $STAGED_FILES files"
echo "• Unstaged changes: $UNSTAGED_FILES files"  
echo "• Untracked files: $UNTRACKED_FILES files"
echo "• **Total files affected: $((STAGED_FILES + UNSTAGED_FILES + UNTRACKED_FILES))**"
echo ""

if [ $UNSTAGED_FILES -gt 0 ] || [ $UNTRACKED_FILES -gt 0 ]; then
    echo "🔄 **CHANGE BREAKDOWN:**"
    
    if [ $UNSTAGED_FILES -gt 0 ]; then
        echo ""
        echo "**Modified Files ($UNSTAGED_FILES):**"
        git diff --name-only 2>/dev/null | head -10 | while read -r file; do
            STATUS=$(git status --porcelain "$file" | cut -c2)
            case "$STATUS" in
                "M") echo "  📝 Modified: $file" ;;
                "D") echo "  🗑️  Deleted: $file" ;;
                *) echo "  📄 Changed: $file" ;;
            esac
        done
        [ $UNSTAGED_FILES -gt 10 ] && echo "  ... and $((UNSTAGED_FILES - 10)) more files"
    fi
    
    if [ $UNTRACKED_FILES -gt 0 ]; then
        echo ""
        echo "**New Files ($UNTRACKED_FILES):**"
        git ls-files --others --exclude-standard 2>/dev/null | head -5 | while read -r file; do
            echo "  ✨ New: $file"
        done
        [ $UNTRACKED_FILES -gt 5 ] && echo "  ... and $((UNTRACKED_FILES - 5)) more files"
    fi
fi
echo ""
'

## 🧠 Generating Smart Commit Message

!bash -c '
# Check if there are any changes to commit
TOTAL_CHANGES=$(git status --porcelain | wc -l | tr -d " ")

if [ $TOTAL_CHANGES -eq 0 ]; then
    echo "ℹ️  **No changes detected** - repository is clean"
    echo ""
    echo "Current branch: $(git branch --show-current)"
    echo "Latest commit: $(git log --oneline -1)"
    exit 0
fi

echo "📝 Adding all changes and generating commit message..."
'

!git add -A

Let me analyze the changes to create an appropriate commit type and message:

!bash -c '
# Get change statistics and file info
MODIFIED_FILES=$(git diff --staged --name-only)
FILE_COUNT=$(echo "$MODIFIED_FILES" | wc -l | tr -d " ")
ADDITIONS=$(git diff --staged --numstat | awk "{add += \$1} END {print add+0}")
DELETIONS=$(git diff --staged --numstat | awk "{del += \$2} END {print del+0}")

# Check for breaking changes in commit message conventions
BREAKING_CHANGE=""
if git diff --staged | grep -qi "breaking.change\|breaking.api\|major.version"; then
    BREAKING_CHANGE="!"
fi

# Determine commit type using generic patterns
get_commit_type() {
    # Test files (universal patterns)
    if echo "$MODIFIED_FILES" | grep -qE "\.(test|spec)\.|__tests__/|/tests?/|\.test$|\.spec$"; then
        echo "test"
        return
    fi
    
    # Documentation files (universal patterns) 
    if echo "$MODIFIED_FILES" | grep -qiE "\.(md|txt|rst|adoc)$|readme|changelog|license|docs?/"; then
        echo "docs"
        return
    fi
    
    # Configuration and build files (universal patterns)
    if echo "$MODIFIED_FILES" | grep -qE "package(-lock)?\.json|yarn\.lock|composer\.(json|lock)|Gemfile(\.lock)?|requirements\.txt|setup\.(py|cfg)|Cargo\.(toml|lock)|go\.(mod|sum)|pom\.xml|build\.gradle|Makefile|Dockerfile|docker-compose|\.env|config\.|\.config|\.yml$|\.yaml$"; then
        echo "chore"
        return
    fi
    
    # Style files (universal patterns)
    if echo "$MODIFIED_FILES" | grep -qiE "\.(css|scss|sass|less|styl)$|styles?/"; then
        echo "style"
        return
    fi
    
    # Analyze diff content for type hints
    DIFF_CONTENT=$(git diff --staged)
    
    # Look for fix/bug patterns in diff
    if echo "$DIFF_CONTENT" | grep -qi "fix\|bug\|error\|issue\|patch\|hotfix"; then
        echo "fix"
        return
    fi
    
    # Look for refactor patterns
    if echo "$DIFF_CONTENT" | grep -qi "refactor\|restructur\|reorganiz\|cleanup"; then
        echo "refactor"
        return
    fi
    
    # Look for performance patterns
    if echo "$DIFF_CONTENT" | grep -qi "performance\|perf\|optim\|speed\|faster"; then
        echo "perf"
        return
    fi
    
    # Default to feat for new functionality or if mostly additions
    if [ "$ADDITIONS" -gt "$DELETIONS" ]; then
        echo "feat"
    else
        echo "refactor"
    fi
}

# Determine scope dynamically from directory structure
get_scope() {
    # Get the most common directory from changed files
    MAIN_DIR=$(echo "$MODIFIED_FILES" | cut -d/ -f1 | sort | uniq -c | sort -nr | head -1 | awk "{print \$2}")
    
    # If files are in subdirectories, try to get more specific scope
    if [ $(echo "$MODIFIED_FILES" | grep "/" | wc -l) -gt 0 ]; then
        # Get most common second-level directory
        SUBDIR=$(echo "$MODIFIED_FILES" | grep "/" | cut -d/ -f1-2 | sort | uniq -c | sort -nr | head -1 | awk "{print \$2}")
        if [ "$SUBDIR" != "$MAIN_DIR" ]; then
            echo "$SUBDIR" | tr "/" "-"
            return
        fi
    fi
    
    # Fallback to main directory or "core" if root files
    if [ -n "$MAIN_DIR" ] && [ "$MAIN_DIR" != "." ]; then
        echo "$MAIN_DIR"
    else
        echo "core"
    fi
}

# Generate description based on actual changes
get_description() {
    local commit_type="$1"
    local scope="$2"
    
    # Extract meaningful keywords from diff and file names
    KEYWORDS=$(echo "$MODIFIED_FILES" | tr "/" " " | tr "-" " " | tr "_" " " | tr "." " " | sort | uniq -c | sort -nr | head -3 | awk "{print \$2}" | grep -v "js\|ts\|py\|java\|go\|rb\|php")
    
    case "$commit_type" in
        "feat")
            if [ -n "$KEYWORDS" ]; then
                echo "add $(echo $KEYWORDS | head -1) functionality"
            else
                echo "add new features"
            fi
            ;;
        "fix")
            if [ -n "$KEYWORDS" ]; then
                echo "resolve $(echo $KEYWORDS | head -1) issues"
            else
                echo "fix bugs and issues"
            fi
            ;;
        "docs")
            echo "update documentation"
            ;;
        "test")
            echo "improve test coverage"
            ;;
        "refactor")
            if [ -n "$KEYWORDS" ]; then
                echo "refactor $(echo $KEYWORDS | head -1) implementation"
            else
                echo "improve code structure"
            fi
            ;;
        "chore")
            echo "update dependencies and configuration"
            ;;
        "style")
            echo "update styling and formatting"
            ;;
        "perf")
            echo "improve performance"
            ;;
        *)
            echo "update $scope"
            ;;
    esac
}

# Generate commit components
COMMIT_TYPE=$(get_commit_type)
SCOPE=$(get_scope)
DESCRIPTION=$(get_description "$COMMIT_TYPE" "$SCOPE")

# Generate comprehensive commit message
COMMIT_TITLE="${COMMIT_TYPE}${BREAKING_CHANGE}(${SCOPE}): ${DESCRIPTION}"

# Check for major changes that need detailed explanation
NEEDS_DETAILED_MSG=false

# Check for major refactoring/reorganization
if [ "$COMMIT_TYPE" = "refactor" ] && [ $FILE_COUNT -gt 20 ]; then
    NEEDS_DETAILED_MSG=true
fi

# Check for new features with multiple files
if [ "$COMMIT_TYPE" = "feat" ] && [ $FILE_COUNT -gt 10 ]; then
    NEEDS_DETAILED_MSG=true
fi

# Check for breaking changes
if [ -n "$BREAKING_CHANGE" ]; then
    NEEDS_DETAILED_MSG=true
fi

# Create commit message based on complexity
if [ "$NEEDS_DETAILED_MSG" = "true" ]; then
    # Generate detailed commit message for complex changes
    git commit -m "$(cat <<EOF
$COMMIT_TITLE

This commit implements significant changes across $FILE_COUNT files with $ADDITIONS additions and $DELETIONS deletions.

CHANGE SUMMARY:
• Commit Type: $COMMIT_TYPE
• Scope: $SCOPE  
• Files Modified: $FILE_COUNT
• Lines Added: $ADDITIONS
• Lines Deleted: $DELETIONS

IMPACT:
$(if [ "$COMMIT_TYPE" = "refactor" ]; then
echo "• Code structure improvements and reorganization"
echo "• Enhanced maintainability and scalability"
echo "• Preserved functionality with better organization"
elif [ "$COMMIT_TYPE" = "feat" ]; then
echo "• New functionality added to the system"
echo "• Enhanced capabilities and features"
echo "• Expanded system functionality"
elif [ "$COMMIT_TYPE" = "fix" ]; then
echo "• Bug fixes and issue resolution"
echo "• Improved system stability and reliability" 
echo "• Enhanced user experience"
else
echo "• System updates and improvements"
echo "• Enhanced functionality and performance"
fi)

$(if [ -n "$BREAKING_CHANGE" ]; then
echo "BREAKING CHANGES:"
echo "• This commit contains breaking changes that may affect existing functionality"
echo "• Review and test thoroughly before deployment"
echo ""
fi)🚀 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
else
    # Simple commit message for smaller changes
    git commit -m "$COMMIT_TITLE

Updated $FILE_COUNT file(s) with $ADDITIONS additions and $DELETIONS deletions

🚀 Generated with Claude Code  
Co-Authored-By: Claude <noreply@anthropic.com>"
fi

echo "✅ Commit created: $COMMIT_TITLE"
echo "📁 Scope: $SCOPE | 📝 Type: $COMMIT_TYPE | 📊 Changes: +$ADDITIONS/-$DELETIONS"
'

## 🌿 Switching to Target Branch

!bash -c 'if [ -n "$ARGUMENTS" ]; then git checkout $ARGUMENTS 2>/dev/null || git checkout -b $ARGUMENTS; else echo "Staying on current branch: $(git branch --show-current)"; fi'

## 📤 Pushing to Remote

!bash -c 'BRANCH=${ARGUMENTS:-$(git branch --show-current)}; git push -u origin $BRANCH'

## ✅ Success!

!bash -c 'BRANCH=${ARGUMENTS:-$(git branch --show-current)}; echo "**Branch:** \`$BRANCH\`"; echo "**Status:** Changes committed and pushed successfully"'

## 📊 Final Commit Summary

!bash -c '
COMMIT_HASH=$(git rev-parse --short HEAD)
COMMIT_MSG=$(git log --format=%s -1)
BRANCH=$(git branch --show-current)

echo "**Commit Hash:** \`$COMMIT_HASH\`"
echo "**Branch:** \`$BRANCH\`" 
echo "**Message:** $COMMIT_MSG"
echo ""

# Show file change summary from the commit
FILES_CHANGED=$(git show --stat --format="" HEAD | wc -l | tr -d " ")
if [ $FILES_CHANGED -gt 0 ]; then
    echo "**Files Changed:** $FILES_CHANGED"
    echo ""
    echo "**Change Details:**"
    git show --stat --format="" HEAD | head -10
    if [ $FILES_CHANGED -gt 10 ]; then
        echo "... and $((FILES_CHANGED - 10)) more files"
    fi
fi
'

### 🔗 Quick Actions
```bash
# View the commit
git log --oneline -1

# Create PR (if gh CLI installed)
gh pr create --title "$(git log --format=%s -1)" --body "Auto-generated commit via Claude Code"

# Run tests
npm test
```

### 🌐 GitHub Links

!bash -c 'BRANCH=${ARGUMENTS:-$(git branch --show-current)}; echo "- **Branch:** https://github.com/penomoprotocol/penomo-api/tree/$BRANCH"; echo "- **Compare:** https://github.com/penomoprotocol/penomo-api/compare/main...$BRANCH"'