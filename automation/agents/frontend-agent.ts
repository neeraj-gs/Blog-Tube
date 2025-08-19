import { BaseAgent, AgentConfig, TaskResult } from './base-agent';
import * as path from 'path';

export class FrontendAgent extends BaseAgent {
  constructor() {
    super({
      name: 'frontend-agent',
      description: 'Specialized agent for frontend development using Next.js, React, TypeScript, and ShadCN UI',
      capabilities: [
        'Create and modify React components',
        'Implement Next.js pages and layouts',
        'Style components with Tailwind CSS',
        'Integrate ShadCN UI components',
        'Handle client-side routing and navigation',
        'Implement responsive design',
        'Manage frontend state and API calls',
        'Add accessibility features',
        'Optimize frontend performance'
      ],
      workingDirectory: 'frontend/'
    });
  }

  async execute(task: string, implementationPlan: string): Promise<TaskResult> {
    this.logger.info(`Executing frontend task: ${task.substring(0, 100)}...`);

    try {
      // Read project context and relevant files
      const projectContext = await this.readProjectContext();
      const targetFiles = this.identifyTargetFiles(task, implementationPlan);
      const codebaseAnalysis = await this.analyzeCodebase(targetFiles);

      // Generate implementation using Claude
      const implementation = await this.generateImplementation(
        task,
        implementationPlan,
        projectContext,
        codebaseAnalysis
      );

      // Apply changes
      const result = await this.applyChanges(implementation);

      // Run tests
      const testResults = await this.runTests('frontend');
      result.testResults = testResults;

      this.logger.info('Frontend task completed successfully');
      return result;

    } catch (error) {
      this.logger.error('Frontend task failed:', error);
      return {
        success: false,
        filesModified: [],
        filesCreated: [],
        summary: `Frontend task failed: ${error}`,
        errors: [error as string]
      };
    }
  }

  private identifyTargetFiles(task: string, plan: string): string[] {
    const files = [];
    const text = `${task} ${plan}`.toLowerCase();

    // Common frontend file patterns
    const patterns = [
      { pattern: /dashboard|main.*page/, files: ['frontend/app/dashboard/page.tsx'] },
      { pattern: /landing.*page|home.*page/, files: ['frontend/app/page.tsx'] },
      { pattern: /blog.*page|editor/, files: ['frontend/app/blogs/page.tsx', 'frontend/app/editor/[id]/page.tsx'] },
      { pattern: /auth|sign.*in|sign.*up/, files: ['frontend/app/sign-in/[[...sign-in]]/page.tsx', 'frontend/app/sign-up/[[...sign-up]]/page.tsx'] },
      { pattern: /layout|header|navigation/, files: ['frontend/app/layout.tsx'] },
      { pattern: /middleware|auth.*middleware/, files: ['frontend/middleware.ts'] },
      { pattern: /component|ui/, files: ['frontend/components/ui/'] },
      { pattern: /style|css|tailwind/, files: ['frontend/app/globals.css', 'frontend/tailwind.config.ts'] },
      { pattern: /utils|helper/, files: ['frontend/lib/utils.ts'] }
    ];

    for (const { pattern, files: patternFiles } of patterns) {
      if (pattern.test(text)) {
        files.push(...patternFiles);
      }
    }

    // If no specific patterns match, include common files
    if (files.length === 0) {
      files.push(
        'frontend/app/page.tsx',
        'frontend/app/layout.tsx',
        'frontend/app/dashboard/page.tsx'
      );
    }

    return [...new Set(files)]; // Remove duplicates
  }

  private async generateImplementation(
    task: string,
    plan: string,
    context: string,
    codebaseAnalysis: string
  ): Promise<any> {
    const prompt = `${this.createSystemPrompt()}

## Task to Implement:
${task}

## Implementation Plan:
${plan}

## Project Context:
${context}

## Current Codebase:
${codebaseAnalysis}

## Your Task:
Implement the requested changes for the frontend. Analyze the existing code, understand the current patterns, and implement the solution following these guidelines:

1. **Follow Existing Patterns**: Match the coding style, component structure, and naming conventions
2. **Use ShadCN Components**: Prefer existing ShadCN components from \`@/components/ui/\`
3. **TypeScript**: Ensure full TypeScript compliance with proper typing
4. **Responsive Design**: Make sure components work on all screen sizes
5. **Accessibility**: Include proper ARIA labels and semantic HTML
6. **Error Handling**: Include loading states and error handling
7. **Performance**: Optimize for performance (lazy loading, memoization where appropriate)

## Response Format:
Provide your response as a JSON object with this structure:

\`\`\`json
{
  "summary": "Brief description of changes made",
  "files": [
    {
      "path": "relative/path/to/file.tsx",
      "action": "create|modify|delete",
      "content": "full file content",
      "reasoning": "why this change was needed"
    }
  ],
  "newComponents": [
    {
      "name": "ComponentName",
      "purpose": "what this component does"
    }
  ],
  "dependencies": [
    {
      "package": "package-name",
      "reason": "why this dependency is needed"
    }
  ]
}
\`\`\`

Ensure all code is production-ready and follows the project's standards.`;

    const response = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 8000,
      messages: [{ role: 'user', content: prompt }]
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    // Extract JSON from response
    const jsonMatch = content.text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (!jsonMatch) {
      throw new Error('Could not extract JSON from Claude response');
    }

    return JSON.parse(jsonMatch[1]);
  }

  private async applyChanges(implementation: any): Promise<TaskResult> {
    const filesModified: string[] = [];
    const filesCreated: string[] = [];
    const errors: string[] = [];

    try {
      // Install new dependencies if needed
      if (implementation.dependencies && implementation.dependencies.length > 0) {
        await this.installDependencies(implementation.dependencies);
      }

      // Apply file changes
      for (const file of implementation.files) {
        try {
          const exists = this.fileExists(file.path);
          
          if (file.action === 'delete') {
            // Handle file deletion
            if (exists) {
              // We'll skip actual deletion in automation for safety
              this.logger.warn(`Skipping deletion of ${file.path} (safety measure)`);
            }
          } else {
            this.writeFile(file.path, file.content);
            
            if (exists) {
              filesModified.push(file.path);
            } else {
              filesCreated.push(file.path);
            }
          }
        } catch (error) {
          errors.push(`Failed to ${file.action} ${file.path}: ${error}`);
        }
      }

      return {
        success: errors.length === 0,
        filesModified,
        filesCreated,
        summary: implementation.summary,
        errors: errors.length > 0 ? errors : undefined
      };

    } catch (error) {
      return {
        success: false,
        filesModified,
        filesCreated,
        summary: `Failed to apply changes: ${error}`,
        errors: [error as string]
      };
    }
  }

  private async installDependencies(dependencies: Array<{package: string, reason: string}>): Promise<void> {
    try {
      const { execSync } = require('child_process');
      const packages = dependencies.map(dep => dep.package).join(' ');
      
      this.logger.info(`Installing frontend dependencies: ${packages}`);
      
      execSync(`cd frontend && npm install ${packages}`, {
        encoding: 'utf-8',
        timeout: 120000
      });
      
      this.logger.info('Dependencies installed successfully');
    } catch (error) {
      this.logger.error('Failed to install dependencies:', error);
      throw error;
    }
  }
}