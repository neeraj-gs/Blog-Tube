---
description: "Run project tests with automatic framework detection and reporting"
allowed-tools: ["Read", "Write", "Edit", "Bash"]
---

# 🧪 Run Project Tests

Automatically detects test framework and runs comprehensive test suite with detailed reporting and coverage analysis.

## Processing Test Run Request: $ARGUMENTS

!bash -c 'echo "🧪 Starting test execution..."'

## Initialize Test Session

!bash -c '
TEST_ID="test-run-$(date +%s)"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
TEST_ARGS="$ARGUMENTS"

echo "TEST_ID=$TEST_ID" > /tmp/claudia_test_context
echo "TIMESTAMP=$TIMESTAMP" >> /tmp/claudia_test_context
echo "TEST_ARGS=$TEST_ARGS" >> /tmp/claudia_test_context

echo "🧪 Test Session Initialized:"
echo "   🆔 Test ID: $TEST_ID"
echo "   🕒 Started: $TIMESTAMP"
echo "   📍 Directory: $(pwd)"
echo "   📝 Args: $TEST_ARGS"
'

## Detect Test Framework

!bash -c '
source /tmp/claudia_test_context

echo ""
echo "🔍 Detecting Test Framework"
echo "=========================="

TEST_FRAMEWORK=""
TEST_COMMAND=""
PROJECT_TYPE=""

# Detect project type and test framework
if [ -f "package.json" ]; then
    echo "📦 Node.js project detected"
    PROJECT_TYPE="nodejs"

    # Check for test scripts in package.json
    if grep -q "\"test\":" package.json; then
        TEST_SCRIPT=$(grep "\"test\":" package.json | sed "s/.*\"test\":\s*\"\([^\"]*\)\".*/\1/")
        echo "   ✅ Test script found: $TEST_SCRIPT"

        # Detect framework based on script content
        if echo "$TEST_SCRIPT" | grep -q "jest"; then
            TEST_FRAMEWORK="jest"
            TEST_COMMAND="npm test"
        elif echo "$TEST_SCRIPT" | grep -q "mocha"; then
            TEST_FRAMEWORK="mocha"
            TEST_COMMAND="npm test"
        elif echo "$TEST_SCRIPT" | grep -q "vitest"; then
            TEST_FRAMEWORK="vitest"
            TEST_COMMAND="npm test"
        elif echo "$TEST_SCRIPT" | grep -q "cypress"; then
            TEST_FRAMEWORK="cypress"
            TEST_COMMAND="npm test"
        else
            TEST_FRAMEWORK="npm"
            TEST_COMMAND="npm test"
        fi
    else
        echo "   ⚠️  No test script found in package.json"

        # Check for test frameworks in dependencies
        if grep -q "jest" package.json; then
            TEST_FRAMEWORK="jest"
            TEST_COMMAND="npx jest"
        elif grep -q "mocha" package.json; then
            TEST_FRAMEWORK="mocha"
            TEST_COMMAND="npx mocha"
        elif grep -q "vitest" package.json; then
            TEST_FRAMEWORK="vitest"
            TEST_COMMAND="npx vitest run"
        else
            echo "   ❌ No recognized test framework found"
        fi
    fi

elif [ -f "requirements.txt" ] || [ -f "setup.py" ] || [ -f "pyproject.toml" ]; then
    echo "🐍 Python project detected"
    PROJECT_TYPE="python"

    if command -v pytest > /dev/null 2>&1; then
        TEST_FRAMEWORK="pytest"
        TEST_COMMAND="pytest"
    elif command -v python -m unittest > /dev/null 2>&1; then
        TEST_FRAMEWORK="unittest"
        TEST_COMMAND="python -m unittest discover"
    else
        echo "   ❌ No Python test framework available"
    fi

elif [ -f "Cargo.toml" ]; then
    echo "🦀 Rust project detected"
    PROJECT_TYPE="rust"
    TEST_FRAMEWORK="cargo"
    TEST_COMMAND="cargo test"

elif [ -f "go.mod" ]; then
    echo "🐹 Go project detected"
    PROJECT_TYPE="go"
    TEST_FRAMEWORK="go"
    TEST_COMMAND="go test ./..."

else
    echo "❓ Generic project - attempting common test commands"
    PROJECT_TYPE="generic"
    TEST_FRAMEWORK="generic"
fi

echo "PROJECT_TYPE=$PROJECT_TYPE" >> /tmp/claudia_test_context
echo "TEST_FRAMEWORK=$TEST_FRAMEWORK" >> /tmp/claudia_test_context
echo "TEST_COMMAND=$TEST_COMMAND" >> /tmp/claudia_test_context

echo ""
echo "🎯 Detection Results:"
echo "   📁 Project Type: $PROJECT_TYPE"
echo "   🧪 Test Framework: $TEST_FRAMEWORK"
echo "   ⚡ Command: $TEST_COMMAND"
'

## Pre-Test Validation

!bash -c '
source /tmp/claudia_test_context

echo ""
echo "✅ Pre-Test Validation"
echo "======================"

VALIDATION_ISSUES=""

# Check if test command is available
if [ -n "$TEST_COMMAND" ]; then
    FIRST_CMD=$(echo "$TEST_COMMAND" | cut -d" " -f1)

    if ! command -v "$FIRST_CMD" > /dev/null 2>&1; then
        VALIDATION_ISSUES="$VALIDATION_ISSUES\n❌ Command not found: $FIRST_CMD"
    fi
fi

# Check for test files
TEST_FILES_COUNT=0
case "$PROJECT_TYPE" in
    "nodejs")
        TEST_FILES_COUNT=$(find . -name "*.test.js" -o -name "*.spec.js" -o -name "*.test.ts" -o -name "*.spec.ts" -o -name "__tests__" -type f 2>/dev/null | wc -l | xargs)
        ;;
    "python")
        TEST_FILES_COUNT=$(find . -name "test_*.py" -o -name "*_test.py" 2>/dev/null | wc -l | xargs)
        ;;
    "rust")
        # Rust tests are typically in the same files as source code
        TEST_FILES_COUNT=$(grep -r "#\[test\]" . 2>/dev/null | wc -l | xargs)
        ;;
    "go")
        TEST_FILES_COUNT=$(find . -name "*_test.go" 2>/dev/null | wc -l | xargs)
        ;;
esac

echo "TEST_FILES_COUNT=$TEST_FILES_COUNT" >> /tmp/claudia_test_context

echo "🔍 Validation Results:"
echo "   📄 Test files found: $TEST_FILES_COUNT"

if [ "$TEST_FILES_COUNT" -eq 0 ]; then
    VALIDATION_ISSUES="$VALIDATION_ISSUES\n⚠️  No test files found"
fi

if [ -n "$VALIDATION_ISSUES" ]; then
    echo ""
    echo "⚠️  Validation Issues:"
    echo -e "$VALIDATION_ISSUES"
    echo ""
    echo "💡 Consider:"
    echo "   • Installing test framework dependencies"
    echo "   • Creating test files for your code"
    echo "   • Checking project structure"
fi

echo "✅ Pre-test validation complete"
'

## Execute Tests

!bash -c '
source /tmp/claudia_test_context

echo ""
echo "🚀 Executing Tests"
echo "=================="

if [ -z "$TEST_COMMAND" ]; then
    echo "❌ No test command available - skipping test execution"
    echo "TEST_RESULT=skipped" >> /tmp/claudia_test_context
else
    echo "⚡ Running: $TEST_COMMAND"
    echo ""

    # Create test output files
    TEST_OUTPUT_FILE="/tmp/claudia_test_output_${TEST_ID}.txt"
    TEST_RESULTS_FILE="/tmp/claudia_test_results_${TEST_ID}.json"

    # Execute tests with timeout and capture output
    timeout 300 bash -c "$TEST_COMMAND" > "$TEST_OUTPUT_FILE" 2>&1
    TEST_EXIT_CODE=$?

    # Store results
    echo "TEST_EXIT_CODE=$TEST_EXIT_CODE" >> /tmp/claudia_test_context
    echo "TEST_OUTPUT_FILE=$TEST_OUTPUT_FILE" >> /tmp/claudia_test_context

    if [ "$TEST_EXIT_CODE" -eq 0 ]; then
        echo "✅ Tests completed successfully!"
        TEST_RESULT="success"
    elif [ "$TEST_EXIT_CODE" -eq 124 ]; then
        echo "⏱️  Tests timed out (5 minute limit)"
        TEST_RESULT="timeout"
    else
        echo "❌ Tests failed with exit code: $TEST_EXIT_CODE"
        TEST_RESULT="failed"
    fi

    echo "TEST_RESULT=$TEST_RESULT" >> /tmp/claudia_test_context

    # Show test output (last 30 lines)
    echo ""
    echo "📋 Test Output (last 30 lines):"
    echo "================================"
    tail -30 "$TEST_OUTPUT_FILE"
fi
'

## Parse Test Results

!bash -c '
source /tmp/claudia_test_context

if [ "$TEST_RESULT" != "skipped" ]; then
    echo ""
    echo "📊 Parsing Test Results"
    echo "======================="

    TESTS_PASSED=0
    TESTS_FAILED=0
    TESTS_SKIPPED=0
    TEST_COVERAGE=0

    # Parse results based on framework
    case "$TEST_FRAMEWORK" in
        "jest")
            if [ -f "$TEST_OUTPUT_FILE" ]; then
                TESTS_PASSED=$(grep "✓" "$TEST_OUTPUT_FILE" | wc -l | xargs || echo "0")
                TESTS_FAILED=$(grep "✕" "$TEST_OUTPUT_FILE" | wc -l | xargs || echo "0")

                # Try to extract coverage from Jest output
                COVERAGE_LINE=$(grep "All files" "$TEST_OUTPUT_FILE" | tail -1)
                if [ -n "$COVERAGE_LINE" ]; then
                    TEST_COVERAGE=$(echo "$COVERAGE_LINE" | grep -oE "[0-9]+\.[0-9]+%" | head -1 | sed "s/%//")
                fi
            fi
            ;;

        "mocha")
            if [ -f "$TEST_OUTPUT_FILE" ]; then
                PASSING_LINE=$(grep "passing" "$TEST_OUTPUT_FILE" | tail -1)
                FAILING_LINE=$(grep "failing" "$TEST_OUTPUT_FILE" | tail -1)

                if [ -n "$PASSING_LINE" ]; then
                    TESTS_PASSED=$(echo "$PASSING_LINE" | grep -oE "[0-9]+" | head -1 || echo "0")
                fi

                if [ -n "$FAILING_LINE" ]; then
                    TESTS_FAILED=$(echo "$FAILING_LINE" | grep -oE "[0-9]+" | head -1 || echo "0")
                fi
            fi
            ;;

        "pytest")
            if [ -f "$TEST_OUTPUT_FILE" ]; then
                RESULT_LINE=$(grep -E "[0-9]+ passed|[0-9]+ failed|[0-9]+ skipped" "$TEST_OUTPUT_FILE" | tail -1)

                if [ -n "$RESULT_LINE" ]; then
                    TESTS_PASSED=$(echo "$RESULT_LINE" | grep -oE "[0-9]+ passed" | grep -oE "[0-9]+" || echo "0")
                    TESTS_FAILED=$(echo "$RESULT_LINE" | grep -oE "[0-9]+ failed" | grep -oE "[0-9]+" || echo "0")
                    TESTS_SKIPPED=$(echo "$RESULT_LINE" | grep -oE "[0-9]+ skipped" | grep -oE "[0-9]+" || echo "0")
                fi
            fi
            ;;

        "cargo")
            if [ -f "$TEST_OUTPUT_FILE" ]; then
                RESULT_LINE=$(grep "test result:" "$TEST_OUTPUT_FILE" | tail -1)
                if [ -n "$RESULT_LINE" ]; then
                    TESTS_PASSED=$(echo "$RESULT_LINE" | grep -oE "[0-9]+ passed" | grep -oE "[0-9]+" || echo "0")
                    TESTS_FAILED=$(echo "$RESULT_LINE" | grep -oE "[0-9]+ failed" | grep -oE "[0-9]+" || echo "0")
                fi
            fi
            ;;

        "go")
            if [ -f "$TEST_OUTPUT_FILE" ]; then
                if grep -q "PASS" "$TEST_OUTPUT_FILE"; then
                    TESTS_PASSED=$(grep -c "PASS" "$TEST_OUTPUT_FILE" || echo "0")
                fi

                if grep -q "FAIL" "$TEST_OUTPUT_FILE"; then
                    TESTS_FAILED=$(grep -c "FAIL" "$TEST_OUTPUT_FILE" || echo "0")
                fi
            fi
            ;;
    esac

    TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED + TESTS_SKIPPED))

    echo "TESTS_PASSED=$TESTS_PASSED" >> /tmp/claudia_test_context
    echo "TESTS_FAILED=$TESTS_FAILED" >> /tmp/claudia_test_context
    echo "TESTS_SKIPPED=$TESTS_SKIPPED" >> /tmp/claudia_test_context
    echo "TOTAL_TESTS=$TOTAL_TESTS" >> /tmp/claudia_test_context
    echo "TEST_COVERAGE=$TEST_COVERAGE" >> /tmp/claudia_test_context

    echo "📊 Test Results Summary:"
    echo "   ✅ Passed: $TESTS_PASSED"
    echo "   ❌ Failed: $TESTS_FAILED"
    echo "   ⏭️  Skipped: $TESTS_SKIPPED"
    echo "   📈 Total: $TOTAL_TESTS"

    if [ -n "$TEST_COVERAGE" ] && [ "$TEST_COVERAGE" != "0" ]; then
        echo "   📊 Coverage: ${TEST_COVERAGE}%"
    fi
fi
'

## Generate Test Report

!bash -c '
source /tmp/claudia_test_context

echo ""
echo "📄 Generating test report..."

REPORT_DIR=".claude-shared/project-management/data/tests"
mkdir -p "$REPORT_DIR"

TEST_REPORT="$REPORT_DIR/run-$TEST_ID.json"

# Create comprehensive test report
cat > "$TEST_REPORT" << EOF
{
  "test_id": "$TEST_ID",
  "timestamp": "$TIMESTAMP",
  "project_type": "$PROJECT_TYPE",
  "test_framework": "$TEST_FRAMEWORK",
  "test_command": "$TEST_COMMAND",
  "test_args": "$TEST_ARGS",
  "execution": {
    "result": "$TEST_RESULT",
    "exit_code": ${TEST_EXIT_CODE:-0},
    "files_found": $TEST_FILES_COUNT
  },
  "results": {
    "total_tests": ${TOTAL_TESTS:-0},
    "passed": ${TESTS_PASSED:-0},
    "failed": ${TESTS_FAILED:-0},
    "skipped": ${TESTS_SKIPPED:-0},
    "coverage": ${TEST_COVERAGE:-0}
  },
  "output_file": "$TEST_OUTPUT_FILE"
}
EOF

echo "TEST_REPORT=$TEST_REPORT" >> /tmp/claudia_test_context
echo "✅ Test report generated: $TEST_REPORT"
'

## Test Quality Analysis

!bash -c '
source /tmp/claudia_test_context

echo ""
echo "🎯 Test Quality Analysis"
echo "======================="

QUALITY_SCORE=100
QUALITY_ISSUES=""

# Calculate test quality score
if [ "${TOTAL_TESTS:-0}" -eq 0 ]; then
    QUALITY_SCORE=0
    QUALITY_ISSUES="$QUALITY_ISSUES\n⚠️  No tests found"
elif [ "${TESTS_FAILED:-0}" -gt 0 ]; then
    FAILURE_RATE=$(( (TESTS_FAILED * 100) / TOTAL_TESTS ))
    QUALITY_SCORE=$((QUALITY_SCORE - FAILURE_RATE))
    QUALITY_ISSUES="$QUALITY_ISSUES\n❌ Test failures: $TESTS_FAILED/$TOTAL_TESTS ($FAILURE_RATE%)"
fi

# Coverage analysis
if [ -n "$TEST_COVERAGE" ] && [ "$TEST_COVERAGE" != "0" ]; then
    if [ "${TEST_COVERAGE%.*}" -lt 50 ]; then
        QUALITY_SCORE=$((QUALITY_SCORE - 30))
        QUALITY_ISSUES="$QUALITY_ISSUES\n📊 Low test coverage: ${TEST_COVERAGE}%"
    elif [ "${TEST_COVERAGE%.*}" -lt 80 ]; then
        QUALITY_SCORE=$((QUALITY_SCORE - 15))
        QUALITY_ISSUES="$QUALITY_ISSUES\n📊 Moderate test coverage: ${TEST_COVERAGE}%"
    fi
fi

# File to test ratio analysis
if [ "$PROJECT_TYPE" = "nodejs" ] && [ "$TEST_FILES_COUNT" -gt 0 ]; then
    SOURCE_FILES=$(find . -name "*.js" -o -name "*.ts" | grep -v node_modules | grep -v test | wc -l | xargs)
    if [ "$SOURCE_FILES" -gt 0 ]; then
        TEST_RATIO=$(( (TEST_FILES_COUNT * 100) / SOURCE_FILES ))
        if [ "$TEST_RATIO" -lt 30 ]; then
            QUALITY_SCORE=$((QUALITY_SCORE - 20))
            QUALITY_ISSUES="$QUALITY_ISSUES\n📁 Low test file ratio: $TEST_RATIO%"
        fi
    fi
fi

if [ "$QUALITY_SCORE" -lt 0 ]; then
    QUALITY_SCORE=0
fi

echo "QUALITY_SCORE=$QUALITY_SCORE" >> /tmp/claudia_test_context

echo "📊 Quality Assessment:"
echo "   🎯 Quality Score: $QUALITY_SCORE/100"

if [ -n "$QUALITY_ISSUES" ]; then
    echo "   🔍 Issues Identified:"
    echo -e "$QUALITY_ISSUES"
else
    echo "   ✅ Test quality looks good"
fi
'

## Recommendations

!bash -c '
source /tmp/claudia_test_context

echo ""
echo "💡 TESTING RECOMMENDATIONS"
echo "=========================="

if [ "$TEST_RESULT" = "failed" ]; then
    echo "❌ IMMEDIATE ACTION REQUIRED:"
    echo "   • Fix failing tests before merging code"
    echo "   • Review test output for error details"
    echo "   • Consider debugging failed test cases"
    echo ""
fi

if [ "${TOTAL_TESTS:-0}" -eq 0 ]; then
    echo "🧪 TEST COVERAGE:"
    echo "   • Add unit tests for core functionality"
    echo "   • Create integration tests for API endpoints"
    echo "   • Implement end-to-end tests for critical user flows"
    echo ""
fi

if [ -n "$TEST_COVERAGE" ] && [ "${TEST_COVERAGE%.*}" -lt 80 ]; then
    echo "📊 COVERAGE IMPROVEMENT:"
    echo "   • Target 80%+ code coverage"
    echo "   • Focus on untested critical paths"
    echo "   • Add edge case testing"
    echo ""
fi

if [ "$TEST_FILES_COUNT" -lt 5 ]; then
    echo "📁 TEST EXPANSION:"
    echo "   • Create more comprehensive test files"
    echo "   • Add tests for error handling"
    echo "   • Include performance tests if applicable"
    echo ""
fi

echo "🎯 BEST PRACTICES:"
echo "   • Run tests before every commit"
echo "   • Maintain fast test execution (< 2 minutes)"
echo "   • Use descriptive test names"
echo "   • Keep tests independent and isolated"
echo "   • Mock external dependencies"
echo "   • Regular test maintenance and updates"
'

## Log Test Activity

!bash -c '
source /tmp/claudia_test_context

echo ""
echo "📊 Logging test activity..."
mkdir -p .claude-shared/project-management/data

LOG_ENTRY="{\"timestamp\":\"$TIMESTAMP\",\"action\":\"tests_executed\",\"test_id\":\"$TEST_ID\",\"project_type\":\"$PROJECT_TYPE\",\"test_framework\":\"$TEST_FRAMEWORK\",\"result\":\"$TEST_RESULT\",\"total_tests\":${TOTAL_TESTS:-0},\"passed\":${TESTS_PASSED:-0},\"failed\":${TESTS_FAILED:-0},\"quality_score\":$QUALITY_SCORE}"

echo "$LOG_ENTRY" >> .claude-shared/project-management/data/github-sync.jsonl

echo "✅ Test activity logged to audit trail"
'

## Final Summary

!bash -c '
source /tmp/claudia_test_context

echo ""
echo "✨ TEST EXECUTION COMPLETE"
echo "=========================="
echo ""
echo "📊 Test Session Summary:"
echo "   🆔 Test ID: $TEST_ID"
echo "   📁 Project: $PROJECT_TYPE"
echo "   🧪 Framework: $TEST_FRAMEWORK"
echo "   ⚡ Result: $TEST_RESULT"
echo ""

if [ "$TEST_RESULT" != "skipped" ]; then
    echo "📈 Test Metrics:"
    echo "   📄 Test Files: $TEST_FILES_COUNT"
    echo "   📊 Total Tests: ${TOTAL_TESTS:-0}"
    echo "   ✅ Passed: ${TESTS_PASSED:-0}"
    echo "   ❌ Failed: ${TESTS_FAILED:-0}"
    echo "   ⏭️  Skipped: ${TESTS_SKIPPED:-0}"

    if [ -n "$TEST_COVERAGE" ] && [ "$TEST_COVERAGE" != "0" ]; then
        echo "   📊 Coverage: ${TEST_COVERAGE}%"
    fi

    echo "   🎯 Quality Score: $QUALITY_SCORE/100"
fi

echo ""

if [ "$TEST_RESULT" = "success" ]; then
    echo "🎉 All tests passed! Great work!"
elif [ "$TEST_RESULT" = "failed" ]; then
    echo "🔧 Some tests failed. Please review and fix before proceeding."
elif [ "$TEST_RESULT" = "timeout" ]; then
    echo "⏱️  Tests timed out. Consider optimizing test performance."
else
    echo "ℹ️  Test execution was skipped due to configuration issues."
fi

echo ""
echo "🔗 Next Steps:"

if [ "$TEST_RESULT" = "success" ]; then
    echo "   1. ✅ Tests passing - ready to proceed"
    echo "   2. 📊 Review coverage report if available"
    echo "   3. 🔄 Consider adding more tests for edge cases"
else
    echo "   1. 🔍 Review test output for issues"
    echo "   2. 🔧 Fix failing tests"
    echo "   3. 🔄 Run tests again: /claudia:test:run"
fi

echo "   4. 📊 Generate coverage report: /claudia:test:coverage"
echo "   5. 🚀 Integrate into CI/CD pipeline"
echo ""
echo "📄 Detailed report: $TEST_REPORT"

# Cleanup temporary files (keep output file for reference)
rm -f /tmp/claudia_test_context
'