# 🎯 Claude Code Custom Commands

This guide covers the custom CLI commands available for the BlogTube automation system.

## 🚀 Quick Start

### Installation
```bash
cd automation
npm install
```

### Make commands executable
```bash
chmod +x claude-commands.js
```

## 📋 Available Commands

### 1. Analyze Issue
Analyze a GitHub issue for automation potential.

```bash
# Basic analysis
node claude-commands.js analyze 123

# Detailed analysis with verbose output
node claude-commands.js analyze 123 --verbose

# Using npm script
npm run analyze 123
```

**Output:**
- Issue type classification
- Complexity assessment 
- Risk evaluation
- Required agents identification
- Auto-implementation eligibility

### 2. Test Agent
Test a specific agent with mock data to validate configuration.

```bash
# Test frontend agent
node claude-commands.js test-agent frontend

# Test with custom mock issue
node claude-commands.js test-agent backend --issue "Fix API endpoint error"

# Using npm script
npm run test-agent database
```

**Available Agents:**
- `frontend` - React/Next.js specialist
- `backend` - Express.js/API specialist
- `database` - MongoDB/Schema specialist
- `devops` - Infrastructure/Deployment specialist
- `documentation` - Technical writing specialist

### 3. Simulate Workflow
Simulate the complete automation workflow for an issue.

```bash
# Full workflow simulation
node claude-commands.js simulate 456

# Skip PR workflow simulation
node claude-commands.js simulate 456 --skip-pr

# Using npm script
npm run simulate 456
```

**Simulation Steps:**
1. Issue analysis
2. Auto-implementation check
3. Agent preparation
4. PR workflow validation

### 4. Validate Setup
Validate the automation system configuration.

```bash
# Run all validation checks
node claude-commands.js validate

# Using npm script
npm run validate
```

**Validation Checks:**
- ✅ Project structure
- ✅ Agent documentation
- ✅ GitHub CLI availability
- ✅ Environment variables
- ✅ Dependencies

### 5. List Agents
Display all available automation agents and their specializations.

```bash
# List all agents
node claude-commands.js agents

# Using npm script
npm run list-agents
```

## 🔧 Environment Setup

### Required Environment Variables
```bash
# GitHub authentication (required for issue analysis)
export GITHUB_TOKEN="your_github_token"

# Anthropic API key (for Claude Code integration)
export ANTHROPIC_API_KEY="your_anthropic_api_key"
```

### GitHub CLI Authentication
```bash
# Login to GitHub CLI
gh auth login

# Verify authentication
gh auth status
```

## 📖 Usage Examples

### Example 1: Analyze a Bug Report
```bash
# Analyze issue #42 which is a bug report
node claude-commands.js analyze 42 --verbose
```

**Expected Output:**
```
🔍 Analyzing issue #42...

📊 Issue Analysis Results:
══════════════════════════════════════════════════
Type: bug
Complexity: simple
Risk: low
Required Agents: frontend
Auto-implement: ✅ Yes

📋 Detailed Analysis:
Issue Title: Fix button color in dashboard
Issue Body: The submit button in the dashboard has the wrong color...
Labels: bug, ui, priority-low
```

### Example 2: Test Frontend Agent
```bash
# Test frontend agent with UI-related mock issue
node claude-commands.js test-agent frontend --issue "Add dark mode toggle"
```

**Expected Output:**
```
🧪 Testing frontend agent...

📝 Generated Agent Prompt:
══════════════════════════════════════════════════
I am working on the BlogTube project and need you to act as a specialized frontend agent...

✅ frontend agent test completed successfully
```

### Example 3: Simulate Complex Feature
```bash
# Simulate workflow for a feature request
node claude-commands.js simulate 789
```

**Expected Output:**
```
🎭 Simulating automation workflow for issue #789...

🔍 Step 1: Issue Analysis
- Type: feature
- Complexity: moderate
- Risk: medium
- Required Agents: frontend, backend

🤖 Step 2: Auto-implementation Check
❌ Issue requires human review

Workflow stopped: Manual review required due to complexity/risk.
```

### Example 4: Full System Validation
```bash
# Validate entire automation setup
node claude-commands.js validate
```

**Expected Output:**
```
🔧 Validating automation setup...

🔍 Checking Project structure...
✅ Project structure: All required directories and files present

🔍 Checking Agent documentation...
✅ Agent documentation: All 5 agent documentation files present

🔍 Checking GitHub CLI...
✅ GitHub CLI: GitHub CLI is installed and accessible

🔍 Checking Environment variables...
✅ Environment variables: All required environment variables are set

🔍 Checking Dependencies...
✅ Dependencies: Package.json found and readable

══════════════════════════════════════════════════
🎉 All validation checks passed! Automation system is ready.
```

## 🚨 Troubleshooting

### Common Issues

#### "gh: command not found"
```bash
# Install GitHub CLI
# macOS
brew install gh

# Linux
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh
```

#### "Failed to fetch issue"
```bash
# Ensure GitHub authentication
gh auth login

# Check issue number exists
gh issue view 123
```

#### "Missing agent documentation"
```bash
# Ensure all agent files exist
ls automation/agents/
# Should show: frontend-agent.md, backend-agent.md, etc.

# Re-run validation
npm run validate
```

#### "GITHUB_TOKEN not set"
```bash
# Set environment variable
export GITHUB_TOKEN=$(gh auth token)

# Or add to your shell profile
echo 'export GITHUB_TOKEN=$(gh auth token)' >> ~/.bashrc
source ~/.bashrc
```

## 🔄 Integration with GitHub Actions

These commands are designed to work alongside the GitHub Actions automation:

### Local Development Workflow
1. **Analyze** issues locally before GitHub Actions trigger
2. **Test agents** with mock data during development
3. **Simulate** workflows to predict automation behavior
4. **Validate** setup before pushing changes

### CI/CD Integration
The same logic used in these commands powers the GitHub Actions workflow:

```yaml
# .github/workflows/claude-automation.yml uses:
- automation/claude-code-integration.js  # Main orchestration
- automation/pr-automation.js           # PR creation
- automation/agents/*.md                # Agent documentation
```

## 📚 Command Reference

| Command | Purpose | Arguments | Options |
|---------|---------|-----------|---------|
| `analyze` | Analyze issue | `<issue-number>` | `--verbose` |
| `test-agent` | Test agent | `<agent-type>` | `--issue <description>` |
| `simulate` | Simulate workflow | `<issue-number>` | `--skip-pr` |
| `validate` | Validate setup | None | None |
| `agents` | List agents | None | None |

## 🎯 Best Practices

### For Development
1. **Always validate** setup before making changes
2. **Test agents** individually before integration
3. **Simulate workflows** for complex issues
4. **Analyze issues** to understand automation behavior

### For Production
1. Use GitHub Actions for automatic processing
2. Monitor logs for agent performance
3. Review PR descriptions for quality
4. Validate changes before merging

### For Debugging
1. Use `--verbose` flags for detailed output
2. Test individual agents in isolation
3. Simulate workflows to identify bottlenecks
4. Validate setup after configuration changes

---

**Need help?** Create an issue with the `automation` label for assistance with the command system.