# Project Details Page Enhancement - Implementation Guide

## Summary
This guide provides step-by-step instructions and code snippets to enhance the Project Details page with:
- Key metrics cards
- Tabbed interface
- Photo gallery/carousel
- Enhanced financial summary
- Better organization and user experience

## Implementation Steps

### Step 1: Add Required Imports

Add these imports to the top of `ProjectDetailsPage.jsx`:

```javascript
import {
    // ... existing imports
    Tabs, Tab, Card, CardContent, // Add these
} from '@mui/material';
import {
    // ... existing icons
    AttachMoney as MoneyIcon,
    TrendingUp as TrendingUpIcon,
    Schedule as ScheduleIcon,
    Warning as WarningIcon,
    Business as BusinessIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    LocationOn as LocationOnIcon,
} from '@mui/icons-material';
```

### Step 2: Add State for Tabs and Photos

Add these state variables after the existing state declarations:

```javascript
const [activeTab, setActiveTab] = useState(0);
const [projectPhotos, setProjectPhotos] = useState([]);
const [loadingPhotos, setLoadingPhotos] = useState(false);
```

### Step 3: Add Photo Fetching Function

Add this function to fetch project photos:

```javascript
const fetchProjectPhotos = useCallback(async () => {
    if (!checkUserPrivilege(user, 'project_photos.read')) return;
    
    setLoadingPhotos(true);
    try {
        const photos = await apiService.projectPhotos.getPhotosByProject(projectId);
        setProjectPhotos(photos || []);
    } catch (err) {
        console.error('Error fetching project photos:', err);
        setProjectPhotos([]);
    } finally {
        setLoadingPhotos(false);
    }
}, [projectId, user]);

// Add to useEffect
useEffect(() => {
    if (isAccessAllowed) {
        fetchProjectPhotos();
    }
}, [isAccessAllowed, fetchProjectPhotos]);
```

### Step 4: Create Key Metrics Cards Component

Add this section right after the header Paper (around line 809):

```javascript
{/* Key Metrics Cards */}
<Grid container spacing={2} sx={{ mb: 3 }}>
    {/* Total Budget Card */}
    <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ 
            background: 'linear-gradient(135deg, #2196f3 0%, #42a5f5 100%)',
            color: 'white',
            height: '100%'
        }}>
            <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                        <Typography variant="caption" sx={{ opacity: 0.9 }}>
                            Total Budget
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                            {formatCurrency(project?.costOfProject || 0)}
                        </Typography>
                    </Box>
                    <MoneyIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
            </CardContent>
        </Card>
    </Grid>

    {/* Contracted Amount Card */}
    <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ 
            background: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)',
            color: 'white',
            height: '100%'
        }}>
            <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                        <Typography variant="caption" sx={{ opacity: 0.9 }}>
                            Contracted
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                            {formatCurrency(project?.Contracted || 0)}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8, mt: 0.5 }}>
                            {project?.costOfProject > 0 
                                ? `${Math.round((project?.Contracted / project?.costOfProject) * 100)}% of budget`
                                : 'N/A'}
                        </Typography>
                    </Box>
                    <TrendingUpIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
            </CardContent>
        </Card>
    </Grid>

    {/* Paid Out Card */}
    <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ 
            background: 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)',
            color: 'white',
            height: '100%'
        }}>
            <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                        <Typography variant="caption" sx={{ opacity: 0.9 }}>
                            Paid Out
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                            {formatCurrency(project?.paidOut || 0)}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8, mt: 0.5 }}>
                            {project?.Contracted > 0 
                                ? `${Math.round((project?.paidOut / project?.Contracted) * 100)}% of contracted`
                                : 'N/A'}
                        </Typography>
                    </Box>
                    <PaidIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
            </CardContent>
        </Card>
    </Grid>

    {/* Absorption Rate Card */}
    <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ 
            background: 'linear-gradient(135deg, #26a69a 0%, #4db6ac 100%)',
            color: 'white',
            height: '100%'
        }}>
            <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                        <Typography variant="caption" sx={{ opacity: 0.9 }}>
                            Absorption Rate
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                            {project?.costOfProject > 0 && project?.paidOut > 0
                                ? `${Math.round((project?.paidOut / project?.costOfProject) * 100)}%`
                                : '0%'}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8, mt: 0.5 }}>
                            Budget Utilization
                        </Typography>
                    </Box>
                    <ScheduleIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
            </CardContent>
        </Card>
    </Grid>
</Grid>
```

### Step 5: Add Photo Carousel Section

Add this before the tabs section:

```javascript
{/* Project Photos Carousel */}
{projectPhotos.length > 0 && (
    <Paper elevation={6} sx={{ p: 2, mb: 3, borderRadius: '12px' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Project Photos
        </Typography>
        <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            overflowX: 'auto',
            pb: 1,
            '&::-webkit-scrollbar': {
                height: 8,
            },
            '&::-webkit-scrollbar-thumb': {
                backgroundColor: colors.blueAccent[500],
                borderRadius: 4,
            }
        }}>
            {projectPhotos.map((photo) => (
                <Card 
                    key={photo.photoId}
                    sx={{ 
                        minWidth: 200,
                        cursor: 'pointer',
                        '&:hover': {
                            transform: 'scale(1.05)',
                            transition: 'transform 0.2s'
                        }
                    }}
                    onClick={() => window.open(`${import.meta.env.VITE_API_BASE_URL}/${photo.filePath}`, '_blank')}
                >
                    <CardMedia
                        component="img"
                        height="150"
                        image={`${import.meta.env.VITE_API_BASE_URL}/${photo.filePath}`}
                        alt={photo.description || 'Project photo'}
                        sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ p: 1 }}>
                        <Typography variant="caption" noWrap>
                            {photo.fileName}
                        </Typography>
                    </CardContent>
                </Card>
            ))}
        </Box>
    </Paper>
)}
```

### Step 6: Create Tabbed Interface

Replace the current content sections with a tabbed interface:

```javascript
{/* Tabbed Interface */}
<Paper elevation={6} sx={{ p: 2, mb: 3, borderRadius: '12px' }}>
    <Tabs 
        value={activeTab} 
        onChange={(e, newValue) => setActiveTab(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
            borderBottom: 1,
            borderColor: 'divider',
            mb: 3
        }}
    >
        <Tab label="Overview" />
        <Tab label="Financials" />
        <Tab label="Timeline & Milestones" />
        <Tab label="Monitoring" />
        <Tab label="Documents" />
        <Tab label="Contractor" />
    </Tabs>

    {/* Tab Panels */}
    {activeTab === 0 && (
        <Box>
            {/* Overview content - move existing overview section here */}
        </Box>
    )}

    {activeTab === 1 && (
        <Box>
            {/* Financials content */}
            <Typography variant="h6" gutterBottom>Financial Summary</Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">Budget Breakdown</Typography>
                        <Typography variant="h6">{formatCurrency(project?.costOfProject || 0)}</Typography>
                        <Typography variant="body2">Total Allocated</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">Payment Status</Typography>
                        <LinearProgress 
                            variant="determinate" 
                            value={project?.Contracted > 0 ? (project?.paidOut / project?.Contracted) * 100 : 0}
                            sx={{ mt: 1, mb: 1 }}
                        />
                        <Typography variant="body2">
                            {formatCurrency(project?.paidOut || 0)} of {formatCurrency(project?.Contracted || 0)} paid
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    )}

    {activeTab === 2 && (
        <Box>
            {/* Timeline & Milestones - move existing milestones section here */}
        </Box>
    )}

    {activeTab === 3 && (
        <Box>
            {/* Monitoring - move existing monitoring section here */}
        </Box>
    )}

    {activeTab === 4 && (
        <Box>
            {/* Documents - move existing attachments section here */}
        </Box>
    )}

    {activeTab === 5 && (
        <Box>
            {/* Contractor Information */}
            <Typography variant="h6" gutterBottom>Contractor Details</Typography>
            {/* Add contractor information display */}
        </Box>
    )}
</Paper>
```

### Step 7: Calculate Financial Metrics

Add these calculations before the return statement:

```javascript
// Calculate financial metrics
const totalBudget = parseFloat(project?.costOfProject) || 0;
const contractedAmount = parseFloat(project?.Contracted) || 0;
const paidAmount = parseFloat(project?.paidOut) || 0;
const remainingBudget = totalBudget - contractedAmount;
const absorptionRate = totalBudget > 0 ? (paidAmount / totalBudget) * 100 : 0;
const contractPercentage = totalBudget > 0 ? (contractedAmount / totalBudget) * 100 : 0;
const paymentPercentage = contractedAmount > 0 ? (paidAmount / contractedAmount) * 100 : 0;
```

## Next Steps

1. Implement the key metrics cards
2. Add the photo carousel
3. Create the tabbed interface
4. Reorganize existing content into tabs
5. Add contractor information section
6. Enhance financial display
7. Add CIDP/ADP linkage information
8. Improve monitoring section display

## Testing Checklist

- [ ] Key metrics cards display correctly
- [ ] Photo carousel loads and displays images
- [ ] Tabs switch between sections
- [ ] All existing functionality still works
- [ ] Financial calculations are accurate
- [ ] Responsive design works on mobile
- [ ] Loading states display properly
- [ ] Error handling works correctly

















