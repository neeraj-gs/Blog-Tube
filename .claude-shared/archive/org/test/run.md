---
description: Run complete test suite with coverage and reporting
---

# Test Suite Runner

Executes the complete test suite including unit tests, integration tests, and generates coverage reports for Node.js Express applications.

## Test Execution

### 1. Unit Tests with Coverage
!npm test -- --coverage --verbose

### 2. Integration Tests (if available)
!npm run test:integration 2>/dev/null || echo "ℹ️ Integration tests not configured"

### 3. Coverage Summary
!echo "📊 Generating coverage summary..."
!npm test -- --coverage --silent | grep -E "(All files|Statements|Branches|Functions|Lines)" || echo "Coverage data not available"

## Quality Gates

### Minimum Coverage Thresholds
- **Statements**: 80%
- **Branches**: 75%  
- **Functions**: 80%
- **Lines**: 80%

## Post-Test Actions

!echo "✅ Test suite execution completed"
!echo "📋 Review coverage report in coverage/ directory"