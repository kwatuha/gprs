import menuConfig from './menuConfig.json';

// Icon mapping for Material-UI icons
export const ICON_MAP = {
  DashboardIcon: () => import('@mui/icons-material/Dashboard').then(m => m.default),
  AssessmentIcon: () => import('@mui/icons-material/Assessment').then(m => m.default),
  SettingsIcon: () => import('@mui/icons-material/Settings').then(m => m.default),
  GroupIcon: () => import('@mui/icons-material/Group').then(m => m.default),
  CloudUploadIcon: () => import('@mui/icons-material/CloudUpload').then(m => m.default),
  MapIcon: () => import('@mui/icons-material/Map').then(m => m.default),
  PaidIcon: () => import('@mui/icons-material/Paid').then(m => m.default),
  AdminPanelSettingsIcon: () => import('@mui/icons-material/AdminPanelSettings').then(m => m.default),
  PeopleIcon: () => import('@mui/icons-material/People').then(m => m.default),
  AccountTreeIcon: () => import('@mui/icons-material/AccountTree').then(m => m.default),
  ApprovalIcon: () => import('@mui/icons-material/Approval').then(m => m.default),
  FeedbackIcon: () => import('@mui/icons-material/Feedback').then(m => m.default),
  StorageIcon: () => import('@mui/icons-material/Storage').then(m => m.default),
  BusinessIcon: () => import('@mui/icons-material/Business').then(m => m.default),
  AssignmentIcon: () => import('@mui/icons-material/Assignment').then(m => m.default),
  AnnouncementIcon: () => import('@mui/icons-material/Announcement').then(m => m.default),
  PublicIcon: () => import('@mui/icons-material/Public').then(m => m.default),
  AnalyticsIcon: () => import('@mui/icons-material/Analytics').then(m => m.default),
  AttachMoneyIcon: () => import('@mui/icons-material/AttachMoney').then(m => m.default),
};

// Get icon component by name
export const getIconComponent = (iconName) => {
  const IconComponent = ICON_MAP[iconName];
  if (!IconComponent) {
    console.warn(`Icon ${iconName} not found in icon map`);
    return ICON_MAP.DashboardIcon; // fallback icon
  }
  return IconComponent;
};

// Filter menu categories based on user permissions and admin status
export const getFilteredMenuCategories = (isAdmin = false, hasPrivilege = null, user = null) => {
  return menuConfig.menuCategories.filter(category => {
    // Filter out admin-only categories if user is not admin
    if (category.adminOnly && !isAdmin) {
      return false;
    }
    return true;
  }).map(category => ({
    ...category,
    submenus: category.submenus.filter(submenu => {
      // Check if item is hidden
      if (submenu.hidden === true) {
        return false;
      }
      
      // If both permission and roles are specified, user needs EITHER permission OR role (OR logic)
      if (submenu.permission && submenu.roles) {
        const hasPermission = hasPrivilege && hasPrivilege(submenu.permission);
        const hasRole = user && submenu.roles.includes(user.roleName);
        // Show if user has permission OR role
        return hasPermission || hasRole;
      }
      
      // Check permission-based visibility (if only permission is specified)
      if (submenu.permission && hasPrivilege && !hasPrivilege(submenu.permission)) {
        return false;
      }
      
      // Check role-based visibility (if only roles are specified)
      if (submenu.roles && user && !submenu.roles.includes(user.roleName)) {
        return false;
      }
      
      return true;
    })
  }));
};

// Get menu configuration
export const getMenuConfig = () => menuConfig;

export default menuConfig;

