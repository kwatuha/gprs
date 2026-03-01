# Role-Based Dashboard Configuration Guide

## 🎯 How to Configure Your Existing Roles

Since you already have roles and privileges in your system, here's exactly where and how to configure the dashboard for each role.

## 📍 Configuration Location

**Primary File**: `/src/configs/dashboardConfig.js`

## 🔧 Step-by-Step Configuration

### Step 1: Identify Your Existing Roles

First, identify all the roles in your system. Common roles might include:
- `admin` or `administrator`
- `project_manager` or `pm`
- `field_coordinator` or `coordinator`
- `data_analyst` or `analyst`
- `contractor` or `external_user`
- `supervisor`
- `inspector`
- `budget_officer`

### Step 2: Map Your Roles to Dashboard Components

For each role, you need to configure:

#### A. **Tabs** - Which tabs the role can see
```javascript
tabs: ['overview', 'projects', 'collaboration', 'analytics']
```

#### B. **Components** - Which components within each tab
```javascript
components: {
  overview: ['metrics', 'quickStats', 'recentActivity'],
  projects: ['tasks', 'activity', 'alerts'],
  collaboration: ['teamDirectory', 'announcements', 'conversations'],
  analytics: ['charts', 'reports']
}
```

#### C. **Permissions** - What the role can do
```javascript
permissions: [
  'view_metrics',
  'view_tasks',
  'manage_tasks',
  'view_analytics',
  // ... more permissions
]
```

#### D. **Features** - High-level feature access
```javascript
features: {
  canViewAllProjects: true,
  canManageUsers: false,
  canAccessAnalytics: true,
  canGenerateReports: false
}
```

## 📋 Example Configurations

### Example 1: Administrator Role
```javascript
admin: {
  name: 'Administrator',
  description: 'Full system access',
  tabs: ['overview', 'projects', 'collaboration', 'analytics'],
  components: {
    overview: ['metrics', 'quickStats', 'recentActivity'],
    projects: ['tasks', 'activity', 'alerts'],
    collaboration: ['teamDirectory', 'announcements', 'conversations'],
    analytics: ['charts', 'reports']
  },
  permissions: [
    'view_metrics', 'view_tasks', 'manage_tasks', 'view_analytics',
    'manage_users', 'system_admin'
  ],
  features: {
    canViewAllProjects: true,
    canManageUsers: true,
    canAccessAnalytics: true
  }
}
```

### Example 2: Field Inspector Role
```javascript
field_inspector: {
  name: 'Field Inspector',
  description: 'Conducts field inspections and reports',
  tabs: ['overview', 'projects'],
  components: {
    overview: ['metrics', 'recentActivity'],
    projects: ['tasks', 'activity']
  },
  permissions: [
    'view_metrics', 'view_tasks', 'view_activity'
  ],
  features: {
    canViewAllProjects: false,
    canManageUsers: false,
    canAccessAnalytics: false
  }
}
```

### Example 3: Budget Officer Role
```javascript
budget_officer: {
  name: 'Budget Officer',
  description: 'Manages budgets and financial approvals',
  tabs: ['overview', 'projects', 'analytics'],
  components: {
    overview: ['metrics', 'quickStats'],
    projects: ['tasks', 'alerts'],
    analytics: ['charts', 'reports']
  },
  permissions: [
    'view_metrics', 'view_tasks', 'manage_tasks', 'view_analytics',
    'generate_reports', 'budget_approval'
  ],
  features: {
    canViewAllProjects: true,
    canManageUsers: false,
    canAccessAnalytics: true,
    canGenerateReports: true
  }
}
```

## 🔄 Integration with Your Existing System

### Step 3: Connect to Your User Object

Your user object should have a `role` property that matches the role keys in the configuration:

```javascript
// Example user object
const user = {
  id: 1,
  name: 'Dr. Aisha Mwangi',
  email: 'aisha.mwangi@company.com',
  role: 'project_manager', // This should match a key in dashboardConfig.roles
  department: 'Health',
  // ... other user properties
}
```

### Step 4: Update DashboardLandingPage.jsx

Replace the current TabbedDashboard with DynamicTabbedDashboard:

```javascript
// In DashboardLandingPage.jsx
import DynamicTabbedDashboard from '../components/DynamicTabbedDashboard';

// Replace this:
<TabbedDashboard user={user} dashboardData={data} />

// With this:
<DynamicTabbedDashboard user={user} dashboardData={data} />
```

## 🧪 Testing Your Configuration

### Test Different Roles

1. **Create test users with different roles:**
```javascript
const testUsers = {
  admin: { id: 1, name: 'Admin User', role: 'admin', department: 'IT' },
  inspector: { id: 2, name: 'Inspector User', role: 'field_inspector', department: 'Health' },
  budget: { id: 3, name: 'Budget User', role: 'budget_officer', department: 'Finance' }
};
```

2. **Test role switching:**
```javascript
// In your component
const [currentUser, setCurrentUser] = useState(testUsers.admin);

// Switch roles for testing
const switchRole = (roleKey) => {
  setCurrentUser(testUsers[roleKey]);
};
```

## 📊 Available Components

### Overview Tab Components:
- `metrics` - Key Performance Indicators
- `quickStats` - Quick Stats with progress bars
- `recentActivity` - Recent activity feed

### Projects Tab Components:
- `tasks` - Project Tasks Card
- `activity` - Project Activity Feed
- `alerts` - Project Alerts Card

### Collaboration Tab Components:
- `teamDirectory` - Team Directory Card
- `announcements` - Team Announcements Card
- `conversations` - Recent Conversations Card

### Analytics Tab Components:
- `charts` - Analytics Charts
- `reports` - Reports Card

## 🔧 Customization Options

### Add New Components

1. **Create the component** in `/src/components/`
2. **Add to componentMap** in `DynamicTabbedDashboard.jsx`
3. **Add to dashboardConfig.js** components section
4. **Assign to roles** in the roles configuration

### Add New Permissions

1. **Add permission** to the permissions array in role config
2. **Use in components** with `roleService.hasPermission('permission_name')`
3. **Check in code** with conditional rendering

## 🚀 Quick Start

1. **Identify your roles** from your existing system
2. **Copy the example configurations** above
3. **Replace role names** with your actual role names
4. **Adjust components** based on what each role should see
5. **Test with different users** to verify access

## 📝 Notes

- Role names in the config must match the `role` property in your user objects
- Components are rendered based on the role configuration
- Permissions are checked at the component level
- Changes to the config require a page refresh to take effect











