#!/usr/bin/env node

/**
 * Claude Code Custom Commands for BlogTube Automation
 * 
 * Provides CLI commands for local development and testing of the automation system.
 */

const { program } = require('commander');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Import automation modules
const { IssueOrchestrator } = require('./orchestrate-issue');
const { ClaudeCodeIntegration } = require('./claude-code-integration');
const { PRAutomation } = require('./pr-automation');

class ClaudeCommands {
  constructor() {
    this.projectRoot = process.cwd();
    this.automationDir = path.join(this.projectRoot, 'automation');
  }

  /**
   * Analyze a GitHub issue (local simulation)
   */
  async analyzeIssue(issueNumber, options) {
    console.log(`🔍 Analyzing issue #${issueNumber}...`);

    try {
      // Fetch issue data using GitHub CLI
      const issueData = this.fetchIssueData(issueNumber);
      
      // Set up environment for analysis
      process.env.ISSUE_NUMBER = issueNumber;
      process.env.ISSUE_TITLE = issueData.title;
      process.env.ISSUE_BODY = issueData.body;
      process.env.ISSUE_LABELS = JSON.stringify(issueData.labels);

      // Run analysis
      const orchestrator = new IssueOrchestrator();
      const analysis = orchestrator.analyzeIssue();

      console.log('\n📊 Issue Analysis Results:');
      console.log('═'.repeat(50));
      console.log(`Type: ${analysis.type}`);
      console.log(`Complexity: ${analysis.complexity}`);
      console.log(`Risk: ${analysis.risk}`);
      console.log(`Required Agents: ${analysis.agents.join(', ')}`);
      console.log(`Auto-implement: ${analysis.autoImplement ? '✅ Yes' : '❌ No'}`);

      if (options.verbose) {
        console.log('\n📋 Detailed Analysis:');
        console.log(`Issue Title: ${issueData.title}`);
        console.log(`Issue Body: ${issueData.body.substring(0, 200)}...`);
        console.log(`Labels: ${issueData.labels.map(l => l.name).join(', ')}`);
      }

      return analysis;

    } catch (error) {
      console.error('❌ Error analyzing issue:', error.message);
      process.exit(1);
    }
  }

  /**
   * Test agent spawning with a mock issue
   */
  async testAgent(agentType, mockIssue) {
    console.log(`🧪 Testing ${agentType} agent...`);

    try {
      // Validate agent exists
      const agentPath = path.join(this.automationDir, 'agents', `${agentType}-agent.md`);
      if (!fs.existsSync(agentPath)) {
        throw new Error(`Agent documentation not found: ${agentPath}`);
      }

      // Set up mock environment
      process.env.ISSUE_NUMBER = '999';
      process.env.ISSUE_TITLE = mockIssue || `Test ${agentType} functionality`;
      process.env.ISSUE_BODY = 'This is a test issue for agent validation';
      process.env.ISSUE_LABELS = JSON.stringify([{ name: 'test' }]);

      // Create test integration
      const integration = new ClaudeCodeIntegration();
      const analysis = {
        type: 'test',
        complexity: 'simple',
        risk: 'low',
        agents: [agentType]
      };

      // Create agent prompt
      const prompt = integration.createClaudeCodePrompt(agentType, analysis);

      console.log('\n📝 Generated Agent Prompt:');
      console.log('═'.repeat(50));
      console.log(prompt.substring(0, 500) + '...');

      console.log(`\n✅ ${agentType} agent test completed successfully`);

    } catch (error) {
      console.error(`❌ Error testing ${agentType} agent:`, error.message);
      process.exit(1);
    }
  }

  /**
   * Simulate the full automation workflow
   */
  async simulateWorkflow(issueNumber, options) {
    console.log(`🎭 Simulating automation workflow for issue #${issueNumber}...`);

    try {
      const issueData = this.fetchIssueData(issueNumber);
      
      // Set up environment
      process.env.ISSUE_NUMBER = issueNumber;
      process.env.ISSUE_TITLE = issueData.title;
      process.env.ISSUE_BODY = issueData.body;
      process.env.ISSUE_LABELS = JSON.stringify(issueData.labels);

      // Step 1: Analyze issue
      console.log('\n🔍 Step 1: Issue Analysis');
      const orchestrator = new IssueOrchestrator();
      const analysis = orchestrator.analyzeIssue();
      
      console.log(`- Type: ${analysis.type}`);
      console.log(`- Complexity: ${analysis.complexity}`);
      console.log(`- Risk: ${analysis.risk}`);
      console.log(`- Required Agents: ${analysis.agents.join(', ')}`);

      // Step 2: Check auto-implementation eligibility
      console.log('\n🤖 Step 2: Auto-implementation Check');
      if (analysis.autoImplement) {
        console.log('✅ Issue eligible for auto-implementation');
      } else {
        console.log('❌ Issue requires human review');
        return;
      }

      // Step 3: Agent preparation
      console.log('\n👥 Step 3: Agent Preparation');
      const integration = new ClaudeCodeIntegration();
      
      for (const agentType of analysis.agents) {
        console.log(`- Preparing ${agentType} agent...`);
        const prompt = integration.createClaudeCodePrompt(agentType, analysis);
        console.log(`  ✓ Prompt generated (${prompt.length} characters)`);
      }

      // Step 4: PR workflow simulation
      if (!options.skipPr) {
        console.log('\n🔀 Step 4: PR Workflow Check');
        const prAutomation = new PRAutomation();
        console.log(`- Branch name: ${prAutomation.branchName}`);
        console.log(`- Base branch: ${prAutomation.baseBranch}`);
        console.log('✓ PR automation configured');
      }

      console.log('\n🎉 Workflow simulation completed successfully!');

    } catch (error) {
      console.error('❌ Workflow simulation failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Validate automation setup
   */
  async validateSetup() {
    console.log('🔧 Validating automation setup...');

    const checks = [
      { name: 'Project structure', check: () => this.validateProjectStructure() },
      { name: 'Agent documentation', check: () => this.validateAgentDocs() },
      { name: 'GitHub CLI', check: () => this.validateGitHubCLI() },
      { name: 'Environment variables', check: () => this.validateEnvironment() },
      { name: 'Dependencies', check: () => this.validateDependencies() }
    ];

    let allPassed = true;

    for (const { name, check } of checks) {
      try {
        console.log(`\n🔍 Checking ${name}...`);
        const result = check();
        if (result.success) {
          console.log(`✅ ${name}: ${result.message}`);
        } else {
          console.log(`❌ ${name}: ${result.message}`);
          allPassed = false;
        }
      } catch (error) {
        console.log(`❌ ${name}: ${error.message}`);
        allPassed = false;
      }
    }

    console.log('\n' + '═'.repeat(50));
    if (allPassed) {
      console.log('🎉 All validation checks passed! Automation system is ready.');
    } else {
      console.log('⚠️  Some validation checks failed. Please address the issues above.');
    }

    return allPassed;
  }

  /**
   * Fetch issue data from GitHub
   */
  fetchIssueData(issueNumber) {
    try {
      const output = execSync(`gh issue view ${issueNumber} --json title,body,labels`, {
        encoding: 'utf8'
      });
      return JSON.parse(output);
    } catch (error) {
      throw new Error(`Failed to fetch issue #${issueNumber}: ${error.message}`);
    }
  }

  /**
   * Validation helper methods
   */
  validateProjectStructure() {
    // Check if running from project root or automation directory
    const isInAutomationDir = path.basename(this.projectRoot) === 'automation';
    const basePath = isInAutomationDir ? path.dirname(this.projectRoot) : this.projectRoot;
    
    const requiredPaths = [
      'automation',
      'automation/agents',
      'automation/claude-orchestrator.md',
      '.github/workflows/claude-automation.yml'
    ];

    const missingPaths = [];
    for (const reqPath of requiredPaths) {
      if (!fs.existsSync(path.join(basePath, reqPath))) {
        missingPaths.push(reqPath);
      }
    }

    if (missingPaths.length > 0) {
      return { success: false, message: `Missing: ${missingPaths.join(', ')}` };
    }

    return { success: true, message: 'All required directories and files present' };
  }

  validateAgentDocs() {
    const agentTypes = ['frontend', 'backend', 'database', 'devops', 'documentation'];
    const isInAutomationDir = path.basename(this.projectRoot) === 'automation';
    const agentsDir = isInAutomationDir ? 
      path.join(this.projectRoot, 'agents') : 
      path.join(this.projectRoot, 'automation', 'agents');
    
    const missingAgents = [];
    for (const agentType of agentTypes) {
      const agentFile = path.join(agentsDir, `${agentType}-agent.md`);
      if (!fs.existsSync(agentFile)) {
        missingAgents.push(`${agentType}-agent.md`);
      }
    }

    if (missingAgents.length > 0) {
      return { success: false, message: `Missing agents: ${missingAgents.join(', ')}` };
    }

    return { success: true, message: `All ${agentTypes.length} agent documentation files present` };
  }

  validateGitHubCLI() {
    try {
      execSync('gh --version', { stdio: 'ignore' });
      return { success: true, message: 'GitHub CLI is installed and accessible' };
    } catch (error) {
      return { success: false, message: 'GitHub CLI not found or not accessible' };
    }
  }

  validateEnvironment() {
    const requiredEnvVars = ['GITHUB_TOKEN'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      return { success: false, message: `Missing environment variables: ${missingVars.join(', ')}` };
    }

    return { success: true, message: 'All required environment variables are set' };
  }

  validateDependencies() {
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      return { success: true, message: 'Package.json found and readable' };
    } catch (error) {
      return { success: false, message: 'Package.json not found or invalid' };
    }
  }

  /**
   * List available agents
   */
  listAgents() {
    console.log('🤖 Available Agents:');
    console.log('═'.repeat(30));

    // Check if running from project root or automation directory
    const isInAutomationDir = path.basename(this.projectRoot) === 'automation';
    const agentsDir = isInAutomationDir ? 
      path.join(this.projectRoot, 'agents') : 
      path.join(this.projectRoot, 'automation', 'agents');
    
    if (!fs.existsSync(agentsDir)) {
      console.log('❌ Agents directory not found at:', agentsDir);
      console.log('Current directory:', this.projectRoot);
      console.log('Looking for agents in:', agentsDir);
      return;
    }

    const agentFiles = fs.readdirSync(agentsDir)
      .filter(file => file.endsWith('-agent.md'))
      .map(file => file.replace('-agent.md', ''));

    if (agentFiles.length === 0) {
      console.log('❌ No agent documentation found');
      return;
    }

    for (const agentType of agentFiles) {
      const agentPath = path.join(agentsDir, `${agentType}-agent.md`);
      const content = fs.readFileSync(agentPath, 'utf8');
      
      // Extract specialization from the agent doc
      const specializationMatch = content.match(/\*\*Primary Technologies\*\*: (.+)/);
      const specialization = specializationMatch ? specializationMatch[1] : 'Not specified';
      
      console.log(`• ${agentType.charAt(0).toUpperCase() + agentType.slice(1)} Agent`);
      console.log(`  Technologies: ${specialization}`);
    }
  }
}

// CLI Setup
program
  .name('claude-automation')
  .description('Claude Code automation commands for BlogTube')
  .version('1.0.0');

// Analyze issue command
program
  .command('analyze <issue-number>')
  .description('Analyze a GitHub issue for automation potential')
  .option('-v, --verbose', 'Show detailed analysis')
  .action(async (issueNumber, options) => {
    const commands = new ClaudeCommands();
    await commands.analyzeIssue(issueNumber, options);
  });

// Test agent command
program
  .command('test-agent <agent-type>')
  .description('Test a specific agent with mock data')
  .option('-i, --issue <issue>', 'Mock issue description')
  .action(async (agentType, options) => {
    const commands = new ClaudeCommands();
    await commands.testAgent(agentType, options.issue);
  });

// Simulate workflow command
program
  .command('simulate <issue-number>')
  .description('Simulate the full automation workflow')
  .option('--skip-pr', 'Skip PR workflow simulation')
  .action(async (issueNumber, options) => {
    const commands = new ClaudeCommands();
    await commands.simulateWorkflow(issueNumber, options);
  });

// Validate setup command
program
  .command('validate')
  .description('Validate automation system setup')
  .action(async () => {
    const commands = new ClaudeCommands();
    await commands.validateSetup();
  });

// List agents command
program
  .command('agents')
  .description('List all available automation agents')
  .action(() => {
    const commands = new ClaudeCommands();
    commands.listAgents();
  });

// Parse command line arguments
program.parse();

module.exports = { ClaudeCommands };