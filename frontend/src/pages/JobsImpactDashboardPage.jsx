import React, { useMemo } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  useTheme,
  Button,
} from '@mui/material';
import {
  Work as WorkIcon,
  Group as GroupIcon,
  TrendingUp as TrendingUpIcon,
  LocationOn as LocationOnIcon,
  Refresh as RefreshIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
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

// Sample jobs data aligned with Direct/Indirect structure
const SAMPLE_JOBS_SUMMARY = {
  totalJobs: 186,
  totalMale: 104,
  totalFemale: 56,
  totalDirectJobs: 142,
  totalIndirectJobs: 44,
};

const SAMPLE_JOBS_BY_CATEGORY = [
  { category_name: 'Skilled Labour', jobs_count: 72, direct: 58, indirect: 14, male: 42, female: 30 },
  { category_name: 'Unskilled Labour', jobs_count: 86, direct: 64, indirect: 22, male: 48, female: 38 },
  { category_name: 'Supervisory / Technical', jobs_count: 28, direct: 20, indirect: 8, male: 14, female: 14 },
];

// Sample jobs by project
const SAMPLE_JOBS_BY_PROJECT = [
  { project: 'Level 4 Hospital Upgrade', direct: 45, indirect: 12, total: 57 },
  { project: 'Road Tarmacking', direct: 38, indirect: 15, total: 53 },
  { project: 'Rural Water Pan Program', direct: 32, indirect: 8, total: 40 },
  { project: 'Market Sheds Construction', direct: 18, indirect: 6, total: 24 },
  { project: 'ECDE Classrooms', direct: 9, indirect: 3, total: 12 },
];

// Sample jobs by ward
const SAMPLE_JOBS_BY_WARD = [
  { ward: 'Miambani', direct: 45, indirect: 12, total: 57 },
  { ward: 'Kitui Town', direct: 38, indirect: 15, total: 53 },
  { ward: 'Kanyangi', direct: 32, indirect: 8, total: 40 },
  { ward: 'Kwa Mutonga', direct: 18, indirect: 6, total: 24 },
  { ward: 'Kisasi', direct: 15, indirect: 3, total: 18 },
];

const JobsImpactDashboardPage = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const chartData = useMemo(() => {
    // Direct vs Indirect comparison
    const directIndirectData = [
      { name: 'Direct Jobs', value: SAMPLE_JOBS_SUMMARY.totalDirectJobs, color: colors.greenAccent[500] },
      { name: 'Indirect Jobs', value: SAMPLE_JOBS_SUMMARY.totalIndirectJobs, color: colors.blueAccent[500] },
    ];

    // Gender distribution
    const genderData = [
      { name: 'Male', value: SAMPLE_JOBS_SUMMARY.totalMale, color: colors.blueAccent[500] },
      { name: 'Female', value: SAMPLE_JOBS_SUMMARY.totalFemale, color: colors.purpleAccent ? colors.purpleAccent[500] : colors.greenAccent[600] },
    ];

    // Jobs by category with direct/indirect breakdown
    const categoryChart = SAMPLE_JOBS_BY_CATEGORY.map((j, index) => ({
      name: j.category_name,
      direct: j.direct,
      indirect: j.indirect,
      total: j.jobs_count,
      color: ['#3b82f6', '#22c55e', '#f97316'][index % 3],
    }));

    return {
      directIndirectData,
      genderData,
      categoryChart,
    };
  }, [colors]);

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
              background: `linear-gradient(180deg, ${colors.greenAccent[500]}, ${colors.orange[500]})`,
              borderRadius: 2,
            }}
          />
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                background: `linear-gradient(135deg, ${colors.greenAccent[500]}, ${colors.orange[500]})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em',
                fontSize: { xs: '1.75rem', md: '2.25rem' },
              }}
            >
              Jobs & Impact Dashboard
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
              Track employment creation: Monitor direct and indirect jobs, gender distribution, category breakdown, and geographic impact across projects.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => navigate('/impes/system-dashboard')}
            sx={{
              borderColor: colors.greenAccent[500],
              color: colors.greenAccent[500],
              '&:hover': {
                borderColor: colors.greenAccent[400],
                bgcolor: colors.greenAccent[600] + '20',
              },
            }}
          >
            System Dashboard
          </Button>
        </Box>
      </Box>

      {/* Summary KPIs */}
      <Grid container spacing={2.5} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
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
                transform: 'translateY(-4px)',
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 12px 40px rgba(76, 206, 172, 0.3)'
                  : '0 8px 30px rgba(0,0,0,0.12)',
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
              position: 'relative',
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
                  Total Jobs
                </Typography>
                <Box
                  sx={{
                    p: 1.2,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${colors.greenAccent[600]}, ${colors.greenAccent[400]})`,
                    boxShadow: `0 4px 12px ${colors.greenAccent[700]}40`,
                  }}
                >
                  <WorkIcon sx={{ color: 'white', fontSize: 22 }} />
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
                {SAMPLE_JOBS_SUMMARY.totalJobs}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: colors.grey[400],
                  fontSize: '0.8rem',
                }}
              >
                Created across all projects
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
                ? '0 8px 32px rgba(0,0,0,0.4)'
                : '0 4px 20px rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 12px 40px rgba(76, 206, 172, 0.3)'
                  : '0 8px 30px rgba(0,0,0,0.12)',
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
              position: 'relative',
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
                  Direct Jobs
                </Typography>
                <Box
                  sx={{
                    p: 1.2,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${colors.greenAccent[600]}, ${colors.greenAccent[400]})`,
                    boxShadow: `0 4px 12px ${colors.greenAccent[700]}40`,
                  }}
                >
                  <PeopleIcon sx={{ color: 'white', fontSize: 22 }} />
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
                {SAMPLE_JOBS_SUMMARY.totalDirectJobs}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: colors.grey[400],
                  fontSize: '0.8rem',
                }}
              >
                {Math.round((SAMPLE_JOBS_SUMMARY.totalDirectJobs / SAMPLE_JOBS_SUMMARY.totalJobs) * 100)}% of total
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
              border: `1px solid ${theme.palette.mode === 'dark' ? colors.blueAccent[700] : 'rgba(0,0,0,0.08)'}`,
              boxShadow: theme.palette.mode === 'dark'
                ? '0 8px 32px rgba(0,0,0,0.4)'
                : '0 4px 20px rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 12px 40px rgba(104, 112, 250, 0.3)'
                  : '0 8px 30px rgba(0,0,0,0.12)',
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
              position: 'relative',
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
                  Indirect Jobs
                </Typography>
                <Box
                  sx={{
                    p: 1.2,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${colors.blueAccent[600]}, ${colors.blueAccent[400]})`,
                    boxShadow: `0 4px 12px ${colors.blueAccent[700]}40`,
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
                  mb: 0.5,
                  fontSize: { xs: '1.75rem', md: '2rem' },
                }}
              >
                {SAMPLE_JOBS_SUMMARY.totalIndirectJobs}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: colors.grey[400],
                  fontSize: '0.8rem',
                }}
              >
                {Math.round((SAMPLE_JOBS_SUMMARY.totalIndirectJobs / SAMPLE_JOBS_SUMMARY.totalJobs) * 100)}% of total
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
              border: `1px solid ${theme.palette.mode === 'dark' ? (colors.purpleAccent?.[700] || colors.greenAccent[700]) : 'rgba(0,0,0,0.08)'}`,
              boxShadow: theme.palette.mode === 'dark'
                ? '0 8px 32px rgba(0,0,0,0.4)'
                : '0 4px 20px rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 12px 40px rgba(168, 85, 247, 0.3)'
                  : '0 8px 30px rgba(0,0,0,0.12)',
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(90deg, ${colors.purpleAccent ? colors.purpleAccent[500] : colors.greenAccent[500]}, ${colors.purpleAccent ? colors.purpleAccent[300] : colors.greenAccent[300]})`,
              },
              position: 'relative',
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
                  Gender Ratio
                </Typography>
                <Box
                  sx={{
                    p: 1.2,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${colors.purpleAccent ? colors.purpleAccent[600] : colors.greenAccent[600]}, ${colors.purpleAccent ? colors.purpleAccent[400] : colors.greenAccent[400]})`,
                    boxShadow: `0 4px 12px ${colors.purpleAccent ? colors.purpleAccent[700] : colors.greenAccent[700]}40`,
                  }}
                >
                  <GroupIcon sx={{ color: 'white', fontSize: 22 }} />
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
                {Math.round((SAMPLE_JOBS_SUMMARY.totalFemale / SAMPLE_JOBS_SUMMARY.totalJobs) * 100)}% Female
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: colors.grey[400],
                  fontSize: '0.8rem',
                }}
              >
                {SAMPLE_JOBS_SUMMARY.totalMale}M : {SAMPLE_JOBS_SUMMARY.totalFemale}F
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Grid */}
      <Grid container spacing={2.5}>
        {/* Direct vs Indirect */}
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
                    background: `linear-gradient(135deg, ${colors.greenAccent[600]}, ${colors.blueAccent[500]})`,
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
                    Direct vs Indirect Jobs
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: colors.grey[400],
                      fontSize: '0.75rem',
                    }}
                  >
                    Employment type distribution
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ height: 300, mt: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData.directIndirectData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={40}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {chartData.directIndirectData.map((entry, index) => (
                        <Cell
                          key={`direct-indirect-${index}`}
                          fill={entry.color}
                          stroke={theme.palette.mode === 'dark' ? colors.primary[500] : '#ffffff'}
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        background: theme.palette.mode === 'dark' ? colors.primary[500] : '#ffffff',
                        border: `1px solid ${colors.greenAccent[700]}`,
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

        {/* Gender Distribution */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: 4,
              background: theme.palette.mode === 'dark'
                ? `linear-gradient(135deg, ${colors.primary[400]} 0%, ${colors.primary[500]} 100%)`
                : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              border: `1px solid ${theme.palette.mode === 'dark' ? (colors.purpleAccent?.[700] || colors.blueAccent[700]) : 'rgba(0,0,0,0.08)'}`,
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
                    background: `linear-gradient(135deg, ${colors.blueAccent[600]}, ${colors.purpleAccent ? colors.purpleAccent[500] : colors.greenAccent[600]})`,
                  }}
                >
                  <GroupIcon sx={{ color: 'white', fontSize: 20 }} />
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
                    Gender Distribution
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: colors.grey[400],
                      fontSize: '0.75rem',
                    }}
                  >
                    Male vs Female employment
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ height: 300, mt: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData.genderData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={40}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {chartData.genderData.map((entry, index) => (
                        <Cell
                          key={`gender-${index}`}
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

        {/* Jobs by Category with Direct/Indirect */}
        <Grid item xs={12} md={6}>
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
                    Jobs by Category
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: colors.grey[400],
                      fontSize: '0.75rem',
                    }}
                  >
                    Direct and indirect breakdown by category
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ height: 300, mt: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.categoryChart} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={theme.palette.mode === 'dark' ? colors.grey[700] : colors.grey[300]}
                    />
                    <XAxis
                      dataKey="name"
                      angle={-20}
                      textAnchor="end"
                      interval={0}
                      height={60}
                      tick={{ fill: colors.grey[300], fontSize: 10 }}
                    />
                    <YAxis tick={{ fill: colors.grey[300], fontSize: 11 }} />
                    <RechartsTooltip
                      contentStyle={{
                        background: theme.palette.mode === 'dark' ? colors.primary[500] : '#ffffff',
                        border: `1px solid ${colors.orange[700]}`,
                        borderRadius: 8,
                        padding: '8px 12px',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="direct" name="Direct Jobs" fill={colors.greenAccent[500]} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="indirect" name="Indirect Jobs" fill={colors.blueAccent[500]} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Jobs by Project */}
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
                    Jobs by Project
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: colors.grey[400],
                      fontSize: '0.75rem',
                    }}
                  >
                    Employment creation per project
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ height: 300, mt: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={SAMPLE_JOBS_BY_PROJECT} margin={{ top: 10, right: 10, left: -20, bottom: 60 }}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={theme.palette.mode === 'dark' ? colors.grey[700] : colors.grey[300]}
                    />
                    <XAxis
                      dataKey="project"
                      angle={-30}
                      textAnchor="end"
                      interval={0}
                      height={80}
                      tick={{ fill: colors.grey[300], fontSize: 9 }}
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
                    <Legend />
                    <Bar dataKey="direct" name="Direct" fill={colors.greenAccent[500]} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="indirect" name="Indirect" fill={colors.blueAccent[500]} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Jobs by Ward */}
        <Grid item xs={12}>
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
                    Geographic Impact
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: colors.grey[400],
                      fontSize: '0.75rem',
                    }}
                  >
                    Jobs created by ward
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ height: 300, mt: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={SAMPLE_JOBS_BY_WARD} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={theme.palette.mode === 'dark' ? colors.grey[700] : colors.grey[300]}
                    />
                    <XAxis
                      dataKey="ward"
                      angle={-20}
                      textAnchor="end"
                      interval={0}
                      height={60}
                      tick={{ fill: colors.grey[300], fontSize: 11 }}
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
                    <Legend />
                    <Bar dataKey="direct" name="Direct Jobs" fill={colors.greenAccent[500]} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="indirect" name="Indirect Jobs" fill={colors.blueAccent[500]} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default JobsImpactDashboardPage;
