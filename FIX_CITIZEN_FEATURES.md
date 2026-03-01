# Fix: Citizen Proposals and Announcements Data Loading Issues

## Issues Fixed

### 1. **Improved Error Handling**
   - Added detailed error messages in API responses
   - Frontend now displays actual error messages instead of generic ones
   - Better validation for form submissions
   - Added error logging in API service functions

### 2. **Removed Foreign Key Constraints**
   - Removed foreign key constraints that referenced `kemri_users` table
   - This prevents errors if the `kemri_users` table doesn't exist or has issues
   - Tables will now work independently

### 3. **Better Form Validation**
   - Added validation for estimated cost (must be a valid positive number)
   - Better error messages for missing fields
   - Frontend validates data before submission

### 4. **Enhanced Error Messages**
   - API now returns detailed error information
   - Frontend displays specific error messages
   - Console logging for debugging

## Quick Fix Steps

### Step 1: Drop existing tables (if they exist with errors)
```sql
DROP TABLE IF EXISTS county_proposed_project_milestones;
DROP TABLE IF EXISTS county_proposed_projects;
DROP TABLE IF EXISTS citizen_proposals;
DROP TABLE IF EXISTS project_announcements;
```

### Step 2: Run migrations
```bash
# Option 1: Use the setup script
./api/scripts/setup_citizen_features.sh imbesdb root your_password

# Option 2: Run manually
mysql -u root -p imbesdb < api/migrations/create_citizen_proposals_table.sql
mysql -u root -p imbesdb < api/migrations/create_county_proposed_projects_table.sql
mysql -u root -p imbesdb < api/migrations/create_project_announcements_table.sql
mysql -u root -p imbesdb < api/migrations/seed_sample_data.sql
```

### Step 3: Verify tables exist
```bash
node api/scripts/check_tables_exist.js
```

### Step 4: Restart API server
```bash
# Restart your Node.js API server to load the updated routes
```

### Step 5: Test in browser
1. Open browser DevTools (F12)
2. Go to Console tab
3. Navigate to Citizen Proposals page
4. Check for any errors in console
5. Try submitting a proposal
6. Check Network tab to see API requests/responses

## What Changed

### API Routes (`api/routes/publicRoutes.js`)
- Added detailed error messages with `details` field
- Better validation for required fields
- Improved error logging

### Frontend Pages
- **CitizenProposalsPage.jsx**: Better error handling, validation, and error display
- **CountyProposedProjectsPage.jsx**: Enhanced error handling
- **AnnouncementsPage.jsx**: Enhanced error handling

### API Service (`public-dashboard/src/services/publicApi.js`)
- Added try-catch blocks with error logging
- Better error propagation

### Database Migrations
- Removed foreign key constraints that could cause issues
- Tables now work independently

## Testing

After running migrations:

1. **Test Citizen Proposals:**
   - Should see 5 sample proposals
   - Should be able to submit a new proposal
   - Check browser console for any errors

2. **Test County Proposed Projects:**
   - Should see 6 sample projects
   - Should be able to filter by category, status, priority
   - Check browser console for any errors

3. **Test Announcements:**
   - Should see 7 sample announcements
   - Should be able to filter by category
   - Check browser console for any errors

## Debugging

If issues persist:

1. **Check API server logs** for detailed SQL errors
2. **Check browser console** for frontend errors
3. **Check Network tab** to see API request/response
4. **Run check script**: `node api/scripts/check_tables_exist.js`
5. **Test API directly**: Use curl or Postman to test endpoints

## Common Error Messages

- **"Table doesn't exist"**: Run migrations
- **"Foreign key constraint fails"**: Already fixed by removing constraints
- **"Missing required fields"**: Check form validation
- **"Invalid estimated cost"**: Enter a valid number > 0

