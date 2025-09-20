---
description: Analyze application performance metrics and identify optimization opportunities
---

# Performance Analysis Tool

Comprehensive performance analysis for Node.js Express applications, focusing on bundle size, dependencies, memory usage, and code quality metrics.

## Performance Metrics Collection

### 1. Bundle Size Analysis
!echo "📦 Analyzing bundle size and dependencies..."
!echo "## Bundle Analysis Report" > PERFORMANCE_REPORT.md
!echo "Generated on $(date)" >> PERFORMANCE_REPORT.md
!echo "" >> PERFORMANCE_REPORT.md

!echo "### Dependency Analysis" >> PERFORMANCE_REPORT.md
!echo "- Total dependencies: $(npm ls --depth=0 2>/dev/null | grep -c "─" || echo "unknown")" >> PERFORMANCE_REPORT.md
!echo "- Production dependencies: $(npm ls --prod --depth=0 2>/dev/null | grep -c "─" || echo "unknown")" >> PERFORMANCE_REPORT.md
!echo "- Development dependencies: $(npm ls --dev --depth=0 2>/dev/null | grep -c "─" || echo "unknown")" >> PERFORMANCE_REPORT.md
!echo "- node_modules size: $(du -sh node_modules 2>/dev/null | cut -f1 || echo "unknown")" >> PERFORMANCE_REPORT.md
!echo "" >> PERFORMANCE_REPORT.md

### 2. Code Quality Metrics
!echo "🔍 Analyzing code quality metrics..."
!echo "### Code Quality Metrics" >> PERFORMANCE_REPORT.md
!echo "- JavaScript files: $(find . -name "*.js" -not -path "./node_modules/*" | wc -l)" >> PERFORMANCE_REPORT.md
!echo "- Total lines of code: $(find . -name "*.js" -not -path "./node_modules/*" -exec wc -l {} + | tail -1 | awk '{print $1}')" >> PERFORMANCE_REPORT.md
!echo "- Average file size: $(find . -name "*.js" -not -path "./node_modules/*" -exec wc -l {} + | awk 'END{print int($1/NR)} NR>1' || echo "unknown") lines" >> PERFORMANCE_REPORT.md
!echo "" >> PERFORMANCE_REPORT.md

### 3. Debug Code Detection
!echo "🐛 Scanning for debug code and performance anti-patterns..."
!echo "### Debug Code Analysis" >> PERFORMANCE_REPORT.md
!console_logs=$(grep -r "console\.log" --include="*.js" . --exclude-dir=node_modules | wc -l)
!echo "- console.log statements: $console_logs" >> PERFORMANCE_REPORT.md
!debug_statements=$(grep -r "console\.debug\|debugger" --include="*.js" . --exclude-dir=node_modules | wc -l)
!echo "- Debug statements: $debug_statements" >> PERFORMANCE_REPORT.md
!todo_comments=$(grep -r "TODO\|FIXME\|HACK" --include="*.js" . --exclude-dir=node_modules | wc -l)
!echo "- TODO/FIXME comments: $todo_comments" >> PERFORMANCE_REPORT.md
!echo "" >> PERFORMANCE_REPORT.md

### 4. Database Query Analysis
!echo "🗄️ Analyzing database query patterns..."
!echo "### Database Performance" >> PERFORMANCE_REPORT.md
!mongoose_queries=$(grep -r "find\|findOne\|aggregate" --include="*.js" . --exclude-dir=node_modules | wc -l)
!echo "- Mongoose queries: $mongoose_queries" >> PERFORMANCE_REPORT.md
!eager_loading=$(grep -r "populate(" --include="*.js" . --exclude-dir=node_modules | wc -l)
!echo "- Population queries: $eager_loading" >> PERFORMANCE_REPORT.md
!indexes=$(grep -r "index\|createIndex" --include="*.js" . --exclude-dir=node_modules | wc -l)
!echo "- Index definitions: $indexes" >> PERFORMANCE_REPORT.md
!echo "" >> PERFORMANCE_REPORT.md

## Performance Bottleneck Detection

### 5. Synchronous Operations
!echo "⚡ Detecting potential performance bottlenecks..."
!echo "### Performance Bottlenecks" >> PERFORMANCE_REPORT.md
!sync_operations=$(grep -r "readFileSync\|writeFileSync\|execSync" --include="*.js" . --exclude-dir=node_modules | wc -l)
!echo "- Synchronous file operations: $sync_operations" >> PERFORMANCE_REPORT.md
!blocking_operations=$(grep -r "while.*true\|for.*in.*req\|forEach.*req" --include="*.js" . --exclude-dir=node_modules | wc -l)
!echo "- Potentially blocking operations: $blocking_operations" >> PERFORMANCE_REPORT.md
!echo "" >> PERFORMANCE_REPORT.md

### 6. Memory Usage Patterns
!echo "🧠 Analyzing memory usage patterns..."
!echo "### Memory Usage Analysis" >> PERFORMANCE_REPORT.md
!large_objects=$(grep -r "Array\(.*[0-9]\{4,\}\)\|Buffer\.alloc" --include="*.js" . --exclude-dir=node_modules | wc -l)
!echo "- Large object allocations: $large_objects" >> PERFORMANCE_REPORT.md
!event_listeners=$(grep -r "addEventListener\|on\(" --include="*.js" . --exclude-dir=node_modules | wc -l)
!echo "- Event listener registrations: $event_listeners" >> PERFORMANCE_REPORT.md
!closures=$(grep -r "function.*function\|=>.*=>" --include="*.js" . --exclude-dir=node_modules | wc -l)
!echo "- Nested functions/closures: $closures" >> PERFORMANCE_REPORT.md
!echo "" >> PERFORMANCE_REPORT.md

### 7. Network and I/O Operations
!echo "🌐 Analyzing network and I/O operations..."
!echo "### Network & I/O Analysis" >> PERFORMANCE_REPORT.md
!http_requests=$(grep -r "axios\|fetch\|request\|http\." --include="*.js" . --exclude-dir=node_modules | wc -l)
!echo "- HTTP requests: $http_requests" >> PERFORMANCE_REPORT.md
!file_operations=$(grep -r "fs\.\|readFile\|writeFile" --include="*.js" . --exclude-dir=node_modules | wc -l)
!echo "- File operations: $file_operations" >> PERFORMANCE_REPORT.md
!aws_operations=$(grep -r "AWS\|s3\|ses" --include="*.js" . --exclude-dir=node_modules | wc -l)
!echo "- AWS service calls: $aws_operations" >> PERFORMANCE_REPORT.md
!echo "" >> PERFORMANCE_REPORT.md

## Optimization Recommendations

### 8. Generate Recommendations
!echo "💡 Generating optimization recommendations..."
!echo "### Optimization Recommendations" >> PERFORMANCE_REPORT.md
!echo "" >> PERFORMANCE_REPORT.md

!if [ $console_logs -gt 10 ]; then
!  echo "🔧 **High Priority**: Remove or reduce console.log statements ($console_logs found)" >> PERFORMANCE_REPORT.md
!fi

!if [ $sync_operations -gt 0 ]; then
!  echo "⚡ **High Priority**: Replace synchronous operations with async alternatives ($sync_operations found)" >> PERFORMANCE_REPORT.md
!fi

!if [ $(du -s node_modules 2>/dev/null | cut -f1) -gt 500000 ]; then
!  echo "📦 **Medium Priority**: Consider dependency optimization - large node_modules size" >> PERFORMANCE_REPORT.md
!fi

!if [ $todo_comments -gt 20 ]; then
!  echo "🏗️ **Low Priority**: Address TODO/FIXME comments for code maintenance ($todo_comments found)" >> PERFORMANCE_REPORT.md
!fi

!echo "" >> PERFORMANCE_REPORT.md

### 9. Performance Best Practices
!cat >> PERFORMANCE_REPORT.md << 'EOF'
### Performance Best Practices

#### Database Optimization
- Use appropriate indexes for frequently queried fields
- Implement pagination for large result sets  
- Use lean() queries when full documents aren't needed
- Consider aggregation pipelines for complex queries

#### Code Optimization
- Use async/await instead of synchronous operations
- Implement caching for frequently accessed data
- Minimize middleware stack for better request handling
- Use compression middleware for response optimization

#### Memory Management
- Remove unused event listeners
- Avoid memory leaks in closures
- Use streaming for large file operations
- Implement proper error handling to prevent memory buildup

#### Monitoring Recommendations
- Implement APM (Application Performance Monitoring)
- Set up logging and metrics collection
- Monitor database query performance
- Track memory usage and garbage collection

EOF

## Performance Benchmarking

### 10. Basic Performance Tests
!echo ""
!echo "🏃 Running basic performance tests..."
!echo "### Performance Benchmarks" >> PERFORMANCE_REPORT.md
!echo "- Node.js version: $(node --version)" >> PERFORMANCE_REPORT.md
!echo "- NPM version: $(npm --version)" >> PERFORMANCE_REPORT.md
!echo "- System memory: $(node -e "console.log(Math.round(require('os').totalmem()/1024/1024/1024) + 'GB')")" >> PERFORMANCE_REPORT.md

### 11. Application Startup Time
!echo "⏱️ Measuring application startup time..."
!start_time=$(date +%s%N)
!timeout 5s node -e "require('./app.js')" > /dev/null 2>&1
!end_time=$(date +%s%N)
!startup_time=$(echo "scale=3; ($end_time - $start_time) / 1000000" | bc 2>/dev/null || echo "measurement_failed")
!echo "- Application startup time: ${startup_time}ms" >> PERFORMANCE_REPORT.md

## Report Summary

!echo ""
!echo "✅ Performance analysis completed"
!echo ""
!echo "📊 Performance Report Summary:"
!echo "- Dependencies: $(npm ls --depth=0 2>/dev/null | grep -c "─" || echo "unknown") packages"
!echo "- Bundle size: $(du -sh node_modules 2>/dev/null | cut -f1 || echo "unknown")"
!echo "- Console.log statements: $console_logs"  
!echo "- Debug statements: $debug_statements"
!echo "- Database queries: $mongoose_queries"
!echo "- Sync operations: $sync_operations"
!echo ""
!echo "📋 Report saved to: PERFORMANCE_REPORT.md"
!echo "🔧 Review recommendations and prioritize optimizations"