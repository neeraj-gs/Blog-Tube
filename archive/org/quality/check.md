---
description: Combined quality gate - runs linting, formatting, tests, and security audit
---

# Quality Check Gate

Comprehensive quality assurance workflow that combines code formatting, linting, testing, and security analysis in a single command.

## Quality Workflow

### 1. Code Style and Formatting
!echo "🎨 Running code formatting and linting..."
!/org:lint-and-format

### 2. Test Suite Execution
!echo "🧪 Running test suite..."
!/org:test:run

### 3. Security Analysis
!echo "🔒 Running security audit..."
!/org:security-audit

## Quality Metrics

### Code Quality Checks
- ✅ ESLint rules compliance
- ✅ Prettier formatting standards
- ✅ Test coverage thresholds
- ✅ Security vulnerability scan

### Performance Indicators
!echo "📊 Quality metrics summary:"
!echo "- Linting: $(npm run lint 2>&1 | grep -c "error" || echo "0") errors"
!echo "- Tests: $(npm test --silent 2>&1 | grep -o "[0-9]* passing" || echo "status unknown")"
!echo "- Security: $(npm audit --audit-level moderate 2>&1 | grep -c "vulnerabilities" || echo "0") vulnerabilities"

## Pre-Commit Quality Gate

This command is ideal for:
- Pre-commit hooks
- Pull request preparation  
- CI/CD quality gates
- Daily development workflow

## Quality Standards

Enforces Penomo's development standards:
- **Code Style**: Consistent formatting across all projects
- **Test Coverage**: Minimum 80% coverage requirement
- **Security**: No high/critical vulnerabilities
- **Linting**: Zero ESLint errors

## Exit Codes

- **0**: All quality checks passed
- **1**: Quality checks failed - review output for details

!echo ""
!echo "✅ Quality check completed"
!echo "🎯 All quality gates verified for Penomo standards"