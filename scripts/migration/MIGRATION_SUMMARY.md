# Migration Summary: Remote Database Tables to Local

## Date: 2026-02-28

## Projects Table Structure Comparison

### ✅ All Required Columns Present

Both remote and local projects tables have all 17 core columns. The local table has one additional column (`voided`) for soft delete functionality.

| Column | Remote Type | Local Type | Status |
|--------|------------|------------|--------|
| `project_id` | integer | integer | ✅ Match |
| `name` | text | character varying | ✅ Compatible |
| `description` | text | text | ✅ Match |
| `sector` | text | text | ✅ Match |
| `implementing_agency` | text | text | ✅ Match |
| `location` | jsonb | jsonb | ✅ Match |
| `budget` | jsonb | jsonb | ✅ Match |
| `timeline` | jsonb | jsonb | ✅ Match |
| `progress` | jsonb | jsonb | ✅ Match |
| `public_engagement` | jsonb | jsonb | ✅ Match |
| `data_sources` | jsonb | jsonb | ✅ Match |
| `created_at` | timestamp | timestamp | ✅ Match |
| `updated_at` | timestamp | timestamp | ✅ Match |
| `name_tsv` | tsvector | tsvector | ✅ Match |
| `notes` | jsonb | jsonb | ✅ Match |
| `ministry` | text | text | ✅ Match |
| `state_department` | text | text | ✅ Match |
| `voided` | - | boolean | ✅ Extra (for soft delete) |

**Note:** The `name` column type difference (text vs character varying) is compatible and doesn't affect functionality.

---

## Tables with Foreign Keys to Projects

### Successfully Migrated Tables

| Table Name | Remote Rows | Local Rows | Status | Notes |
|------------|-------------|------------|--------|-------|
| `feedback` | 0 | 0 | ✅ Complete | Table created, no data |
| `project_counties` | 47 | 47 | ✅ Complete | All rows migrated successfully |
| `project_sites` | 1,840 | 1,796 | ⚠ Partial | 44 rows failed (referenced project_ids don't exist locally) |
| `public_wifi` | 1,478 | 1,478 | ✅ Complete | All rows migrated successfully |

**Total Migrated:** 3,321 rows across 4 tables

### Tables Not Migrated (Require Extensions)

| Table Name | Remote Rows | Reason | Action Required |
|------------|-------------|--------|-----------------|
| `project_rag_index` | 102 | Requires `pgvector` extension | Install `pgvector` extension or skip |
| `project_rag_index0` | 1,868 | Requires `pgvector` extension | Install `pgvector` extension or skip |
| `project_rag_index1` | 11 | Requires `pgvector` extension | Install `pgvector` extension or skip |

**Note:** The `project_rag_index*` tables use PostgreSQL's `vector` type for AI/ML embeddings. To migrate these tables, you need to:
1. Install the `pgvector` extension in the local database: `CREATE EXTENSION IF NOT EXISTS vector;`
2. Re-run the migration script for these tables

---

## Data Quality Notes

### project_sites Migration
- **44 rows failed** due to foreign key constraint violations
- These rows reference `project_id` values that don't exist in the local `projects` table
- **Reason:** Local database only has 5 test projects (IDs: 1-5), while remote has many more projects
- **Solution:** Migrate more projects from remote, or remove the foreign key constraint temporarily

### Foreign Key Relationships

All migrated tables have foreign key constraints to `projects.project_id`:
- ✅ `feedback.project_id` → `projects.project_id` (ON DELETE CASCADE)
- ✅ `project_counties.project_id` → `projects.project_id` (ON DELETE CASCADE)
- ✅ `project_sites.project_id` → `projects.project_id` (ON DELETE CASCADE)
- ✅ `public_wifi.project_id` → `projects.project_id` (ON DELETE RESTRICT)

---

## Sample Data Verification

### project_counties Sample
```sql
SELECT pc.project_id, pc.county, p.name as project_name 
FROM project_counties pc 
JOIN projects p ON pc.project_id = p.project_id 
LIMIT 5;
```

Results show successful joins between `project_counties` and `projects` tables.

---

## Next Steps

1. ✅ **Projects table structure verified** - All columns match remote structure
2. ✅ **Foreign key tables migrated** - 4 out of 7 tables successfully migrated
3. ⏳ **Install pgvector extension** (optional) - To migrate `project_rag_index*` tables
4. ⏳ **Migrate more projects** (optional) - To resolve `project_sites` foreign key violations
5. ✅ **API routes updated** - Working with new JSONB structure

---

## Migration Scripts

- `scripts/migration/migrate-remote-tables-direct.js` - Main migration script
- `scripts/migration/restructure-projects-table-fixed.sql` - Projects table restructuring
- `scripts/migration/migrate-projects-test.js` - Test projects data migration

---

## Verification Commands

```bash
# Check projects table structure
PGPASSWORD=postgres psql -h localhost -p 5433 -U postgres -d government_projects -c "\d projects"

# Check migrated tables
PGPASSWORD=postgres psql -h localhost -p 5433 -U postgres -d government_projects -c "SELECT table_name FROM information_schema.tables WHERE table_name IN ('feedback', 'project_counties', 'project_sites', 'public_wifi');"

# Check row counts
PGPASSWORD=postgres psql -h localhost -p 5433 -U postgres -d government_projects -c "SELECT 'project_counties' as table_name, COUNT(*) FROM project_counties UNION ALL SELECT 'project_sites', COUNT(*) FROM project_sites UNION ALL SELECT 'public_wifi', COUNT(*) FROM public_wifi;"
```
