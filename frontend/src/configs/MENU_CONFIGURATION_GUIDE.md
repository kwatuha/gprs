# Menu Configuration Guide

This guide explains how to modify the top menu ribbon using the JSON configuration file.

## Files Created

1. **`menuConfig.json`** - Main configuration file containing menu structure
2. **`menuConfigUtils.js`** - Utility functions for processing the configuration
3. **`RibbonMenu.jsx`** - Updated component to use JSON configuration

## Configuration Structure

The `menuConfig.json` file contains an array of menu categories, each with:

```json
{
  "id": "unique-identifier",
  "label": "Display Name",
  "icon": "IconName",
  "adminOnly": false,
  "submenus": [
    {
      "title": "Submenu Title",
      "icon": "IconName",
      "route": "ROUTE_CONSTANT",
      "permission": "optional.permission",
      "roles": ["admin", "user"]
    }
  ]
}
```

## How to Modify the Menu

### Adding a New Category

1. Open `menuConfig.json`
2. Add a new object to the `menuCategories` array:

```json
{
  "id": "new-category",
  "label": "New Category",
  "icon": "NewIcon",
  "submenus": [
    {
      "title": "New Submenu",
      "icon": "NewIcon",
      "route": "NEW_ROUTE"
    }
  ]
}
```

### Adding a New Submenu

1. Find the category you want to modify
2. Add a new submenu object to the `submenus` array:

```json
{
  "title": "New Submenu",
  "icon": "IconName",
  "route": "ROUTE_CONSTANT"
}
```

### Modifying Existing Items

1. Find the item in `menuConfig.json`
2. Update the properties as needed:
   - `title` - Display name
   - `icon` - Icon name (must match ICON_MAP in RibbonMenu.jsx)
   - `route` - Route constant from appConfig.js

### Permission-Based Visibility

You can control visibility based on user permissions and roles:

```json
{
  "title": "Admin Only Item",
  "icon": "AdminIcon",
  "route": "ADMIN_ROUTE",
  "permission": "admin.access",
  "roles": ["admin"]
}
```

## Available Icons

The following icons are available in the ICON_MAP:

- DashboardIcon
- AssessmentIcon
- SettingsIcon
- GroupIcon
- CloudUploadIcon
- MapIcon
- PaidIcon
- AdminPanelSettingsIcon
- PeopleIcon
- AccountTreeIcon
- ApprovalIcon
- FeedbackIcon
- StorageIcon
- BusinessIcon

## Route Constants

Routes are defined in `appConfig.js` under the `ROUTES` object. Use the constant names (e.g., `DASHBOARD`, `REPORTS`) rather than the actual paths.

## Admin-Only Categories

Set `"adminOnly": true` to make an entire category visible only to admin users.

## Benefits

- **Easy Modification**: No need to edit React components
- **Version Control**: Changes are tracked in JSON files
- **Permission Control**: Built-in support for role and permission-based visibility
- **Maintainability**: Centralized configuration makes updates simple
- **Consistency**: Ensures all menu items follow the same structure

## Example: Adding a New "Analytics" Category

```json
{
  "id": "analytics",
  "label": "Analytics",
  "icon": "AssessmentIcon",
  "submenus": [
    {
      "title": "Data Analytics",
      "icon": "AssessmentIcon",
      "route": "ANALYTICS_DASHBOARD"
    },
    {
      "title": "Reports Analytics",
      "icon": "AssessmentIcon",
      "route": "ANALYTICS_REPORTS",
      "permission": "analytics.view"
    }
  ]
}
```

After adding this to `menuConfig.json`, you would also need to:

1. Add the route constants to `appConfig.js`:
```javascript
ANALYTICS_DASHBOARD: '/analytics-dashboard',
ANALYTICS_REPORTS: '/analytics-reports',
```

2. Create the corresponding page components and routes in your application.

## Troubleshooting

- **Icon not showing**: Ensure the icon name matches exactly with the ICON_MAP
- **Route not working**: Verify the route constant exists in `appConfig.js`
- **Permission not working**: Check that the permission string matches your backend permissions
- **Menu not updating**: Clear browser cache and restart the development server

