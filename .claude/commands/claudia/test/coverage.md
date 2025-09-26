---
description: "Generate detailed test coverage report with analysis and recommendations"
allowed-tools: ["Read", "Write", "Edit", "Bash"]
---

# 📊 Test Coverage Report

Generates comprehensive test coverage analysis with detailed metrics, uncovered code identification, and improvement recommendations.

## Processing Coverage Report Request: $ARGUMENTS

!bash -c 'echo "📊 Generating test coverage report..."'

## Initialize Coverage Analysis

!bash -c '
COVERAGE_ID="coverage-$(date +%s)"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
COVERAGE_ARGS="$ARGUMENTS"

echo "COVERAGE_ID=$COVERAGE_ID" > /tmp/claudia_coverage_context
echo "TIMESTAMP=$TIMESTAMP" >> /tmp/claudia_coverage_context
echo "COVERAGE_ARGS=$COVERAGE_ARGS" >> /tmp/claudia_coverage_context

echo "📊 Coverage Analysis Session:"
echo "   🆔 Coverage ID: $COVERAGE_ID"
echo "   🕒 Started: $TIMESTAMP"
echo "   📍 Directory: $(pwd)"
'

## Detect Project and Coverage Tools

!bash -c '
source /tmp/claudia_coverage_context

echo ""
echo "🔍 Detecting Coverage Tools"
echo "==========================="

PROJECT_TYPE=""
COVERAGE_TOOL=""
COVERAGE_COMMAND=""

# Detect project type and available coverage tools
if [ -f "package.json" ]; then
    echo "📦 Node.js project detected"
    PROJECT_TYPE="nodejs"

    # Check for coverage tools in package.json
    if grep -q "jest" package.json; then
        if grep -q "\"coverage\":" package.json; then
            COVERAGE_TOOL="jest-npm"
            COVERAGE_COMMAND="npm run coverage"
        else
            COVERAGE_TOOL="jest"
            COVERAGE_COMMAND="npx jest --coverage"
        fi
    elif grep -q "c8\|nyc" package.json; then
        COVERAGE_TOOL="c8"
        COVERAGE_COMMAND="npx c8 npm test"
    elif command -v nyc > /dev/null 2>&1; then
        COVERAGE_TOOL="nyc"
        COVERAGE_COMMAND="nyc npm test"
    else
        echo "   ⚠️  No coverage tool detected for Node.js"
    fi

elif [ -f "requirements.txt" ] || [ -f "setup.py" ] || [ -f "pyproject.toml" ]; then
    echo "🐍 Python project detected"
    PROJECT_TYPE="python"

    if command -v pytest > /dev/null 2>&1; then
        if command -v coverage > /dev/null 2>&1; then
            COVERAGE_TOOL="coverage"
            COVERAGE_COMMAND="coverage run -m pytest && coverage report"
        else
            COVERAGE_TOOL="pytest-cov"
            COVERAGE_COMMAND="pytest --cov=."
        fi
    else
        echo "   ⚠️  No coverage tool available for Python"
    fi

elif [ -f "Cargo.toml" ]; then
    echo "🦀 Rust project detected"
    PROJECT_TYPE="rust"

    if command -v cargo-tarpaulin > /dev/null 2>&1; then
        COVERAGE_TOOL="tarpaulin"
        COVERAGE_COMMAND="cargo tarpaulin"
    else
        COVERAGE_TOOL="llvm-cov"
        COVERAGE_COMMAND="cargo test"
        echo "   💡 For better coverage, install tarpaulin: cargo install cargo-tarpaulin"
    fi

elif [ -f "go.mod" ]; then
    echo "🐹 Go project detected"
    PROJECT_TYPE="go"
    COVERAGE_TOOL="go"
    COVERAGE_COMMAND="go test -coverprofile=coverage.out ./... && go tool cover -html=coverage.out -o coverage.html"

else
    echo "❓ Generic project - limited coverage analysis"
    PROJECT_TYPE="generic"
fi

echo "PROJECT_TYPE=$PROJECT_TYPE" >> /tmp/claudia_coverage_context
echo "COVERAGE_TOOL=$COVERAGE_TOOL" >> /tmp/claudia_coverage_context
echo "COVERAGE_COMMAND=$COVERAGE_COMMAND" >> /tmp/claudia_coverage_context

echo ""
echo "🎯 Detection Results:"
echo "   📁 Project Type: $PROJECT_TYPE"
echo "   📊 Coverage Tool: ${COVERAGE_TOOL:-'Not available'}"
echo "   ⚡ Command: ${COVERAGE_COMMAND:-'Not available'}"
'

## Execute Coverage Analysis

!bash -c '
source /tmp/claudia_coverage_context

echo ""
echo "📊 Executing Coverage Analysis"
echo "=============================="

if [ -z "$COVERAGE_COMMAND" ]; then
    echo "❌ No coverage command available"
    echo "💡 Consider installing a coverage tool for your project type"
    COVERAGE_RESULT="unavailable"
else
    echo "⚡ Running: $COVERAGE_COMMAND"
    echo ""

    # Create coverage output file
    COVERAGE_OUTPUT="/tmp/claudia_coverage_output_${COVERAGE_ID}.txt"

    # Execute coverage with timeout
    timeout 600 bash -c "$COVERAGE_COMMAND" > "$COVERAGE_OUTPUT" 2>&1
    COVERAGE_EXIT_CODE=$?

    echo "COVERAGE_EXIT_CODE=$COVERAGE_EXIT_CODE" >> /tmp/claudia_coverage_context
    echo "COVERAGE_OUTPUT=$COVERAGE_OUTPUT" >> /tmp/claudia_coverage_context

    if [ "$COVERAGE_EXIT_CODE" -eq 0 ]; then
        echo "✅ Coverage analysis completed successfully!"
        COVERAGE_RESULT="success"
    elif [ "$COVERAGE_EXIT_CODE" -eq 124 ]; then
        echo "⏱️  Coverage analysis timed out (10 minute limit)"
        COVERAGE_RESULT="timeout"
    else
        echo "❌ Coverage analysis failed with exit code: $COVERAGE_EXIT_CODE"
        COVERAGE_RESULT="failed"
    fi

    echo "COVERAGE_RESULT=$COVERAGE_RESULT" >> /tmp/claudia_coverage_context

    # Show coverage output
    echo ""
    echo "📋 Coverage Output:"
    echo "==================="
    cat "$COVERAGE_OUTPUT"
fi
'

## Parse Coverage Metrics

!bash -c '
source /tmp/claudia_coverage_context

if [ "$COVERAGE_RESULT" = "success" ]; then
    echo ""
    echo "📊 Parsing Coverage Metrics"
    echo "==========================="

    OVERALL_COVERAGE=0
    LINES_COVERED=0
    LINES_TOTAL=0
    FUNCTIONS_COVERAGE=0
    BRANCHES_COVERAGE=0

    # Parse based on coverage tool
    case "$COVERAGE_TOOL" in
        "jest"|"jest-npm")
            # Parse Jest coverage output
            if grep -q "All files" "$COVERAGE_OUTPUT"; then
                COVERAGE_LINE=$(grep "All files" "$COVERAGE_OUTPUT" | tail -1)

                # Extract percentages from Jest table format
                OVERALL_COVERAGE=$(echo "$COVERAGE_LINE" | awk "{print \$2}" | sed "s/%//")
                BRANCHES_COVERAGE=$(echo "$COVERAGE_LINE" | awk "{print \$3}" | sed "s/%//")
                FUNCTIONS_COVERAGE=$(echo "$COVERAGE_LINE" | awk "{print \$4}" | sed "s/%//")

                # Extract line numbers if available
                LINES_INFO=$(echo "$COVERAGE_LINE" | awk "{print \$5}")
                if [[ "$LINES_INFO" =~ ([0-9]+)/([0-9]+) ]]; then
                    LINES_COVERED="${BASH_REMATCH[1]}"
                    LINES_TOTAL="${BASH_REMATCH[2]}"
                fi
            fi
            ;;

        "coverage"|"pytest-cov")
            # Parse Python coverage output
            TOTAL_LINE=$(grep "TOTAL" "$COVERAGE_OUTPUT" | tail -1)
            if [ -n "$TOTAL_LINE" ]; then
                OVERALL_COVERAGE=$(echo "$TOTAL_LINE" | awk "{print \$NF}" | sed "s/%//")

                # Try to extract lines information
                LINES_TOTAL=$(echo "$TOTAL_LINE" | awk "{print \$2}")
                MISSING_LINES=$(echo "$TOTAL_LINE" | awk "{print \$3}")
                if [[ "$LINES_TOTAL" =~ ^[0-9]+$ ]] && [[ "$MISSING_LINES" =~ ^[0-9]+$ ]]; then
                    LINES_COVERED=$((LINES_TOTAL - MISSING_LINES))
                fi
            fi
            ;;

        "go")
            # Parse Go coverage output
            if grep -q "coverage:" "$COVERAGE_OUTPUT"; then
                COVERAGE_LINE=$(grep "coverage:" "$COVERAGE_OUTPUT" | tail -1)
                OVERALL_COVERAGE=$(echo "$COVERAGE_LINE" | grep -oE "[0-9]+\.[0-9]+" | head -1)
            fi
            ;;

        "tarpaulin")
            # Parse Rust tarpaulin output
            if grep -q "%" "$COVERAGE_OUTPUT"; then
                OVERALL_COVERAGE=$(grep "%" "$COVERAGE_OUTPUT" | grep -oE "[0-9]+\.[0-9]+%" | tail -1 | sed "s/%//")
            fi
            ;;
    esac

    # Store metrics
    echo "OVERALL_COVERAGE=$OVERALL_COVERAGE" >> /tmp/claudia_coverage_context
    echo "LINES_COVERED=$LINES_COVERED" >> /tmp/claudia_coverage_context
    echo "LINES_TOTAL=$LINES_TOTAL" >> /tmp/claudia_coverage_context
    echo "FUNCTIONS_COVERAGE=$FUNCTIONS_COVERAGE" >> /tmp/claudia_coverage_context
    echo "BRANCHES_COVERAGE=$BRANCHES_COVERAGE" >> /tmp/claudia_coverage_context

    echo "📊 Coverage Metrics Extracted:"
    echo "   📈 Overall Coverage: ${OVERALL_COVERAGE}%"

    if [ "$LINES_TOTAL" -gt 0 ]; then
        echo "   📄 Lines: $LINES_COVERED/$LINES_TOTAL"
    fi

    if [ "$FUNCTIONS_COVERAGE" -gt 0 ]; then
        echo "   ⚙️  Functions: ${FUNCTIONS_COVERAGE}%"
    fi

    if [ "$BRANCHES_COVERAGE" -gt 0 ]; then
        echo "   🌿 Branches: ${BRANCHES_COVERAGE}%"
    fi
fi
'

## Identify Uncovered Code

!bash -c '
source /tmp/claudia_coverage_context

if [ "$COVERAGE_RESULT" = "success" ]; then
    echo ""
    echo "🔍 Identifying Uncovered Code"
    echo "============================"

    UNCOVERED_FILES=""
    CRITICAL_UNCOVERED=""

    # Look for uncovered files in output
    case "$COVERAGE_TOOL" in
        "jest"|"jest-npm")
            # Extract files with low coverage from Jest output
            UNCOVERED_FILES=$(grep -E "│.*[0-5][0-9]\.[0-9]*.*│" "$COVERAGE_OUTPUT" | head -10 || echo "")
            CRITICAL_UNCOVERED=$(grep -E "│.*[0-4][0-9]\.[0-9]*.*│" "$COVERAGE_OUTPUT" | head -5 || echo "")
            ;;

        "coverage"|"pytest-cov")
            # Extract files with low coverage from Python coverage
            UNCOVERED_FILES=$(grep -E ".*[0-5][0-9]%$" "$COVERAGE_OUTPUT" | head -10 || echo "")
            CRITICAL_UNCOVERED=$(grep -E ".*[0-4][0-9]%$" "$COVERAGE_OUTPUT" | head -5 || echo "")
            ;;
    esac

    if [ -n "$UNCOVERED_FILES" ]; then
        echo "⚠️  Files with Low Coverage (< 60%):"
        echo "$UNCOVERED_FILES"
    fi

    if [ -n "$CRITICAL_UNCOVERED" ]; then
        echo ""
        echo "🚨 Critical: Files with Very Low Coverage (< 50%):"
        echo "$CRITICAL_UNCOVERED"
    fi

    if [ -z "$UNCOVERED_FILES" ]; then
        echo "✅ All files meet minimum coverage thresholds"
    fi
fi
'

## Coverage Quality Assessment

!bash -c '
source /tmp/claudia_coverage_context

if [ "$COVERAGE_RESULT" = "success" ]; then
    echo ""
    echo "🎯 Coverage Quality Assessment"
    echo "============================="

    COVERAGE_GRADE=""
    COVERAGE_COLOR=""
    QUALITY_SCORE=0

    # Convert coverage to integer for comparison
    COVERAGE_INT=${OVERALL_COVERAGE%.*}

    if [ "$COVERAGE_INT" -ge 90 ]; then
        COVERAGE_GRADE="A+ (Excellent)"
        COVERAGE_COLOR="🟢"
        QUALITY_SCORE=100
    elif [ "$COVERAGE_INT" -ge 80 ]; then
        COVERAGE_GRADE="A (Very Good)"
        COVERAGE_COLOR="🟢"
        QUALITY_SCORE=90
    elif [ "$COVERAGE_INT" -ge 70 ]; then
        COVERAGE_GRADE="B (Good)"
        COVERAGE_COLOR="🟡"
        QUALITY_SCORE=75
    elif [ "$COVERAGE_INT" -ge 60 ]; then
        COVERAGE_GRADE="C (Fair)"
        COVERAGE_COLOR="🟡"
        QUALITY_SCORE=60
    elif [ "$COVERAGE_INT" -ge 50 ]; then
        COVERAGE_GRADE="D (Poor)"
        COVERAGE_COLOR="🟠"
        QUALITY_SCORE=40
    else
        COVERAGE_GRADE="F (Inadequate)"
        COVERAGE_COLOR="🔴"
        QUALITY_SCORE=20
    fi

    echo "COVERAGE_GRADE=$COVERAGE_GRADE" >> /tmp/claudia_coverage_context
    echo "QUALITY_SCORE=$QUALITY_SCORE" >> /tmp/claudia_coverage_context

    echo "🏆 Coverage Assessment:"
    echo "   📊 Overall Coverage: ${OVERALL_COVERAGE}%"
    echo "   🎯 Grade: $COVERAGE_COLOR $COVERAGE_GRADE"
    echo "   📈 Quality Score: $QUALITY_SCORE/100"

    # Provide specific feedback based on coverage level
    echo ""
    echo "💬 Assessment Details:"

    if [ "$COVERAGE_INT" -ge 90 ]; then
        echo "   🎉 Excellent coverage! Your code is well-tested."
    elif [ "$COVERAGE_INT" -ge 80 ]; then
        echo "   👍 Very good coverage! Consider improving critical paths."
    elif [ "$COVERAGE_INT" -ge 70 ]; then
        echo "   📊 Good baseline coverage. Focus on edge cases and error paths."
    elif [ "$COVERAGE_INT" -ge 60 ]; then
        echo "   ⚠️  Fair coverage. Significant improvement needed for production code."
    else
        echo "   🚨 Coverage is too low for production. Immediate attention required."
    fi
fi
'

## Generate Coverage Report

!bash -c '
source /tmp/claudia_coverage_context

echo ""
echo "📄 Generating detailed coverage report..."

REPORT_DIR=".claude-shared/project-management/data/coverage"
mkdir -p "$REPORT_DIR"

COVERAGE_REPORT="$REPORT_DIR/coverage-$COVERAGE_ID.json"

# Create comprehensive coverage report
cat > "$COVERAGE_REPORT" << EOF
{
  "coverage_id": "$COVERAGE_ID",
  "timestamp": "$TIMESTAMP",
  "project_type": "$PROJECT_TYPE",
  "coverage_tool": "$COVERAGE_TOOL",
  "coverage_command": "$COVERAGE_COMMAND",
  "execution": {
    "result": "$COVERAGE_RESULT",
    "exit_code": ${COVERAGE_EXIT_CODE:-0}
  },
  "metrics": {
    "overall_coverage": ${OVERALL_COVERAGE:-0},
    "lines_covered": ${LINES_COVERED:-0},
    "lines_total": ${LINES_TOTAL:-0},
    "functions_coverage": ${FUNCTIONS_COVERAGE:-0},
    "branches_coverage": ${BRANCHES_COVERAGE:-0}
  },
  "assessment": {
    "grade": "$COVERAGE_GRADE",
    "quality_score": ${QUALITY_SCORE:-0}
  },
  "output_file": "$COVERAGE_OUTPUT"
}
EOF

echo "COVERAGE_REPORT=$COVERAGE_REPORT" >> /tmp/claudia_coverage_context
echo "✅ Coverage report generated: $COVERAGE_REPORT"
'

## Coverage Improvement Recommendations

!bash -c '
source /tmp/claudia_coverage_context

echo ""
echo "💡 COVERAGE IMPROVEMENT RECOMMENDATIONS"
echo "======================================="

if [ "$COVERAGE_RESULT" = "unavailable" ]; then
    echo "🛠️  SETUP RECOMMENDATIONS:"
    case "$PROJECT_TYPE" in
        "nodejs")
            echo "   • Install Jest: npm install --save-dev jest"
            echo "   • Add coverage script to package.json:"
            echo "     \"coverage\": \"jest --coverage\""
            echo "   • Alternative: Install NYC for non-Jest projects"
            ;;
        "python")
            echo "   • Install coverage.py: pip install coverage"
            echo "   • Or install pytest-cov: pip install pytest-cov"
            echo "   • Run: coverage run -m pytest && coverage report"
            ;;
        "rust")
            echo "   • Install tarpaulin: cargo install cargo-tarpaulin"
            echo "   • Run: cargo tarpaulin --verbose"
            ;;
        "go")
            echo "   • Use built-in Go coverage: go test -coverprofile=coverage.out ./..."
            echo "   • Generate HTML report: go tool cover -html=coverage.out"
            ;;
    esac
    echo ""
fi

if [ "$COVERAGE_RESULT" = "success" ]; then
    COVERAGE_INT=${OVERALL_COVERAGE%.*}

    if [ "$COVERAGE_INT" -lt 80 ]; then
        echo "📈 COVERAGE IMPROVEMENT:"
        echo "   • Target 80%+ coverage for production code"
        echo "   • Focus on business logic and critical functions"
        echo "   • Add tests for error handling and edge cases"
        echo "   • Test both positive and negative scenarios"
        echo ""
    fi

    if [ "$COVERAGE_INT" -lt 60 ]; then
        echo "🚨 IMMEDIATE ACTIONS:"
        echo "   • Add unit tests for core functionality"
        echo "   • Test all public API methods/functions"
        echo "   • Cover main execution paths"
        echo "   • Implement integration tests"
        echo ""
    fi

    echo "🎯 TESTING STRATEGIES:"
    echo "   • Unit Tests: Test individual functions/methods"
    echo "   • Integration Tests: Test component interactions"
    echo "   • End-to-End Tests: Test complete user workflows"
    echo "   • Edge Case Tests: Test boundary conditions"
    echo "   • Error Path Tests: Test exception handling"
    echo ""

    echo "📊 COVERAGE TARGETS BY FILE TYPE:"
    echo "   • Business Logic: 90%+"
    echo "   • API Endpoints: 85%+"
    echo "   • Utility Functions: 80%+"
    echo "   • Configuration: 70%+"
    echo "   • UI Components: 60%+"
fi

echo "🔧 BEST PRACTICES:"
echo "   • Write tests before or alongside code (TDD)"
echo "   • Keep tests simple and focused"
echo "   • Use meaningful test names"
echo "   • Test one thing at a time"
echo "   • Mock external dependencies"
echo "   • Regularly review and update tests"
'

## Log Coverage Activity

!bash -c '
source /tmp/claudia_coverage_context

echo ""
echo "📊 Logging coverage activity..."
mkdir -p .claude-shared/project-management/data

LOG_ENTRY="{\"timestamp\":\"$TIMESTAMP\",\"action\":\"coverage_analyzed\",\"coverage_id\":\"$COVERAGE_ID\",\"project_type\":\"$PROJECT_TYPE\",\"coverage_tool\":\"$COVERAGE_TOOL\",\"result\":\"$COVERAGE_RESULT\",\"overall_coverage\":${OVERALL_COVERAGE:-0},\"quality_score\":${QUALITY_SCORE:-0}}"

echo "$LOG_ENTRY" >> .claude-shared/project-management/data/github-sync.jsonl

echo "✅ Coverage activity logged to audit trail"
'

## Final Summary

!bash -c '
source /tmp/claudia_coverage_context

echo ""
echo "✨ COVERAGE ANALYSIS COMPLETE"
echo "============================="
echo ""
echo "📊 Coverage Session Summary:"
echo "   🆔 Coverage ID: $COVERAGE_ID"
echo "   📁 Project: $PROJECT_TYPE"
echo "   🛠️  Tool: ${COVERAGE_TOOL:-'Not available'}"
echo "   ⚡ Result: $COVERAGE_RESULT"
echo ""

if [ "$COVERAGE_RESULT" = "success" ]; then
    echo "📈 Coverage Metrics:"
    echo "   📊 Overall: ${OVERALL_COVERAGE}%"

    if [ "$LINES_TOTAL" -gt 0 ]; then
        echo "   📄 Lines: $LINES_COVERED/$LINES_TOTAL"
    fi

    if [ "$FUNCTIONS_COVERAGE" -gt 0 ]; then
        echo "   ⚙️  Functions: ${FUNCTIONS_COVERAGE}%"
    fi

    if [ "$BRANCHES_COVERAGE" -gt 0 ]; then
        echo "   🌿 Branches: ${BRANCHES_COVERAGE}%"
    fi

    echo "   🏆 Grade: $COVERAGE_GRADE"
    echo "   📈 Quality Score: ${QUALITY_SCORE}/100"
fi

echo ""

case "$COVERAGE_RESULT" in
    "success")
        COVERAGE_INT=${OVERALL_COVERAGE%.*}
        if [ "$COVERAGE_INT" -ge 80 ]; then
            echo "🎉 Excellent coverage! Your code is well-protected by tests."
        elif [ "$COVERAGE_INT" -ge 60 ]; then
            echo "👍 Good coverage foundation. Consider adding more comprehensive tests."
        else
            echo "⚠️  Coverage needs improvement. Focus on critical code paths."
        fi
        ;;
    "failed")
        echo "❌ Coverage analysis failed. Check your test setup and configuration."
        ;;
    "timeout")
        echo "⏱️  Coverage analysis timed out. Consider optimizing your test suite."
        ;;
    "unavailable")
        echo "🛠️  Coverage tools not available. Set up coverage analysis for better insights."
        ;;
esac

echo ""
echo "🔗 Next Steps:"

if [ "$COVERAGE_RESULT" = "success" ]; then
    echo "   1. 📊 Review uncovered code sections"
    echo "   2. 🧪 Add tests for critical uncovered paths"
    echo "   3. 🎯 Set coverage thresholds in CI/CD"
    echo "   4. 🔄 Run coverage regularly: /claudia:test:coverage"
else
    echo "   1. 🛠️  Set up coverage tools for your project"
    echo "   2. 🧪 Run tests first: /claudia:test:run"
    echo "   3. 🔄 Try coverage analysis again"
fi

echo "   5. 📈 Integrate coverage into development workflow"
echo "   6. 🎯 Set team coverage standards and goals"
echo ""
echo "📄 Detailed report: $COVERAGE_REPORT"

# Cleanup
rm -f /tmp/claudia_coverage_context
'