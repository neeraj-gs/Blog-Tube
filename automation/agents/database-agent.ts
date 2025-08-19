import { BaseAgent, AgentConfig, TaskResult } from './base-agent';

export class DatabaseAgent extends BaseAgent {
  constructor() {
    super({
      name: 'database-agent',
      description: 'Specialized agent for database operations, MongoDB schemas, and data modeling',
      capabilities: [
        'Design and modify MongoDB schemas using Mongoose',
        'Create and manage database indexes',
        'Implement data validation and constraints',
        'Design database relationships and references',
        'Create database migration scripts',
        'Optimize database queries and performance',
        'Implement data aggregation pipelines',
        'Handle database versioning and schema evolution',
        'Design data backup and recovery strategies'
      ],
      workingDirectory: 'backend/src/models/'
    });
  }

  async execute(task: string, implementationPlan: string): Promise<TaskResult> {
    this.logger.info(`Executing database task: ${task.substring(0, 100)}...`);

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
      
      // Run backend build to validate schema changes
      const testResults = await this.runTests('backend');
      result.testResults = testResults;

      this.logger.info('Database task completed successfully');
      return result;

    } catch (error) {
      this.logger.error('Database task failed:', error);
      return {
        success: false,
        filesModified: [],
        filesCreated: [],
        summary: `Database task failed: ${error}`,
        errors: [error as string]
      };
    }
  }

  private identifyTargetFiles(task: string, plan: string): string[] {
    const files = [];
    const text = `${task} ${plan}`.toLowerCase();

    const patterns = [
      { pattern: /user|account|profile/, files: ['backend/src/models/User.ts'] },
      { pattern: /blog|post|article/, files: ['backend/src/models/Blog.ts'] },
      { pattern: /prompt|query|request/, files: ['backend/src/models/Prompt.ts'] },
      { pattern: /comment|review/, files: ['backend/src/models/Comment.ts'] },
      { pattern: /category|tag/, files: ['backend/src/models/Category.ts', 'backend/src/models/Tag.ts'] },
      { pattern: /analytics|stats|metrics/, files: ['backend/src/models/Analytics.ts'] },
      { pattern: /subscription|payment/, files: ['backend/src/models/Subscription.ts'] },
      { pattern: /notification|alert/, files: ['backend/src/models/Notification.ts'] },
      { pattern: /migration|script/, files: ['backend/src/migrations/'] },
      { pattern: /index|performance/, files: ['backend/src/models/'] }
    ];

    for (const { pattern, files: patternFiles } of patterns) {
      if (pattern.test(text)) {
        files.push(...patternFiles);
      }
    }

    // Add existing models for context
    const existingModels = [
      'backend/src/models/User.ts',
      'backend/src/models/Blog.ts',
      'backend/src/models/Prompt.ts'
    ];
    
    files.push(...existingModels);
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

## Current Database Models:
${codebaseAnalysis}

## Your Task:
Implement the requested database changes. Follow these guidelines:

1. **Mongoose Best Practices**: Use proper schema definition, validation, and middleware
2. **Data Integrity**: Implement appropriate constraints, validation, and relationships
3. **Performance**: Add necessary indexes for query optimization
4. **Schema Evolution**: Consider backward compatibility and migration needs
5. **TypeScript Integration**: Ensure proper TypeScript interfaces and types
6. **Relationships**: Use proper references between models (populate vs embed)
7. **Validation**: Implement both schema-level and application-level validation
8. **Indexes**: Add appropriate compound and single-field indexes
9. **Middleware**: Use pre/post hooks for data processing and validation

## Response Format:
Provide your response as a JSON object:

\`\`\`json
{
  "summary": "Brief description of database changes made",
  "files": [
    {
      "path": "backend/src/models/ModelName.ts",
      "action": "create|modify|delete",
      "content": "full file content with proper Mongoose schema",
      "reasoning": "explanation of schema design decisions"
    }
  ],
  "migrations": [
    {
      "name": "migration_name",
      "description": "what this migration does",
      "script": "MongoDB script or Mongoose code for migration"
    }
  ],
  "indexes": [
    {
      "collection": "collection_name", 
      "index": "index definition",
      "purpose": "why this index is needed"
    }
  ],
  "relationships": [
    {
      "from": "SourceModel",
      "to": "TargetModel", 
      "type": "one-to-one|one-to-many|many-to-many",
      "description": "relationship explanation"
    }
  ]
}
\`\`\`

Ensure all schemas are production-ready with proper validation and error handling.`;

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
      // Apply schema changes
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

      // Create migration scripts if needed
      if (implementation.migrations && implementation.migrations.length > 0) {
        await this.createMigrationScripts(implementation.migrations);
      }

      // Create index documentation
      if (implementation.indexes && implementation.indexes.length > 0) {
        await this.documentIndexes(implementation.indexes);
      }

      // Create relationship documentation
      if (implementation.relationships && implementation.relationships.length > 0) {
        await this.documentRelationships(implementation.relationships);
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
        summary: `Failed to apply database changes: ${error}`,
        errors: [error as string]
      };
    }
  }

  private async createMigrationScripts(migrations: Array<{name: string, description: string, script: string}>): Promise<void> {
    try {
      // Ensure migrations directory exists
      const migrationsDir = 'backend/src/migrations';
      
      for (const migration of migrations) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${timestamp}-${migration.name}.ts`;
        const filepath = `${migrationsDir}/${filename}`;
        
        const migrationContent = `/**
 * Migration: ${migration.name}
 * Description: ${migration.description}
 * Created: ${new Date().toISOString()}
 */

import mongoose from 'mongoose';

export async function up(): Promise<void> {
  ${migration.script}
}

export async function down(): Promise<void> {
  // Implement rollback logic here
  console.log('Rollback for ${migration.name} not implemented');
}
`;

        this.writeFile(filepath, migrationContent);
        this.logger.info(`Created migration script: ${filename}`);
      }
    } catch (error) {
      this.logger.error('Failed to create migration scripts:', error);
    }
  }

  private async documentIndexes(indexes: Array<{collection: string, index: string, purpose: string}>): Promise<void> {
    try {
      const indexDoc = `# Database Indexes

This document describes the database indexes for the BlogTube project.

## Indexes

${indexes.map(idx => `
### ${idx.collection}
- **Index**: \`${idx.index}\`
- **Purpose**: ${idx.purpose}
`).join('\n')}

## How to Apply Indexes

Run these commands in MongoDB shell or use Mongoose:

\`\`\`javascript
${indexes.map(idx => `db.${idx.collection}.createIndex(${idx.index});`).join('\n')}
\`\`\`

Generated on: ${new Date().toISOString()}
`;

      this.writeFile('backend/docs/indexes.md', indexDoc);
      this.logger.info('Created index documentation');
    } catch (error) {
      this.logger.error('Failed to document indexes:', error);
    }
  }

  private async documentRelationships(relationships: Array<{from: string, to: string, type: string, description: string}>): Promise<void> {
    try {
      const relationshipDoc = `# Database Relationships

This document describes the relationships between models in the BlogTube project.

## Model Relationships

${relationships.map(rel => `
### ${rel.from} → ${rel.to}
- **Type**: ${rel.type}
- **Description**: ${rel.description}
`).join('\n')}

Generated on: ${new Date().toISOString()}
`;

      this.writeFile('backend/docs/relationships.md', relationshipDoc);
      this.logger.info('Created relationship documentation');
    } catch (error) {
      this.logger.error('Failed to document relationships:', error);
    }
  }
}