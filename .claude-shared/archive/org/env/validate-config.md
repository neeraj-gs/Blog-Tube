---
description: Comprehensive environment configuration validation for Penomo platform deployment
allowed-tools: [Bash, Grep, Read]
---

# Environment Configuration Validation

Comprehensive validation of environment configuration for the Penomo investment platform across development, staging, and production environments.

## Environment Configuration Validation Workflow

### 1. Initialize Configuration Validation
!echo "⚙️ Starting comprehensive environment configuration validation..."
!echo "Validating all critical configuration for Penomo investment platform..."

### 2. Environment File Detection and Structure
!echo "🔍 Detecting environment configuration files..."
!echo "=== ENVIRONMENT FILES DETECTION ==="

!find . -name ".env*" -not -path "./node_modules/*" | head -10
!find . -name "config*.js" -o -name "config*.json" | grep -v node_modules | head -10

!if [ -f ".env" ]; then
!  echo "✅ Main .env file found"
!  wc -l .env
!else
!  echo "❌ Main .env file not found"
!fi

!if [ -f ".env.example" ]; then
!  echo "✅ Example .env file found"
!else
!  echo "⚠️ .env.example file missing (recommended for documentation)"
!fi

### 3. Core Application Configuration Validation
!echo "🚀 Validating core application configuration..."
!echo "=== CORE APPLICATION CONFIG ==="

!echo "NODE_ENV validation:"
!if [ ! -z "$NODE_ENV" ]; then
!  echo "✅ NODE_ENV: $NODE_ENV"
!  case "$NODE_ENV" in
!    "production"|"staging"|"development"|"test")
!      echo "✅ Valid NODE_ENV value"
!      ;;
!    *)
!      echo "⚠️ Unusual NODE_ENV value: $NODE_ENV"
!      ;;
!  esac
!else
!  echo "❌ NODE_ENV not set (defaults to 'development')"
!fi

!echo "Port configuration:"
!PORT=${PORT:-3000}
!echo "✅ PORT: $PORT"
!if [ "$PORT" -lt 1024 ]; then
!  echo "⚠️ Port < 1024 requires root privileges"
!fi

### 4. Database Configuration Validation
!echo "🗄️ Validating database configuration..."
!echo "=== DATABASE CONFIGURATION ==="

!echo "MongoDB URI validation:"
!if [ ! -z "$MONGO_URI" ]; then
!  echo "✅ MONGO_URI configured"
!  
!  # Basic URI format validation
!  if [[ "$MONGO_URI" == mongodb://* ]] || [[ "$MONGO_URI" == mongodb+srv://* ]]; then
!    echo "✅ Valid MongoDB URI format"
!  else
!    echo "❌ Invalid MongoDB URI format"
!  fi
!  
!  # Check for authentication
!  if [[ "$MONGO_URI" == *"@"* ]]; then
!    echo "✅ Authentication credentials present"
!  else
!    echo "⚠️ No authentication credentials (may be for localhost development)"
!  fi
!  
!  # Mask sensitive parts for display
!  MASKED_URI=$(echo "$MONGO_URI" | sed 's/\/\/[^:]*:[^@]*@/\/\/***:***@/g')
!  echo "URI: $MASKED_URI"
!else
!  echo "❌ MONGO_URI not configured"
!fi

### 5. Security Configuration Validation
!echo "🔒 Validating security configuration..."
!echo "=== SECURITY CONFIGURATION ==="

!echo "JWT Secret Key validation:"
!if [ ! -z "$SECRET_KEY" ]; then
!  SECRET_LENGTH=${#SECRET_KEY}
!  echo "✅ SECRET_KEY configured (length: $SECRET_LENGTH characters)"
!  
!  if [ "$SECRET_LENGTH" -ge 64 ]; then
!    echo "✅ SECRET_KEY has strong length (≥64 chars)"
!  elif [ "$SECRET_LENGTH" -ge 32 ]; then
!    echo "⚠️ SECRET_KEY acceptable length (≥32 chars)"
!  else
!    echo "❌ SECRET_KEY too short (<32 chars) - SECURITY RISK"
!  fi
!else
!  echo "❌ SECRET_KEY not configured - CRITICAL SECURITY ISSUE"
!fi

!echo "API Keys validation:"
!if [ ! -z "$MASTER_API_KEY" ]; then
!  echo "✅ MASTER_API_KEY configured"
!else
!  echo "❌ MASTER_API_KEY not configured"
!fi

!if [ ! -z "$VERIFY_ADMIN_API_KEY" ]; then
!  echo "✅ VERIFY_ADMIN_API_KEY configured"
!else
!  echo "❌ VERIFY_ADMIN_API_KEY not configured"
!fi

### 6. AWS Services Configuration Validation
!echo "☁️ Validating AWS services configuration..."
!echo "=== AWS CONFIGURATION ==="

!echo "AWS Credentials:"
!if [ ! -z "$AWS_ACCESS_KEY_ID" ]; then
!  echo "✅ AWS_ACCESS_KEY_ID configured"
!  if [[ "$AWS_ACCESS_KEY_ID" == AKIA* ]]; then
!    echo "✅ Valid AWS access key format"
!  else
!    echo "⚠️ Unusual AWS access key format"
!  fi
!else
!  echo "❌ AWS_ACCESS_KEY_ID not configured"
!fi

!if [ ! -z "$AWS_SECRET_ACCESS_KEY" ]; then
!  echo "✅ AWS_SECRET_ACCESS_KEY configured"
!else
!  echo "❌ AWS_SECRET_ACCESS_KEY not configured"
!fi

!echo "AWS Region:"
!if [ ! -z "$AWS_REGION" ]; then
!  echo "✅ AWS_REGION: $AWS_REGION"
!  case "$AWS_REGION" in
!    "us-east-1"|"us-west-2"|"eu-west-1"|"ap-southeast-1")
!      echo "✅ Common AWS region"
!      ;;
!    *)
!      echo "ℹ️ Using AWS region: $AWS_REGION"
!      ;;
!  esac
!else
!  echo "❌ AWS_REGION not configured"
!fi

!echo "S3 Configuration:"
!if [ ! -z "$S3_BUCKET_NAME" ]; then
!  echo "✅ S3_BUCKET_NAME: $S3_BUCKET_NAME"
!else
!  echo "❌ S3_BUCKET_NAME not configured"
!fi

### 7. Authentication and Web3 Configuration
!echo "🌐 Validating authentication and Web3 configuration..."
!echo "=== AUTHENTICATION CONFIGURATION ==="

!echo "Web3Auth configuration:"
!if [ ! -z "$WEB3AUTH_JWKS" ]; then
!  echo "✅ WEB3AUTH_JWKS configured"
!  if [[ "$WEB3AUTH_JWKS" == https://* ]]; then
!    echo "✅ HTTPS URL for JWKS"
!  else
!    echo "⚠️ Non-HTTPS JWKS URL"
!  fi
!else
!  echo "⚠️ WEB3AUTH_JWKS not configured"
!fi

### 8. CORS and Security Headers Configuration
!echo "🛡️ Validating CORS and security configuration..."
!echo "=== CORS & SECURITY CONFIGURATION ==="

!echo "CORS Origins:"
!if [ ! -z "$ALLOWED_ORIGINS" ]; then
!  echo "✅ ALLOWED_ORIGINS configured"
!  echo "Origins: $ALLOWED_ORIGINS"
!  
!  # Check for wildcard in production
!  if [[ "$ALLOWED_ORIGINS" == *"*"* ]] && [[ "$NODE_ENV" == "production" ]]; then
!    echo "❌ Wildcard CORS in production - SECURITY RISK"
!  fi
!else
!  echo "❌ ALLOWED_ORIGINS not configured"
!fi

### 9. External Service Integrations Validation
!echo "🔗 Validating external service integrations..."
!echo "=== EXTERNAL SERVICES CONFIGURATION ==="

!echo "GrowthBook Feature Flags:"
!if [ ! -z "$GROWTHBOOK_API_HOST" ]; then
!  echo "✅ GROWTHBOOK_API_HOST: $GROWTHBOOK_API_HOST"
!else
!  echo "⚠️ GROWTHBOOK_API_HOST not configured (feature flags disabled)"
!fi

!echo "Discord Integration:"
!if [ ! -z "$DISCORD_BOT_TOKEN" ]; then
!  echo "✅ DISCORD_BOT_TOKEN configured"
!else
!  echo "⚠️ Discord integration not configured"
!fi

!echo "Twitter Integration:"
!if [ ! -z "$TWITTER_API_KEY" ]; then
!  echo "✅ TWITTER_API_KEY configured"
!else
!  echo "⚠️ Twitter integration not configured"
!fi

!echo "Telegram Integration:"
!if [ ! -z "$TELEGRAM_BOT_TOKEN" ]; then
!  echo "✅ TELEGRAM_BOT_TOKEN configured"
!else
!  echo "⚠️ Telegram integration not configured"
!fi

### 10. Rate Limiting Configuration
!echo "🚦 Validating rate limiting configuration..."
!echo "=== RATE LIMITING CONFIGURATION ==="

!RATE_LIMIT_WINDOW=${RATE_LIMIT_WINDOW:-15}
!RATE_LIMIT_MAX=${RATE_LIMIT_MAX:-100}
!echo "Rate limit window: $RATE_LIMIT_WINDOW minutes"
!echo "Rate limit max requests: $RATE_LIMIT_MAX"

!if [ "$RATE_LIMIT_MAX" -gt 1000 ]; then
!  echo "⚠️ Very high rate limit may not provide adequate protection"
!elif [ "$RATE_LIMIT_MAX" -lt 10 ]; then
!  echo "⚠️ Very low rate limit may affect user experience"
!else
!  echo "✅ Rate limiting configured appropriately"
!fi

### 11. Logging Configuration
!echo "📋 Validating logging configuration..."
!echo "=== LOGGING CONFIGURATION ==="

!LOG_LEVEL=${LOG_LEVEL:-info}
!echo "Log level: $LOG_LEVEL"

!case "$LOG_LEVEL" in
!  "error"|"warn"|"info"|"debug"|"trace")
!    echo "✅ Valid log level"
!    ;;
!  *)
!    echo "⚠️ Unusual log level: $LOG_LEVEL"
!    ;;
!esac

!if [ "$NODE_ENV" = "production" ] && [ "$LOG_LEVEL" = "debug" ]; then
!  echo "⚠️ Debug logging in production may impact performance"
!fi

## Environment-Specific Validations

### 12. Production Environment Validation
!echo "🚀 Production environment specific validation..."
!echo "=== PRODUCTION ENVIRONMENT CHECKS ==="

!if [ "$NODE_ENV" = "production" ]; then
!  echo "🔍 Performing production environment checks..."
!  
!  # Critical production checks
!  [ -z "$SECRET_KEY" ] && echo "❌ CRITICAL: SECRET_KEY missing in production"
!  [ -z "$MONGO_URI" ] && echo "❌ CRITICAL: MONGO_URI missing in production"
!  [ -z "$AWS_ACCESS_KEY_ID" ] && echo "❌ CRITICAL: AWS credentials missing in production"
!  
!  # Security checks for production
!  [[ "$MONGO_URI" == *"localhost"* ]] && echo "❌ Using localhost MongoDB in production"
!  [[ "$ALLOWED_ORIGINS" == *"*"* ]] && echo "❌ Wildcard CORS in production"
!  [ "$LOG_LEVEL" = "debug" ] && echo "⚠️ Debug logging in production"
!  
!  echo "✅ Production environment validation completed"
!else
!  echo "ℹ️ Not a production environment, skipping production-specific checks"
!fi

### 13. Development Environment Validation
!echo "🧪 Development environment specific validation..."
!echo "=== DEVELOPMENT ENVIRONMENT CHECKS ==="

!if [ "$NODE_ENV" = "development" ]; then
!  echo "🔍 Performing development environment checks..."
!  
!  # Development-specific recommendations
!  [[ "$MONGO_URI" != *"localhost"* ]] && echo "⚠️ Using remote database in development"
!  [ -z "$LOG_LEVEL" ] && echo "ℹ️ Consider setting LOG_LEVEL=debug for development"
!  
!  echo "✅ Development environment validation completed"
!fi

### 14. Environment Variable Completeness Check
!echo "📊 Environment variable completeness assessment..."
!echo "=== COMPLETENESS ASSESSMENT ==="

# Count configured vs required variables
!REQUIRED_VARS=("NODE_ENV" "MONGO_URI" "SECRET_KEY" "AWS_ACCESS_KEY_ID" "AWS_SECRET_ACCESS_KEY" "S3_BUCKET_NAME")
!CONFIGURED_COUNT=0
!TOTAL_REQUIRED=${#REQUIRED_VARS[@]}

!for var in "${REQUIRED_VARS[@]}"; do
!  if [ ! -z "${!var}" ]; then
!    CONFIGURED_COUNT=$((CONFIGURED_COUNT + 1))
!  fi
!done

!COMPLETENESS=$(( (CONFIGURED_COUNT * 100) / TOTAL_REQUIRED ))
!echo "Configuration completeness: $COMPLETENESS% ($CONFIGURED_COUNT/$TOTAL_REQUIRED)"

!if [ "$COMPLETENESS" -ge 90 ]; then
!  echo "✅ Excellent configuration completeness"
!elif [ "$COMPLETENESS" -ge 70 ]; then
!  echo "⚠️ Good configuration completeness"
!else
!  echo "❌ Poor configuration completeness - missing critical variables"
!fi

### 15. Security Score Assessment
!echo "🔒 Security configuration assessment..."
!echo "=== SECURITY SCORE ==="

!SECURITY_SCORE=0
!MAX_SECURITY_SCORE=10

# Security checks
![ ! -z "$SECRET_KEY" ] && [ "${#SECRET_KEY}" -ge 64 ] && SECURITY_SCORE=$((SECURITY_SCORE + 2))
![ ! -z "$MASTER_API_KEY" ] && SECURITY_SCORE=$((SECURITY_SCORE + 1))
![ ! -z "$VERIFY_ADMIN_API_KEY" ] && SECURITY_SCORE=$((SECURITY_SCORE + 1))
![[ "$MONGO_URI" == *"@"* ]] && SECURITY_SCORE=$((SECURITY_SCORE + 1))
![ ! -z "$ALLOWED_ORIGINS" ] && [[ "$ALLOWED_ORIGINS" != *"*"* ]] && SECURITY_SCORE=$((SECURITY_SCORE + 2))
![[ "$WEB3AUTH_JWKS" == https://* ]] && SECURITY_SCORE=$((SECURITY_SCORE + 1))
![ "$NODE_ENV" = "production" ] && [ "$LOG_LEVEL" != "debug" ] && SECURITY_SCORE=$((SECURITY_SCORE + 1))
![ ! -z "$AWS_ACCESS_KEY_ID" ] && [[ "$AWS_ACCESS_KEY_ID" == AKIA* ]] && SECURITY_SCORE=$((SECURITY_SCORE + 1))

!SECURITY_PERCENTAGE=$(( (SECURITY_SCORE * 100) / MAX_SECURITY_SCORE ))
!echo "Security configuration score: $SECURITY_PERCENTAGE% ($SECURITY_SCORE/$MAX_SECURITY_SCORE)"

!if [ "$SECURITY_PERCENTAGE" -ge 80 ]; then
!  echo "🟢 SECURITY: GOOD"
!elif [ "$SECURITY_PERCENTAGE" -ge 60 ]; then
!  echo "🟡 SECURITY: NEEDS IMPROVEMENT"
!else
!  echo "🔴 SECURITY: CRITICAL ISSUES"
!fi

## Configuration Recommendations and Fixes

### 16. Missing Configuration Template
!echo "📝 Missing configuration template generation..."
!echo "=== MISSING CONFIG TEMPLATE ==="

!cat << 'EOF' > missing-config-template.env
# Copy missing variables to your .env file

# Core Configuration (REQUIRED)
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/penomo-dev
SECRET_KEY=your-strong-secret-key-minimum-64-characters-long

# AWS Services (REQUIRED)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
S3_BUCKET_NAME=penomo-dev-bucket

# Authentication (REQUIRED)
MASTER_API_KEY=your-master-api-key
VERIFY_ADMIN_API_KEY=your-admin-api-key

# Security (REQUIRED)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Optional Services
WEB3AUTH_JWKS=https://api.openlogin.com/v1/jwks
GROWTHBOOK_API_HOST=https://cdn.growthbook.io
DISCORD_BOT_TOKEN=your-discord-token
TWITTER_API_KEY=your-twitter-key
TELEGRAM_BOT_TOKEN=your-telegram-token

# Performance & Monitoring
LOG_LEVEL=info
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
EOF

!echo "✅ Missing configuration template created: missing-config-template.env"

### 17. Environment Validation Script
!echo "🔧 Creating environment validation script..."
!echo "=== VALIDATION SCRIPT ==="

!cat << 'EOF' > validate-env.sh
#!/bin/bash
# Penomo Environment Validation Script
set -e

echo "🔍 Penomo Environment Validation"
echo "================================"

# Source environment file
if [ -f ".env" ]; then
    source .env
    echo "✅ .env file loaded"
else
    echo "❌ .env file not found"
    exit 1
fi

# Critical checks
ERRORS=0

[ -z "$NODE_ENV" ] && echo "❌ NODE_ENV missing" && ERRORS=$((ERRORS + 1))
[ -z "$MONGO_URI" ] && echo "❌ MONGO_URI missing" && ERRORS=$((ERRORS + 1))
[ -z "$SECRET_KEY" ] && echo "❌ SECRET_KEY missing" && ERRORS=$((ERRORS + 1))

if [ $ERRORS -eq 0 ]; then
    echo "✅ Environment validation passed"
    exit 0
else
    echo "❌ Environment validation failed with $ERRORS errors"
    exit 1
fi
EOF

!chmod +x validate-env.sh
!echo "✅ Environment validation script created: validate-env.sh"

### 18. Pre-deployment Checklist
!echo "🚀 Pre-deployment configuration checklist..."
!echo "=== PRE-DEPLOYMENT CHECKLIST ==="

!echo "Before deploying to production, ensure:"
!echo "□ All required environment variables are set"
!echo "□ SECRET_KEY is at least 64 characters long"
!echo "□ MONGO_URI uses authentication and SSL"
!echo "□ AWS credentials have minimal required permissions"
!echo "□ ALLOWED_ORIGINS doesn't include wildcards"
!echo "□ LOG_LEVEL is 'info' or 'warn' in production"
!echo "□ Rate limiting is configured appropriately"
!echo "□ External service tokens are valid and active"
!echo "□ Backup and monitoring are configured"
!echo "□ SSL/TLS certificates are valid"

### 19. Environment Migration Guide
!echo "📋 Environment migration recommendations..."
!echo "=== MIGRATION GUIDE ==="

!echo "When migrating between environments:"
!echo "1. Use environment-specific .env files (.env.dev, .env.staging, .env.prod)"
!echo "2. Never commit .env files to version control"
!echo "3. Use deployment-specific CI/CD variables"
!echo "4. Rotate secrets when migrating to production"
!echo "5. Test all external service integrations"
!echo "6. Validate database connectivity"
!echo "7. Confirm file upload and storage access"

!echo ""
!echo "✅ Environment configuration validation completed"
!echo "📋 Review recommendations and fix any critical issues"
!echo "🔧 Use validate-env.sh for automated validation"
!echo "📝 Refer to missing-config-template.env for missing variables"