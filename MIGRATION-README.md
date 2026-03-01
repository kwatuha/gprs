# PostgreSQL Migration Setup

This project is being migrated from MySQL to PostgreSQL. This document provides an overview of the migration setup and how to proceed.

## Quick Start

1. **Export remote PostgreSQL schema** (you'll need the password):
   ```bash
   ./scripts/migration/export-remote-postgres-schema.sh [password]
   ```

2. **Export MySQL schema**:
   ```bash
   ./scripts/migration/export-mysql-schema.sh
   ```

3. **Convert and merge schemas**:
   ```bash
   node scripts/migration/convert-mysql-to-postgres.js
   node scripts/migration/merge-schemas.js
   ```

4. **Start PostgreSQL database**:
   ```bash
   docker-compose up -d postgres_db
   ```

5. **Apply schema**:
   ```bash
   docker exec -i gov_postgres psql -U postgres -d government_projects < scripts/migration/schema/merged-postgres-schema.sql
   ```

6. **Migrate data**:
   ```bash
   node scripts/migration/migrate-data.js
   ```

7. **Switch application to PostgreSQL**:
   - Set `DB_TYPE=postgresql` in environment
   - Restart services: `docker-compose restart api`

## What's Been Set Up

### 1. Docker Compose Configuration
- Added PostgreSQL service (`postgres_db`) to `docker-compose.yml`
- PostgreSQL runs on port `5433` (to avoid conflicts)
- Database name: `government_projects`
- Both MySQL and PostgreSQL run simultaneously during migration

### 2. Migration Scripts

Located in `scripts/migration/`:

- **`export-remote-postgres-schema.sh`**: Exports schema from remote PostgreSQL
- **`export-mysql-schema.sh`**: Exports schema from local MySQL
- **`convert-mysql-to-postgres.js`**: Converts MySQL schema to PostgreSQL
- **`merge-schemas.js`**: Merges remote PostgreSQL and MySQL schemas
- **`migrate-data.js`**: Migrates data from MySQL to PostgreSQL
- **`find-mysql-queries.js`**: Finds MySQL-specific code that needs updating
- **`analyze-json-opportunities.js`**: Identifies tables that could use JSON columns

### 3. Updated Codebase

- **`api/config/db.js`**: Now supports both MySQL and PostgreSQL
  - Set `DB_TYPE=postgresql` to use PostgreSQL
  - Automatically converts MySQL `?` placeholders to PostgreSQL `$1, $2, ...`
  - Provides unified interface for both databases

- **`api/package.json`**: Added `pg` package for PostgreSQL support

### 4. Documentation

- **`migration-plan.md`**: Overall migration strategy
- **`scripts/migration/MIGRATION-GUIDE.md`**: Detailed step-by-step guide
- **`MIGRATION-README.md`**: This file

## Current Status

✅ Docker Compose updated with PostgreSQL  
✅ Migration scripts created  
✅ Database connection code updated for dual support  
✅ Documentation created  

⏳ **Next Steps**:
1. Export remote PostgreSQL schema (requires password)
2. Run migration scripts
3. Test application with PostgreSQL
4. Optimize for PostgreSQL features (JSON columns, etc.)

## Database Connection

The application now supports both MySQL and PostgreSQL. Switch between them using the `DB_TYPE` environment variable:

- **MySQL** (current): `DB_TYPE=mysql` or omit (default)
- **PostgreSQL** (after migration): `DB_TYPE=postgresql`

## Important Notes

1. **Remote PostgreSQL Password**: You'll need the password to connect to `74.208.68.65`. The export script will prompt for it if not provided.

2. **Schema Conflicts**: If a table exists in both remote PostgreSQL and MySQL, the merge script will use the remote PostgreSQL version. Review conflicts manually.

3. **Data Types**: Some MySQL data types are automatically converted, but review the converted schema for accuracy.

4. **Queries**: MySQL `?` placeholders are automatically converted to PostgreSQL `$1, $2, ...` format, but some queries may need manual adjustment.

5. **Testing**: Test thoroughly after migration before removing MySQL support.

## Getting Help

- Check `scripts/migration/MIGRATION-GUIDE.md` for detailed instructions
- Review migration logs in `scripts/migration/data/migration-log.txt`
- Run `node scripts/migration/find-mysql-queries.js` to find code that needs updating

## Rollback

If you need to rollback to MySQL:
1. Set `DB_TYPE=mysql` in environment
2. Restart services: `docker-compose restart api`

The MySQL database remains available during migration for safety.
