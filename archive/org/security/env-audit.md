---
description: Environment variable security validation and configuration audit
allowed-tools: [Bash, Grep, Read]
---

# Environment Security Audit

Comprehensive security validation of environment variables and configuration for the Penomo investment platform.

## Environment Security Workflow

### 1. Environment File Detection
!echo "🔍 Detecting environment configuration files..."
!find . -name ".env*" -not -path "./node_modules/*" | head -10

### 2. Required Environment Variables Check
!echo "📋 Checking for required Penomo environment variables..."
!echo "=== CORE CONFIGURATION ==="
!grep -q "MONGO_URI" .env* && echo "✅ MONGO_URI configured" || echo "❌ MONGO_URI missing"
!grep -q "SECRET_KEY" .env* && echo "✅ SECRET_KEY configured" || echo "❌ SECRET_KEY missing"  
!grep -q "NODE_ENV" .env* && echo "✅ NODE_ENV configured" || echo "❌ NODE_ENV missing"

### 3. AWS Services Configuration
!echo "=== AWS SERVICES ==="
!grep -q "AWS_ACCESS_KEY_ID" .env* && echo "✅ AWS_ACCESS_KEY_ID configured" || echo "❌ AWS credentials missing"
!grep -q "AWS_SECRET_ACCESS_KEY" .env* && echo "✅ AWS_SECRET_ACCESS_KEY configured" || echo "❌ AWS credentials missing"
!grep -q "AWS_REGION" .env* && echo "✅ AWS_REGION configured" || echo "❌ AWS_REGION missing"
!grep -q "S3_BUCKET_NAME" .env* && echo "✅ S3_BUCKET_NAME configured" || echo "❌ S3_BUCKET_NAME missing"

### 4. Authentication & API Keys
!echo "=== AUTHENTICATION ==="
!grep -q "MASTER_API_KEY" .env* && echo "✅ MASTER_API_KEY configured" || echo "❌ MASTER_API_KEY missing"
!grep -q "VERIFY_ADMIN_API_KEY" .env* && echo "✅ VERIFY_ADMIN_API_KEY configured" || echo "❌ VERIFY_ADMIN_API_KEY missing"
!grep -q "WEB3AUTH_JWKS" .env* && echo "✅ WEB3AUTH_JWKS configured" || echo "❌ WEB3AUTH_JWKS missing"

### 5. External Service Integrations
!echo "=== EXTERNAL SERVICES ==="
!grep -q "DISCORD_" .env* && echo "✅ Discord integration configured" || echo "⚠️ Discord integration not configured"
!grep -q "TWITTER_" .env* && echo "✅ Twitter integration configured" || echo "⚠️ Twitter integration not configured"
!grep -q "TELEGRAM_" .env* && echo "✅ Telegram integration configured" || echo "⚠️ Telegram integration not configured"

### 6. Security Configuration Validation
!echo "🔐 Validating security configurations..."
!echo "=== CORS & SECURITY ==="
!grep -q "ALLOWED_ORIGINS" .env* && echo "✅ ALLOWED_ORIGINS configured" || echo "❌ CORS origins not configured"
!grep -q "RATE_LIMIT" .env* && echo "✅ Rate limiting configured" || echo "⚠️ Rate limiting not explicitly configured"

### 7. Database Security
!echo "=== DATABASE SECURITY ==="
!if grep "MONGO_URI.*localhost" .env* > /dev/null; then
!  echo "⚠️ Using localhost MongoDB (development mode)"
!else
!  echo "✅ Using external MongoDB (production mode)"
!fi

### 8. Secret Strength Validation
!echo "🔒 Validating secret strength..."
!SECRET_LENGTH=$(grep "SECRET_KEY" .env* | cut -d'=' -f2 | wc -c)
!if [ "$SECRET_LENGTH" -gt 32 ]; then
!  echo "✅ SECRET_KEY has adequate length"
!else
!  echo "❌ SECRET_KEY too short (should be >32 characters)"
!fi

### 9. Production Environment Checks
!echo "🚀 Production environment validation..."
!if grep -q "NODE_ENV=production" .env*; then
!  echo "✅ Production mode detected"
!  echo "🔍 Performing additional production checks..."
!  grep -q "DEBUG" .env* && echo "⚠️ Debug mode may be enabled in production" || echo "✅ Debug mode disabled"
!else
!  echo "ℹ️ Development/test environment detected"
!fi

### 10. Environment Variable Exposure Check
!echo "🕵️ Checking for environment variable exposure..."
!grep -r "process\.env" --include="*.js" . | grep -v node_modules | grep -v ".env" | head -5
!echo "⚠️ Verify no sensitive env vars are logged or exposed"

## Penomo Platform Specific Checks

### GrowthBook Feature Flags
!echo "🎯 Checking feature flag configuration..."
!grep -q "GROWTHBOOK" .env* && echo "✅ GrowthBook configured" || echo "⚠️ GrowthBook not configured"

### Socket.IO Configuration
!echo "⚡ Checking real-time communication setup..."
!grep -q "SOCKET" .env* && echo "✅ Socket.IO configured" || echo "ℹ️ Socket.IO using defaults"

### File Upload Security
!echo "📁 Checking file upload security..."
!grep -q "MAX_FILE_SIZE" .env* && echo "✅ File size limits configured" || echo "⚠️ File size limits not explicitly set"

## Security Recommendations

### Immediate Actions Required
1. **Rotate Secrets**: If any secrets are weak or exposed
2. **Enable HTTPS**: Ensure all URLs use HTTPS in production
3. **Database Auth**: Verify MongoDB connection uses authentication
4. **API Rate Limits**: Configure appropriate rate limiting
5. **CORS Origins**: Restrict to specific domains in production

### Best Practices
- Use strong, unique secrets (>64 characters)
- Separate environment files for dev/staging/prod
- Never commit .env files to version control
- Use environment-specific service accounts
- Implement secret rotation strategy
- Monitor for environment variable changes

### Penomo Financial Platform Considerations
- **PCI Compliance**: If handling payment data
- **Data Privacy**: GDPR/CCPA compliance for user data
- **Audit Logging**: Ensure sensitive operations are logged
- **Backup Security**: Encrypt backup storage
- **API Security**: Strong authentication for financial APIs

## Environment File Template

Missing critical environment variables? Use this template:

```bash
# Core Configuration
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/penomo-dev
SECRET_KEY=your-strong-secret-key-minimum-64-characters-long

# AWS Services
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
S3_BUCKET_NAME=penomo-dev-bucket

# Authentication
MASTER_API_KEY=your-master-api-key
VERIFY_ADMIN_API_KEY=your-admin-api-key
WEB3AUTH_JWKS=your-web3auth-jwks-url

# Security
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# External Services (optional)
GROWTHBOOK_API_HOST=https://cdn.growthbook.io
DISCORD_BOT_TOKEN=your-discord-token
TWITTER_API_KEY=your-twitter-key
TELEGRAM_BOT_TOKEN=your-telegram-token
```

!echo "✅ Environment security audit completed"