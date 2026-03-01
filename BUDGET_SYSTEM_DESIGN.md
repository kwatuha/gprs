# Budget Management System Design

## Current Implementation

There are **TWO** budget systems in the codebase:

### 1. Simple Budget System (`budgetRoutes.js`)
- **Table**: `kemri_approved_budgets`
- **Structure**: Each budget entry is a standalone record
- **Current UI**: Uses this system
- **Workflow**: Direct create/update/delete of individual budget entries

### 2. Container-Based Budget System (`budgetContainerRoutes.js`) ⭐ **RECOMMENDED**
- **Tables**: 
  - `kemri_budgets` (containers)
  - `kemri_budget_items` (items within containers)
  - `kemri_budget_changes` (change requests)
- **Structure**: Budget containers that hold multiple items (projects)
- **Workflow**: Matches your requirements exactly

## Recommended Workflow (Container-Based System)

### Step 1: Create Budget Container
- Create a budget entity (e.g., "2025/2026 Budget")
- Set financial year, department, description
- Status starts as "Draft"

### Step 2: Add Items to Container
- Add projects/items to the budget container
- Each item has: project, amount, department, location, etc.
- Items can be added/removed freely while status is "Draft" or "Pending"

### Step 3: Submit for Approval
- Change status to "Pending" or submit for approval
- Budget can still be modified

### Step 4: Approval Process
- Approver reviews and approves/rejects
- On approval:
  - Status changes to "Approved"
  - `isFrozen` flag is set to `1`
  - Budget is locked

### Step 5: Post-Approval Changes (Locked State)
- When `status = 'Approved'` AND `isFrozen = 1`:
  - **Direct additions/modifications are BLOCKED**
  - Changes must go through **Change Request** process
  - User must provide `changeReason`
  - Change requests are created in `kemri_budget_changes` table
  - Status: "Pending Approval"
  - Requires approver to approve/reject the change request

### Step 6: Change Request Workflow
- User requests change (add/modify/remove item)
- Change request created with reason
- Approver reviews and approves/rejects
- If approved, change is applied to the budget

## API Endpoints

### Budget Containers
- `GET /api/budgets/containers` - List all containers
- `GET /api/budgets/containers/:budgetId` - Get container with items
- `POST /api/budgets/containers` - Create container
- `PUT /api/budgets/containers/:budgetId` - Update container
- `POST /api/budgets/containers/:budgetId/approve` - Approve container
- `POST /api/budgets/containers/:budgetId/reject` - Reject container

### Budget Items
- `GET /api/budgets/containers/:budgetId/items` - Get items
- `POST /api/budgets/containers/:budgetId/items` - Add item
- `PUT /api/budgets/items/:itemId` - Update item
- `DELETE /api/budgets/items/:itemId` - Remove item

### Change Requests
- `GET /api/budgets/containers/:budgetId/changes` - Get change history
- `PUT /api/budgets/changes/:changeId/approve` - Approve change
- `PUT /api/budgets/changes/:changeId/reject` - Reject change

## Key Features

✅ **Budget Containers**: Create budget entities for financial years
✅ **Item Management**: Add/remove projects from budgets
✅ **Approval Workflow**: Draft → Pending → Approved/Rejected
✅ **Locking Mechanism**: Approved budgets are frozen
✅ **Change Requests**: Post-approval changes require approval
✅ **Audit Trail**: All changes tracked in `kemri_budget_changes`

## Database Schema

### kemri_budgets (Containers)
- `budgetId` (PK)
- `budgetName` (e.g., "2025/2026 Budget")
- `budgetType`
- `finYearId`
- `departmentId`
- `description`
- `totalAmount` (calculated from items)
- `status` (Draft, Pending, Approved, Rejected)
- `isFrozen` (0/1)
- `requiresApprovalForChanges` (0/1)
- `approvedBy`, `approvedAt`
- `rejectedBy`, `rejectedAt`, `rejectionReason`

### kemri_budget_items (Items)
- `itemId` (PK)
- `budgetId` (FK)
- `projectId` (optional FK to projects)
- `projectName`
- `departmentId`
- `subcountyId`, `wardId`
- `amount`
- `remarks`
- `addedAfterApproval` (0/1)
- `changeRequestId` (FK to changes if added via change request)

### kemri_budget_changes (Change Requests)
- `changeId` (PK)
- `budgetId` (FK)
- `itemId` (FK, if modifying item)
- `changeType` (Item Added, Item Modified, Item Removed, Budget Approved)
- `changeReason`
- `status` (Pending Approval, Approved, Rejected)
- `oldValue` (JSON)
- `newValue` (JSON)
- `requestedBy`, `requestedAt`
- `reviewedBy`, `reviewedAt`, `reviewNotes`




