# Financial Years Population Script

This script adds missing financial years from 2013/2014 to the current year.

## Financial Year Format

Financial years run from **July 1** to **June 30** of the following year:
- FY2013/2014: July 1, 2013 → June 30, 2014
- FY2014/2015: July 1, 2014 → June 30, 2015
- etc.

**Storage Format**: All financial years are stored with "FY" prefix (e.g., "FY2014/2015") for uniformity.

**Flexible Input Matching**: The system accepts various input formats when importing data:
- `FY2014/2015` (with FY prefix, uppercase)
- `fy2014/2015` (with fy prefix, lowercase)
- `2014/2015` (without prefix)
- `2014-2015` (with dash separator)
- `fy 2014-2015` (with space and dash)

All these formats will match the stored "FY2014/2015" record in the database.

## Docker Database Configuration

- **Container name**: `mysql_db` (or `db`)
- **Root username**: `root`
- **Root password**: `root_password`
- **Database name**: `imbesdb`
- **Port**: `3307` (host) → `3306` (container)

## Running the Script

### Option 1: Node.js Script from API Container (Recommended)

The Node.js script intelligently:
- Checks for existing financial years
- Updates dates if they're incorrect
- Handles different naming formats (with/without FY prefix)
- Provides detailed logging

```bash
# Run inside the API container (uses existing DB connection)
docker exec -it node_api node /app/scripts/add_missing_financial_years.js
```

### Option 2: SQL Script via Docker

Run the SQL script directly in the MySQL container:

```bash
# Copy SQL file into container and execute
docker exec -i mysql_db mysql -uroot -proot_password imbesdb < api/migrations/add_missing_financial_years.sql
```

Or connect to the database container and run:

```bash
# Connect to MySQL container
docker exec -it mysql_db mysql -uroot -proot_password imbesdb

# Then run:
source /docker-entrypoint-initdb.d/add_missing_financial_years.sql;
```

### Option 3: SQL Script from Host Machine

If you have MySQL client installed on your host:

```bash
# From the project root
mysql -h 127.0.0.1 -P 3307 -uroot -proot_password imbesdb < api/migrations/add_missing_financial_years.sql
```

## What the Script Does

1. **Generates financial years** from 2013/2014 to the current year (2025/2026)
2. **Checks existing records** in the database
3. **Inserts missing years** with correct dates
4. **Updates existing records** if dates are incorrect
5. **Handles different formats** (2013/2014, FY2013/2014, 2013-2014)

## Expected Output

```
Adding financial years from 2013/2014 to 2025/2026...
Found X existing financial year(s) in database.
Processing 13 required financial years...

✓ Added: 2013/2014
✓ Added: 2014/2015
↻ Updated: FY2015/2016 → 2015/2016 (corrected dates)
⊘ Exists: 2016/2017 (dates correct)
...

=== Summary ===
Added: 8 financial year(s)
Updated: 2 existing record(s)
Skipped: 3 (already exists with correct dates)

Completed!
```

## Quick Start (Easiest Method)

Simply run the provided shell script from your project root:

```bash
./api/scripts/run_add_financial_years.sh
```

This script will:
- Check if Docker containers are running
- Execute the Node.js script inside the API container
- Display results

## Manual Execution

### Method 1: Node.js Script (Inside Container)
```bash
docker exec -it node_api node /app/scripts/add_missing_financial_years.js
```

### Method 2: SQL Script (Direct MySQL)
```bash
docker exec -i mysql_db mysql -uroot -proot_password imbesdb < api/migrations/add_missing_financial_years.sql
```

### Method 3: Interactive MySQL
```bash
# Connect to MySQL
docker exec -it mysql_db mysql -uroot -proot_password imbesdb

# Then paste and run the SQL from:
# api/migrations/add_missing_financial_years.sql
```

## Unique Constraint

Financial year names are now enforced to be unique to prevent duplicates. 

### Adding Unique Constraint

If you need to add the unique constraint to your database:

```bash
# First, clean up any existing duplicates
docker exec -i mysql_db mysql -uroot -proot_password imbesdb < api/migrations/cleanup_duplicate_financial_years.sql

# Then add the unique constraint
docker exec -i mysql_db mysql -uroot -proot_password imbesdb < api/migrations/add_unique_constraint_financial_years.sql
```

**Note**: The cleanup script will void duplicate records, keeping only the one with the lowest `finYearId`.

### Duplicate Prevention

- **API Route**: Checks for duplicates before creating/updating financial years
- **Script**: Checks for duplicates before inserting new records
- **Database**: Unique constraint on `finYearName` (if migration is applied)

## Notes

- The script uses `userId = 1` for new records (you may need to adjust this)
- Existing records are not deleted, only updated if dates are incorrect
- The script handles duplicate entries gracefully and checks before inserting
- The Node.js script uses the existing database connection from `api/config/db.js`
- All dates are set correctly: July 1 to June 30 for each financial year
- Financial year names must be unique (enforced at API and database level)

