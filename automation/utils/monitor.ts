import { createLogger } from './logger';
import * as fs from 'fs';
import * as path from 'path';

export interface AutomationMetrics {
  issuesProcessed: number;
  successfulImplementations: number;
  failedImplementations: number;
  averageProcessingTime: number;
  agentUsage: Record<string, number>;
  lastActivity: Date;
}

export class AutomationMonitor {
  private logger = createLogger('monitor');
  private metricsFile = path.join(__dirname, '../logs/metrics.json');

  async recordIssueProcessed(
    issueNumber: number,
    agentType: string,
    success: boolean,
    processingTimeMs: number
  ): Promise<void> {
    try {
      const metrics = await this.getMetrics();
      
      metrics.issuesProcessed++;
      metrics.agentUsage[agentType] = (metrics.agentUsage[agentType] || 0) + 1;
      metrics.lastActivity = new Date();
      
      if (success) {
        metrics.successfulImplementations++;
      } else {
        metrics.failedImplementations++;
      }
      
      // Update average processing time
      const totalTime = metrics.averageProcessingTime * (metrics.issuesProcessed - 1) + processingTimeMs;
      metrics.averageProcessingTime = totalTime / metrics.issuesProcessed;
      
      await this.saveMetrics(metrics);
      
      this.logger.info(`Recorded metrics for issue #${issueNumber}`, {
        agentType,
        success,
        processingTimeMs
      });
      
    } catch (error) {
      this.logger.error('Failed to record metrics:', error);
    }
  }

  async getMetrics(): Promise<AutomationMetrics> {
    try {
      if (fs.existsSync(this.metricsFile)) {
        const data = fs.readFileSync(this.metricsFile, 'utf-8');
        return JSON.parse(data);
      }
    } catch (error) {
      this.logger.warn('Failed to load metrics, using defaults:', error);
    }
    
    return {
      issuesProcessed: 0,
      successfulImplementations: 0,
      failedImplementations: 0,
      averageProcessingTime: 0,
      agentUsage: {},
      lastActivity: new Date()
    };
  }

  async saveMetrics(metrics: AutomationMetrics): Promise<void> {
    try {
      const dir = path.dirname(this.metricsFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(this.metricsFile, JSON.stringify(metrics, null, 2));
    } catch (error) {
      this.logger.error('Failed to save metrics:', error);
    }
  }

  async generateReport(): Promise<string> {
    const metrics = await this.getMetrics();
    const successRate = metrics.issuesProcessed > 0 
      ? (metrics.successfulImplementations / metrics.issuesProcessed * 100).toFixed(1)
      : '0';
    
    const report = `
# BlogTube Automation Report

## Summary Statistics
- **Total Issues Processed:** ${metrics.issuesProcessed}
- **Successful Implementations:** ${metrics.successfulImplementations}
- **Failed Implementations:** ${metrics.failedImplementations}
- **Success Rate:** ${successRate}%
- **Average Processing Time:** ${(metrics.averageProcessingTime / 1000 / 60).toFixed(1)} minutes
- **Last Activity:** ${metrics.lastActivity.toISOString()}

## Agent Usage
${Object.entries(metrics.agentUsage)
  .map(([agent, count]) => `- **${agent.charAt(0).toUpperCase() + agent.slice(1)} Agent:** ${count} issues`)
  .join('\n')}

## Performance Insights
${this.generateInsights(metrics)}

---
*Report generated on: ${new Date().toISOString()}*
`;
    
    return report;
  }

  private generateInsights(metrics: AutomationMetrics): string {
    const insights = [];
    
    if (metrics.issuesProcessed === 0) {
      insights.push('- No issues processed yet. The automation system is ready for its first issue!');
      return insights.join('\n');
    }
    
    const successRate = metrics.successfulImplementations / metrics.issuesProcessed;
    
    if (successRate > 0.8) {
      insights.push('- 🎉 Excellent success rate! The automation system is performing very well.');
    } else if (successRate > 0.6) {
      insights.push('- 👍 Good success rate. Consider reviewing failed cases for improvement opportunities.');
    } else {
      insights.push('- ⚠️ Low success rate. Review agent implementations and issue complexity filtering.');
    }
    
    // Most active agent
    const mostActiveAgent = Object.entries(metrics.agentUsage)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (mostActiveAgent) {
      insights.push(`- 🏆 Most active agent: ${mostActiveAgent[0]} (${mostActiveAgent[1]} issues)`);
    }
    
    // Processing time insights
    const avgMinutes = metrics.averageProcessingTime / 1000 / 60;
    if (avgMinutes < 5) {
      insights.push('- ⚡ Fast processing times! Issues are being resolved quickly.');
    } else if (avgMinutes > 15) {
      insights.push('- 🐌 Consider optimizing agent performance for faster processing.');
    }
    
    return insights.join('\n');
  }

  async exportMetrics(): Promise<string> {
    const metrics = await this.getMetrics();
    const exportData = {
      ...metrics,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    
    const exportFile = path.join(__dirname, '../logs/metrics-export.json');
    fs.writeFileSync(exportFile, JSON.stringify(exportData, null, 2));
    
    this.logger.info(`Metrics exported to: ${exportFile}`);
    return exportFile;
  }
}

// Singleton instance
export const monitor = new AutomationMonitor();