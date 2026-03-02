# Creating Programs and Subprograms Tables

## Quick Setup

Run this SQL script to create the `programs` and `subprograms` tables in PostgreSQL:

### Option 1: Direct Connection (if PostgreSQL is running locally)

```bash
psql -h localhost -U postgres -d government_projects -f api/migrations/create_programs_subprograms_tables.sql
```

### Option 2: Docker Container

If PostgreSQL is running in a Docker container:

```bash
# Copy the SQL file to the container and execute
docker exec -i gov_postgres psql -U postgres -d government_projects < api/migrations/create_programs_subprograms_tables.sql
```

### Option 3: Remote Server

If running on the remote server:

```bash
# SSH to server
ssh -i ~/.ssh/id_gprs_server fortress@102.210.149.119

# Navigate to project
cd /home/fortress/gprs

# Run the SQL script
docker exec -i gov_postgres psql -U postgres -d government_projects < api/migrations/create_programs_subprograms_tables.sql
```

### Option 4: Using psql interactively

```bash
# Connect to PostgreSQL
psql -h localhost -U postgres -d government_projects

# Then paste the contents of create_programs_subprograms_tables.sql
\i api/migrations/create_programs_subprograms_tables.sql
```

## What This Creates

1. **programs table** with columns:
   - programId (primary key)
   - programme (name)
   - remarks
   - userId, createdAt, updatedAt
   - voided, voidedBy
   - cidpid, departmentId, sectionId
   - needsPriorities, strategies, objectives, outcomes

2. **subprograms table** with columns:
   - subProgramId (primary key)
   - programId (foreign key to programs)
   - subProgramme (name)
   - keyOutcome, kpi, baseline
   - yr1Targets through yr5Targets
   - yr1Budget through yr5Budget, totalBudget
   - remarks, userId, createdAt, updatedAt
   - voided, voidedBy

3. **Indexes** for better query performance
4. **Foreign key constraint** between subprograms and programs

## Verify Tables Created

After running the script, verify:

```sql
-- Check if tables exist
\dt programs
\dt subprograms

-- Check table structure
\d programs
\d subprograms

-- Check counts (should be 0 initially)
SELECT COUNT(*) FROM programs;
SELECT COUNT(*) FROM subprograms;
```

## Next Steps

After creating the tables, you can:
1. Run the migration script to import data from MySQL
2. Test the API endpoints for programs and subprograms
