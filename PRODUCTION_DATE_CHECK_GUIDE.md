# Production Server Date Verification Guide

## Overview
This guide helps you check if the production server has the correct start and end dates for agriculture projects.

## Quick Manual Check

### Step 1: Test API Connectivity
```bash
# Replace with your production server details
curl -s "https://your-production-server.com:3000/api/projects" | head -20
```

### Step 2: Check Specific Agriculture Projects
```bash
# Check KCSAP project
curl -s "https://your-production-server.com:3000/api/projects?projectName=KCSAP" | jq '.[0] | {projectName, startDate, endDate}'

# Check ASDSP project  
curl -s "https://your-production-server.com:3000/api/projects?projectName=ASDSP" | jq '.[0] | {projectName, startDate, endDate}'

# Check EU project
curl -s "https://your-production-server.com:3000/api/projects?projectName=EU" | jq '.[0] | {projectName, startDate, endDate}'
```

### Step 3: Check Multiple Projects at Once
```bash
# Get all projects and filter for agriculture ones
curl -s "https://your-production-server.com:3000/api/projects" | jq '.[] | select(.projectName | test("KCSAP|ASDSP|EU|Development of horticultural value chains|Procurement of vaccines|Dairy Cows|One day old chicks|Feed for the Chicks")) | {projectName, startDate, endDate}'
```

## Expected Results

### ✅ Correct Dates (What You Should See):
```json
{
  "projectName": "KCSAP",
  "startDate": "2022-07-01T00:00:00.000Z",
  "endDate": "2023-06-30T00:00:00.000Z"
}
```

### ❌ Missing Dates (What You Might See):
```json
{
  "projectName": "KCSAP", 
  "startDate": null,
  "endDate": null
}
```

### ⚠️ Different Dates (What You Might See):
```json
{
  "projectName": "KCSAP",
  "startDate": "2020-05-09T21:00:00.000Z",
  "endDate": "2024-05-10T11:16:14.000Z"
}
```

## Using the Automated Script

### Option 1: Run the Script
1. Edit `check_production_dates.sh` with your production server details:
   ```bash
   PROD_HOST="your-production-server.com"
   PROD_API_PORT="3000"
   PROD_PROTOCOL="https"
   ```

2. Run the script:
   ```bash
   ./check_production_dates.sh
   ```

### Option 2: Direct Browser Check
1. Open your browser
2. Go to: `https://your-production-server.com:3000/api/projects?projectName=KCSAP`
3. Look for `startDate` and `endDate` fields

## What to Do Based on Results

### If Dates Are Correct ✅
- **Action**: No action needed
- **Status**: Production server is up to date
- **Dashboard**: Should show correct dates

### If Dates Are Missing ❌
- **Action**: Import the updated table
- **Steps**:
  1. Upload `kemri_projects_updated.sql` to production server
  2. Run the import script on production
  3. Verify import was successful

### If Dates Are Different ⚠️
- **Action**: Check what dates are there
- **Investigation**: 
  1. Compare with local database
  2. Check if production has different data
  3. Decide whether to import or keep existing dates

## Production Import Steps

### 1. Upload Files to Production Server
```bash
# Upload the SQL dump file
scp kemri_projects_updated.sql user@production-server:/path/to/backup/

# Upload the import script
scp import_kemri_projects.sh user@production-server:/path/to/scripts/
```

### 2. Run Import on Production Server
```bash
# SSH into production server
ssh user@production-server

# Navigate to script directory
cd /path/to/scripts/

# Edit script with production database details
nano import_kemri_projects.sh

# Run the import
./import_kemri_projects.sh
```

### 3. Verify Import Success
```bash
# Check specific projects
mysql -h localhost -u root -p imbesdb -e "
SELECT id, projectName, startDate, endDate 
FROM kemri_projects 
WHERE projectName IN ('KCSAP', 'ASDSP', 'EU') 
ORDER BY projectName;"
```

## Troubleshooting

### API Not Accessible
- Check server host and port
- Verify network connectivity
- Check if API service is running
- Check firewall settings

### Projects Not Found
- Verify project names match exactly
- Check if projects exist in database
- Try broader search without filters

### Permission Issues
- Check API authentication
- Verify database access permissions
- Check CORS settings

## Files Needed for Production Update

```
📁 Files to upload to production:
├── 📄 kemri_projects_updated.sql (19KB)
├── 🔧 import_kemri_projects.sh (executable)
├── 🔍 check_production_dates.sh (executable)
└── 📖 KEMRI_PROJECTS_IMPORT_GUIDE.md (documentation)
```

## Next Steps After Verification

1. **If dates are correct**: Dashboard should work properly
2. **If dates are missing**: Import the updated table
3. **If dates are different**: Investigate and decide on action
4. **After import**: Verify dashboard shows correct dates
5. **Test functionality**: Check Quick Stats modals work with real dates
























