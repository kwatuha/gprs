# Budget Management System Upgrade

## Overview
This document describes the upgrade from a single-item budget system to a container-based budget system with approval workflow and change tracking.

## New Structure

### 1. Budget Containers (`kemri_budgets`)
- A budget container represents a budget period (e.g., "2024-2025 Approved budget")
- Can contain multiple budget items
- Has status: Draft, Pending Approval, Approved, Rejected, Frozen
- Can be frozen to prevent changes without approval

### 2. Budget Items (`kemri_budget_items`)
- Individual projects/line items within a budget container
- Each item has its own amount, project link, department, etc.
- Can be added, modified, or removed
- Tracks if added after approval

### 3. Budget Changes (`kemri_budget_changes`)
- Audit trail for all changes made after budget approval
- Requires reason for each change
- Can require approval before changes take effect

## Key Features

### Approval Workflow
1. **Draft**: Budget can be freely edited
2. **Pending Approval**: Submitted for review
3. **Approved**: Budget is approved and frozen (or requires approval for changes)
4. **Frozen**: No changes allowed without approval process

### Change Management
- When a budget is approved and `requiresApprovalForChanges = true`:
  - Adding items requires a change request with reason
  - Modifying items requires a change request with reason
  - Removing items requires a change request with reason
- All changes are tracked in `kemri_budget_changes` table
- Changes can be approved or rejected by authorized users

## API Endpoints

### Budget Containers
- `GET /api/budgets/containers` - List all budget containers
- `GET /api/budgets/containers/:id` - Get budget container details
- `POST /api/budgets/containers` - Create new budget container
- `PUT /api/budgets/containers/:id` - Update budget container
- `DELETE /api/budgets/containers/:id` - Delete budget container
- `POST /api/budgets/containers/:id/approve` - Approve budget
- `POST /api/budgets/containers/:id/reject` - Reject budget
- `POST /api/budgets/containers/:id/freeze` - Freeze budget
- `POST /api/budgets/containers/:id/unfreeze` - Unfreeze budget

### Budget Items
- `GET /api/budgets/containers/:id/items` - Get all items in a budget
- `GET /api/budgets/items/:id` - Get single budget item
- `POST /api/budgets/containers/:id/items` - Add item to budget
- `PUT /api/budgets/items/:id` - Update budget item
- `DELETE /api/budgets/items/:id` - Remove budget item

### Change Requests
- `GET /api/budgets/containers/:id/changes` - Get change history
- `POST /api/budgets/changes` - Create change request
- `PUT /api/budgets/changes/:id/approve` - Approve change request
- `PUT /api/budgets/changes/:id/reject` - Reject change request

## Migration Path

1. Run migration: `api/migrations/create_budget_containers_system.sql`
2. Optionally migrate existing data (see migration file comments)
3. Update frontend to use new API endpoints
4. Deprecate old budget endpoints (keep for backward compatibility if needed)

## Frontend Changes

### Budget Management Page
- Show list of budget containers instead of individual items
- Click on container to view/manage items
- Add approval workflow UI
- Show change history/audit trail

### Budget Detail View
- List all items in the budget
- Add/edit/remove items (with approval if needed)
- Show total amount
- Show approval status
- Show pending change requests





