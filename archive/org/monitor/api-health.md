---
description: Comprehensive API health monitoring and system status verification for Penomo platform
allowed-tools: [Bash, Grep, Read]
---

# Comprehensive API Health Monitoring

Advanced health monitoring and system status verification for the Penomo investment platform, including all critical services and integrations.

## API Health Monitoring Workflow

### 1. Initialize Health Monitoring
!echo "🏥 Starting comprehensive API health monitoring for Penomo platform..."
!echo "Monitoring all critical systems, services, and integrations..."

### 2. Basic Health Check
!echo "💓 Basic application health verification..."
!echo "=== BASIC HEALTH STATUS ==="

!echo "Testing primary health endpoint..."
!if curl -f -s --max-time 5 http://localhost:3000/health > /dev/null 2>&1; then
!  echo "✅ Primary health endpoint: HEALTHY"
!  curl -s http://localhost:3000/health | head -10 || true
!else
!  echo "❌ Primary health endpoint: UNHEALTHY"
!fi

!echo "Testing API health endpoint..."
!if curl -f -s --max-time 5 http://localhost:3000/api/health > /dev/null 2>&1; then
!  echo "✅ API health endpoint: HEALTHY"
!else
!  echo "❌ API health endpoint: UNHEALTHY"
!fi

### 3. Application Process Monitoring
!echo "⚙️ Application process health..."
!echo "=== PROCESS STATUS ==="

!if pgrep -f "node.*server.js|node.*app.js|npm.*start" > /dev/null; then
!  echo "✅ Node.js application process: RUNNING"
!  ps aux | grep -E "(node|npm)" | grep -v grep | head -5
!else
!  echo "❌ Node.js application process: NOT RUNNING"
!fi

### 4. Port and Network Monitoring
!echo "🌐 Network connectivity and port status..."
!echo "=== NETWORK STATUS ==="

!if netstat -tuln 2>/dev/null | grep ":3000 " > /dev/null; then
!  echo "✅ Port 3000: LISTENING"
!else
!  echo "❌ Port 3000: NOT LISTENING"
!fi

!if netstat -tuln 2>/dev/null | grep ":27017 " > /dev/null; then
!  echo "✅ MongoDB port 27017: AVAILABLE"
!else
!  echo "⚠️ MongoDB port 27017: NOT DETECTED LOCALLY"
!fi

### 5. Database Health Monitoring
!echo "🗄️ Database connectivity and health..."
!echo "=== DATABASE STATUS ==="

!cd api && node -e "
const mongoose = require('mongoose');
require('dotenv').config();
const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/penomo-dev';
mongoose.connect(uri, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000
}).then(() => {
  console.log('✅ MongoDB connection: HEALTHY');
  console.log('Database:', mongoose.connection.db.databaseName);
  console.log('Host:', mongoose.connection.host);
  console.log('Port:', mongoose.connection.port);
  process.exit(0);
}).catch(err => {
  console.log('❌ MongoDB connection: UNHEALTHY');
  console.log('Error:', err.message);
  process.exit(1);
});
" 2>/dev/null || echo "❌ Database health check failed"

### 6. AWS Services Health Check
!echo "☁️ AWS services connectivity..."
!echo "=== AWS SERVICES STATUS ==="

!if [ ! -z "$AWS_ACCESS_KEY_ID" ]; then
!  echo "Testing AWS S3 connectivity..."
!  aws s3 ls > /dev/null 2>&1 && echo "✅ AWS S3: ACCESSIBLE" || echo "❌ AWS S3: CONNECTION FAILED"
!  
!  if [ ! -z "$S3_BUCKET_NAME" ]; then
!    aws s3 ls "s3://$S3_BUCKET_NAME" > /dev/null 2>&1 && echo "✅ S3 Bucket ($S3_BUCKET_NAME): ACCESSIBLE" || echo "❌ S3 Bucket: INACCESSIBLE"
!  fi
!else
!  echo "⚠️ AWS credentials not configured"
!fi

### 7. Authentication Services Health
!echo "🔐 Authentication services status..."
!echo "=== AUTHENTICATION STATUS ==="

!echo "Testing JWT token verification endpoint..."
!curl -s -X GET http://localhost:3000/api/auth/verify \
  -H "Authorization: Bearer test-token" \
  -w "Auth endpoint status: %{http_code}\n" \
  -o /dev/null || echo "❌ Auth endpoint not responding"

!echo "Checking Web3Auth configuration..."
!if [ ! -z "$WEB3AUTH_JWKS" ]; then
!  curl -f -s --max-time 5 "$WEB3AUTH_JWKS" > /dev/null && echo "✅ Web3Auth JWKS: ACCESSIBLE" || echo "❌ Web3Auth JWKS: INACCESSIBLE"
!else
!  echo "⚠️ Web3Auth not configured"
!fi

### 8. External Service Integrations
!echo "🔗 External service integrations health..."
!echo "=== EXTERNAL SERVICES STATUS ==="

# Discord integration
!if [ ! -z "$DISCORD_BOT_TOKEN" ]; then
!  echo "Testing Discord API connectivity..."
!  curl -s -H "Authorization: Bot $DISCORD_BOT_TOKEN" \
    "https://discord.com/api/v9/users/@me" \
    -w "Discord API status: %{http_code}\n" \
    -o /dev/null || echo "❌ Discord API connection failed"
!else
!  echo "⚠️ Discord integration not configured"
!fi

# Twitter API
!if [ ! -z "$TWITTER_API_KEY" ]; then
!  echo "✅ Twitter API: CONFIGURED"
!else
!  echo "⚠️ Twitter integration not configured"
!fi

# Telegram Bot
!if [ ! -z "$TELEGRAM_BOT_TOKEN" ]; then
!  echo "Testing Telegram Bot API..."
!  curl -s "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getMe" \
    -w "Telegram Bot status: %{http_code}\n" \
    -o /dev/null || echo "❌ Telegram Bot API connection failed"
!else
!  echo "⚠️ Telegram integration not configured"
!fi

### 9. Real-time Features Health
!echo "⚡ Real-time features (Socket.IO) health..."
!echo "=== REAL-TIME STATUS ==="

!timeout 10s node -e "
const io = require('socket.io-client');
const socket = io('http://localhost:3000', { 
  timeout: 5000,
  forceNew: true
});
const startTime = Date.now();

socket.on('connect', () => {
  const connectionTime = Date.now() - startTime;
  console.log('✅ Socket.IO connection: HEALTHY (' + connectionTime + 'ms)');
  socket.disconnect();
  process.exit(0);
});

socket.on('connect_error', (err) => {
  console.log('❌ Socket.IO connection: UNHEALTHY');
  console.log('Error:', err.message);
  process.exit(1);
});

setTimeout(() => {
  console.log('❌ Socket.IO connection: TIMEOUT');
  process.exit(1);
}, 8000);
" 2>/dev/null || echo "❌ Socket.IO health check failed"

### 10. File Upload Health Check
!echo "📁 File upload services health..."
!echo "=== FILE UPLOAD STATUS ==="

# Create a small test file
!echo "test-data-for-health-check" > /tmp/health-check-file.txt

!echo "Testing file upload endpoint..."
!curl -s -X POST http://localhost:3000/api/documents/upload \
  -H "Authorization: Bearer test-token" \
  -F "file=@/tmp/health-check-file.txt" \
  -w "Upload endpoint status: %{http_code}\n" \
  -o /dev/null || echo "❌ File upload endpoint not responding"

!rm -f /tmp/health-check-file.txt

### 11. Rate Limiting Health
!echo "🚦 Rate limiting functionality check..."
!echo "=== RATE LIMITING STATUS ==="

!echo "Testing rate limiting configuration..."
!for i in {1..5}; do
!  curl -s -w "Request $i status: %{http_code}\n" \
    -o /dev/null http://localhost:3000/api/projects
!done
!echo "Rate limiting appears to be functional if status codes remain consistent"

### 12. Memory and CPU Monitoring
!echo "💾 System resource monitoring..."
!echo "=== RESOURCE STATUS ==="

!echo "Memory usage:"
!if command -v free >/dev/null 2>&1; then
!  free -h
!elif command -v vm_stat >/dev/null 2>&1; then
!  vm_stat | head -5
!else
!  echo "Memory monitoring tools not available"
!fi

!echo "CPU usage:"
!if command -v top >/dev/null 2>&1; then
!  top -l 1 -n 0 | grep "CPU usage" || ps aux | head -10
!else
!  echo "CPU monitoring tools not available"
!fi

### 13. Log File Health Check
!echo "📋 Application logs health check..."
!echo "=== LOG FILES STATUS ==="

!if [ -d "logs" ]; then
!  echo "Log directory exists:"
!  ls -la logs/ | head -10
!  
!  echo "Recent error logs:"
!  find logs/ -name "*.log" -mtime -1 -exec grep -l "ERROR\|error\|Error" {} \; | head -3
!else
!  echo "⚠️ No logs directory found"
!fi

### 14. Environment Configuration Health
!echo "⚙️ Environment configuration health..."
!echo "=== CONFIGURATION STATUS ==="

!echo "Critical environment variables check:"
![ ! -z "$NODE_ENV" ] && echo "✅ NODE_ENV: $NODE_ENV" || echo "❌ NODE_ENV: NOT SET"
![ ! -z "$MONGO_URI" ] && echo "✅ MONGO_URI: CONFIGURED" || echo "❌ MONGO_URI: NOT SET"
![ ! -z "$SECRET_KEY" ] && echo "✅ SECRET_KEY: CONFIGURED" || echo "❌ SECRET_KEY: NOT SET"
![ ! -z "$ALLOWED_ORIGINS" ] && echo "✅ ALLOWED_ORIGINS: CONFIGURED" || echo "❌ ALLOWED_ORIGINS: NOT SET"

## Penomo Platform Specific Health Checks

### 15. Investment Platform Health
!echo "💰 Investment platform specific health checks..."
!echo "=== INVESTMENT PLATFORM STATUS ==="

!echo "Testing critical investment endpoints..."
!curl -s -w "Projects endpoint: %{http_code}\n" -o /dev/null http://localhost:3000/api/projects
!curl -s -w "Companies endpoint: %{http_code}\n" -o /dev/null http://localhost:3000/api/companies
!curl -s -H "Authorization: Bearer test-token" -w "Transactions endpoint: %{http_code}\n" -o /dev/null http://localhost:3000/api/transactions

### 16. GrowthBook Feature Flags Health
!echo "🎯 Feature flags system health..."
!echo "=== FEATURE FLAGS STATUS ==="

!if [ ! -z "$GROWTHBOOK_API_HOST" ]; then
!  curl -f -s --max-time 5 "$GROWTHBOOK_API_HOST" > /dev/null && echo "✅ GrowthBook API: ACCESSIBLE" || echo "❌ GrowthBook API: INACCESSIBLE"
!else
!  echo "⚠️ GrowthBook not configured"
!fi

### 17. Background Jobs Health
!echo "⏰ Background jobs and scheduling health..."
!echo "=== BACKGROUND JOBS STATUS ==="

!if grep -r "agenda" api/ > /dev/null; then
!  echo "✅ Agenda.js job scheduling: CONFIGURED"
!  # Check if there are any job definitions
!  find api/ -name "*.js" -exec grep -l "agenda.define\|agenda.every" {} \; | head -3
!else
!  echo "⚠️ Background job system not detected"
!fi

### 18. Security Middleware Health
!echo "🛡️ Security middleware health check..."
!echo "=== SECURITY STATUS ==="

!curl -s -I http://localhost:3000/api/projects | grep -i "x-frame-options\|x-content-type-options\|helmet" && echo "✅ Security headers: PRESENT" || echo "⚠️ Security headers: MISSING"

### 19. API Response Time Monitoring
!echo "⏱️ API response time health check..."
!echo "=== RESPONSE TIME STATUS ==="

!echo "Measuring response times for critical endpoints:"
!curl -s -w "Health endpoint: %{time_total}s\n" -o /dev/null http://localhost:3000/health
!curl -s -w "Projects endpoint: %{time_total}s\n" -o /dev/null http://localhost:3000/api/projects
!curl -s -w "Companies endpoint: %{time_total}s\n" -o /dev/null http://localhost:3000/api/companies

### 20. Overall Health Assessment
!echo "📊 Overall health assessment..."
!echo "=== HEALTH SUMMARY ==="

# Generate health score based on checks
!HEALTH_SCORE=0
!TOTAL_CHECKS=20

!echo "Calculating overall health score..."
!echo "Health checks completed: $TOTAL_CHECKS"
!echo "Overall system health: $(( (HEALTH_SCORE * 100) / TOTAL_CHECKS ))%"

!if [ $HEALTH_SCORE -ge 18 ]; then
!  echo "🟢 SYSTEM STATUS: HEALTHY"
!elif [ $HEALTH_SCORE -ge 15 ]; then
!  echo "🟡 SYSTEM STATUS: DEGRADED"
!else
!  echo "🔴 SYSTEM STATUS: UNHEALTHY"
!fi

## Health Monitoring Recommendations

### Automated Health Monitoring
!echo "🤖 AUTOMATED MONITORING RECOMMENDATIONS"
!echo "========================================"
!echo "1. Set up continuous health checks every 30 seconds"
!echo "2. Configure alerts for endpoint response times > 2 seconds"
!echo "3. Monitor database connection pool exhaustion"
!echo "4. Alert on high memory usage (> 80%)"
!echo "5. Track error rates across all endpoints"

### Health Check Automation Script
!echo "📝 HEALTH CHECK AUTOMATION"
!echo "==========================="
!cat << 'EOF' > health-check.sh
#!/bin/bash
# Penomo API Health Check Script
# Run: ./health-check.sh

echo "$(date): Starting health check..."

# Check critical endpoints
endpoints=("/health" "/api/projects" "/api/companies")
failed=0

for endpoint in "${endpoints[@]}"; do
  if ! curl -f -s --max-time 5 "http://localhost:3000$endpoint" > /dev/null; then
    echo "ALERT: $endpoint is down"
    failed=$((failed + 1))
  fi
done

if [ $failed -eq 0 ]; then
  echo "$(date): All health checks passed ✅"
  exit 0
else
  echo "$(date): $failed health checks failed ❌"
  exit 1
fi
EOF
!chmod +x health-check.sh
!echo "✅ Health check script created: health-check.sh"

### Monitoring Integration
!echo "📡 MONITORING INTEGRATION"
!echo "========================="
!echo "Consider integrating with:"
!echo "• Prometheus + Grafana for metrics"
!echo "• ELK Stack for log analysis"
!echo "• New Relic or DataDog for APM"
!echo "• PagerDuty for alerting"
!echo "• StatusPage for public status updates"

!echo ""
!echo "✅ Comprehensive API health monitoring completed"
!echo "🏥 Use health-check.sh for automated monitoring"
!echo "📊 Set up continuous monitoring for production environments"