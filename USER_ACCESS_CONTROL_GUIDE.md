# User Access Control System - Admin Guide

## Overview

The User Access Control System provides comprehensive data filtering and access management for the IMES dashboard. This system allows administrators to control what data users can see based on their role, department, location, project assignments, and custom filtering rules.

## Features

### 🎯 **Multi-Level Access Control**
- **Department-based filtering**: Limit users to specific departments
- **Ward/Regional filtering**: Restrict access to specific wards or subcounties
- **Project-specific access**: Assign users to specific projects only
- **Budget-based filtering**: Set budget access limits per user
- **Status-based filtering**: Filter by project progress and completion status
- **Custom filtering rules**: Create advanced filtering logic

### 🏗️ **System Architecture**

#### Database Tables
- `user_department_assignments` - Links users to departments
- `user_ward_assignments` - Links users to wards/regions
- `user_project_assignments` - Links users to specific projects
- `user_data_filters` - Custom filtering rules per user
- `component_data_access_rules` - Component-level access rules

#### API Endpoints
- `/api/data-access/user/{userId}/departments` - Manage department assignments
- `/api/data-access/user/{userId}/wards` - Manage ward assignments
- `/api/data-access/user/{userId}/projects` - Manage project assignments
- `/api/data-access/user/{userId}/filters` - Manage data filters
- `/api/data-access/user/{userId}/component/{componentKey}` - Get access config

## Using the Admin Interface

### Accessing the Admin Dashboard

1. **Navigate to Admin Dashboard**
   - Go to `/admin` in your browser
   - Or click "Admin Dashboard" in the sidebar (admin users only)

2. **Admin Interface Tabs**
   - **Dashboard Configuration**: Manage role-based dashboard layouts
   - **User Access Control**: Manage user data access permissions
   - **System Settings**: Additional system configuration

### Managing User Access Control

#### 1. **Select a User**
- Use the search box to find users by name or username
- Selected user's current assignments will be loaded automatically

#### 2. **Department Assignments**
- **Purpose**: Control which departments' data the user can see
- **How to use**:
  - Click "Manage Departments" button
  - Select multiple departments from the dropdown
  - Choose one as the primary department
  - Click "Save"

#### 3. **Ward/Region Assignments**
- **Purpose**: Limit user to specific geographical areas
- **How to use**:
  - Click "Manage Wards" button
  - Enter ward IDs (comma-separated)
  - Set access level for each ward (Read/Write/Admin)
  - Click "Save"

#### 4. **Project Assignments**
- **Purpose**: Assign users to specific projects
- **How to use**:
  - Click "Manage Projects" button
  - Select projects from the dropdown
  - Set access level for each project (View/Edit/Manage/Admin)
  - Click "Save"

#### 5. **Data Filters**
- **Purpose**: Apply advanced filtering rules
- **Available Filters**:
  - **Budget Range**: Set min/max budget limits
  - **Status Filter**: Specify allowed project statuses
  - **Project Type Filter**: Limit to specific project categories
- **How to use**:
  - Click "Manage Filters" button
  - Enable desired filters with toggle switches
  - Configure filter parameters
  - Click "Save"

## Access Levels Explained

### Department Access
- **Primary**: User's main department (used for reporting)
- **Secondary**: Additional departments user can access

### Ward Access Levels
- **Read**: View data only
- **Write**: View and edit data
- **Admin**: Full access including user management

### Project Access Levels
- **View**: Read-only access to project data
- **Edit**: Can modify project information
- **Manage**: Can manage project workflow and assignments
- **Admin**: Full project administration rights

## Use Cases and Examples

### 1. **Regional Manager**
```sql
-- Assign to specific wards
INSERT INTO user_ward_assignments (user_id, ward_id, access_level) VALUES
(123, 5, 'admin'), (123, 6, 'admin'), (123, 7, 'write');

-- Set budget limits
INSERT INTO user_data_filters (user_id, filter_type, filter_key, filter_value) VALUES
(123, 'budget_range', 'project_budget', '{"min": 0, "max": 5000000}');
```
**Result**: User only sees projects in wards 5, 6, 7 with budgets under 5M

### 2. **Department Head**
```sql
-- Assign to health department as primary
INSERT INTO user_department_assignments (user_id, department_id, is_primary) VALUES
(456, 2, 1);

-- Filter by project types
INSERT INTO user_data_filters (user_id, filter_type, filter_key, filter_value) VALUES
(456, 'project_type', 'project_category', '["health", "medical"]');
```
**Result**: User sees only health-related projects from health department

### 3. **Project Contractor**
```sql
-- Assign to specific projects only
INSERT INTO user_project_assignments (user_id, project_id, access_level) VALUES
(789, 10, 'edit'), (789, 15, 'view');

-- Limit to active projects
INSERT INTO user_data_filters (user_id, filter_type, filter_key, filter_value) VALUES
(789, 'progress_status', 'project_status', '["active", "planning"]');
```
**Result**: Contractor only sees assigned projects that are active or in planning

### 4. **Financial Auditor**
```sql
-- Access all departments but with budget focus
INSERT INTO user_department_assignments (user_id, department_id, is_primary) VALUES
(101, 1, 1), (101, 2, 0), (101, 3, 0);

-- Set high budget threshold
INSERT INTO user_data_filters (user_id, filter_type, filter_key, filter_value) VALUES
(101, 'budget_range', 'project_budget', '{"min": 1000000, "max": 100000000}');
```
**Result**: Auditor sees high-budget projects across all departments

## Component Integration

### Enhanced Dashboard Components

The system includes enhanced components that automatically apply filtering:

#### 1. **RegionalProjectsCard**
- Shows projects filtered by user's ward assignments
- Displays project status, budget, and location
- Automatically respects regional access controls

#### 2. **BudgetFilteredMetricsCard**
- Shows budget metrics filtered by user's budget limits
- Displays total, spent, remaining budgets with progress bars
- Respects user's financial access level

### Using Filtered Components

```jsx
// In your dashboard component
import RegionalProjectsCard from './dashboard/enhanced/RegionalProjectsCard';
import BudgetFilteredMetricsCard from './dashboard/enhanced/BudgetFilteredMetricsCard';

// Components automatically apply user-specific filtering
<RegionalProjectsCard user={user} />
<BudgetFilteredMetricsCard user={user} />
```

## API Usage Examples

### Get User's Access Configuration
```bash
curl http://165.22.227.234:3000/api/data-access/user/1/component/metrics
```

### Assign User to Departments
```bash
curl -X POST http://165.22.227.234:3000/api/data-access/user/1/departments \
  -H "Content-Type: application/json" \
  -d '{"departmentIds": [1, 2], "isPrimary": true}'
```

### Set User Data Filters
```bash
curl -X PUT http://165.22.227.234:3000/api/data-access/user/1/filters \
  -H "Content-Type: application/json" \
  -d '{
    "filters": [
      {
        "filter_type": "budget_range",
        "filter_key": "project_budget",
        "filter_value": {"min": 0, "max": 10000000}
      }
    ]
  }'
```

## Security Considerations

### 1. **Data Isolation**
- All filtering happens at the API level
- Frontend components cannot bypass access controls
- Database queries automatically apply user restrictions

### 2. **Role-Based Access**
- Admin users can manage all access controls
- Regular users can only view their own assignments
- Privilege checking prevents unauthorized access

### 3. **Audit Trail**
- All access control changes are logged
- User assignments include timestamps
- Filter modifications are tracked

## Troubleshooting

### Common Issues

1. **User can't see expected data**
   - Check department assignments
   - Verify ward/project assignments
   - Review active data filters

2. **Budget metrics showing zero**
   - Check budget range filters
   - Verify project budget data
   - Ensure user has project access

3. **Regional projects not displaying**
   - Confirm ward assignments exist
   - Check project-ward relationships
   - Verify component access rules

### Debug API Endpoints

```bash
# Check user's current assignments
curl http://165.22.227.234:3000/api/data-access/user/{userId}/departments
curl http://165.22.227.234:3000/api/data-access/user/{userId}/wards
curl http://165.22.227.234:3000/api/data-access/user/{userId}/projects
curl http://165.22.227.234:3000/api/data-access/user/{userId}/filters

# Test component access configuration
curl http://165.22.227.234:3000/api/data-access/user/{userId}/component/{componentKey}
```

## Best Practices

### 1. **Assignment Strategy**
- Start with department assignments for broad access
- Add ward assignments for geographical restrictions
- Use project assignments for specific contractor access
- Apply data filters for fine-grained control

### 2. **Access Level Guidelines**
- Use "Read" for most regular users
- Reserve "Write" for data entry staff
- Limit "Admin" to supervisors and managers
- "Manage" level for project coordinators

### 3. **Filter Configuration**
- Set reasonable budget ranges based on user role
- Use status filters to hide completed/cancelled projects
- Apply project type filters for specialized roles
- Combine multiple filters for complex requirements

### 4. **Performance Optimization**
- Avoid overly complex filter combinations
- Use indexed database fields for filtering
- Monitor query performance with large datasets
- Cache frequently accessed access configurations

## Future Enhancements

### Planned Features
- **Time-based access**: Temporary project assignments
- **Hierarchical permissions**: Inherit from parent roles
- **Bulk user management**: Import/export access configurations
- **Advanced reporting**: Access control analytics
- **Mobile optimization**: Touch-friendly admin interface

This comprehensive system provides the flexibility to create highly customized dashboards where users see only the data they're authorized to access!
