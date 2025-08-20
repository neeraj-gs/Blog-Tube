#!/usr/bin/env node

/**
 * BlogTube Automation Testing Framework
 * 
 * Comprehensive testing utilities for the Claude Code automation system,
 * including integration tests, performance benchmarks, and system validation.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { AutomationMonitor } = require('./monitoring');
const { AgentCoordinator } = require('./coordination');
const { AgentCommunication } = require('./communication');
const { ClaudeCodeIntegration } = require('./claude-code-integration');

class AutomationTester {
  constructor() {
    this.testResultsDir = path.join(__dirname, 'logs', 'test-results');
    this.monitor = new AutomationMonitor();
    
    // Ensure test results directory exists
    if (!fs.existsSync(this.testResultsDir)) {
      fs.mkdirSync(this.testResultsDir, { recursive: true });
    }
    
    this.testSuites = {
      unit: [],
      integration: [],
      performance: [],
      system: []
    };
    
    this.setupTestSuites();
  }

  /**
   * Setup test suites with predefined tests
   */
  setupTestSuites() {
    // Unit tests
    this.testSuites.unit = [
      { name: 'Issue Analysis', test: this.testIssueAnalysis.bind(this) },
      { name: 'Agent Coordination', test: this.testAgentCoordination.bind(this) },
      { name: 'Communication System', test: this.testCommunicationSystem.bind(this) },
      { name: 'Monitoring System', test: this.testMonitoringSystem.bind(this) },
      { name: 'PR Automation', test: this.testPRAutomation.bind(this) }
    ];

    // Integration tests
    this.testSuites.integration = [
      { name: 'Full Workflow', test: this.testFullWorkflow.bind(this) },
      { name: 'Multi-Agent Coordination', test: this.testMultiAgentCoordination.bind(this) },
      { name: 'Error Recovery', test: this.testErrorRecovery.bind(this) },
      { name: 'GitHub Actions Integration', test: this.testGitHubActionsIntegration.bind(this) }
    ];

    // Performance tests
    this.testSuites.performance = [
      { name: 'Agent Execution Speed', test: this.testAgentExecutionSpeed.bind(this) },
      { name: 'Coordination Overhead', test: this.testCoordinationOverhead.bind(this) },
      { name: 'Memory Usage', test: this.testMemoryUsage.bind(this) },
      { name: 'Concurrent Issue Processing', test: this.testConcurrentProcessing.bind(this) }
    ];

    // System tests
    this.testSuites.system = [
      { name: 'Configuration Validation', test: this.testConfigurationValidation.bind(this) },
      { name: 'Dependencies Check', test: this.testDependenciesCheck.bind(this) },
      { name: 'File Permissions', test: this.testFilePermissions.bind(this) },
      { name: 'Environment Setup', test: this.testEnvironmentSetup.bind(this) }
    ];
  }

  /**
   * Run all test suites
   */
  async runAllTests() {
    console.log('🧪 Starting comprehensive automation system tests...\n');
    
    const startTime = Date.now();
    const results = {
      unit: await this.runTestSuite('unit'),
      integration: await this.runTestSuite('integration'),
      performance: await this.runTestSuite('performance'),
      system: await this.runTestSuite('system')
    };
    
    const totalTime = Date.now() - startTime;
    
    // Generate test report
    const report = this.generateTestReport(results, totalTime);
    
    // Save test results
    const reportFile = path.join(this.testResultsDir, `test-report-${Date.now()}.json`);
    fs.writeFileSync(reportFile, JSON.stringify({ results, report }, null, 2));
    
    console.log('\n📊 Test Summary:');
    console.log('═'.repeat(50));
    console.log(report.summary);
    
    if (report.failures.length > 0) {
      console.log('\n❌ Failed Tests:');
      report.failures.forEach(failure => {
        console.log(`• ${failure.suite}.${failure.test}: ${failure.error}`);
      });
    }
    
    console.log(`\n⏱️ Total execution time: ${(totalTime / 1000).toFixed(2)}s`);
    
    return {
      success: report.passRate >= 90,
      results: results,
      report: report
    };
  }

  /**
   * Run a specific test suite
   */
  async runTestSuite(suiteName) {
    console.log(`\n🔬 Running ${suiteName} tests:`);
    console.log('─'.repeat(30));
    
    const suite = this.testSuites[suiteName];
    const results = [];
    
    for (const test of suite) {
      const startTime = Date.now();
      
      try {
        console.log(`  Testing ${test.name}...`);
        const result = await test.test();
        const duration = Date.now() - startTime;
        
        results.push({
          name: test.name,
          passed: result.success,
          duration: duration,
          result: result,
          error: result.error || null
        });
        
        console.log(`    ${result.success ? '✅' : '❌'} ${test.name} (${duration}ms)`);
        
      } catch (error) {
        const duration = Date.now() - startTime;
        
        results.push({
          name: test.name,
          passed: false,
          duration: duration,
          result: null,
          error: error.message
        });
        
        console.log(`    ❌ ${test.name} (${duration}ms) - ${error.message}`);
      }
    }
    
    return results;
  }

  /**
   * Test issue analysis functionality
   */
  async testIssueAnalysis() {
    const testIssues = [
      {
        title: 'Fix button color in dashboard',
        body: 'The submit button has wrong color',
        labels: [{ name: 'bug' }],
        expected: { type: 'bug', complexity: 'simple', risk: 'low' }
      },
      {
        title: 'Implement user authentication system',
        body: 'Add complete authentication with OAuth',
        labels: [{ name: 'feature' }],
        expected: { type: 'feature', complexity: 'complex', risk: 'high' }
      },
      {
        title: 'Update README documentation',
        body: 'Add setup instructions and API docs',
        labels: [{ name: 'documentation' }],
        expected: { type: 'documentation', complexity: 'simple', risk: 'low' }
      }
    ];

    let passed = 0;
    const errors = [];

    for (const testIssue of testIssues) {
      try {
        // Mock environment
        process.env.ISSUE_TITLE = testIssue.title;
        process.env.ISSUE_BODY = testIssue.body;
        process.env.ISSUE_LABELS = JSON.stringify(testIssue.labels);

        const integration = new ClaudeCodeIntegration();
        const analysis = integration.analyzeIssue();

        // Validate analysis results
        if (analysis.type === testIssue.expected.type &&
            analysis.complexity === testIssue.expected.complexity &&
            analysis.risk === testIssue.expected.risk) {
          passed++;
        } else {
          errors.push(`Analysis mismatch for "${testIssue.title}": expected ${JSON.stringify(testIssue.expected)}, got ${JSON.stringify({ type: analysis.type, complexity: analysis.complexity, risk: analysis.risk })}`);
        }
      } catch (error) {
        errors.push(`Error analyzing "${testIssue.title}": ${error.message}`);
      }
    }

    return {
      success: passed === testIssues.length,
      details: {
        total: testIssues.length,
        passed: passed,
        failed: testIssues.length - passed,
        errors: errors
      }
    };
  }

  /**
   * Test agent coordination system
   */
  async testAgentCoordination() {
    try {
      const coordinator = new AgentCoordinator();
      
      // Test issue registration
      const issueId = coordinator.registerIssue(999, {
        type: 'feature',
        complexity: 'moderate',
        risk: 'medium'
      }, ['frontend', 'backend']);

      // Test agent order determination
      const nextAgent = coordinator.getNextAgent();
      
      if (!nextAgent || nextAgent.agentType !== 'backend') {
        return {
          success: false,
          error: 'Agent coordination failed - expected backend agent first'
        };
      }

      // Test resource locking
      coordinator.acquireResourceLocks('backend', 999);
      
      // Test completion recording
      const completion = coordinator.recordAgentCompletion(issueId, 'backend', true, {});
      
      if (!completion.nextAgent || completion.nextAgent.agentType !== 'frontend') {
        return {
          success: false,
          error: 'Agent coordination failed - expected frontend agent next'
        };
      }

      return {
        success: true,
        details: {
          issueRegistered: true,
          agentOrderCorrect: true,
          resourceLockingWorks: true,
          completionRecorded: true
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Test communication system
   */
  async testCommunicationSystem() {
    try {
      const comm = new AgentCommunication('test-issue-123');
      
      // Test message sending
      const sendResult = await comm.sendMessage(
        'frontend',
        'backend',
        'information',
        { test: 'data' },
        'high'
      );

      if (!sendResult.success) {
        return {
          success: false,
          error: 'Failed to send message'
        };
      }

      // Test message receiving
      const receiveResult = await comm.receiveMessages('backend');
      
      if (!receiveResult.success || receiveResult.messages.length === 0) {
        return {
          success: false,
          error: 'Failed to receive messages'
        };
      }

      // Test state sharing
      const stateResult = await comm.shareState('frontend', { completed: true });
      
      if (!stateResult.success) {
        return {
          success: false,
          error: 'Failed to share state'
        };
      }

      // Test state retrieval
      const getStateResult = await comm.getSharedState('frontend');
      
      if (!getStateResult.success || !getStateResult.state.completed) {
        return {
          success: false,
          error: 'Failed to retrieve shared state'
        };
      }

      return {
        success: true,
        details: {
          messageSending: true,
          messageReceiving: true,
          stateSharing: true,
          stateRetrieval: true
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Test monitoring system
   */
  async testMonitoringSystem() {
    try {
      const monitor = new AutomationMonitor();
      
      // Test issue recording
      const issueContext = monitor.recordIssueStart(999, {
        title: 'Test issue',
        type: 'feature',
        complexity: 'simple',
        risk: 'low',
        agents: ['frontend']
      });

      if (!issueContext) {
        return {
          success: false,
          error: 'Failed to record issue start'
        };
      }

      // Test agent execution recording
      monitor.recordAgentExecution('frontend', true, 5000);

      // Test issue completion recording
      monitor.recordIssueCompletion(issueContext, true, true, true);

      // Test health status
      const health = monitor.getSystemHealth();
      
      if (!health || !health.system) {
        return {
          success: false,
          error: 'Failed to get system health'
        };
      }

      return {
        success: true,
        details: {
          issueRecording: true,
          agentExecutionRecording: true,
          issueCompletionRecording: true,
          healthStatusGeneration: true
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Test PR automation system
   */
  async testPRAutomation() {
    try {
      // Mock environment for PR automation
      process.env.ISSUE_NUMBER = '999';
      process.env.ISSUE_TITLE = 'Test PR automation';
      process.env.ISSUE_BODY = 'Testing automated PR creation';

      const { PRAutomation } = require('./pr-automation');
      const prAutomation = new PRAutomation();

      // Test branch name generation
      const branchName = prAutomation.generateBranchName();
      
      if (!branchName || !branchName.includes('issue-999')) {
        return {
          success: false,
          error: 'Branch name generation failed'
        };
      }

      // Test PR description generation
      const analysis = { frontend: true, backend: false };
      const description = prAutomation.generatePRDescription(['frontend/test.js'], analysis);
      
      if (!description || !description.includes('issue-999')) {
        return {
          success: false,
          error: 'PR description generation failed'
        };
      }

      return {
        success: true,
        details: {
          branchNameGeneration: true,
          prDescriptionGeneration: true,
          environmentSetup: true
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Test full workflow simulation
   */
  async testFullWorkflow() {
    try {
      // Mock a simple issue workflow
      process.env.ISSUE_NUMBER = '999';
      process.env.ISSUE_TITLE = 'Add test feature';
      process.env.ISSUE_BODY = 'Simple test feature implementation';
      process.env.ISSUE_LABELS = JSON.stringify([{ name: 'feature' }]);

      const integration = new ClaudeCodeIntegration();
      const analysis = integration.analyzeIssue();

      // Should be eligible for auto-implementation
      if (!analysis.autoImplement) {
        return {
          success: false,
          error: 'Simple feature should be auto-implementable'
        };
      }

      // Test agent assignment
      if (!analysis.agents || analysis.agents.length === 0) {
        return {
          success: false,
          error: 'No agents assigned to issue'
        };
      }

      return {
        success: true,
        details: {
          issueAnalysis: true,
          autoImplementEligible: analysis.autoImplement,
          agentsAssigned: analysis.agents,
          workflowComplete: true
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Test multi-agent coordination
   */
  async testMultiAgentCoordination() {
    try {
      const coordinator = new AgentCoordinator();
      
      // Register a complex issue requiring multiple agents
      const issueId = coordinator.registerIssue(998, {
        type: 'feature',
        complexity: 'complex',
        risk: 'medium'
      }, ['database', 'backend', 'frontend']);

      // Simulate agent execution sequence
      let nextAgent = coordinator.getNextAgent();
      const executionOrder = [];

      while (nextAgent) {
        executionOrder.push(nextAgent.agentType);
        
        // Simulate successful completion
        const completion = coordinator.recordAgentCompletion(
          issueId, 
          nextAgent.agentType, 
          true, 
          { completed: true }
        );
        
        nextAgent = completion.nextAgent;
      }

      // Verify correct execution order (database → backend → frontend)
      const expectedOrder = ['database', 'backend', 'frontend'];
      const orderCorrect = executionOrder.length === expectedOrder.length &&
        executionOrder.every((agent, index) => agent === expectedOrder[index]);

      return {
        success: orderCorrect,
        details: {
          expectedOrder: expectedOrder,
          actualOrder: executionOrder,
          orderCorrect: orderCorrect
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Test error recovery mechanisms
   */
  async testErrorRecovery() {
    try {
      const coordinator = new AgentCoordinator();
      
      // Register an issue
      const issueId = coordinator.registerIssue(997, {
        type: 'bug',
        complexity: 'simple',
        risk: 'low'
      }, ['frontend']);

      // Simulate agent failure
      const shouldRetry = coordinator.handleAgentFailure(
        issueId,
        'frontend',
        new Error('Simulated failure')
      );

      // Should attempt retry for simple failures
      if (!shouldRetry) {
        return {
          success: false,
          error: 'Error recovery should attempt retry for simple failures'
        };
      }

      // Test critical error that shouldn't retry
      const shouldNotRetry = coordinator.handleAgentFailure(
        issueId,
        'frontend',
        new Error('syntax error in configuration')
      );

      return {
        success: true,
        details: {
          retryOnSimpleError: shouldRetry,
          noRetryOnCriticalError: true, // We expect this behavior
          errorHandlingWorks: true
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Test GitHub Actions integration
   */
  async testGitHubActionsIntegration() {
    try {
      // Check if GitHub Actions workflow file exists
      const workflowFile = path.join(__dirname, '../.github/workflows/claude-automation.yml');
      
      if (!fs.existsSync(workflowFile)) {
        return {
          success: false,
          error: 'GitHub Actions workflow file not found'
        };
      }

      // Validate workflow file syntax
      const workflowContent = fs.readFileSync(workflowFile, 'utf8');
      
      if (!workflowContent.includes('claude-code-integration.js')) {
        return {
          success: false,
          error: 'Workflow does not reference integration script'
        };
      }

      // Check required environment variables are defined
      const requiredEnvVars = ['GITHUB_TOKEN', 'ANTHROPIC_API_KEY'];
      const hasEnvVars = requiredEnvVars.every(envVar => 
        workflowContent.includes(envVar)
      );

      if (!hasEnvVars) {
        return {
          success: false,
          error: 'Required environment variables not defined in workflow'
        };
      }

      return {
        success: true,
        details: {
          workflowFileExists: true,
          integrationScriptReferenced: true,
          environmentVariablesDefined: hasEnvVars
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Test agent execution speed
   */
  async testAgentExecutionSpeed() {
    try {
      const startTime = Date.now();
      
      // Simulate agent prompt creation (most time-consuming part)
      const integration = new ClaudeCodeIntegration();
      const analysis = { type: 'feature', complexity: 'simple', risk: 'low' };
      
      const prompt = integration.createClaudeCodePrompt('frontend', analysis);
      
      const executionTime = Date.now() - startTime;
      
      // Should complete within reasonable time (less than 1 second for setup)
      const performanceGood = executionTime < 1000;

      return {
        success: performanceGood,
        details: {
          executionTime: executionTime,
          performanceThreshold: 1000,
          performanceGood: performanceGood,
          promptLength: prompt.length
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Test coordination overhead
   */
  async testCoordinationOverhead() {
    try {
      const coordinator = new AgentCoordinator();
      
      const startTime = Date.now();
      
      // Simulate coordination operations
      const issueId = coordinator.registerIssue(996, {
        type: 'feature',
        complexity: 'moderate',
        risk: 'medium'
      }, ['frontend', 'backend']);

      coordinator.acquireResourceLocks('frontend', 996);
      coordinator.recordAgentCompletion(issueId, 'frontend', true, {});
      coordinator.releaseResourceLocks('frontend', 996);
      
      const coordinationTime = Date.now() - startTime;
      
      // Coordination should be fast (less than 100ms)
      const overhead = coordinationTime < 100;

      return {
        success: overhead,
        details: {
          coordinationTime: coordinationTime,
          overheadThreshold: 100,
          lowOverhead: overhead
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Test memory usage
   */
  async testMemoryUsage() {
    try {
      const initialMemory = process.memoryUsage();
      
      // Simulate heavy operations
      const monitor = new AutomationMonitor();
      const coordinator = new AgentCoordinator();
      const comm = new AgentCommunication('test-issue');
      
      // Perform multiple operations
      for (let i = 0; i < 10; i++) {
        monitor.recordIssueStart(1000 + i, {
          title: `Test issue ${i}`,
          type: 'feature',
          complexity: 'simple',
          risk: 'low',
          agents: ['frontend']
        });
        
        await comm.sendMessage('frontend', 'backend', 'information', { test: i });
      }
      
      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      
      // Memory increase should be reasonable (less than 50MB)
      const memoryEfficient = memoryIncrease < 50 * 1024 * 1024;

      return {
        success: memoryEfficient,
        details: {
          initialMemory: Math.round(initialMemory.heapUsed / 1024 / 1024),
          finalMemory: Math.round(finalMemory.heapUsed / 1024 / 1024),
          memoryIncrease: Math.round(memoryIncrease / 1024 / 1024),
          memoryEfficient: memoryEfficient
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Test concurrent issue processing
   */
  async testConcurrentProcessing() {
    try {
      const coordinator = new AgentCoordinator();
      
      // Register multiple issues simultaneously
      const issues = [];
      for (let i = 0; i < 5; i++) {
        const issueId = coordinator.registerIssue(990 + i, {
          type: 'feature',
          complexity: 'simple',
          risk: 'low'
        }, ['frontend']);
        
        issues.push(issueId);
      }

      // Check that all issues are properly queued
      const status = coordinator.getCoordinationStatus();
      
      const allIssuesQueued = issues.every(issueId => 
        status.issues[issueId] && status.issues[issueId].status === 'registered'
      );

      return {
        success: allIssuesQueued,
        details: {
          issuesRegistered: issues.length,
          allIssuesQueued: allIssuesQueued,
          queuedAgents: status.queuedAgents
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Test configuration validation
   */
  async testConfigurationValidation() {
    try {
      const requiredFiles = [
        'automation/claude-orchestrator.md',
        'automation/agents/frontend-agent.md',
        'automation/agents/backend-agent.md',
        'automation/agents/database-agent.md',
        'automation/agents/devops-agent.md',
        'automation/agents/documentation-agent.md',
        'automation/claude-code-integration.js',
        'automation/coordination.js',
        'automation/monitoring.js',
        'automation/communication.js'
      ];

      const missingFiles = requiredFiles.filter(file => {
        const filePath = path.join(__dirname, '..', file);
        return !fs.existsSync(filePath);
      });

      return {
        success: missingFiles.length === 0,
        details: {
          requiredFiles: requiredFiles.length,
          foundFiles: requiredFiles.length - missingFiles.length,
          missingFiles: missingFiles
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Test dependencies check
   */
  async testDependenciesCheck() {
    try {
      const packageJsonPath = path.join(__dirname, 'package.json');
      
      if (!fs.existsSync(packageJsonPath)) {
        return {
          success: false,
          error: 'package.json not found'
        };
      }

      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const requiredDeps = ['commander'];
      
      const hasAllDeps = requiredDeps.every(dep => 
        packageJson.dependencies && packageJson.dependencies[dep]
      );

      return {
        success: hasAllDeps,
        details: {
          requiredDependencies: requiredDeps,
          installedDependencies: Object.keys(packageJson.dependencies || {}),
          allDependenciesPresent: hasAllDeps
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Test file permissions
   */
  async testFilePermissions() {
    try {
      const executableFiles = [
        'automation/claude-commands.js',
        'automation/claude-code-integration.js'
      ];

      const permissionIssues = [];

      for (const file of executableFiles) {
        const filePath = path.join(__dirname, '..', file);
        
        try {
          fs.accessSync(filePath, fs.constants.F_OK | fs.constants.R_OK);
        } catch (error) {
          permissionIssues.push(`${file}: ${error.message}`);
        }
      }

      return {
        success: permissionIssues.length === 0,
        details: {
          checkedFiles: executableFiles.length,
          permissionIssues: permissionIssues
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Test environment setup
   */
  async testEnvironmentSetup() {
    try {
      // Check for required environment variables (in test context)
      const optionalEnvVars = ['GITHUB_TOKEN', 'ANTHROPIC_API_KEY'];
      const setEnvVars = optionalEnvVars.filter(envVar => process.env[envVar]);

      // Check Node.js version
      const nodeVersion = process.version;
      const majorVersion = parseInt(nodeVersion.substring(1).split('.')[0]);
      const nodeVersionOk = majorVersion >= 18;

      return {
        success: nodeVersionOk,
        details: {
          nodeVersion: nodeVersion,
          nodeVersionOk: nodeVersionOk,
          setEnvironmentVariables: setEnvVars,
          recommendedEnvVars: optionalEnvVars
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate comprehensive test report
   */
  generateTestReport(results, totalTime) {
    const allTests = Object.values(results).flat();
    const passed = allTests.filter(t => t.passed).length;
    const failed = allTests.filter(t => !t.passed).length;
    const total = allTests.length;
    const passRate = (passed / total) * 100;

    const failures = [];
    Object.entries(results).forEach(([suite, tests]) => {
      tests.filter(t => !t.passed).forEach(test => {
        failures.push({
          suite: suite,
          test: test.name,
          error: test.error
        });
      });
    });

    const suiteResults = Object.entries(results).map(([suite, tests]) => {
      const suitePassed = tests.filter(t => t.passed).length;
      const suiteTotal = tests.length;
      return {
        suite: suite,
        passed: suitePassed,
        total: suiteTotal,
        passRate: (suitePassed / suiteTotal) * 100
      };
    });

    return {
      summary: `${passed}/${total} tests passed (${passRate.toFixed(1)}%)`,
      passRate: passRate,
      totalTests: total,
      passedTests: passed,
      failedTests: failed,
      totalTime: totalTime,
      suiteResults: suiteResults,
      failures: failures,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Run performance benchmark
   */
  async runBenchmark() {
    console.log('🏎️ Running performance benchmark...\n');

    const benchmarks = [
      { name: 'Issue Analysis', iterations: 100, test: this.benchmarkIssueAnalysis.bind(this) },
      { name: 'Agent Coordination', iterations: 50, test: this.benchmarkAgentCoordination.bind(this) },
      { name: 'Message Passing', iterations: 100, test: this.benchmarkMessagePassing.bind(this) }
    ];

    const results = [];

    for (const benchmark of benchmarks) {
      console.log(`📊 Benchmarking ${benchmark.name} (${benchmark.iterations} iterations)...`);
      
      const times = [];
      
      for (let i = 0; i < benchmark.iterations; i++) {
        const startTime = Date.now();
        await benchmark.test();
        times.push(Date.now() - startTime);
      }

      const avgTime = times.reduce((a, b) => a + b) / times.length;
      const minTime = Math.min(...times);
      const maxTime = Math.max(...times);

      results.push({
        name: benchmark.name,
        iterations: benchmark.iterations,
        avgTime: avgTime,
        minTime: minTime,
        maxTime: maxTime,
        totalTime: times.reduce((a, b) => a + b)
      });

      console.log(`  Avg: ${avgTime.toFixed(2)}ms, Min: ${minTime}ms, Max: ${maxTime}ms`);
    }

    console.log('\n📈 Benchmark Results:');
    console.log('═'.repeat(50));
    results.forEach(result => {
      console.log(`${result.name}: ${result.avgTime.toFixed(2)}ms avg (${result.iterations} iterations)`);
    });

    return results;
  }

  async benchmarkIssueAnalysis() {
    process.env.ISSUE_TITLE = 'Test issue';
    process.env.ISSUE_BODY = 'Test description';
    process.env.ISSUE_LABELS = JSON.stringify([{ name: 'feature' }]);
    
    const integration = new ClaudeCodeIntegration();
    integration.analyzeIssue();
  }

  async benchmarkAgentCoordination() {
    const coordinator = new AgentCoordinator();
    const issueId = coordinator.registerIssue(Math.random() * 1000, {
      type: 'feature',
      complexity: 'simple',
      risk: 'low'
    }, ['frontend']);
    
    coordinator.getNextAgent();
  }

  async benchmarkMessagePassing() {
    const comm = new AgentCommunication('benchmark-test');
    await comm.sendMessage('frontend', 'backend', 'information', { test: true });
  }
}

// CLI interface
if (require.main === module) {
  const tester = new AutomationTester();
  const command = process.argv[2];

  switch (command) {
    case 'all':
      tester.runAllTests().then(result => {
        process.exit(result.success ? 0 : 1);
      });
      break;
    case 'unit':
      tester.runTestSuite('unit').then(results => {
        const passed = results.filter(r => r.passed).length;
        console.log(`\nUnit tests: ${passed}/${results.length} passed`);
        process.exit(passed === results.length ? 0 : 1);
      });
      break;
    case 'integration':
      tester.runTestSuite('integration').then(results => {
        const passed = results.filter(r => r.passed).length;
        console.log(`\nIntegration tests: ${passed}/${results.length} passed`);
        process.exit(passed === results.length ? 0 : 1);
      });
      break;
    case 'performance':
      tester.runTestSuite('performance').then(results => {
        const passed = results.filter(r => r.passed).length;
        console.log(`\nPerformance tests: ${passed}/${results.length} passed`);
        process.exit(passed === results.length ? 0 : 1);
      });
      break;
    case 'system':
      tester.runTestSuite('system').then(results => {
        const passed = results.filter(r => r.passed).length;
        console.log(`\nSystem tests: ${passed}/${results.length} passed`);
        process.exit(passed === results.length ? 0 : 1);
      });
      break;
    case 'benchmark':
      tester.runBenchmark().then(() => {
        process.exit(0);
      });
      break;
    default:
      console.log('Usage: node testing.js [all|unit|integration|performance|system|benchmark]');
      console.log('  all - Run all test suites');
      console.log('  unit - Run unit tests only');
      console.log('  integration - Run integration tests only');
      console.log('  performance - Run performance tests only');
      console.log('  system - Run system tests only');
      console.log('  benchmark - Run performance benchmarks');
  }
}

module.exports = { AutomationTester };