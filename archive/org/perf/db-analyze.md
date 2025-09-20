---
description: MongoDB performance analysis and optimization recommendations for Penomo platform
allowed-tools: [Bash, Grep, Read]
---

# MongoDB Performance Analysis

Comprehensive MongoDB performance analysis and optimization for the Penomo investment platform database operations.

## Database Performance Analysis Workflow

### 1. Initialize Performance Analysis
!echo "🔍 Starting MongoDB performance analysis for Penomo platform..."
!echo "Analyzing database operations, indexes, and query performance..."

### 2. Connection Status and Configuration
!echo "🔌 Checking MongoDB connection and configuration..."
!cd api && node -e "
const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/penomo-dev', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ MongoDB connection successful');
  console.log('Database:', mongoose.connection.db.databaseName);
  console.log('Host:', mongoose.connection.host);
  console.log('Port:', mongoose.connection.port);
  process.exit(0);
}).catch(err => {
  console.log('❌ MongoDB connection failed:', err.message);
  process.exit(1);
});
" || echo "❌ Unable to connect to MongoDB"

### 3. Database Size and Collection Statistics
!echo "📊 Analyzing database size and collections..."
!cd api && node -e "
const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/penomo-dev', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  const db = mongoose.connection.db;
  const stats = await db.stats();
  console.log('=== DATABASE STATISTICS ===');
  console.log('Database Size:', (stats.dataSize / 1024 / 1024).toFixed(2), 'MB');
  console.log('Storage Size:', (stats.storageSize / 1024 / 1024).toFixed(2), 'MB');
  console.log('Index Size:', (stats.indexSize / 1024 / 1024).toFixed(2), 'MB');
  console.log('Collections Count:', stats.collections);
  console.log('Documents Count:', stats.objects);
  console.log('Average Document Size:', stats.avgObjSize, 'bytes');
  process.exit(0);
}).catch(err => {
  console.log('Error getting stats:', err.message);
  process.exit(1);
});
" || echo "❌ Unable to get database statistics"

### 4. Collection Analysis
!echo "📋 Analyzing individual collections..."
!cd api && node -e "
const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/penomo-dev', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  console.log('=== COLLECTION ANALYSIS ===');
  for (const col of collections) {
    try {
      const stats = await db.collection(col.name).stats();
      console.log(\`Collection: \${col.name}\`);
      console.log(\`  Documents: \${stats.count}\`);
      console.log(\`  Size: \${(stats.size / 1024).toFixed(2)} KB\`);
      console.log(\`  Avg Doc Size: \${stats.avgObjSize} bytes\`);
      console.log(\`  Indexes: \${stats.nindexes}\`);
      console.log('---');
    } catch (err) {
      console.log(\`  Error analyzing \${col.name}: \${err.message}\`);
    }
  }
  process.exit(0);
}).catch(err => {
  console.log('Error:', err.message);
  process.exit(1);
});
" || echo "❌ Unable to analyze collections"

### 5. Index Analysis
!echo "🗂️ Analyzing database indexes..."
!cd api && node -e "
const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/penomo-dev', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  console.log('=== INDEX ANALYSIS ===');
  for (const col of collections) {
    try {
      const indexes = await db.collection(col.name).indexes();
      console.log(\`Collection: \${col.name}\`);
      indexes.forEach(index => {
        console.log(\`  Index: \${index.name}\`);
        console.log(\`  Keys: \${JSON.stringify(index.key)}\`);
        if (index.unique) console.log('  Type: UNIQUE');
        if (index.sparse) console.log('  Type: SPARSE');
        if (index.expireAfterSeconds) console.log(\`  TTL: \${index.expireAfterSeconds}s\`);
      });
      console.log('---');
    } catch (err) {
      console.log(\`  Error analyzing indexes for \${col.name}\`);
    }
  }
  process.exit(0);
}).catch(err => {
  console.log('Error:', err.message);
  process.exit(1);
});
" || echo "❌ Unable to analyze indexes"

### 6. Query Performance Analysis
!echo "⚡ Analyzing slow operations..."
!cd api && node -e "
const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/penomo-dev', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  const db = mongoose.connection.db;
  console.log('=== PROFILER STATUS ===');
  try {
    const profilerStatus = await db.command({ profile: -1 });
    console.log('Profiler Level:', profilerStatus.was);
    console.log('Slow Operation Threshold:', profilerStatus.slowms, 'ms');
  } catch (err) {
    console.log('Unable to check profiler status:', err.message);
  }
  
  console.log('\\n=== CURRENT OPERATIONS ===');
  try {
    const currentOp = await db.admin().command({ currentOp: 1 });
    const activeOps = currentOp.inprog.filter(op => op.active && op.secs_running > 1);
    if (activeOps.length === 0) {
      console.log('✅ No long-running operations detected');
    } else {
      activeOps.forEach(op => {
        console.log(\`Operation: \${op.op}\`);
        console.log(\`Runtime: \${op.secs_running}s\`);
        console.log(\`Namespace: \${op.ns}\`);
      });
    }
  } catch (err) {
    console.log('Unable to check current operations:', err.message);
  }
  process.exit(0);
}).catch(err => {
  console.log('Error:', err.message);
  process.exit(1);
});
" || echo "❌ Unable to analyze query performance"

### 7. Mongoose Model Analysis
!echo "🏗️ Analyzing Mongoose models and schemas..."
!find api/models -name "*.js" | head -10
!echo "=== MODEL SCHEMA ANALYSIS ==="
!grep -r "Schema.*index" api/models/ || echo "No explicit schema indexes found"
!grep -r "createIndex\|ensureIndex" api/ || echo "No manual index creation found"

### 8. Connection Pool Analysis
!echo "🏊 Analyzing connection pool configuration..."
!grep -r "mongoose.connect\|MongoClient" api/ | head -5
!grep -r "maxPoolSize\|minPoolSize\|maxIdleTime" api/ || echo "Using default connection pool settings"

## Penomo Platform Specific Analysis

### 9. Investment Data Performance
!echo "💰 Analyzing investment-related collections performance..."
!echo "Checking for proper indexes on investment queries..."
!grep -r "findBy.*project\|findBy.*user\|findBy.*company" api/controllers/ | head -5
!grep -r "populate.*project\|populate.*user" api/ | head -5

### 10. Transaction Query Patterns  
!echo "💳 Analyzing transaction query patterns..."
!grep -r "Transaction\." api/ | grep -E "(find|aggregate)" | head -5

### 11. User Authentication Performance
!echo "🔐 Analyzing user authentication query patterns..."
!grep -r "User\.findBy\|User\.findOne" api/ | head -5

### 12. Document Upload Performance
!echo "📁 Analyzing document and file-related queries..."
!grep -r "Document\." api/ | grep find | head -5

## Performance Optimization Recommendations

### Immediate Optimizations
!echo "🚀 PERFORMANCE RECOMMENDATIONS"
!echo "================================"

!echo "1. INDEX OPTIMIZATION:"
!echo "   - Add compound indexes for common query patterns"
!echo "   - Remove unused indexes to improve write performance"
!echo "   - Use sparse indexes for optional fields"

!echo "2. QUERY OPTIMIZATION:"
!echo "   - Use projection to limit returned fields"
!echo "   - Implement pagination for large result sets"
!echo "   - Use aggregation pipeline for complex queries"

!echo "3. SCHEMA OPTIMIZATION:"
!echo "   - Embed frequently accessed related data"
!echo "   - Use references for large or infrequently accessed data"
!echo "   - Implement proper field types and validation"

### 13. Penomo-Specific Recommendations
!echo "💡 PENOMO PLATFORM OPTIMIZATIONS:"
!echo "   - Index user investments by project and date"
!echo "   - Optimize quarterly interest payment queries"
!echo "   - Index documents by approval status and type"
!echo "   - Cache frequently accessed company data"
!echo "   - Use TTL indexes for temporary tokens"

### 14. Monitoring Recommendations
!echo "📊 MONITORING SETUP:"
!echo "   - Enable MongoDB profiler for slow queries (>100ms)"
!echo "   - Set up monitoring for connection pool exhaustion"
!echo "   - Monitor index usage statistics"
!echo "   - Track query execution statistics"

## Sample Index Creation Script

!echo "📝 SUGGESTED INDEXES FOR PENOMO:"
!echo "================================"
!echo "// Users"
!echo "db.users.createIndex({ email: 1 }, { unique: true })"
!echo "db.users.createIndex({ walletAddress: 1 }, { sparse: true })"
!echo "db.users.createIndex({ role: 1, isActive: 1 })"

!echo "// Projects"  
!echo "db.projects.createIndex({ companyId: 1, status: 1 })"
!echo "db.projects.createIndex({ status: 1, createdAt: -1 })"
!echo "db.projects.createIndex({ 'fundingGoal': 1, 'currentFunding': 1 })"

!echo "// Transactions"
!echo "db.transactions.createIndex({ userId: 1, createdAt: -1 })"
!echo "db.transactions.createIndex({ projectId: 1, status: 1 })"
!echo "db.transactions.createIndex({ type: 1, status: 1, createdAt: -1 })"

!echo "// Documents"
!echo "db.documents.createIndex({ userId: 1, type: 1, status: 1 })"
!echo "db.documents.createIndex({ projectId: 1, approved: 1 })"

!echo "// Interest Payments"
!echo "db.interestpayments.createIndex({ projectId: 1, quarter: 1, year: 1 })"
!echo "db.interestpayments.createIndex({ userId: 1, status: 1, dueDate: 1 })"

!echo "✅ MongoDB performance analysis completed"
!echo "📋 Review recommendations above and implement suggested optimizations"