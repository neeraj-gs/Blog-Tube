---
description: Comprehensive security audit for Node.js Express applications
---

# Organization Security Audit

Performs a comprehensive security analysis of the current Node.js Express application, focusing on common vulnerabilities and best practices for the Penomo tech stack.

## Security Checks Performed

### 1. Dependency Vulnerabilities
!npm audit --audit-level moderate

### 2. Code Security Analysis
Check for common security anti-patterns in the codebase:

!grep -r "eval(" --include="*.js" . || echo "✅ No eval() usage found"
!grep -r "innerHTML" --include="*.js" . || echo "✅ No innerHTML usage found" 
!grep -r "document.write" --include="*.js" . || echo "✅ No document.write usage found"

### 3. Environment Security
Check for exposed secrets and keys:

!grep -r "password\|secret\|key\|token" --include="*.js" --include="*.json" . | grep -v node_modules | grep -v ".git" || echo "✅ No hardcoded secrets found"

### 4. MongoDB Security
Check for NoSQL injection vulnerabilities:

!grep -r "\$where" --include="*.js" . || echo "✅ No MongoDB $where usage found"
!grep -r "eval.*req\." --include="*.js" . || echo "✅ No eval with request data found"

### 5. Express Security Headers
Check for security middleware configuration:

!grep -r "helmet" --include="*.js" . && echo "✅ Helmet security middleware found" || echo "⚠️ Consider adding Helmet for security headers"

### 6. Authentication Security
Verify JWT and authentication patterns:

!grep -r "jwt\|token" --include="*.js" . | head -5

### 7. Input Validation
Check for express-validator usage:

!grep -r "express-validator\|validationResult" --include="*.js" . && echo "✅ Input validation found" || echo "⚠️ Consider adding input validation"

## Recommendations

Based on the Penomo architecture, ensure these security measures are in place:

1. **Rate Limiting**: Verify rate-limiter-flexible is properly configured
2. **CORS**: Check ALLOWED_ORIGINS environment variable
3. **MongoDB**: Ensure connection uses authentication
4. **File Uploads**: Verify S3 uploads have proper validation
5. **API Keys**: Confirm MASTER_API_KEY rotation strategy
6. **JWT**: Verify token expiration and refresh logic

## Manual Review Required

Please manually review:
- Environment variable exposure in logs
- API endpoint authentication requirements  
- File upload size and type restrictions
- Database query parameter sanitization
- Error message information disclosure