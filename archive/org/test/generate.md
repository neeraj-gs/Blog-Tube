---
description: Generate comprehensive test suites (unit, integration, and e2e tests with Playwright)
---

# Test Generation Suite

Automatically generates unit tests, integration tests, and end-to-end tests for Node.js Express API applications following existing codebase patterns and coding standards.

## Test Generation Options

### 1. Generate Unit Tests
!echo "🧪 Generating unit tests..."

**Target Types:**
- **Controllers**: Mock service dependencies, test HTTP request/response validation
- **Services**: Test business logic with mocked external dependencies (DB, AWS, APIs)  
- **Middleware**: Test request/response transformations and auth flows
- **Validators**: Test input validation rules and error messages

**Patterns Used:**
- Jest with MongoDB Memory Server isolation
- Centralized response handlers (`_handleResponse`, `_handleResponseWithMessage`)
- Proper async/await error handling with try/catch
- Mock all external dependencies (AWS S3, SES, Socket.IO, etc.)

### 2. Generate Integration Tests  
!echo "🔗 Generating integration tests for API routes..."

**Coverage:**
- Complete HTTP request/response cycles using Supertest
- Database operations with test data fixtures
- Authentication flows (JWT, Web3Auth, API keys)
- Rate limiting and middleware chain execution
- File upload scenarios with S3 mocking

**Test Structure:**
- Mirror production route structure in `__tests__/routes/`
- Use real Express app with mocked external services
- Test all CRUD operations and business workflows
- Validate response formats match API documentation

### 3. Generate E2E Tests with Playwright
!echo "🌐 Generating end-to-end tests with Playwright..."

**Setup Requirements:**
```bash
# Install Playwright if not present
npm install --save-dev @playwright/test
npx playwright install
```

**Test Scenarios:**
- **User Registration & Onboarding**: Complete KYC/KYB flows
- **Investment Workflows**: Project browsing, investment, payment processing
- **Admin Operations**: User management, project approval, revenue distribution
- **Real-time Features**: Socket.IO notifications and live updates
- **Cross-browser Compatibility**: Chrome, Firefox, Safari testing

**Playwright Configuration:**
- Separate test database for E2E isolation
- API mocking for external services (payment processors, etc.)
- Visual regression testing for UI components
- Mobile responsive testing

## Code Analysis & Generation

### 1. Analyze Existing Code Structure
!echo "📊 Analyzing codebase for test generation..."
!find api -name "*.js" -path "*/controllers/*" -o -path "*/services/*" -o -path "*/middleware/*" | head -10
!echo "🔍 Identifying untested files..."

### 2. Coverage Gap Analysis
!echo "📈 Checking current test coverage..."
!cd api && npm test -- --coverage --silent | grep -E "^[^|]*\|.*[0-9]{1,2}\.[0-9]+" | sort -k4 -n | head -10 || echo "Run npm test --coverage first"

### 3. Generate Test Templates
!echo "🏗️ Creating test templates based on file analysis..."

## Test Templates Following Codebase Patterns

### Controller Test Template
```javascript
// Following clean code standards from CLAUDE.md
import { controllerName } from '../../controllers/example.controller.js';
import { serviceName } from '../../services/example.service.js';

jest.mock('../../services/example.service.js');

global.logger = { error: jest.fn(), info: jest.fn(), warn: jest.fn() };
global._handleResponseWithMessage = jest.fn();
global._handleResponse = jest.fn();

describe('ExampleController', () => {
  let req, res;
  
  beforeEach(() => {
    req = { body: {}, params: {}, user: { userId: 'testId' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.clearAllMocks();
  });

  // Test successful operations
  // Test validation errors  
  // Test authentication failures
  // Test service layer errors
});
```

### Service Test Template
```javascript
// Business logic testing with proper mocking
import { serviceFunction } from '../../services/example.service.js';
import Model from '../../models/Example.js';
import sendEmail from '../../utils/sendEmail.js';

jest.mock('../../models/Example.js');
jest.mock('../../utils/sendEmail.js');
jest.mock('../../utils/dbHelper.js');

describe('ExampleService', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  // Test business logic scenarios
  // Test error handling and edge cases
  // Test external service integrations
  // Test database transactions
});
```

### Integration Test Template  
```javascript
// Full HTTP request/response testing
import request from 'supertest';
import express from 'express';
import router from '../../routes/example.routes.js';

const app = express();
app.use(express.json());
app.use(router);

describe('Example Routes Integration', () => {
  // Test complete API workflows
  // Test authentication middleware
  // Test rate limiting
  // Test database state changes
});
```

### Playwright E2E Test Template
```javascript
// End-to-end user journey testing
import { test, expect } from '@playwright/test';

test.describe('Investment Workflow E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Setup test data and authentication
    await page.goto('http://localhost:3000');
  });

  test('complete investment flow', async ({ page }) => {
    // User registration
    // KYC completion  
    // Project browsing
    // Investment transaction
    // Payment processing
    // Confirmation and notifications
  });

  test('real-time notifications', async ({ page }) => {
    // Test Socket.IO connections
    // Test live updates
    // Test cross-user interactions
  });
});
```

## Quality Standards & Requirements

### Test Coverage Targets
- **Unit Tests**: 95%+ for services, 90%+ for controllers
- **Integration Tests**: All API endpoints covered
- **E2E Tests**: All critical user journeys covered
- **Error Scenarios**: All error paths and edge cases tested

### Generated Test Features
- **Realistic Test Data**: Based on actual model schemas
- **Comprehensive Mocking**: AWS services, external APIs, Socket.IO
- **Performance Testing**: Load testing for critical endpoints
- **Security Testing**: Authentication, authorization, input validation
- **Database Testing**: Transaction handling, data integrity

### Naming Conventions
- Unit: `*.test.js` in `__tests__/[controllers|services|middleware]/`
- Integration: `*.routes.test.js` in `__tests__/routes/`  
- E2E: `*.e2e.test.js` in `tests/e2e/` (Playwright convention)

## Advanced Generation Features

### AI-Powered Test Generation
!echo "🤖 Generating intelligent test scenarios..."
- Analyze business logic to create realistic test cases
- Generate test data that matches model validation rules
- Create comprehensive error scenario coverage
- Generate performance benchmarks based on usage patterns

### Playwright E2E Setup
!echo "🎭 Setting up Playwright configuration..."
```bash
# Create playwright.config.js
echo "Creating Playwright config with proper test isolation..."

# Setup E2E test database
echo "Configuring separate test database for E2E tests..."

# Configure CI/CD integration  
echo "Adding Playwright tests to CI pipeline..."
```

## Post-Generation Actions

!echo "✅ Test generation completed successfully"
!echo "🧪 Run 'npm test' to execute unit and integration tests"
!echo "🎭 Run 'npx playwright test' to execute E2E tests"
!echo "📊 Run 'npm test -- --coverage' to verify coverage improvements"
!echo "🔍 Review generated tests for business logic accuracy"
!echo "⚙️ Configure CI/CD pipeline to run all test suites"

## Interactive Generation Prompts

**When command runs, prompt for:**
1. **Test Type**: Unit, Integration, E2E, or All?
2. **Target Scope**: Specific file, feature, or full coverage?
3. **Focus Areas**: Business logic, error handling, performance, security?
4. **Playwright Setup**: Install and configure if E2E selected?
5. **Mock Strategy**: Level of external service mocking?

## Maintenance & Updates

### Keeping Tests Current
- Update tests when API contracts change
- Maintain test data fixtures with model changes
- Keep Playwright selectors updated with UI changes
- Regular test performance and reliability audits