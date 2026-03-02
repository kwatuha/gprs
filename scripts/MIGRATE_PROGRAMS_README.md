# Programs and Subprograms Migration Guide

This guide explains how to migrate programs and subprograms tables from the original MySQL database to PostgreSQL.

## Prerequisites

1. **Node.js** installed (for running the migration script)
2. **Database access** to both MySQL and PostgreSQL databases
3. **Required npm packages**: `mysql2` and `pg`

## Installation

Install required packages if not already installed:

```bash
npm install mysql2 pg
```

## Configuration

The migration script uses environment variables for database connections. You can set these or use the defaults:

### MySQL (Source Database)
- `MYSQL_HOST` - Default: `102.210.149.119`
- `MYSQL_PORT` - Default: `3308`
- `MYSQL_USER` - Default: `impesUser`
- `MYSQL_PASS` - Default: `Admin2010impes`
- `MYSQL_DB` - Default: `gov_imbesdb`

### PostgreSQL (Target Database)
- `PG_HOST` - Default: `localhost`
- `PG_PORT` - Default: `5432`
- `PG_USER` - Default: `postgres`
- `PG_PASS` - Default: `postgres`
- `PG_DB` - Default: `government_projects`

## Running the Migration

### Option 1: Run from Local Machine

If you have direct access to both databases:

```bash
cd /home/dev/dev/imes_working/government_projects
node scripts/migrate_programs_subprograms.js
```

### Option 2: Run on Remote Server

If you need to run on the remote server:

```bash
# SSH to the server
ssh -i ~/.ssh/id_gprs_server fortress@102.210.149.119

# Navigate to the project directory
cd /home/fortress/gprs

# Run the migration script
node scripts/migrate_programs_subprograms.js
```

### Option 3: Using Docker

If databases are in Docker containers:

```bash
# For MySQL connection via Docker
export MYSQL_HOST=localhost
export MYSQL_PORT=3308

# For PostgreSQL connection via Docker
export PG_HOST=localhost
export PG_PORT=5432

node scripts/migrate_programs_subprograms.js
```

## What the Script Does

1. **Connects** to both MySQL and PostgreSQL databases
2. **Fetches** all programs from MySQL where `voided = 0`
3. **Fetches** all subprograms from MySQL where `voided = 0`
4. **Checks** if each record already exists in PostgreSQL (by ID)
5. **Migrates** only new records, skipping duplicates
6. **Maps** columns automatically based on available table structure
7. **Reports** summary of migrated, skipped, and error records

## Expected Output

```
=== Programs and Subprograms Migration ===

Connecting to MySQL...
✓ Connected to MySQL
Connecting to PostgreSQL...
✓ Connected to PostgreSQL

=== Migrating Programs ===
Fetching programs from MySQL...
Found 25 programs to migrate
  ✓ Migrated program 1: Health Program
  ✓ Migrated program 2: Education Program
  ...

=== Migrating Subprograms ===
Fetching subprograms from MySQL...
Found 50 subprograms to migrate
  ✓ Migrated subprogram 1: Primary Health Care
  ...

=== Migration Summary ===
Programs:
  Migrated: 25
  Skipped: 0
  Errors: 0

Subprograms:
  Migrated: 50
  Skipped: 0
  Errors: 0

Final PostgreSQL counts:
  Programs: 25
  Subprograms: 50
```

## Troubleshooting

### Error: "Table 'programs' does not exist"

If the tables don't exist in PostgreSQL, you need to create them first. Check the database initialization scripts or create the tables manually.

### Error: "Connection refused"

- Verify database hosts and ports are correct
- Check if databases are running
- Verify firewall rules allow connections
- For Docker, ensure ports are exposed

### Error: "Column does not exist"

The script automatically maps columns, but if there's a mismatch:
1. Check the table structures in both databases
2. Update the `columnMap` in the script if needed
3. Ensure both tables have compatible schemas

### Duplicate Key Errors

The script checks for existing records, but if you still get duplicate errors:
- The check might have failed
- Run the script again - it will skip existing records
- Or manually clean up duplicates first

## Verifying the Migration

After migration, verify the data:

```sql
-- Check programs count
SELECT COUNT(*) FROM programs WHERE voided = false;

-- Check subprograms count
SELECT COUNT(*) FROM subprograms WHERE voided = false;

-- Check a sample program
SELECT * FROM programs WHERE "programId" = 1;

-- Check subprograms for a program
SELECT * FROM subprograms WHERE "programId" = 1;
```

## Notes

- The script only migrates records where `voided = 0` (active records)
- Existing records (by ID) are skipped automatically
- The script preserves original IDs from MySQL
- Foreign key relationships are maintained (programId in subprograms)
- Timestamps (createdAt, updatedAt) are preserved if they exist

## Rollback

If you need to rollback the migration:

```sql
-- Delete all migrated programs and subprograms
DELETE FROM subprograms;
DELETE FROM programs;
```

**Warning**: This will delete all programs and subprograms, not just migrated ones. Use with caution!
