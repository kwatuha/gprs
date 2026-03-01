# MySQL to PostgreSQL Migration Guide

This guide walks you through migrating from MySQL to PostgreSQL.

## Prerequisites

1. **PostgreSQL password for remote database**: You'll need the password to connect to `74.208.68.65`
2. **Docker and Docker Compose**: For running local databases
3. **Node.js**: For running migration scripts

## Step-by-Step Migration Process

### Step 1: Export Remote PostgreSQL Schema

First, export the schema from the remote PostgreSQL database:

```bash
cd /home/dev/dev/imes_working/government_projects
./scripts/migration/export-remote-postgres-schema.sh [password]
```

This will:
- Connect to the remote PostgreSQL database
- Export the schema to `scripts/migration/schema/remote-postgres-schema.sql`
- Create a table list in `scripts/migration/schema/remote-postgres-tables.txt`

**Note**: If you don't provide the password as an argument, you'll be prompted for it.

### Step 2: Export MySQL Schema

Export the schema from your local MySQL database:

```bash
./scripts/migration/export-mysql-schema.sh
```

This will:
- Export the MySQL schema to `scripts/migration/schema/mysql-schema.sql`
- Create a table list in `scripts/migration/schema/mysql-tables.txt`

### Step 3: Convert MySQL Schema to PostgreSQL

Convert the MySQL schema to PostgreSQL-compatible syntax:

```bash
node scripts/migration/convert-mysql-to-postgres.js
```

This will:
- Convert MySQL data types to PostgreSQL equivalents
- Convert MySQL syntax to PostgreSQL syntax
- Output to `scripts/migration/schema/postgres-schema-converted.sql`

**Important**: Review the converted schema for any manual adjustments needed.

### Step 4: Merge Schemas

Merge the remote PostgreSQL schema with the converted MySQL schema:

```bash
node scripts/migration/merge-schemas.js
```

This will:
- Combine both schemas
- Identify conflicts (tables that exist in both)
- Create a merged schema in `scripts/migration/schema/merged-postgres-schema.sql`

**Review the merged schema** to ensure all tables are included correctly.

### Step 5: Start Local PostgreSQL Database

Start the PostgreSQL container:

```bash
docker-compose up -d postgres_db
```

Wait for it to be healthy (check with `docker-compose ps`).

### Step 6: Apply Merged Schema to Local PostgreSQL

Apply the merged schema to your local PostgreSQL database:

```bash
docker exec -i gov_postgres psql -U postgres -d government_projects < scripts/migration/schema/merged-postgres-schema.sql
```

Or if you prefer to connect directly:

```bash
psql -h localhost -p 5433 -U postgres -d government_projects -f scripts/migration/schema/merged-postgres-schema.sql
```

### Step 7: Migrate Data from MySQL to PostgreSQL

Run the data migration script:

```bash
# Set environment variables if needed
export MYSQL_HOST=gov_db
export MYSQL_PORT=3306
export MYSQL_USER=impesUser
export MYSQL_PASSWORD=Admin2010impes
export MYSQL_DATABASE=gov_imbesdb

export DB_HOST=gov_postgres
export DB_PORT=5432
export DB_USER=postgres
export DB_PASSWORD=postgres
export DB_NAME=government_projects

node scripts/migration/migrate-data.js
```

This will:
- Read data from MySQL
- Transform data types as needed
- Insert data into PostgreSQL
- Log progress to `scripts/migration/data/migration-log.txt`

### Step 8: Update Application Code

1. **Install PostgreSQL driver**:
   ```bash
   cd api
   npm install pg
   ```

2. **Update environment variables**:
   Set `DB_TYPE=postgresql` in your `.env` file or docker-compose.yml

3. **Update database queries**:
   - Replace `?` placeholders with `$1, $2, ...` (or use the `convertQuery` helper)
   - Review SQL syntax differences
   - Test all API endpoints

### Step 9: Test the Application

1. Start all services:
   ```bash
   docker-compose up -d
   ```

2. Test API endpoints to ensure they work with PostgreSQL

3. Verify data integrity by comparing record counts

### Step 10: Optimize for PostgreSQL

1. **Identify JSON column opportunities**:
   - Review tables with multiple related fields
   - Consider consolidating into JSON columns
   - Update queries to use JSON operators

2. **Add PostgreSQL-specific indexes**:
   - GIN indexes for JSON columns
   - Full-text search indexes
   - Partial indexes for common queries

3. **Performance testing**:
   - Run load tests
   - Monitor query performance
   - Optimize slow queries

## Troubleshooting

### Connection Issues

- **PostgreSQL connection refused**: Check if the container is running (`docker-compose ps`)
- **Authentication failed**: Verify credentials in environment variables
- **Database doesn't exist**: Create it manually: `CREATE DATABASE government_projects;`

### Schema Conversion Issues

- **ENUM types**: May need manual conversion to CHECK constraints or PostgreSQL ENUM
- **AUTO_INCREMENT**: Should be converted to SERIAL/BIGSERIAL
- **MySQL-specific functions**: May need PostgreSQL equivalents

### Data Migration Issues

- **Type mismatches**: Check the migration log for specific errors
- **Foreign key violations**: Ensure referenced tables exist and data is valid
- **Duplicate keys**: Use `ON CONFLICT` handling in INSERT statements

## Rollback Plan

If you need to rollback:

1. Keep MySQL database running until migration is verified
2. Switch `DB_TYPE` back to `mysql` in environment
3. Restart services

## Next Steps After Migration

1. **Remove MySQL dependency** (optional):
   - Remove `mysql2` from package.json
   - Remove MySQL service from docker-compose.yml
   - Clean up MySQL-specific code

2. **Leverage PostgreSQL features**:
   - Use JSON/JSONB columns where appropriate
   - Implement full-text search
   - Use array types for multi-value fields
   - Implement materialized views for complex queries

3. **Update documentation**:
   - Update API documentation
   - Update deployment guides
   - Document PostgreSQL-specific features used

## Support

For issues or questions:
1. Check migration logs in `scripts/migration/data/migration-log.txt`
2. Review schema conversion output
3. Test queries individually in PostgreSQL
