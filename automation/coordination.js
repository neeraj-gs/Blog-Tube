#!/usr/bin/env node

/**
 * Agent Coordination System
 * 
 * Manages agent execution order, prevents conflicts, and handles inter-agent communication.
 */

const fs = require('fs');
const path = require('path');
const { AutomationMonitor } = require('./monitoring');

class AgentCoordinator {
  constructor() {
    this.coordinator_state_file = path.join(__dirname, 'logs', 'coordination-state.json');
    this.monitor = new AutomationMonitor();
    
    // Initialize coordination state
    this.initializeCoordinationState();
  }

  /**
   * Initialize coordination state file
   */
  initializeCoordinationState() {
    if (!fs.existsSync(this.coordinator_state_file)) {
      const initialState = {
        activeIssues: {},
        agentQueue: [],
        resourceLocks: {},
        agentCommunication: {},
        lastUpdate: new Date().toISOString()
      };
      
      fs.writeFileSync(this.coordinator_state_file, JSON.stringify(initialState, null, 2));
    }
  }

  /**
   * Load coordination state
   */
  loadCoordinationState() {
    try {
      const data = fs.readFileSync(this.coordinator_state_file, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('❌ Error loading coordination state:', error.message);
      this.initializeCoordinationState();
      return this.loadCoordinationState();
    }
  }

  /**
   * Save coordination state
   */
  saveCoordinationState(state) {
    try {
      state.lastUpdate = new Date().toISOString();
      fs.writeFileSync(this.coordinator_state_file, JSON.stringify(state, null, 2));
    } catch (error) {
      console.error('❌ Error saving coordination state:', error.message);
    }
  }

  /**
   * Register an issue for processing
   */
  registerIssue(issueNumber, issueData, requiredAgents) {
    const state = this.loadCoordinationState();
    
    const issueId = `issue-${issueNumber}`;
    state.activeIssues[issueId] = {
      issueNumber,
      issueData,
      requiredAgents,
      status: 'registered',
      startTime: new Date().toISOString(),
      agentProgress: {},
      currentAgent: null,
      completedAgents: [],
      failedAgents: []
    };
    
    // Add agents to queue in optimal order
    const orderedAgents = this.determineAgentOrder(requiredAgents, issueData);
    for (const agentType of orderedAgents) {
      state.agentQueue.push({
        issueId,
        agentType,
        status: 'queued',
        queueTime: new Date().toISOString()
      });
    }
    
    this.saveCoordinationState(state);
    this.monitor.logActivity('info', 'Issue registered for coordination', {
      issueNumber,
      requiredAgents,
      orderedAgents
    });
    
    return issueId;
  }

  /**
   * Determine optimal agent execution order
   */
  determineAgentOrder(requiredAgents, issueData) {
    // Define dependency order and priorities
    const agentDependencies = {
      database: [], // Database changes first (no dependencies)
      backend: ['database'], // Backend after database
      frontend: ['backend'], // Frontend after backend
      devops: ['frontend', 'backend', 'database'], // DevOps after all code changes
      documentation: ['frontend', 'backend', 'database'] // Documentation last
    };
    
    const agentPriorities = {
      database: 1,
      backend: 2,
      frontend: 3,
      devops: 4,
      documentation: 5
    };
    
    // Filter to only required agents and sort by priority
    const orderedAgents = requiredAgents
      .filter(agent => agentPriorities[agent] !== undefined)
      .sort((a, b) => agentPriorities[a] - agentPriorities[b]);
    
    // Additional ordering based on issue type
    if (issueData.type === 'documentation') {
      // Documentation issues should prioritize documentation agent
      return ['documentation', ...orderedAgents.filter(a => a !== 'documentation')];
    }
    
    if (issueData.complexity === 'simple' && requiredAgents.length === 1) {
      // Simple single-agent issues can run immediately
      return orderedAgents;
    }
    
    // For complex issues, respect dependencies strictly
    const result = [];
    const remaining = [...orderedAgents];
    
    while (remaining.length > 0) {
      for (let i = 0; i < remaining.length; i++) {
        const agent = remaining[i];
        const dependencies = agentDependencies[agent] || [];
        
        // Check if all dependencies are satisfied
        const dependenciesSatisfied = dependencies.every(dep => 
          result.includes(dep) || !requiredAgents.includes(dep)
        );
        
        if (dependenciesSatisfied) {
          result.push(agent);
          remaining.splice(i, 1);
          break;
        }
      }
    }
    
    return result;
  }

  /**
   * Get next agent to execute
   */
  getNextAgent() {
    const state = this.loadCoordinationState();
    
    // Find first queued agent that's not blocked
    for (let i = 0; i < state.agentQueue.length; i++) {
      const queueItem = state.agentQueue[i];
      
      if (queueItem.status === 'queued') {
        const issue = state.activeIssues[queueItem.issueId];
        
        if (issue && this.canExecuteAgent(queueItem.agentType, issue)) {
          // Mark as executing
          queueItem.status = 'executing';
          queueItem.startTime = new Date().toISOString();
          issue.currentAgent = queueItem.agentType;
          issue.agentProgress[queueItem.agentType] = { status: 'executing', startTime: queueItem.startTime };
          
          this.saveCoordinationState(state);
          
          return {
            issueId: queueItem.issueId,
            issueNumber: issue.issueNumber,
            agentType: queueItem.agentType,
            issueData: issue.issueData
          };
        }
      }
    }
    
    return null; // No agents ready to execute
  }

  /**
   * Check if an agent can be executed (dependencies satisfied, no conflicts)
   */
  canExecuteAgent(agentType, issue) {
    // Check resource locks
    const state = this.loadCoordinationState();
    const resourcesNeeded = this.getAgentResources(agentType);
    
    for (const resource of resourcesNeeded) {
      if (state.resourceLocks[resource] && state.resourceLocks[resource] !== issue.issueNumber) {
        return false; // Resource is locked by another issue
      }
    }
    
    // Check agent dependencies
    const dependencies = this.getAgentDependencies(agentType);
    for (const dep of dependencies) {
      if (issue.requiredAgents.includes(dep) && !issue.completedAgents.includes(dep)) {
        return false; // Dependency not yet completed
      }
    }
    
    return true;
  }

  /**
   * Get resources required by an agent
   */
  getAgentResources(agentType) {
    const resourceMap = {
      database: ['database-schema', 'mongodb'],
      backend: ['backend-api', 'express-server'],
      frontend: ['frontend-ui', 'react-components'],
      devops: ['deployment-config', 'ci-cd'],
      documentation: ['documentation-files']
    };
    
    return resourceMap[agentType] || [];
  }

  /**
   * Get dependencies for an agent
   */
  getAgentDependencies(agentType) {
    const dependencyMap = {
      database: [],
      backend: ['database'],
      frontend: ['backend'],
      devops: ['database', 'backend', 'frontend'],
      documentation: []
    };
    
    return dependencyMap[agentType] || [];
  }

  /**
   * Acquire resource locks for an agent
   */
  acquireResourceLocks(agentType, issueNumber) {
    const state = this.loadCoordinationState();
    const resources = this.getAgentResources(agentType);
    
    for (const resource of resources) {
      state.resourceLocks[resource] = issueNumber;
    }
    
    this.saveCoordinationState(state);
    this.monitor.logActivity('info', 'Resource locks acquired', {
      agentType,
      issueNumber,
      resources
    });
  }

  /**
   * Release resource locks for an agent
   */
  releaseResourceLocks(agentType, issueNumber) {
    const state = this.loadCoordinationState();
    const resources = this.getAgentResources(agentType);
    
    for (const resource of resources) {
      if (state.resourceLocks[resource] === issueNumber) {
        delete state.resourceLocks[resource];
      }
    }
    
    this.saveCoordinationState(state);
    this.monitor.logActivity('info', 'Resource locks released', {
      agentType,
      issueNumber,
      resources
    });
  }

  /**
   * Record agent completion
   */
  recordAgentCompletion(issueId, agentType, success, result = {}) {
    const state = this.loadCoordinationState();
    const issue = state.activeIssues[issueId];
    
    if (!issue) {
      throw new Error(`Issue ${issueId} not found in coordination state`);
    }
    
    // Update issue state
    issue.currentAgent = null;
    issue.agentProgress[agentType] = {
      status: success ? 'completed' : 'failed',
      endTime: new Date().toISOString(),
      result
    };
    
    if (success) {
      issue.completedAgents.push(agentType);
    } else {
      issue.failedAgents.push(agentType);
    }
    
    // Remove from queue
    state.agentQueue = state.agentQueue.filter(item => 
      !(item.issueId === issueId && item.agentType === agentType)
    );
    
    // Release resource locks
    this.releaseResourceLocks(agentType, issue.issueNumber);
    
    // Check if issue is complete
    const remainingAgents = state.agentQueue.filter(item => item.issueId === issueId);
    if (remainingAgents.length === 0) {
      issue.status = 'completed';
      issue.endTime = new Date().toISOString();
      
      // Store communication log for the issue
      if (state.agentCommunication[issueId]) {
        issue.communicationLog = state.agentCommunication[issueId];
        delete state.agentCommunication[issueId];
      }
    }
    
    this.saveCoordinationState(state);
    this.monitor.logActivity(success ? 'success' : 'error', 'Agent completion recorded', {
      issueId,
      agentType,
      success,
      remainingAgents: remainingAgents.length
    });
    
    return {
      issueComplete: remainingAgents.length === 0,
      nextAgent: remainingAgents.length > 0 ? this.getNextAgent() : null
    };
  }

  /**
   * Add inter-agent communication
   */
  addAgentCommunication(issueId, fromAgent, toAgent, message, data = {}) {
    const state = this.loadCoordinationState();
    
    if (!state.agentCommunication[issueId]) {
      state.agentCommunication[issueId] = [];
    }
    
    state.agentCommunication[issueId].push({
      timestamp: new Date().toISOString(),
      fromAgent,
      toAgent,
      message,
      data
    });
    
    this.saveCoordinationState(state);
    this.monitor.logActivity('info', 'Agent communication recorded', {
      issueId,
      fromAgent,
      toAgent,
      message
    });
  }

  /**
   * Get agent communication for an issue
   */
  getAgentCommunication(issueId, agentType = null) {
    const state = this.loadCoordinationState();
    const communications = state.agentCommunication[issueId] || [];
    
    if (agentType) {
      return communications.filter(comm => 
        comm.toAgent === agentType || comm.fromAgent === agentType
      );
    }
    
    return communications;
  }

  /**
   * Get coordination status
   */
  getCoordinationStatus() {
    const state = this.loadCoordinationState();
    
    const activeIssues = Object.keys(state.activeIssues).length;
    const queuedAgents = state.agentQueue.filter(item => item.status === 'queued').length;
    const executingAgents = state.agentQueue.filter(item => item.status === 'executing').length;
    const resourceLocks = Object.keys(state.resourceLocks).length;
    
    return {
      activeIssues,
      queuedAgents,
      executingAgents,
      resourceLocks,
      lastUpdate: state.lastUpdate,
      issues: state.activeIssues,
      queue: state.agentQueue,
      locks: state.resourceLocks
    };
  }

  /**
   * Clean completed issues from state
   */
  cleanCompletedIssues(olderThanHours = 24) {
    const state = this.loadCoordinationState();
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - olderThanHours);
    
    let cleanedCount = 0;
    
    for (const [issueId, issue] of Object.entries(state.activeIssues)) {
      if (issue.status === 'completed' && issue.endTime) {
        const endTime = new Date(issue.endTime);
        if (endTime < cutoffTime) {
          delete state.activeIssues[issueId];
          cleanedCount++;
        }
      }
    }
    
    // Also clean old queue items
    state.agentQueue = state.agentQueue.filter(item => 
      state.activeIssues[item.issueId] !== undefined
    );
    
    if (cleanedCount > 0) {
      this.saveCoordinationState(state);
      this.monitor.logActivity('info', 'Cleaned completed issues', { cleanedCount });
    }
    
    return cleanedCount;
  }

  /**
   * Handle agent failure and determine recovery strategy
   */
  handleAgentFailure(issueId, agentType, error) {
    const state = this.loadCoordinationState();
    const issue = state.activeIssues[issueId];
    
    if (!issue) {
      throw new Error(`Issue ${issueId} not found`);
    }
    
    this.monitor.logActivity('error', 'Agent failure detected', {
      issueId,
      agentType,
      error: error.message
    });
    
    // Determine if we should retry or fail the issue
    const shouldRetry = this.shouldRetryAgent(agentType, error);
    
    if (shouldRetry) {
      // Add back to queue for retry
      state.agentQueue.push({
        issueId,
        agentType,
        status: 'queued',
        queueTime: new Date().toISOString(),
        retryAttempt: (issue.agentProgress[agentType]?.retryAttempt || 0) + 1
      });
      
      issue.agentProgress[agentType] = {
        status: 'retry',
        retryAttempt: (issue.agentProgress[agentType]?.retryAttempt || 0) + 1,
        lastError: error.message
      };
      
      this.addAgentCommunication(issueId, 'coordinator', agentType, 'Agent queued for retry', {
        retryAttempt: issue.agentProgress[agentType].retryAttempt,
        error: error.message
      });
      
    } else {
      // Mark as failed and continue with other agents
      this.recordAgentCompletion(issueId, agentType, false, { error: error.message });
    }
    
    this.saveCoordinationState(state);
    
    return shouldRetry;
  }

  /**
   * Determine if an agent should be retried after failure
   */
  shouldRetryAgent(agentType, error) {
    // Max retry attempts per agent
    const maxRetries = {
      frontend: 2,
      backend: 2,
      database: 1, // Database changes are more critical
      devops: 3,   // DevOps might have transient issues
      documentation: 2
    };
    
    const currentRetries = 0; // This should be tracked in the calling context
    
    // Don't retry if max attempts reached
    if (currentRetries >= (maxRetries[agentType] || 1)) {
      return false;
    }
    
    // Don't retry certain types of errors
    const nonRetryableErrors = [
      'syntax error',
      'invalid configuration',
      'authentication failed',
      'permission denied'
    ];
    
    const errorMessage = error.message.toLowerCase();
    for (const nonRetryable of nonRetryableErrors) {
      if (errorMessage.includes(nonRetryable)) {
        return false;
      }
    }
    
    return true;
  }
}

// CLI interface
if (require.main === module) {
  const coordinator = new AgentCoordinator();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'status':
      console.log(JSON.stringify(coordinator.getCoordinationStatus(), null, 2));
      break;
    case 'clean':
      const hours = parseInt(process.argv[3]) || 24;
      const cleaned = coordinator.cleanCompletedIssues(hours);
      console.log(`Cleaned ${cleaned} completed issues older than ${hours} hours`);
      break;
    case 'next':
      const next = coordinator.getNextAgent();
      if (next) {
        console.log(`Next agent: ${next.agentType} for issue ${next.issueNumber}`);
      } else {
        console.log('No agents ready to execute');
      }
      break;
    default:
      console.log('Usage: node coordination.js [status|clean|next]');
      console.log('  status - Show coordination system status');
      console.log('  clean [hours] - Clean completed issues older than N hours');
      console.log('  next - Get next agent ready for execution');
  }
}

module.exports = { AgentCoordinator };