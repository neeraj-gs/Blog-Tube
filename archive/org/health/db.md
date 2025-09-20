---
description: MongoDB connection health check and database validation
---

# Database Health Check

Comprehensive MongoDB health verification including connection status, database integrity, model validation, and performance metrics.

## Database Connection Check

### 1. MongoDB Connection Verification
!echo "🗄️ Checking MongoDB connection..."
!echo "## Database Health Report" > DB_HEALTH_REPORT.md
!echo "Generated on $(date)" >> DB_HEALTH_REPORT.md
!echo "" >> DB_HEALTH_REPORT.md

### 2. Mongoose Connection Test
!echo "🔍 Testing Mongoose connection..."
!connection_test=$(node -e "
const mongoose = require('mongoose');
require('dotenv').config();

const mongoUri = process.env.MONGO_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/test';

mongoose.connect(mongoUri, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000
})
.then(() => {
  console.log('✅ MongoDB connection successful');
  console.log('Database:', mongoose.connection.name);
  console.log('Host:', mongoose.connection.host);
  console.log('Port:', mongoose.connection.port);
  mongoose.connection.close();
})
.catch(err => {
  console.log('❌ MongoDB connection failed:', err.message);
});
" 2>&1)

!echo "$connection_test"
!echo "### Connection Status" >> DB_HEALTH_REPORT.md
!echo "$connection_test" >> DB_HEALTH_REPORT.md
!echo "" >> DB_HEALTH_REPORT.md

### 3. Database Configuration Check
!echo ""
!echo "⚙️ Checking database configuration..."
!echo "### Database Configuration" >> DB_HEALTH_REPORT.md

!if [ ! -z "$MONGO_URI" ]; then
!  echo "✅ MONGO_URI environment variable - SET" >> DB_HEALTH_REPORT.md
!  echo "✅ MONGO_URI is configured"
!elif [ ! -z "$DATABASE_URL" ]; then
!  echo "✅ DATABASE_URL environment variable - SET" >> DB_HEALTH_REPORT.md
!  echo "✅ DATABASE_URL is configured"
!else
!  echo "⚠️ Database URI environment variable - NOT SET" >> DB_HEALTH_REPORT.md
!  echo "⚠️ No database URI environment variable found"
!fi

## Model Validation

### 4. Mongoose Models Check
!echo ""
!echo "📋 Validating Mongoose models..."
!echo "" >> DB_HEALTH_REPORT.md
!echo "### Model Validation" >> DB_HEALTH_REPORT.md

!if [ -d "models" ]; then
!  model_count=$(find models/ -name "*.js" -type f | wc -l)
!  echo "✅ Models directory found - $model_count models" >> DB_HEALTH_REPORT.md
!  echo "✅ Found $model_count model files"
!  
!  echo "Model files:" >> DB_HEALTH_REPORT.md
!  find models/ -name "*.js" -type f | while read file; do
!    model_name=$(basename "$file" .js)
!    echo "- $model_name" >> DB_HEALTH_REPORT.md
!  done
!else
!  echo "❌ Models directory - NOT FOUND" >> DB_HEALTH_REPORT.md
!  echo "❌ Models directory not found"
!fi

### 5. Model Loading Test
!echo ""
!echo "🧪 Testing model loading..."
!model_test=$(node -e "
try {
  const fs = require('fs');
  const path = require('path');
  
  if (fs.existsSync('models')) {
    const modelFiles = fs.readdirSync('models').filter(file => file.endsWith('.js'));
    
    modelFiles.forEach(file => {
      try {
        const modelPath = path.join('./models', file);
        require(modelPath);
        console.log('✅ Model loaded:', file);
      } catch (err) {
        console.log('❌ Model failed to load:', file, '-', err.message.split('\n')[0]);
      }
    });
  } else {
    console.log('⚠️ No models directory found');
  }
} catch (err) {
  console.log('❌ Model loading test failed:', err.message);
}
" 2>&1)

!echo "$model_test"
!echo "" >> DB_HEALTH_REPORT.md
!echo "### Model Loading Results" >> DB_HEALTH_REPORT.md
!echo "$model_test" >> DB_HEALTH_REPORT.md

## Database Operations Test

### 6. Basic Database Operations
!echo ""
!echo "🔧 Testing basic database operations..."
!echo "" >> DB_HEALTH_REPORT.md
!echo "### Database Operations Test" >> DB_HEALTH_REPORT.md

!db_operations_test=$(node -e "
const mongoose = require('mongoose');
require('dotenv').config();

const mongoUri = process.env.MONGO_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/test';

async function testOperations() {
  try {
    await mongoose.connect(mongoUri, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    
    // Test basic operations
    const db = mongoose.connection.db;
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log('✅ Collections found:', collections.length);
    
    collections.forEach(col => {
      console.log('  -', col.name);
    });
    
    // Test admin commands (if permissions allow)
    try {
      const stats = await db.stats();
      console.log('✅ Database stats retrieved');
      console.log('  - Database size:', Math.round(stats.dataSize / 1024 / 1024) + 'MB');
      console.log('  - Collections:', stats.collections);
      console.log('  - Indexes:', stats.indexes);
    } catch (err) {
      console.log('⚠️ Database stats not accessible (limited permissions)');
    }
    
    await mongoose.connection.close();
    
  } catch (err) {
    console.log('❌ Database operations test failed:', err.message);
  }
}

testOperations();
" 2>&1)

!echo "$db_operations_test"
!echo "$db_operations_test" >> DB_HEALTH_REPORT.md

### 7. Index Analysis
!echo ""
!echo "📊 Analyzing database indexes..."
!index_analysis=$(node -e "
try {
  const fs = require('fs');
  const indexPatterns = [];
  
  // Search for index definitions in models
  if (fs.existsSync('models')) {
    const modelFiles = fs.readdirSync('models').filter(file => file.endsWith('.js'));
    
    modelFiles.forEach(file => {
      const content = fs.readFileSync(\`models/\${file}\`, 'utf8');
      const indexMatches = content.match(/index.*true|createIndex|ensureIndex/g);
      if (indexMatches) {
        console.log('✅ Indexes found in', file + ':', indexMatches.length);
        indexPatterns.push(...indexMatches);
      } else {
        console.log('⚠️ No indexes found in', file);
      }
    });
    
    console.log('Total index definitions:', indexPatterns.length);
  } else {
    console.log('⚠️ No models directory to analyze');
  }
} catch (err) {
  console.log('❌ Index analysis failed:', err.message);
}
" 2>&1)

!echo "$index_analysis"
!echo "" >> DB_HEALTH_REPORT.md
!echo "### Index Analysis" >> DB_HEALTH_REPORT.md
!echo "$index_analysis" >> DB_HEALTH_REPORT.md

## Performance Analysis

### 8. Connection Performance
!echo ""
!echo "⏱️ Testing connection performance..."
!echo "" >> DB_HEALTH_REPORT.md
!echo "### Performance Metrics" >> DB_HEALTH_REPORT.md

!perf_test=$(node -e "
const mongoose = require('mongoose');
require('dotenv').config();

const mongoUri = process.env.MONGO_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/test';

async function performanceTest() {
  try {
    const start = Date.now();
    
    await mongoose.connect(mongoUri, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000
    });
    
    const connectionTime = Date.now() - start;
    console.log('✅ Connection time:', connectionTime + 'ms');
    
    // Test query performance (if User model exists)
    try {
      const queryStart = Date.now();
      const db = mongoose.connection.db;
      const testCollection = db.collection('users');
      await testCollection.findOne({});
      const queryTime = Date.now() - queryStart;
      console.log('✅ Sample query time:', queryTime + 'ms');
    } catch (err) {
      console.log('ℹ️ Query test skipped (no test collection)');
    }
    
    await mongoose.connection.close();
    
  } catch (err) {
    console.log('❌ Performance test failed:', err.message);
  }
}

performanceTest();
" 2>&1)

!echo "$perf_test"
!echo "$perf_test" >> DB_HEALTH_REPORT.md

### 9. Connection Pool Status
!echo ""
!echo "🏊 Checking connection pool configuration..."
!pool_config=$(grep -r "maxPoolSize\|minPoolSize\|maxIdleTimeMS" --include="*.js" . 2>/dev/null | head -5)
!if [ ! -z "$pool_config" ]; then
!  echo "✅ Connection pool configuration found"
!  echo "$pool_config"
!  echo "" >> DB_HEALTH_REPORT.md
!  echo "### Connection Pool Configuration" >> DB_HEALTH_REPORT.md
!  echo "$pool_config" >> DB_HEALTH_REPORT.md
!else
!  echo "ℹ️ No explicit connection pool configuration found"
!  echo "" >> DB_HEALTH_REPORT.md
!  echo "### Connection Pool Configuration" >> DB_HEALTH_REPORT.md
!  echo "ℹ️ Using default Mongoose connection pool settings" >> DB_HEALTH_REPORT.md
!fi

## Security and Best Practices

### 10. Security Check
!echo ""
!echo "🔒 Checking database security configuration..."
!echo "" >> DB_HEALTH_REPORT.md
!echo "### Security Analysis" >> DB_HEALTH_REPORT.md

!security_check=$(node -e "
const mongoUri = process.env.MONGO_URI || process.env.DATABASE_URL || '';

if (mongoUri.includes('mongodb+srv://')) {
  console.log('✅ MongoDB Atlas connection (SRV record)');
} else if (mongoUri.includes('mongodb://')) {
  console.log('⚠️ Standard MongoDB connection');
} else {
  console.log('❌ No MongoDB URI configured');
}

if (mongoUri.includes('username') || mongoUri.includes('@')) {
  console.log('✅ Authentication configured');
} else {
  console.log('⚠️ No authentication in connection string');
}

if (mongoUri.includes('ssl=true') || mongoUri.includes('mongodb+srv://')) {
  console.log('✅ SSL/TLS connection');
} else {
  console.log('⚠️ SSL/TLS not explicitly configured');
}
" 2>&1)

!echo "$security_check"
!echo "$security_check" >> DB_HEALTH_REPORT.md

## Health Summary

### 11. Generate Database Health Score
!echo ""
!echo "📊 Calculating database health score..."
!db_health_score=0
!total_db_checks=6

# Count passing checks (simplified)
![ ! -z "$MONGO_URI" ] || [ ! -z "$DATABASE_URL" ] && db_health_score=$((db_health_score + 1))
![ -d "models" ] && db_health_score=$((db_health_score + 1))
!node -e "require('mongoose')" 2>/dev/null && db_health_score=$((db_health_score + 1))
!echo "$connection_test" | grep -q "✅.*successful" && db_health_score=$((db_health_score + 1))
!echo "$model_test" | grep -q "✅" && db_health_score=$((db_health_score + 1))
!echo "$db_operations_test" | grep -q "✅.*Collections" && db_health_score=$((db_health_score + 1))

!db_health_percentage=$((db_health_score * 100 / total_db_checks))

!echo "" >> DB_HEALTH_REPORT.md
!echo "### Database Health Summary" >> DB_HEALTH_REPORT.md
!echo "- Health Score: $db_health_score/$total_db_checks ($db_health_percentage%)" >> DB_HEALTH_REPORT.md
!echo "- Status: $([ $db_health_percentage -ge 80 ] && echo "HEALTHY" || echo "NEEDS ATTENTION")" >> DB_HEALTH_REPORT.md
!echo "- Timestamp: $(date)" >> DB_HEALTH_REPORT.md

## Final Report

!echo "✅ Database health check completed"
!echo ""
!echo "📊 Database Health Summary:"
!echo "- Overall Score: $db_health_score/$total_db_checks ($db_health_percentage%)"
!echo "- Status: $([ $db_health_percentage -ge 80 ] && echo "HEALTHY 🟢" || echo "NEEDS ATTENTION 🟡")"
!echo ""
!echo "📋 Detailed report saved to: DB_HEALTH_REPORT.md"
!echo ""
!echo "💡 Next steps:"
!echo "- Ensure MONGO_URI environment variable is set"
!echo "- Verify MongoDB service is running"
!echo "- Check model definitions for any syntax errors"
!echo "- Consider adding database indexes for better performance"
!echo "- Review connection pool settings for production use"