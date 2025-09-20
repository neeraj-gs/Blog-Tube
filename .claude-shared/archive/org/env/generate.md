---
description: Generate .env.example template from actual environment variable usage in codebase
---

# Environment Template Generator

Automatically generates a `.env.example` file by scanning the codebase for environment variable usage, ensuring new developers have all required environment variables documented.

## Template Generation Process

### 1. Codebase Scanning
!echo "🔍 Scanning codebase for environment variables..."

### 2. Extract Environment Variables
!echo "📋 Extracting environment variables from source code..."
!grep -r "process\.env\." --include="*.js" --include="*.ts" . | \
  grep -v node_modules | \
  grep -v ".git" | \
  sed 's/.*process\.env\.\([A-Z_][A-Z0-9_]*\).*/\1/' | \
  sort -u > /tmp/env_vars.txt

### 3. Generate Template File
!echo "📝 Generating .env.example template..."
!echo "# Environment Variables for $(basename $(pwd))" > .env.example
!echo "# Generated on $(date)" >> .env.example
!echo "# Copy to .env and fill in actual values" >> .env.example
!echo "" >> .env.example

### 4. Categorize Variables
!echo "# === Core Configuration ===" >> .env.example
!grep -E "^(NODE_ENV|PORT|HOST)$" /tmp/env_vars.txt | while read var; do echo "${var}=" >> .env.example; done

!echo "" >> .env.example
!echo "# === Database Configuration ===" >> .env.example
!grep -E "^(MONGO|DB|DATABASE)" /tmp/env_vars.txt | while read var; do echo "${var}=" >> .env.example; done

!echo "" >> .env.example
!echo "# === Authentication & Security ===" >> .env.example
!grep -E "^(SECRET|JWT|API_KEY|AUTH|WEB3AUTH)" /tmp/env_vars.txt | while read var; do echo "${var}=" >> .env.example; done

!echo "" >> .env.example
!echo "# === AWS Services ===" >> .env.example
!grep -E "^(AWS|S3|SES|CLOUDFRONT)" /tmp/env_vars.txt | while read var; do echo "${var}=" >> .env.example; done

!echo "" >> .env.example
!echo "# === External APIs ===" >> .env.example
!grep -E "^(DISCORD|TWITTER|TELEGRAM|GROWTH_BOOK)" /tmp/env_vars.txt | while read var; do echo "${var}=" >> .env.example; done

!echo "" >> .env.example
!echo "# === Other Variables ===" >> .env.example
!grep -vE "^(NODE_ENV|PORT|HOST|MONGO|DB|DATABASE|SECRET|JWT|API_KEY|AUTH|WEB3AUTH|AWS|S3|SES|CLOUDFRONT|DISCORD|TWITTER|TELEGRAM|GROWTH_BOOK)" /tmp/env_vars.txt | while read var; do echo "${var}=" >> .env.example; done

## Environment Analysis

### 5. Variable Statistics
!echo ""
!echo "📊 Environment variable analysis:"
!echo "- Total variables found: $(cat /tmp/env_vars.txt | wc -l)"
!echo "- Core config: $(grep -cE "^(NODE_ENV|PORT|HOST)$" /tmp/env_vars.txt)"
!echo "- Database: $(grep -cE "^(MONGO|DB|DATABASE)" /tmp/env_vars.txt)"
!echo "- Security: $(grep -cE "^(SECRET|JWT|API_KEY|AUTH|WEB3AUTH)" /tmp/env_vars.txt)"
!echo "- AWS services: $(grep -cE "^(AWS|S3|SES|CLOUDFRONT)" /tmp/env_vars.txt)"
!echo "- External APIs: $(grep -cE "^(DISCORD|TWITTER|TELEGRAM|GROWTH_BOOK)" /tmp/env_vars.txt)"

### 6. Security Check
!echo ""
!echo "🔒 Security validation:"
!grep -E "^(PASSWORD|PRIVATE_KEY|TOKEN)" /tmp/env_vars.txt && echo "⚠️ Sensitive variables detected - ensure they're in .env.example without values" || echo "✅ No obvious sensitive variable names found"

### 7. Missing Variables Check
!echo ""
!echo "🔍 Checking for missing variables in current .env:"
!if [ -f .env ]; then
!  echo "Variables in code but not in .env:"
!  comm -23 /tmp/env_vars.txt <(grep "^[A-Z_]" .env | cut -d= -f1 | sort)
!else
!  echo "ℹ️ No .env file found - all variables from .env.example need to be configured"
!fi

## Documentation Enhancement

### 8. Add Usage Comments
!echo ""
!echo "📚 Adding usage documentation..."
!cat >> .env.example << 'EOF'

# === Usage Instructions ===
# 1. Copy this file to .env: cp .env.example .env
# 2. Fill in actual values for each variable
# 3. Never commit .env file to version control
# 4. Update this template when adding new environment variables

# === Required vs Optional ===
# Variables without default values in code are typically REQUIRED
# Check the codebase for fallback values to determine which are optional
EOF

## Cleanup and Validation

### 9. File Validation
!echo ""
!echo "✅ Validating generated template:"
!echo "- Template file created: $(test -f .env.example && echo "✅" || echo "❌")"
!echo "- Variables documented: $(grep -c "^[A-Z_].*=" .env.example)"
!echo "- File size: $(wc -c < .env.example) bytes"

### 10. Cleanup
!rm -f /tmp/env_vars.txt

## Best Practices

!echo ""
!echo "💡 Best practices for environment variables:"
!echo "• Use descriptive names (DATABASE_URL vs DB_URL)"
!echo "• Group related variables with prefixes (AWS_S3_BUCKET, AWS_S3_REGION)"
!echo "• Provide example values where safe (PORT=3000)"
!echo "• Document required vs optional variables"
!echo "• Update .env.example when adding new variables to code"

!echo ""
!echo "✅ Environment template generation completed"
!echo "📋 Review .env.example and add example values where appropriate"
!echo "🔐 Ensure no actual secrets are included in the template"