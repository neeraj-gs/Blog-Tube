---
description: Safe dependency updates with security audit and compatibility checks
---

# Dependency Update Manager

Safely updates npm dependencies with security vulnerability fixes and compatibility verification for Node.js Express applications.

## Update Workflow

### 1. Security Vulnerability Scan
!echo "🔍 Scanning for security vulnerabilities..."
!npm audit --audit-level moderate

### 2. Automatic Security Fixes
!echo "🔧 Applying automatic security fixes..."
!npm audit fix --audit-level moderate

### 3. Safe Dependency Updates
!echo "⬆️ Updating dependencies..."
!npm update --save

### 4. Development Dependencies
!echo "🛠️ Updating development dependencies..."
!npm update --save-dev

## Post-Update Verification

### Dependency Integrity Check
!echo "✅ Verifying package integrity..."
!npm ls --depth=0 | head -20

### Security Audit Summary
!echo "🔒 Final security audit:"
!npm audit --audit-level moderate | grep -E "(found|vulnerabilities)" || echo "No vulnerabilities found"

!echo "✅ Dependency update completed"
!echo "💡 Run '/org:test:run' to verify all tests pass with updated dependencies"