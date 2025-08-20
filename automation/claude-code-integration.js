#!/usr/bin/env node

/**
 * Claude Code Integration Script
 * 
 * This script integrates with Claude Code to spawn specialized agents
 * for automated issue resolution.
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { AutomationMonitor } = require('./monitoring');
const { AgentCoordinator } = require('./coordination');

class ClaudeCodeIntegration {
  constructor() {
    this.issueNumber = process.env.ISSUE_NUMBER;
    this.issueTitle = process.env.ISSUE_TITLE;
    this.issueBody = process.env.ISSUE_BODY;
    this.issueLabels = JSON.parse(process.env.ISSUE_LABELS || '[]');
    this.repository = process.env.REPOSITORY_NAME;
    
    // Initialize monitoring and coordination
    this.monitor = new AutomationMonitor();
    this.coordinator = new AgentCoordinator();
    
    console.log(`🤖 Claude Code Integration for issue #${this.issueNumber}: ${this.issueTitle}`);
  }

  /**
   * Create a comprehensive task prompt for Claude Code
   */
  createClaudeCodePrompt(agentType, analysis) {
    const agentDoc = this.loadAgentDocumentation(agentType);
    
    return `I am working on the BlogTube project and need you to act as a specialized ${agentType} agent.

ISSUE CONTEXT:
- GitHub Issue #${this.issueNumber}: ${this.issueTitle}
- Issue Type: ${analysis.type}
- Complexity: ${analysis.complexity}
- Risk Level: ${analysis.risk}
- Repository: ${this.repository}

ISSUE DESCRIPTION:
${this.issueBody}

YOUR ROLE AS ${agentType.toUpperCase()} AGENT:
${agentDoc}

TASK REQUIREMENTS:
1. Analyze the issue from your ${agentType} specialization perspective
2. Use the TodoWrite tool to plan your implementation steps
3. Implement the necessary changes following the project's coding standards
4. Test your implementation thoroughly
5. Ensure all changes integrate properly with the existing codebase
6. Update relevant documentation if needed

IMPORTANT GUIDELINES:
- Follow the exact coding patterns and conventions defined in your agent documentation
- Use the appropriate tools (Read, Edit, MultiEdit, Bash, etc.) to implement changes
- Always validate your changes work correctly
- Maintain backward compatibility
- Follow security best practices
- Only make changes that directly address the issue

EXPECTED WORKFLOW:
1. Use TodoWrite to create a task plan
2. Read relevant files to understand current implementation
3. Implement the required changes
4. Test the implementation
5. Mark todos as completed as you finish each step

Please proceed with implementing the solution for this issue.`;
  }

  /**
   * Load agent documentation
   */
  loadAgentDocumentation(agentType) {
    try {
      const agentPath = path.join(__dirname, 'agents', `${agentType}-agent.md`);
      return fs.readFileSync(agentPath, 'utf8');
    } catch (error) {
      console.warn(`⚠️  Could not load documentation for ${agentType} agent`);
      return `You are a ${agentType} specialist for the BlogTube project. Follow best practices for ${agentType} development.`;
    }
  }

  /**
   * Execute Claude Code with a specific agent prompt
   */
  async executeClaudeAgent(agentType, analysis) {
    console.log(`🎯 Executing ${agentType} agent via Claude Code...`);
    
    const prompt = this.createClaudeCodePrompt(agentType, analysis);
    const promptFile = path.join(__dirname, `prompt-${agentType}-${Date.now()}.txt`);
    
    try {
      // Write prompt to file
      fs.writeFileSync(promptFile, prompt);
      
      // Execute Claude Code in interactive mode with the prompt
      const claudeCommand = `claude code --prompt="${prompt}"`;
      
      console.log(`📝 Executing: ${claudeCommand}`);
      
      // Use spawn for better control and output handling
      const claudeProcess = spawn('claude', ['code'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: {
          ...process.env,
          ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY
        }
      });

      // Send the prompt to Claude Code
      claudeProcess.stdin.write(prompt);
      claudeProcess.stdin.end();

      let output = '';
      let errorOutput = '';

      claudeProcess.stdout.on('data', (data) => {
        const chunk = data.toString();
        output += chunk;
        console.log(chunk);
      });

      claudeProcess.stderr.on('data', (data) => {
        const chunk = data.toString();
        errorOutput += chunk;
        console.error(chunk);
      });

      return new Promise((resolve, reject) => {
        claudeProcess.on('close', (code) => {
          // Clean up prompt file
          try {
            fs.unlinkSync(promptFile);
          } catch (e) {
            // Ignore cleanup errors
          }

          if (code === 0) {
            console.log(`✅ ${agentType} agent completed successfully`);
            resolve({ success: true, output, agentType });
          } else {
            console.error(`❌ ${agentType} agent failed with code ${code}`);
            reject(new Error(`Agent failed: ${errorOutput}`));
          }
        });

        claudeProcess.on('error', (error) => {
          console.error(`❌ Error executing ${agentType} agent:`, error);
          reject(error);
        });
      });

    } catch (error) {
      console.error(`❌ Failed to execute ${agentType} agent:`, error);
      throw error;
    }
  }

  /**
   * Analyze issue and determine required agents and implementation strategy
   */
  analyzeIssue() {
    const title = this.issueTitle.toLowerCase();
    const body = this.issueBody.toLowerCase();
    const labels = this.issueLabels.map(label => label.name.toLowerCase());

    const analysis = {
      type: this.classifyIssueType(title, body, labels),
      complexity: this.assessComplexity(title, body),
      risk: this.assessRisk(title, body),
      agents: this.determineRequiredAgents(title, body),
      autoImplement: false
    };

    // Determine if we should auto-implement
    analysis.autoImplement = (
      (analysis.complexity === 'simple' && analysis.risk === 'low') ||
      (analysis.complexity === 'moderate' && analysis.risk === 'low')
    );

    return analysis;
  }

  classifyIssueType(title, body, labels) {
    if (labels.includes('bug') || title.includes('fix') || title.includes('error')) {
      return 'bug';
    }
    if (labels.includes('enhancement') || title.includes('improve') || title.includes('optimize')) {
      return 'enhancement';
    }
    if (labels.includes('feature') || title.includes('add') || title.includes('implement')) {
      return 'feature';
    }
    if (labels.includes('documentation') || title.includes('doc') || title.includes('readme')) {
      return 'documentation';
    }
    return 'feature';
  }

  assessComplexity(title, body) {
    const simpleKeywords = ['typo', 'color', 'text', 'button', 'style', 'css', 'readme'];
    if (simpleKeywords.some(keyword => title.includes(keyword) || body.includes(keyword))) {
      return 'simple';
    }

    const complexKeywords = ['architecture', 'refactor', 'migration', 'authentication', 'database'];
    if (complexKeywords.some(keyword => title.includes(keyword) || body.includes(keyword))) {
      return 'complex';
    }

    return 'moderate';
  }

  assessRisk(title, body) {
    const highRiskKeywords = ['breaking', 'migration', 'security', 'authentication', 'database'];
    if (highRiskKeywords.some(keyword => title.includes(keyword) || body.includes(keyword))) {
      return 'high';
    }

    const lowRiskKeywords = ['documentation', 'readme', 'typo', 'color', 'css', 'style'];
    if (lowRiskKeywords.some(keyword => title.includes(keyword) || body.includes(keyword))) {
      return 'low';
    }

    return 'medium';
  }

  determineRequiredAgents(title, body) {
    const agents = [];

    if (title.includes('ui') || title.includes('component') || title.includes('frontend')) {
      agents.push('frontend');
    }
    if (title.includes('api') || title.includes('backend') || title.includes('server')) {
      agents.push('backend');
    }
    if (title.includes('database') || title.includes('schema') || title.includes('model')) {
      agents.push('database');
    }
    if (title.includes('deploy') || title.includes('ci') || title.includes('performance')) {
      agents.push('devops');
    }
    if (title.includes('doc') || title.includes('readme') || title.includes('guide')) {
      agents.push('documentation');
    }

    return agents.length > 0 ? agents : ['frontend'];
  }

  /**
   * Execute the full orchestration process
   */
  async orchestrate() {
    let issueContext = null;
    
    try {
      console.log('🔍 Analyzing issue...');
      const analysis = this.analyzeIssue();
      
      console.log(`📊 Analysis:`, JSON.stringify(analysis, null, 2));

      // Record issue processing start
      issueContext = this.monitor.recordIssueStart(this.issueNumber, {
        title: this.issueTitle,
        type: analysis.type,
        complexity: analysis.complexity,
        risk: analysis.risk,
        agents: analysis.agents
      });

      if (!analysis.autoImplement) {
        console.log('❌ Issue requires human review');
        await this.addIssueComment('🤖 This issue requires human review due to complexity or risk level.');
        
        // Record completion as manual review required
        this.monitor.recordIssueCompletion(issueContext, true, false, false);
        return;
      }

      console.log(`🚀 Auto-implementing with agents: ${analysis.agents.join(', ')}`);

      // Register issue with coordinator
      const issueId = this.coordinator.registerIssue(this.issueNumber, analysis, analysis.agents);

      const results = [];
      
      // Execute agents using coordination system
      let nextAgent = this.coordinator.getNextAgent();
      
      while (nextAgent) {
        try {
          console.log(`🎯 Executing ${nextAgent.agentType} agent...`);
          
          // Acquire resource locks
          this.coordinator.acquireResourceLocks(nextAgent.agentType, this.issueNumber);
          
          const startTime = Date.now();
          const result = await this.executeClaudeAgent(nextAgent.agentType, analysis);
          const duration = Date.now() - startTime;
          
          // Record agent execution
          this.monitor.recordAgentExecution(nextAgent.agentType, result.success, duration);
          
          // Record completion with coordinator
          const coordination = this.coordinator.recordAgentCompletion(
            issueId, 
            nextAgent.agentType, 
            result.success, 
            result
          );
          
          results.push(result);
          
          // Get next agent if any
          nextAgent = coordination.nextAgent;
          
        } catch (error) {
          console.error(`❌ ${nextAgent.agentType} agent failed:`, error.message);
          
          const duration = Date.now() - (nextAgent.startTime ? new Date(nextAgent.startTime).getTime() : Date.now());
          this.monitor.recordAgentExecution(nextAgent.agentType, false, duration, error);
          
          // Handle failure with coordinator
          const shouldRetry = this.coordinator.handleAgentFailure(issueId, nextAgent.agentType, error);
          
          if (!shouldRetry) {
            results.push({ success: false, error: error.message, agentType: nextAgent.agentType });
          }
          
          // Get next agent
          nextAgent = this.coordinator.getNextAgent();
        }
      }

      // Create summary
      const successfulAgents = results.filter(r => r.success).map(r => r.agentType);
      const failedAgents = results.filter(r => !r.success).map(r => r.agentType);

      let comment = '🤖 BlogTube automation completed:\n\n';
      
      if (successfulAgents.length > 0) {
        comment += `✅ **Successful agents:** ${successfulAgents.join(', ')}\n`;
      }
      
      if (failedAgents.length > 0) {
        comment += `❌ **Failed agents:** ${failedAgents.join(', ')}\n`;
      }

      // If any agents succeeded, attempt to create a PR
      let prCreated = false;
      if (successfulAgents.length > 0) {
        console.log('🔀 Creating pull request...');
        const prResult = await this.createPullRequest();
        
        // Record PR creation
        this.monitor.recordPRCreation(
          this.issueNumber, 
          prResult?.prUrl, 
          prResult?.filesChanged, 
          prResult?.success || false
        );
        
        prCreated = prResult?.success || false;
        
        if (prResult && prResult.success) {
          comment += `\n🔀 **Pull request created:** ${prResult.prUrl}\n`;
          comment += `📁 **Files changed:** ${prResult.filesChanged}\n`;
          comment += '\nPlease review the pull request and merge if everything looks good.';
        } else {
          comment += '\n⚠️ **PR creation failed.** Please create a pull request manually.';
        }
      } else {
        comment += '\nNo successful changes were made. Please review manually.';
      }

      // Record issue completion
      if (issueContext) {
        this.monitor.recordIssueCompletion(
          issueContext, 
          successfulAgents.length > 0, 
          true, 
          prCreated
        );
      }

      await this.addIssueComment(comment);

    } catch (error) {
      console.error('❌ Orchestration failed:', error);
      
      // Record failure
      if (issueContext) {
        this.monitor.recordIssueCompletion(issueContext, false, false, false);
      }
      
      await this.addIssueComment('🤖 Automation encountered an error. Please review manually.');
    }
  }

  /**
   * Create a pull request using the PR automation module
   */
  async createPullRequest() {
    try {
      const { PRAutomation } = require('./pr-automation');
      const prAutomation = new PRAutomation();
      return await prAutomation.createAutomatedPR();
    } catch (error) {
      console.error('❌ Error creating pull request:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Add a comment to the GitHub issue
   */
  async addIssueComment(comment) {
    try {
      const fullComment = `${comment}\n\n---\n*Automated by BlogTube AI System*`;
      
      execSync(`gh issue comment ${this.issueNumber} --body "${fullComment}"`, {
        stdio: 'inherit',
        env: { ...process.env, GITHUB_TOKEN: process.env.GITHUB_TOKEN }
      });

      console.log('💬 Added comment to issue');
    } catch (error) {
      console.warn('⚠️  Could not add comment to issue:', error.message);
    }
  }
}

// Main execution
async function main() {
  if (!process.env.ISSUE_NUMBER || !process.env.ANTHROPIC_API_KEY) {
    console.error('❌ Missing required environment variables');
    process.exit(1);
  }

  const integration = new ClaudeCodeIntegration();
  await integration.orchestrate();
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { ClaudeCodeIntegration };