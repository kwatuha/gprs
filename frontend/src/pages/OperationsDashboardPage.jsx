import React, { useMemo, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  LocationOn as LocationOnIcon,
  AccountTree as AccountTreeIcon,
  CalendarToday as CalendarIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
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
  LineChart,
  Line,
} from 'recharts';
import { tokens } from './dashboard/theme';
import { useNavigate } from 'react-router-dom';

// Reuse sample data from SystemDashboardPage
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
    percentageComplete: 60,
    StartDate: '2024-01-15',
    EndDate: '2025-06-30',
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
    percentageComplete: 0,
    StartDate: '2025-02-01',
    EndDate: '2025-12-31',
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
    percentageComplete: 73,
    StartDate: '2023-09-01',
    EndDate: '2024-09-30',
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
    percentageComplete: 100,
    StartDate: '2022-01-10',
    EndDate: '2023-03-30',
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
    percentageComplete: 53,
    StartDate: '2024-03-01',
    EndDate: '2025-08-31',
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
    percentageComplete: 60,
    StartDate: '2024-06-01',
    EndDate: '2025-05-31',
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

const OperationsDashboardPage = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    department: '',
    directorate: '',
    financialYear: '',
    status: '',
  });

  const filteredProjects = useMemo(() => {
    return SAMPLE_PROJECTS.filter((p) => {
      if (filters.department && p.department !== filters.department) return false;
      if (filters.directorate && p.directorate !== filters.directorate) return false;
      if (filters.financialYear && p.financialYear !== filters.financialYear) return false;
      if (filters.status && p.Status !== filters.status) return false;
      return true;
    });
  }, [filters]);

  const chartData = useMemo(() => {
    // Projects by Directorate
    const directorateMap = new Map();
    filteredProjects.forEach((p) => {
      const key = p.directorate || 'Unknown';
      directorateMap.set(key, (directorateMap.get(key) || 0) + 1);
    });
    const directorateChart = Array.from(directorateMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }));

    // Projects by Sub-county
    const subcountyMap = new Map();
    filteredProjects.forEach((p) => {
      const key = p['sub-county'] || 'Unknown';
      subcountyMap.set(key, (subcountyMap.get(key) || 0) + 1);
    });
    const subcountyChart = Array.from(subcountyMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }));

    // Projects by Status
    const statusMap = new Map();
    filteredProjects.forEach((p) => {
      const key = (p.Status || '').trim() || 'Unknown';
      statusMap.set(key, (statusMap.get(key) || 0) + 1);
    });
    const statusChart = Array.from(statusMap.entries()).map(([name, value]) => ({
      name,
      value,
      color: STATUS_COLORS[name] || '#64748b',
    }));

    // Progress distribution
    const progressBands = [
      { name: '0-25%', min: 0, max: 25, count: 0 },
      { name: '26-50%', min: 26, max: 50, count: 0 },
      { name: '51-75%', min: 51, max: 75, count: 0 },
      { name: '76-100%', min: 76, max: 100, count: 0 },
    ];
    filteredProjects.forEach((p) => {
      const progress = p.percentageComplete || 0;
      const band = progressBands.find((b) => progress >= b.min && progress <= b.max);
      if (band) band.count++;
    });

    // Timeline by Financial Year
    const fyMap = new Map();
    filteredProjects.forEach((p) => {
      const key = p.financialYear || 'Unknown';
      fyMap.set(key, (fyMap.get(key) || 0) + 1);
    });
    const fyChart = Array.from(fyMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, value]) => ({ name, value }));

    return {
      directorateChart,
      subcountyChart,
      statusChart,
      progressBands,
      fyChart,
    };
  }, [filteredProjects]);

  const uniqueDepartments = Array.from(new Set(SAMPLE_PROJECTS.map((p) => p.department))).filter(Boolean);
  const uniqueDirectorates = Array.from(new Set(SAMPLE_PROJECTS.map((p) => p.directorate))).filter(Boolean);
  const uniqueFinancialYears = Array.from(new Set(SAMPLE_PROJECTS.map((p) => p.financialYear))).filter(Boolean);
  const uniqueStatuses = Array.from(new Set(SAMPLE_PROJECTS.map((p) => p.Status))).filter(Boolean);

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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box
            sx={{
              width: 4,
              height: 40,
              background: `linear-gradient(180deg, ${colors.blueAccent[500]}, ${colors.blueAccent[300]})`,
              borderRadius: 2,
            }}
          />
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                background: `linear-gradient(135deg, ${colors.blueAccent[500]}, ${colors.blueAccent[300]})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em',
                fontSize: { xs: '1.75rem', md: '2.25rem' },
              }}
            >
              Operations Dashboard
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
              Detailed project management view: Monitor status breakdown, organizational structure, geographic distribution, and implementation timelines.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => navigate('/impes/system-dashboard')}
            sx={{
              borderColor: colors.blueAccent[500],
              color: colors.blueAccent[500],
              '&:hover': {
                borderColor: colors.blueAccent[400],
                bgcolor: colors.blueAccent[600] + '20',
              },
            }}
          >
            System Dashboard
          </Button>
        </Box>

        {/* Filters */}
        <Card
          sx={{
            borderRadius: 3,
            bgcolor: theme.palette.mode === 'dark' ? colors.primary[400] : '#ffffff',
            mb: 3,
            border: `1px solid ${theme.palette.mode === 'dark' ? colors.blueAccent[700] : 'rgba(0,0,0,0.08)'}`,
          }}
        >
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <FilterIcon sx={{ color: colors.blueAccent[500] }} />
              <Typography variant="subtitle1" sx={{ color: colors.grey[100], fontWeight: 600 }}>
                Filters
              </Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={filters.department}
                    label="Department"
                    onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                    sx={{ minWidth: 150 }}
                  >
                    <MenuItem value="">All Departments</MenuItem>
                    {uniqueDepartments.map((dept) => (
                      <MenuItem key={dept} value={dept}>
                        {dept}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Directorate</InputLabel>
                  <Select
                    value={filters.directorate}
                    label="Directorate"
                    onChange={(e) => setFilters({ ...filters, directorate: e.target.value })}
                    sx={{ minWidth: 150 }}
                  >
                    <MenuItem value="">All Directorates</MenuItem>
                    {uniqueDirectorates.map((dir) => (
                      <MenuItem key={dir} value={dir}>
                        {dir}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Financial Year</InputLabel>
                  <Select
                    value={filters.financialYear}
                    label="Financial Year"
                    onChange={(e) => setFilters({ ...filters, financialYear: e.target.value })}
                    sx={{ minWidth: 150 }}
                  >
                    <MenuItem value="">All Years</MenuItem>
                    {uniqueFinancialYears.map((fy) => (
                      <MenuItem key={fy} value={fy}>
                        {fy}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status}
                    label="Status"
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    sx={{ minWidth: 150 }}
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    {uniqueStatuses.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Box mt={2} display="flex" gap={1}>
              <Chip
                label={`${filteredProjects.length} projects`}
                size="small"
                sx={{ bgcolor: colors.blueAccent[600], color: 'white' }}
              />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Charts Grid */}
      <Grid container spacing={2.5}>
        {/* Projects by Directorate */}
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
                  <AccountTreeIcon sx={{ color: 'white', fontSize: 20 }} />
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
                    Projects by Directorate
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: colors.grey[400],
                      fontSize: '0.75rem',
                    }}
                  >
                    Organizational structure breakdown
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ height: 320, mt: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.directorateChart} margin={{ top: 10, right: 10, left: -20, bottom: 70 }}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={theme.palette.mode === 'dark' ? colors.grey[700] : colors.grey[300]}
                    />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      interval={0}
                      height={90}
                      tick={{ fill: colors.grey[300], fontSize: 10 }}
                    />
                    <YAxis tick={{ fill: colors.grey[300], fontSize: 11 }} />
                    <RechartsTooltip
                      contentStyle={{
                        background: theme.palette.mode === 'dark' ? colors.primary[500] : '#ffffff',
                        border: `1px solid ${colors.blueAccent[700]}`,
                        borderRadius: 8,
                        padding: '8px 12px',
                      }}
                    />
                    <Bar dataKey="value" fill={colors.blueAccent[500]} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Projects by Sub-county */}
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
                    Projects by Sub-county
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: colors.grey[400],
                      fontSize: '0.75rem',
                    }}
                  >
                    Administrative unit distribution
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ height: 320, mt: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.subcountyChart} margin={{ top: 10, right: 10, left: -20, bottom: 50 }}>
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

        {/* Projects by Status */}
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
                    Current implementation status
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ height: 320, mt: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData.statusChart}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={40}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {chartData.statusChart.map((entry, index) => (
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

        {/* Progress Distribution */}
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
                    Progress Distribution
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: colors.grey[400],
                      fontSize: '0.75rem',
                    }}
                  >
                    Projects by completion percentage bands
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ height: 320, mt: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.progressBands} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={theme.palette.mode === 'dark' ? colors.grey[700] : colors.grey[300]}
                    />
                    <XAxis
                      dataKey="name"
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
                    <Bar dataKey="count" fill={colors.greenAccent[500]} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Timeline by Financial Year */}
        <Grid item xs={12}>
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
                  <CalendarIcon sx={{ color: 'white', fontSize: 20 }} />
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
                    Projects Timeline
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: colors.grey[400],
                      fontSize: '0.75rem',
                    }}
                  >
                    Distribution across financial years
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ height: 300, mt: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData.fyChart} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={theme.palette.mode === 'dark' ? colors.grey[700] : colors.grey[300]}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: colors.grey[300], fontSize: 11 }}
                    />
                    <YAxis tick={{ fill: colors.grey[300], fontSize: 11 }} />
                    <RechartsTooltip
                      contentStyle={{
                        background: theme.palette.mode === 'dark' ? colors.primary[500] : '#ffffff',
                        border: `1px solid ${colors.yellowAccent[700]}`,
                        borderRadius: 8,
                        padding: '8px 12px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={colors.yellowAccent[500]}
                      strokeWidth={3}
                      dot={{ fill: colors.yellowAccent[500], r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OperationsDashboardPage;
