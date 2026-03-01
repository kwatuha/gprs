# Troubleshooting Guide: Citizen Proposals, County Proposed Projects, and Announcements

## Common Issues and Solutions

### Issue 1: "Failed to submit proposal" Error

**Possible Causes:**
1. Database tables don't exist
2. Foreign key constraint failure (kemri_users table)
3. Invalid data format
4. Missing required fields

**Solutions:**

1. **Check if tables exist:**
   ```bash
   node api/scripts/check_tables_exist.js
   ```

2. **If tables don't exist, run migrations:**
   ```bash
   # Option 1: Use the setup script
   ./api/scripts/setup_citizen_features.sh imbesdb root your_password
   
   # Option 2: Run migrations manually
   mysql -u root -p imbesdb < api/migrations/create_citizen_proposals_table.sql
   mysql -u root -p imbesdb < api/migrations/create_county_proposed_projects_table.sql
   mysql -u root -p imbesdb < api/migrations/create_project_announcements_table.sql
   mysql -u root -p imbesdb < api/migrations/seed_sample_data.sql
   ```

3. **Check foreign key constraint:**
   The `citizen_proposals` table has a foreign key to `kemri_users`. If this causes issues, you can temporarily remove it:
   ```sql
   ALTER TABLE citizen_proposals DROP FOREIGN KEY fk_reviewed_by;
   ALTER TABLE citizen_proposals MODIFY reviewed_by INT NULL;
   ```

4. **Check API server logs:**
   Look for detailed error messages in the console/logs when submitting a proposal.

### Issue 2: "Failed to load data" Error

**Possible Causes:**
1. Tables don't exist
2. Database connection issues
3. SQL syntax errors
4. Empty tables (no sample data)

**Solutions:**

1. **Verify tables exist and have data:**
   ```sql
   SELECT COUNT(*) FROM citizen_proposals;
   SELECT COUNT(*) FROM county_proposed_projects;
   SELECT COUNT(*) FROM project_announcements;
   ```

2. **Check browser console:**
   - Open browser DevTools (F12)
   - Check Console tab for detailed error messages
   - Check Network tab to see API request/response

3. **Check API server console:**
   - Look for SQL errors or connection issues
   - Error messages now include more details

4. **Test API endpoints directly:**
   ```bash
   # Test citizen proposals
   curl http://localhost:3000/api/public/citizen-proposals
   
   # Test county projects
   curl http://localhost:3000/api/public/county-proposed-projects
   
   # Test announcements
   curl http://localhost:3000/api/public/announcements
   ```

### Issue 3: Foreign Key Constraint Errors

If you get errors about `kemri_users` foreign key:

**Solution 1: Make foreign key optional (recommended for public features)**
```sql
-- Remove foreign key constraint
ALTER TABLE citizen_proposals DROP FOREIGN KEY fk_reviewed_by;
ALTER TABLE county_proposed_projects DROP FOREIGN KEY fk_created_by;
ALTER TABLE project_announcements DROP FOREIGN KEY fk_announcement_created_by;
```

**Solution 2: Ensure kemri_users table exists**
```sql
-- Check if table exists
SHOW TABLES LIKE 'kemri_users';

-- If it doesn't exist, you may need to create a minimal version
-- or remove the foreign key constraints
```

### Issue 4: Empty Results

If pages load but show no data:

1. **Check if sample data was inserted:**
   ```sql
   SELECT * FROM citizen_proposals LIMIT 5;
   SELECT * FROM county_proposed_projects LIMIT 5;
   SELECT * FROM project_announcements LIMIT 5;
   ```

2. **If no data, run seed script:**
   ```bash
   mysql -u root -p imbesdb < api/migrations/seed_sample_data.sql
   ```

### Debugging Steps

1. **Enable detailed error logging:**
   - Check API server console for detailed error messages
   - Check browser console for frontend errors
   - Check Network tab for API responses

2. **Verify database connection:**
   ```bash
   # Test database connection
   mysql -u root -p imbesdb -e "SELECT 1"
   ```

3. **Check API routes are registered:**
   - Verify routes are in `api/routes/publicRoutes.js`
   - Check that routes are mounted in main app file

4. **Test with curl/Postman:**
   ```bash
   # Test POST request
   curl -X POST http://localhost:3000/api/public/citizen-proposals \
     -H "Content-Type: application/json" \
     -d '{
       "title": "Test Proposal",
       "description": "Test description",
       "category": "Infrastructure",
       "location": "Test Location",
       "estimatedCost": 1000000,
       "proposerName": "Test User",
       "proposerEmail": "test@example.com",
       "proposerPhone": "+254712345678",
       "justification": "Test justification",
       "expectedBenefits": "Test benefits",
       "timeline": "12 months"
     }'
   ```

## Quick Fix Script

Run this to set up everything at once:

```bash
# Make script executable (if not already)
chmod +x api/scripts/setup_citizen_features.sh

# Run setup
./api/scripts/setup_citizen_features.sh imbesdb root your_password

# Verify
node api/scripts/check_tables_exist.js
```

## Contact

If issues persist, check:
1. API server logs for detailed error messages
2. Browser console for frontend errors
3. Database connection and permissions
4. Table existence and structure

