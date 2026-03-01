# MySQL to PostgreSQL Migration Plan

## Overview
Migrate from MySQL (`gov_imbesdb`) to PostgreSQL, using the remote PostgreSQL database (`government_projects`) as the foundation and merging all tables from MySQL.

## Steps

### Phase 1: Setup Local PostgreSQL Environment
1. Add PostgreSQL service to Docker Compose
2. Create local database matching remote structure
3. Import existing data from remote PostgreSQL

### Phase 2: Schema Migration
1. Export MySQL schema (117 tables)
2. Convert MySQL schema to PostgreSQL:
   - Data type conversions (INT -> INTEGER, TINYINT -> BOOLEAN/SMALLINT, etc.)
   - Remove MySQL-specific syntax
   - Convert AUTO_INCREMENT to SERIAL/BIGSERIAL
   - Handle ENUM types (convert to CHECK constraints or use PostgreSQL ENUM)
   - Update foreign key constraints
3. Merge schemas (remote PostgreSQL + MySQL converted)
4. Identify tables that can benefit from JSON columns

### Phase 3: Data Migration
1. Export data from MySQL
2. Transform data for PostgreSQL compatibility
3. Import into PostgreSQL
4. Verify data integrity

### Phase 4: Code Migration
1. Replace `mysql2` with `pg` (node-postgres)
2. Update all database queries:
   - Replace `?` placeholders with `$1, $2, ...`
   - Update SQL syntax differences
   - Handle JSON columns
3. Update connection pool configuration
4. Test all API endpoints

### Phase 5: Optimization
1. Identify tables that can use JSON columns
2. Consolidate related tables using JSON
3. Add PostgreSQL-specific indexes
4. Performance testing

## Tables That May Benefit from JSON Columns

Based on the schema, these tables could potentially use JSON:
- `dashboard_components` - `custom_settings` already uses JSON
- `role_dashboard_config` - `permissions` already uses JSON
- `component_data_access_rules` - `rule_config` already uses JSON
- `user_data_filters` - `filter_value` already uses JSON
- Tables with multiple text fields that could be consolidated
- Settings/preferences tables

## Migration Scripts Location
- `scripts/migration/` - All migration scripts
- `scripts/migration/schema/` - Schema conversion scripts
- `scripts/migration/data/` - Data migration scripts
