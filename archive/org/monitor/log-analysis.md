---
description: Advanced Winston log analysis and monitoring for Penomo platform operations
allowed-tools: [Bash, Grep, Read]
---

# Winston Log Analysis

Advanced log analysis and monitoring for the Penomo investment platform using Winston logging framework.

## Log Analysis Workflow

### 1. Initialize Log Analysis
!echo "📋 Starting comprehensive log analysis for Penomo platform..."
!echo "Analyzing Winston logs for errors, performance issues, and security events..."

### 2. Log Directory Discovery
!echo "🔍 Discovering log files and directories..."
!echo "=== LOG DIRECTORY STRUCTURE ==="

!find . -type d -name "*log*" | head -10
!find . -name "*.log" | head -20
!ls -la logs/ 2>/dev/null || echo "Standard logs directory not found"

### 3. Recent Log File Analysis
!echo "📊 Analyzing recent log files..."
!echo "=== RECENT LOG FILES ==="

!echo "Log files modified in the last 24 hours:"
!find . -name "*.log" -mtime -1 -exec ls -la {} \; | head -10

!echo "Current log file sizes:"
!find . -name "*.log" -exec du -sh {} \; | head -10

### 4. Error Log Analysis
!echo "🚨 Analyzing error logs and exceptions..."
!echo "=== ERROR ANALYSIS ==="

!echo "Recent ERROR level logs (last 100 entries):"
!find . -name "*.log" -exec grep -h "ERROR\|Error\|error" {} \; | tail -100 | head -20

!echo "Critical errors in the last 24 hours:"
!find . -name "*.log" -mtime -1 -exec grep -l "CRITICAL\|FATAL\|Critical\|Fatal" {} \; | head -5

!echo "Exception stack traces:"
!find . -name "*.log" -exec grep -A 5 -B 2 "Exception\|Stack trace\|TypeError\|ReferenceError" {} \; | head -30

### 5. Authentication and Security Log Analysis
!echo "🔐 Analyzing authentication and security logs..."
!echo "=== SECURITY LOG ANALYSIS ==="

!echo "Failed authentication attempts:"
!find . -name "*.log" -exec grep -i "failed.*auth\|login.*failed\|authentication.*error\|unauthorized" {} \; | tail -20

!echo "Suspicious activity patterns:"
!find . -name "*.log" -exec grep -i "rate.*limit\|blocked\|suspicious\|attack\|malicious" {} \; | head -20

!echo "JWT token related logs:"
!find . -name "*.log" -exec grep -i "jwt\|token.*invalid\|token.*expired" {} \; | head -15

### 6. Database Operation Logs
!echo "🗄️ Analyzing database operation logs..."
!echo "=== DATABASE LOG ANALYSIS ==="

!echo "MongoDB connection issues:"
!find . -name "*.log" -exec grep -i "mongodb\|mongoose\|connection.*failed\|database.*error" {} \; | head -20

!echo "Slow database queries:"
!find . -name "*.log" -exec grep -i "slow.*query\|query.*time\|timeout\|connection.*pool" {} \; | head -15

!echo "Database transaction logs:"
!find . -name "*.log" -exec grep -i "transaction\|rollback\|commit.*failed" {} \; | head -10

### 7. API Request and Response Analysis
!echo "🌐 Analyzing API request and response logs..."
!echo "=== API LOG ANALYSIS ==="

!echo "High response time requests (>1000ms):"
!find . -name "*.log" -exec grep -E "[0-9]{4,}ms|[0-9]+s" {} \; | head -15

!echo "4xx HTTP status codes (client errors):"
!find . -name "*.log" -exec grep -E "40[0-9]|41[0-9]|42[0-9]|43[0-9]" {} \; | head -20

!echo "5xx HTTP status codes (server errors):"
!find . -name "*.log" -exec grep -E "50[0-9]|51[0-9]|52[0-9]|53[0-9]" {} \; | head -20

### 8. Investment Platform Specific Logs
!echo "💰 Analyzing investment platform specific logs..."
!echo "=== INVESTMENT PLATFORM LOGS ==="

!echo "Investment transaction logs:"
!find . -name "*.log" -exec grep -i "investment\|transaction\|purchase\|payment" {} \; | head -15

!echo "Project and company related logs:"
!find . -name "*.log" -exec grep -i "project\|company\|issuer\|investor" {} \; | head -15

!echo "KYC and compliance logs:"
!find . -name "*.log" -exec grep -i "kyc\|compliance\|verification\|document.*upload" {} \; | head -15

### 9. File Upload and AWS Integration Logs
!echo "📁 Analyzing file upload and AWS service logs..."
!echo "=== FILE UPLOAD & AWS LOGS ==="

!echo "S3 upload/download operations:"
!find . -name "*.log" -exec grep -i "s3\|aws\|upload\|download\|bucket" {} \; | head -15

!echo "File processing errors:"
!find . -name "*.log" -exec grep -i "file.*error\|upload.*failed\|multipart\|mime.*type" {} \; | head -15

### 10. External Service Integration Logs
!echo "🔗 Analyzing external service integration logs..."
!echo "=== EXTERNAL SERVICES LOGS ==="

!echo "Discord integration logs:"
!find . -name "*.log" -exec grep -i "discord\|bot\|webhook" {} \; | head -10

!echo "Web3Auth integration logs:"
!find . -name "*.log" -exec grep -i "web3auth\|blockchain\|wallet" {} \; | head -10

!echo "Email service (SES) logs:"
!find . -name "*.log" -exec grep -i "ses\|email\|smtp\|sendmail" {} \; | head -10

### 11. Performance and Resource Usage Logs
!echo "⚡ Analyzing performance and resource usage..."
!echo "=== PERFORMANCE LOG ANALYSIS ==="

!echo "Memory usage warnings:"
!find . -name "*.log" -exec grep -i "memory\|heap\|gc\|out.*of.*memory" {} \; | head -15

!echo "High CPU usage indicators:"
!find . -name "*.log" -exec grep -i "cpu\|load\|timeout\|blocking" {} \; | head -15

!echo "Connection pool exhaustion:"
!find . -name "*.log" -exec grep -i "pool\|connection.*limit\|max.*connections" {} \; | head -10

### 12. Background Jobs and Scheduling Logs
!echo "⏰ Analyzing background jobs and scheduled tasks..."
!echo "=== BACKGROUND JOBS LOGS ==="

!echo "Agenda.js job execution logs:"
!find . -name "*.log" -exec grep -i "agenda\|job\|scheduled\|cron" {} \; | head -15

!echo "Interest payment processing logs:"
!find . -name "*.log" -exec grep -i "interest.*payment\|quarterly\|payment.*process" {} \; | head -10

### 13. Rate Limiting and Security Logs
!echo "🚦 Analyzing rate limiting and security events..."
!echo "=== RATE LIMITING LOGS ==="

!echo "Rate limiting violations:"
!find . -name "*.log" -exec grep -i "rate.*limit\|too.*many.*requests\|429" {} \; | head -15

!echo "CORS and security header logs:"
!find . -name "*.log" -exec grep -i "cors\|origin\|csrf\|xss" {} \; | head -10

### 14. Socket.IO Real-time Communication Logs
!echo "⚡ Analyzing Socket.IO real-time communication logs..."
!echo "=== SOCKET.IO LOGS ==="

!echo "WebSocket connection logs:"
!find . -name "*.log" -exec grep -i "socket\|websocket\|connection\|disconnect" {} \; | head -15

!echo "Real-time event logs:"
!find . -name "*.log" -exec grep -i "emit\|broadcast\|room\|namespace" {} \; | head -10

### 15. Log Pattern Analysis
!echo "📈 Analyzing log patterns and trends..."
!echo "=== LOG PATTERN ANALYSIS ==="

!echo "Most frequent error messages:"
!find . -name "*.log" -exec grep -h "ERROR\|Error" {} \; | sort | uniq -c | sort -nr | head -10

!echo "Most frequent warning messages:"
!find . -name "*.log" -exec grep -h "WARN\|Warning" {} \; | sort | uniq -c | sort -nr | head -10

### 16. Time-based Log Analysis
!echo "⏰ Time-based log analysis..."
!echo "=== TEMPORAL LOG ANALYSIS ==="

!echo "Logs from the last hour:"
!find . -name "*.log" -mmin -60 -exec wc -l {} \; | head -5

!echo "Peak activity hours (most log entries):"
!find . -name "*.log" -exec grep -h "$(date +%Y-%m-%d)" {} \; | grep -o "[0-9][0-9]:[0-9][0-9]" | cut -c1-2 | sort | uniq -c | sort -nr | head -5

### 17. Winston Configuration Analysis
!echo "⚙️ Analyzing Winston logger configuration..."
!echo "=== WINSTON CONFIGURATION ==="

!echo "Winston configuration files:"
!find . -name "*.js" -exec grep -l "winston\|createLogger" {} \; | head -10

!echo "Log level configurations:"
!find . -name "*.js" -exec grep -n "level.*:" {} \; | grep -i "error\|warn\|info\|debug" | head -10

!echo "Transport configurations:"
!find . -name "*.js" -exec grep -A 3 -B 1 "transport\|Console\|File" {} \; | head -20

### 18. Log Rotation and Cleanup Analysis
!echo "🔄 Analyzing log rotation and cleanup..."
!echo "=== LOG ROTATION ANALYSIS ==="

!echo "Log rotation configuration:"
!find . -name "*.js" -exec grep -B 2 -A 2 "maxsize\|maxFiles\|datePattern" {} \; | head -15

!echo "Old log files (>7 days):"
!find . -name "*.log" -mtime +7 | head -10

!echo "Large log files (>100MB):"
!find . -name "*.log" -size +100M | head -10

## Log Analysis Recommendations

### 19. Critical Issues Summary
!echo "🚨 CRITICAL ISSUES SUMMARY"
!echo "=========================="

!CRITICAL_ERRORS=$(find . -name "*.log" -mtime -1 -exec grep -c "CRITICAL\|FATAL" {} \; | awk '{sum += $1} END {print sum+0}')
!ERROR_COUNT=$(find . -name "*.log" -mtime -1 -exec grep -c "ERROR\|Error" {} \; | awk '{sum += $1} END {print sum+0}')
!WARNING_COUNT=$(find . -name "*.log" -mtime -1 -exec grep -c "WARN\|Warning" {} \; | awk '{sum += $1} END {print sum+0}')

!echo "Last 24 hours summary:"
!echo "  Critical/Fatal errors: $CRITICAL_ERRORS"
!echo "  Total errors: $ERROR_COUNT"  
!echo "  Total warnings: $WARNING_COUNT"

### 20. Actionable Recommendations
!echo "💡 ACTIONABLE RECOMMENDATIONS"
!echo "=============================="

!if [ "$CRITICAL_ERRORS" -gt 0 ]; then
!  echo "🔴 URGENT: $CRITICAL_ERRORS critical errors require immediate attention"
!fi

!if [ "$ERROR_COUNT" -gt 100 ]; then
!  echo "🟡 HIGH: $ERROR_COUNT errors in 24h - investigate error patterns"
!fi

!echo "IMMEDIATE ACTIONS:"
!echo "1. Review and fix critical errors found in the analysis"
!echo "2. Implement log monitoring alerts for critical errors"
!echo "3. Set up log rotation if large log files detected"
!echo "4. Monitor authentication failures for security threats"
!echo "5. Optimize slow database queries found in logs"

### 21. Log Monitoring Script
!echo "📝 LOG MONITORING AUTOMATION"
!echo "============================"
!cat << 'EOF' > log-monitor.sh
#!/bin/bash
# Penomo Log Monitoring Script
# Run: ./log-monitor.sh

echo "$(date): Starting log monitoring..."

# Count errors in the last hour
RECENT_ERRORS=$(find . -name "*.log" -mmin -60 -exec grep -c "ERROR\|Error" {} \; | awk '{sum += $1} END {print sum+0}')

if [ "$RECENT_ERRORS" -gt 10 ]; then
    echo "ALERT: $RECENT_ERRORS errors in the last hour"
    # Add notification logic here (email, Slack, etc.)
fi

# Check for critical errors
CRITICAL_RECENT=$(find . -name "*.log" -mmin -60 -exec grep -c "CRITICAL\|FATAL" {} \; | awk '{sum += $1} END {print sum+0}')

if [ "$CRITICAL_RECENT" -gt 0 ]; then
    echo "CRITICAL ALERT: $CRITICAL_RECENT critical errors detected"
    # Add urgent notification logic here
fi

# Check log file sizes
find . -name "*.log" -size +500M -exec echo "WARNING: Large log file detected: {}" \;

echo "$(date): Log monitoring completed"
EOF
!chmod +x log-monitor.sh
!echo "✅ Log monitoring script created: log-monitor.sh"

### 22. Log Analysis Dashboard
!echo "📊 LOG ANALYSIS DASHBOARD SETUP"
!echo "==============================="
!echo "For comprehensive log monitoring, consider setting up:"
!echo "• ELK Stack (Elasticsearch, Logstash, Kibana)"
!echo "• Grafana with Loki for log aggregation"
!echo "• DataDog or New Relic for APM log analysis"
!echo "• Custom dashboard with key metrics:"
!echo "  - Error rates by endpoint"
!echo "  - Response time percentiles"
!echo "  - Authentication failure rates"
!echo "  - Database query performance"
!echo "  - Investment transaction success rates"

### 23. Log Retention and Compliance
!echo "📋 LOG RETENTION AND COMPLIANCE"
!echo "==============================="
!echo "For financial platform compliance:"
!echo "• Retain audit logs for 7+ years"
!echo "• Encrypt sensitive log data"
!echo "• Implement log integrity verification"
!echo "• Regular log backup to secure storage"
!echo "• Access logging for log files themselves"

!echo ""
!echo "✅ Winston log analysis completed"
!echo "📋 Review critical issues and implement monitoring automation"
!echo "🚨 Set up alerts for critical errors and performance issues"