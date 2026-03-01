# Remove Redundant Columns from kemri_budget_items

## Overview

Removed redundant columns (`departmentId`, `wardId`, `subcountyId`) from `kemri_budget_items` table since these are already tracked in `kemri_projects` and its junction tables.

## Rationale

1. **Data Redundancy**: `kemri_projects` already has `departmentId`
2. **Junction Tables**: Projects are linked to wards/subcounties through `kemri_project_wards` and `kemri_project_subcounties`
3. **Simplified Queries**: Eliminates unnecessary joins - get department/location from project instead
4. **Data Consistency**: Single source of truth for department and location data

## Changes Made

### 1. Database Migration
**File:** `api/migrations/remove_redundant_columns_from_budget_items.sql`

Removes:
- `departmentId` (was NOT NULL)
- `wardId` (was nullable)
- `subcountyId` (was nullable)

### 2. Updated Import Logic
**File:** `api/routes/budgetContainerRoutes.js`

- Removed `departmentId`, `wardId`, `subcountyId` from INSERT statements
- These values are now obtained from the linked project

### 3. Updated All Queries
**File:** `api/routes/budgetContainerRoutes.js`

**Before:**
```sql
SELECT bi.*, d.name as departmentName
FROM kemri_budget_items bi
LEFT JOIN kemri_departments d ON bi.departmentId = d.departmentId
LEFT JOIN kemri_subcounties sc ON bi.subcountyId = sc.subcountyId
LEFT JOIN kemri_wards w ON bi.wardId = w.wardId
```

**After:**
```sql
SELECT bi.*, p.departmentId, d.name as departmentName
FROM kemri_budget_items bi
INNER JOIN kemri_projects p ON bi.projectId = p.id
LEFT JOIN kemri_departments d ON p.departmentId = d.departmentId
-- Locations from junction tables:
(SELECT GROUP_CONCAT(DISTINCT sc.name SEPARATOR ', ')
 FROM kemri_project_subcounties psc
 JOIN kemri_subcounties sc ON psc.subcountyId = sc.subcountyId
 WHERE psc.projectId = p.id AND psc.voided = 0) as subcountyName
```

### 4. Updated Filter Logic
**Before:**
```javascript
if (departmentId) {
    whereConditions.push('bi.departmentId = ?');
}
```

**After:**
```javascript
if (departmentId) {
    whereConditions.push('p.departmentId = ?');
}

if (subcountyId) {
    whereConditions.push('EXISTS (SELECT 1 FROM kemri_project_subcounties psc WHERE psc.projectId = p.id AND psc.subcountyId = ? AND psc.voided = 0)');
}
```

### 5. Updated Validation
- Removed `departmentId` requirement from budget item creation
- Validation now checks that project exists (if `projectId` is provided)

## Migration Steps

1. **Run the migration:**
   ```bash
   docker compose exec mysql_db mysql -u impesUser -pAdmin2010impes imbesdb < api/migrations/remove_redundant_columns_from_budget_items.sql
   ```

2. **Verify columns are removed:**
   ```bash
   docker compose exec mysql_db mysql -u impesUser -pAdmin2010impes imbesdb -e "DESCRIBE kemri_budget_items;" | grep -E "departmentId|wardId|subcountyId"
   ```
   Should return nothing (columns removed)

## Benefits

1. **Eliminates Redundancy**: No duplicate department/location data
2. **Simpler Queries**: Fewer joins needed (get from project)
3. **Data Consistency**: Single source of truth
4. **Better Performance**: Fewer columns to index and query

## Notes

- All budget items must have `projectId` (already enforced by import logic)
- Department and location data is now obtained from the linked project
- Junction tables (`kemri_project_wards`, `kemri_project_subcounties`) are used for location data
- `projectName` is kept in `kemri_budget_items` as a denormalized field for performance
