#!/usr/bin/env node

/**
 * BlogTube Automation Monitoring System
 * 
 * Monitors agent performance, tracks metrics, and provides system health insights.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class AutomationMonitor {
  constructor() {
    this.logsDir = path.join(__dirname, 'logs');
    this.metricsFile = path.join(this.logsDir, 'metrics.json');
    this.activityLog = path.join(this.logsDir, 'activity.log');
    
    // Ensure logs directory exists
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
    
    this.initializeMetrics();
  }

  /**
   * Initialize metrics file if it doesn't exist
   */
  initializeMetrics() {
    if (!fs.existsSync(this.metricsFile)) {
      const initialMetrics = {
        system: {
          startTime: new Date().toISOString(),
          totalIssuesProcessed: 0,
          totalAgentExecutions: 0,
          totalPRsCreated: 0,
          lastActivity: null
        },
        agents: {
          frontend: { executions: 0, successes: 0, failures: 0, avgDuration: 0 },
          backend: { executions: 0, successes: 0, failures: 0, avgDuration: 0 },
          database: { executions: 0, successes: 0, failures: 0, avgDuration: 0 },
          devops: { executions: 0, successes: 0, failures: 0, avgDuration: 0 },
          documentation: { executions: 0, successes: 0, failures: 0, avgDuration: 0 }
        },
        issues: {
          byType: { bug: 0, feature: 0, enhancement: 0, documentation: 0, performance: 0 },
          byComplexity: { simple: 0, moderate: 0, complex: 0 },
          byRisk: { low: 0, medium: 0, high: 0 },
          autoImplemented: 0,
          manualReview: 0
        },
        performance: {
          avgProcessingTime: 0,
          avgAgentSpawnTime: 0,
          avgPRCreationTime: 0,
          totalErrors: 0
        }
      };
      
      fs.writeFileSync(this.metricsFile, JSON.stringify(initialMetrics, null, 2));
    }
  }

  /**
   * Load current metrics from file
   */
  loadMetrics() {
    try {
      const data = fs.readFileSync(this.metricsFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('❌ Error loading metrics:', error.message);
      this.initializeMetrics();
      return this.loadMetrics();
    }
  }

  /**
   * Save metrics to file
   */
  saveMetrics(metrics) {
    try {
      fs.writeFileSync(this.metricsFile, JSON.stringify(metrics, null, 2));
    } catch (error) {
      console.error('❌ Error saving metrics:', error.message);
    }
  }

  /**
   * Log activity to file
   */
  logActivity(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data
    };
    
    const logLine = `[${timestamp}] ${level.toUpperCase()}: ${message} ${JSON.stringify(data)}\n`;
    
    try {
      fs.appendFileSync(this.activityLog, logLine);
    } catch (error) {
      console.error('❌ Error writing to activity log:', error.message);
    }
    
    // Also log to console with colors
    const colors = {
      info: '\x1b[36m',    // Cyan
      success: '\x1b[32m', // Green
      warning: '\x1b[33m', // Yellow
      error: '\x1b[31m',   // Red
      reset: '\x1b[0m'     // Reset
    };
    
    const color = colors[level] || colors.info;
    console.log(`${color}[${timestamp}] ${level.toUpperCase()}: ${message}${colors.reset}`);
  }

  /**
   * Record issue processing start
   */
  recordIssueStart(issueNumber, issueData) {
    this.logActivity('info', 'Issue processing started', {
      issueNumber,
      title: issueData.title,
      type: issueData.type,
      complexity: issueData.complexity,
      risk: issueData.risk,
      agents: issueData.agents
    });

    const metrics = this.loadMetrics();
    metrics.system.totalIssuesProcessed++;
    metrics.system.lastActivity = new Date().toISOString();
    
    // Update issue type counters
    if (issueData.type && metrics.issues.byType[issueData.type] !== undefined) {
      metrics.issues.byType[issueData.type]++;
    }
    
    // Update complexity counters
    if (issueData.complexity && metrics.issues.byComplexity[issueData.complexity] !== undefined) {
      metrics.issues.byComplexity[issueData.complexity]++;
    }
    
    // Update risk counters
    if (issueData.risk && metrics.issues.byRisk[issueData.risk] !== undefined) {
      metrics.issues.byRisk[issueData.risk]++;
    }

    this.saveMetrics(metrics);
    
    return {
      issueNumber,
      startTime: new Date(),
      issueData
    };
  }

  /**
   * Record agent execution
   */
  recordAgentExecution(agentType, success, duration, error = null) {
    this.logActivity(success ? 'success' : 'error', `Agent ${agentType} execution ${success ? 'completed' : 'failed'}`, {
      agentType,
      duration,
      error: error?.message
    });

    const metrics = this.loadMetrics();
    const agent = metrics.agents[agentType];
    
    if (agent) {
      agent.executions++;
      if (success) {
        agent.successes++;
      } else {
        agent.failures++;
        metrics.performance.totalErrors++;
      }
      
      // Update average duration
      agent.avgDuration = ((agent.avgDuration * (agent.executions - 1)) + duration) / agent.executions;
    }

    metrics.system.totalAgentExecutions++;
    this.saveMetrics(metrics);
  }

  /**
   * Record issue completion
   */
  recordIssueCompletion(issueContext, success, autoImplemented, prCreated = false) {
    const duration = new Date() - issueContext.startTime;
    
    this.logActivity(success ? 'success' : 'error', 'Issue processing completed', {
      issueNumber: issueContext.issueNumber,
      duration,
      success,
      autoImplemented,
      prCreated
    });

    const metrics = this.loadMetrics();
    
    if (autoImplemented) {
      metrics.issues.autoImplemented++;
    } else {
      metrics.issues.manualReview++;
    }
    
    if (prCreated) {
      metrics.system.totalPRsCreated++;
    }
    
    // Update average processing time
    const totalProcessed = metrics.issues.autoImplemented + metrics.issues.manualReview;
    metrics.performance.avgProcessingTime = 
      ((metrics.performance.avgProcessingTime * (totalProcessed - 1)) + duration) / totalProcessed;

    this.saveMetrics(metrics);
  }

  /**
   * Record PR creation
   */
  recordPRCreation(issueNumber, prUrl, filesChanged, success) {
    this.logActivity(success ? 'success' : 'error', 'PR creation completed', {
      issueNumber,
      prUrl,
      filesChanged,
      success
    });

    if (success) {
      const metrics = this.loadMetrics();
      metrics.system.totalPRsCreated++;
      this.saveMetrics(metrics);
    }
  }

  /**
   * Get system health status
   */
  getSystemHealth() {
    const metrics = this.loadMetrics();
    
    // Calculate agent success rates
    const agentHealths = {};
    for (const [agentType, agentMetrics] of Object.entries(metrics.agents)) {
      const successRate = agentMetrics.executions > 0 
        ? (agentMetrics.successes / agentMetrics.executions) * 100 
        : 0;
      
      agentHealths[agentType] = {
        executions: agentMetrics.executions,
        successRate: Math.round(successRate),
        avgDuration: Math.round(agentMetrics.avgDuration),
        status: this.getHealthStatus(successRate, agentMetrics.executions)
      };
    }
    
    // Calculate overall system health
    const totalExecutions = Object.values(metrics.agents).reduce((sum, agent) => sum + agent.executions, 0);
    const totalSuccesses = Object.values(metrics.agents).reduce((sum, agent) => sum + agent.successes, 0);
    const overallSuccessRate = totalExecutions > 0 ? (totalSuccesses / totalExecutions) * 100 : 0;
    
    const autoImplementationRate = (metrics.issues.autoImplemented + metrics.issues.manualReview) > 0
      ? (metrics.issues.autoImplemented / (metrics.issues.autoImplemented + metrics.issues.manualReview)) * 100
      : 0;

    return {
      system: {
        status: this.getHealthStatus(overallSuccessRate, totalExecutions),
        uptime: this.calculateUptime(metrics.system.startTime),
        lastActivity: metrics.system.lastActivity,
        totalIssuesProcessed: metrics.system.totalIssuesProcessed,
        totalAgentExecutions: metrics.system.totalAgentExecutions,
        totalPRsCreated: metrics.system.totalPRsCreated,
        overallSuccessRate: Math.round(overallSuccessRate),
        autoImplementationRate: Math.round(autoImplementationRate),
        avgProcessingTime: Math.round(metrics.performance.avgProcessingTime / 1000) // Convert to seconds
      },
      agents: agentHealths,
      issues: metrics.issues,
      performance: {
        avgProcessingTime: Math.round(metrics.performance.avgProcessingTime / 1000),
        totalErrors: metrics.performance.totalErrors
      }
    };
  }

  /**
   * Determine health status based on success rate and execution count
   */
  getHealthStatus(successRate, executions) {
    if (executions === 0) return 'unknown';
    if (successRate >= 90) return 'excellent';
    if (successRate >= 75) return 'good';
    if (successRate >= 50) return 'fair';
    return 'poor';
  }

  /**
   * Calculate system uptime
   */
  calculateUptime(startTime) {
    const start = new Date(startTime);
    const now = new Date();
    const uptimeMs = now - start;
    
    const days = Math.floor(uptimeMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((uptimeMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${days}d ${hours}h ${minutes}m`;
  }

  /**
   * Generate monitoring report
   */
  generateReport() {
    const health = this.getSystemHealth();
    
    console.log('\n📊 BlogTube Automation System Report');
    console.log('═'.repeat(50));
    
    // System Overview
    console.log('\n🖥️  System Overview:');
    console.log(`Status: ${this.getStatusEmoji(health.system.status)} ${health.system.status.toUpperCase()}`);
    console.log(`Uptime: ${health.system.uptime}`);
    console.log(`Issues Processed: ${health.system.totalIssuesProcessed}`);
    console.log(`Agent Executions: ${health.system.totalAgentExecutions}`);
    console.log(`PRs Created: ${health.system.totalPRsCreated}`);
    console.log(`Success Rate: ${health.system.overallSuccessRate}%`);
    console.log(`Auto-Implementation Rate: ${health.system.autoImplementationRate}%`);
    
    // Agent Performance
    console.log('\n🤖 Agent Performance:');
    for (const [agentType, agentHealth] of Object.entries(health.agents)) {
      console.log(`${agentType.charAt(0).toUpperCase() + agentType.slice(1)}:`);
      console.log(`  Status: ${this.getStatusEmoji(agentHealth.status)} ${agentHealth.status}`);
      console.log(`  Executions: ${agentHealth.executions}`);
      console.log(`  Success Rate: ${agentHealth.successRate}%`);
      console.log(`  Avg Duration: ${agentHealth.avgDuration}ms`);
    }
    
    // Issue Statistics
    console.log('\n📋 Issue Statistics:');
    console.log('By Type:');
    for (const [type, count] of Object.entries(health.issues.byType)) {
      console.log(`  ${type}: ${count}`);
    }
    
    console.log('By Complexity:');
    for (const [complexity, count] of Object.entries(health.issues.byComplexity)) {
      console.log(`  ${complexity}: ${count}`);
    }
    
    console.log('By Risk:');
    for (const [risk, count] of Object.entries(health.issues.byRisk)) {
      console.log(`  ${risk}: ${count}`);
    }
    
    // Performance Metrics
    console.log('\n⚡ Performance:');
    console.log(`Avg Processing Time: ${health.performance.avgProcessingTime}s`);
    console.log(`Total Errors: ${health.performance.totalErrors}`);
    
    // Recommendations
    console.log('\n💡 Recommendations:');
    this.generateRecommendations(health);
  }

  /**
   * Get status emoji for display
   */
  getStatusEmoji(status) {
    const emojis = {
      excellent: '🟢',
      good: '🟡',
      fair: '🟠',
      poor: '🔴',
      unknown: '⚪'
    };
    return emojis[status] || '⚪';
  }

  /**
   * Generate recommendations based on system health
   */
  generateRecommendations(health) {
    const recommendations = [];
    
    // System-level recommendations
    if (health.system.overallSuccessRate < 75) {
      recommendations.push('• Overall success rate is below 75%. Review failed agent executions.');
    }
    
    if (health.system.autoImplementationRate < 50) {
      recommendations.push('• Auto-implementation rate is low. Consider refining risk assessment criteria.');
    }
    
    // Agent-specific recommendations
    for (const [agentType, agentHealth] of Object.entries(health.agents)) {
      if (agentHealth.successRate < 80 && agentHealth.executions > 5) {
        recommendations.push(`• ${agentType} agent has low success rate (${agentHealth.successRate}%). Review agent documentation and prompts.`);
      }
      
      if (agentHealth.avgDuration > 30000) { // 30 seconds
        recommendations.push(`• ${agentType} agent has high average duration (${Math.round(agentHealth.avgDuration/1000)}s). Consider optimization.`);
      }
    }
    
    // Performance recommendations
    if (health.performance.avgProcessingTime > 300) { // 5 minutes
      recommendations.push('• Average processing time is high. Consider parallel agent execution.');
    }
    
    if (health.performance.totalErrors > 10) {
      recommendations.push('• High error count detected. Review system logs for common failure patterns.');
    }
    
    if (recommendations.length === 0) {
      console.log('✅ System is performing well. No immediate recommendations.');
    } else {
      recommendations.forEach(rec => console.log(rec));
    }
  }

  /**
   * Clean old log files
   */
  cleanOldLogs(daysToKeep = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      // Archive old activity logs
      if (fs.existsSync(this.activityLog)) {
        const stats = fs.statSync(this.activityLog);
        if (stats.mtime < cutoffDate) {
          const archiveName = `activity-${stats.mtime.toISOString().split('T')[0]}.log`;
          const archivePath = path.join(this.logsDir, 'archive', archiveName);
          
          // Create archive directory if it doesn't exist
          const archiveDir = path.dirname(archivePath);
          if (!fs.existsSync(archiveDir)) {
            fs.mkdirSync(archiveDir, { recursive: true });
          }
          
          fs.renameSync(this.activityLog, archivePath);
          console.log(`📦 Archived old activity log to ${archiveName}`);
        }
      }
      
    } catch (error) {
      console.error('❌ Error cleaning old logs:', error.message);
    }
  }

  /**
   * Export metrics to CSV for external analysis
   */
  exportMetricsToCSV() {
    try {
      const metrics = this.loadMetrics();
      const csvPath = path.join(this.logsDir, `metrics-export-${new Date().toISOString().split('T')[0]}.csv`);
      
      let csv = 'Agent,Executions,Successes,Failures,Success Rate,Avg Duration\n';
      
      for (const [agentType, agentMetrics] of Object.entries(metrics.agents)) {
        const successRate = agentMetrics.executions > 0 
          ? (agentMetrics.successes / agentMetrics.executions) * 100 
          : 0;
        
        csv += `${agentType},${agentMetrics.executions},${agentMetrics.successes},${agentMetrics.failures},${successRate.toFixed(2)},${agentMetrics.avgDuration.toFixed(2)}\n`;
      }
      
      fs.writeFileSync(csvPath, csv);
      console.log(`📊 Metrics exported to ${csvPath}`);
      
    } catch (error) {
      console.error('❌ Error exporting metrics:', error.message);
    }
  }
}

// CLI interface
if (require.main === module) {
  const monitor = new AutomationMonitor();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'report':
      monitor.generateReport();
      break;
    case 'health':
      console.log(JSON.stringify(monitor.getSystemHealth(), null, 2));
      break;
    case 'clean':
      const days = parseInt(process.argv[3]) || 30;
      monitor.cleanOldLogs(days);
      break;
    case 'export':
      monitor.exportMetricsToCSV();
      break;
    default:
      console.log('Usage: node monitoring.js [report|health|clean|export]');
      console.log('  report - Generate detailed system report');
      console.log('  health - Show system health JSON');
      console.log('  clean [days] - Clean logs older than N days (default: 30)');
      console.log('  export - Export metrics to CSV');
  }
}

module.exports = { AutomationMonitor };