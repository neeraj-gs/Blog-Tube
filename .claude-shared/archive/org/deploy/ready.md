---
description: Pre-deployment checklist and readiness verification
---

# Deployment Readiness Checker

Comprehensive pre-deployment verification that ensures the application is ready for production deployment by running quality checks, security audits, and configuration validation.

## Deployment Readiness Workflow

### 1. Pre-deployment Overview
!echo "🚀 Starting deployment readiness verification..."
!echo "## Deployment Readiness Report" > DEPLOY_READINESS.md
!echo "Generated on $(date)" >> DEPLOY_READINESS.md
!echo "Target Environment: Production" >> DEPLOY_READINESS.md
!echo "" >> DEPLOY_READINESS.md

### 2. Code Quality Gate
!echo "🎨 Running code quality checks..."
!echo "### Code Quality Results" >> DEPLOY_READINESS.md

!echo "Running lint and format checks..."
!/org:lint-and-format
!if [ $? -eq 0 ]; then
!  echo "✅ Code quality - PASSED" >> DEPLOY_READINESS.md
!  echo "✅ Code quality checks passed"
!  quality_passed=true
!else
!  echo "❌ Code quality - FAILED" >> DEPLOY_READINESS.md
!  echo "❌ Code quality checks failed"
!  quality_passed=false
!fi

### 3. Test Suite Execution
!echo ""
!echo "🧪 Running complete test suite..."
!echo "" >> DEPLOY_READINESS.md
!echo "### Test Suite Results" >> DEPLOY_READINESS.md

!echo "Executing test suite..."
!/org:test:run
!if [ $? -eq 0 ]; then
!  echo "✅ Test suite - PASSED" >> DEPLOY_READINESS.md
!  echo "✅ All tests passed"
!  tests_passed=true
!else
!  echo "❌ Test suite - FAILED" >> DEPLOY_READINESS.md
!  echo "❌ Test suite failed"
!  tests_passed=false
!fi

### 4. Security Audit
!echo ""
!echo "🔒 Running security audit..."
!echo "" >> DEPLOY_READINESS.md
!echo "### Security Audit Results" >> DEPLOY_READINESS.md

!echo "Performing security scan..."
!/org:security-audit
!if [ $? -eq 0 ]; then
!  echo "✅ Security audit - PASSED" >> DEPLOY_READINESS.md
!  echo "✅ Security audit passed"
!  security_passed=true
!else
!  echo "⚠️ Security audit - WARNINGS" >> DEPLOY_READINESS.md
!  echo "⚠️ Security audit has warnings"
!  security_passed=false
!fi

### 5. Application Health Check
!echo ""
!echo "🏥 Checking application health..."
!echo "" >> DEPLOY_READINESS.md
!echo "### Application Health Results" >> DEPLOY_READINESS.md

!echo "Running application health checks..."
!/org:health:app
!if [ $? -eq 0 ]; then
!  echo "✅ Application health - PASSED" >> DEPLOY_READINESS.md
!  echo "✅ Application health check passed"
!  health_passed=true
!else
!  echo "⚠️ Application health - WARNINGS" >> DEPLOY_READINESS.md
!  echo "⚠️ Application health check has warnings"
!  health_passed=false
!fi

### 6. Database Health Check
!echo ""
!echo "🗄️ Checking database connectivity..."
!echo "" >> DEPLOY_READINESS.md
!echo "### Database Health Results" >> DEPLOY_READINESS.md

!echo "Running database health checks..."
!/org:health:db
!if [ $? -eq 0 ]; then
!  echo "✅ Database health - PASSED" >> DEPLOY_READINESS.md
!  echo "✅ Database connectivity verified"
!  db_passed=true
!else
!  echo "❌ Database health - FAILED" >> DEPLOY_READINESS.md
!  echo "❌ Database connectivity issues"
!  db_passed=false
!fi

## Production Configuration Verification

### 7. Environment Configuration Check
!echo ""
!echo "⚙️ Verifying production configuration..."
!echo "" >> DEPLOY_READINESS.md
!echo "### Production Configuration" >> DEPLOY_READINESS.md

# Check NODE_ENV
!if [ "$NODE_ENV" = "production" ]; then
!  echo "✅ NODE_ENV set to production" >> DEPLOY_READINESS.md
!  echo "✅ NODE_ENV configured for production"
!  env_production=true
!else
!  echo "⚠️ NODE_ENV not set to production (current: ${NODE_ENV:-undefined})" >> DEPLOY_READINESS.md
!  echo "⚠️ NODE_ENV not set to production"
!  env_production=false
!fi

# Check critical environment variables
!echo "" >> DEPLOY_READINESS.md
!echo "Critical Environment Variables:" >> DEPLOY_READINESS.md
!critical_vars=("MONGO_URI" "SECRET_KEY" "JWT_SECRET" "API_PORT")
!missing_vars=0

!for var in "${critical_vars[@]}"; do
!  if [ ! -z "${!var}" ]; then
!    echo "✅ $var - SET" >> DEPLOY_READINESS.md
!  else
!    echo "❌ $var - MISSING" >> DEPLOY_READINESS.md
!    missing_vars=$((missing_vars + 1))
!  fi
!done

### 8. Production Dependencies Check
!echo ""
!echo "📦 Verifying production dependencies..."
!echo "" >> DEPLOY_READINESS.md
!echo "### Production Dependencies" >> DEPLOY_READINESS.md

!npm ls --production --depth=0 > /dev/null 2>&1
!if [ $? -eq 0 ]; then
!  echo "✅ All production dependencies satisfied" >> DEPLOY_READINESS.md
!  echo "✅ Production dependencies verified"
!  deps_ok=true
!else
!  echo "❌ Missing production dependencies" >> DEPLOY_READINESS.md
!  echo "❌ Missing production dependencies detected"
!  deps_ok=false
!fi

### 9. Build Verification
!echo ""
!echo "🔨 Verifying build process..."
!echo "" >> DEPLOY_READINESS.md
!echo "### Build Verification" >> DEPLOY_READINESS.md

# Check if build script exists
!if npm run build --silent > /dev/null 2>&1; then
!  echo "✅ Build process - SUCCESSFUL" >> DEPLOY_READINESS.md
!  echo "✅ Build process completed successfully"
!  build_ok=true
!elif grep -q '"build"' package.json; then
!  echo "❌ Build process - FAILED" >> DEPLOY_READINESS.md
!  echo "❌ Build process failed"
!  build_ok=false
!else
!  echo "ℹ️ No build process configured" >> DEPLOY_READINESS.md
!  echo "ℹ️ No build process configured"
!  build_ok=true
!fi

### 10. Performance Check
!echo ""
!echo "⚡ Running performance analysis..."
!echo "" >> DEPLOY_READINESS.md
!echo "### Performance Analysis" >> DEPLOY_READINESS.md

!/org:analyze:performance > /dev/null 2>&1
!if [ $? -eq 0 ]; then
!  echo "✅ Performance analysis completed" >> DEPLOY_READINESS.md
!  echo "✅ Performance analysis completed"
!  
!  # Check for performance issues
!  bundle_size=$(du -s node_modules 2>/dev/null | cut -f1)
!  if [ $bundle_size -gt 1000000 ]; then # > 1GB
!    echo "⚠️ Large bundle size detected ($(du -sh node_modules | cut -f1))" >> DEPLOY_READINESS.md
!  else
!    echo "✅ Bundle size acceptable" >> DEPLOY_READINESS.md
!  fi
!else
!  echo "⚠️ Performance analysis had issues" >> DEPLOY_READINESS.md
!  echo "⚠️ Performance analysis completed with warnings"
!fi

## Security and Compliance

### 11. Security Configuration
!echo ""
!echo "🛡️ Verifying security configuration..."
!echo "" >> DEPLOY_READINESS.md
!echo "### Security Configuration" >> DEPLOY_READINESS.md

# Check for security middleware
!security_middleware=0
!grep -r "helmet" --include="*.js" . > /dev/null 2>&1 && security_middleware=$((security_middleware + 1)) && echo "✅ Helmet middleware - CONFIGURED" >> DEPLOY_READINESS.md
!grep -r "cors" --include="*.js" . > /dev/null 2>&1 && security_middleware=$((security_middleware + 1)) && echo "✅ CORS middleware - CONFIGURED" >> DEPLOY_READINESS.md
!grep -r "rateLimit" --include="*.js" . > /dev/null 2>&1 && security_middleware=$((security_middleware + 1)) && echo "✅ Rate limiting - CONFIGURED" >> DEPLOY_READINESS.md

!if [ $security_middleware -lt 2 ]; then
!  echo "⚠️ Missing critical security middleware (found $security_middleware/3)" >> DEPLOY_READINESS.md
!fi

### 12. Secrets and Credentials Check
!echo ""
!echo "🔐 Checking for exposed secrets..."
!echo "" >> DEPLOY_READINESS.md
!echo "### Secrets Verification" >> DEPLOY_READINESS.md

!secrets_found=$(grep -r "password\|secret\|key.*=" --include="*.js" . | grep -v node_modules | grep -v ".env" | wc -l)
!if [ $secrets_found -eq 0 ]; then
!  echo "✅ No hardcoded secrets detected" >> DEPLOY_READINESS.md
!  echo "✅ No hardcoded secrets found"
!else
!  echo "⚠️ Potential hardcoded secrets detected ($secrets_found instances)" >> DEPLOY_READINESS.md
!  echo "⚠️ Potential hardcoded secrets detected"
!fi

## Deployment Readiness Score

### 13. Calculate Readiness Score
!echo ""
!echo "📊 Calculating deployment readiness score..."
!readiness_score=0
!total_checks=10

# Count passing checks
![ "$quality_passed" = true ] && readiness_score=$((readiness_score + 1))
![ "$tests_passed" = true ] && readiness_score=$((readiness_score + 1))
![ "$security_passed" = true ] && readiness_score=$((readiness_score + 1))
![ "$health_passed" = true ] && readiness_score=$((readiness_score + 1))
![ "$db_passed" = true ] && readiness_score=$((readiness_score + 1))
![ "$env_production" = true ] && readiness_score=$((readiness_score + 1))
![ $missing_vars -eq 0 ] && readiness_score=$((readiness_score + 1))
![ "$deps_ok" = true ] && readiness_score=$((readiness_score + 1))
![ "$build_ok" = true ] && readiness_score=$((readiness_score + 1))
![ $secrets_found -eq 0 ] && readiness_score=$((readiness_score + 1))

!readiness_percentage=$((readiness_score * 100 / total_checks))

!echo "" >> DEPLOY_READINESS.md
!echo "### Deployment Readiness Summary" >> DEPLOY_READINESS.md
!echo "- Readiness Score: $readiness_score/$total_checks ($readiness_percentage%)" >> DEPLOY_READINESS.md

!if [ $readiness_percentage -ge 90 ]; then
!  deployment_status="READY FOR DEPLOYMENT ✅"
!  status_color="🟢"
!elif [ $readiness_percentage -ge 75 ]; then
!  deployment_status="MOSTLY READY (minor issues) ⚠️"
!  status_color="🟡"
!else
!  deployment_status="NOT READY FOR DEPLOYMENT ❌"
!  status_color="🔴"
!fi

!echo "- Status: $deployment_status" >> DEPLOY_READINESS.md
!echo "- Timestamp: $(date)" >> DEPLOY_READINESS.md

### 14. Generate Action Items
!echo "" >> DEPLOY_READINESS.md
!echo "### Action Items Before Deployment" >> DEPLOY_READINESS.md

!if [ "$quality_passed" != true ]; then
!  echo "- [ ] Fix code quality issues (run /org:lint-and-format)" >> DEPLOY_READINESS.md
!fi

!if [ "$tests_passed" != true ]; then
!  echo "- [ ] Fix failing tests (run /org:test:run)" >> DEPLOY_READINESS.md
!fi

!if [ "$db_passed" != true ]; then
!  echo "- [ ] Resolve database connectivity issues" >> DEPLOY_READINESS.md
!fi

!if [ "$env_production" != true ]; then
!  echo "- [ ] Set NODE_ENV=production" >> DEPLOY_READINESS.md
!fi

!if [ $missing_vars -gt 0 ]; then
!  echo "- [ ] Configure missing environment variables" >> DEPLOY_READINESS.md
!fi

!if [ "$deps_ok" != true ]; then
!  echo "- [ ] Install missing production dependencies (npm install --production)" >> DEPLOY_READINESS.md
!fi

!if [ $secrets_found -gt 0 ]; then
!  echo "- [ ] Remove or secure hardcoded secrets" >> DEPLOY_READINESS.md
!fi

!if [ $security_middleware -lt 2 ]; then
!  echo "- [ ] Configure security middleware (helmet, cors, rate limiting)" >> DEPLOY_READINESS.md
!fi

## Final Report

!echo ""
!echo "✅ Deployment readiness check completed"
!echo ""
!echo "📊 Deployment Readiness Summary:"
!echo "- Overall Score: $readiness_score/$total_checks ($readiness_percentage%)"
!echo "- Status: $deployment_status $status_color"
!echo ""
!echo "📋 Detailed report saved to: DEPLOY_READINESS.md"
!echo ""

!if [ $readiness_percentage -ge 90 ]; then
!  echo "🚀 READY TO DEPLOY!"
!  echo ""
!  echo "📋 Final deployment checklist:"
!  echo "1. Commit all changes"
!  echo "2. Create release tag: git tag -a v\$(npm pkg get version --workspaces=false | tr -d '\"') -m \"Production release\""
!  echo "3. Push to production branch"
!  echo "4. Monitor deployment logs"
!  echo "5. Verify production health endpoints"
!elif [ $readiness_percentage -ge 75 ]; then
!  echo "⚠️ MOSTLY READY - Address minor issues before deployment"
!  echo "Review DEPLOY_READINESS.md for specific action items"
!else
!  echo "❌ NOT READY FOR DEPLOYMENT"
!  echo "Critical issues must be resolved before deployment"
!  echo "Review DEPLOY_READINESS.md for required fixes"
!fi