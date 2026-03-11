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
  Button,
} from '@mui/material';
import {
  AttachMoney as AttachMoneyIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon,
  Refresh as RefreshIcon,
  Business as BusinessIcon,
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

// Sample financial data
const SAMPLE_PROJECTS = [
  {
    projectName: 'Level 4 Hospital Upgrade',
    budget: 120_000_000,
    Disbursed: 72_000_000,
    financialYear: '2024/2025',
    department: 'Health',
    budgetSource: 'County Revenue',
    absorptionRate: 60,
  },
  {
    projectName: 'Market Sheds Construction',
    budget: 30_000_000,
    Disbursed: 0,
    financialYear: '2024/2025',
    department: 'Trade',
    budgetSource: 'CDF',
    absorptionRate: 0,
  },
  {
    projectName: 'Rural Water Pan Program',
    budget: 55_000_000,
    Disbursed: 40_000_000,
    financialYear: '2023/2024',
    department: 'Water',
    budgetSource: 'National Government',
    absorptionRate: 73,
  },
  {
    projectName: 'ECDE Classrooms',
    budget: 18_000_000,
    Disbursed: 18_000_000,
    financialYear: '2022/2023',
    department: 'Education',
    budgetSource: 'County Revenue',
    absorptionRate: 100,
  },
  {
    projectName: 'Road Tarmacking - Kitui Town',
    budget: 85_000_000,
    Disbursed: 45_000_000,
    financialYear: '2024/2025',
    department: 'Infrastructure',
    budgetSource: 'National Government',
    absorptionRate: 53,
  },
  {
    projectName: 'Agricultural Extension Services',
    budget: 25_000_000,
    Disbursed: 15_000_000,
    financialYear: '2024/2025',
    department: 'Agriculture',
    budgetSource: 'County Revenue',
    absorptionRate: 60,
  },
];

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0);

const FinanceDashboardPage = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const financialData = useMemo(() => {
    const totalBudget = SAMPLE_PROJECTS.reduce((sum, p) => sum + (p.budget || 0), 0);
    const totalDisbursed = SAMPLE_PROJECTS.reduce((sum, p) => sum + (p.Disbursed || 0), 0);
    const overallAbsorption = totalBudget > 0 ? Math.round((totalDisbursed / totalBudget) * 100) : 0;

    // Absorption by Department
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
      budget: row.budget,
      disbursed: row.disbursed,
      absorption: row.budget > 0 ? Math.round((row.disbursed / row.budget) * 100) : 0,
    }));

    // Absorption by Financial Year
    const fyMap = new Map();
    SAMPLE_PROJECTS.forEach((p) => {
      const key = p.financialYear || 'Unknown';
      const current = fyMap.get(key) || { fy: key, budget: 0, disbursed: 0 };
      current.budget += p.budget || 0;
      current.disbursed += p.Disbursed || 0;
      fyMap.set(key, current);
    });
    const fyChart = Array.from(fyMap.values())
      .sort((a, b) => a.fy.localeCompare(b.fy))
      .map((row) => ({
        name: row.fy,
        budget: row.budget,
        disbursed: row.disbursed,
        absorption: row.budget > 0 ? Math.round((row.disbursed / row.budget) * 100) : 0,
      }));

    // Budget Source Analysis
    const sourceMap = new Map();
    SAMPLE_PROJECTS.forEach((p) => {
      const key = p.budgetSource || 'Unknown';
      const current = sourceMap.get(key) || { source: key, budget: 0, disbursed: 0 };
      current.budget += p.budget || 0;
      current.disbursed += p.Disbursed || 0;
      sourceMap.set(key, current);
    });
    const sourceChart = Array.from(sourceMap.values()).map((row) => ({
      name: row.source,
      budget: row.budget,
      disbursed: row.disbursed,
      absorption: row.budget > 0 ? Math.round((row.disbursed / row.budget) * 100) : 0,
      color: row.source === 'County Revenue' ? '#3b82f6' : row.source === 'National Government' ? '#22c55e' : '#f97316',
    }));

    // Top Under-Absorbing Projects
    const underAbsorbing = SAMPLE_PROJECTS.filter((p) => {
      const rate = p.budget > 0 ? (p.Disbursed / p.budget) * 100 : 0;
      return rate < 70;
    })
      .sort((a, b) => {
        const rateA = a.budget > 0 ? (a.Disbursed / a.budget) * 100 : 0;
        const rateB = b.budget > 0 ? (b.Disbursed / b.budget) * 100 : 0;
        return rateA - rateB;
      })
      .slice(0, 5)
      .map((p) => ({
        name: p.projectName,
        absorption: p.budget > 0 ? Math.round((p.Disbursed / p.budget) * 100) : 0,
        budget: p.budget,
        disbursed: p.Disbursed,
      }));

    return {
      totalBudget,
      totalDisbursed,
      overallAbsorption,
      deptChart,
      fyChart,
      sourceChart,
      underAbsorbing,
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box
            sx={{
              width: 4,
              height: 40,
              background: `linear-gradient(180deg, ${colors.yellowAccent[500]}, ${colors.greenAccent[500]})`,
              borderRadius: 2,
            }}
          />
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                background: `linear-gradient(135deg, ${colors.yellowAccent[500]}, ${colors.greenAccent[500]})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em',
                fontSize: { xs: '1.75rem', md: '2.25rem' },
              }}
            >
              Finance Dashboard
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
              Financial performance analysis: Track budget allocation, absorption rates, funding sources, and identify under-performing projects.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => navigate('/impes/system-dashboard')}
            sx={{
              borderColor: colors.yellowAccent[500],
              color: colors.yellowAccent[500],
              '&:hover': {
                borderColor: colors.yellowAccent[400],
                bgcolor: colors.yellowAccent[600] + '20',
              },
            }}
          >
            System Dashboard
          </Button>
        </Box>
      </Box>

      {/* Financial KPIs */}
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
                  <AccountBalanceIcon sx={{ color: 'white', fontSize: 22 }} />
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
                {formatCurrency(financialData.totalBudget)}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: colors.grey[400],
                  fontSize: '0.8rem',
                }}
              >
                Across all projects
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
                  Total Disbursed
                </Typography>
                <Box
                  sx={{
                    p: 1.2,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${colors.blueAccent[600]}, ${colors.blueAccent[400]})`,
                    boxShadow: `0 4px 12px ${colors.blueAccent[700]}40`,
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
                {formatCurrency(financialData.totalDisbursed)}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: colors.grey[400],
                  fontSize: '0.8rem',
                }}
              >
                Amount paid out
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
                ? '0 8px 32px rgba(0,0,0,0.4)'
                : '0 4px 20px rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 12px 40px rgba(245, 158, 11, 0.3)'
                  : '0 8px 30px rgba(0,0,0,0.12)',
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
                  Overall Absorption
                </Typography>
                <Box
                  sx={{
                    p: 1.2,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${colors.yellowAccent[600]}, ${colors.yellowAccent[400]})`,
                    boxShadow: `0 4px 12px ${colors.yellowAccent[700]}40`,
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
                {financialData.overallAbsorption}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={financialData.overallAbsorption}
                sx={{
                  height: 8,
                  borderRadius: 10,
                  bgcolor: colors.primary[300],
                  mb: 1,
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 10,
                    background:
                      financialData.overallAbsorption >= 80
                        ? `linear-gradient(90deg, ${colors.greenAccent[500]}, ${colors.greenAccent[300]})`
                        : financialData.overallAbsorption >= 50
                        ? `linear-gradient(90deg, ${colors.yellowAccent[500]}, ${colors.yellowAccent[300]})`
                        : `linear-gradient(90deg, ${colors.redAccent[500]}, ${colors.redAccent[300]})`,
                    boxShadow: `0 2px 8px ${financialData.overallAbsorption >= 80 ? colors.greenAccent[600] : financialData.overallAbsorption >= 50 ? colors.yellowAccent[600] : colors.redAccent[600]}40`,
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
                Disbursed vs. budgeted
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
              border: `1px solid ${theme.palette.mode === 'dark' ? colors.redAccent[700] : 'rgba(0,0,0,0.08)'}`,
              boxShadow: theme.palette.mode === 'dark'
                ? '0 8px 32px rgba(0,0,0,0.4)'
                : '0 4px 20px rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 12px 40px rgba(219, 79, 74, 0.3)'
                  : '0 8px 30px rgba(0,0,0,0.12)',
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(90deg, ${colors.redAccent[500]}, ${colors.redAccent[300]})`,
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
                  Under-Absorbing
                </Typography>
                <Box
                  sx={{
                    p: 1.2,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${colors.redAccent[600]}, ${colors.redAccent[400]})`,
                    boxShadow: `0 4px 12px ${colors.redAccent[700]}40`,
                  }}
                >
                  <TrendingDownIcon sx={{ color: 'white', fontSize: 22 }} />
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
                {financialData.underAbsorbing.length}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: colors.grey[400],
                  fontSize: '0.8rem',
                }}
              >
                Projects below 70% absorption
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Grid */}
      <Grid container spacing={2.5}>
        {/* Absorption by Department */}
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
                    Absorption by Department
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: colors.grey[400],
                      fontSize: '0.75rem',
                    }}
                  >
                    Budget vs. disbursed by department
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ height: 320, mt: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={financialData.deptChart} margin={{ top: 10, right: 10, left: -20, bottom: 50 }}>
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
                    <Legend />
                    <Bar dataKey="budget" name="Budget" fill={colors.blueAccent[500]} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="disbursed" name="Disbursed" fill={colors.greenAccent[500]} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Absorption by Financial Year */}
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
                  <TrendingUpIcon sx={{ color: 'white', fontSize: 20 }} />
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
                    Absorption by Financial Year
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: colors.grey[400],
                      fontSize: '0.75rem',
                    }}
                  >
                    Trend across financial years
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ height: 320, mt: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={financialData.fyChart} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{
                        background: theme.palette.mode === 'dark' ? colors.primary[500] : '#ffffff',
                        border: `1px solid ${colors.yellowAccent[700]}`,
                        borderRadius: 8,
                        padding: '8px 12px',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="budget"
                      name="Budget"
                      stroke={colors.blueAccent[500]}
                      strokeWidth={2}
                      dot={{ fill: colors.blueAccent[500], r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="disbursed"
                      name="Disbursed"
                      stroke={colors.greenAccent[500]}
                      strokeWidth={2}
                      dot={{ fill: colors.greenAccent[500], r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Budget Source Analysis */}
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
                    Budget Source Analysis
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: colors.grey[400],
                      fontSize: '0.75rem',
                    }}
                  >
                    Funding source breakdown
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ height: 320, mt: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={financialData.sourceChart}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={40}
                      paddingAngle={3}
                      dataKey="budget"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {financialData.sourceChart.map((entry, index) => (
                        <Cell
                          key={`source-${index}`}
                          fill={entry.color}
                          stroke={theme.palette.mode === 'dark' ? colors.primary[500] : '#ffffff'}
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(value) => formatCurrency(value)}
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

        {/* Top Under-Absorbing Projects */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: 4,
              background: theme.palette.mode === 'dark'
                ? `linear-gradient(135deg, ${colors.primary[400]} 0%, ${colors.primary[500]} 100%)`
                : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              border: `1px solid ${theme.palette.mode === 'dark' ? colors.redAccent[700] : 'rgba(0,0,0,0.08)'}`,
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
                    background: `linear-gradient(135deg, ${colors.redAccent[600]}, ${colors.redAccent[400]})`,
                  }}
                >
                  <TrendingDownIcon sx={{ color: 'white', fontSize: 20 }} />
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
                    Under-Absorbing Projects
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: colors.grey[400],
                      fontSize: '0.75rem',
                    }}
                  >
                    Projects with absorption below 70%
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ height: 320, mt: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={financialData.underAbsorbing} margin={{ top: 10, right: 10, left: -20, bottom: 60 }}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={theme.palette.mode === 'dark' ? colors.grey[700] : colors.grey[300]}
                    />
                    <XAxis
                      dataKey="name"
                      angle={-30}
                      textAnchor="end"
                      interval={0}
                      height={80}
                      tick={{ fill: colors.grey[300], fontSize: 9 }}
                    />
                    <YAxis tick={{ fill: colors.grey[300], fontSize: 11 }} />
                    <RechartsTooltip
                      formatter={(value, name) => {
                        if (name === 'absorption') return `${value}%`;
                        return formatCurrency(value);
                      }}
                      contentStyle={{
                        background: theme.palette.mode === 'dark' ? colors.primary[500] : '#ffffff',
                        border: `1px solid ${colors.redAccent[700]}`,
                        borderRadius: 8,
                        padding: '8px 12px',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="absorption" name="Absorption %" fill={colors.redAccent[500]} radius={[4, 4, 0, 0]} />
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

export default FinanceDashboardPage;
