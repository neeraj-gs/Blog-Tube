import { BaseAgent, AgentConfig, TaskResult } from './base-agent';

export class BackendAgent extends BaseAgent {
  constructor() {
    super({
      name: 'backend-agent',
      description: 'Specialized agent for backend development using Express.js, TypeScript, and MongoDB',
      capabilities: [
        'Create and modify Express.js routes and middleware',
        'Implement REST API endpoints',
        'Handle authentication and authorization',
        'Design and implement business logic',
        'Integrate with external APIs (OpenAI, YouTube)',
        'Implement data validation and sanitization',
        'Error handling and logging',
        'Performance optimization',
        'Security best practices'
      ],
      workingDirectory: 'backend/src/'
    });
  }

  async execute(task: string, implementationPlan: string): Promise<TaskResult> {
    this.logger.info(`Executing backend task: ${task.substring(0, 100)}...`);

    try {
      const projectContext = await this.readProjectContext();
      const targetFiles = this.identifyTargetFiles(task, implementationPlan);
      const codebaseAnalysis = await this.analyzeCodebase(targetFiles);

      const implementation = await this.generateImplementation(
        task,
        implementationPlan,
        projectContext,
        codebaseAnalysis
      );

      const result = await this.applyChanges(implementation);
      const testResults = await this.runTests('backend');
      result.testResults = testResults;

      this.logger.info('Backend task completed successfully');
      return result;

    } catch (error) {
      this.logger.error('Backend task failed:', error);
      return {
        success: false,
        filesModified: [],
        filesCreated: [],
        summary: `Backend task failed: ${error}`,
        errors: [error as string]
      };
    }
  }

  private identifyTargetFiles(task: string, plan: string): string[] {
    const files = [];
    const text = `${task} ${plan}`.toLowerCase();

    const patterns = [
      { pattern: /route|endpoint|api/, files: ['backend/src/routes/'] },
      { pattern: /auth|user|clerk/, files: ['backend/src/routes/auth.ts', 'backend/src/middleware/auth.ts'] },
      { pattern: /blog|post/, files: ['backend/src/routes/blog.ts', 'backend/src/models/Blog.ts'] },
      { pattern: /prompt|ai|openai/, files: ['backend/src/routes/prompt.ts', 'backend/src/services/openai.ts'] },
      { pattern: /youtube|transcript/, files: ['backend/src/routes/youtube.ts'] },
      { pattern: /model|schema|database/, files: ['backend/src/models/'] },
      { pattern: /middleware/, files: ['backend/src/middleware/'] },
      { pattern: /service/, files: ['backend/src/services/'] },
      { pattern: /server|index/, files: ['backend/src/index.ts'] },
      { pattern: /config|env/, files: ['backend/.env.example'] }
    ];

    for (const { pattern, files: patternFiles } of patterns) {
      if (pattern.test(text)) {
        files.push(...patternFiles);
      }
    }

    // Add core files if nothing specific was found
    if (files.length === 0) {
      files.push(
        'backend/src/index.ts',
        'backend/src/routes/',
        'backend/src/models/'
      );
    }

    return [...new Set(files)];
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
Implement the requested backend changes. Follow these guidelines:

1. **Express.js Best Practices**: Use proper middleware, error handling, and routing
2. **TypeScript**: Ensure full type safety with proper interfaces and types
3. **Authentication**: Use Clerk middleware for protected routes
4. **Validation**: Implement input validation using express-validator
5. **Error Handling**: Provide meaningful error messages and status codes
6. **Security**: Follow security best practices (sanitization, rate limiting if needed)
7. **Database**: Use Mongoose ODM properly with appropriate schemas
8. **API Design**: Follow RESTful conventions and consistent response formats
9. **Logging**: Add appropriate logging for debugging and monitoring

## Response Format:
Provide your response as a JSON object:

\`\`\`json
{
  "summary": "Brief description of backend changes made",
  "files": [
    {
      "path": "backend/src/path/to/file.ts",
      "action": "create|modify|delete",
      "content": "full file content",
      "reasoning": "explanation of changes"
    }
  ],
  "newEndpoints": [
    {
      "method": "GET|POST|PUT|DELETE",
      "path": "/api/path",
      "description": "what this endpoint does"
    }
  ],
  "dependencies": [
    {
      "package": "package-name",
      "reason": "why needed"
    }
  ],
  "environmentVariables": [
    {
      "name": "VARIABLE_NAME",
      "description": "what this variable is for",
      "example": "example_value"
    }
  ]
}
\`\`\`

Ensure all code follows the existing patterns and is production-ready.`;

    const response = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 8000,
      messages: [{ role: 'user', content: prompt }]
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

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
      // Install new dependencies
      if (implementation.dependencies && implementation.dependencies.length > 0) {
        await this.installDependencies(implementation.dependencies);
      }

      // Update environment example file if needed
      if (implementation.environmentVariables && implementation.environmentVariables.length > 0) {
        await this.updateEnvExample(implementation.environmentVariables);
      }

      // Apply file changes
      for (const file of implementation.files) {
        try {
          const exists = this.fileExists(file.path);
          
          if (file.action === 'delete') {
            this.logger.warn(`Skipping deletion of ${file.path} (safety measure)`);
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
        summary: `Failed to apply backend changes: ${error}`,
        errors: [error as string]
      };
    }
  }

  private async installDependencies(dependencies: Array<{package: string, reason: string}>): Promise<void> {
    try {
      const { execSync } = require('child_process');
      const packages = dependencies.map(dep => dep.package).join(' ');
      
      this.logger.info(`Installing backend dependencies: ${packages}`);
      
      execSync(`cd backend && npm install ${packages}`, {
        encoding: 'utf-8',
        timeout: 120000
      });
      
      this.logger.info('Backend dependencies installed successfully');
    } catch (error) {
      this.logger.error('Failed to install backend dependencies:', error);
      throw error;
    }
  }

  private async updateEnvExample(envVars: Array<{name: string, description: string, example: string}>): Promise<void> {
    try {
      const envExamplePath = 'backend/.env.example';
      let content = this.fileExists(envExamplePath) ? this.readFile(envExamplePath) : '';
      
      for (const envVar of envVars) {
        const varLine = `\n# ${envVar.description}\n${envVar.name}=${envVar.example}`;
        
        // Check if variable already exists
        if (!content.includes(`${envVar.name}=`)) {
          content += varLine;
        }
      }
      
      this.writeFile(envExamplePath, content);
      this.logger.info('Updated .env.example with new environment variables');
    } catch (error) {
      this.logger.error('Failed to update .env.example:', error);
    }
  }
}