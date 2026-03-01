# Implementation Summary: Budget Items → Project Registry Integration

## What Was Implemented

### 1. Database Migration
**File:** `api/migrations/add_budgetId_to_projects.sql`

Added `budgetId` column to `kemri_projects` table:
- Optional/nullable column to track which budget created/imported the project
- Indexed for performance
- Foreign key constraint is optional (commented out for flexibility)

**To apply:**
```bash
docker compose exec mysql_db mysql -u impesUser -pAdmin2010impes imbesdb < api/migrations/add_budgetId_to_projects.sql
```

### 2. Updated Import Logic
**File:** `api/routes/budgetContainerRoutes.js` (lines ~2463-2624)

**Changes:**
- **Always create/update project first** before inserting budget item
- **Set status to 'Under Procurement'** for new projects
- **Set budgetId** on project to track source budget
- **Update existing projects:**
  - Set status to 'Under Procurement' if not set
  - Set budgetId if null
  - Accumulate costOfProject (use maximum of existing and new amount)
- **Link project to locations** (ward/subcounty) automatically
- **Ensure projectId is always set** when inserting budget item

**Key Logic:**
```javascript
// Check if project exists
if (project exists) {
    // Update: set status, budgetId, accumulate cost
} else {
    // Create: status='Under Procurement', budgetId=current budget
}

// Link to locations (ward/subcounty)

// Insert budget item with projectId (always set)
```

### 3. Updated API Endpoints
**File:** `api/routes/budgetContainerRoutes.js` (lines ~567-850)

**Endpoints:**
1. `GET /api/budgets/items/under-procurement`
   - Gets budget items linked to projects with status 'Under Procurement'
   - Supports filtering by budget, department, location, finYear, public approval

2. `GET /api/budgets/items/registry`
   - Gets budget items for Registry of Projects
   - Defaults to `approved_for_public = 1`
   - Supports filtering by status, pagination

**Note:** Both endpoints now use INNER JOIN (not LEFT JOIN) because all budget items have projectId.

### 4. Documentation
**Files:**
- `docs/BUDGET_ITEMS_PROJECT_REGISTRY_INTEGRATION.md` - Complete integration guide
- `docs/BUDGET_ITEMS_PUBLIC_APPROVAL_RECOMMENDATION.md` - Original recommendation (updated)

## Benefits

1. **Data Consistency**
   - ✅ All budget items have valid projectId
   - ✅ All projects are in the registry
   - ✅ Projects have proper status ('Under Procurement')
   - ✅ Projects are linked to locations

2. **Query Simplicity**
   - ✅ Simple INNER JOIN (no NULL checks needed)
   - ✅ Can filter by project status, public approval
   - ✅ Can query projects by budget

3. **Public Portal Ready**
   - ✅ Budget items can be shown via linked projects
   - ✅ Projects control visibility via `approved_for_public`
   - ✅ Status filtering works seamlessly

4. **Workflow Continuity**
   - ✅ Projects flow: Budgeting → Procurement → Implementation
   - ✅ Status tracking: 'Under Procurement' → 'Ongoing' → 'Completed'
   - ✅ Budget tracking: Can see which budget created which projects

## Next Steps

1. **Run the migration:**
   ```bash
   docker compose exec mysql_db mysql -u impesUser -pAdmin2010impes imbesdb < api/migrations/add_budgetId_to_projects.sql
   ```

2. **Re-import budget data (recommended):**
   - Re-import existing budget items to ensure all projects are created/updated with proper status and budgetId
   - This will create/update projects with status 'Under Procurement' and link them to locations

3. **Test the endpoints:**
   ```bash
   # Get budget items under procurement
   curl http://localhost:8080/api/budgets/items/under-procurement?approvedForPublic=1
   
   # Get budget items for registry
   curl http://localhost:8080/api/budgets/items/registry?status=under procurement&approvedForPublic=1
   ```

4. **Update existing projects (optional):**
   If you have existing budget items with projectId but projects don't have budgetId:
   ```sql
   UPDATE kemri_projects p
   INNER JOIN kemri_budget_items bi ON p.id = bi.projectId
   SET p.budgetId = bi.budgetId
   WHERE p.budgetId IS NULL
     AND bi.voided = 0
     AND p.voided = 0;
   ```

## Important Notes

- **projectName in budget_items**: Kept as denormalized field for performance, but `projectId` is the source of truth
- **budgetId in projects**: Optional/nullable to allow projects created outside of budgeting
- **Status management**: Projects created during import get status 'Under Procurement' automatically
- **Cost accumulation**: If multiple budget items reference the same project, `costOfProject` is set to the maximum (accumulated budget)
- **Location linking**: Projects are automatically linked to wards/subcounties during import

## Testing Checklist

- [ ] Run migration script
- [ ] Re-import a budget file
- [ ] Verify projects are created with status 'Under Procurement'
- [ ] Verify projects have budgetId set
- [ ] Verify projects are linked to locations
- [ ] Verify budget items have projectId set
- [ ] Test `/api/budgets/items/under-procurement` endpoint
- [ ] Test `/api/budgets/items/registry` endpoint
- [ ] Verify public portal can query projects under procurement
