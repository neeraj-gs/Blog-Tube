---
description: Verify application health endpoints and service availability
---

# Application Health Check

Comprehensive health verification for Node.js Express applications, checking health endpoints, service availability, and critical application components.

## Health Check Workflow

### 1. Health Endpoint Verification
!echo "🏥 Checking application health endpoints..."

### 2. Primary Health Endpoint
!echo "🔍 Testing primary health endpoint..."
!if curl -f -s http://localhost:3000/health > /dev/null 2>&1; then
!  echo "✅ Primary health endpoint responding"
!else
!  echo "❌ Primary health endpoint not responding"
!fi

### 3. API Health Endpoint
!echo "🔍 Testing API health endpoint..."
!if curl -f -s http://localhost:3000/api/health > /dev/null 2>&1; then
!  echo "✅ API health endpoint responding"
!else
!  echo "❌ API health endpoint not responding"
!fi

### 4. Application Process Check
!echo "⚡ Checking application process..."
!if pgrep -f "node.*app.js|node.*server.js|npm.*start" > /dev/null; then
!  echo "✅ Application process is running"
!else
!  echo "❌ Application process not detected"
!fi

### 5. Port Availability Check
!echo "🔌 Checking port availability..."
!if netstat -tuln 2>/dev/null | grep ":3000 " > /dev/null; then
!  echo "✅ Port 3000 is listening"
!else
!  echo "❌ Port 3000 not listening"
!fi

!echo "✅ Application health check completed"