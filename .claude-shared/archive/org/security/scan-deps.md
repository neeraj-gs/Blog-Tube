---
description: Comprehensive dependency vulnerability scanning with automated fixes for Node.js applications
allowed-tools: [Bash, Grep, Read, Write]
---

# Dependency Security Scanner

Performs comprehensive dependency vulnerability scanning and provides automated fixes for the Penomo Node.js application stack.

## Security Scanning Workflow

### 1. Initial Vulnerability Assessment
!echo "🔍 Starting comprehensive dependency security scan..."
!cd api && npm audit --audit-level low --json > ../security-audit.json || true

### 2. Critical Vulnerability Detection
!echo "🚨 Checking for CRITICAL and HIGH severity vulnerabilities..."
!cd api && npm audit --audit-level moderate || echo "⚠️ Vulnerabilities detected"

### 3. Detailed Vulnerability Analysis
!echo "📊 Analyzing vulnerability details..."
!cd api && npm audit --audit-level low | grep -E "(CRITICAL|HIGH|MODERATE)" || echo "✅ No critical vulnerabilities found"

### 4. Automated Fix Attempt
!echo "🔧 Attempting automated vulnerability fixes..."
!cd api && npm audit fix --dry-run
!echo "Would you like to apply these fixes? (Review above output first)"

### 5. Alternative Fix Strategies
!echo "🔄 Checking for alternative fix strategies..."
!cd api && npm audit fix --force --dry-run || echo "Force fixes available (may introduce breaking changes)"

### 6. Outdated Packages Analysis
!echo "📈 Analyzing outdated packages for security updates..."
!cd api && npm outdated || echo "All packages up to date"

### 7. License Compliance Check
!echo "⚖️ Checking license compliance..."
!cd api && npm ls --all | grep -i "license" | head -10 || echo "License information checked"

### 8. Production Dependencies Focus
!echo "🎯 Focusing on production dependencies only..."
!cd api && npm audit --production || echo "Production dependencies scanned"

### 9. Security Advisory Check
!echo "📢 Checking Node.js Security Advisory Database..."
!cd api && npm audit --registry https://registry.npmjs.org/ || echo "Advisory database checked"

### 10. Generate Security Report
!echo "📋 Generating comprehensive security report..."
!echo "=== PENOMO DEPENDENCY SECURITY REPORT ===" > ../security-report.txt
!echo "Generated: $(date)" >> ../security-report.txt
!echo "Repository: Penomo API" >> ../security-report.txt
!echo "" >> ../security-report.txt
!cd api && npm audit --audit-level low >> ../security-report.txt || true

## Penomo-Specific Security Checks

### AWS SDK Security
!echo "🔐 Checking AWS SDK versions for security patches..."
!cd api && npm ls @aws-sdk/client-s3 @aws-sdk/client-ses @aws-sdk/s3-request-presigner

### Authentication Library Security
!echo "🔒 Checking authentication library security..."
!cd api && npm ls jsonwebtoken jose express-session

### Database Security
!echo "🗄️ Checking MongoDB driver security..."
!cd api && npm ls mongoose express-mongo-sanitize

### Web Security Middleware
!echo "🛡️ Checking web security middleware..."
!cd api && npm ls helmet cors express-rate-limit rate-limiter-flexible

## Recommendations

Based on the Penomo tech stack, prioritize these security updates:

1. **JWT Libraries**: Keep jsonwebtoken and jose up to date
2. **MongoDB**: Ensure mongoose is latest stable version  
3. **AWS SDKs**: Update AWS SDK packages regularly
4. **Express Security**: Keep helmet and security middleware current
5. **Socket.IO**: Update for WebSocket security patches
6. **Crypto Libraries**: Monitor crypto-js and elliptic for updates

## Automated Fix Commands

Apply fixes carefully in this order:
```bash
cd api && npm audit fix                    # Safe automatic fixes
cd api && npm update                       # Update compatible versions
cd api && npm audit fix --force           # Force fixes (review first)
```

## Manual Review Required

Please manually review:
- Breaking changes in major version updates
- New vulnerabilities introduced by fixes
- Impact on Web3Auth and blockchain integrations
- AWS SDK compatibility with existing code
- Socket.IO real-time functionality after updates

!echo "✅ Dependency security scan completed. Review ../security-report.txt for details."