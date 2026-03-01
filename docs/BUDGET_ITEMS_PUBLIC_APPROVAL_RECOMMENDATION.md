# Budget Items Public Approval - Recommendation

## Question
Should we add a `public_approved` column to the `kemri_budget_items` table to control whether budget items appear on the public dashboard?

## Recommendation: **NO**

### Reasoning

1. **Existing Relationship Structure**
   - Budget items (`kemri_budget_items`) are already linked to projects (`kemri_projects`) via `projectId`
   - Projects already have `approved_for_public` column that controls public visibility
   - The relationship is: **Budget Item → Project → Public Approval**

2. **Data Consistency**
   - Adding a separate `public_approved` column on budget items would create potential data inconsistency
   - If a project is approved for public display, all its budget items should inherit that status
   - If a project is not approved, its budget items shouldn't appear publicly regardless of a separate flag

3. **Registry of Projects Logic**
   - The Registry of Projects should show **projects**, not budget items directly
   - Budget items are components of projects
   - If a budget item is linked to a project (`projectId IS NOT NULL`), it should inherit the project's public approval status
   - If a budget item is NOT linked to a project (`projectId IS NULL`), it shouldn't appear in the Registry anyway

4. **Simpler Query Logic**
   - Without a separate column, queries are simpler:
     ```sql
     WHERE p.approved_for_public = 1 AND p.status = 'Under Procurement'
     ```
   - With a separate column, you'd need to check both:
     ```sql
     WHERE (bi.public_approved = 1 OR p.approved_for_public = 1) AND ...
     ```
   - This creates ambiguity: which takes precedence?

## Recommended Approach

### For Registry of Projects Display

**Use the existing `approved_for_public` column on projects:**

```sql
-- Get budget items linked to projects under procurement that are approved for public
SELECT 
    bi.*,
    p.*,
    p.approved_for_public
FROM kemri_budget_items bi
INNER JOIN kemri_projects p ON bi.projectId = p.id
WHERE p.voided = 0
  AND bi.voided = 0
  AND p.approved_for_public = 1
  AND LOWER(p.status) = 'under procurement'
```

### For Public Portal

The public portal should:
1. Show projects (not budget items directly)
2. Filter by `approved_for_public = 1`
3. Optionally filter by status (e.g., 'Under Procurement')
4. Budget items are shown as part of project details, inheriting the project's approval status

## Implementation

Two new endpoints have been created:

### 1. `/api/budgets/items/under-procurement`
- Gets budget items linked to projects with status 'Under Procurement'
- Can filter by public approval status
- Useful for internal tracking

### 2. `/api/budgets/items/registry`
- Gets budget items that should appear in the Registry of Projects
- Filters by `approved_for_public = 1` by default
- Can filter by project status (e.g., 'Under Procurement')
- Supports pagination

## Usage Examples

### Get all budget items under procurement (approved for public)
```javascript
GET /api/budgets/items/under-procurement?approvedForPublic=1
```

### Get budget items under procurement for a specific budget
```javascript
GET /api/budgets/items/under-procurement?budgetId=123&approvedForPublic=1
```

### Get budget items for Registry (all approved projects)
```javascript
GET /api/budgets/items/registry?approvedForPublic=1
```

### Get budget items for Registry (only under procurement)
```javascript
GET /api/budgets/items/registry?status=under procurement&approvedForPublic=1
```

## Conclusion

**Do NOT add a `public_approved` column to `kemri_budget_items`.**

Instead:
- Use the existing `approved_for_public` column on `kemri_projects`
- Budget items inherit their public visibility from their linked project
- This maintains data consistency and simplifies the logic
- The new endpoints provide the functionality needed to join budget items with the Registry of Projects
