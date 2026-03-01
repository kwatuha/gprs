import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    CardHeader,
    CircularProgress,
    Alert,
    Tabs,
    Tab,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    useTheme,
    Fade,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip
} from '@mui/material';
import {
    TrendingUp,
    Assessment,
    Business,
    AttachMoney,
    CheckCircle,
    Schedule,
    Analytics as AnalyticsIcon,
    BarChart as BarChartIcon,
    PieChart as PieChartIcon,
    ShowChart
} from '@mui/icons-material';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import projectService from '../api/projectService';
import reportsService from '../api/reportsService';
import { getProjectStatusBackgroundColor } from '../utils/projectStatusColors';
import { groupStatusesByNormalized } from '../utils/projectStatusNormalizer';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#FF6B6B', '#6B66FF'];

export default function ProjectAnalyticsPage() {
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [months, setMonths] = useState(12);
    const [activeTab, setActiveTab] = useState(0);
    
    // Data states
    const [summary, setSummary] = useState(null);
    const [projectTrends, setProjectTrends] = useState([]);
    const [financialTrends, setFinancialTrends] = useState([]);
    const [departmentData, setDepartmentData] = useState([]);
    const [statusDistribution, setStatusDistribution] = useState([]);
    const [budgetByStatus, setBudgetByStatus] = useState([]);
    const [completionTrends, setCompletionTrends] = useState([]);
    const [departmentPerformance, setDepartmentPerformance] = useState([]);

    useEffect(() => {
        loadAnalytics();
    }, [months]);

    const loadAnalytics = async () => {
        try {
            setLoading(true);
            
            // Fetch all analytics data in parallel
            const [
                statusCounts,
                departmentSummary,
                yearlyTrends,
                financialStatus,
                projectStatusSummary
            ] = await Promise.all([
                projectService.analytics.getProjectStatusCounts().catch((err) => { console.error('Error fetching status counts:', err); return []; }),
                reportsService.getDepartmentSummaryReport({}).catch((err) => { console.error('Error fetching department summary:', err); return []; }),
                reportsService.getYearlyTrendsReport({}).catch((err) => { console.error('Error fetching yearly trends:', err); return []; }),
                reportsService.getFinancialStatusByProjectStatus({}).catch((err) => { console.error('Error fetching financial status:', err); return []; }),
                reportsService.getProjectStatusSummary({}).catch((err) => { console.error('Error fetching project status summary:', err); return []; })
            ]);

            // Debug: Log received data
            console.log('Analytics data received:', {
                statusCounts: statusCounts?.length || 0,
                departmentSummary: departmentSummary?.length || 0,
                yearlyTrends: yearlyTrends?.length || 0,
                financialStatus: financialStatus?.length || 0,
                projectStatusSummary: projectStatusSummary?.length || 0
            });

            // Process and set summary data
            const totalProjects = departmentSummary.reduce((sum, dept) => sum + (dept.numProjects || 0), 0);
            const completedProjects = statusCounts.find(item => {
                const normalized = item.status?.toLowerCase();
                return normalized === 'completed' || normalized === 'done' || normalized === 'finished';
            })?.count || 0;
            
            const totalBudget = departmentSummary.reduce((sum, dept) => sum + (parseFloat(dept.allocatedBudget) || 0), 0);
            const totalPaid = departmentSummary.reduce((sum, dept) => sum + (parseFloat(dept.amountPaid) || 0), 0);
            const monthlyBudget = totalPaid / (months || 1);

            setSummary({
                totalProjects,
                completedProjects,
                totalBudget,
                monthlyBudget,
                totalPaid,
                totalDepartments: departmentSummary.length
            });

            // Process project trends
            // Backend /yearly-trends returns array with { name, projectCount, totalBudget, totalPaid }
            // Transform to expected format for project trends
            const trendsData = Array.isArray(yearlyTrends) ? yearlyTrends : (yearlyTrends?.projectPerformance || []);
            setProjectTrends(trendsData.map(item => ({
                name: item.name || item.year || 'Unknown',
                totalProjects: item.projectCount || item.totalProjects || 0,
                completedProjects: item.completedProjects || 0,
                completionRate: parseFloat(item.completionRate) || 0
            })));

            // Process financial trends
            // Backend /yearly-trends returns array with { name, projectCount, totalBudget, totalPaid }
            // Transform to expected format for financial trends
            const financialData = Array.isArray(yearlyTrends) ? yearlyTrends : (yearlyTrends?.financialTrends || []);
            setFinancialTrends(financialData.map(item => {
                const totalBudget = parseFloat(item.totalBudget) || 0;
                const totalPaid = parseFloat(item.totalPaid || item.totalExpenditure) || 0;
                const absorptionRate = totalBudget > 0 ? (totalPaid / totalBudget) * 100 : 0;
                return {
                    name: item.name || item.year || 'Unknown',
                    totalBudget: totalBudget,
                    totalExpenditure: totalPaid,
                    absorptionRate: parseFloat(absorptionRate.toFixed(2))
                };
            }));

            // Process department data
            setDepartmentData(departmentSummary.map(dept => ({
                name: dept.departmentAlias || dept.departmentName || 'Unknown',
                projects: dept.numProjects || 0,
                budget: parseFloat(dept.allocatedBudget) || 0,
                paid: parseFloat(dept.amountPaid) || 0,
                progress: parseFloat(dept.percentCompleted) || 0
            })));

            // Process status distribution
            const groupedStatuses = groupStatusesByNormalized(statusCounts, 'status', 'count');
            setStatusDistribution(groupedStatuses.map(item => ({
                name: item.name,
                value: item.value,
                color: getProjectStatusBackgroundColor(item.name)
            })));

            // Process budget by status
            const groupedBudget = groupStatusesByNormalized(financialStatus, 'status', 'totalBudget');
            setBudgetByStatus(groupedBudget.map(item => ({
                name: item.name,
                budget: parseFloat(item.value) || 0,
                color: getProjectStatusBackgroundColor(item.name)
            })));

            // Process completion trends
            const completionData = trendsData.map(item => ({
                name: item.name || item.year || 'Unknown',
                completionRate: parseFloat(item.completionRate) || 0,
                avgDuration: parseFloat(item.avgDuration) || 0
            }));
            setCompletionTrends(completionData);

            // Process department performance
            setDepartmentPerformance(departmentSummary.map(dept => ({
                name: dept.departmentAlias || dept.departmentName || 'Unknown',
                progress: parseFloat(dept.percentCompleted) || 0,
                budgetUtilization: parseFloat(dept.percentAbsorptionRate) || 0,
                healthScore: dept.healthScore || 0
            })));

        } catch (error) {
            console.error('Error loading analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value) => {
        if (value >= 1000000) {
            return `KSh ${(value / 1000000).toFixed(1)}M`;
        } else if (value >= 1000) {
            return `KSh ${(value / 1000).toFixed(0)}K`;
        } else {
            return `KSh ${value.toLocaleString()}`;
        }
    };

    if (loading) {
        return (
            <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                minHeight: '60vh',
                gap: 3,
                background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)'
            }}>
                <CircularProgress 
                    size={64} 
                    sx={{ 
                        color: 'primary.main',
                        '& .MuiCircularProgress-circle': {
                            strokeLinecap: 'round'
                        }
                    }} 
                />
                <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
                    Loading analytics...
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ 
            p: { xs: 2, sm: 3, md: 4 }, 
            maxWidth: '100%',
            background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
            minHeight: '100vh'
        }}>
            {/* Header */}
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                mb: 4,
                flexWrap: 'wrap',
                gap: 3,
                pb: 3,
                borderBottom: '2px solid',
                borderColor: 'divider'
            }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Box sx={{
                            p: 1.5,
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 14px rgba(102, 126, 234, 0.3)'
                        }}>
                            <AnalyticsIcon sx={{ color: 'white', fontSize: '2rem' }} />
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{ 
                                fontWeight: 700, 
                                mb: 0.5,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                fontSize: { xs: '1.75rem', md: '2.125rem' }
                            }}>
                                Project Analytics
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
                                Comprehensive project performance metrics and statistics
                            </Typography>
                        </Box>
                    </Box>
                </Box>
                <FormControl 
                    size="small" 
                    sx={{ 
                        minWidth: 200,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            backgroundColor: 'white',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            '&:hover': {
                                boxShadow: '0 4px 12px rgba(0,0,0,0.12)'
                            }
                        }
                    }}
                >
                    <InputLabel>Time Period</InputLabel>
                    <Select
                        value={months}
                        label="Time Period"
                        onChange={(e) => setMonths(e.target.value)}
                    >
                        <MenuItem value={6}>Last 6 months</MenuItem>
                        <MenuItem value={12}>Last 12 months</MenuItem>
                        <MenuItem value={24}>Last 24 months</MenuItem>
                        <MenuItem value={36}>Last 36 months</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {/* Summary Cards */}
            {summary && (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Fade in timeout={800}>
                            <Card sx={{ 
                                height: '100%',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                borderRadius: 3,
                                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.25)',
                                border: 'none',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                position: 'relative',
                                overflow: 'hidden',
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    width: '100px',
                                    height: '100px',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    borderRadius: '50%',
                                    transform: 'translate(30px, -30px)'
                                },
                                '&:hover': {
                                    boxShadow: '0 12px 32px rgba(102, 126, 234, 0.35)',
                                    transform: 'translateY(-4px) scale(1.02)'
                                }
                            }}>
                                <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                        <Box sx={{
                                            p: 1.5,
                                            borderRadius: 2,
                                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                            backdropFilter: 'blur(10px)'
                                        }}>
                                            <Business sx={{ fontSize: '1.75rem' }} />
                                        </Box>
                                    </Box>
                                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5, fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
                                        {summary.totalProjects || 0}
                                    </Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.875rem' }}>
                                        Total Projects
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Fade>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Fade in timeout={1000}>
                            <Card sx={{ 
                                height: '100%',
                                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                color: 'white',
                                borderRadius: 3,
                                boxShadow: '0 8px 24px rgba(245, 87, 108, 0.25)',
                                border: 'none',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                position: 'relative',
                                overflow: 'hidden',
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    width: '100px',
                                    height: '100px',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    borderRadius: '50%',
                                    transform: 'translate(30px, -30px)'
                                },
                                '&:hover': {
                                    boxShadow: '0 12px 32px rgba(245, 87, 108, 0.35)',
                                    transform: 'translateY(-4px) scale(1.02)'
                                }
                            }}>
                                <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                        <Box sx={{
                                            p: 1.5,
                                            borderRadius: 2,
                                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                            backdropFilter: 'blur(10px)'
                                        }}>
                                            <AttachMoney sx={{ fontSize: '1.75rem' }} />
                                        </Box>
                                    </Box>
                                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5, fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
                                        {formatCurrency(summary.totalBudget || 0)}
                                    </Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.875rem' }}>
                                        Total Budget
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Fade>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Fade in timeout={1200}>
                            <Card sx={{ 
                                height: '100%',
                                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                color: 'white',
                                borderRadius: 3,
                                boxShadow: '0 8px 24px rgba(79, 172, 254, 0.25)',
                                border: 'none',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                position: 'relative',
                                overflow: 'hidden',
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    width: '100px',
                                    height: '100px',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    borderRadius: '50%',
                                    transform: 'translate(30px, -30px)'
                                },
                                '&:hover': {
                                    boxShadow: '0 12px 32px rgba(79, 172, 254, 0.35)',
                                    transform: 'translateY(-4px) scale(1.02)'
                                }
                            }}>
                                <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                        <Box sx={{
                                            p: 1.5,
                                            borderRadius: 2,
                                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                            backdropFilter: 'blur(10px)'
                                        }}>
                                            <TrendingUp sx={{ fontSize: '1.75rem' }} />
                                        </Box>
                                    </Box>
                                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5, fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
                                        {formatCurrency(summary.monthlyBudget || 0)}
                                    </Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.875rem' }}>
                                        Monthly Budget
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Fade>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Fade in timeout={1400}>
                            <Card sx={{ 
                                height: '100%',
                                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                                color: 'white',
                                borderRadius: 3,
                                boxShadow: '0 8px 24px rgba(67, 233, 123, 0.25)',
                                border: 'none',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                position: 'relative',
                                overflow: 'hidden',
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    width: '100px',
                                    height: '100px',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    borderRadius: '50%',
                                    transform: 'translate(30px, -30px)'
                                },
                                '&:hover': {
                                    boxShadow: '0 12px 32px rgba(67, 233, 123, 0.35)',
                                    transform: 'translateY(-4px) scale(1.02)'
                                }
                            }}>
                                <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                        <Box sx={{
                                            p: 1.5,
                                            borderRadius: 2,
                                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                            backdropFilter: 'blur(10px)'
                                        }}>
                                            <CheckCircle sx={{ fontSize: '1.75rem' }} />
                                        </Box>
                                    </Box>
                                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5, fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
                                        {summary.completedProjects || 0}
                                    </Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.875rem' }}>
                                        {summary.totalProjects > 0 
                                            ? `${Math.round((summary.completedProjects / summary.totalProjects) * 100)}% Completion Rate`
                                            : 'No Projects'
                                        }
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Fade>
                    </Grid>
                </Grid>
            )}

            {/* Tabbed Analytics Sections */}
            <Card sx={{ 
                background: 'white',
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                borderRadius: 4,
                overflow: 'hidden',
                border: '1px solid rgba(0,0,0,0.06)'
            }}>
                <Tabs 
                    value={activeTab} 
                    onChange={(e, newValue) => setActiveTab(newValue)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
                        px: 2,
                        pt: 1,
                        // Remove bottom border to eliminate line clutter
                        borderBottom: 'none',
                        position: 'relative',
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: '1px',
                            background: 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.08) 50%, transparent 100%)'
                        },
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontWeight: 600,
                            minHeight: 64,
                            fontSize: '0.95rem',
                            color: 'text.secondary',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            borderRadius: '12px 12px 0 0',
                            mx: 0.5,
                            mb: -1, // Overlap with content area to create seamless connection
                            position: 'relative',
                            zIndex: 1,
                            '&:hover': {
                                backgroundColor: 'rgba(102, 126, 234, 0.06)',
                                color: 'primary.main',
                                transform: 'translateY(-2px)'
                            },
                            '&.Mui-selected': {
                                color: 'primary.main',
                                backgroundColor: 'white',
                                fontWeight: 700,
                                boxShadow: '0 -4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
                                // Create seamless connection with content
                                borderTop: '2px solid',
                                borderLeft: '2px solid',
                                borderRight: '2px solid',
                                borderColor: 'rgba(0,0,0,0.06)',
                                borderBottom: 'none',
                                // Add subtle gradient accent at top
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: '3px',
                                    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                                    borderRadius: '12px 12px 0 0'
                                }
                            }
                        },
                        // Hide the default indicator since we're using custom styling
                        '& .MuiTabs-indicator': {
                            display: 'none'
                        }
                    }}
                >
                    <Tab icon={<BarChartIcon />} iconPosition="start" label="Project Trends" />
                    <Tab icon={<AttachMoney />} iconPosition="start" label="Financial Trends" />
                    <Tab icon={<PieChartIcon />} iconPosition="start" label="Status Distribution" />
                    <Tab icon={<Business />} iconPosition="start" label="Department Analytics" />
                    <Tab icon={<ShowChart />} iconPosition="start" label="Performance Metrics" />
                </Tabs>

                <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                    {/* Project Trends Tab */}
                    {activeTab === 0 && (
                        <Fade in timeout={600}>
                            <Box>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={8}>
                                        <Card sx={{ 
                                            mb: 3,
                                            borderRadius: 3,
                                            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                                            border: '1px solid rgba(0,0,0,0.06)',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                boxShadow: '0 4px 20px rgba(0,0,0,0.12)'
                                            }
                                        }}>
                                            <CardHeader
                                                title={
                                                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                                        Project Completion Trends
                                                    </Typography>
                                                }
                                                subheader={
                                                    <Typography variant="body2" color="text.secondary">
                                                        Yearly project completion statistics
                                                    </Typography>
                                                }
                                                sx={{ pb: 1 }}
                                            />
                                            <CardContent sx={{ pt: 0 }}>
                                                {projectTrends.length === 0 ? (
                                                    <Box sx={{ 
                                                        height: 400, 
                                                        display: 'flex', 
                                                        flexDirection: 'column',
                                                        alignItems: 'center', 
                                                        justifyContent: 'center',
                                                        gap: 2
                                                    }}>
                                                        <BarChartIcon sx={{ fontSize: 48, color: 'text.disabled', opacity: 0.5 }} />
                                                        <Typography color="text.secondary" sx={{ fontWeight: 500 }}>
                                                            No project trend data available
                                                        </Typography>
                                                    </Box>
                                                ) : (
                                                    <ResponsiveContainer width="100%" height={400}>
                                                        <BarChart data={projectTrends}>
                                                            <CartesianGrid strokeDasharray="3 3" />
                                                            <XAxis dataKey="name" />
                                                            <YAxis />
                                                            <Tooltip />
                                                            <Legend />
                                                            <Bar dataKey="totalProjects" fill="#3b82f6" name="Total Projects" radius={[4, 4, 0, 0]} />
                                                            <Bar dataKey="completedProjects" fill="#10b981" name="Completed" radius={[4, 4, 0, 0]} />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    <Grid item xs={12} md={4}>
                                        <Card sx={{ 
                                            borderRadius: 3,
                                            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                                            border: '1px solid rgba(0,0,0,0.06)',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                boxShadow: '0 4px 20px rgba(0,0,0,0.12)'
                                            }
                                        }}>
                                            <CardHeader
                                                title={
                                                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                                        Completion Rate Trend
                                                    </Typography>
                                                }
                                                subheader={
                                                    <Typography variant="body2" color="text.secondary">
                                                        Percentage completion over time
                                                    </Typography>
                                                }
                                                sx={{ pb: 1 }}
                                            />
                                            <CardContent sx={{ pt: 0 }}>
                                                {completionTrends.length === 0 ? (
                                                    <Box sx={{ 
                                                        height: 400, 
                                                        display: 'flex', 
                                                        flexDirection: 'column',
                                                        alignItems: 'center', 
                                                        justifyContent: 'center',
                                                        gap: 2
                                                    }}>
                                                        <ShowChart sx={{ fontSize: 48, color: 'text.disabled', opacity: 0.5 }} />
                                                        <Typography color="text.secondary" sx={{ fontWeight: 500 }}>
                                                            No completion data available
                                                        </Typography>
                                                    </Box>
                                                ) : (
                                                    <ResponsiveContainer width="100%" height={400}>
                                                        <LineChart data={completionTrends}>
                                                            <CartesianGrid strokeDasharray="3 3" />
                                                            <XAxis dataKey="name" />
                                                            <YAxis />
                                                            <Tooltip formatter={(value) => `${value}%`} />
                                                            <Legend />
                                                            <Line 
                                                                type="monotone" 
                                                                dataKey="completionRate" 
                                                                stroke="#3b82f6" 
                                                                strokeWidth={2}
                                                                dot={{ r: 4 }}
                                                                name="Completion Rate %"
                                                            />
                                                        </LineChart>
                                                    </ResponsiveContainer>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Card sx={{ 
                                            borderRadius: 3,
                                            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                                            border: '1px solid rgba(0,0,0,0.06)',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                boxShadow: '0 4px 20px rgba(0,0,0,0.12)'
                                            }
                                        }}>
                                            <CardHeader
                                                title={
                                                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                                        Project Trends Summary
                                                    </Typography>
                                                }
                                                subheader={
                                                    <Typography variant="body2" color="text.secondary">
                                                        Detailed yearly breakdown
                                                    </Typography>
                                                }
                                                sx={{ pb: 1 }}
                                            />
                                            <CardContent sx={{ pt: 0 }}>
                                                <TableContainer sx={{ borderRadius: 2, overflow: 'hidden' }}>
                                                    <Table size="small">
                                                        <TableHead>
                                                            <TableRow sx={{ backgroundColor: 'rgba(102, 126, 234, 0.08)' }}>
                                                                <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Year</TableCell>
                                                                <TableCell align="right" sx={{ fontWeight: 700, color: 'text.primary' }}>Total Projects</TableCell>
                                                                <TableCell align="right" sx={{ fontWeight: 700, color: 'text.primary' }}>Completed</TableCell>
                                                                <TableCell align="right" sx={{ fontWeight: 700, color: 'text.primary' }}>Completion Rate</TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {projectTrends.map((row, index) => (
                                                                <TableRow 
                                                                    key={index} 
                                                                    hover
                                                                    sx={{ 
                                                                        '&:nth-of-type(even)': { backgroundColor: 'rgba(0,0,0,0.02)' },
                                                                        transition: 'background-color 0.2s ease',
                                                                        '&:hover': { backgroundColor: 'rgba(102, 126, 234, 0.05)' }
                                                                    }}
                                                                >
                                                                    <TableCell>{row.name}</TableCell>
                                                                    <TableCell align="right">{row.totalProjects}</TableCell>
                                                                    <TableCell align="right">{row.completedProjects}</TableCell>
                                                                    <TableCell align="right">
                                                                        <Chip 
                                                                            label={`${row.completionRate.toFixed(1)}%`}
                                                                            size="small"
                                                                            color={row.completionRate >= 80 ? 'success' : row.completionRate >= 60 ? 'warning' : 'error'}
                                                                        />
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Fade>
                    )}

                    {/* Financial Trends Tab */}
                    {activeTab === 1 && (
                        <Fade in timeout={600}>
                            <Box>
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <Card sx={{ 
                                            mb: 3,
                                            borderRadius: 3,
                                            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                                            border: '1px solid rgba(0,0,0,0.06)',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                boxShadow: '0 4px 20px rgba(0,0,0,0.12)'
                                            }
                                        }}>
                                            <CardHeader
                                                title={
                                                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                                        Financial Performance Trends
                                                    </Typography>
                                                }
                                                subheader={
                                                    <Typography variant="body2" color="text.secondary">
                                                        Budget vs expenditure over time
                                                    </Typography>
                                                }
                                                sx={{ pb: 1 }}
                                            />
                                            <CardContent sx={{ pt: 0 }}>
                                                {financialTrends.length === 0 ? (
                                                    <Box sx={{ 
                                                        height: 400, 
                                                        display: 'flex', 
                                                        flexDirection: 'column',
                                                        alignItems: 'center', 
                                                        justifyContent: 'center',
                                                        gap: 2
                                                    }}>
                                                        <AttachMoney sx={{ fontSize: 48, color: 'text.disabled', opacity: 0.5 }} />
                                                        <Typography color="text.secondary" sx={{ fontWeight: 500 }}>
                                                            No financial trend data available
                                                        </Typography>
                                                    </Box>
                                                ) : (
                                                    <ResponsiveContainer width="100%" height={400}>
                                                        <LineChart data={financialTrends}>
                                                            <CartesianGrid strokeDasharray="3 3" />
                                                            <XAxis dataKey="name" />
                                                            <YAxis tickFormatter={(value) => formatCurrency(value)} />
                                                            <Tooltip formatter={(value) => formatCurrency(value)} />
                                                            <Legend />
                                                            <Line 
                                                                type="monotone" 
                                                                dataKey="totalBudget" 
                                                                stroke="#3b82f6" 
                                                                strokeWidth={2}
                                                                dot={{ r: 4 }}
                                                                name="Total Budget"
                                                            />
                                                            <Line 
                                                                type="monotone" 
                                                                dataKey="totalExpenditure" 
                                                                stroke="#ef4444" 
                                                                strokeWidth={2}
                                                                dot={{ r: 4 }}
                                                                name="Total Expenditure"
                                                            />
                                                        </LineChart>
                                                    </ResponsiveContainer>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <Card sx={{ 
                                            borderRadius: 3,
                                            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                                            border: '1px solid rgba(0,0,0,0.06)',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                boxShadow: '0 4px 20px rgba(0,0,0,0.12)'
                                            }
                                        }}>
                                            <CardHeader
                                                title={
                                                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                                        Absorption Rate Trend
                                                    </Typography>
                                                }
                                                subheader={
                                                    <Typography variant="body2" color="text.secondary">
                                                        Budget absorption percentage
                                                    </Typography>
                                                }
                                                sx={{ pb: 1 }}
                                            />
                                            <CardContent sx={{ pt: 0 }}>
                                                {financialTrends.length === 0 ? (
                                                    <Box sx={{ 
                                                        height: 300, 
                                                        display: 'flex', 
                                                        flexDirection: 'column',
                                                        alignItems: 'center', 
                                                        justifyContent: 'center',
                                                        gap: 2
                                                    }}>
                                                        <BarChartIcon sx={{ fontSize: 40, color: 'text.disabled', opacity: 0.5 }} />
                                                        <Typography color="text.secondary" sx={{ fontWeight: 500 }}>
                                                            No data available
                                                        </Typography>
                                                    </Box>
                                                ) : (
                                                    <ResponsiveContainer width="100%" height={300}>
                                                        <BarChart data={financialTrends}>
                                                            <CartesianGrid strokeDasharray="3 3" />
                                                            <XAxis dataKey="name" />
                                                            <YAxis tickFormatter={(value) => `${value}%`} />
                                                            <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
                                                            <Bar dataKey="absorptionRate" fill="#10b981" radius={[4, 4, 0, 0]} name="Absorption Rate %" />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <Card sx={{ 
                                            borderRadius: 3,
                                            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                                            border: '1px solid rgba(0,0,0,0.06)',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                boxShadow: '0 4px 20px rgba(0,0,0,0.12)'
                                            }
                                        }}>
                                            <CardHeader
                                                title={
                                                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                                        Budget Allocation by Status
                                                    </Typography>
                                                }
                                                subheader={
                                                    <Typography variant="body2" color="text.secondary">
                                                        Financial distribution across project statuses
                                                    </Typography>
                                                }
                                                sx={{ pb: 1 }}
                                            />
                                            <CardContent sx={{ pt: 0 }}>
                                                {budgetByStatus.length === 0 ? (
                                                    <Box sx={{ 
                                                        height: 300, 
                                                        display: 'flex', 
                                                        flexDirection: 'column',
                                                        alignItems: 'center', 
                                                        justifyContent: 'center',
                                                        gap: 2
                                                    }}>
                                                        <PieChartIcon sx={{ fontSize: 40, color: 'text.disabled', opacity: 0.5 }} />
                                                        <Typography color="text.secondary" sx={{ fontWeight: 500 }}>
                                                            No budget data available
                                                        </Typography>
                                                    </Box>
                                                ) : (
                                                    <ResponsiveContainer width="100%" height={300}>
                                                        <PieChart>
                                                            <Pie
                                                                data={budgetByStatus}
                                                                cx="50%"
                                                                cy="50%"
                                                                labelLine={false}
                                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                                outerRadius={100}
                                                                fill="#8884d8"
                                                                dataKey="budget"
                                                            >
                                                                {budgetByStatus.map((entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                                                                ))}
                                                            </Pie>
                                                            <Tooltip formatter={(value) => formatCurrency(value)} />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Fade>
                    )}

                    {/* Status Distribution Tab */}
                    {activeTab === 2 && (
                        <Fade in timeout={600}>
                            <Box>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <Card sx={{ 
                                            borderRadius: 3,
                                            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                                            border: '1px solid rgba(0,0,0,0.06)',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                boxShadow: '0 4px 20px rgba(0,0,0,0.12)'
                                            }
                                        }}>
                                            <CardHeader
                                                title={
                                                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                                        Project Status Distribution
                                                    </Typography>
                                                }
                                                subheader={
                                                    <Typography variant="body2" color="text.secondary">
                                                        Projects categorized by status
                                                    </Typography>
                                                }
                                                sx={{ pb: 1 }}
                                            />
                                            <CardContent sx={{ pt: 0 }}>
                                                {statusDistribution.length === 0 ? (
                                                    <Box sx={{ 
                                                        height: 400, 
                                                        display: 'flex', 
                                                        flexDirection: 'column',
                                                        alignItems: 'center', 
                                                        justifyContent: 'center',
                                                        gap: 2
                                                    }}>
                                                        <PieChartIcon sx={{ fontSize: 48, color: 'text.disabled', opacity: 0.5 }} />
                                                        <Typography color="text.secondary" sx={{ fontWeight: 500 }}>
                                                            No status data available
                                                        </Typography>
                                                    </Box>
                                                ) : (
                                                    <ResponsiveContainer width="100%" height={400}>
                                                        <PieChart>
                                                            <Pie
                                                                data={statusDistribution}
                                                                cx="50%"
                                                                cy="50%"
                                                                labelLine={false}
                                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                                outerRadius={120}
                                                                fill="#8884d8"
                                                                dataKey="value"
                                                            >
                                                                {statusDistribution.map((entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                                                                ))}
                                                            </Pie>
                                                            <Tooltip />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <Card sx={{ 
                                            borderRadius: 3,
                                            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                                            border: '1px solid rgba(0,0,0,0.06)',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                boxShadow: '0 4px 20px rgba(0,0,0,0.12)'
                                            }
                                        }}>
                                            <CardHeader
                                                title={
                                                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                                        Status Breakdown
                                                    </Typography>
                                                }
                                                subheader={
                                                    <Typography variant="body2" color="text.secondary">
                                                        Detailed status statistics
                                                    </Typography>
                                                }
                                                sx={{ pb: 1 }}
                                            />
                                            <CardContent sx={{ pt: 0 }}>
                                                <TableContainer sx={{ borderRadius: 2, overflow: 'hidden' }}>
                                                    <Table size="small">
                                                        <TableHead>
                                                            <TableRow sx={{ backgroundColor: 'rgba(102, 126, 234, 0.08)' }}>
                                                                <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Status</TableCell>
                                                                <TableCell align="right" sx={{ fontWeight: 700, color: 'text.primary' }}>Count</TableCell>
                                                                <TableCell align="right" sx={{ fontWeight: 700, color: 'text.primary' }}>Percentage</TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {statusDistribution
                                                                .sort((a, b) => b.value - a.value)
                                                                .map((row, index) => {
                                                                    const total = statusDistribution.reduce((sum, item) => sum + item.value, 0);
                                                                    const percentage = total > 0 ? (row.value / total * 100).toFixed(1) : 0;
                                                                    return (
                                                                        <TableRow 
                                                                            key={index} 
                                                                            hover
                                                                            sx={{ 
                                                                                '&:nth-of-type(even)': { backgroundColor: 'rgba(0,0,0,0.02)' },
                                                                                transition: 'background-color 0.2s ease',
                                                                                '&:hover': { backgroundColor: 'rgba(102, 126, 234, 0.05)' }
                                                                            }}
                                                                        >
                                                                            <TableCell>
                                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                                    <Box 
                                                                                        sx={{ 
                                                                                            width: 12, 
                                                                                            height: 12, 
                                                                                            borderRadius: '50%', 
                                                                                            bgcolor: row.color 
                                                                                        }} 
                                                                                    />
                                                                                    {row.name}
                                                                                </Box>
                                                                            </TableCell>
                                                                            <TableCell align="right">{row.value}</TableCell>
                                                                            <TableCell align="right">
                                                                                <Chip 
                                                                                    label={`${percentage}%`}
                                                                                    size="small"
                                                                                    sx={{ bgcolor: row.color, color: 'white' }}
                                                                                />
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    );
                                                                })}
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Fade>
                    )}

                    {/* Department Analytics Tab */}
                    {activeTab === 3 && (
                        <Fade in timeout={600}>
                            <Box>
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <Card sx={{ 
                                            mb: 3,
                                            borderRadius: 3,
                                            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                                            border: '1px solid rgba(0,0,0,0.06)',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                boxShadow: '0 4px 20px rgba(0,0,0,0.12)'
                                            }
                                        }}>
                                            <CardHeader
                                                title={
                                                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                                        Department Project Distribution
                                                    </Typography>
                                                }
                                                subheader={
                                                    <Typography variant="body2" color="text.secondary">
                                                        Projects and budget by department
                                                    </Typography>
                                                }
                                                sx={{ pb: 1 }}
                                            />
                                            <CardContent sx={{ pt: 0 }}>
                                                {departmentData.length === 0 ? (
                                                    <Box sx={{ 
                                                        height: 400, 
                                                        display: 'flex', 
                                                        flexDirection: 'column',
                                                        alignItems: 'center', 
                                                        justifyContent: 'center',
                                                        gap: 2
                                                    }}>
                                                        <Business sx={{ fontSize: 48, color: 'text.disabled', opacity: 0.5 }} />
                                                        <Typography color="text.secondary" sx={{ fontWeight: 500 }}>
                                                            No department data available
                                                        </Typography>
                                                    </Box>
                                                ) : (
                                                    <ResponsiveContainer width="100%" height={400}>
                                                        <BarChart data={departmentData.slice(0, 10)}>
                                                            <CartesianGrid strokeDasharray="3 3" />
                                                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                                                            <YAxis />
                                                            <Tooltip />
                                                            <Legend />
                                                            <Bar dataKey="projects" fill="#3b82f6" name="Projects" radius={[4, 4, 0, 0]} />
                                                            <Bar dataKey="budget" fill="#10b981" name="Budget (KSh)" radius={[4, 4, 0, 0]} />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Card sx={{ 
                                            borderRadius: 3,
                                            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                                            border: '1px solid rgba(0,0,0,0.06)',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                boxShadow: '0 4px 20px rgba(0,0,0,0.12)'
                                            }
                                        }}>
                                            <CardHeader
                                                title={
                                                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                                        Department Performance Details
                                                    </Typography>
                                                }
                                                subheader={
                                                    <Typography variant="body2" color="text.secondary">
                                                        Comprehensive department statistics
                                                    </Typography>
                                                }
                                                sx={{ pb: 1 }}
                                            />
                                            <CardContent sx={{ pt: 0 }}>
                                                <TableContainer sx={{ borderRadius: 2, overflow: 'hidden' }}>
                                                    <Table size="small">
                                                        <TableHead>
                                                            <TableRow sx={{ backgroundColor: 'rgba(102, 126, 234, 0.08)' }}>
                                                                <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Department</TableCell>
                                                                <TableCell align="right" sx={{ fontWeight: 700, color: 'text.primary' }}>Projects</TableCell>
                                                                <TableCell align="right" sx={{ fontWeight: 700, color: 'text.primary' }}>Budget</TableCell>
                                                                <TableCell align="right" sx={{ fontWeight: 700, color: 'text.primary' }}>Paid</TableCell>
                                                                <TableCell align="right" sx={{ fontWeight: 700, color: 'text.primary' }}>Progress</TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {departmentData
                                                                .sort((a, b) => b.projects - a.projects)
                                                                .map((row, index) => (
                                                                    <TableRow 
                                                                        key={index} 
                                                                        hover
                                                                        sx={{ 
                                                                            '&:nth-of-type(even)': { backgroundColor: 'rgba(0,0,0,0.02)' },
                                                                            transition: 'background-color 0.2s ease',
                                                                            '&:hover': { backgroundColor: 'rgba(102, 126, 234, 0.05)' }
                                                                        }}
                                                                    >
                                                                        <TableCell sx={{ fontWeight: 600 }}>{row.name}</TableCell>
                                                                        <TableCell align="right">{row.projects}</TableCell>
                                                                        <TableCell align="right">{formatCurrency(row.budget)}</TableCell>
                                                                        <TableCell align="right">{formatCurrency(row.paid)}</TableCell>
                                                                        <TableCell align="right">
                                                                            <Chip 
                                                                                label={`${row.progress.toFixed(1)}%`}
                                                                                size="small"
                                                                                color={row.progress >= 80 ? 'success' : row.progress >= 50 ? 'warning' : 'error'}
                                                                            />
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))}
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Fade>
                    )}

                    {/* Performance Metrics Tab */}
                    {activeTab === 4 && (
                        <Fade in timeout={600}>
                            <Box>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <Card sx={{ 
                                            borderRadius: 3,
                                            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                                            border: '1px solid rgba(0,0,0,0.06)',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                boxShadow: '0 4px 20px rgba(0,0,0,0.12)'
                                            }
                                        }}>
                                            <CardHeader
                                                title={
                                                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                                        Department Progress
                                                    </Typography>
                                                }
                                                subheader={
                                                    <Typography variant="body2" color="text.secondary">
                                                        Completion progress by department
                                                    </Typography>
                                                }
                                                sx={{ pb: 1 }}
                                            />
                                            <CardContent sx={{ pt: 0 }}>
                                                {departmentPerformance.length === 0 ? (
                                                    <Box sx={{ 
                                                        height: 400, 
                                                        display: 'flex', 
                                                        flexDirection: 'column',
                                                        alignItems: 'center', 
                                                        justifyContent: 'center',
                                                        gap: 2
                                                    }}>
                                                        <Assessment sx={{ fontSize: 48, color: 'text.disabled', opacity: 0.5 }} />
                                                        <Typography color="text.secondary" sx={{ fontWeight: 500 }}>
                                                            No performance data available
                                                        </Typography>
                                                    </Box>
                                                ) : (
                                                    <ResponsiveContainer width="100%" height={400}>
                                                        <BarChart 
                                                            data={departmentPerformance.slice(0, 10)}
                                                            layout="vertical"
                                                        >
                                                            <CartesianGrid strokeDasharray="3 3" />
                                                            <XAxis type="number" domain={[0, 100]} />
                                                            <YAxis type="category" dataKey="name" width={120} />
                                                            <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                                                            <Bar dataKey="progress" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Progress %" />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <Card sx={{ 
                                            borderRadius: 3,
                                            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                                            border: '1px solid rgba(0,0,0,0.06)',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                boxShadow: '0 4px 20px rgba(0,0,0,0.12)'
                                            }
                                        }}>
                                            <CardHeader
                                                title={
                                                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                                        Budget Utilization
                                                    </Typography>
                                                }
                                                subheader={
                                                    <Typography variant="body2" color="text.secondary">
                                                        Budget absorption by department
                                                    </Typography>
                                                }
                                                sx={{ pb: 1 }}
                                            />
                                            <CardContent sx={{ pt: 0 }}>
                                                {departmentPerformance.length === 0 ? (
                                                    <Box sx={{ 
                                                        height: 400, 
                                                        display: 'flex', 
                                                        flexDirection: 'column',
                                                        alignItems: 'center', 
                                                        justifyContent: 'center',
                                                        gap: 2
                                                    }}>
                                                        <TrendingUp sx={{ fontSize: 48, color: 'text.disabled', opacity: 0.5 }} />
                                                        <Typography color="text.secondary" sx={{ fontWeight: 500 }}>
                                                            No utilization data available
                                                        </Typography>
                                                    </Box>
                                                ) : (
                                                    <ResponsiveContainer width="100%" height={400}>
                                                        <BarChart 
                                                            data={departmentPerformance.slice(0, 10)}
                                                            layout="vertical"
                                                        >
                                                            <CartesianGrid strokeDasharray="3 3" />
                                                            <XAxis type="number" domain={[0, 100]} />
                                                            <YAxis type="category" dataKey="name" width={120} />
                                                            <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                                                            <Bar dataKey="budgetUtilization" fill="#10b981" radius={[0, 4, 4, 0]} name="Budget Utilization %" />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Fade>
                    )}
                </Box>
            </Card>
        </Box>
    );
}

