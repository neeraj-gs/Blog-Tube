#!/usr/bin/env node

/**
 * Agent Communication System
 * 
 * Provides utilities for inter-agent communication, message passing,
 * and coordination within the BlogTube automation system.
 */

const fs = require('fs');
const path = require('path');
const { AutomationMonitor } = require('./monitoring');

class AgentCommunication {
  constructor(issueId = null) {
    this.issueId = issueId;
    this.communicationDir = path.join(__dirname, 'logs', 'communication');
    this.stateDir = path.join(__dirname, 'logs', 'state');
    this.monitor = new AutomationMonitor();
    
    // Ensure directories exist
    [this.communicationDir, this.stateDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Send a message between agents
   */
  async sendMessage(fromAgent, toAgent, messageType, data, priority = 'medium') {
    const message = {
      id: this.generateMessageId(),
      type: messageType,
      from: fromAgent,
      to: toAgent,
      timestamp: new Date().toISOString(),
      issueId: this.issueId,
      data: data,
      priority: priority,
      status: 'sent'
    };

    try {
      // Write message to communication log
      await this.writeMessage(message);
      
      // Log the communication
      this.monitor.logActivity('info', 'Agent message sent', {
        from: fromAgent,
        to: toAgent,
        type: messageType,
        priority: priority
      });

      return {
        success: true,
        messageId: message.id,
        message: message
      };

    } catch (error) {
      this.monitor.logActivity('error', 'Failed to send agent message', {
        from: fromAgent,
        to: toAgent,
        error: error.message
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Receive messages for a specific agent
   */
  async receiveMessages(agentType, markAsRead = true) {
    try {
      const messages = await this.getMessagesForAgent(agentType);
      
      if (markAsRead) {
        await this.markMessagesAsRead(messages.map(m => m.id));
      }

      return {
        success: true,
        messages: messages
      };

    } catch (error) {
      this.monitor.logActivity('error', 'Failed to receive agent messages', {
        agentType: agentType,
        error: error.message
      });

      return {
        success: false,
        error: error.message,
        messages: []
      };
    }
  }

  /**
   * Broadcast a message to all agents
   */
  async broadcastMessage(fromAgent, messageType, data, priority = 'medium') {
    const agentTypes = ['frontend', 'backend', 'database', 'devops', 'documentation'];
    const results = [];

    for (const agentType of agentTypes) {
      if (agentType !== fromAgent) {
        const result = await this.sendMessage(fromAgent, agentType, messageType, data, priority);
        results.push({ agent: agentType, ...result });
      }
    }

    return {
      success: results.every(r => r.success),
      results: results
    };
  }

  /**
   * Share state between agents
   */
  async shareState(agentType, state, category = 'general') {
    const stateData = {
      agentType: agentType,
      issueId: this.issueId,
      category: category,
      timestamp: new Date().toISOString(),
      state: state
    };

    try {
      const stateFile = path.join(
        this.stateDir, 
        `${this.issueId}-${agentType}-${category}.json`
      );

      fs.writeFileSync(stateFile, JSON.stringify(stateData, null, 2));

      this.monitor.logActivity('info', 'Agent state shared', {
        agentType: agentType,
        category: category,
        issueId: this.issueId
      });

      return {
        success: true,
        stateFile: stateFile
      };

    } catch (error) {
      this.monitor.logActivity('error', 'Failed to share agent state', {
        agentType: agentType,
        error: error.message
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get shared state from another agent
   */
  async getSharedState(agentType, category = 'general') {
    try {
      const stateFile = path.join(
        this.stateDir, 
        `${this.issueId}-${agentType}-${category}.json`
      );

      if (!fs.existsSync(stateFile)) {
        return {
          success: false,
          error: 'State not found',
          state: null
        };
      }

      const stateData = JSON.parse(fs.readFileSync(stateFile, 'utf8'));

      return {
        success: true,
        state: stateData.state,
        timestamp: stateData.timestamp
      };

    } catch (error) {
      this.monitor.logActivity('error', 'Failed to get shared state', {
        agentType: agentType,
        error: error.message
      });

      return {
        success: false,
        error: error.message,
        state: null
      };
    }
  }

  /**
   * Send dependency notification
   */
  async notifyDependency(fromAgent, toAgent, requirement, status, details = {}) {
    return await this.sendMessage(fromAgent, toAgent, 'dependency', {
      requirement: requirement,
      status: status,
      details: details
    }, 'high');
  }

  /**
   * Send status update
   */
  async sendStatusUpdate(agentType, status, progress = null, message = '', details = {}) {
    return await this.sendMessage(agentType, 'coordinator', 'status', {
      status: status,
      progress: progress,
      message: message,
      details: details
    }, 'medium');
  }

  /**
   * Send error notification
   */
  async notifyError(fromAgent, error, severity = 'error', impact = [], recovery = null) {
    const toAgent = severity === 'critical' ? 'broadcast' : 'coordinator';
    
    return await this.sendMessage(fromAgent, toAgent, 'error', {
      error: error,
      severity: severity,
      impact: impact,
      recovery: recovery
    }, 'high');
  }

  /**
   * Request resource access
   */
  async requestResource(agentType, resource, duration = 600000) {
    return await this.sendMessage(agentType, 'coordinator', 'resource', {
      action: 'request',
      resource: resource,
      duration: duration
    }, 'high');
  }

  /**
   * Release resource
   */
  async releaseResource(agentType, resource) {
    return await this.sendMessage(agentType, 'coordinator', 'resource', {
      action: 'release',
      resource: resource
    }, 'medium');
  }

  /**
   * Get communication history for an issue
   */
  async getCommunicationHistory(filterAgent = null, messageType = null) {
    try {
      const messages = await this.getAllMessagesForIssue();
      
      let filteredMessages = messages;
      
      if (filterAgent) {
        filteredMessages = filteredMessages.filter(m => 
          m.from === filterAgent || m.to === filterAgent
        );
      }
      
      if (messageType) {
        filteredMessages = filteredMessages.filter(m => m.type === messageType);
      }

      return {
        success: true,
        messages: filteredMessages,
        totalMessages: messages.length,
        filteredMessages: filteredMessages.length
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        messages: []
      };
    }
  }

  /**
   * Generate unique message ID
   */
  generateMessageId() {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Write message to storage
   */
  async writeMessage(message) {
    const messageFile = path.join(
      this.communicationDir,
      `${this.issueId || 'global'}-messages.jsonl`
    );

    const messageLine = JSON.stringify(message) + '\n';
    fs.appendFileSync(messageFile, messageLine);
  }

  /**
   * Get messages for a specific agent
   */
  async getMessagesForAgent(agentType) {
    const messages = await this.getAllMessagesForIssue();
    
    return messages.filter(m => 
      m.to === agentType || m.to === 'broadcast'
    ).filter(m => 
      m.status !== 'read'
    ).sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );
  }

  /**
   * Get all messages for the current issue
   */
  async getAllMessagesForIssue() {
    const messageFile = path.join(
      this.communicationDir,
      `${this.issueId || 'global'}-messages.jsonl`
    );

    if (!fs.existsSync(messageFile)) {
      return [];
    }

    const content = fs.readFileSync(messageFile, 'utf8');
    const lines = content.trim().split('\n').filter(line => line.trim());
    
    return lines.map(line => {
      try {
        return JSON.parse(line);
      } catch (error) {
        this.monitor.logActivity('error', 'Failed to parse message line', { line, error: error.message });
        return null;
      }
    }).filter(message => message !== null);
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(messageIds) {
    const messages = await this.getAllMessagesForIssue();
    
    const updatedMessages = messages.map(message => {
      if (messageIds.includes(message.id)) {
        return { ...message, status: 'read', readAt: new Date().toISOString() };
      }
      return message;
    });

    // Rewrite the message file
    const messageFile = path.join(
      this.communicationDir,
      `${this.issueId || 'global'}-messages.jsonl`
    );

    const content = updatedMessages.map(msg => JSON.stringify(msg)).join('\n') + '\n';
    fs.writeFileSync(messageFile, content);
  }

  /**
   * Clean old messages and state files
   */
  async cleanOldCommunications(olderThanHours = 72) {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - olderThanHours);

    let cleanedCount = 0;

    try {
      // Clean communication files
      const commFiles = fs.readdirSync(this.communicationDir);
      for (const file of commFiles) {
        const filePath = path.join(this.communicationDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime < cutoffTime) {
          fs.unlinkSync(filePath);
          cleanedCount++;
        }
      }

      // Clean state files
      const stateFiles = fs.readdirSync(this.stateDir);
      for (const file of stateFiles) {
        const filePath = path.join(this.stateDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime < cutoffTime) {
          fs.unlinkSync(filePath);
          cleanedCount++;
        }
      }

      this.monitor.logActivity('info', 'Cleaned old communication files', { cleanedCount });

    } catch (error) {
      this.monitor.logActivity('error', 'Failed to clean old communications', { error: error.message });
    }

    return cleanedCount;
  }

  /**
   * Get communication statistics
   */
  async getCommunicationStats() {
    try {
      const messages = await this.getAllMessagesForIssue();
      
      const stats = {
        totalMessages: messages.length,
        messagesByType: {},
        messagesByAgent: {},
        messagesByPriority: {},
        unreadMessages: 0,
        averageResponseTime: 0
      };

      messages.forEach(message => {
        // Count by type
        stats.messagesByType[message.type] = (stats.messagesByType[message.type] || 0) + 1;
        
        // Count by agent
        stats.messagesByAgent[message.from] = (stats.messagesByAgent[message.from] || 0) + 1;
        
        // Count by priority
        stats.messagesByPriority[message.priority] = (stats.messagesByPriority[message.priority] || 0) + 1;
        
        // Count unread
        if (message.status !== 'read') {
          stats.unreadMessages++;
        }
      });

      return {
        success: true,
        stats: stats
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Helper functions for use in agent prompts
class AgentCommunicationHelper {
  constructor(agentType, issueId) {
    this.agentType = agentType;
    this.comm = new AgentCommunication(issueId);
  }

  /**
   * Create communication context for agent prompts
   */
  getPromptContext() {
    return `
COMMUNICATION SYSTEM:
You have access to inter-agent communication. Use these patterns:

1. SEND INFORMATION:
   - await communication.sendMessage('${this.agentType}', 'target_agent', 'information', {context: 'description', information: data})

2. NOTIFY DEPENDENCY:
   - await communication.notifyDependency('${this.agentType}', 'target_agent', 'requirement_name', 'needed|satisfied', details)

3. SEND STATUS:
   - await communication.sendStatusUpdate('${this.agentType}', 'in_progress|completed|failed', progress_percent, 'message')

4. REPORT ERROR:
   - await communication.notifyError('${this.agentType}', 'error_description', 'warning|error|critical', affected_agents)

5. SHARE STATE:
   - await communication.shareState('${this.agentType}', {your: 'state'}, 'category')

6. GET SHARED STATE:
   - const result = await communication.getSharedState('other_agent', 'category')

7. REQUEST RESOURCE:
   - await communication.requestResource('${this.agentType}', 'resource_name')

Remember to communicate important information to dependent agents!
`;
  }

  /**
   * Generate code snippet for agent communication
   */
  generateCommunicationCode() {
    return `
// Initialize communication system
const { AgentCommunication } = require('./communication');
const communication = new AgentCommunication('${this.comm.issueId}');

// Example usage in your agent code:
async function communicateWithOtherAgents() {
  // Send status update
  await communication.sendStatusUpdate('${this.agentType}', 'in_progress', 50, 'Working on implementation');
  
  // Check for messages from other agents
  const messages = await communication.receiveMessages('${this.agentType}');
  if (messages.success) {
    for (const message of messages.messages) {
      console.log(\`Received \${message.type} from \${message.from}: \${JSON.stringify(message.data)}\`);
    }
  }
  
  // Share completion status
  await communication.shareState('${this.agentType}', {
    status: 'completed',
    output: 'your implementation results'
  });
}
`;
  }
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2];
  const issueId = process.argv[3];
  
  const comm = new AgentCommunication(issueId);
  
  switch (command) {
    case 'stats':
      comm.getCommunicationStats().then(result => {
        if (result.success) {
          console.log(JSON.stringify(result.stats, null, 2));
        } else {
          console.error('Error:', result.error);
        }
      });
      break;
    case 'history':
      const agent = process.argv[4];
      comm.getCommunicationHistory(agent).then(result => {
        if (result.success) {
          console.log(`Communication history (${result.filteredMessages} of ${result.totalMessages} messages):`);
          result.messages.forEach(msg => {
            console.log(`[${msg.timestamp}] ${msg.from} → ${msg.to}: ${msg.type}`);
          });
        } else {
          console.error('Error:', result.error);
        }
      });
      break;
    case 'clean':
      const hours = parseInt(process.argv[4]) || 72;
      comm.cleanOldCommunications(hours).then(count => {
        console.log(`Cleaned ${count} old communication files`);
      });
      break;
    default:
      console.log('Usage: node communication.js [stats|history|clean] [issueId] [agent]');
      console.log('  stats <issueId> - Show communication statistics');
      console.log('  history <issueId> [agent] - Show communication history');
      console.log('  clean [hours] - Clean old communication files');
  }
}

module.exports = { AgentCommunication, AgentCommunicationHelper };