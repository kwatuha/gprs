# Admin Dashboard Restoration Guide

## Problem
The admin role lost access to dashboard components when the data-driven dashboard system was implemented. The admin role should have access to all dashboard components but currently shows a blank or limited dashboard.

## Root Cause
The database-driven dashboard configuration system requires explicit configuration in the following tables:
- `dashboard_tabs`
- `dashboard_components` 
- `role_dashboard_config`
- `dashboard_permissions`
- `role_dashboard_permissions`

The admin role was not properly configured in these tables when the new system was implemented.

## Solution

### Step 1: Create Dashboard Tables
Run the SQL script `/home/dev/dev/imes/api/dashboard_tables.sql` in your database to create the required tables and insert default data.

### Step 2: Restore Admin Configuration
Run the SQL script `/home/dev/dev/imes/restore_admin_dashboard.sql` to restore comprehensive dashboard access for admin users.

### Step 3: Verify Configuration
After running the scripts, admin users should have access to:

#### Overview Tab:
- Active Users Card
- KPI Metrics Card  
- User Statistics Card
- Project Metrics Card
- Budget Overview Card
- Financial Summary Card
- Contractor Metrics Card
- Quick Actions Widget

#### Projects Tab:
- Projects Table (full CRUD access)
- Project Tasks Card
- Project Activity Feed
- Project Alerts Card

#### Reports Tab:
- Analytics Dashboard (Charts)
- Reports Overview

#### Settings Tab:
- Users Table (full CRUD access)
- Team Directory Card
- Team Announcements Card
- Recent Conversations Card

## Alternative Quick Fix

If you can't run the SQL scripts immediately, you can temporarily modify the frontend to show a fallback dashboard for admin users by updating the `DatabaseDrivenTabbedDashboard` component to include a fallback configuration when the database returns no results for admin users.

## Database Access Commands

If you have database access, run these commands:

```bash
# Navigate to API directory
cd /home/dev/dev/imes/api

# Run dashboard tables creation (if not already done)
mysql -h [DB_HOST] -u [DB_USER] -p[DB_PASSWORD] [DB_NAME] < dashboard_tables.sql

# Run admin dashboard restoration
mysql -h [DB_HOST] -u [DB_USER] -p[DB_PASSWORD] [DB_NAME] < ../restore_admin_dashboard.sql
```

Replace the placeholders with your actual database credentials.

## Verification

After restoration, admin users should see a comprehensive dashboard with multiple tabs and components. You can verify by:

1. Logging in as an admin user
2. Navigating to the dashboard
3. Checking that all tabs (Overview, Projects, Reports, Settings) are visible
4. Verifying that each tab contains the expected components

## Components Restored

The following components have been restored for admin users:

### Cards:
- ActiveUsersCard
- KpiCard
- ContractorMetricsCard
- FinancialSummaryCard
- UserStatsCard
- ProjectMetricsCard
- BudgetOverviewCard

### Charts:
- ChartsDashboard (Analytics)

### Lists:
- ProjectTasksCard
- ProjectActivityFeed
- ProjectAlertsCard
- TeamDirectoryCard
- TeamAnnouncementsCard
- RecentConversationsCard

### Tables:
- UsersTable
- ProjectsTable

### Widgets:
- QuickActionsWidget

All components include appropriate permissions for admin users (view, edit, delete, create as applicable).








