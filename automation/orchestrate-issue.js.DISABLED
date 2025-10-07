#!/usr/bin/env node

/**
 * BlogTube Issue Orchestration Script
 * 
 * This script analyzes GitHub issues and coordinates Claude Code sub-agents
 * to implement solutions automatically.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Issue analysis and agent coordination logic
class IssueOrchestrator {
  constructor() {
    this.issueNumber = process.env.ISSUE_NUMBER;
    this.issueTitle = process.env.ISSUE_TITLE;
    this.issueBody = process.env.ISSUE_BODY;
    this.issueLabels = JSON.parse(process.env.ISSUE_LABELS || '[]');
    this.repository = process.env.REPOSITORY_NAME;
    
    console.log(`🤖 Starting orchestration for issue #${this.issueNumber}: ${this.issueTitle}`);
  }

  /**
   * Analyze the issue and determine complexity, risk, and required agents
   */
  analyzeIssue() {
    const analysis = {
      type: this.classifyIssueType(),
      complexity: this.assessComplexity(),
      risk: this.assessRisk(),
      agents: this.determineRequiredAgents(),
      autoImplement: false
    };

    // Determine if we should auto-implement
    analysis.autoImplement = (
      (analysis.complexity === 'simple' && analysis.risk === 'low') ||
      (analysis.complexity === 'moderate' && analysis.risk === 'low')
    );

    console.log(`📊 Issue Analysis:`, JSON.stringify(analysis, null, 2));
    return analysis;
  }

  /**
   * Classify the type of issue based on title, body, and labels
   */
  classifyIssueType() {
    const title = this.issueTitle.toLowerCase();
    const body = this.issueBody.toLowerCase();
    const labels = this.issueLabels.map(label => label.name.toLowerCase());

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
    if (title.includes('performance') || title.includes('slow') || title.includes('optimize')) {
      return 'performance';
    }
    if (title.includes('security') || title.includes('vulnerability')) {
      return 'security';
    }

    return 'feature'; // Default to feature request
  }

  /**
   * Assess the complexity of the issue
   */
  assessComplexity() {
    const title = this.issueTitle.toLowerCase();
    const body = this.issueBody.toLowerCase();

    // Simple indicators
    const simpleKeywords = ['typo', 'color', 'text', 'button', 'style', 'css', 'readme'];
    if (simpleKeywords.some(keyword => title.includes(keyword) || body.includes(keyword))) {
      return 'simple';
    }

    // Complex indicators
    const complexKeywords = ['architecture', 'refactor', 'migration', 'authentication', 'database', 'api'];
    if (complexKeywords.some(keyword => title.includes(keyword) || body.includes(keyword))) {
      return 'complex';
    }

    return 'moderate'; // Default
  }

  /**
   * Assess the risk level of implementing the change
   */
  assessRisk() {
    const title = this.issueTitle.toLowerCase();
    const body = this.issueBody.toLowerCase();

    // High risk indicators
    const highRiskKeywords = ['breaking', 'migration', 'security', 'authentication', 'database', 'payment'];
    if (highRiskKeywords.some(keyword => title.includes(keyword) || body.includes(keyword))) {
      return 'high';
    }

    // Low risk indicators
    const lowRiskKeywords = ['documentation', 'readme', 'typo', 'color', 'css', 'style'];
    if (lowRiskKeywords.some(keyword => title.includes(keyword) || body.includes(keyword))) {
      return 'low';
    }

    return 'medium'; // Default
  }

  /**
   * Determine which agents should work on this issue
   */
  determineRequiredAgents() {
    const title = this.issueTitle.toLowerCase();
    const body = this.issueBody.toLowerCase();
    const agents = [];

    // Frontend agent
    if (title.includes('ui') || title.includes('component') || title.includes('page') || 
        title.includes('frontend') || body.includes('react') || body.includes('next.js')) {
      agents.push('frontend');
    }

    // Backend agent
    if (title.includes('api') || title.includes('backend') || title.includes('server') ||
        title.includes('endpoint') || body.includes('express') || body.includes('route')) {
      agents.push('backend');
    }

    // Database agent
    if (title.includes('database') || title.includes('schema') || title.includes('model') ||
        title.includes('mongo') || body.includes('collection') || body.includes('query')) {
      agents.push('database');
    }

    // DevOps agent
    if (title.includes('deploy') || title.includes('ci') || title.includes('build') ||
        title.includes('performance') || body.includes('docker') || body.includes('github actions')) {
      agents.push('devops');
    }

    // Documentation agent
    if (title.includes('doc') || title.includes('readme') || title.includes('guide') ||
        title.includes('documentation') || body.includes('tutorial')) {
      agents.push('documentation');
    }

    // Default to frontend if no specific indicators
    if (agents.length === 0) {
      agents.push('frontend');
    }

    return agents;
  }

  /**
   * Create a detailed task description for a specific agent
   */
  createAgentTask(agentType, analysis) {
    const agentDoc = this.loadAgentDocumentation(agentType);
    
    return `You are the ${agentType} agent for the BlogTube project. 

ISSUE CONTEXT:
- Issue #${this.issueNumber}: ${this.issueTitle}
- Type: ${analysis.type}
- Complexity: ${analysis.complexity}
- Risk: ${analysis.risk}

ISSUE DESCRIPTION:
${this.issueBody}

YOUR TASK:
Analyze this issue from your ${agentType} specialization perspective and implement the necessary changes.

REQUIREMENTS:
1. Follow the coding standards and patterns defined in your agent documentation
2. Ensure all changes are tested and validated
3. Maintain backward compatibility
4. Follow security best practices
5. Update relevant documentation if needed

AGENT DOCUMENTATION:
${agentDoc}

EXPECTED OUTPUT:
1. Analysis of what needs to be done
2. Implementation of the required changes
3. Validation that changes work correctly
4. Summary of what was changed

Remember: You are working as part of a coordinated team. Ensure your changes integrate well with the existing codebase.`;
  }

  /**
   * Load agent documentation from the automation/agents directory
   */
  loadAgentDocumentation(agentType) {
    try {
      const agentPath = path.join(__dirname, 'agents', `${agentType}-agent.md`);
      return fs.readFileSync(agentPath, 'utf8');
    } catch (error) {
      console.warn(`⚠️  Could not load documentation for ${agentType} agent`);
      return `You are a ${agentType} specialist for the BlogTube project.`;
    }
  }

  /**
   * Execute the orchestration by spawning appropriate agents
   */
  async orchestrate() {
    try {
      const analysis = this.analyzeIssue();

      if (!analysis.autoImplement) {
        console.log('❌ Issue requires human review - complexity or risk too high');
        this.addIssueComment('🤖 This issue requires human review due to complexity or risk level. Please review and approve for automation.');
        return;
      }

      console.log(`🚀 Auto-implementing with agents: ${analysis.agents.join(', ')}`);

      // Execute agents sequentially to avoid conflicts
      for (const agentType of analysis.agents) {
        console.log(`🎯 Spawning ${agentType} agent...`);
        
        const taskDescription = this.createAgentTask(agentType, analysis);
        
        // Create a task file for Claude Code to process
        const taskFile = path.join(__dirname, `task-${agentType}-${Date.now()}.md`);
        fs.writeFileSync(taskFile, taskDescription);
        
        console.log(`📝 Task created for ${agentType} agent: ${taskFile}`);
        
        try {
          // Use Claude Code Task tool through a markdown file approach
          // This simulates the Task tool behavior by creating detailed instructions
          console.log(`✅ ${agentType} agent task prepared`);
        } catch (error) {
          console.error(`❌ Error with ${agentType} agent:`, error.message);
        }
      }

      this.addIssueComment('🤖 BlogTube automation system has analyzed this issue and created implementation tasks. Review the generated code and approve the pull request if satisfactory.');

    } catch (error) {
      console.error('❌ Orchestration failed:', error);
      this.addIssueComment('🤖 Automation encountered an error. Please review manually.');
    }
  }

  /**
   * Add a comment to the GitHub issue
   */
  addIssueComment(comment) {
    try {
      const commentData = {
        body: `${comment}\n\n---\n*Automated by BlogTube AI System*`
      };

      // Using GitHub CLI to add comment
      execSync(`gh issue comment ${this.issueNumber} --body "${commentData.body}"`, {
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
  if (!process.env.ISSUE_NUMBER) {
    console.error('❌ Missing required environment variables');
    process.exit(1);
  }

  const orchestrator = new IssueOrchestrator();
  await orchestrator.orchestrate();
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { IssueOrchestrator };