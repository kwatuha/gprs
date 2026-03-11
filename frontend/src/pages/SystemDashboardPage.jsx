import React, { useMemo } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
  useTheme,
  Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Assessment as AssessmentIcon,
  Work as WorkIcon,
  LocationOn as LocationOnIcon,
  Timeline as TimelineIcon,
  AttachMoney as AttachMoneyIcon,
  Group as GroupIcon,
  AccountTree as AccountTreeIcon,
  CalendarToday as CalendarIcon,
  Business as BusinessIcon,
  TrendingUp as TrendingUpIcon,
  Public as PublicIcon,
} from '@mui/icons-material';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts';
import { tokens } from './dashboard/theme';

/**
 * SystemDashboardPage
 *
 * High-level, system-wide dashboard that surfaces critical signals
 * from across the platform: projects, jobs created, and project sites.
 *
 * This implementation uses curated sample data that mirrors the
 * structure of the projects import template and the Jobs/Sites features,
 * so it remains informative even before real analytics APIs are wired in.
 */

// Sample project-level data (aligned with projects_import_template.xlsx headers)
// Enhanced with all template fields: directorate, sub-county, budgetSource, percentageComplete, etc.
const SAMPLE_PROJECTS = [
  {
    projectName: 'Level 4 Hospital Upgrade',
    Status: 'In Progress',
    budget: 120_000_000,
    Disbursed: 72_000_000,
    financialYear: '2024/2025',
    department: 'Health',
    directorate: 'Medical Services',
    County: 'Kitui',
    'sub-county': 'Kitui Central',
    Constituency: 'Kitui Central',
    ward: 'Miambani',
    Contracted: 'Yes',
    StartDate: '2024-01-15',
    EndDate: '2025-06-30',
    sector: 'Health',
    agency: 'County Government',
    budgetSource: 'County Revenue',
    percentageComplete: 60,
  },
  {
    projectName: 'Market Sheds Construction',
    Status: 'Not Started',
    budget: 30_000_000,
    Disbursed: 0,
    financialYear: '2024/2025',
    department: 'Trade',
    directorate: 'Trade & Commerce',
    County: 'Kitui',
    'sub-county': 'Kitui West',
    Constituency: 'Kitui West',
    ward: 'Kwa Mutonga',
    Contracted: 'No',
    StartDate: '2025-02-01',
    EndDate: '2025-12-31',
    sector: 'Trade',
    agency: 'County Government',
    budgetSource: 'CDF',
    percentageComplete: 0,
  },
  {
    projectName: 'Rural Water Pan Program',
    Status: 'Ongoing',
    budget: 55_000_000,
    Disbursed: 40_000_000,
    financialYear: '2023/2024',
    department: 'Water',
    directorate: 'Water & Sanitation',
    County: 'Kitui',
    'sub-county': 'Kitui Rural',
    Constituency: 'Kitui Rural',
    ward: 'Kanyangi',
    Contracted: 'Yes',
    StartDate: '2023-09-01',
    EndDate: '2024-09-30',
    sector: 'Water',
    agency: 'National CDF',
    budgetSource: 'National Government',
    percentageComplete: 73,
  },
  {
    projectName: 'ECDE Classrooms',
    Status: 'Completed',
    budget: 18_000_000,
    Disbursed: 18_000_000,
    financialYear: '2022/2023',
    department: 'Education',
    directorate: 'Early Childhood Development',
    County: 'Kitui',
    'sub-county': 'Kitui East',
    Constituency: 'Kitui East',
    ward: 'Zombe/Mwitika',
    Contracted: 'Yes',
    StartDate: '2022-01-10',
    EndDate: '2023-03-30',
    sector: 'Education',
    agency: 'County Government',
    budgetSource: 'County Revenue',
    percentageComplete: 100,
  },
  {
    projectName: 'Road Tarmacking - Kitui Town',
    Status: 'In Progress',
    budget: 85_000_000,
    Disbursed: 45_000_000,
    financialYear: '2024/2025',
    department: 'Infrastructure',
    directorate: 'Roads & Infrastructure',
    County: 'Kitui',
    'sub-county': 'Kitui Central',
    Constituency: 'Kitui Central',
    ward: 'Kitui Town',
    Contracted: 'Yes',
    StartDate: '2024-03-01',
    EndDate: '2025-08-31',
    sector: 'Infrastructure',
    agency: 'KeNHA',
    budgetSource: 'National Government',
    percentageComplete: 53,
  },
  {
    projectName: 'Agricultural Extension Services',
    Status: 'Ongoing',
    budget: 25_000_000,
    Disbursed: 15_000_000,
    financialYear: '2024/2025',
    department: 'Agriculture',
    directorate: 'Crop Development',
    County: 'Kitui',
    'sub-county': 'Kitui South',
    Constituency: 'Kitui South',
    ward: 'Kisasi',
    Contracted: 'Yes',
    StartDate: '2024-06-01',
    EndDate: '2025-05-31',
    sector: 'Agriculture',
    agency: 'County Government',
    budgetSource: 'County Revenue',
    percentageComplete: 60,
  },
];

// Sample jobs summary aligned with ProjectJobsModal structure (Direct/Indirect instead of Youth)
const SAMPLE_JOBS_SUMMARY = {
  totalJobs: 186,
  totalMale: 104,
  totalFemale: 56,
  totalDirectJobs: 142,
  totalIndirectJobs: 44,
};

const SAMPLE_JOBS_BY_CATEGORY = [
  { category_name: 'Skilled Labour', jobs_count: 72 },
  { category_name: 'Unskilled Labour', jobs_count: 86 },
  { category_name: 'Supervisory / Technical', jobs_count: 28 },
];

// Sample sites information aligned with ProjectSitesSection fields
const SAMPLE_SITES = [
  {
    site_name: 'Hospital Main Block',
    county: 'Kitui',
    ward: 'Miambani',
    status_norm: 'In Progress',
  },
  {
    site_name: 'Hospital Staff Quarters',
    county: 'Kitui',
    ward: 'Miambani',
    status_norm: 'Not Started',
  },
  {
    site_name: 'Kwa Mutonga Market',
    county: 'Kitui',
    ward: 'Kwa Mutonga',
    status_norm: 'In Progress',
  },
  {
    site_name: 'Rural Water Pan – Kanyangi',
    county: 'Kitui',
    ward: 'Kanyangi',
    status_norm: 'Completed',
  },
];

const STATUS_COLORS = {
  'Completed': '#16a34a',
  'In Progress': '#2563eb',
  'Ongoing': '#2563eb',
  'Not Started': '#9ca3af',
  'Delayed': '#f97316',
  'Stalled': '#dc2626',
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0);

const SystemDashboardPage = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const {
    kpis,
    statusChartData,
    absorptionByDepartment,
    jobsByCategoryChartData,
    sitesByStatusChartData,
    projectsByFinancialYear,
    projectsByConstituency,
    projectsBySubcounty,
    projectsByDirectorate,
    projectsByBudgetSource,
    overallProgress,
    projectsByTimeline,
  } = useMemo(() => {
    const totalProjects = SAMPLE_PROJECTS.length;
    const totalBudget = SAMPLE_PROJECTS.reduce((sum, p) => sum + (p.budget || 0), 0);
    const totalDisbursed = SAMPLE_PROJECTS.reduce((sum, p) => sum + (p.Disbursed || 0), 0);
    const absorptionRate = totalBudget > 0 ? Math.round((totalDisbursed / totalBudget) * 100) : 0;

    const distinctDepartments = new Set(SAMPLE_PROJECTS.map((p) => p.department));
    const distinctWards = new Set(SAMPLE_PROJECTS.map((p) => p.ward));

    const kpiValues = {
      totalProjects,
      totalBudget,
      totalDisbursed,
      absorptionRate,
      departments: distinctDepartments.size,
      wards: distinctWards.size,
      jobs: SAMPLE_JOBS_SUMMARY.totalJobs,
      sites: SAMPLE_SITES.length,
    };

    // Projects by status
    const statusMap = new Map();
    SAMPLE_PROJECTS.forEach((p) => {
      const key = (p.Status || '').trim() || 'Unknown';
      statusMap.set(key, (statusMap.get(key) || 0) + 1);
    });
    const statusChart = Array.from(statusMap.entries()).map(([name, value]) => ({
      name,
      value,
      color: STATUS_COLORS[name] || '#64748b',
    }));

    // Absorption by department
    const deptMap = new Map();
    SAMPLE_PROJECTS.forEach((p) => {
      if (!p.department) return;
      const current = deptMap.get(p.department) || { department: p.department, budget: 0, disbursed: 0 };
      current.budget += p.budget || 0;
      current.disbursed += p.Disbursed || 0;
      deptMap.set(p.department, current);
    });
    const deptChart = Array.from(deptMap.values()).map((row) => ({
      name: row.department,
      contracted: row.budget,
      paid: row.disbursed,
    }));

    // Jobs by category
    const jobsChart = SAMPLE_JOBS_BY_CATEGORY.map((j, index) => ({
      name: j.category_name,
      value: j.jobs_count,
      color: ['#3b82f6', '#22c55e', '#f97316'][index % 3],
    }));

    // Sites by normalized status
    const siteStatusMap = new Map();
    SAMPLE_SITES.forEach((s) => {
      const key = (s.status_norm || 'Unknown').trim();
      siteStatusMap.set(key, (siteStatusMap.get(key) || 0) + 1);
    });
    const sitesChart = Array.from(siteStatusMap.entries()).map(([name, value]) => ({
      name,
      value,
      color: STATUS_COLORS[name] || '#0ea5e9',
    }));

    // Projects by Financial Year
    const fyMap = new Map();
    SAMPLE_PROJECTS.forEach((p) => {
      const key = p.financialYear || 'Unknown';
      fyMap.set(key, (fyMap.get(key) || 0) + 1);
    });
    const fyChart = Array.from(fyMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, value]) => ({ name, value }));

    // Projects by Constituency
    const constituencyMap = new Map();
    SAMPLE_PROJECTS.forEach((p) => {
      const key = p.Constituency || 'Unknown';
      constituencyMap.set(key, (constituencyMap.get(key) || 0) + 1);
    });
    const constituencyChart = Array.from(constituencyMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }));

    // Projects by Sub-county
    const subcountyMap = new Map();
    SAMPLE_PROJECTS.forEach((p) => {
      const key = p['sub-county'] || 'Unknown';
      subcountyMap.set(key, (subcountyMap.get(key) || 0) + 1);
    });
    const subcountyChart = Array.from(subcountyMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }));

    // Projects by Directorate
    const directorateMap = new Map();
    SAMPLE_PROJECTS.forEach((p) => {
      const key = p.directorate || 'Unknown';
      directorateMap.set(key, (directorateMap.get(key) || 0) + 1);
    });
    const directorateChart = Array.from(directorateMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }));

    // Projects by Budget Source
    const budgetSourceMap = new Map();
    SAMPLE_PROJECTS.forEach((p) => {
      const key = p.budgetSource || 'Unknown';
      budgetSourceMap.set(key, (budgetSourceMap.get(key) || 0) + 1);
    });
    const budgetSourceChart = Array.from(budgetSourceMap.entries()).map(([name, value]) => ({
      name,
      value,
      color: name === 'County Revenue' ? '#3b82f6' : name === 'National Government' ? '#22c55e' : '#f97316',
    }));

    // Overall Progress (average percentage complete)
    const totalProgress = SAMPLE_PROJECTS.reduce((sum, p) => sum + (p.percentageComplete || 0), 0);
    const avgProgress = SAMPLE_PROJECTS.length > 0 ? Math.round(totalProgress / SAMPLE_PROJECTS.length) : 0;

    // Projects by Timeline (grouped by start year)
    const timelineMap = new Map();
    SAMPLE_PROJECTS.forEach((p) => {
      if (p.StartDate) {
        const year = p.StartDate.split('-')[0];
        timelineMap.set(year, (timelineMap.get(year) || 0) + 1);
      }
    });
    const timelineChart = Array.from(timelineMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, value]) => ({ name, value }));

    return {
      kpis: { ...kpiValues, overallProgress: avgProgress },
      statusChartData: statusChart,
      absorptionByDepartment: deptChart,
      jobsByCategoryChartData: jobsChart,
      sitesByStatusChartData: sitesChart,
      projectsByFinancialYear: fyChart,
      projectsByConstituency: constituencyChart,
      projectsBySubcounty: subcountyChart,
      projectsByDirectorate: directorateChart,
      projectsByBudgetSource: budgetSourceChart,
      overallProgress: avgProgress,
      projectsByTimeline: timelineChart,
    };
  }, []);

  return (
    <Box
      sx={{
        p: { xs: 1.5, md: 3 },
        background: theme.palette.mode === 'dark'
          ? `linear-gradient(135deg, ${colors.primary[900]} 0%, ${colors.primary[800]} 50%, ${colors.primary[900]} 100%)`
          : 'linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)',
        minHeight: '100vh',
      }}
    >
      <Box mb={4}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 1,
          }}
        >
          <Box
            sx={{
              width: 4,
              height: 40,
              background: `linear-gradient(180deg, ${colors.blueAccent[500]}, ${colors.greenAccent[500]})`,
              borderRadius: 2,
            }}
          />
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                background: `linear-gradient(135deg, ${colors.blueAccent[500]}, ${colors.greenAccent[500]})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em',
                fontSize: { xs: '1.75rem', md: '2.25rem' },
              }}
            >
              System Dashboard
            </Typography>
            <Typography
              variant="body2"
              sx={{
                mt: 0.5,
                color: colors.grey[300],
                maxWidth: 720,
                fontSize: '0.95rem',
                lineHeight: 1.6,
              }}
            >
              Executive overview: Track how projects, budgets, jobs, and geographic coverage are performing across the county in real-time.
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label="Operations Dashboard"
                size="small"
                sx={{
                  bgcolor: colors.blueAccent[600],
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 600,
                  '&:hover': { bgcolor: colors.blueAccent[700], transform: 'scale(1.05)' },
                  transition: 'all 0.2s ease',
                }}
                onClick={() => navigate('/operations-dashboard')}
              />
              <Chip
                label="Jobs & Impact"
                size="small"
                sx={{
                  bgcolor: colors.greenAccent[600],
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 600,
                  '&:hover': { bgcolor: colors.greenAccent[700], transform: 'scale(1.05)' },
                  transition: 'all 0.2s ease',
                }}
                onClick={() => navigate('/jobs-dashboard')}
              />
              <Chip
                label="Finance Dashboard"
                size="small"
                sx={{
                  bgcolor: colors.yellowAccent[600],
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 600,
                  '&:hover': { bgcolor: colors.yellowAccent[700], transform: 'scale(1.05)' },
                  transition: 'all 0.2s ease',
                }}
                onClick={() => navigate('/finance-dashboard')}
              />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* KPI strip */}
      <Grid container spacing={2.5} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 4,
              background: theme.palette.mode === 'dark'
                ? `linear-gradient(135deg, ${colors.primary[400]} 0%, ${colors.primary[500]} 100%)`
                : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              border: `1px solid ${theme.palette.mode === 'dark' ? colors.blueAccent[700] : 'rgba(0,0,0,0.08)'}`,
              boxShadow: theme.palette.mode === 'dark'
                ? '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(104, 112, 250, 0.1)'
                : '0 4px 20px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.05)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 12px 40px rgba(104, 112, 250, 0.3), 0 0 0 1px rgba(104, 112, 250, 0.2)'
                  : '0 8px 30px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.08)',
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(90deg, ${colors.blueAccent[500]}, ${colors.blueAccent[300]})`,
              },
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: colors.grey[300],
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    fontSize: '0.7rem',
                    letterSpacing: '0.5px',
                  }}
                >
                  Total Projects
                </Typography>
                <Box
                  sx={{
                    p: 1.2,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${colors.blueAccent[600]}, ${colors.blueAccent[400]})`,
                    boxShadow: `0 4px 12px ${colors.blueAccent[700]}40`,
                  }}
                >
                  <AssessmentIcon sx={{ color: 'white', fontSize: 22 }} />
                </Box>
              </Box>
              <Typography
                variant="h4"
                sx={{
                  color: colors.grey[100],
                  fontWeight: 800,
                  mb: 0.5,
                  fontSize: { xs: '1.75rem', md: '2rem' },
                }}
              >
                {kpis.totalProjects}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: colors.grey[400],
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                From imported project registry
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 4,
              background: theme.palette.mode === 'dark'
                ? `linear-gradient(135deg, ${colors.primary[400]} 0%, ${colors.primary[500]} 100%)`
                : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              border: `1px solid ${theme.palette.mode === 'dark' ? colors.greenAccent[700] : 'rgba(0,0,0,0.08)'}`,
              boxShadow: theme.palette.mode === 'dark'
                ? '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(76, 206, 172, 0.1)'
                : '0 4px 20px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.05)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 12px 40px rgba(76, 206, 172, 0.3), 0 0 0 1px rgba(76, 206, 172, 0.2)'
                  : '0 8px 30px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.08)',
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(90deg, ${colors.greenAccent[500]}, ${colors.greenAccent[300]})`,
              },
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: colors.grey[300],
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    fontSize: '0.7rem',
                    letterSpacing: '0.5px',
                  }}
                >
                  Total Budget
                </Typography>
                <Box
                  sx={{
                    p: 1.2,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${colors.greenAccent[600]}, ${colors.greenAccent[400]})`,
                    boxShadow: `0 4px 12px ${colors.greenAccent[700]}40`,
                  }}
                >
                  <AttachMoneyIcon sx={{ color: 'white', fontSize: 22 }} />
                </Box>
              </Box>
              <Typography
                variant="h6"
                sx={{
                  color: colors.grey[100],
                  fontWeight: 800,
                  mb: 0.5,
                  fontSize: { xs: '1.25rem', md: '1.5rem' },
                }}
              >
                {formatCurrency(kpis.totalBudget)}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: colors.grey[400],
                  fontSize: '0.8rem',
                }}
              >
                Across all imported projects
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 4,
              background: theme.palette.mode === 'dark'
                ? `linear-gradient(135deg, ${colors.primary[400]} 0%, ${colors.primary[500]} 100%)`
                : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              border: `1px solid ${theme.palette.mode === 'dark' ? colors.yellowAccent[700] : 'rgba(0,0,0,0.08)'}`,
              boxShadow: theme.palette.mode === 'dark'
                ? '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(245, 158, 11, 0.1)'
                : '0 4px 20px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.05)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 12px 40px rgba(245, 158, 11, 0.3), 0 0 0 1px rgba(245, 158, 11, 0.2)'
                  : '0 8px 30px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.08)',
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(90deg, ${colors.yellowAccent[500]}, ${colors.yellowAccent[300]})`,
              },
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: colors.grey[300],
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    fontSize: '0.7rem',
                    letterSpacing: '0.5px',
                  }}
                >
                  Absorption Rate
                </Typography>
                <Box
                  sx={{
                    p: 1.2,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${colors.yellowAccent[600]}, ${colors.yellowAccent[400]})`,
                    boxShadow: `0 4px 12px ${colors.yellowAccent[700]}40`,
                  }}
                >
                  <TimelineIcon sx={{ color: 'white', fontSize: 22 }} />
                </Box>
              </Box>
              <Typography
                variant="h4"
                sx={{
                  color: colors.grey[100],
                  fontWeight: 800,
                  mb: 1.5,
                  fontSize: { xs: '1.75rem', md: '2rem' },
                }}
              >
                {kpis.absorptionRate}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={kpis.absorptionRate}
                sx={{
                  height: 8,
                  borderRadius: 10,
                  bgcolor: colors.primary[300],
                  mb: 1,
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 10,
                    background:
                      kpis.absorptionRate >= 80
                        ? `linear-gradient(90deg, ${colors.greenAccent[500]}, ${colors.greenAccent[300]})`
                        : kpis.absorptionRate >= 50
                        ? `linear-gradient(90deg, ${colors.yellowAccent[500]}, ${colors.yellowAccent[300]})`
                        : `linear-gradient(90deg, ${colors.redAccent[500]}, ${colors.redAccent[300]})`,
                    boxShadow: `0 2px 8px ${kpis.absorptionRate >= 80 ? colors.greenAccent[600] : kpis.absorptionRate >= 50 ? colors.yellowAccent[600] : colors.redAccent[600]}40`,
                  },
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  color: colors.grey[400],
                  fontSize: '0.8rem',
                }}
              >
                Disbursed vs. contracted
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 4,
              background: theme.palette.mode === 'dark'
                ? `linear-gradient(135deg, ${colors.primary[400]} 0%, ${colors.primary[500]} 100%)`
                : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              border: `1px solid ${theme.palette.mode === 'dark' ? colors.purpleAccent?.[700] || colors.greenAccent[700] : 'rgba(0,0,0,0.08)'}`,
              boxShadow: theme.palette.mode === 'dark'
                ? '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(168, 85, 247, 0.1)'
                : '0 4px 20px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.05)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 12px 40px rgba(168, 85, 247, 0.3), 0 0 0 1px rgba(168, 85, 247, 0.2)'
                  : '0 8px 30px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.08)',
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(90deg, ${colors.greenAccent[500]}, ${colors.blueAccent[500]})`,
              },
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: colors.grey[300],
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    fontSize: '0.7rem',
                    letterSpacing: '0.5px',
                  }}
                >
                  Overall Progress
                </Typography>
                <Box
                  sx={{
                    p: 1.2,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${colors.greenAccent[600]}, ${colors.blueAccent[500]})`,
                    boxShadow: `0 4px 12px ${colors.greenAccent[700]}40`,
                  }}
                >
                  <TrendingUpIcon sx={{ color: 'white', fontSize: 22 }} />
                </Box>
              </Box>
              <Typography
                variant="h4"
                sx={{
                  color: colors.grey[100],
                  fontWeight: 800,
                  mb: 1.5,
                  fontSize: { xs: '1.75rem', md: '2rem' },
                }}
              >
                {overallProgress}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={overallProgress}
                sx={{
                  height: 8,
                  borderRadius: 10,
                  bgcolor: colors.primary[300],
                  mb: 1,
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 10,
                    background: `linear-gradient(90deg, ${colors.greenAccent[500]}, ${colors.blueAccent[400]})`,
                    boxShadow: `0 2px 8px ${colors.greenAccent[600]}40`,
                  },
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  color: colors.grey[400],
                  fontSize: '0.8rem',
                }}
              >
                Average completion across projects
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main charts row */}
      <Grid container spacing={2.5}>
        {/* Projects by status */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              borderRadius: 4,
              background: theme.palette.mode === 'dark'
                ? `linear-gradient(135deg, ${colors.primary[400]} 0%, ${colors.primary[500]} 100%)`
                : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              border: `1px solid ${theme.palette.mode === 'dark' ? colors.blueAccent[700] : 'rgba(0,0,0,0.08)'}`,
              boxShadow: theme.palette.mode === 'dark'
                ? '0 8px 32px rgba(0,0,0,0.4)'
                : '0 4px 20px rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease',
              height: '100%',
              '&:hover': {
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 12px 48px rgba(0,0,0,0.5)'
                  : '0 8px 32px rgba(0,0,0,0.12)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1.5,
                    background: `linear-gradient(135deg, ${colors.blueAccent[600]}, ${colors.blueAccent[400]})`,
                  }}
                >
                  <AssessmentIcon sx={{ color: 'white', fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: colors.grey[100],
                      fontWeight: 700,
                      fontSize: '1.1rem',
                    }}
                  >
                    Projects by Status
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: colors.grey[400],
                      fontSize: '0.75rem',
                    }}
                  >
                    Snapshot from the imported project registry
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ height: 280, mt: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      innerRadius={30}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {statusChartData.map((entry, index) => (
                        <Cell
                          key={`status-${index}`}
                          fill={entry.color}
                          stroke={theme.palette.mode === 'dark' ? colors.primary[500] : '#ffffff'}
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        background: theme.palette.mode === 'dark' ? colors.primary[500] : '#ffffff',
                        border: `1px solid ${colors.blueAccent[700]}`,
                        borderRadius: 8,
                        padding: '8px 12px',
                      }}
                    />
                    <Legend
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Absorption by department */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              borderRadius: 4,
              background: theme.palette.mode === 'dark'
                ? `linear-gradient(135deg, ${colors.primary[400]} 0%, ${colors.primary[500]} 100%)`
                : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              border: `1px solid ${theme.palette.mode === 'dark' ? colors.greenAccent[700] : 'rgba(0,0,0,0.08)'}`,
              boxShadow: theme.palette.mode === 'dark'
                ? '0 8px 32px rgba(0,0,0,0.4)'
                : '0 4px 20px rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease',
              height: '100%',
              '&:hover': {
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 12px 48px rgba(0,0,0,0.5)'
                  : '0 8px 32px rgba(0,0,0,0.12)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1.5,
                    background: `linear-gradient(135deg, ${colors.greenAccent[600]}, ${colors.greenAccent[400]})`,
                  }}
                >
                  <AttachMoneyIcon sx={{ color: 'white', fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: colors.grey[100],
                      fontWeight: 700,
                      fontSize: '1.1rem',
                    }}
                  >
                    Absorption by Department
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: colors.grey[400],
                      fontSize: '0.75rem',
                    }}
                  >
                    Contracted vs. disbursed (sample data)
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ height: 280, mt: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={absorptionByDepartment}
                    margin={{ top: 10, right: 10, left: -20, bottom: 50 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={theme.palette.mode === 'dark' ? colors.grey[700] : colors.grey[300]}
                    />
                    <XAxis
                      dataKey="name"
                      angle={-30}
                      textAnchor="end"
                      interval={0}
                      height={70}
                      tick={{ fill: colors.grey[300], fontSize: 11 }}
                    />
                    <YAxis tick={{ fill: colors.grey[300], fontSize: 11 }} />
                    <RechartsTooltip
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{
                        background: theme.palette.mode === 'dark' ? colors.primary[500] : '#ffffff',
                        border: `1px solid ${colors.greenAccent[700]}`,
                        borderRadius: 8,
                        padding: '8px 12px',
                      }}
                    />
                    <Legend
                      wrapperStyle={{ paddingTop: '10px' }}
                      iconType="square"
                    />
                    <Bar
                      dataKey="contracted"
                      name="Budget"
                      fill={colors.blueAccent[500]}
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="paid"
                      name="Disbursed"
                      fill={colors.greenAccent[500]}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Jobs & equity snapshot */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              borderRadius: 4,
              background: theme.palette.mode === 'dark'
                ? `linear-gradient(135deg, ${colors.primary[400]} 0%, ${colors.primary[500]} 100%)`
                : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              border: `1px solid ${theme.palette.mode === 'dark' ? colors.orange[700] : 'rgba(0,0,0,0.08)'}`,
              boxShadow: theme.palette.mode === 'dark'
                ? '0 8px 32px rgba(0,0,0,0.4)'
                : '0 4px 20px rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease',
              height: '100%',
              '&:hover': {
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 12px 48px rgba(0,0,0,0.5)'
                  : '0 8px 32px rgba(0,0,0,0.12)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1.5,
                    background: `linear-gradient(135deg, ${colors.orange[600]}, ${colors.orange[400]})`,
                  }}
                >
                  <WorkIcon sx={{ color: 'white', fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: colors.grey[100],
                      fontWeight: 700,
                      fontSize: '1.1rem',
                    }}
                  >
                    Jobs Created Snapshot
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: colors.grey[400],
                      fontSize: '0.75rem',
                    }}
                  >
                    From Jobs feature (sample summary)
                  </Typography>
                </Box>
              </Box>
              <Box mt={1.5}>
                <Typography
                  variant="h4"
                  sx={{
                    color: colors.grey[100],
                    fontWeight: 800,
                    mb: 2,
                    fontSize: { xs: '1.5rem', md: '1.75rem' },
                  }}
                >
                  {SAMPLE_JOBS_SUMMARY.totalJobs} jobs
                </Typography>
                <Box display="flex" gap={1} mt={1} flexWrap="wrap">
                  <Chip
                    size="small"
                    icon={<GroupIcon sx={{ fontSize: 14 }} />}
                    label={`Male: ${SAMPLE_JOBS_SUMMARY.totalMale}`}
                    sx={{
                      bgcolor: colors.blueAccent[600],
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      height: 28,
                    }}
                  />
                  <Chip
                    size="small"
                    icon={<GroupIcon sx={{ fontSize: 14 }} />}
                    label={`Female: ${SAMPLE_JOBS_SUMMARY.totalFemale}`}
                    sx={{
                      bgcolor: colors.purpleAccent ? colors.purpleAccent[500] : colors.greenAccent[600],
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      height: 28,
                    }}
                  />
                  <Chip
                    size="small"
                    icon={<GroupIcon sx={{ fontSize: 14 }} />}
                    label={`Direct: ${SAMPLE_JOBS_SUMMARY.totalDirectJobs}`}
                    sx={{
                      bgcolor: colors.greenAccent[600],
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      height: 28,
                    }}
                  />
                  <Chip
                    size="small"
                    icon={<GroupIcon sx={{ fontSize: 14 }} />}
                    label={`Indirect: ${SAMPLE_JOBS_SUMMARY.totalIndirectJobs}`}
                    sx={{
                      bgcolor: colors.yellowAccent ? colors.yellowAccent[600] : colors.blueAccent[500],
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      height: 28,
                    }}
                  />
                </Box>
              </Box>

              <Divider
                sx={{
                  my: 2.5,
                  borderColor: theme.palette.mode === 'dark' ? colors.primary[300] : colors.grey[300],
                }}
              />

              <Typography
                variant="caption"
                sx={{
                  color: colors.grey[400],
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Jobs by category
              </Typography>
              <Box sx={{ height: 160, mt: 1.5 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={jobsByCategoryChartData}
                    margin={{ top: 5, right: 10, left: -20, bottom: 30 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={theme.palette.mode === 'dark' ? colors.grey[700] : colors.grey[300]}
                    />
                    <XAxis
                      dataKey="name"
                      angle={-20}
                      textAnchor="end"
                      interval={0}
                      height={50}
                      tick={{ fill: colors.grey[300], fontSize: 10 }}
                    />
                    <YAxis tick={{ fill: colors.grey[300], fontSize: 10 }} />
                    <RechartsTooltip
                      contentStyle={{
                        background: theme.palette.mode === 'dark' ? colors.primary[500] : '#ffffff',
                        border: `1px solid ${colors.orange[700]}`,
                        borderRadius: 8,
                        padding: '8px 12px',
                      }}
                    />
                    <Bar dataKey="value" name="Jobs" radius={[4, 4, 0, 0]}>
                      {jobsByCategoryChartData.map((entry, index) => (
                        <Cell key={`jobs-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Executive Summary - Geographic & Funding Overview */}
      <Grid container spacing={2.5} sx={{ mt: 3 }}>
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: 4,
              background: theme.palette.mode === 'dark'
                ? `linear-gradient(135deg, ${colors.primary[400]} 0%, ${colors.primary[500]} 100%)`
                : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              border: `1px solid ${theme.palette.mode === 'dark' ? colors.greenAccent[700] : 'rgba(0,0,0,0.08)'}`,
              boxShadow: theme.palette.mode === 'dark'
                ? '0 8px 32px rgba(0,0,0,0.4)'
                : '0 4px 20px rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease',
              height: '100%',
              '&:hover': {
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 12px 48px rgba(0,0,0,0.5)'
                  : '0 8px 32px rgba(0,0,0,0.12)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1.5,
                    background: `linear-gradient(135deg, ${colors.greenAccent[600]}, ${colors.greenAccent[400]})`,
                  }}
                >
                  <PublicIcon sx={{ color: 'white', fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: colors.grey[100],
                      fontWeight: 700,
                      fontSize: '1.1rem',
                    }}
                  >
                    Geographic Distribution
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: colors.grey[400],
                      fontSize: '0.75rem',
                    }}
                  >
                    Projects across constituencies
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ height: 300, mt: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projectsByConstituency} margin={{ top: 10, right: 10, left: -20, bottom: 50 }}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={theme.palette.mode === 'dark' ? colors.grey[700] : colors.grey[300]}
                    />
                    <XAxis
                      dataKey="name"
                      angle={-30}
                      textAnchor="end"
                      interval={0}
                      height={70}
                      tick={{ fill: colors.grey[300], fontSize: 11 }}
                    />
                    <YAxis tick={{ fill: colors.grey[300], fontSize: 11 }} />
                    <RechartsTooltip
                      contentStyle={{
                        background: theme.palette.mode === 'dark' ? colors.primary[500] : '#ffffff',
                        border: `1px solid ${colors.greenAccent[700]}`,
                        borderRadius: 8,
                        padding: '8px 12px',
                      }}
                    />
                    <Bar dataKey="value" fill={colors.greenAccent[500]} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: 4,
              background: theme.palette.mode === 'dark'
                ? `linear-gradient(135deg, ${colors.primary[400]} 0%, ${colors.primary[500]} 100%)`
                : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              border: `1px solid ${theme.palette.mode === 'dark' ? colors.yellowAccent[700] : 'rgba(0,0,0,0.08)'}`,
              boxShadow: theme.palette.mode === 'dark'
                ? '0 8px 32px rgba(0,0,0,0.4)'
                : '0 4px 20px rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease',
              height: '100%',
              '&:hover': {
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 12px 48px rgba(0,0,0,0.5)'
                  : '0 8px 32px rgba(0,0,0,0.12)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1.5,
                    background: `linear-gradient(135deg, ${colors.yellowAccent[600]}, ${colors.yellowAccent[400]})`,
                  }}
                >
                  <BusinessIcon sx={{ color: 'white', fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: colors.grey[100],
                      fontWeight: 700,
                      fontSize: '1.1rem',
                    }}
                  >
                    Funding Sources
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: colors.grey[400],
                      fontSize: '0.75rem',
                    }}
                  >
                    Budget allocation by source
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ height: 300, mt: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={projectsByBudgetSource}
                      cx="50%"
                      cy="50%"
                      outerRadius={110}
                      innerRadius={40}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {projectsByBudgetSource.map((entry, index) => (
                        <Cell
                          key={`budget-${index}`}
                          fill={entry.color}
                          stroke={theme.palette.mode === 'dark' ? colors.primary[500] : '#ffffff'}
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        background: theme.palette.mode === 'dark' ? colors.primary[500] : '#ffffff',
                        border: `1px solid ${colors.yellowAccent[700]}`,
                        borderRadius: 8,
                        padding: '8px 12px',
                      }}
                    />
                    <Legend
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Sites coverage row */}
      <Grid container spacing={2.5} sx={{ mt: 3, mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: 4,
              background: theme.palette.mode === 'dark'
                ? `linear-gradient(135deg, ${colors.primary[400]} 0%, ${colors.primary[500]} 100%)`
                : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              border: `1px solid ${theme.palette.mode === 'dark' ? colors.blueAccent[700] : 'rgba(0,0,0,0.08)'}`,
              boxShadow: theme.palette.mode === 'dark'
                ? '0 8px 32px rgba(0,0,0,0.4)'
                : '0 4px 20px rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease',
              height: '100%',
              '&:hover': {
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 12px 48px rgba(0,0,0,0.5)'
                  : '0 8px 32px rgba(0,0,0,0.12)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1.5,
                    background: `linear-gradient(135deg, ${colors.blueAccent[600]}, ${colors.blueAccent[400]})`,
                  }}
                >
                  <LocationOnIcon sx={{ color: 'white', fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: colors.grey[100],
                      fontWeight: 700,
                      fontSize: '1.1rem',
                    }}
                  >
                    Sites by Status
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: colors.grey[400],
                      fontSize: '0.75rem',
                    }}
                  >
                    Derived from sample project sites (Project Sites feature)
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ height: 280, mt: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sitesByStatusChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={35}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {sitesByStatusChartData.map((entry, index) => (
                        <Cell
                          key={`sites-${index}`}
                          fill={entry.color}
                          stroke={theme.palette.mode === 'dark' ? colors.primary[500] : '#ffffff'}
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        background: theme.palette.mode === 'dark' ? colors.primary[500] : '#ffffff',
                        border: `1px solid ${colors.blueAccent[700]}`,
                        borderRadius: 8,
                        padding: '8px 12px',
                      }}
                    />
                    <Legend
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: 4,
              background: theme.palette.mode === 'dark'
                ? `linear-gradient(135deg, ${colors.primary[400]} 0%, ${colors.primary[500]} 100%)`
                : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              border: `1px solid ${theme.palette.mode === 'dark' ? colors.greenAccent[700] : 'rgba(0,0,0,0.08)'}`,
              boxShadow: theme.palette.mode === 'dark'
                ? '0 8px 32px rgba(0,0,0,0.4)'
                : '0 4px 20px rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease',
              height: '100%',
              '&:hover': {
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 12px 48px rgba(0,0,0,0.5)'
                  : '0 8px 32px rgba(0,0,0,0.12)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1.5,
                    background: `linear-gradient(135deg, ${colors.greenAccent[600]}, ${colors.greenAccent[400]})`,
                  }}
                >
                  <LocationOnIcon sx={{ color: 'white', fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: colors.grey[100],
                      fontWeight: 700,
                      fontSize: '1.1rem',
                    }}
                  >
                    Recent Implementation Footprint
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: colors.grey[400],
                      fontSize: '0.75rem',
                    }}
                  >
                    Sample of how projects and sites are distributed across wards
                  </Typography>
                </Box>
              </Box>
              <Box mt={2} display="flex" flexDirection="column" gap={1.5}>
                {SAMPLE_SITES.map((site, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 1.5,
                      borderRadius: 2.5,
                      background: theme.palette.mode === 'dark'
                        ? `linear-gradient(135deg, ${colors.primary[500]}, ${colors.primary[600]})`
                        : 'linear-gradient(135deg, #f8f9fa, #ffffff)',
                      border: `1px solid ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.grey[300]}`,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateX(4px)',
                        boxShadow: theme.palette.mode === 'dark'
                          ? `0 4px 12px ${colors.blueAccent[700]}40`
                          : '0 2px 8px rgba(0,0,0,0.1)',
                      },
                    }}
                  >
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{
                          color: colors.grey[100],
                          fontWeight: 600,
                          mb: 0.5,
                        }}
                      >
                        {site.site_name}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: colors.grey[400],
                          fontSize: '0.8rem',
                        }}
                      >
                        {site.ward}, {site.county}
                      </Typography>
                    </Box>
                    <Chip
                      size="small"
                      label={site.status_norm}
                      sx={{
                        bgcolor: STATUS_COLORS[site.status_norm] || colors.blueAccent[500],
                        color: '#fff',
                        fontWeight: 700,
                        textTransform: 'none',
                        fontSize: '0.75rem',
                        height: 28,
                        boxShadow: `0 2px 6px ${STATUS_COLORS[site.status_norm] || colors.blueAccent[500]}40`,
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SystemDashboardPage;

