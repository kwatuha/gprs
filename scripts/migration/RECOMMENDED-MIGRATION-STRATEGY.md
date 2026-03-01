# Recommended Migration Strategy

## Problem with Current Approach

We tried to merge schemas from the start, which caused:
- Schema conflicts (different column names, structures)
- Query mismatches requiring conditional logic
- Missing tables causing runtime errors
- Mixed schemas making debugging difficult

## Recommended Strategy: Migrate First, Optimize Later

### Phase 1: Complete 1:1 MySQL → PostgreSQL Migration ✅

**Goal**: Get the app working with PostgreSQL using the exact same schema as MySQL.

#### Step 1: Export MySQL Schema (Complete)
```bash
./scripts/migration/export-mysql-schema.sh
```
- Exports all 117 MySQL tables
- Preserves exact structure, column names, data types

#### Step 2: Convert MySQL Schema to PostgreSQL (Complete)
```bash
node scripts/migration/convert-mysql-to-postgres.js
```
- Converts MySQL syntax to PostgreSQL
- Preserves column names (e.g., `userId`, `departmentId`)
- Converts data types (e.g., `TINYINT(1)` → `BOOLEAN`)
- Handles `AUTO_INCREMENT` → `SERIAL`

#### Step 3: Create Fresh PostgreSQL Database
```bash
# Drop existing database to start clean
docker exec gov_postgres psql -U postgres -c "DROP DATABASE IF EXISTS government_projects;"
docker exec gov_postgres psql -U postgres -c "CREATE DATABASE government_projects;"
```

#### Step 4: Apply Converted MySQL Schema Only
```bash
docker exec -i gov_postgres psql -U postgres -d government_projects < scripts/migration/schema/postgres-schema-converted.sql
```
- Apply ONLY the converted MySQL schema
- Don't merge with remote schema yet
- This gives us 117 tables matching MySQL exactly

#### Step 5: Migrate All Data
```bash
node scripts/migration/migrate-data.js
```
- Migrate all 117 tables
- Preserve all data
- Handle foreign key relationships

#### Step 6: Verify Migration
```bash
# Compare table counts
docker exec gov_db mysql -u impesUser -pAdmin2010impes gov_imbesdb -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'gov_imbesdb';"
docker exec gov_postgres psql -U postgres -d government_projects -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"

# Compare row counts for key tables
docker exec gov_db mysql -u impesUser -pAdmin2010impes gov_imbesdb -e "SELECT 'users' as table_name, COUNT(*) as count FROM users UNION SELECT 'projects', COUNT(*) FROM projects;"
docker exec gov_postgres psql -U postgres -d government_projects -c "SELECT 'users' as table_name, COUNT(*) as count FROM users UNION SELECT 'projects', COUNT(*) FROM projects;"
```

#### Step 7: Update App to Use PostgreSQL
- Set `DB_TYPE=postgresql` in environment
- Update `api/config/db.js` to use PostgreSQL
- **No query changes needed** - column names are the same!

#### Step 8: Test Application
- All endpoints should work immediately
- No conditional logic needed
- Same queries, same column names

**Result**: App works with PostgreSQL, zero query changes needed ✅

---

### Phase 2: Incremental Optimization (After App Works)

Once the app is stable with PostgreSQL, we can incrementally optimize:

#### Step 1: Identify Remote Database Tables Needed
- Review remote PostgreSQL schema
- Identify which tables/features we need
- Create a priority list

#### Step 2: Merge Remote Tables (One at a Time)
For each remote table:
1. Check if equivalent exists in our schema
2. If yes: Migrate data and update queries
3. If no: Add table alongside existing schema
4. Test thoroughly before moving to next table

#### Step 3: Optimize with PostgreSQL Features
- Convert appropriate columns to JSONB
- Add full-text search indexes
- Optimize queries for PostgreSQL
- Update queries incrementally

#### Step 4: Refactor Gradually
- Update one route at a time
- Test after each change
- Keep old queries working during transition

---

## Benefits of This Approach

### ✅ Immediate Benefits
1. **App works immediately** - No query changes needed
2. **Zero downtime** - Can switch back to MySQL if needed
3. **Easy debugging** - Same schema, same queries
4. **Data integrity** - All 117 tables migrated

### ✅ Long-term Benefits
1. **Incremental optimization** - Change one thing at a time
2. **Easy rollback** - Can revert individual changes
3. **Better testing** - Test each optimization separately
4. **Less risk** - Smaller, focused changes

---

## Implementation Plan

### Option A: Start Fresh (Recommended)
1. Create new PostgreSQL database
2. Apply only converted MySQL schema
3. Migrate all data
4. Switch app to PostgreSQL
5. Test everything works
6. Then optimize incrementally

### Option B: Fix Current State
1. Keep current mixed schema
2. Fix queries to handle both schemas
3. Complete missing table migrations
4. Gradually align schemas

**Recommendation**: Option A is cleaner and faster long-term.

---

## Migration Scripts Available

- ✅ `export-mysql-schema.sh` - Export MySQL schema
- ✅ `convert-mysql-to-postgres.js` - Convert to PostgreSQL
- ✅ `migrate-data.js` - Migrate data
- ✅ `fix-converted-schema.js` - Fix common issues
- ⚠️ `merge-schemas.js` - Skip for now (use in Phase 2)

---

## Next Steps

1. **Decide**: Start fresh (Option A) or fix current (Option B)?
2. **If Option A**: Run Phase 1 steps above
3. **If Option B**: Continue fixing queries incrementally

**My Recommendation**: Start fresh with Phase 1. It will be faster and cleaner.
