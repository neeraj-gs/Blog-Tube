---
description: "Targeted security audit for specific files or pull requests"
allowed-tools: ["Read", "Write", "Edit", "Bash"]
---

# 🔍 Security Audit

Performs targeted security audit on specific files, directories, or pull request changes with detailed vulnerability assessment.

## Processing Security Audit: $ARGUMENTS

!bash -c 'echo "🔍 Starting targeted security audit for: $ARGUMENTS"'

## Parse Audit Target

!bash -c '
AUDIT_TARGET=$(echo "$ARGUMENTS" | sed "s/[\"#]//g")
AUDIT_ID="audit-$(date +%s)"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo "AUDIT_TARGET=$AUDIT_TARGET" > /tmp/claudia_audit_context
echo "AUDIT_ID=$AUDIT_ID" >> /tmp/claudia_audit_context
echo "TIMESTAMP=$TIMESTAMP" >> /tmp/claudia_audit_context

echo "🔍 Security Audit Session:"
echo "   🆔 Audit ID: $AUDIT_ID"
echo "   🎯 Target: $AUDIT_TARGET"
echo "   🕒 Started: $TIMESTAMP"

# Determine audit type
AUDIT_TYPE=""
if [[ "$AUDIT_TARGET" =~ ^[0-9]+$ ]]; then
    AUDIT_TYPE="pr"
    echo "   📋 Type: Pull Request Audit"
elif [ -f "$AUDIT_TARGET" ]; then
    AUDIT_TYPE="file"
    echo "   📄 Type: File Audit"
elif [ -d "$AUDIT_TARGET" ]; then
    AUDIT_TYPE="directory"
    echo "   📁 Type: Directory Audit"
else
    AUDIT_TYPE="pattern"
    echo "   🔍 Type: Pattern/Glob Audit"
fi

echo "AUDIT_TYPE=$AUDIT_TYPE" >> /tmp/claudia_audit_context
'

## Validate GitHub CLI Setup (for PR audits)

!bash -c '
source /tmp/claudia_audit_context

if [ "$AUDIT_TYPE" = "pr" ]; then
    if ! command -v gh &> /dev/null; then
        echo "❌ ERROR: GitHub CLI (gh) not installed. Install from: https://cli.github.com/"
        exit 1
    fi

    if ! gh auth status > /dev/null 2>&1; then
        echo "❌ ERROR: GitHub CLI not authenticated. Run: gh auth login"
        exit 1
    fi

    echo "✅ GitHub CLI validated for PR audit"
fi
'

## Collect Files for Audit

!bash -c '
source /tmp/claudia_audit_context

echo ""
echo "📁 Collecting files for security audit..."

FILES_TO_AUDIT=""
FILE_COUNT=0

case "$AUDIT_TYPE" in
    "pr")
        echo "🔍 Fetching files from PR #$AUDIT_TARGET..."
        PR_FILES=$(gh pr view $AUDIT_TARGET --json files --jq ".files[].path" 2>/dev/null)

        if [ $? -ne 0 ]; then
            echo "❌ ERROR: Cannot fetch PR #$AUDIT_TARGET. Check if it exists."
            exit 1
        fi

        FILES_TO_AUDIT="$PR_FILES"
        FILE_COUNT=$(echo "$FILES_TO_AUDIT" | wc -l | xargs)

        if [ -z "$FILES_TO_AUDIT" ]; then
            FILE_COUNT=0
        fi
        ;;

    "file")
        echo "📄 Auditing single file: $AUDIT_TARGET"
        FILES_TO_AUDIT="$AUDIT_TARGET"
        FILE_COUNT=1
        ;;

    "directory")
        echo "📁 Scanning directory: $AUDIT_TARGET"
        FILES_TO_AUDIT=$(find "$AUDIT_TARGET" -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" -o -name "*.py" -o -name "*.php" -o -name "*.java" -o -name "*.go" -o -name "*.rs" -o -name "*.json" -o -name "*.yml" -o -name "*.yaml" \) 2>/dev/null)
        FILE_COUNT=$(echo "$FILES_TO_AUDIT" | wc -l | xargs)

        if [ -z "$FILES_TO_AUDIT" ]; then
            FILE_COUNT=0
        fi
        ;;

    "pattern")
        echo "🔍 Finding files matching pattern: $AUDIT_TARGET"
        FILES_TO_AUDIT=$(find . -name "$AUDIT_TARGET" -type f 2>/dev/null)
        FILE_COUNT=$(echo "$FILES_TO_AUDIT" | wc -l | xargs)

        if [ -z "$FILES_TO_AUDIT" ]; then
            FILE_COUNT=0
        fi
        ;;
esac

echo "FILE_COUNT=$FILE_COUNT" >> /tmp/claudia_audit_context

if [ "$FILE_COUNT" -eq 0 ]; then
    echo "⚠️  No files found for audit"
    echo "💡 Check your target specification and try again"
    exit 1
fi

echo "📊 Files to audit: $FILE_COUNT"

# Save files list for processing
echo "$FILES_TO_AUDIT" > "/tmp/claudia_audit_files.txt"
'

## Security Pattern Analysis

!bash -c '
source /tmp/claudia_audit_context

echo ""
echo "🔍 Analyzing Security Patterns"
echo "=============================="

# Initialize counters
CRITICAL_ISSUES=0
HIGH_ISSUES=0
MEDIUM_ISSUES=0
LOW_ISSUES=0

# Security patterns to check
declare -A SECURITY_PATTERNS
SECURITY_PATTERNS["hardcoded_secrets"]="password.*=.*['\"].*['\"]|secret.*=.*['\"].*['\"]|api[_-]?key.*=.*['\"].*['\"]|token.*=.*['\"].*['\"]"
SECURITY_PATTERNS["sql_injection"]="SELECT.*\$\{|INSERT.*\$\{|UPDATE.*\$\{|DELETE.*\$\{|\\.query\(.*\+.*\)|execute\(.*\+.*\)"
SECURITY_PATTERNS["xss_vulnerabilities"]="innerHTML.*=.*\+|outerHTML.*=.*\+|document\\.write\(.*\+|eval\s*\(|\\.html\(.*\+.*\)"
SECURITY_PATTERNS["file_inclusion"]="include.*\$_|require.*\$_|file_get_contents\(.*\$_|readFile\(.*\$_"
SECURITY_PATTERNS["command_injection"]="exec\(.*\$|system\(.*\$|shell_exec\(.*\$|passthru\(.*\$"
SECURITY_PATTERNS["weak_crypto"]="md5\(|sha1\(|DES|RC4|SSL|TLS.*v1\\.0|TLS.*v1\\.1"
SECURITY_PATTERNS["debug_info"]="console\\.log|print_r\(|var_dump\(|console\\.debug|console\\.trace"

# Initialize findings report
FINDINGS_REPORT=""

echo "🔍 Scanning for security vulnerabilities..."

while IFS= read -r file; do
    if [ -n "$file" ] && [ -f "$file" ]; then
        echo "   📄 Analyzing: $file"

        # Check each security pattern
        for pattern_name in "${!SECURITY_PATTERNS[@]}"; do
            pattern="${SECURITY_PATTERNS[$pattern_name]}"

            if grep -qE "$pattern" "$file" 2>/dev/null; then
                matches=$(grep -nE "$pattern" "$file" 2>/dev/null | head -3)

                case "$pattern_name" in
                    "hardcoded_secrets"|"sql_injection"|"command_injection")
                        CRITICAL_ISSUES=$((CRITICAL_ISSUES + 1))
                        severity="🚨 CRITICAL"
                        ;;
                    "xss_vulnerabilities"|"file_inclusion")
                        HIGH_ISSUES=$((HIGH_ISSUES + 1))
                        severity="⚠️  HIGH"
                        ;;
                    "weak_crypto")
                        MEDIUM_ISSUES=$((MEDIUM_ISSUES + 1))
                        severity="🟡 MEDIUM"
                        ;;
                    "debug_info")
                        LOW_ISSUES=$((LOW_ISSUES + 1))
                        severity="🔵 LOW"
                        ;;
                    *)
                        MEDIUM_ISSUES=$((MEDIUM_ISSUES + 1))
                        severity="🟡 MEDIUM"
                        ;;
                esac

                FINDINGS_REPORT="$FINDINGS_REPORT\n\n$severity: $pattern_name in $file"
                FINDINGS_REPORT="$FINDINGS_REPORT\n$(echo "$matches" | head -2)"
            fi
        done
    fi
done < "/tmp/claudia_audit_files.txt"

TOTAL_ISSUES=$((CRITICAL_ISSUES + HIGH_ISSUES + MEDIUM_ISSUES + LOW_ISSUES))

echo "CRITICAL_ISSUES=$CRITICAL_ISSUES" >> /tmp/claudia_audit_context
echo "HIGH_ISSUES=$HIGH_ISSUES" >> /tmp/claudia_audit_context
echo "MEDIUM_ISSUES=$MEDIUM_ISSUES" >> /tmp/claudia_audit_context
echo "LOW_ISSUES=$LOW_ISSUES" >> /tmp/claudia_audit_context
echo "TOTAL_ISSUES=$TOTAL_ISSUES" >> /tmp/claudia_audit_context

echo "📊 Security Findings Summary:"
echo "   🚨 Critical: $CRITICAL_ISSUES"
echo "   ⚠️  High: $HIGH_ISSUES"
echo "   🟡 Medium: $MEDIUM_ISSUES"
echo "   🔵 Low: $LOW_ISSUES"
echo "   📈 Total: $TOTAL_ISSUES"

# Save detailed findings
echo -e "$FINDINGS_REPORT" > "/tmp/claudia_audit_findings.txt"
'

## File Type Risk Assessment

!bash -c '
source /tmp/claudia_audit_context

echo ""
echo "📊 File Type Risk Assessment"
echo "==========================="

# Count file types
JS_FILES=0
TS_FILES=0
PY_FILES=0
PHP_FILES=0
JAVA_FILES=0
CONFIG_FILES=0
OTHER_FILES=0

while IFS= read -r file; do
    if [ -n "$file" ]; then
        case "$file" in
            *.js|*.jsx) JS_FILES=$((JS_FILES + 1)) ;;
            *.ts|*.tsx) TS_FILES=$((TS_FILES + 1)) ;;
            *.py) PY_FILES=$((PY_FILES + 1)) ;;
            *.php) PHP_FILES=$((PHP_FILES + 1)) ;;
            *.java) JAVA_FILES=$((JAVA_FILES + 1)) ;;
            *.json|*.yml|*.yaml|*.xml|*.conf) CONFIG_FILES=$((CONFIG_FILES + 1)) ;;
            *) OTHER_FILES=$((OTHER_FILES + 1)) ;;
        esac
    fi
done < "/tmp/claudia_audit_files.txt"

echo "📁 File Type Distribution:"
[ "$JS_FILES" -gt 0 ] && echo "   🟨 JavaScript: $JS_FILES files"
[ "$TS_FILES" -gt 0 ] && echo "   🔷 TypeScript: $TS_FILES files"
[ "$PY_FILES" -gt 0 ] && echo "   🐍 Python: $PY_FILES files"
[ "$PHP_FILES" -gt 0 ] && echo "   🟣 PHP: $PHP_FILES files"
[ "$JAVA_FILES" -gt 0 ] && echo "   ☕ Java: $JAVA_FILES files"
[ "$CONFIG_FILES" -gt 0 ] && echo "   ⚙️  Config: $CONFIG_FILES files"
[ "$OTHER_FILES" -gt 0 ] && echo "   📄 Other: $OTHER_FILES files"

# Calculate risk score based on file types and findings
RISK_SCORE=0

# Base risk from file types (higher risk languages get higher base score)
RISK_SCORE=$((RISK_SCORE + PHP_FILES * 3))  # PHP has higher web vulnerability risk
RISK_SCORE=$((RISK_SCORE + JS_FILES * 2))   # JavaScript XSS risks
RISK_SCORE=$((RISK_SCORE + PY_FILES * 1))   # Python moderate risk
RISK_SCORE=$((RISK_SCORE + JAVA_FILES * 1)) # Java moderate risk
RISK_SCORE=$((RISK_SCORE + CONFIG_FILES * 2)) # Config files can expose secrets

# Add findings to risk score
RISK_SCORE=$((RISK_SCORE + CRITICAL_ISSUES * 50))
RISK_SCORE=$((RISK_SCORE + HIGH_ISSUES * 25))
RISK_SCORE=$((RISK_SCORE + MEDIUM_ISSUES * 10))
RISK_SCORE=$((RISK_SCORE + LOW_ISSUES * 2))

echo "RISK_SCORE=$RISK_SCORE" >> /tmp/claudia_audit_context

echo ""
echo "⚡ Risk Assessment: $RISK_SCORE points"
'

## Detailed Vulnerability Analysis

!bash -c '
source /tmp/claudia_audit_context

if [ "$TOTAL_ISSUES" -gt 0 ]; then
    echo ""
    echo "🚨 DETAILED VULNERABILITY ANALYSIS"
    echo "=================================="

    # Display first 10 critical findings
    if [ -f "/tmp/claudia_audit_findings.txt" ]; then
        echo "📋 Security Findings (showing first 10):"
        head -50 "/tmp/claudia_audit_findings.txt" | head -50

        TOTAL_FINDINGS_LINES=$(wc -l < "/tmp/claudia_audit_findings.txt")
        if [ "$TOTAL_FINDINGS_LINES" -gt 50 ]; then
            echo ""
            echo "... ($TOTAL_FINDINGS_LINES total lines of findings)"
            echo "💡 See full report for complete details"
        fi
    fi
else
    echo ""
    echo "✅ NO SECURITY VULNERABILITIES DETECTED"
    echo "======================================="
    echo "🎉 Excellent! No obvious security issues found in the audited files."
fi
'

## Generate Audit Report

!bash -c '
source /tmp/claudia_audit_context

echo ""
echo "📄 Generating detailed audit report..."

REPORT_DIR=".claude-shared/project-management/data/security"
mkdir -p "$REPORT_DIR"

AUDIT_REPORT="$REPORT_DIR/audit-$AUDIT_ID.json"

# Read findings for JSON formatting
FINDINGS_TEXT=""
if [ -f "/tmp/claudia_audit_findings.txt" ]; then
    FINDINGS_TEXT=$(cat "/tmp/claudia_audit_findings.txt" | sed "s/\"/\\\\\"/g" | sed ":a;N;\$!ba;s/\n/\\\\n/g")
fi

# Create comprehensive audit report
cat > "$AUDIT_REPORT" << EOF
{
  "audit_id": "$AUDIT_ID",
  "timestamp": "$TIMESTAMP",
  "audit_target": "$AUDIT_TARGET",
  "audit_type": "$AUDIT_TYPE",
  "files_audited": $FILE_COUNT,
  "vulnerability_summary": {
    "critical": $CRITICAL_ISSUES,
    "high": $HIGH_ISSUES,
    "medium": $MEDIUM_ISSUES,
    "low": $LOW_ISSUES,
    "total": $TOTAL_ISSUES
  },
  "risk_assessment": {
    "risk_score": $RISK_SCORE,
    "risk_level": "$([ $RISK_SCORE -lt 20 ] && echo "LOW" || [ $RISK_SCORE -lt 50 ] && echo "MEDIUM" || [ $RISK_SCORE -lt 100 ] && echo "HIGH" || echo "CRITICAL")"
  },
  "detailed_findings": "$FINDINGS_TEXT",
  "recommendations": []
}
EOF

echo "AUDIT_REPORT=$AUDIT_REPORT" >> /tmp/claudia_audit_context
echo "✅ Audit report generated: $AUDIT_REPORT"
'

## Security Recommendations

!bash -c '
source /tmp/claudia_audit_context

echo ""
echo "💡 SECURITY RECOMMENDATIONS"
echo "============================"

if [ "$CRITICAL_ISSUES" -gt 0 ]; then
    echo "🚨 IMMEDIATE ACTION REQUIRED:"
    echo "   • Remove all hardcoded secrets and credentials"
    echo "   • Fix SQL injection vulnerabilities immediately"
    echo "   • Address command injection risks"
    echo "   • Review and secure authentication mechanisms"
    echo ""
fi

if [ "$HIGH_ISSUES" -gt 0 ]; then
    echo "⚠️  HIGH PRIORITY:"
    echo "   • Implement proper input validation and sanitization"
    echo "   • Fix XSS vulnerabilities with output encoding"
    echo "   • Secure file inclusion and upload mechanisms"
    echo "   • Review access controls and permissions"
    echo ""
fi

if [ "$MEDIUM_ISSUES" -gt 0 ]; then
    echo "🟡 MEDIUM PRIORITY:"
    echo "   • Update cryptographic functions to secure alternatives"
    echo "   • Implement Content Security Policy (CSP)"
    echo "   • Review error handling to prevent information disclosure"
    echo "   • Add security headers to HTTP responses"
    echo ""
fi

if [ "$LOW_ISSUES" -gt 0 ]; then
    echo "🔵 LOW PRIORITY:"
    echo "   • Remove debug logging statements from production code"
    echo "   • Clean up development artifacts"
    echo "   • Implement proper logging and monitoring"
    echo ""
fi

echo "🛡️  GENERAL SECURITY IMPROVEMENTS:"
echo "   • Regular security code reviews"
echo "   • Automated security testing in CI/CD pipeline"
echo "   • Dependency vulnerability scanning"
echo "   • Security training for development team"
echo "   • Implement security linting tools (ESLint security plugin, Bandit, etc.)"
'

## Log Audit Activity

!bash -c '
source /tmp/claudia_audit_context

echo ""
echo "📊 Logging security audit activity..."
mkdir -p .claude-shared/project-management/data

LOG_ENTRY="{\"timestamp\":\"$TIMESTAMP\",\"action\":\"security_audit_completed\",\"audit_id\":\"$AUDIT_ID\",\"audit_target\":\"$AUDIT_TARGET\",\"audit_type\":\"$AUDIT_TYPE\",\"files_audited\":$FILE_COUNT,\"total_issues\":$TOTAL_ISSUES,\"critical_issues\":$CRITICAL_ISSUES,\"risk_score\":$RISK_SCORE}"

echo "$LOG_ENTRY" >> .claude-shared/project-management/data/github-sync.jsonl

echo "✅ Security audit activity logged to audit trail"
'

## Final Summary

!bash -c '
source /tmp/claudia_audit_context

# Determine risk level for display
RISK_LEVEL="LOW"
RISK_COLOR="🟢"

if [ "$RISK_SCORE" -ge 100 ]; then
    RISK_LEVEL="CRITICAL"
    RISK_COLOR="🔴"
elif [ "$RISK_SCORE" -ge 50 ]; then
    RISK_LEVEL="HIGH"
    RISK_COLOR="🟠"
elif [ "$RISK_SCORE" -ge 20 ]; then
    RISK_LEVEL="MEDIUM"
    RISK_COLOR="🟡"
fi

echo ""
echo "✨ SECURITY AUDIT COMPLETE"
echo "=========================="
echo ""
echo "📊 Audit Results Summary:"
echo "   🆔 Audit ID: $AUDIT_ID"
echo "   🎯 Target: $AUDIT_TARGET ($AUDIT_TYPE)"
echo "   📁 Files Audited: $FILE_COUNT"
echo "   🚨 Total Issues: $TOTAL_ISSUES"
echo "   ⚡ Risk Score: $RISK_SCORE"
echo "   📊 Risk Level: $RISK_COLOR $RISK_LEVEL"
echo ""
echo "🔍 Issue Breakdown:"
echo "   🚨 Critical: $CRITICAL_ISSUES"
echo "   ⚠️  High: $HIGH_ISSUES"
echo "   🟡 Medium: $MEDIUM_ISSUES"
echo "   🔵 Low: $LOW_ISSUES"
echo ""

if [ "$CRITICAL_ISSUES" -gt 0 ]; then
    echo "🚨 CRITICAL: Immediate security attention required!"
elif [ "$HIGH_ISSUES" -gt 0 ]; then
    echo "⚠️  HIGH: Significant security issues need prompt attention"
elif [ "$MEDIUM_ISSUES" -gt 0 ]; then
    echo "🟡 MEDIUM: Some security improvements recommended"
elif [ "$LOW_ISSUES" -gt 0 ]; then
    echo "🔵 LOW: Minor security enhancements suggested"
else
    echo "✅ EXCELLENT: No security issues detected!"
fi

echo ""
echo "🔗 Next Steps:"
echo "   1. Review detailed findings above"
echo "   2. Prioritize critical and high-risk issues"
echo "   3. Implement recommended security fixes"
echo "   4. Run full security scan: /claudia:security:scan"
echo "   5. Integrate security audits into development workflow"
echo ""
echo "📄 Detailed report: $AUDIT_REPORT"

# Cleanup
rm -f /tmp/claudia_audit_context
rm -f /tmp/claudia_audit_files.txt
rm -f /tmp/claudia_audit_findings.txt
'