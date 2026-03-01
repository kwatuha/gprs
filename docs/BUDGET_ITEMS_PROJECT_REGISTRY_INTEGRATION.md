# Budget Items and Project Registry Integration

## Overview

This document describes the integration between budget items (`kemri_budget_items`) and the Registry of Projects (`kemri_projects`). The goal is to ensure that all budget items are linked to projects in the registry, enabling seamless querying and public portal display.

## Architecture Decision

### Problem
Previously, budget items could have a `projectName` without a corresponding entry in `kemri_projects`. This made it impossible to:
- Join budget items with the Registry of Projects
- Show budget items on the public portal
- Track projects through their lifecycle from budgeting to procurement

### Solution
**Ensure all budget items are linked to projects in the registry:**

1. **Add `budgetId` column to `kemri_projects`** (optional/nullable)
   - Tracks which budget created/imported the project
   - Allows querying projects by budget

2. **Always create/update project during import**
   - When importing budget items, first create or update the project in `kemri_projects`
   - Set status to 'Under Procurement' for new projects
   - Set `budgetId` to track the source budget
   - Link project to locations (ward/subcounty) if available

3. **Use `projectId` as source of truth**
   - `projectId` in `kemri_budget_items` is now always set
   - `projectName` is kept as a denormalized field for performance
   - All queries use `projectId` for joins

## Database Schema Changes

### kemri_projects
```sql
ALTER TABLE kemri_projects 
ADD COLUMN budgetId INT NULL AFTER finYearId,
ADD INDEX idx_budgetId (budgetId);
```

**Purpose:**
- `budgetId`: Optional reference to the budget that created/imported this project
- Allows tracking which budget items belong to which budget
- Enables querying projects by budget

### kemri_budget_items
**No schema changes needed.** The table already has:
- `projectId` (INT, nullable) - Now always set
- `projectName` (VARCHAR) - Denormalized for performance, but `projectId` is source of truth

## Import Process Flow

### Before (Old Approach)
```
1. Read projectName from Excel
2. Check if project exists in kemri_projects
3. If not, create project (basic info only)
4. Insert budget item with projectId (if found) or NULL
```

**Problem:** Projects might not exist, or might not have proper status/location links.

### After (New Approach)
```
1. Read projectName from Excel
2. Check if project exists in kemri_projects
3. If exists:
   - Update status to 'Under Procurement' if not set
   - Set budgetId if null
   - Update costOfProject (accumulate budget)
4. If not exists:
   - Create project with:
     * status = 'Under Procurement'
     * budgetId = current budget
     * departmentId, finYearId, costOfProject
5. Link project to locations (ward/subcounty) if available
6. Insert budget item with projectId (always set)
```

**Benefits:**
- All budget items have valid projectId
- All projects are in the registry with proper status
- Projects are linked to locations
- Can query budget items by joining with projects

## Query Examples

### Get all budget items under procurement
```sql
SELECT 
    bi.*,
    p.*,
    p.status as projectStatus,
    p.approved_for_public
FROM kemri_budget_items bi
INNER JOIN kemri_projects p ON bi.projectId = p.id
WHERE bi.voided = 0
  AND p.voided = 0
  AND LOWER(p.status) = 'under procurement'
```

### Get budget items for public portal
```sql
SELECT 
    bi.*,
    p.*,
    p.approved_for_public
FROM kemri_budget_items bi
INNER JOIN kemri_projects p ON bi.projectId = p.id
WHERE bi.voided = 0
  AND p.voided = 0
  AND p.approved_for_public = 1
  AND LOWER(p.status) = 'under procurement'
```

### Get projects created by a specific budget
```sql
SELECT *
FROM kemri_projects
WHERE budgetId = ?
  AND voided = 0
```

## API Endpoints

### 1. `/api/budgets/items/under-procurement`
Get budget items linked to projects with status 'Under Procurement'

**Query Parameters:**
- `budgetId` - Filter by budget
- `departmentId` - Filter by department
- `subcountyId` - Filter by subcounty
- `wardId` - Filter by ward
- `finYearId` - Filter by financial year
- `approvedForPublic` - Filter by public approval (true/false)

**Example:**
```bash
GET /api/budgets/items/under-procurement?approvedForPublic=1&budgetId=123
```

### 2. `/api/budgets/items/registry`
Get budget items that should appear in the Registry of Projects

**Query Parameters:**
- `status` - Filter by project status (e.g., 'under procurement')
- `approvedForPublic` - Filter by public approval (default: '1')
- `budgetId` - Filter by budget
- `departmentId` - Filter by department
- `subcountyId` - Filter by subcounty
- `wardId` - Filter by ward
- `finYearId` - Filter by financial year
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 50)

**Example:**
```bash
GET /api/budgets/items/registry?status=under procurement&approvedForPublic=1&page=1&limit=20
```

## Migration Steps

1. **Run migration script:**
   ```bash
   docker compose exec mysql_db mysql -u impesUser -pAdmin2010impes imbesdb < api/migrations/add_budgetId_to_projects.sql
   ```

2. **Update existing projects (optional):**
   - For existing budget items with projectId but project doesn't have budgetId:
     ```sql
     UPDATE kemri_projects p
     INNER JOIN kemri_budget_items bi ON p.id = bi.projectId
     SET p.budgetId = bi.budgetId
     WHERE p.budgetId IS NULL
       AND bi.voided = 0
       AND p.voided = 0;
     ```

3. **Re-import budget data (recommended):**
   - Re-import budget items to ensure all projects are created/updated with proper status and budgetId

## Benefits

1. **Data Consistency**
   - All budget items have valid projectId
   - All projects are in the registry
   - Projects have proper status and location links

2. **Query Simplicity**
   - Simple INNER JOIN between budget_items and projects
   - No need to check for NULL projectId
   - Can filter by project status, public approval, etc.

3. **Public Portal Integration**
   - Budget items can be shown on public portal via their linked projects
   - Projects control public visibility via `approved_for_public`
   - Status filtering works seamlessly

4. **Workflow Continuity**
   - Projects flow from budgeting → procurement → implementation
   - Status tracking: 'Under Procurement' → 'Ongoing' → 'Completed'
   - Budget tracking: Can see which budget created which projects

## Notes

- **projectName in budget_items**: Kept as denormalized field for performance, but `projectId` is the source of truth
- **budgetId in projects**: Optional/nullable to allow projects created outside of budgeting
- **Location linking**: Projects are automatically linked to wards/subcounties during import
- **Cost accumulation**: If multiple budget items reference the same project, `costOfProject` is set to the maximum (accumulated budget)
