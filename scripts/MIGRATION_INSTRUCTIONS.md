# Programs and Subprograms Migration - Quick Start

## Step 1: Install Dependencies

First, ensure the required packages are installed:

```bash
cd /home/dev/dev/imes_working/government_projects/api
npm install
```

This will install `mysql2` and `pg` packages that are already listed in `package.json`.

## Step 2: Run the Migration

### For Local Development

```bash
cd /home/dev/dev/imes_working/government_projects
node scripts/migrate_programs_subprograms.js
```

### For Remote Server

If you need to run on the remote server:

```bash
# SSH to server
ssh -i ~/.ssh/id_gprs_server fortress@102.210.149.119

# Navigate to project
cd /home/fortress/gprs

# Install dependencies if not already installed
cd api && npm install && cd ..

# Run migration
node scripts/migrate_programs_subprograms.js
```

## Step 3: Verify Migration

After running, check the counts:

```sql
-- Connect to PostgreSQL
psql -h localhost -U postgres -d government_projects

-- Check counts
SELECT COUNT(*) FROM programs WHERE voided = false;
SELECT COUNT(*) FROM subprograms WHERE voided = false;

-- View sample data
SELECT * FROM programs LIMIT 5;
SELECT * FROM subprograms LIMIT 5;
```

## Configuration

The script uses these defaults (can be overridden with environment variables):

**MySQL (Source):**
- Host: `102.210.149.119`
- Port: `3308`
- User: `impesUser`
- Password: `Admin2010impes`
- Database: `gov_imbesdb`

**PostgreSQL (Target):**
- Host: `localhost`
- Port: `5432`
- User: `postgres`
- Password: `postgres`
- Database: `government_projects`

To override, set environment variables:
```bash
export MYSQL_HOST=your_host
export MYSQL_PORT=3308
export PG_HOST=localhost
export PG_PASS=your_password
node scripts/migrate_programs_subprograms.js
```

## What Gets Migrated

- All programs where `voided = 0`
- All subprograms where `voided = 0`
- Original IDs are preserved
- Existing records (by ID) are skipped automatically
- Foreign key relationships maintained

## Troubleshooting

### "Cannot find module 'mysql2/promise'"
- Run `cd api && npm install` first

### "Connection refused"
- Check database hosts/ports
- Verify databases are running
- For Docker: ensure ports are exposed

### "Table does not exist"
- Tables must exist in PostgreSQL first
- Check database initialization scripts

For more details, see `scripts/MIGRATE_PROGRAMS_README.md`
