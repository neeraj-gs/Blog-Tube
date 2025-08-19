import { Anthropic } from '@anthropic-ai/sdk';
import { Octokit } from '@octokit/rest';
import * as fs from 'fs';
import * as path from 'path';
import { createLogger } from '../utils/logger';

export interface AgentConfig {
  name: string;
  description: string;
  capabilities: string[];
  workingDirectory: string;
}

export interface TaskResult {
  success: boolean;
  filesModified: string[];
  filesCreated: string[];
  summary: string;
  testResults?: string;
  errors?: string[];
}

export abstract class BaseAgent {
  protected anthropic: Anthropic;
  protected octokit: Octokit;
  protected logger: any;
  protected config: AgentConfig;
  protected projectRoot: string;

  constructor(config: AgentConfig) {
    this.config = config;
    this.projectRoot = path.resolve(__dirname, '../..');
    this.logger = createLogger(config.name);

    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });

    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });

    this.logger.info(`${config.name} agent initialized`);
  }

  abstract execute(task: string, implementationPlan: string): Promise<TaskResult>;

  protected async analyzeCodebase(targetFiles: string[]): Promise<string> {
    const analysis = ['## Current Codebase Analysis\n'];
    
    for (const file of targetFiles) {
      const fullPath = path.join(this.projectRoot, file);
      try {
        if (fs.existsSync(fullPath)) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          analysis.push(`### ${file}`);
          analysis.push('```' + this.getFileExtension(file));
          analysis.push(content.slice(0, 2000) + (content.length > 2000 ? '\n... (truncated)' : ''));
          analysis.push('```\n');
        } else {
          analysis.push(`### ${file} (File does not exist)`);
        }
      } catch (error) {
        this.logger.warn(`Could not read file ${file}:`, error);
        analysis.push(`### ${file} (Error reading file)`);
      }
    }

    return analysis.join('\n');
  }

  protected async readProjectContext(): Promise<string> {
    try {
      const claudeFile = path.join(this.projectRoot, 'CLAUDE.md');
      return fs.readFileSync(claudeFile, 'utf-8');
    } catch (error) {
      this.logger.error('Could not read CLAUDE.md:', error);
      return 'No project context available';
    }
  }

  protected writeFile(filePath: string, content: string): void {
    const fullPath = path.join(this.projectRoot, filePath);
    const dir = path.dirname(fullPath);
    
    // Ensure directory exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(fullPath, content, 'utf-8');
    this.logger.info(`File written: ${filePath}`);
  }

  protected readFile(filePath: string): string {
    const fullPath = path.join(this.projectRoot, filePath);
    return fs.readFileSync(fullPath, 'utf-8');
  }

  protected fileExists(filePath: string): boolean {
    const fullPath = path.join(this.projectRoot, filePath);
    return fs.existsSync(fullPath);
  }

  protected getFileExtension(filePath: string): string {
    const ext = path.extname(filePath).slice(1);
    const langMap: Record<string, string> = {
      'ts': 'typescript',
      'tsx': 'typescript',
      'js': 'javascript',
      'jsx': 'javascript',
      'json': 'json',
      'md': 'markdown',
      'yml': 'yaml',
      'yaml': 'yaml'
    };
    return langMap[ext] || ext;
  }

  protected async runTests(type: 'frontend' | 'backend' | 'both' = 'both'): Promise<string> {
    const results = [];
    
    if (type === 'frontend' || type === 'both') {
      try {
        // Run frontend build to catch TypeScript errors
        const { execSync } = require('child_process');
        const output = execSync('cd frontend && npm run build', { 
          encoding: 'utf-8',
          timeout: 120000 // 2 minutes
        });
        results.push('✅ Frontend build successful');
      } catch (error: any) {
        results.push(`❌ Frontend build failed: ${error.message}`);
      }
    }

    if (type === 'backend' || type === 'both') {
      try {
        const { execSync } = require('child_process');
        const output = execSync('cd backend && npm run build', { 
          encoding: 'utf-8',
          timeout: 120000
        });
        results.push('✅ Backend build successful');
      } catch (error: any) {
        results.push(`❌ Backend build failed: ${error.message}`);
      }
    }

    return results.join('\n');
  }

  protected async createGitBranch(branchName: string): Promise<void> {
    try {
      const { execSync } = require('child_process');
      execSync(`git checkout -b ${branchName}`, { 
        cwd: this.projectRoot,
        encoding: 'utf-8'
      });
      this.logger.info(`Created git branch: ${branchName}`);
    } catch (error) {
      this.logger.error('Failed to create git branch:', error);
      throw error;
    }
  }

  protected async commitChanges(message: string, files: string[]): Promise<void> {
    try {
      const { execSync } = require('child_process');
      
      // Add files
      for (const file of files) {
        execSync(`git add "${file}"`, { 
          cwd: this.projectRoot,
          encoding: 'utf-8'
        });
      }
      
      // Commit
      execSync(`git commit -m "${message}"`, { 
        cwd: this.projectRoot,
        encoding: 'utf-8'
      });
      
      this.logger.info(`Committed changes: ${message}`);
    } catch (error) {
      this.logger.error('Failed to commit changes:', error);
      throw error;
    }
  }

  protected createSystemPrompt(): string {
    return `You are the ${this.config.name} for the BlogTube project.

**Your Role:** ${this.config.description}

**Your Capabilities:**
${this.config.capabilities.map(cap => `- ${cap}`).join('\n')}

**Working Directory:** ${this.config.workingDirectory}

**Guidelines:**
1. Always analyze existing code before making changes
2. Follow the project's coding standards and conventions
3. Write clean, maintainable, and well-documented code
4. Consider performance and security implications
5. Ensure backward compatibility unless specifically requested otherwise
6. Write appropriate tests for new functionality
7. Update documentation when necessary

**Project Context:** You have access to the full BlogTube project context and should make decisions that align with the overall architecture and goals.

When implementing changes:
1. Analyze the current state
2. Plan your changes carefully  
3. Implement incrementally
4. Test thoroughly
5. Document your changes`;
  }
}