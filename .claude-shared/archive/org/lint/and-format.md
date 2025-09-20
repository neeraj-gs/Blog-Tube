---
description: Run linting and formatting for Node.js projects
---

# Organization Lint and Format

Runs comprehensive code quality checks and formatting for Node.js Express projects using ESLint and Prettier.

## Code Quality Workflow

### 1. ESLint Analysis
!npm run lint

### 2. Auto-fix ESLint Issues
!npm run lint:fix

### 3. Prettier Formatting
!npm run format

### 4. Check for Remaining Issues
!npm run lint

## Quality Metrics

### Check for Common Issues
- Unused variables and imports
- Console.log statements in production code
- Missing error handling
- Inconsistent naming conventions

### Security Patterns
- Verify no hardcoded credentials
- Check for proper error handling
- Validate input sanitization patterns

## Post-Format Actions

After formatting, ensure:
1. All tests still pass: `npm test`
2. Application starts correctly: `npm start`
3. No TypeScript errors (if applicable)

## Team Standards

This command enforces Penomo's coding standards:
- 2-space indentation
- Single quotes for strings
- Semicolons required
- Max line length: 100 characters
- Trailing commas in multiline structures

## Integration

Best used before:
- Creating pull requests
- Committing code changes
- Deploying to staging/production