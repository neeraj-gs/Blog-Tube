# Claudia Integration Setup Guide

This guide walks you through setting up the enhanced Claudia integrations for Notion API and AI-powered test generation.

## Prerequisites

### Required Software
- **Node.js** (v14 or higher) - Required for Notion integration and test generation
- **npm** or **yarn** - For managing JavaScript dependencies
- **Git** - For repository management
- **GitHub CLI (gh)** - For GitHub Issues integration

### Required Access
- **Notion Account** with API access
- **GitHub Repository** with Issues enabled
- **Notion Workspace** with admin permissions

## 1. Notion Integration Setup

### Step 1: Create Notion Integration

1. Go to [Notion Developers](https://developers.notion.com/)
2. Click "Create new integration"
3. Fill out the integration details:
   - **Name**: "Claudia Automation"
   - **Description**: "End-to-end development automation with full traceability"
   - **Associated workspace**: Select your workspace
4. Click "Submit" and copy the **Internal Integration Token**

### Step 2: Create Notion Databases

#### Tickets Database
Create a new database in Notion with these properties:

| Property Name | Type | Description |
|---------------|------|-------------|
| Ticket ID | Title | Primary identifier (e.g., tick-001-xp-db) |
| Title | Rich Text | Human-readable ticket title |
| Status | Select | To Do, In Progress, Testing, Done, Blocked |
| Priority | Select | Low, Medium, High, Critical |
| Type | Select | Database, API, Frontend, Testing, Implementation |
| Requirement | Rich Text | Associated requirement UUID |
| GitHub Issue | Number | GitHub issue number |
| Assignee | People | Team member assigned |
| Created Date | Date | Creation timestamp |
| Completed Date | Date | Completion timestamp |
| Estimated Hours | Number | Effort estimation |
| Commit Hash | Rich Text | Implementation commit |
| PR Number | Number | Pull request number |

#### Requirements Database
Create a new database with these properties:

| Property Name | Type | Description |
|---------------|------|-------------|
| Requirement ID | Title | Primary identifier (e.g., req-001-xp-system) |
| Title | Rich Text | Human-readable requirement title |
| Status | Select | Draft, Approved, In Development, Complete |
| Priority | Select | Low, Medium, High, Critical |
| Category | Select | Feature, Enhancement, Bug Fix, Technical |
| Created Date | Date | Creation timestamp |
| Stakeholder | People | Business stakeholder |

### Step 3: Configure Database Access

1. Go to each database in Notion
2. Click the "..." menu → "Connections"
3. Search for "Claudia Automation" and connect it
4. Copy each database's URL - the database ID is the long string in the URL

### Step 4: Update Configuration

Edit `.claude/systems/claudia/config/notion.json`:

```json
{
  "token": "WILL_BE_SET_VIA_ENVIRONMENT",
  "databases": {
    "tickets": "YOUR_TICKETS_DATABASE_ID",
    "requirements": "YOUR_REQUIREMENTS_DATABASE_ID",
    "commits": "YOUR_COMMITS_DATABASE_ID"
  },
  "workspace_id": "YOUR_WORKSPACE_ID",
  "api_version": "2022-06-28",
  "settings": {
    "autoAssign": true,
    "syncEnabled": true,
    "statusMapping": {
      "pending": "To Do",
      "in_progress": "In Progress",
      "testing": "Testing", 
      "completed": "Done",
      "blocked": "Blocked"
    },
    "priorityMapping": {
      "low": "Low",
      "medium": "Medium",
      "high": "High", 
      "critical": "Critical"
    }
  }
}
```

### Step 5: Set Environment Variables

Add to your shell profile (`.bashrc`, `.zshrc`, etc.):

```bash
# Claudia Notion Integration
export NOTION_TOKEN="YOUR_INTEGRATION_TOKEN_HERE"
export NOTION_USER_ID="YOUR_NOTION_USER_ID" # Optional, for auto-assignment
```

## 2. AI-Powered Test Generation Setup

### Step 1: Install Dependencies

Navigate to the Claudia scripts directory and install dependencies:

```bash
cd .claude/systems/claudia/scripts/
npm init -y
npm install @notionhq/client
```

### Step 2: Verify Test Generator

Test the AI-powered test generator:

```bash
# Test with a sample ticket (if you have one)
node test-generator.js generate tick-001-sample
```

### Step 3: Configure Test Framework Detection

The test generator automatically detects your test framework (Jest, Mocha, etc.) from `package.json`. Ensure your main project has the testing framework installed:

```bash
# For Jest (recommended)
cd ../../../api/  # Navigate to your API directory
npm install --save-dev jest @types/jest

# For additional testing utilities
npm install --save-dev supertest mongodb-memory-server
```

## 3. Integration Testing

### Test Notion Integration

```bash
# Test Notion client connection
cd .claude/systems/claudia/scripts/
node -e "
const ClaudiaNotionClient = require('./notion-client.js');
const client = new ClaudiaNotionClient();
client.initialize().then(success => {
  if (success) {
    console.log('✅ Notion integration working!');
    return client.generateStatusReport();
  } else {
    console.log('❌ Notion integration failed');
  }
}).then(report => {
  if (report) {
    console.log('📊 Status report generated successfully');
  }
}).catch(error => {
  console.log('❌ Error:', error.message);
});
"
```

### Test AI Test Generation

```bash
# Create a sample ticket to test with
mkdir -p 5-tickets/
cat > 5-tickets/test-001-sample.md << 'EOF'
# Sample Test Ticket

**Type:** API
**Complexity:** Medium
**Requirement:** `req-001-sample`

## Description
Sample ticket for testing AI-powered test generation.

## Acceptance Criteria
- Should create comprehensive test suite
- Should include unit, integration, and E2E tests
- Should follow TDD best practices

## Implementation Approach
- Create UserService with CRUD operations
- Add UserController for API endpoints
- Create User model with validation
EOF

# Test the generator
cd .claude/systems/claudia/scripts/
node test-generator.js generate test-001-sample
```

### Test Full Claudia Commands

```bash
# Test ticket assignment (requires GitHub CLI setup)
/claudia:tickets:assign test-001-sample

# Test manual implementation workflow
/claudia:implement:manual test-001-sample
```

## 4. Troubleshooting

### Common Issues

#### Notion API Errors
- **401 Unauthorized**: Check your `NOTION_TOKEN` environment variable
- **404 Database not found**: Verify database IDs in configuration
- **403 Forbidden**: Ensure the integration has access to the databases

#### Test Generation Issues
- **Node.js not found**: Install Node.js v14 or higher
- **Module not found**: Run `npm install` in the scripts directory
- **Parse errors**: Check ticket markdown format

#### GitHub Integration Issues
- **gh CLI not found**: Install GitHub CLI and authenticate
- **Repository access**: Ensure you have write access to the repository

### Debug Mode

Enable debug logging by setting:

```bash
export CLAUDIA_DEBUG=true
```

### Log Files

Check these locations for detailed logs:
- `.claude/systems/claudia/data/notion-sync.jsonl` - Notion integration logs
- `.claude/systems/claudia/data/commits-log.jsonl` - Commit traceability logs
- `.claude/systems/claudia/data/tickets-log.jsonl` - Ticket management logs

## 5. Advanced Configuration

### Custom Test Templates

You can customize test generation by modifying:
- `.claude/systems/claudia/scripts/test-generator.js`
- Add your own test patterns in the `testPatterns` object

### Notion Workspace Customization

Customize the Notion integration by:
- Adding custom properties to databases
- Modifying status/priority mappings in configuration
- Creating custom views and filters in Notion

### Webhook Integration (Advanced)

For real-time synchronization, set up webhooks:
- Notion webhooks for status updates
- GitHub webhooks for issue updates
- Custom middleware for bidirectional sync

## 6. Team Setup

### Repository Setup

To set up Claudia in a new repository:

```bash
# Add claude-shared subtree (if not already added)
git subtree add --prefix=.claude-shared [REMOTE_URL] main --squash

# Sync Claudia components
./.claude-shared/sync-commands.sh

# Set up team-specific configuration
cp .claude/systems/claudia/config/notion.json .claude/systems/claudia/config/notion.local.json
# Edit notion.local.json with team-specific database IDs
```

### Team Member Onboarding

Each team member needs:
1. Access to the Notion workspace
2. Environment variables configured
3. GitHub CLI authenticated
4. Node.js installed

## 7. Compliance & Reporting

The enhanced Claudia system provides:
- **Complete traceability** from requirements through deployment
- **Automated compliance reporting** via Notion integration
- **Quality metrics** through AI-generated comprehensive test suites
- **Audit trails** with detailed logging

All data is synchronized across GitHub Issues and Notion for management visibility and compliance tracking.

---

*This setup guide ensures the enhanced Claudia system is fully functional with actual Notion integration and AI-powered test generation capabilities.*