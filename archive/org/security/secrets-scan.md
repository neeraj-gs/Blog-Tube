---
description: Scan codebase for exposed secrets, credentials, and sensitive information
allowed-tools: [Bash, Grep, Read]
---

# Secrets Scanner

Comprehensive scan for exposed secrets, credentials, API keys, and sensitive information in the Penomo codebase.

## Secrets Scanning Workflow

### 1. Initialize Secrets Scan
!echo "🕵️ Starting comprehensive secrets scan for Penomo codebase..."
!echo "Scanning for exposed credentials, API keys, and sensitive data..."

### 2. API Keys and Tokens Detection
!echo "🔑 Scanning for API keys and authentication tokens..."
!grep -r -i "api[_-]key\|apikey\|access[_-]key\|secret[_-]key\|auth[_-]token" --include="*.js" --include="*.json" --include="*.md" . | grep -v node_modules | grep -v ".git" | head -10 || echo "✅ No exposed API keys found"

### 3. AWS Credentials Detection
!echo "☁️ Scanning for AWS credentials..."
!grep -r -E "AKIA[0-9A-Z]{16}|aws[_-]access[_-]key|aws[_-]secret" --include="*.js" --include="*.json" . | grep -v node_modules | grep -v ".git" || echo "✅ No exposed AWS credentials found"

### 4. Database Connection Strings
!echo "🗄️ Scanning for database connection strings..."
!grep -r -i "mongodb://\|mysql://\|postgres://\|redis://\|connection[_-]string" --include="*.js" --include="*.json" . | grep -v node_modules | grep -v ".git" | head -5 || echo "✅ No exposed database URLs found"

### 5. JWT Secrets and Keys
!echo "🔐 Scanning for JWT secrets and signing keys..."
!grep -r -i "jwt[_-]secret\|signing[_-]key\|private[_-]key\|secret[_-]key.*jwt" --include="*.js" . | grep -v node_modules | grep -v ".git" || echo "✅ No exposed JWT secrets found"

### 6. Cryptocurrency and Blockchain Keys
!echo "₿ Scanning for cryptocurrency private keys..."
!grep -r -E "private[_-]key|mnemonic|seed[_-]phrase|wallet[_-]key" --include="*.js" . | grep -v node_modules | grep -v ".git" || echo "✅ No exposed crypto keys found"

### 7. Social Media API Credentials
!echo "📱 Scanning for social media API credentials..."
!grep -r -i "discord[_-]token\|twitter[_-]api\|telegram[_-]token\|facebook[_-]app" --include="*.js" --include="*.json" . | grep -v node_modules | grep -v ".git" || echo "✅ No social media credentials found"

### 8. Web3Auth and Authentication Secrets
!echo "🌐 Scanning for Web3Auth secrets..."
!grep -r -i "web3auth\|auth0\|oauth[_-]secret\|client[_-]secret" --include="*.js" --include="*.json" . | grep -v node_modules | grep -v ".git" || echo "✅ No Web3Auth secrets found"

### 9. Email Service Credentials
!echo "📧 Scanning for email service credentials..."
!grep -r -i "ses[_-]key\|sendgrid\|mailgun\|smtp[_-]password" --include="*.js" --include="*.json" . | grep -v node_modules | grep -v ".git" || echo "✅ No email service credentials found"

### 10. Generic Password and Secret Patterns
!echo "🔒 Scanning for generic passwords and secrets..."
!grep -r -E "password\s*=\s*['\"][^'\"]{3,}|secret\s*=\s*['\"][^'\"]{3,}" --include="*.js" . | grep -v node_modules | grep -v ".git" | head -5 || echo "✅ No hardcoded passwords found"

### 11. Configuration Files Audit
!echo "⚙️ Auditing configuration files for secrets..."
!find . -name "*.config.js" -o -name "config.json" -o -name "*.env*" | grep -v node_modules | head -10
!echo "⚠️ Review above configuration files manually for secrets"

### 12. Environment Variable References
!echo "🌍 Checking environment variable usage patterns..."
!grep -r "process\.env\." --include="*.js" . | grep -v node_modules | cut -d: -f1 | sort | uniq | head -10
!echo "ℹ️ Environment variables detected (ensure .env files are not committed)"

## Penomo Platform Specific Checks

### 13. Investment Platform Secrets
!echo "💰 Scanning for investment platform specific secrets..."
!grep -r -i "master[_-]api[_-]key\|admin[_-]api[_-]key\|penomo" --include="*.js" . | grep -v node_modules | grep -v ".git" || echo "✅ No platform-specific secrets found"

### 14. GrowthBook Feature Flag Keys
!echo "🎯 Checking GrowthBook configuration..."
!grep -r -i "growthbook\|feature[_-]flag" --include="*.js" . | grep -v node_modules | grep -v ".git" || echo "✅ No GrowthBook secrets found"

### 15. Socket.IO Authentication Secrets
!echo "⚡ Checking Socket.IO authentication..."
!grep -r -i "socket[_-]secret\|websocket[_-]key" --include="*.js" . | grep -v node_modules | grep -v ".git" || echo "✅ No Socket.IO secrets found"

### 16. File Upload and S3 Credentials
!echo "📁 Scanning for file upload credentials..."
!grep -r -i "s3[_-]key\|bucket[_-]key\|cloudfront[_-]key" --include="*.js" . | grep -v node_modules | grep -v ".git" || echo "✅ No S3 credentials found"

## Advanced Pattern Detection

### 17. Base64 Encoded Secrets
!echo "🔍 Scanning for Base64 encoded secrets..."
!grep -r -E "[A-Za-z0-9+/]{40,}={0,2}" --include="*.js" . | grep -v node_modules | grep -v ".git" | grep -v "test" | head -3 || echo "✅ No suspicious Base64 strings found"

### 18. Hex Encoded Keys
!echo "🔢 Scanning for hexadecimal encoded keys..."
!grep -r -E "[a-fA-F0-9]{32,}" --include="*.js" . | grep -v node_modules | grep -v ".git" | head -3 || echo "✅ No suspicious hex strings found"

### 19. URL with Credentials
!echo "🌐 Scanning for URLs containing credentials..."
!grep -r -E "https?://[^:]+:[^@]+@" --include="*.js" . | grep -v node_modules | grep -v ".git" || echo "✅ No URLs with embedded credentials found"

### 20. Common Secret Variable Names
!echo "📝 Scanning for common secret variable names..."
!grep -r -E "\b(SECRET|PASSWORD|TOKEN|KEY|CREDENTIAL|AUTH)\b.*=" --include="*.js" . | grep -v node_modules | grep -v ".git" | head -5 || echo "✅ No suspicious variable names found"

## Security Recommendations

### Immediate Actions
If secrets are found:
1. **Revoke Immediately**: Deactivate exposed credentials
2. **Generate New**: Create replacement credentials  
3. **Update Environment**: Move to environment variables
4. **Git History**: Consider cleaning git history if secrets were committed
5. **Audit Access**: Check if exposed credentials were used maliciously

### Prevention Strategies
1. **Pre-commit Hooks**: Install git pre-commit hooks to catch secrets
2. **Environment Variables**: Use .env files (never commit them)
3. **Secret Management**: Consider AWS Secrets Manager or HashiCorp Vault
4. **Code Reviews**: Review all credential-related changes
5. **Automated Scanning**: Integrate secrets scanning in CI/CD

### Penomo Platform Security
- **Financial Data**: Extra caution with investment-related credentials
- **User Data**: Protect authentication and personal information secrets
- **Blockchain**: Secure all Web3 and cryptocurrency keys
- **Compliance**: Ensure secrets management meets financial regulations
- **Audit Trail**: Log all secret rotation and access

## Git History Cleanup (If Needed)

If secrets were committed to git:
```bash
# Remove sensitive file from all history
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch path/to/sensitive/file' \
  --prune-empty --tag-name-filter cat -- --all

# Alternative: BFG Repo Cleaner
# java -jar bfg.jar --delete-files sensitive-file.txt .git
```

## Secret Management Tools

Consider implementing:
- **AWS Secrets Manager**: For cloud-based secret storage
- **HashiCorp Vault**: For on-premise secret management
- **GitHub Secrets**: For CI/CD environment variables
- **Docker Secrets**: For containerized deployments
- **Kubernetes Secrets**: For K8s deployments

!echo "✅ Comprehensive secrets scan completed"
!echo "🔍 If any secrets were found, take immediate action to revoke and rotate them"
!echo "📋 Review ../security-scan-results.txt for detailed findings"