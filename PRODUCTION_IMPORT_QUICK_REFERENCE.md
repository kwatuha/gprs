# 🚀 Production Server Import - Quick Reference

## Files to Upload
```
📄 kemri_projects_updated.sql (19KB)
🔧 import_kemri_projects.sh (executable)  
🔍 check_production_dates.sh (executable)
```

## Quick Import Commands

### 1. Upload Files
```bash
scp kemri_projects_updated.sql user@production-server:/backup/
scp import_kemri_projects.sh user@production-server:/scripts/
scp check_production_dates.sh user@production-server:/scripts/
```

### 2. Connect & Prepare
```bash
ssh user@production-server
cd /scripts/
chmod +x import_kemri_projects.sh
nano import_kemri_projects.sh  # Update DB details
```

### 3. Run Import
```bash
./import_kemri_projects.sh
```

### 4. Verify Success
```bash
./check_production_dates.sh
```

## Expected Results
- **37 projects** with correct dates
- **Start Date**: 2022-07-01 00:00:00
- **End Date**: 2023-06-30 00:00:00

## Database Details to Update
```bash
SERVER_HOST="localhost"        # or your DB host
SERVER_USER="your-db-user"     # your MySQL username  
SERVER_DB="imbesdb"           # your database name
SERVER_PORT="3306"            # your MySQL port
```

## Safety Features
✅ **Automatic backup** before import
✅ **Error handling** with rollback
✅ **Verification steps** to confirm success
✅ **Detailed logging** of all operations

## If Import Fails
1. Check database connection details
2. Verify MySQL user permissions
3. Check for foreign key constraints
4. Restore from backup if needed

## After Successful Import
1. Test production dashboard
2. Verify agriculture projects show dates
3. Test Quick Stats modals work
4. Check all functionality works properly
























