import React, { useMemo, useState, useEffect } from 'react';
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
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse,
  IconButton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import sectorsService from '../api/sectorsService';
import projectService from '../api/projectService';
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
 * Uses live analytics/project data from backend APIs.
 */

// Sample jobs summary aligned with ProjectJobsModal structure (Direct/Indirect instead of Youth)
const DEFAULT_JOBS_SUMMARY = {
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

const STATUS_COLORS = {
  'Completed': '#16a34a',
  'In Progress': '#2563eb',
  'Ongoing': '#2563eb',
  'Not Started': '#9ca3af',
  'Delayed': '#f97316',
  'Stalled': '#dc2626',
};

const formatCurrency = (value) =>
  `KES ${((Number(value) || 0) / 1_000_000).toLocaleString('en-KE', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}M`;

const STATUS_COUNT_UP_MS = 500;

function useCountUp(endValue, durationMs = STATUS_COUNT_UP_MS) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const end = Math.max(0, Math.round(Number(endValue) || 0));
    if (end === 0) {
      setDisplay(0);
      return undefined;
    }

    setDisplay(0);
    const startTime = performance.now();
    let rafId;

    const tick = (now) => {
      const t = Math.min(1, (now - startTime) / durationMs);
      const eased = 1 - (1 - t) ** 3;
      setDisplay(Math.round(eased * end));
      if (t < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        setDisplay(end);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      if (rafId != null) cancelAnimationFrame(rafId);
    };
  }, [endValue, durationMs]);

  return display;
}

const SystemDashboardPage = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    department: '',
    directorate: '',
    financialYear: '',
    status: '',
  });
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [sectors, setSectors] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [jobsSnapshot, setJobsSnapshot] = useState({
    summary: DEFAULT_JOBS_SUMMARY,
    byCategory: SAMPLE_JOBS_BY_CATEGORY.map((row) => ({
      name: row.category_name,
      value: row.jobs_count,
    })),
  });

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        const data = await sectorsService.getAllSectors();
        setSectors(data || []);
      } catch (error) {
        console.error('Error fetching sectors:', error);
      }
    };
    fetchSectors();
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await projectService.analytics.getProjectsForOrganization({ limit: 5000 });
        const rows = Array.isArray(data) ? data : [];
        const normalized = rows.map((p) => ({
          ...p,
          projectName: p.projectName || p.project_name || 'Untitled Project',
          Status: p.status || p.Status || 'Unknown',
          budget: Number(p.budget ?? p.costOfProject ?? p.allocatedBudget ?? 0),
          Disbursed: Number(p.Disbursed ?? p.paidOut ?? p.disbursedBudget ?? 0),
          financialYear: p.financialYear || p.financialYearName || 'Unknown',
          department: p.department || p.departmentName || p.ministry || 'Unknown',
          directorate: p.directorate || p.directorateName || p.agency || 'Unknown',
          County: p.County || p.county || p.countyNames || 'Unknown',
          Constituency: p.Constituency || p.constituency || p.constituencyNames || 'Unknown',
          ward: p.ward || p.wardNames || 'Unknown',
          sector: p.sector || p.categoryName || p.department || p.ministry || 'Unknown',
          budgetSource: p.budgetSource || p.source || 'Unknown',
          percentageComplete: Number(p.percentageComplete ?? p.overallProgress ?? 0),
          StartDate: p.StartDate || p.startDate || '',
        }));
        setAllProjects(normalized);
      } catch (error) {
        console.error('Error fetching summary statistics projects:', error);
        setAllProjects([]);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchJobsSnapshot = async () => {
      try {
        const data = await projectService.analytics.getJobsSnapshot();
        if (data && data.summary) {
          setJobsSnapshot({
            summary: {
              totalJobs: Number(data.summary.totalJobs) || 0,
              totalMale: Number(data.summary.totalMale) || 0,
              totalFemale: Number(data.summary.totalFemale) || 0,
              totalDirectJobs: Number(data.summary.totalDirectJobs) || 0,
              totalIndirectJobs: Number(data.summary.totalIndirectJobs) || 0,
            },
            byCategory: Array.isArray(data.byCategory) ? data.byCategory : [],
          });
        }
      } catch (error) {
        console.error('Error fetching jobs snapshot:', error);
      }
    };
    fetchJobsSnapshot();
  }, []);

  const filteredProjects = useMemo(() => {
    return allProjects.filter((p) => {
      if (filters.department && p.department !== filters.department) return false;
      if (filters.directorate && p.directorate !== filters.directorate) return false;
      if (filters.financialYear && p.financialYear !== filters.financialYear) return false;
      if (filters.status && p.Status !== filters.status) return false;
      return true;
    });
  }, [allProjects, filters]);

  const {
    kpis,
    statusChartData,
    absorptionBySector,
    jobsByCategoryChartData,
    sitesByStatusChartData,
    projectsByConstituency,
    projectsByCounty,
    projectsByBudgetSource,
    overallProgress,
  } = useMemo(() => {
    const totalProjects = filteredProjects.length;
    const totalBudget = filteredProjects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const totalDisbursed = filteredProjects.reduce((sum, p) => sum + (p.Disbursed || 0), 0);
    const absorptionRate = totalBudget > 0 ? Math.round((totalDisbursed / totalBudget) * 100) : 0;

    const distinctDepartments = new Set(filteredProjects.map((p) => p.department));
    const distinctWards = new Set(filteredProjects.map((p) => p.ward));

    const kpiValues = {
      totalProjects,
      totalBudget,
      totalDisbursed,
      absorptionRate,
      departments: distinctDepartments.size,
      wards: distinctWards.size,
      jobs: jobsSnapshot.summary.totalJobs,
      sites: filteredProjects.length,
    };

    // Projects by status
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

    // Disbursement by sector (using sector field, fallback to department)
    const sectorMap = new Map();
    const sectorAliasMap = new Map();
    sectors.forEach((sector) => {
      const sectorName = sector.sectorName || sector.name;
      const alias = sector.alias || sectorName;
      if (sectorName) {
        sectorAliasMap.set(sectorName, alias);
      }
    });

    filteredProjects.forEach((p) => {
      const sectorKey = p.sector || p.department || 'Unknown';
      const current = sectorMap.get(sectorKey) || { sector: sectorKey, budget: 0, disbursed: 0 };
      current.budget += p.budget || 0;
      current.disbursed += p.Disbursed || 0;
      sectorMap.set(sectorKey, current);
    });
    const sectorChart = Array.from(sectorMap.values()).map((row) => {
      const displayName = sectorAliasMap.get(row.sector) || row.sector;
      return {
        name: displayName,
        contracted: row.budget,
        paid: row.disbursed,
      };
    });

    // Jobs by category
    const jobsCategorySource = jobsSnapshot.byCategory.length > 0
      ? jobsSnapshot.byCategory
      : SAMPLE_JOBS_BY_CATEGORY.map((j) => ({
          name: j.category_name,
          value: j.jobs_count,
        }));
    const jobsChart = jobsCategorySource.map((j, index) => ({
      name: j.name,
      value: j.value,
      color: ['#3b82f6', '#22c55e', '#f97316'][index % 3],
    }));

    // Sites by normalized status (derived from live projects list)
    const siteStatusMap = new Map();
    filteredProjects.forEach((s) => {
      const key = (s.Status || 'Unknown').trim();
      siteStatusMap.set(key, (siteStatusMap.get(key) || 0) + 1);
    });
    const sitesChart = Array.from(siteStatusMap.entries()).map(([name, value]) => ({
      name,
      value,
      color: STATUS_COLORS[name] || '#0ea5e9',
    }));

    // Projects by Financial Year
    const fyMap = new Map();
    filteredProjects.forEach((p) => {
      const key = p.financialYear || 'Unknown';
      fyMap.set(key, (fyMap.get(key) || 0) + 1);
    });
    const fyChart = Array.from(fyMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, value]) => ({ name, value }));

    // Projects by Constituency
    const constituencyMap = new Map();
    filteredProjects.forEach((p) => {
      const key = p.Constituency || 'Unknown';
      constituencyMap.set(key, (constituencyMap.get(key) || 0) + 1);
    });
    const constituencyChart = Array.from(constituencyMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }));

    // Projects by County
    const countyMap = new Map();
    filteredProjects.forEach((p) => {
      const key = p.County || 'Unknown';
      countyMap.set(key, (countyMap.get(key) || 0) + 1);
    });
    const countyChart = Array.from(countyMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }));

    // Projects by Directorate
    const directorateMap = new Map();
    filteredProjects.forEach((p) => {
      const key = p.directorate || 'Unknown';
      directorateMap.set(key, (directorateMap.get(key) || 0) + 1);
    });
    const directorateChart = Array.from(directorateMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }));

    // Projects by Budget Source
    const budgetSourceMap = new Map();
    filteredProjects.forEach((p) => {
      const key = p.budgetSource || 'Unknown';
      budgetSourceMap.set(key, (budgetSourceMap.get(key) || 0) + 1);
    });
    const budgetSourceChart = Array.from(budgetSourceMap.entries()).map(([name, value]) => ({
      name,
      value,
      color: name === 'County Revenue' ? '#3b82f6' : name === 'National Government' ? '#22c55e' : '#f97316',
    }));

    // Overall Progress (average percentage complete)
    const totalProgress = filteredProjects.reduce((sum, p) => sum + (p.percentageComplete || 0), 0);
    const avgProgress = filteredProjects.length > 0 ? Math.round(totalProgress / filteredProjects.length) : 0;

    // Projects by Timeline (grouped by start year)
    const timelineMap = new Map();
    filteredProjects.forEach((p) => {
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
      absorptionBySector: sectorChart,
      jobsByCategoryChartData: jobsChart,
      sitesByStatusChartData: sitesChart,
      projectsByFinancialYear: fyChart,
      projectsByConstituency: constituencyChart,
      projectsByCounty: countyChart,
      projectsByDirectorate: directorateChart,
      projectsByBudgetSource: budgetSourceChart,
      overallProgress: avgProgress,
      projectsByTimeline: timelineChart,
    };
  }, [filteredProjects, sectors, jobsSnapshot]);

  const recentFootprintSites = useMemo(
    () =>
      filteredProjects.slice(0, 8).map((p) => {
        const siteName = p.projectName || p.project_name || 'Untitled Project';
        const ward =
          p.ward ||
          p.wardName ||
          p.wardNames ||
          p.iebc_ward_name ||
          p.Ward ||
          '';
        const county =
          p.County ||
          p.county ||
          p.countyName ||
          p.countyNames ||
          '';

        return {
          site_name: siteName,
          county: county || 'Not specified',
          ward: ward || 'Not specified',
          status_norm: p.Status || p.status || 'Unknown',
        };
      }),
    [filteredProjects]
  );

  const executiveBrief = useMemo(() => {
    const riskStatuses = new Set(['Delayed', 'Stalled', 'Suspended']);
    const pipelineStatuses = new Set(['Not Started', 'Under Procurement']);
    const progressStatuses = new Set(['In Progress', 'Ongoing', 'Completed']);

    const atRiskProjects = filteredProjects.filter((p) => riskStatuses.has(p.Status || ''));
    const pipelineProjects = filteredProjects.filter((p) => pipelineStatuses.has(p.Status || ''));
    const onTrackProjects = filteredProjects.filter((p) => progressStatuses.has(p.Status || ''));
    const completedProjects = filteredProjects.filter((p) => (p.Status || '') === 'Completed');

    const totalProjects = Math.max(filteredProjects.length, 1);
    const deliveryHealth = Math.round((onTrackProjects.length / totalProjects) * 100);
    const completionRate = Math.round((completedProjects.length / totalProjects) * 100);

    const disbursementGap = Math.max(0, (kpis.totalBudget || 0) - (kpis.totalDisbursed || 0));
    const directJobsShare = jobsSnapshot.summary.totalJobs
      ? Math.round((jobsSnapshot.summary.totalDirectJobs / jobsSnapshot.summary.totalJobs) * 100)
      : 0;
    const femaleJobsShare = jobsSnapshot.summary.totalJobs
      ? Math.round((jobsSnapshot.summary.totalFemale / jobsSnapshot.summary.totalJobs) * 100)
      : 0;

    const topConstituency = projectsByConstituency?.[0];
    const topCounty = projectsByCounty?.[0];
    const topSector = [...(absorptionBySector || [])]
      .sort((a, b) => (b.contracted || 0) - (a.contracted || 0))[0];

    return {
      deliveryHealth,
      completionRate,
      atRiskCount: atRiskProjects.length,
      pipelineCount: pipelineProjects.length,
      disbursementGap,
      directJobsShare,
      femaleJobsShare,
      topConstituency,
      topCounty,
      topSector,
    };
  }, [filteredProjects, kpis.totalBudget, kpis.totalDisbursed, projectsByConstituency, projectsByCounty, absorptionBySector, jobsSnapshot]);

  const isLight = theme.palette.mode === 'light';
  const ui = {
    elevatedShadow: isLight
      ? '0 1px 6px rgba(0,0,0,0.06)'
      : '0 4px 20px rgba(0, 0, 0, 0.15), 0 -2px 10px rgba(0, 0, 0, 0.1)',
  };

  const filteredProjectCount = filteredProjects.length;
  const disbursedSharePct =
    kpis.totalBudget > 0 ? Math.round((kpis.totalDisbursed / kpis.totalBudget) * 100) : 0;

  const animTotalProjects = useCountUp(kpis.totalProjects);
  const animTotalBudget = useCountUp(Math.round(kpis.totalBudget || 0));
  const animAbsorption = useCountUp(kpis.absorptionRate || 0);
  const animOverallProgress = useCountUp(overallProgress || 0);

  return (
    <Box
      sx={{
        // Bleed into MainLayout outlet padding so KPI + chart cards use the full main column width
        width: {
          xs: `calc(100% + ${theme.spacing(1.5)})`,
          sm: `calc(100% + ${theme.spacing(2)})`,
          md: `calc(100% + ${theme.spacing(2.5)})`,
        },
        maxWidth: 'none',
        boxSizing: 'border-box',
        overflowX: 'hidden',
        mx: { xs: -0.75, sm: -1, md: -1.25 },
        px: 0,
        py: { xs: 1, sm: 1.25, md: 1.5 },
        background: theme.palette.mode === 'dark'
          ? `linear-gradient(135deg, ${colors.primary[900]} 0%, ${colors.primary[800]} 50%, ${colors.primary[900]} 100%)`
          : 'linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)',
        minHeight: '100vh',
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
          px: { xs: 0.75, sm: 1, md: 1.25 },
          mb: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5, flexWrap: 'wrap' }}>
          <Box
            sx={{
              width: 3,
              height: 28,
              background: `linear-gradient(180deg, ${colors.blueAccent[500]}, ${colors.greenAccent[500]})`,
              borderRadius: 1.5,
              mt: 0.25,
            }}
          />
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                background: `linear-gradient(135deg, ${colors.blueAccent[500]}, ${colors.greenAccent[500]})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em',
                fontSize: { xs: '1.1rem', md: '1.35rem' },
                lineHeight: 1.2,
              }}
            >
              Summary Statistics
            </Typography>
            <Typography
              variant="body2"
              sx={{
                mt: 0.25,
                color: colors.grey[300],
                maxWidth: 720,
                fontSize: '0.8rem',
                lineHeight: 1.4,
              }}
            >
              Executive overview: Track how projects, budgets, jobs, and geographic coverage are performing across the county in real-time.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label="Project By Status"
              size="small"
              sx={{
                bgcolor: colors.orange[600],
                color: 'white',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.7rem',
                height: 24,
                '&:hover': { bgcolor: colors.orange[700], transform: 'scale(1.05)' },
                transition: 'all 0.2s ease',
              }}
              onClick={() => navigate('/project-by-status-dashboard')}
            />
            <Chip
              label="Finance"
              size="small"
              sx={{
                bgcolor: colors.blueAccent[600],
                color: 'white',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.7rem',
                height: 24,
                '&:hover': { bgcolor: colors.blueAccent[700], transform: 'scale(1.05)' },
                transition: 'all 0.2s ease',
              }}
              onClick={() => navigate('/finance-dashboard')}
            />
            <Chip
              label="Jobs & Impact"
              size="small"
              sx={{
                bgcolor: colors.greenAccent[600],
                color: 'white',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.7rem',
                height: 24,
                '&:hover': { bgcolor: colors.greenAccent[700], transform: 'scale(1.05)' },
                transition: 'all 0.2s ease',
              }}
              onClick={() => navigate('/jobs-dashboard')}
            />
          </Box>
        </Box>

        {/* Filters - Collapsible at Top */}
        <Card
          sx={{
            borderRadius: 2,
            bgcolor: theme.palette.mode === 'dark' ? colors.primary[400] : '#ffffff',
            mb: 1,
            border: `1px solid ${theme.palette.mode === 'dark' ? colors.blueAccent[700] : 'rgba(0,0,0,0.08)'}`,
            boxShadow: `0 1px 4px ${colors.blueAccent[500]}10`,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 0.75,
              minHeight: 32,
              cursor: 'pointer',
              '&:hover': {
                bgcolor: theme.palette.mode === 'dark' ? colors.primary[500] : 'rgba(0,0,0,0.02)',
              },
            }}
            onClick={() => setFiltersExpanded(!filtersExpanded)}
          >
            <Box display="flex" alignItems="center" gap={0.5}>
              <FilterIcon sx={{ color: colors.blueAccent[500], fontSize: 14 }} />
              <Typography variant="caption" sx={{ color: colors.grey[100], fontWeight: 600, fontSize: '0.7rem' }}>
                Filters
              </Typography>
              {Object.values(filters).some((f) => f) && (
                <Chip
                  label={`${Object.values(filters).filter((f) => f).length} active`}
                  size="small"
                  sx={{
                    height: 16,
                    fontSize: '0.6rem',
                    bgcolor: colors.blueAccent[600],
                    color: 'white',
                    '& .MuiChip-label': {
                      px: 0.5,
                    },
                  }}
                />
              )}
            </Box>
            <IconButton size="small" sx={{ p: 0.25, width: 20, height: 20 }}>
              {filtersExpanded ? (
                <ExpandLessIcon sx={{ color: colors.grey[300], fontSize: 16 }} />
              ) : (
                <ExpandMoreIcon sx={{ color: colors.grey[300], fontSize: 16 }} />
              )}
            </IconButton>
          </Box>
          <Collapse in={filtersExpanded}>
            <CardContent sx={{ p: 1.5, pt: 0, '&:last-child': { pb: 1.5 } }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'stretch', sm: 'center' },
                  gap: 1,
                  width: '100%',
                  minWidth: 0,
                }}
              >
                <FormControl
                  size="small"
                  fullWidth
                  sx={{
                    flex: { xs: 'none', sm: '1 1 0%' },
                    minWidth: { sm: 0 },
                  }}
                >
                  <InputLabel sx={{ fontSize: '0.75rem' }}>Department</InputLabel>
                  <Select
                    value={filters.department}
                    label="Department"
                    onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                    sx={{ fontSize: '0.8rem', height: '32px' }}
                  >
                    <MenuItem value="" sx={{ fontSize: '0.8rem' }}>All Departments</MenuItem>
                    {Array.from(new Set(allProjects.map((p) => p.department))).filter(Boolean).map((dept) => (
                      <MenuItem key={dept} value={dept} sx={{ fontSize: '0.8rem' }}>
                        {dept}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl
                  size="small"
                  fullWidth
                  sx={{
                    flex: { xs: 'none', sm: '1 1 0%' },
                    minWidth: { sm: 0 },
                  }}
                >
                  <InputLabel sx={{ fontSize: '0.75rem' }}>Directorate</InputLabel>
                  <Select
                    value={filters.directorate}
                    label="Directorate"
                    onChange={(e) => setFilters({ ...filters, directorate: e.target.value })}
                    sx={{ fontSize: '0.8rem', height: '32px' }}
                  >
                    <MenuItem value="" sx={{ fontSize: '0.8rem' }}>All Directorates</MenuItem>
                    {Array.from(new Set(allProjects.map((p) => p.directorate))).filter(Boolean).map((dir) => (
                      <MenuItem key={dir} value={dir} sx={{ fontSize: '0.8rem' }}>
                        {dir}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl
                  size="small"
                  fullWidth
                  sx={{
                    flex: { xs: 'none', sm: '1 1 0%' },
                    minWidth: { sm: 0 },
                  }}
                >
                  <InputLabel sx={{ fontSize: '0.75rem' }}>Financial Year</InputLabel>
                  <Select
                    value={filters.financialYear}
                    label="Financial Year"
                    onChange={(e) => setFilters({ ...filters, financialYear: e.target.value })}
                    sx={{ fontSize: '0.8rem', height: '32px' }}
                  >
                    <MenuItem value="" sx={{ fontSize: '0.8rem' }}>All Years</MenuItem>
                    {Array.from(new Set(allProjects.map((p) => p.financialYear))).filter(Boolean).map((fy) => (
                      <MenuItem key={fy} value={fy} sx={{ fontSize: '0.8rem' }}>
                        {fy}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl
                  size="small"
                  fullWidth
                  sx={{
                    flex: { xs: 'none', sm: '1 1 0%' },
                    minWidth: { sm: 0 },
                  }}
                >
                  <InputLabel sx={{ fontSize: '0.75rem' }}>Status</InputLabel>
                  <Select
                    value={filters.status}
                    label="Status"
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    sx={{ fontSize: '0.8rem', height: '32px' }}
                  >
                    <MenuItem value="" sx={{ fontSize: '0.8rem' }}>All Statuses</MenuItem>
                    {Array.from(new Set(allProjects.map((p) => p.Status))).filter(Boolean).map((status) => (
                      <MenuItem key={status} value={status} sx={{ fontSize: '0.8rem' }}>
                        {status}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Chip
                  label={`${filteredProjectCount} project${filteredProjectCount !== 1 ? 's' : ''}`}
                  size="small"
                  sx={{
                    flexShrink: 0,
                    alignSelf: { xs: 'flex-start', sm: 'center' },
                    bgcolor: colors.blueAccent[600],
                    color: 'white',
                    fontSize: '0.7rem',
                    height: '24px',
                  }}
                />
              </Box>
            </CardContent>
          </Collapse>
        </Card>
      </Box>

      {/* KPI row: full width of main pane (outside outlet padding) */}
      <Box
        sx={{
          mb: 1,
          mt: 0,
          width: '100%',
          display: 'flex',
          flexWrap: 'nowrap',
          gap: 1,
          pb: 1,
          px: '1rem',
          overflowX: { xs: 'auto', sm: 'hidden' },
          boxSizing: 'border-box',
            '&::-webkit-scrollbar': {
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: isLight ? colors.grey[100] : colors.grey[800],
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: isLight ? colors.grey[400] : colors.grey[600],
              borderRadius: '4px',
              '&:hover': {
                background: isLight ? colors.grey[500] : colors.grey[500],
              },
            },
          }}
        >
          <Box
            sx={{
              flex: { xs: '0 0 auto', sm: '1 1 0%' },
              minWidth: { xs: 160, sm: 0 },
              maxWidth: { sm: '100%' },
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
            }}
          >
            <Card
              sx={{
                flex: 1,
                width: '100%',
                minHeight: '100%',
                background: isLight
                  ? 'linear-gradient(135deg, #2196f3 0%, #42a5f5 100%)'
                  : `linear-gradient(135deg, ${colors.blueAccent[800]}, ${colors.blueAccent[700]})`,
                color: isLight ? 'white' : 'inherit',
                borderTop: `2px solid ${isLight ? '#1976d2' : colors.blueAccent[500]}`,
                boxShadow: ui.elevatedShadow,
                transition: 'all 0.2s ease-in-out',
                borderRadius: '8px',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: isLight ? '0 4px 12px rgba(33, 150, 243, 0.3)' : '0 4px 16px rgba(0, 0, 0, 0.25)',
                },
              }}
            >
              <CardContent sx={{ p: 0.75, '&:last-child': { pb: 0.75 }, pt: 0.75 }}>
                <Box display="flex" alignItems="center" gap={0.75}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="caption" sx={{ color: isLight ? 'rgba(255, 255, 255, 0.9)' : colors.grey[100], fontWeight: 600, fontSize: '0.65rem', display: 'block' }}>
                      Total Projects
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{
                        color: isLight ? '#ffffff' : '#fff',
                        fontWeight: 800,
                        fontSize: { xs: '0.95rem', sm: '1.15rem', md: '1.35rem' },
                        mb: 0,
                        lineHeight: 1.15,
                      }}
                    >
                      {animTotalProjects}
                    </Typography>
                    <Typography variant="caption" component="div" sx={{ color: isLight ? 'rgba(255, 255, 255, 0.9)' : colors.grey[300], fontWeight: 600, fontSize: '1.1rem', mt: 0.125, lineHeight: 1.2 }}>
                      From imported registry
                    </Typography>
                  </Box>
                  <AssessmentIcon sx={{ color: isLight ? 'rgba(255, 255, 255, 0.9)' : colors.blueAccent[500], fontSize: '2rem', flexShrink: 0 }} />
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Box
            sx={{
              flex: { xs: '0 0 auto', sm: '1 1 0%' },
              minWidth: { xs: 160, sm: 0 },
              maxWidth: { sm: '100%' },
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
            }}
          >
            <Card
              sx={{
                flex: 1,
                width: '100%',
                minHeight: '100%',
                background: isLight
                  ? 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)'
                  : `linear-gradient(135deg, ${colors.greenAccent[800]}, ${colors.greenAccent[700]})`,
                color: isLight ? 'white' : 'inherit',
                borderTop: `2px solid ${isLight ? '#388e3c' : colors.greenAccent[500]}`,
                boxShadow: ui.elevatedShadow,
                transition: 'all 0.2s ease-in-out',
                borderRadius: '8px',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: isLight ? '0 4px 12px rgba(76, 175, 80, 0.3)' : '0 4px 16px rgba(0, 0, 0, 0.25)',
                },
              }}
            >
              <CardContent sx={{ p: 0.75, '&:last-child': { pb: 0.75 }, pt: 0.75 }}>
                <Box display="flex" alignItems="center" gap={0.75}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="caption" sx={{ color: isLight ? 'rgba(255, 255, 255, 0.9)' : colors.grey[100], fontWeight: 600, fontSize: '0.65rem', display: 'block' }}>
                      Total Budget
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{
                        color: isLight ? '#ffffff' : '#fff',
                        fontWeight: 800,
                        fontSize: { xs: '0.95rem', sm: '1.05rem', md: '1.2rem' },
                        mb: 0,
                        lineHeight: 1.15,
                      }}
                    >
                      {formatCurrency(animTotalBudget)}
                    </Typography>
                    <Typography variant="caption" component="div" sx={{ color: isLight ? 'rgba(255, 255, 255, 0.9)' : colors.grey[300], fontWeight: 600, fontSize: '1.1rem', mt: 0.125, lineHeight: 1.2 }}>
                      {disbursedSharePct}% disbursed
                    </Typography>
                  </Box>
                  <AttachMoneyIcon sx={{ color: isLight ? 'rgba(255, 255, 255, 0.9)' : colors.greenAccent[500], fontSize: '2rem', flexShrink: 0 }} />
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Box
            sx={{
              flex: { xs: '0 0 auto', sm: '1 1 0%' },
              minWidth: { xs: 160, sm: 0 },
              maxWidth: { sm: '100%' },
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
            }}
          >
            <Card
              sx={{
                flex: 1,
                width: '100%',
                minHeight: '100%',
                background: isLight
                  ? 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)'
                  : `linear-gradient(135deg, ${colors.yellowAccent[800]}, ${colors.yellowAccent[700]})`,
                color: isLight ? 'white' : 'inherit',
                borderTop: `2px solid ${isLight ? '#f57c00' : colors.yellowAccent[500]}`,
                boxShadow: ui.elevatedShadow,
                transition: 'all 0.2s ease-in-out',
                borderRadius: '8px',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: isLight ? '0 4px 12px rgba(255, 152, 0, 0.3)' : '0 4px 16px rgba(0, 0, 0, 0.25)',
                },
              }}
            >
              <CardContent sx={{ p: 0.75, '&:last-child': { pb: 0.75 }, pt: 0.75 }}>
                <Box display="flex" alignItems="flex-start" gap={0.75}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="caption" sx={{ color: isLight ? 'rgba(255, 255, 255, 0.9)' : colors.grey[100], fontWeight: 600, fontSize: '0.65rem', display: 'block' }}>
                      Disbursement rate
                    </Typography>
                    <Typography variant="h5" sx={{ color: isLight ? '#ffffff' : '#fff', fontWeight: 800, fontSize: '2rem', mb: 0.25, lineHeight: 1.15 }}>
                      {animAbsorption}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={kpis.absorptionRate}
                      sx={{
                        height: 5,
                        borderRadius: 8,
                        mb: 0.5,
                        bgcolor: isLight ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.2)',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 8,
                          background:
                            kpis.absorptionRate >= 80
                              ? `linear-gradient(90deg, ${colors.greenAccent[500]}, ${colors.greenAccent[300]})`
                              : kpis.absorptionRate >= 50
                                ? `linear-gradient(90deg, #fff, rgba(255,255,255,0.85))`
                                : `linear-gradient(90deg, ${colors.redAccent[500]}, ${colors.redAccent[300]})`,
                        },
                      }}
                    />
                    <Typography variant="caption" component="div" sx={{ color: isLight ? 'rgba(255, 255, 255, 0.9)' : colors.grey[300], fontWeight: 600, fontSize: '1.1rem', lineHeight: 1.2 }}>
                      Budget vs disbursed
                    </Typography>
                  </Box>
                  <TimelineIcon sx={{ color: isLight ? 'rgba(255, 255, 255, 0.9)' : colors.yellowAccent[400], fontSize: '2rem', flexShrink: 0, mt: 0.25 }} />
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Box
            sx={{
              flex: { xs: '0 0 auto', sm: '1 1 0%' },
              minWidth: { xs: 160, sm: 0 },
              maxWidth: { sm: '100%' },
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
            }}
          >
            <Card
              sx={{
                flex: 1,
                width: '100%',
                minHeight: '100%',
                background: isLight
                  ? 'linear-gradient(135deg, #f44336 0%, #e57373 100%)'
                  : `linear-gradient(135deg, ${colors.redAccent[800]}, ${colors.redAccent[700]})`,
                color: isLight ? 'white' : 'inherit',
                borderTop: `2px solid ${isLight ? '#d32f2f' : colors.redAccent[500]}`,
                boxShadow: ui.elevatedShadow,
                transition: 'all 0.2s ease-in-out',
                borderRadius: '8px',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: isLight ? '0 4px 12px rgba(244, 67, 54, 0.3)' : '0 4px 16px rgba(0, 0, 0, 0.25)',
                },
              }}
            >
              <CardContent sx={{ p: 0.75, '&:last-child': { pb: 0.75 }, pt: 0.75 }}>
                <Box display="flex" alignItems="flex-start" gap={0.75}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="caption" sx={{ color: isLight ? 'rgba(255, 255, 255, 0.9)' : colors.grey[100], fontWeight: 600, fontSize: '0.65rem', display: 'block' }}>
                      Overall progress
                    </Typography>
                    <Typography variant="h5" sx={{ color: isLight ? '#ffffff' : '#fff', fontWeight: 800, fontSize: '2rem', mb: 0.25, lineHeight: 1.15 }}>
                      {animOverallProgress}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={overallProgress}
                      sx={{
                        height: 5,
                        borderRadius: 8,
                        mb: 0.5,
                        bgcolor: isLight ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.2)',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 8,
                          background: `linear-gradient(90deg, ${colors.greenAccent[500]}, ${colors.blueAccent[400]})`,
                        },
                      }}
                    />
                    <Typography variant="caption" component="div" sx={{ color: isLight ? 'rgba(255, 255, 255, 0.9)' : colors.grey[300], fontWeight: 600, fontSize: '1.1rem', lineHeight: 1.2 }}>
                      Avg. completion
                    </Typography>
                  </Box>
                  <TrendingUpIcon sx={{ color: isLight ? 'rgba(255, 255, 255, 0.9)' : colors.redAccent[400], fontSize: '2rem', flexShrink: 0, mt: 0.25 }} />
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

      {/* Below KPIs: two columns (50% / 50%), equal row heights via flex stretch */}
      <Grid
        container
        rowSpacing={2.5}
        columnSpacing={{ xs: 1, sm: 1.5, md: 2 }}
        alignItems="stretch"
        sx={{
          mb: 2,
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
          mx: 0,
          px: '1rem',
        }}
      >
        <Grid size={{ xs: 12, sm: 6, md: 6 }} sx={{ display: 'flex', minWidth: 0 }}>
          <Card
            sx={{
              borderRadius: 4,
              width: '100%',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
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
            <CardContent sx={{ p: 1.5, pb: 0.5, flex: 1, display: 'flex', flexDirection: 'column', '&:last-child': { pb: 0.5 } }}>
              <Typography sx={{ color: colors.grey[100], fontWeight: 700, mb: 1.2, fontSize: '0.95rem' }}>
                Executive Briefing
              </Typography>
              <Box display="flex" gap={0.8} flexWrap="wrap" mb={1.2}>
                <Chip size="small" label={`Delivery health: ${executiveBrief.deliveryHealth}%`} sx={{ bgcolor: colors.greenAccent[700], color: 'white', fontWeight: 700 }} />
                <Chip size="small" label={`Completed: ${executiveBrief.completionRate}%`} sx={{ bgcolor: colors.blueAccent[700], color: 'white', fontWeight: 700 }} />
                <Chip size="small" label={`At risk: ${executiveBrief.atRiskCount}`} sx={{ bgcolor: colors.redAccent[700], color: 'white', fontWeight: 700 }} />
                <Chip size="small" label={`Pipeline: ${executiveBrief.pipelineCount}`} sx={{ bgcolor: colors.orange[700], color: 'white', fontWeight: 700 }} />
              </Box>
              <Box sx={{ mb: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.4}>
                  <Typography variant="caption" sx={{ color: colors.grey[300], fontSize: '0.72rem' }}>
                    Budget / Disbursed
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.grey[100], fontWeight: 700, fontSize: '0.72rem' }}>
                    {kpis.absorptionRate}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={kpis.absorptionRate}
                  sx={{
                    height: 7,
                    borderRadius: 8,
                    bgcolor: colors.primary[300],
                    '& .MuiLinearProgress-bar': {
                      background: `linear-gradient(90deg, ${colors.blueAccent[500]}, ${colors.greenAccent[500]})`,
                    },
                  }}
                />
              </Box>
              <Typography variant="caption" sx={{ color: colors.grey[300], fontSize: '0.72rem' }}>
                Disbursement gap: <strong>{formatCurrency(executiveBrief.disbursementGap)}</strong> pending against current allocated budget.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 6 }} sx={{ display: 'flex', minWidth: 0, alignSelf: 'stretch' }}>
          <Card
            sx={{
              borderRadius: 4,
              width: '100%',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignSelf: 'stretch',
              minHeight: '100%',
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
            <CardContent
              sx={{
                p: 1.5,
                pb: 0.5,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
                '&:last-child': { pb: 0.5 },
              }}
            >
              <Typography sx={{ color: colors.grey[100], fontWeight: 700, mb: 1.2, fontSize: '0.95rem' }}>
                Cross-Dashboard Highlights
              </Typography>
              <Stack spacing={0.9} sx={{ flex: 1, minHeight: 0 }}>
                <Typography variant="caption" sx={{ color: colors.grey[300], fontSize: '0.72rem' }}>
                  Top constituency: <strong>{executiveBrief.topConstituency?.name || 'N/A'}</strong> ({executiveBrief.topConstituency?.value || 0} projects)
                </Typography>
                <Typography variant="caption" sx={{ color: colors.grey[300], fontSize: '0.72rem' }}>
                  Top county: <strong>{executiveBrief.topCounty?.name || 'N/A'}</strong> ({executiveBrief.topCounty?.value || 0} projects)
                </Typography>
                <Typography variant="caption" sx={{ color: colors.grey[300], fontSize: '0.72rem' }}>
                  Largest sector envelope: <strong>{executiveBrief.topSector?.name || 'N/A'}</strong> ({formatCurrency(executiveBrief.topSector?.contracted || 0)})
                </Typography>
                <Box display="flex" gap={0.8} flexWrap="wrap" mt={0.2}>
                  <Chip size="small" label={`Direct jobs: ${executiveBrief.directJobsShare}%`} sx={{ bgcolor: colors.greenAccent[700], color: 'white', fontWeight: 700 }} />
                  <Chip size="small" label={`Female jobs: ${executiveBrief.femaleJobsShare}%`} sx={{ bgcolor: colors.purpleAccent ? colors.purpleAccent[500] : colors.blueAccent[700], color: 'white', fontWeight: 700 }} />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Projects by status */}
        <Grid size={{ xs: 12, sm: 6, md: 6 }} sx={{ display: 'flex', minWidth: 0 }}>
          <Card
            sx={{
              borderRadius: 4,
              width: '100%',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
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
            <CardContent sx={{ p: 1.5, pb: 0.5, border: 0, outline: 0, boxShadow: 'none', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, '&:last-child': { pb: 0.5 } }}>
              <Box display="flex" alignItems="center" gap={1} mb={0.75}>
                <Box
                  sx={{
                    p: 0.75,
                    borderRadius: 1.5,
                    background: `linear-gradient(135deg, ${colors.blueAccent[600]}, ${colors.blueAccent[400]})`,
                  }}
                >
                  <AssessmentIcon sx={{ color: 'white', fontSize: 18 }} />
                </Box>
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: colors.grey[100],
                      fontWeight: 700,
                      fontSize: '1rem',
                    }}
                  >
                    Projects by Status
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: colors.grey[400],
                      fontSize: '0.7rem',
                    }}
                  >
                    Snapshot from the imported project registry
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ height: 320, mt: 0, position: 'relative' }}>
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

        {/* Disbursement by sector */}
        <Grid size={{ xs: 12, sm: 6, md: 6 }} sx={{ display: 'flex', minWidth: 0 }}>
          <Card
            sx={{
              borderRadius: 4,
              width: '100%',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
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
            <CardContent sx={{ p: 1.5, pb: 0.5, border: 0, outline: 0, boxShadow: 'none', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, '&:last-child': { pb: 0.5 } }}>
              <Box display="flex" alignItems="center" gap={1} mb={0.75}>
                <Box
                  sx={{
                    p: 0.75,
                    borderRadius: 1.5,
                    background: `linear-gradient(135deg, ${colors.greenAccent[600]}, ${colors.greenAccent[400]})`,
                  }}
                >
                  <AttachMoneyIcon sx={{ color: 'white', fontSize: 18 }} />
                </Box>
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: colors.grey[100],
                      fontWeight: 700,
                      fontSize: '1rem',
                    }}
                  >
                    Disbursement by Sector
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: colors.grey[400],
                      fontSize: '0.7rem',
                    }}
                  >
                    Allocated vs. disbursed (live data)
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ height: 320, mt: 0, position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={absorptionBySector}
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
                        border: `1px solid ${colors.blueAccent[700]}`,
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
        <Grid size={{ xs: 12, sm: 6, md: 6 }} sx={{ display: 'flex', minWidth: 0 }}>
          <Card
            sx={{
              borderRadius: 4,
              width: '100%',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
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
            <CardContent sx={{ p: 1.5, pb: 0.5, border: 0, outline: 0, boxShadow: 'none', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, '&:last-child': { pb: 0.5 } }}>
              <Box display="flex" alignItems="center" gap={1} mb={0.75}>
                <Box
                  sx={{
                    p: 0.75,
                    borderRadius: 1.5,
                    background: `linear-gradient(135deg, ${colors.blueAccent[600]}, ${colors.blueAccent[400]})`,
                  }}
                >
                  <WorkIcon sx={{ color: 'white', fontSize: 18 }} />
                </Box>
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: colors.grey[100],
                      fontWeight: 700,
                      fontSize: '1rem',
                    }}
                  >
                    Jobs Created Snapshot
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: colors.grey[400],
                      fontSize: '0.7rem',
                    }}
                  >
                    From Jobs feature (database summary)
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
                  {jobsSnapshot.summary.totalJobs} jobs
                </Typography>
                <Box display="flex" gap={1} mt={1} flexWrap="wrap">
                  <Chip
                    size="small"
                    icon={<GroupIcon sx={{ fontSize: 14 }} />}
                    label={`Male: ${jobsSnapshot.summary.totalMale}`}
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
                    label={`Female: ${jobsSnapshot.summary.totalFemale}`}
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
                    label={`Direct: ${jobsSnapshot.summary.totalDirectJobs}`}
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
                    label={`Indirect: ${jobsSnapshot.summary.totalIndirectJobs}`}
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
              <Box sx={{ height: 320, mt: 1.5, position: 'relative', flexShrink: 0 }}>
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
                        border: `1px solid ${colors.blueAccent[700]}`,
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

        {/* Funding Sources */}
        <Grid size={{ xs: 12, sm: 6, md: 6 }} sx={{ display: 'flex', minWidth: 0 }}>
          <Card
            sx={{
              borderRadius: 4,
              width: '100%',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
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
            <CardContent sx={{ p: 1.5, pb: 0.5, border: 0, outline: 0, boxShadow: 'none', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, '&:last-child': { pb: 0.5 } }}>
              <Box display="flex" alignItems="center" gap={1} mb={0.75}>
                <Box
                  sx={{
                    p: 0.75,
                    borderRadius: 1.5,
                    background: `linear-gradient(135deg, ${colors.blueAccent[600]}, ${colors.blueAccent[400]})`,
                  }}
                >
                  <BusinessIcon sx={{ color: 'white', fontSize: 18 }} />
                </Box>
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: colors.grey[100],
                      fontWeight: 700,
                      fontSize: '1rem',
                    }}
                  >
                    Funding Sources
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: colors.grey[400],
                      fontSize: '0.7rem',
                    }}
                  >
                    Budget allocation by source
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ height: 320, mt: 0, position: 'relative' }}>
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

        {/* Sites by Status */}
        <Grid size={{ xs: 12, sm: 6, md: 6 }} sx={{ display: 'flex', minWidth: 0 }}>
          <Card
            sx={{
              borderRadius: 4,
              width: '100%',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
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
            <CardContent sx={{ p: 1.5, pb: 0.5, border: 0, outline: 0, boxShadow: 'none', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, '&:last-child': { pb: 0.5 } }}>
              <Box display="flex" alignItems="center" gap={1} mb={0.75}>
                <Box
                  sx={{
                    p: 0.75,
                    borderRadius: 1.5,
                    background: `linear-gradient(135deg, ${colors.blueAccent[600]}, ${colors.blueAccent[400]})`,
                  }}
                >
                  <LocationOnIcon sx={{ color: 'white', fontSize: 18 }} />
                </Box>
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: colors.grey[100],
                      fontWeight: 700,
                      fontSize: '1rem',
                    }}
                  >
                    Sites by Status
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: colors.grey[400],
                      fontSize: '0.7rem',
                    }}
                  >
                    Derived from live project statuses
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ height: 320, mt: 0, position: 'relative' }}>
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

        <Grid size={{ xs: 12, sm: 6, md: 6 }} sx={{ display: 'flex', minWidth: 0 }}>
          <Card
            sx={{
              borderRadius: 4,
              width: '100%',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
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
            <CardContent sx={{ p: 1.5, pb: 0.5, border: 0, outline: 0, boxShadow: 'none', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, '&:last-child': { pb: 0.5 } }}>
              <Box display="flex" alignItems="center" gap={1} mb={0.75}>
                <Box
                  sx={{
                    p: 0.75,
                    borderRadius: 1.5,
                    background: `linear-gradient(135deg, ${colors.greenAccent[600]}, ${colors.greenAccent[400]})`,
                  }}
                >
                  <LocationOnIcon sx={{ color: 'white', fontSize: 18 }} />
                </Box>
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: colors.grey[100],
                      fontWeight: 700,
                      fontSize: '1rem',
                    }}
                  >
                    Recent Implementation Footprint
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: colors.grey[400],
                      fontSize: '0.7rem',
                    }}
                  >
                    Sample of how projects and sites are distributed across wards
                  </Typography>
                </Box>
              </Box>
              <Box
                sx={{
                  flex: 1,
                  minHeight: 0,
                  mt: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                  overflow: 'auto',
                }}
              >
                {recentFootprintSites.map((site, index) => (
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

