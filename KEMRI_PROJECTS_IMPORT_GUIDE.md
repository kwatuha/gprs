# Kemri Projects Table Import Guide

## Overview
This guide helps you import the updated `kemri_projects` table with correct start and end dates to your server.

## Files Created
- `kemri_projects_updated.sql` - Contains all projects with updated dates
- `import_kemri_projects.sh` - Automated import script

## Manual Import Steps

### Step 1: Backup Existing Table
```bash
# Create backup of current table
mysqldump -h YOUR_SERVER_HOST -P 3306 -u YOUR_USERNAME -p imbesdb kemri_projects > kemri_projects_backup_$(date +%Y%m%d_%H%M%S).sql
```

### Step 2: Drop Existing Table
```bash
# Connect to server database
mysql -h YOUR_SERVER_HOST -P 3306 -u YOUR_USERNAME -p imbesdb

# Drop the existing table
DROP TABLE IF EXISTS kemri_projects;
```

### Step 3: Import Updated Table
```bash
# Import the updated table
mysql -h YOUR_SERVER_HOST -P 3306 -u YOUR_USERNAME -p imbesdb < kemri_projects_updated.sql
```

### Step 4: Verify Import
```bash
# Check total projects
mysql -h YOUR_SERVER_HOST -P 3306 -u YOUR_USERNAME -p imbesdb -e "SELECT COUNT(*) FROM kemri_projects;"

# Check projects with dates
mysql -h YOUR_SERVER_HOST -P 3306 -u YOUR_USERNAME -p imbesdb -e "SELECT COUNT(*) FROM kemri_projects WHERE startDate IS NOT NULL AND endDate IS NOT NULL;"

# Check specific updated projects
mysql -h YOUR_SERVER_HOST -P 3306 -u YOUR_USERNAME -p imbesdb -e "
SELECT id, projectName, startDate, endDate 
FROM kemri_projects 
WHERE projectName IN ('KCSAP', 'ASDSP', 'EU', 'Development of horticultural value chains(Assorted seeds)')
ORDER BY projectName;"
```

## Automated Import (Recommended)

### Option 1: Use the Script
1. Edit `import_kemri_projects.sh` and update server connection details:
   ```bash
   SERVER_HOST="your-server-host"
   SERVER_USER="your-username"
   SERVER_DB="imbesdb"
   SERVER_PORT="3306"
   ```

2. Run the script:
   ```bash
   ./import_kemri_projects.sh
   ```

### Option 2: Direct MySQL Commands
```bash
# Backup
mysqldump -h YOUR_SERVER_HOST -P 3306 -u YOUR_USERNAME -p imbesdb kemri_projects > backup.sql

# Drop and import
mysql -h YOUR_SERVER_HOST -P 3306 -u YOUR_USERNAME -p imbesdb -e "DROP TABLE IF EXISTS kemri_projects;"
mysql -h YOUR_SERVER_HOST -P 3306 -u YOUR_USERNAME -p imbesdb < kemri_projects_updated.sql
```

## What's Updated

### Projects with Correct Dates (37 total):
- **Agriculture Projects (15):**
  - KCSAP, ASDSP, EU
  - Development of horticultural value chains
  - Procurement of vaccines, acaricides
  - Dairy Cows, One day old chicks, Feed for the Chicks
  - Fish Cages for Kit Mikayi Kama Association
  - Completion of Achuodho Beach Management Unit
  - Supply of Life Saving Jackets, ABDP
  - And more...

- **Education Projects (22):**
  - feeding programme, ecde infrastructure
  - ecd capitation, computers and printers
  - ecd advocacy, Monitoring and assessment
  - capacity building, support for needy students
  - Ecd Bill/Act Drafting, BOG constitution
  - capitation disbursement, holdig graduation
  - VTC infrastructure, tools and equipment
  - And more...

### Date Format:
- **Start Date:** 2022-07-01 00:00:00
- **End Date:** 2023-06-30 00:00:00

## Safety Notes

1. **Always backup first** - The script creates automatic backups
2. **Test on staging** - If possible, test the import on a staging server first
3. **Verify data** - Check that the import was successful
4. **Keep backups** - Store backup files safely

## Troubleshooting

### If Import Fails:
1. Check server connection details
2. Verify database permissions
3. Check if table exists and has foreign key constraints
4. Restore from backup if needed

### If Data Looks Wrong:
1. Compare with backup file
2. Check for data type mismatches
3. Verify character encoding

## Expected Results

After successful import:
- **Total projects:** ~61 projects
- **Projects with dates:** ~42 projects (up from ~5)
- **Projects still missing dates:** ~19 projects

The dashboard will now show correct project timelines and dates!
























