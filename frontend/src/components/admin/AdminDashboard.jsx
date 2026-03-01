import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Tabs,
  Tab,
  useTheme
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { tokens } from '../../pages/dashboard/theme';
import UserAccessControlManager from './UserAccessControlManager';
import DashboardConfigManager from '../DashboardConfigManager';

const AdminDashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [activeTab, setActiveTab] = useState(0);

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box>{children}</Box>}
    </div>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Admin Dashboard
      </Typography>

      <Card>
        <CardContent>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
          >
            <Tab 
              label="Dashboard Configuration" 
              icon={<DashboardIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="User Access Control" 
              icon={<SecurityIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="System Settings" 
              icon={<SettingsIcon />} 
              iconPosition="start"
            />
          </Tabs>

          {/* Dashboard Configuration Tab */}
          <TabPanel value={activeTab} index={0}>
            <DashboardConfigManager />
          </TabPanel>

          {/* User Access Control Tab */}
          <TabPanel value={activeTab} index={1}>
            <UserAccessControlManager />
          </TabPanel>

          {/* System Settings Tab */}
          <TabPanel value={activeTab} index={2}>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <SettingsIcon sx={{ fontSize: 64, color: colors.grey[500], mb: 2 }} />
              <Typography variant="h6" color="textSecondary">
                System Settings
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Additional system configuration options will be available here.
              </Typography>
            </Box>
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminDashboard;
