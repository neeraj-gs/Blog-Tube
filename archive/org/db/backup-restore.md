---
description: Automated MongoDB backup and restore operations for Penomo platform data
allowed-tools: [Bash, Read]
---

# MongoDB Backup & Restore

Automated MongoDB backup and restore operations for the Penomo investment platform, including investment data, user information, and financial records.

## Database Backup & Restore Workflow

### 1. Initialize Backup Environment
!echo "🗄️ Initializing MongoDB backup environment for Penomo platform..."
!echo "Preparing secure backup operations for investment and financial data..."

### 2. Environment and Connection Check
!echo "🔍 Checking MongoDB connection and environment..."
!source .env 2>/dev/null || echo "No .env file found, using environment variables"
!echo "Database URI configured: $(echo $MONGO_URI | sed 's/.*@/***@/g')" || echo "MONGO_URI not found"

### 3. Pre-Backup Validation
!echo "✅ Pre-backup validation..."
!echo "=== DATABASE STATUS CHECK ==="
!mongosh "$MONGO_URI" --quiet --eval "
  try {
    const status = db.adminCommand('ismaster');
    print('✅ Database connection: OK');
    print('Database:', db.getName());
    const stats = db.stats();
    print('Collections:', stats.collections);
    print('Total Size:', (stats.dataSize / 1024 / 1024).toFixed(2) + ' MB');
  } catch (err) {
    print('❌ Database connection failed:', err.message);
    quit(1);
  }
" || echo "❌ Unable to connect to MongoDB"

### 4. Full Database Backup
!echo "💾 Creating full database backup..."
!BACKUP_DATE=$(date +"%Y%m%d_%H%M%S")
!BACKUP_DIR="backups/penomo_backup_$BACKUP_DATE"
!echo "Creating backup directory: $BACKUP_DIR"
!mkdir -p "$BACKUP_DIR"

!echo "Starting mongodump backup..."
!mongodump --uri "$MONGO_URI" --out "$BACKUP_DIR" --verbose || echo "❌ Backup failed"

!if [ $? -eq 0 ]; then
!  echo "✅ Full backup completed successfully"
!  echo "Backup location: $BACKUP_DIR"
!  du -sh "$BACKUP_DIR"
!else
!  echo "❌ Backup failed - check MongoDB connection and permissions"
!fi

### 5. Critical Collections Backup
!echo "🎯 Creating targeted backup of critical Penomo collections..."
!CRITICAL_BACKUP_DIR="backups/penomo_critical_$BACKUP_DATE"
!mkdir -p "$CRITICAL_BACKUP_DIR"

# Backup critical collections individually
!echo "Backing up critical collections..."
!mongodump --uri "$MONGO_URI" --collection users --out "$CRITICAL_BACKUP_DIR" 2>/dev/null && echo "✅ Users backed up" || echo "⚠️ Users collection not found"
!mongodump --uri "$MONGO_URI" --collection projects --out "$CRITICAL_BACKUP_DIR" 2>/dev/null && echo "✅ Projects backed up" || echo "⚠️ Projects collection not found"
!mongodump --uri "$MONGO_URI" --collection transactions --out "$CRITICAL_BACKUP_DIR" 2>/dev/null && echo "✅ Transactions backed up" || echo "⚠️ Transactions collection not found"
!mongodump --uri "$MONGO_URI" --collection companies --out "$CRITICAL_BACKUP_DIR" 2>/dev/null && echo "✅ Companies backed up" || echo "⚠️ Companies collection not found"
!mongodump --uri "$MONGO_URI" --collection documents --out "$CRITICAL_BACKUP_DIR" 2>/dev/null && echo "✅ Documents backed up" || echo "⚠️ Documents collection not found"

### 6. Incremental Backup Strategy
!echo "📈 Creating incremental backup with oplog..."
!OPLOG_BACKUP_DIR="backups/penomo_oplog_$BACKUP_DATE"
!mkdir -p "$OPLOG_BACKUP_DIR"

!mongodump --uri "$MONGO_URI" --oplog --out "$OPLOG_BACKUP_DIR" 2>/dev/null && echo "✅ Oplog backup created" || echo "⚠️ Oplog backup failed (may not be replica set)"

### 7. Backup Compression and Encryption
!echo "🗜️ Compressing backup files..."
!tar -czf "penomo_backup_$BACKUP_DATE.tar.gz" -C backups "penomo_backup_$BACKUP_DATE" && echo "✅ Backup compressed" || echo "❌ Compression failed"

!echo "🔒 Encrypting sensitive backup data..."
!if command -v openssl >/dev/null 2>&1; then
!  openssl enc -aes-256-cbc -salt -in "penomo_backup_$BACKUP_DATE.tar.gz" -out "penomo_backup_$BACKUP_DATE.tar.gz.enc" -k "backup_password_here" 2>/dev/null && echo "✅ Backup encrypted" || echo "⚠️ Encryption failed"
!else
!  echo "⚠️ OpenSSL not available for encryption"
!fi

### 8. Backup Verification
!echo "🔍 Verifying backup integrity..."
!if [ -f "$BACKUP_DIR/penomo-dev/users.bson" ] || [ -f "$BACKUP_DIR/penomo/users.bson" ]; then
!  echo "✅ Core collections found in backup"
!  ls -la "$BACKUP_DIR"/*/ | head -10
!else
!  echo "⚠️ Backup verification: some collections may be missing"
!fi

### 9. AWS S3 Backup Upload (Optional)
!echo "☁️ Uploading backup to AWS S3 (if configured)..."
!if [ ! -z "$AWS_ACCESS_KEY_ID" ] && [ ! -z "$S3_BUCKET_NAME" ]; then
!  echo "Uploading to S3 bucket: $S3_BUCKET_NAME"
!  aws s3 cp "penomo_backup_$BACKUP_DATE.tar.gz" "s3://$S3_BUCKET_NAME/backups/" && echo "✅ Backup uploaded to S3" || echo "❌ S3 upload failed"
!else
!  echo "⚠️ AWS credentials not configured for S3 upload"
!fi

## Database Restore Operations

### 10. Restore Preparation
!echo "🔄 Database restore preparation..."
!echo "=== RESTORE SAFETY CHECKS ==="
!echo "⚠️ WARNING: Restore operations will overwrite existing data!"
!echo "Current database status:"
!mongosh "$MONGO_URI" --quiet --eval "
  const collections = db.adminCommand('listCollections');
  print('Current collections count:', collections.cursor.firstBatch.length);
" || echo "Unable to check current database status"

### 11. Full Database Restore
!echo "🔄 Full database restore function..."
!echo "To restore from backup, use:"
!echo "RESTORE_DIR=\$(ls -d backups/penomo_backup_* | tail -1)"
!echo "mongorestore --uri \"\$MONGO_URI\" --drop \"\$RESTORE_DIR\""
!echo ""
!echo "Example restore command:"
!echo "mongorestore --uri \"\$MONGO_URI\" --drop backups/penomo_backup_$BACKUP_DATE"

### 12. Selective Collection Restore
!echo "🎯 Selective collection restore examples..."
!echo "=== COLLECTION-SPECIFIC RESTORE ==="
!echo "# Restore only users collection:"
!echo "mongorestore --uri \"\$MONGO_URI\" --collection users --drop backups/penomo_backup_$BACKUP_DATE/database_name/users.bson"
!echo ""
!echo "# Restore only projects collection:"
!echo "mongorestore --uri \"\$MONGO_URI\" --collection projects --drop backups/penomo_backup_$BACKUP_DATE/database_name/projects.bson"

### 13. Point-in-Time Recovery
!echo "⏰ Point-in-time recovery (with oplog)..."
!echo "If oplog backup exists:"
!echo "mongorestore --uri \"\$MONGO_URI\" --oplogReplay --drop backups/penomo_oplog_$BACKUP_DATE"

### 14. Development Environment Restore
!echo "🧪 Development environment restore..."
!echo "=== DEV ENVIRONMENT SETUP ==="
!echo "For setting up development with production-like data:"
!echo ""
!echo "1. Create sanitized backup:"
!echo "mongodump --uri \"\$MONGO_URI\" --excludeCollection sessions --out dev_backup"
!echo ""
!echo "2. Restore to dev database:"
!echo "mongorestore --uri \"mongodb://localhost:27017/penomo-dev\" --drop dev_backup"

## Penomo Platform Specific Operations

### 15. Investment Data Backup
!echo "💰 Investment platform specific backup considerations..."
!echo "=== PENOMO FINANCIAL DATA BACKUP ==="
!echo "Critical collections for investment platform:"
!echo "✅ Users (investor profiles, KYC data)"
!echo "✅ Companies (issuer information)"
!echo "✅ Projects (investment opportunities)"
!echo "✅ Transactions (investment records)"
!echo "✅ Documents (legal documents, KYC files)"
!echo "✅ InterestPayments (quarterly payment records)"
!echo "✅ Challenges (gamification data)"

### 16. Compliance and Audit Backup
!echo "📋 Compliance and audit trail backup..."
!echo "=== AUDIT TRAIL BACKUP ==="
!mongodump --uri "$MONGO_URI" --collection auditlogs --out "backups/audit_$BACKUP_DATE" 2>/dev/null && echo "✅ Audit logs backed up" || echo "⚠️ Audit logs collection not found"
!mongodump --uri "$MONGO_URI" --collection notifications --out "backups/notifications_$BACKUP_DATE" 2>/dev/null && echo "✅ Notifications backed up" || echo "⚠️ Notifications collection not found"

### 17. User Data Protection
!echo "🔒 User data protection during backup..."
!echo "=== GDPR COMPLIANCE ==="
!echo "Backup includes sensitive user data - ensure:"
!echo "• Encryption at rest for backup files"
!echo "• Access logging for backup operations"
!echo "• Retention policy for backup files"
!echo "• Right to be forgotten compliance"

## Backup Automation and Scheduling

### 18. Automated Backup Script
!echo "🤖 Automated backup script template..."
!echo "=== BACKUP AUTOMATION ==="
!cat << 'EOF' > backup-script.sh
#!/bin/bash
# Penomo MongoDB Backup Script
set -e

BACKUP_DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="backups/penomo_backup_$BACKUP_DATE"
LOG_FILE="logs/backup_$BACKUP_DATE.log"

# Load environment variables
source .env

# Create backup
mkdir -p "$BACKUP_DIR" logs/
mongodump --uri "$MONGO_URI" --out "$BACKUP_DIR" &> "$LOG_FILE"

# Compress and encrypt
tar -czf "$BACKUP_DIR.tar.gz" -C backups "penomo_backup_$BACKUP_DATE"
rm -rf "$BACKUP_DIR"

# Upload to S3 if configured
if [ ! -z "$S3_BUCKET_NAME" ]; then
    aws s3 cp "$BACKUP_DIR.tar.gz" "s3://$S3_BUCKET_NAME/backups/"
fi

# Clean old backups (keep last 7 days)
find backups/ -name "penomo_backup_*.tar.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR.tar.gz"
EOF
!chmod +x backup-script.sh
!echo "✅ Backup script created: backup-script.sh"

### 19. Cron Job Setup
!echo "⏰ Cron job setup for automated backups..."
!echo "=== BACKUP SCHEDULING ==="
!echo "Add to crontab (crontab -e):"
!echo "# Daily backup at 2 AM"
!echo "0 2 * * * cd /path/to/penomo-api && ./backup-script.sh"
!echo ""
!echo "# Weekly full backup on Sundays at 1 AM"
!echo "0 1 * * 0 cd /path/to/penomo-api && ./backup-script.sh"

### 20. Monitoring and Alerting
!echo "📊 Backup monitoring setup..."
!echo "=== BACKUP MONITORING ==="
!echo "Monitor backup operations:"
!echo "• Check backup file sizes for consistency"
!echo "• Verify backup completion timestamps"
!echo "• Test restore operations monthly"
!echo "• Alert on backup failures"
!echo "• Monitor S3 upload success"

## Recovery Planning

### 21. Disaster Recovery Plan
!echo "🚨 Disaster recovery planning..."
!echo "=== DISASTER RECOVERY ==="
!echo "Recovery Time Objectives (RTO):"
!echo "• Critical systems: < 1 hour"
!echo "• Full platform: < 4 hours"
!echo "• Historical data: < 24 hours"
!echo ""
!echo "Recovery Point Objectives (RPO):"
!echo "• Transaction data: < 15 minutes"
!echo "• User data: < 1 hour"
!echo "• System logs: < 1 day"

### 22. Testing and Validation
!echo "🧪 Backup testing and validation..."
!echo "=== BACKUP TESTING ==="
!echo "Monthly backup testing checklist:"
!echo "□ Restore test database from backup"
!echo "□ Verify all collections restored correctly"
!echo "□ Test application functionality with restored data"
!echo "□ Validate user authentication works"
!echo "□ Check investment transaction integrity"
!echo "□ Verify document links and file access"

!echo ""
!echo "✅ MongoDB backup and restore operations completed"
!echo "📁 Backup location: $BACKUP_DIR"
!echo "📊 Use backup-script.sh for automated daily backups"
!echo "🔒 Remember to test restore procedures regularly"