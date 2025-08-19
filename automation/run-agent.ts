#!/usr/bin/env tsx

import { FrontendAgent } from './agents/frontend-agent';
import { BackendAgent } from './agents/backend-agent';
import { DatabaseAgent } from './agents/database-agent';
import { BaseAgent, TaskResult } from './agents/base-agent';
import { createLogger } from './utils/logger';
import { Octokit } from '@octokit/rest';

const logger = createLogger('agent-runner');

interface AgentRunner {
  agentType: string;
  task: string;
  implementationPlan: string;
  issueNumber: number;
  repository: string;
}

class AgentRunner {
  private octokit: Octokit;

  constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });
  }

  async run(): Promise<void> {
    const agentType = process.env.AGENT_TYPE!;
    const issueNumber = parseInt(process.env.ISSUE_NUMBER!);
    const implementationPlan = Buffer.from(process.env.IMPLEMENTATION_PLAN!, 'base64').toString('utf-8');
    const [owner, repo] = process.env.REPOSITORY_NAME!.split('/');

    logger.info(`Running ${agentType} agent for issue #${issueNumber}`);

    try {
      // Get the issue details
      const { data: issue } = await this.octokit.issues.get({
        owner,
        repo,
        issue_number: issueNumber
      });

      const task = `${issue.title}\n\n${issue.body}`;

      // Create the appropriate agent
      const agent = this.createAgent(agentType);
      if (!agent) {
        throw new Error(`Unknown agent type: ${agentType}`);
      }

      // Create a new git branch for this work
      const branchName = `ai-fix-${issueNumber}-${Date.now()}`;
      await this.createBranch(branchName);

      // Execute the task
      const result = await agent.execute(task, implementationPlan);

      // Update issue with progress
      await this.updateIssueWithProgress(owner, repo, issueNumber, agentType, result);

      // Commit changes if successful
      if (result.success) {
        const allChangedFiles = [...result.filesModified, ...result.filesCreated];
        if (allChangedFiles.length > 0) {
          await this.commitChanges(
            branchName,
            `${agentType}: ${result.summary} (fixes #${issueNumber})`,
            allChangedFiles
          );

          // Set output for PR creation
          this.setGitHubOutput('branch-name', branchName);
          this.setGitHubOutput('commit-message', result.summary);
          this.setGitHubOutput('files-changed', allChangedFiles.join(','));
        }
      }

      logger.info(`${agentType} agent completed for issue #${issueNumber}`);

    } catch (error) {
      logger.error(`${agentType} agent failed:`, error);
      
      // Update issue with error
      await this.updateIssueWithError(
        process.env.REPOSITORY_NAME!.split('/')[0],
        process.env.REPOSITORY_NAME!.split('/')[1],
        issueNumber,
        agentType,
        error as Error
      );
      
      throw error;
    }
  }

  private createAgent(agentType: string): BaseAgent | null {
    switch (agentType) {
      case 'frontend':
        return new FrontendAgent();
      case 'backend':
        return new BackendAgent();
      case 'database':
        return new DatabaseAgent();
      default:
        return null;
    }
  }

  private async createBranch(branchName: string): Promise<void> {
    try {
      const { execSync } = require('child_process');
      
      // Create and checkout new branch
      execSync(`git checkout -b ${branchName}`, {
        encoding: 'utf-8',
        cwd: process.cwd()
      });
      
      logger.info(`Created branch: ${branchName}`);
    } catch (error) {
      logger.error('Failed to create branch:', error);
      throw error;
    }
  }

  private async commitChanges(branchName: string, message: string, files: string[]): Promise<void> {
    try {
      const { execSync } = require('child_process');
      
      // Add all changed files
      for (const file of files) {
        execSync(`git add "${file}"`, {
          encoding: 'utf-8',
          cwd: process.cwd()
        });
      }
      
      // Commit changes
      execSync(`git commit -m "${message}"`, {
        encoding: 'utf-8',
        cwd: process.cwd()
      });
      
      // Push branch
      execSync(`git push origin ${branchName}`, {
        encoding: 'utf-8',
        cwd: process.cwd()
      });
      
      logger.info(`Committed and pushed changes to ${branchName}`);
    } catch (error) {
      logger.error('Failed to commit changes:', error);
      throw error;
    }
  }

  private async updateIssueWithProgress(
    owner: string,
    repo: string,
    issueNumber: number,
    agentType: string,
    result: TaskResult
  ): Promise<void> {
    const statusEmoji = result.success ? '✅' : '❌';
    const comment = `${statusEmoji} **${agentType.toUpperCase()} Agent Report**

**Status:** ${result.success ? 'Completed Successfully' : 'Failed'}

**Summary:** ${result.summary}

**Files Modified:** ${result.filesModified.length}
${result.filesModified.map(file => `- \`${file}\``).join('\n')}

**Files Created:** ${result.filesCreated.length}
${result.filesCreated.map(file => `- \`${file}\``).join('\n')}

${result.testResults ? `**Test Results:**\n\`\`\`\n${result.testResults}\n\`\`\`` : ''}

${result.errors && result.errors.length > 0 ? `**Errors:**\n${result.errors.map(err => `- ${err}`).join('\n')}` : ''}

---
*Automated by ${agentType} agent*`;

    await this.octokit.issues.createComment({
      owner,
      repo,
      issue_number: issueNumber,
      body: comment
    });

    // Add status label
    const statusLabel = result.success ? 'ai-completed' : 'ai-failed';
    await this.octokit.issues.addLabels({
      owner,
      repo,
      issue_number: issueNumber,
      labels: [statusLabel]
    });
  }

  private async updateIssueWithError(
    owner: string,
    repo: string,
    issueNumber: number,
    agentType: string,
    error: Error
  ): Promise<void> {
    const comment = `❌ **${agentType.toUpperCase()} Agent Failed**

**Error:** ${error.message}

The ${agentType} agent encountered an error while processing this issue. Please review the error and consider manual intervention.

**Stack Trace:**
\`\`\`
${error.stack || 'No stack trace available'}
\`\`\`

---
*Automated error report from ${agentType} agent*`;

    await this.octokit.issues.createComment({
      owner,
      repo,
      issue_number: issueNumber,
      body: comment
    });

    await this.octokit.issues.addLabels({
      owner,
      repo,
      issue_number: issueNumber,
      labels: ['ai-failed', 'needs-review']
    });
  }

  private setGitHubOutput(name: string, value: string): void {
    const githubOutput = process.env.GITHUB_OUTPUT;
    if (githubOutput) {
      const fs = require('fs');
      fs.appendFileSync(githubOutput, `${name}=${value}\n`);
    }
  }
}

// Main execution
async function main() {
  const runner = new AgentRunner();
  await runner.run();
}

if (require.main === module) {
  main().catch(error => {
    console.error('Agent runner failed:', error);
    process.exit(1);
  });
}