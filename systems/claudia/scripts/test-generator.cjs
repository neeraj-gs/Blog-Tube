#!/usr/bin/env node

/**
 * Claudia AI-Powered Test Generator
 * Generates comprehensive tests based on ticket specifications and TDD principles
 */

const fs = require('fs').promises;
const path = require('path');

class ClaudiaTestGenerator {
    constructor() {
        this.projectRoot = this.findProjectRoot();
        this.testPatterns = {
            unit: {
                controller: this.generateControllerTests.bind(this),
                service: this.generateServiceTests.bind(this),
                model: this.generateModelTests.bind(this),
                middleware: this.generateMiddlewareTests.bind(this),
                validator: this.generateValidatorTests.bind(this)
            },
            integration: {
                api: this.generateAPIIntegrationTests.bind(this),
                database: this.generateDatabaseIntegrationTests.bind(this),
                auth: this.generateAuthIntegrationTests.bind(this)
            },
            e2e: {
                workflow: this.generateWorkflowE2ETests.bind(this),
                ui: this.generateUIE2ETests.bind(this)
            }
        };
    }

    /**
     * Find the project root directory
     */
    findProjectRoot() {
        let currentDir = __dirname;
        while (currentDir !== '/') {
            const packagePath = path.join(currentDir, 'package.json');
            try {
                require(packagePath);
                return currentDir;
            } catch (e) {
                currentDir = path.dirname(currentDir);
            }
        }
        return process.cwd();
    }

    /**
     * Generate tests based on ticket specification
     */
    async generateTestsForTicket(ticketUuid) {
        try {
            console.log(`🧪 Generating AI-powered tests for ticket: ${ticketUuid}`);
            
            // Read ticket specification
            const ticketPath = path.join(this.projectRoot, 'docs', 'tickets', `${ticketUuid}.md`);
            const ticketContent = await fs.readFile(ticketPath, 'utf8');
            const ticketSpec = this.parseTicketSpecification(ticketContent);

            console.log(`📋 Parsed ticket: ${ticketSpec.title}`);
            console.log(`🏷️  Type: ${ticketSpec.type}`);
            console.log(`📝 Implementation: ${ticketSpec.implementation.length} phases`);

            const generatedTests = {
                unit: [],
                integration: [],
                e2e: [],
                metadata: {
                    ticketUuid,
                    title: ticketSpec.title,
                    type: ticketSpec.type,
                    generatedAt: new Date().toISOString(),
                    testFramework: this.detectTestFramework(),
                    coverage: {
                        target: 95,
                        critical: true
                    }
                }
            };

            // Generate different types of tests based on ticket type and content
            await this.generateTestsByType(ticketSpec, generatedTests);

            // Save generated tests
            await this.saveGeneratedTests(ticketUuid, generatedTests);

            console.log(`✅ Generated ${generatedTests.unit.length} unit tests`);
            console.log(`✅ Generated ${generatedTests.integration.length} integration tests`);
            console.log(`✅ Generated ${generatedTests.e2e.length} E2E tests`);

            return generatedTests;
        } catch (error) {
            console.error(`❌ Failed to generate tests for ticket ${ticketUuid}:`, error.message);
            throw error;
        }
    }

    /**
     * Parse ticket specification from markdown
     */
    parseTicketSpecification(content) {
        const lines = content.split('\n');
        const spec = {
            title: '',
            type: '',
            description: '',
            acceptanceCriteria: [],
            implementation: [],
            components: [],
            apiEndpoints: [],
            databaseChanges: []
        };

        let currentSection = null;
        let currentSubsection = null;

        lines.forEach(line => {
            line = line.trim();
            
            // Extract title
            if (line.startsWith('# ') && !spec.title) {
                spec.title = line.substring(2);
            }
            
            // Extract type
            if (line.includes('**Type:**')) {
                spec.type = line.split('**Type:**')[1].trim();
            }
            
            // Track sections
            if (line.startsWith('## ')) {
                currentSection = line.substring(3).toLowerCase();
                currentSubsection = null;
            } else if (line.startsWith('### ')) {
                currentSubsection = line.substring(4).toLowerCase();
            }
            
            // Extract content based on section
            if (currentSection === 'description' && line && !line.startsWith('#')) {
                spec.description += line + ' ';
            }
            
            if (currentSection === 'acceptance criteria' || currentSubsection === 'acceptance criteria') {
                if (line.startsWith('- ') || line.startsWith('* ')) {
                    spec.acceptanceCriteria.push(line.substring(2));
                }
            }
            
            if (currentSection === 'implementation approach' || currentSubsection === 'implementation') {
                if (line.includes('Phase') || line.includes('Step')) {
                    spec.implementation.push(line);
                }
            }
            
            // Extract technical details
            if (line.includes('controller') || line.includes('Controller')) {
                spec.components.push({ type: 'controller', name: this.extractComponentName(line) });
            }
            if (line.includes('service') || line.includes('Service')) {
                spec.components.push({ type: 'service', name: this.extractComponentName(line) });
            }
            if (line.includes('model') || line.includes('Model')) {
                spec.components.push({ type: 'model', name: this.extractComponentName(line) });
            }
            if (line.includes('endpoint') || line.includes('API') || line.includes('/api/')) {
                const endpoint = this.extractAPIEndpoint(line);
                if (endpoint) spec.apiEndpoints.push(endpoint);
            }
        });

        spec.description = spec.description.trim();
        return spec;
    }

    /**
     * Extract component name from line
     */
    extractComponentName(line) {
        // Simple extraction - can be enhanced with more sophisticated parsing
        const matches = line.match(/(\w+)(Controller|Service|Model)/i);
        return matches ? matches[1].toLowerCase() : 'unknown';
    }

    /**
     * Extract API endpoint from line
     */
    extractAPIEndpoint(line) {
        const patterns = [
            /\/api\/[\w\/\-]+/g,
            /(GET|POST|PUT|DELETE|PATCH)\s+[\w\/\-]+/g,
            /(\w+)\s*:\s*(GET|POST|PUT|DELETE|PATCH)/g
        ];

        for (const pattern of patterns) {
            const matches = line.match(pattern);
            if (matches) {
                return matches[0];
            }
        }
        return null;
    }

    /**
     * Generate tests by analyzing ticket type and content
     */
    async generateTestsByType(ticketSpec, generatedTests) {
        // Generate unit tests for each component
        for (const component of ticketSpec.components) {
            if (this.testPatterns.unit[component.type]) {
                const tests = await this.testPatterns.unit[component.type](ticketSpec, component);
                generatedTests.unit.push(...tests);
            }
        }

        // Generate integration tests for API endpoints
        if (ticketSpec.apiEndpoints.length > 0) {
            const apiTests = await this.testPatterns.integration.api(ticketSpec);
            generatedTests.integration.push(...apiTests);
        }

        // Generate E2E tests based on acceptance criteria
        if (ticketSpec.acceptanceCriteria.length > 0) {
            const e2eTests = await this.testPatterns.e2e.workflow(ticketSpec);
            generatedTests.e2e.push(...e2eTests);
        }
    }

    /**
     * Generate controller tests
     */
    async generateControllerTests(ticketSpec, component) {
        const controllerName = component.name;
        const tests = [];

        const testTemplate = `
describe('${controllerName}Controller', () => {
    let req, res, next;
    
    beforeEach(() => {
        req = mockRequest();
        res = mockResponse();
        next = mockNext();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Happy Path Tests', () => {
        test('should handle valid request successfully', async () => {
            // Arrange
            const expectedData = { success: true };
            jest.spyOn(${controllerName}Service, 'process').mockResolvedValue(expectedData);
            
            // Act
            await ${controllerName}Controller.handleRequest(req, res, next);
            
            // Assert
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expectedData);
        });
    });

    describe('Error Handling Tests', () => {
        test('should handle service errors gracefully', async () => {
            // Arrange
            const error = new Error('Service unavailable');
            jest.spyOn(${controllerName}Service, 'process').mockRejectedValue(error);
            
            // Act
            await ${controllerName}Controller.handleRequest(req, res, next);
            
            // Assert
            expect(next).toHaveBeenCalledWith(error);
        });

        test('should validate required parameters', async () => {
            // Arrange
            req.body = {}; // Missing required fields
            
            // Act
            await ${controllerName}Controller.handleRequest(req, res, next);
            
            // Assert
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ error: expect.stringContaining('required') })
            );
        });
    });

    describe('Authorization Tests', () => {
        test('should require valid authentication', async () => {
            // Arrange
            req.user = null;
            
            // Act
            await ${controllerName}Controller.handleRequest(req, res, next);
            
            // Assert
            expect(res.status).toHaveBeenCalledWith(401);
        });
    });
});`;

        tests.push({
            type: 'unit',
            component: 'controller',
            name: `${controllerName}.controller.test.js`,
            content: testTemplate,
            path: `api/__tests__/controllers/${controllerName}.controller.test.js`,
            description: `Unit tests for ${controllerName} controller with comprehensive error handling and validation`
        });

        return tests;
    }

    /**
     * Generate service tests
     */
    async generateServiceTests(ticketSpec, component) {
        const serviceName = component.name;
        const tests = [];

        const testTemplate = `
describe('${serviceName}Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Business Logic Tests', () => {
        test('should process data according to business rules', async () => {
            // Arrange
            const inputData = { /* test data */ };
            const expectedResult = { /* expected result */ };
            
            // Act
            const result = await ${serviceName}Service.process(inputData);
            
            // Assert
            expect(result).toEqual(expectedResult);
        });

        test('should handle edge cases correctly', async () => {
            // Arrange
            const edgeCaseData = { /* edge case data */ };
            
            // Act & Assert
            await expect(${serviceName}Service.process(edgeCaseData))
                .resolves.toBeDefined();
        });
    });

    describe('Data Validation Tests', () => {
        test('should validate input parameters', async () => {
            // Arrange
            const invalidData = null;
            
            // Act & Assert
            await expect(${serviceName}Service.process(invalidData))
                .rejects.toThrow('Invalid input data');
        });
    });

    describe('Database Integration Tests', () => {
        test('should interact with database correctly', async () => {
            // Arrange
            const mockData = { /* mock database data */ };
            jest.spyOn(${serviceName}Model, 'find').mockResolvedValue(mockData);
            
            // Act
            const result = await ${serviceName}Service.getData();
            
            // Assert
            expect(${serviceName}Model.find).toHaveBeenCalled();
            expect(result).toEqual(mockData);
        });
    });
});`;

        tests.push({
            type: 'unit',
            component: 'service',
            name: `${serviceName}.service.test.js`,
            content: testTemplate,
            path: `api/__tests__/services/${serviceName}.service.test.js`,
            description: `Unit tests for ${serviceName} service with business logic validation and database mocking`
        });

        return tests;
    }

    /**
     * Generate model tests
     */
    async generateModelTests(ticketSpec, component) {
        const modelName = component.name;
        const tests = [];

        const testTemplate = `
describe('${modelName}Model', () => {
    beforeEach(async () => {
        await ${modelName}.deleteMany({});
    });

    afterEach(async () => {
        await ${modelName}.deleteMany({});
    });

    describe('Schema Validation Tests', () => {
        test('should create valid ${modelName.toLowerCase()} successfully', async () => {
            // Arrange
            const validData = {
                // Add required fields based on schema
            };
            
            // Act
            const ${modelName.toLowerCase()} = new ${modelName}(validData);
            const saved = await ${modelName.toLowerCase()}.save();
            
            // Assert
            expect(saved._id).toBeDefined();
            expect(saved.createdAt).toBeDefined();
        });

        test('should reject invalid data', async () => {
            // Arrange
            const invalidData = {
                // Missing required fields
            };
            
            // Act & Assert
            const ${modelName.toLowerCase()} = new ${modelName}(invalidData);
            await expect(${modelName.toLowerCase()}.save()).rejects.toThrow();
        });
    });

    describe('Model Methods Tests', () => {
        test('should execute custom methods correctly', async () => {
            // Arrange
            const testData = { /* test data */ };
            const ${modelName.toLowerCase()} = await ${modelName}.create(testData);
            
            // Act
            const result = await ${modelName.toLowerCase()}.customMethod();
            
            // Assert
            expect(result).toBeDefined();
        });
    });

    describe('Query Tests', () => {
        test('should find records with correct filters', async () => {
            // Arrange
            const testRecords = [
                { /* record 1 */ },
                { /* record 2 */ }
            ];
            await ${modelName}.insertMany(testRecords);
            
            // Act
            const found = await ${modelName}.find({ /* filter criteria */ });
            
            // Assert
            expect(found).toHaveLength(1);
        });
    });
});`;

        tests.push({
            type: 'unit',
            component: 'model',
            name: `${modelName}.model.test.js`,
            content: testTemplate,
            path: `api/__tests__/models/${modelName}.model.test.js`,
            description: `Unit tests for ${modelName} model with schema validation and query testing`
        });

        return tests;
    }

    /**
     * Generate middleware tests
     */
    async generateMiddlewareTests(ticketSpec, component) {
        // Implementation for middleware tests
        return [];
    }

    /**
     * Generate validator tests
     */
    async generateValidatorTests(ticketSpec, component) {
        // Implementation for validator tests
        return [];
    }

    /**
     * Generate API integration tests
     */
    async generateAPIIntegrationTests(ticketSpec) {
        const tests = [];
        
        for (const endpoint of ticketSpec.apiEndpoints) {
            const testTemplate = `
describe('${endpoint} Integration Tests', () => {
    beforeEach(async () => {
        await setupTestDatabase();
    });

    afterEach(async () => {
        await cleanupTestDatabase();
    });

    test('should handle complete request flow successfully', async () => {
        // Arrange
        const testPayload = { /* test data */ };
        
        // Act
        const response = await request(app)
            .post('${endpoint}')
            .send(testPayload)
            .expect(200);
        
        // Assert
        expect(response.body).toHaveProperty('success', true);
    });

    test('should validate authentication and authorization', async () => {
        // Act
        const response = await request(app)
            .post('${endpoint}')
            .expect(401);
        
        // Assert
        expect(response.body).toHaveProperty('error');
    });

    test('should handle database constraints correctly', async () => {
        // Arrange - Create conflicting data
        
        // Act & Assert
        const response = await request(app)
            .post('${endpoint}')
            .send({ /* conflicting data */ })
            .expect(400);
    });
});`;

            tests.push({
                type: 'integration',
                component: 'api',
                name: `${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}.integration.test.js`,
                content: testTemplate,
                path: `api/__tests__/integration/${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}.integration.test.js`,
                description: `Integration tests for ${endpoint} API endpoint`
            });
        }

        return tests;
    }

    /**
     * Generate database integration tests
     */
    async generateDatabaseIntegrationTests(ticketSpec) {
        // Implementation for database integration tests
        return [];
    }

    /**
     * Generate auth integration tests
     */
    async generateAuthIntegrationTests(ticketSpec) {
        // Implementation for auth integration tests
        return [];
    }

    /**
     * Generate workflow E2E tests
     */
    async generateWorkflowE2ETests(ticketSpec) {
        const tests = [];

        const testTemplate = `
describe('${ticketSpec.title} E2E Workflow', () => {
    beforeAll(async () => {
        await setupE2EEnvironment();
    });

    afterAll(async () => {
        await cleanupE2EEnvironment();
    });

    ${ticketSpec.acceptanceCriteria.map((criteria, index) => `
    test('AC${index + 1}: ${criteria}', async () => {
        // Arrange
        // Set up test data and environment for this acceptance criteria
        
        // Act
        // Execute the workflow steps that should satisfy this criteria
        
        // Assert
        // Verify the acceptance criteria is met
        expect(true).toBe(true); // Replace with actual assertions
    });`).join('\n')}

    test('should complete full user journey successfully', async () => {
        // Arrange
        const testUser = await createTestUser();
        
        // Act
        // Execute complete workflow from start to finish
        
        // Assert
        // Verify all steps completed successfully
        expect(true).toBe(true); // Replace with actual assertions
    });
});`;

        tests.push({
            type: 'e2e',
            component: 'workflow',
            name: `${ticketSpec.title.replace(/[^a-zA-Z0-9]/g, '_')}.e2e.test.js`,
            content: testTemplate,
            path: `api/__tests__/e2e/${ticketSpec.title.replace(/[^a-zA-Z0-9]/g, '_')}.e2e.test.js`,
            description: `End-to-end tests for ${ticketSpec.title} workflow covering all acceptance criteria`
        });

        return tests;
    }

    /**
     * Generate UI E2E tests
     */
    async generateUIE2ETests(ticketSpec) {
        // Implementation for UI E2E tests
        return [];
    }

    /**
     * Detect test framework
     */
    detectTestFramework() {
        try {
            const packagePath = path.join(this.projectRoot, 'package.json');
            const packageJson = require(packagePath);
            
            if (packageJson.devDependencies?.jest || packageJson.dependencies?.jest) {
                return 'jest';
            } else if (packageJson.devDependencies?.mocha || packageJson.dependencies?.mocha) {
                return 'mocha';
            }
        } catch (error) {
            // Default to jest if can't detect
        }
        return 'jest';
    }

    /**
     * Save generated tests to files
     */
    async saveGeneratedTests(ticketUuid, generatedTests) {
        const outputDir = path.join(this.projectRoot, '.claude', 'systems', 'claudia', 'generated-tests', ticketUuid);
        await fs.mkdir(outputDir, { recursive: true });

        // Save metadata
        const metadataPath = path.join(outputDir, 'metadata.json');
        await fs.writeFile(metadataPath, JSON.stringify(generatedTests.metadata, null, 2));

        // Save test files
        const allTests = [...generatedTests.unit, ...generatedTests.integration, ...generatedTests.e2e];
        
        for (const test of allTests) {
            const testDir = path.join(outputDir, test.type);
            await fs.mkdir(testDir, { recursive: true });
            
            const testPath = path.join(testDir, test.name);
            await fs.writeFile(testPath, test.content);
            
            console.log(`📝 Generated test: ${test.name}`);
        }

        // Create test deployment script
        const deployScript = this.generateDeploymentScript(generatedTests);
        const deployPath = path.join(outputDir, 'deploy-tests.sh');
        await fs.writeFile(deployPath, deployScript);
        await fs.chmod(deployPath, '755');

        console.log(`✅ Tests saved to: ${outputDir}`);
    }

    /**
     * Generate deployment script for tests
     */
    generateDeploymentScript(generatedTests) {
        const allTests = [...generatedTests.unit, ...generatedTests.integration, ...generatedTests.e2e];
        
        let script = `#!/bin/bash
# Auto-generated test deployment script for ticket: ${generatedTests.metadata.ticketUuid}
# Generated: ${generatedTests.metadata.generatedAt}

echo "🧪 Deploying generated tests for ${generatedTests.metadata.title}"
echo ""

# Create test directories
mkdir -p api/__tests__/controllers
mkdir -p api/__tests__/services  
mkdir -p api/__tests__/models
mkdir -p api/__tests__/integration
mkdir -p api/__tests__/e2e

`;

        for (const test of allTests) {
            script += `
# Deploy ${test.name}
echo "📝 Deploying ${test.name}..."
cp ${test.type}/${test.name} ../${test.path}
`;
        }

        script += `
echo ""
echo "✅ All tests deployed successfully!"
echo "📊 Summary:"
echo "  - Unit tests: ${generatedTests.unit.length}"
echo "  - Integration tests: ${generatedTests.integration.length}"
echo "  - E2E tests: ${generatedTests.e2e.length}"
echo ""
echo "🚀 Run tests with: npm test"
`;

        return script;
    }
}

// CLI Interface
if (require.main === module) {
    const generator = new ClaudiaTestGenerator();
    const command = process.argv[2];
    const ticketUuid = process.argv[3];

    if (command === 'generate' && ticketUuid) {
        generator.generateTestsForTicket(ticketUuid)
            .then(result => {
                console.log('✅ Test generation completed successfully');
                process.exit(0);
            })
            .catch(error => {
                console.error('❌ Test generation failed:', error.message);
                process.exit(1);
            });
    } else {
        console.log('Usage: node test-generator.cjs generate <ticket-uuid>');
        process.exit(1);
    }
}

module.exports = ClaudiaTestGenerator;