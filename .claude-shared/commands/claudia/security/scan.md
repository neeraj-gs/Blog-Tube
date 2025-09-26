---
description: "Comprehensive security scanning and vulnerability assessment"
allowed-tools: ["Read", "Write", "Edit", "Bash"]
---

# 🛡️ Security Vulnerability Scan

Performs comprehensive security scanning including dependency vulnerabilities, code security analysis, and configuration checks.

## Processing Security Scan Request

!bash -c 'echo "🛡️  Starting comprehensive security scan..."'

## Initialize Security Scan

!bash -c '
SCAN_ID="security-scan-$(date +%s)"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo "SCAN_ID=$SCAN_ID" > /tmp/claudia_security_context
echo "TIMESTAMP=$TIMESTAMP" >> /tmp/claudia_security_context

echo "🔍 Security Scan Session:"
echo "   🆔 Scan ID: $SCAN_ID"
echo "   🕒 Started: $TIMESTAMP"
echo "   📍 Directory: $(pwd)"
'

## Validate Project Environment

!bash -c '
source /tmp/claudia_security_context

echo "🔍 Validating project environment..."

# Check if we are in a valid project directory
PROJECT_VALID=false

if [ -f "package.json" ]; then
    echo "   ✅ Node.js project detected"
    PROJECT_TYPE="nodejs"
    PROJECT_VALID=true
elif [ -f "requirements.txt" ] || [ -f "setup.py" ]; then
    echo "   ✅ Python project detected"
    PROJECT_TYPE="python"
    PROJECT_VALID=true
elif [ -f "Cargo.toml" ]; then
    echo "   ✅ Rust project detected"
    PROJECT_TYPE="rust"
    PROJECT_VALID=true
elif [ -f "go.mod" ]; then
    echo "   ✅ Go project detected"
    PROJECT_TYPE="go"
    PROJECT_VALID=true
else
    echo "   ⚠️  Generic project - limited security checks available"
    PROJECT_TYPE="generic"
    PROJECT_VALID=true
fi

echo "PROJECT_TYPE=$PROJECT_TYPE" >> /tmp/claudia_security_context
echo "PROJECT_VALID=$PROJECT_VALID" >> /tmp/claudia_security_context

if [ "$PROJECT_VALID" != "true" ]; then
    echo "❌ Unable to determine project type for security scanning"
    exit 1
fi
'

## Dependency Vulnerability Scan

!bash -c '
source /tmp/claudia_security_context

echo ""
echo "📦 Scanning Dependencies for Vulnerabilities"
echo "============================================"

DEPENDENCY_ISSUES=""
DEPENDENCY_SCORE=100

case "$PROJECT_TYPE" in
    "nodejs")
        echo "🔍 Scanning npm dependencies..."

        # Check if npm audit is available
        if command -v npm > /dev/null 2>&1; then
            AUDIT_OUTPUT=$(npm audit --json 2>/dev/null || echo "{}")
            VULNERABILITIES=$(echo "$AUDIT_OUTPUT" | jq ".metadata.vulnerabilities" 2>/dev/null || echo "{}")

            HIGH_VULN=$(echo "$VULNERABILITIES" | jq ".high // 0" 2>/dev/null || echo "0")
            CRITICAL_VULN=$(echo "$VULNERABILITIES" | jq ".critical // 0" 2>/dev/null || echo "0")
            MODERATE_VULN=$(echo "$VULNERABILITIES" | jq ".moderate // 0" 2>/dev/null || echo "0")
            LOW_VULN=$(echo "$VULNERABILITIES" | jq ".low // 0" 2>/dev/null || echo "0")

            TOTAL_VULN=$((HIGH_VULN + CRITICAL_VULN + MODERATE_VULN + LOW_VULN))

            if [ "$CRITICAL_VULN" -gt 0 ]; then
                DEPENDENCY_ISSUES="$DEPENDENCY_ISSUES\n🚨 $CRITICAL_VULN critical vulnerabilities found"
                DEPENDENCY_SCORE=$((DEPENDENCY_SCORE - 40))
            fi

            if [ "$HIGH_VULN" -gt 0 ]; then
                DEPENDENCY_ISSUES="$DEPENDENCY_ISSUES\n⚠️  $HIGH_VULN high severity vulnerabilities found"
                DEPENDENCY_SCORE=$((DEPENDENCY_SCORE - 25))
            fi

            if [ "$MODERATE_VULN" -gt 0 ]; then
                DEPENDENCY_ISSUES="$DEPENDENCY_ISSUES\n💡 $MODERATE_VULN moderate severity vulnerabilities found"
                DEPENDENCY_SCORE=$((DEPENDENCY_SCORE - 10))
            fi

            if [ "$TOTAL_VULN" -eq 0 ]; then
                echo "   ✅ No known vulnerabilities in dependencies"
            else
                echo "   📊 Total vulnerabilities found: $TOTAL_VULN"
                echo "     🔴 Critical: $CRITICAL_VULN"
                echo "     🟠 High: $HIGH_VULN"
                echo "     🟡 Moderate: $MODERATE_VULN"
                echo "     🟢 Low: $LOW_VULN"
            fi
        else
            echo "   ⚠️  npm not available, skipping dependency scan"
            DEPENDENCY_SCORE=80
        fi
        ;;

    "python")
        echo "🔍 Checking Python dependencies..."
        if command -v pip > /dev/null 2>&1; then
            # Basic check for common insecure packages
            if [ -f "requirements.txt" ]; then
                INSECURE_PATTERNS="django==1\.|flask==0\.|requests==2\.6"
                if grep -qE "$INSECURE_PATTERNS" requirements.txt 2>/dev/null; then
                    DEPENDENCY_ISSUES="$DEPENDENCY_ISSUES\n⚠️  Potentially outdated packages detected"
                    DEPENDENCY_SCORE=$((DEPENDENCY_SCORE - 20))
                fi
                echo "   ✅ Basic Python dependency check completed"
            else
                echo "   ℹ️  No requirements.txt found"
            fi
        else
            echo "   ⚠️  pip not available, skipping Python dependency scan"
            DEPENDENCY_SCORE=80
        fi
        ;;

    *)
        echo "   ℹ️  Dependency scanning not implemented for $PROJECT_TYPE"
        DEPENDENCY_SCORE=90
        ;;
esac

if [ "$DEPENDENCY_SCORE" -lt 0 ]; then
    DEPENDENCY_SCORE=0
fi

echo "DEPENDENCY_SCORE=$DEPENDENCY_SCORE" >> /tmp/claudia_security_context
echo "DEPENDENCY_ISSUES=$DEPENDENCY_ISSUES" >> /tmp/claudia_security_context

echo "   📊 Dependency Security Score: $DEPENDENCY_SCORE/100"
'

## Code Security Analysis

!bash -c '
source /tmp/claudia_security_context

echo ""
echo "🔍 Code Security Analysis"
echo "========================"

CODE_ISSUES=""
CODE_SCORE=100

echo "🔍 Scanning for security anti-patterns..."

# Search for potential security issues in code files
SEARCH_PATTERNS=(
    "password.*=.*['\"].*['\"]"
    "secret.*=.*['\"].*['\"]"
    "api[_-]?key.*=.*['\"].*['\"]"
    "token.*=.*['\"].*['\"]"
    "console\.log.*password"
    "console\.log.*secret"
    "eval\s*\("
    "innerHTML\s*="
    "document\.write\s*\("
    "process\.env\.[A-Z_]+.*="
)

# File extensions to scan
EXTENSIONS=("*.js" "*.jsx" "*.ts" "*.tsx" "*.py" "*.php" "*.java" "*.go" "*.rs")

CRITICAL_FINDINGS=0
WARNING_FINDINGS=0

for pattern in "${SEARCH_PATTERNS[@]}"; do
    for ext in "${EXTENSIONS[@]}"; do
        if find . -name "$ext" -type f -exec grep -l -E "$pattern" {} \; 2>/dev/null | head -1 | grep -q .; then
            case "$pattern" in
                *"password"*|*"secret"*|*"api"*|*"token"*)
                    CRITICAL_FINDINGS=$((CRITICAL_FINDINGS + 1))
                    ;;
                *"console.log"*|*"process.env"*)
                    WARNING_FINDINGS=$((WARNING_FINDINGS + 1))
                    ;;
                *)
                    CRITICAL_FINDINGS=$((CRITICAL_FINDINGS + 1))
                    ;;
            esac
            break
        fi
    done
done

if [ "$CRITICAL_FINDINGS" -gt 0 ]; then
    CODE_ISSUES="$CODE_ISSUES\n🚨 $CRITICAL_FINDINGS potential security vulnerabilities detected"
    CODE_SCORE=$((CODE_SCORE - (CRITICAL_FINDINGS * 20)))
fi

if [ "$WARNING_FINDINGS" -gt 0 ]; then
    CODE_ISSUES="$CODE_ISSUES\n⚠️  $WARNING_FINDINGS security warnings found"
    CODE_SCORE=$((CODE_SCORE - (WARNING_FINDINGS * 10)))
fi

# Check for sensitive files that shouldn not be committed
SENSITIVE_FILES=()
for file in ".env" ".env.local" "*.key" "*.pem" "id_rsa" "*.p12" "*.jks"; do
    if find . -name "$file" -type f 2>/dev/null | grep -q .; then
        SENSITIVE_FILES+=("$file")
    fi
done

if [ ${#SENSITIVE_FILES[@]} -gt 0 ]; then
    CODE_ISSUES="$CODE_ISSUES\n🚨 Sensitive files detected: ${SENSITIVE_FILES[*]}"
    CODE_SCORE=$((CODE_SCORE - 30))
fi

if [ "$CODE_SCORE" -lt 0 ]; then
    CODE_SCORE=0
fi

echo "CODE_SCORE=$CODE_SCORE" >> /tmp/claudia_security_context
echo "CODE_ISSUES=$CODE_ISSUES" >> /tmp/claudia_security_context
echo "CRITICAL_FINDINGS=$CRITICAL_FINDINGS" >> /tmp/claudia_security_context
echo "WARNING_FINDINGS=$WARNING_FINDINGS" >> /tmp/claudia_security_context

echo "   📊 Code Security Score: $CODE_SCORE/100"

if [ "$CRITICAL_FINDINGS" -eq 0 ] && [ "$WARNING_FINDINGS" -eq 0 ] && [ ${#SENSITIVE_FILES[@]} -eq 0 ]; then
    echo "   ✅ No obvious security issues found in code"
else
    echo "   🔍 Issues detected:"
    [ "$CRITICAL_FINDINGS" -gt 0 ] && echo "     🚨 Critical findings: $CRITICAL_FINDINGS"
    [ "$WARNING_FINDINGS" -gt 0 ] && echo "     ⚠️  Warnings: $WARNING_FINDINGS"
    [ ${#SENSITIVE_FILES[@]} -gt 0 ] && echo "     📄 Sensitive files: ${#SENSITIVE_FILES[@]}"
fi
'

## Configuration Security Check

!bash -c '
source /tmp/claudia_security_context

echo ""
echo "⚙️  Configuration Security Check"
echo "================================"

CONFIG_ISSUES=""
CONFIG_SCORE=100

echo "🔍 Checking configuration security..."

# Check for insecure configurations
INSECURE_CONFIGS=""

# Check package.json for potential issues
if [ -f "package.json" ]; then
    if grep -q "\"scripts\":" package.json; then
        # Check for potentially dangerous scripts
        if grep -A10 "\"scripts\":" package.json | grep -q "rm -rf /\|sudo\|eval"; then
            INSECURE_CONFIGS="$INSECURE_CONFIGS\n⚠️  Potentially dangerous npm scripts detected"
            CONFIG_SCORE=$((CONFIG_SCORE - 15))
        fi
    fi

    # Check for HTTP registries (should be HTTPS)
    if grep -q "http://registry" package.json; then
        INSECURE_CONFIGS="$INSECURE_CONFIGS\n⚠️  HTTP registry URLs found (should use HTTPS)"
        CONFIG_SCORE=$((CONFIG_SCORE - 10))
    fi
fi

# Check Docker configuration if present
if [ -f "Dockerfile" ]; then
    if grep -q "RUN.*sudo\|USER root" Dockerfile; then
        INSECURE_CONFIGS="$INSECURE_CONFIGS\n⚠️  Docker container running as root"
        CONFIG_SCORE=$((CONFIG_SCORE - 20))
    fi

    if ! grep -q "USER\s" Dockerfile; then
        INSECURE_CONFIGS="$INSECURE_CONFIGS\n💡 Consider specifying non-root USER in Dockerfile"
        CONFIG_SCORE=$((CONFIG_SCORE - 5))
    fi
fi

# Check .gitignore for sensitive patterns
if [ -f ".gitignore" ]; then
    MISSING_PATTERNS=""
    for pattern in "*.env" "*.key" "*.pem" "node_modules/" ".DS_Store"; do
        if ! grep -q "$pattern" .gitignore; then
            MISSING_PATTERNS="$MISSING_PATTERNS $pattern"
        fi
    done

    if [ -n "$MISSING_PATTERNS" ]; then
        INSECURE_CONFIGS="$INSECURE_CONFIGS\n💡 Consider adding to .gitignore:$MISSING_PATTERNS"
        CONFIG_SCORE=$((CONFIG_SCORE - 5))
    fi
else
    INSECURE_CONFIGS="$INSECURE_CONFIGS\n⚠️  No .gitignore file found"
    CONFIG_SCORE=$((CONFIG_SCORE - 10))
fi

if [ "$CONFIG_SCORE" -lt 0 ]; then
    CONFIG_SCORE=0
fi

echo "CONFIG_SCORE=$CONFIG_SCORE" >> /tmp/claudia_security_context
echo "CONFIG_ISSUES=$INSECURE_CONFIGS" >> /tmp/claudia_security_context

echo "   📊 Configuration Security Score: $CONFIG_SCORE/100"

if [ -z "$INSECURE_CONFIGS" ]; then
    echo "   ✅ Configuration appears secure"
else
    echo "   🔍 Configuration issues found"
fi
'

## Calculate Overall Security Score

!bash -c '
source /tmp/claudia_security_context

echo ""
echo "📊 Calculating Overall Security Score"
echo "===================================="

# Weight factors
DEPENDENCY_WEIGHT=40
CODE_WEIGHT=35
CONFIG_WEIGHT=25

# Calculate weighted score
OVERALL_SCORE=$(( (DEPENDENCY_SCORE * DEPENDENCY_WEIGHT + CODE_SCORE * CODE_WEIGHT + CONFIG_SCORE * CONFIG_WEIGHT) / 100 ))

# Determine security grade
SECURITY_GRADE=""
GRADE_COLOR=""
if [ "$OVERALL_SCORE" -ge 90 ]; then
    SECURITY_GRADE="A (Excellent)"
    GRADE_COLOR="🟢"
elif [ "$OVERALL_SCORE" -ge 80 ]; then
    SECURITY_GRADE="B (Good)"
    GRADE_COLOR="🟢"
elif [ "$OVERALL_SCORE" -ge 70 ]; then
    SECURITY_GRADE="C (Fair)"
    GRADE_COLOR="🟡"
elif [ "$OVERALL_SCORE" -ge 60 ]; then
    SECURITY_GRADE="D (Poor)"
    GRADE_COLOR="🟠"
else
    SECURITY_GRADE="F (Critical)"
    GRADE_COLOR="🔴"
fi

echo "OVERALL_SCORE=$OVERALL_SCORE" >> /tmp/claudia_security_context
echo "SECURITY_GRADE=$SECURITY_GRADE" >> /tmp/claudia_security_context

echo "🎯 Overall Security Score: $OVERALL_SCORE/100"
echo "🏆 Security Grade: $GRADE_COLOR $SECURITY_GRADE"
echo ""
echo "📊 Component Scores:"
echo "   📦 Dependencies: $DEPENDENCY_SCORE/100 (${DEPENDENCY_WEIGHT}% weight)"
echo "   🔍 Code Security: $CODE_SCORE/100 (${CODE_WEIGHT}% weight)"
echo "   ⚙️  Configuration: $CONFIG_SCORE/100 (${CONFIG_WEIGHT}% weight)"
'

## Generate Security Report

!bash -c '
source /tmp/claudia_security_context

echo ""
echo "📄 Generating security report..."

REPORT_DIR=".claude-shared/project-management/data/security"
mkdir -p "$REPORT_DIR"

SECURITY_REPORT="$REPORT_DIR/scan-$SCAN_ID.json"

# Create comprehensive security report
cat > "$SECURITY_REPORT" << EOF
{
  "scan_id": "$SCAN_ID",
  "timestamp": "$TIMESTAMP",
  "project_type": "$PROJECT_TYPE",
  "overall_score": $OVERALL_SCORE,
  "security_grade": "$SECURITY_GRADE",
  "component_scores": {
    "dependencies": $DEPENDENCY_SCORE,
    "code_security": $CODE_SCORE,
    "configuration": $CONFIG_SCORE
  },
  "findings": {
    "critical_code_issues": $CRITICAL_FINDINGS,
    "warning_code_issues": $WARNING_FINDINGS,
    "dependency_issues": "$DEPENDENCY_ISSUES",
    "code_issues": "$CODE_ISSUES",
    "config_issues": "$CONFIG_ISSUES"
  },
  "recommendations": []
}
EOF

echo "SECURITY_REPORT=$SECURITY_REPORT" >> /tmp/claudia_security_context
echo "✅ Security report generated: $SECURITY_REPORT"
'

## Display Security Issues and Recommendations

!bash -c '
source /tmp/claudia_security_context

echo ""
echo "🚨 SECURITY ISSUES SUMMARY"
echo "=========================="

ALL_ISSUES=""
if [ -n "$DEPENDENCY_ISSUES" ]; then
    ALL_ISSUES="$ALL_ISSUES$DEPENDENCY_ISSUES"
fi
if [ -n "$CODE_ISSUES" ]; then
    ALL_ISSUES="$ALL_ISSUES$CODE_ISSUES"
fi
if [ -n "$CONFIG_ISSUES" ]; then
    ALL_ISSUES="$ALL_ISSUES$CONFIG_ISSUES"
fi

if [ -n "$ALL_ISSUES" ]; then
    echo "🔍 Issues Found:"
    echo -e "$ALL_ISSUES"
else
    echo "✅ No significant security issues detected"
fi

echo ""
echo "💡 SECURITY RECOMMENDATIONS"
echo "============================"

if [ "$DEPENDENCY_SCORE" -lt 90 ]; then
    echo "📦 Dependencies:"
    echo "   • Run \`npm audit fix\` to automatically fix vulnerabilities"
    echo "   • Review and update outdated packages"
    echo "   • Consider using \`npm audit --audit-level=high\` for stricter checks"
fi

if [ "$CODE_SCORE" -lt 90 ]; then
    echo "🔍 Code Security:"
    echo "   • Remove hardcoded credentials and use environment variables"
    echo "   • Implement proper input validation and sanitization"
    echo "   • Remove debug console.log statements before production"
    echo "   • Use parameterized queries to prevent SQL injection"
fi

if [ "$CONFIG_SCORE" -lt 90 ]; then
    echo "⚙️  Configuration:"
    echo "   • Update .gitignore to exclude sensitive files"
    echo "   • Use HTTPS URLs for package registries"
    echo "   • Run containers as non-root users"
    echo "   • Implement proper environment variable management"
fi

echo ""
echo "🛡️  Additional Security Measures:"
echo "   • Enable two-factor authentication on all accounts"
echo "   • Regularly rotate API keys and secrets"
echo "   • Implement Content Security Policy (CSP) headers"
echo "   • Use HTTPS everywhere"
echo "   • Regular security audits and penetration testing"
'

## Log Security Scan Activity

!bash -c '
source /tmp/claudia_security_context

echo ""
echo "📊 Logging security scan activity..."
mkdir -p .claude-shared/project-management/data

LOG_ENTRY="{\"timestamp\":\"$TIMESTAMP\",\"action\":\"security_scan_completed\",\"scan_id\":\"$SCAN_ID\",\"project_type\":\"$PROJECT_TYPE\",\"overall_score\":$OVERALL_SCORE,\"security_grade\":\"$SECURITY_GRADE\",\"critical_findings\":$CRITICAL_FINDINGS,\"warning_findings\":$WARNING_FINDINGS}"

echo "$LOG_ENTRY" >> .claude-shared/project-management/data/github-sync.jsonl

echo "✅ Security scan activity logged to audit trail"
'

## Final Summary

!bash -c '
source /tmp/claudia_security_context

echo ""
echo "✨ SECURITY SCAN COMPLETE"
echo "========================="
echo ""
echo "📊 Scan Results Summary:"
echo "   🆔 Scan ID: $SCAN_ID"
echo "   📁 Project Type: $PROJECT_TYPE"
echo "   🎯 Overall Score: $OVERALL_SCORE/100"
echo "   🏆 Security Grade: $SECURITY_GRADE"
echo ""
echo "📈 Component Breakdown:"
echo "   📦 Dependencies: $DEPENDENCY_SCORE/100"
echo "   🔍 Code Security: $CODE_SCORE/100"
echo "   ⚙️  Configuration: $CONFIG_SCORE/100"
echo ""

if [ "$OVERALL_SCORE" -ge 80 ]; then
    echo "🎉 Good security posture! Keep up the excellent work."
elif [ "$OVERALL_SCORE" -ge 60 ]; then
    echo "⚠️  Moderate security risks. Address the issues above to improve security."
else
    echo "🚨 Critical security issues found. Immediate attention required!"
fi

echo ""
echo "🔗 Next Steps:"
echo "   1. Review the detailed security report"
echo "   2. Address high-priority security issues"
echo "   3. Run security scan regularly (monthly recommended)"
echo "   4. Integrate security testing into CI/CD pipeline"
echo ""
echo "📄 Detailed report: $SECURITY_REPORT"

rm -f /tmp/claudia_security_context
'