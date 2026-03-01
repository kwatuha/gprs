# Role-Based Landing Pages

This folder contains role-specific landing pages for the IMES dashboard system.

## Architecture

Instead of managing a complex database-driven dashboard, we've adopted a simpler approach with dedicated landing pages for each user role. This makes the system easier to maintain and customize.

## Current Landing Pages

### 1. AdminLandingPage.jsx
**Status:** ✅ Fully Implemented  
**Role:** Administrator  
**Features:**
- Welcome header with system status
- Reminders & Notifications with priority badges
- Database-Driven Comprehensive Dashboard with tabs:
  - Overview
  - Projects
  - Team
  - Analytics
  - Resource Utilization
- Financial Summary Card
- Invoice Summary Card
- Key Performance Metrics
- Active Users integration in chat modal

### 2. UserLandingPage.jsx
**Status:** 🚧 Placeholder (Coming Soon)  
**Role:** Regular User/Employee  
**Planned Features:**
- Personal dashboard
- Assigned tasks
- Leave management
- Personal notifications

### 3. GovernorLandingPage.jsx
**Status:** 🚧 Placeholder (Coming Soon)  
**Role:** Governor  
**Planned Features:**
- Regional overview
- Budget oversight
- Project approvals
- Regional reports

### 4. ContractorLandingPage.jsx
**Status:** 🚧 Placeholder (Coming Soon)  
**Role:** Contractor  
**Planned Features:**
- Project assignments
- Invoicing
- Payment tracking
- Work schedules

## How It Works

1. **Entry Point:** `DashboardLandingPage.jsx` acts as a router
2. **Role Detection:** Checks user's role from `useAuth()` context
3. **Page Routing:** Directs to appropriate landing page based on role
4. **Default:** Currently defaults to `AdminLandingPage` for all roles

## Adding a New Landing Page

To add a new role-specific landing page:

1. Create a new file in this folder (e.g., `ManagerLandingPage.jsx`)
2. Copy the structure from one of the placeholder pages
3. Customize the content and features for that role
4. Update `DashboardLandingPage.jsx` to route to the new page:

```jsx
// In DashboardLandingPage.jsx
import ManagerLandingPage from './landingPages/ManagerLandingPage';

// Add routing logic
if (roleName === 'manager') return <ManagerLandingPage />;
```

## Database Integration

While the landing pages themselves are file-based, the database can still control:
- **Role-to-Page Mapping:** Associate user roles with landing page file names
- **Feature Filtering:** Hide/show specific components within a landing page
- **Data Filtering:** Control what data is visible to each role

Example database schema:
```json
{
  "role": "admin",
  "landing_page": "AdminLandingPage",
  "visible_tabs": ["overview", "projects", "team", "analytics", "resource_utilization"],
  "visible_cards": ["financial_summary", "invoice_summary", "kpi_metrics"]
}
```

## Benefits of This Approach

1. **Simplicity:** Each role has its own dedicated file
2. **Maintainability:** Easy to update features for specific roles
3. **Performance:** No complex conditional rendering logic
4. **Scalability:** Add new roles by creating new files
5. **Clarity:** Clear separation of concerns

## Current Priority

**AdminLandingPage** is the current priority and contains all the features we've been developing. Other landing pages will be implemented as needed.

