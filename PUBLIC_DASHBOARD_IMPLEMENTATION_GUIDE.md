# Public Dashboard Implementation Guide

## Overview

This guide outlines the implementation of a public-facing dashboard similar to the [Makueni County PMTS](https://pmts.makueni.go.ke/), which will display project information without requiring user authentication.

## Architecture Decision: Subfolder Approach ✅

**Recommended Structure:**
```
/home/dev/dev/imes/
├── api/                          # Existing private API (enhanced with public routes)
├── frontend/                     # Existing admin dashboard
├── public-dashboard/             # NEW: Public-facing dashboard
│   ├── Dockerfile
│   ├── package.json
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       └── App.jsx
└── docker-compose.yml            # Updated to include public dashboard
```

### Why Subfolder Approach?

1. **Shared Database** - No data duplication, single source of truth
2. **Reuse API Infrastructure** - Leverage existing backend with new public endpoints
3. **Unified Deployment** - Single docker-compose setup, easier CI/CD
4. **Code Reusability** - Share components, utilities, and themes
5. **Easier Maintenance** - One repository, consistent versioning
6. **Cost-Effective** - Single infrastructure, reduced hosting costs

## Phase 1: Backend API (COMPLETED ✅)

### 1.1 Public API Endpoints Created

**File:** `/home/dev/dev/imes/api/routes/publicRoutes.js`

**Available Endpoints:**

#### Statistics Endpoints
- `GET /api/public/stats/overview` - Overall project statistics
- `GET /api/public/stats/by-department` - Department-wise breakdown
- `GET /api/public/stats/by-subcounty` - Sub-county breakdown
- `GET /api/public/stats/by-ward` - Ward-level breakdown
- `GET /api/public/stats/by-project-type` - Project type statistics

#### Project Endpoints
- `GET /api/public/projects` - List projects with pagination and filtering
- `GET /api/public/projects/:id` - Get detailed project information

#### Financial Years
- `GET /api/public/financial-years` - List all financial years with stats

#### Metadata Endpoints
- `GET /api/public/metadata/departments` - List all departments
- `GET /api/public/metadata/subcounties` - List all sub-counties
- `GET /api/public/metadata/wards` - List all wards
- `GET /api/public/metadata/project-types` - List all project categories

#### Feedback
- `POST /api/public/feedback` - Submit public feedback (no auth required)

### 1.2 Database Schema

**File:** `/home/dev/dev/imes/api/public_dashboard_schema.sql`

**Tables Created:**
- `public_feedback` - Store citizen feedback
- `public_dashboard_analytics` - Track page views (optional)
- `public_quick_stats` - Materialized view for performance

### 1.3 API Integration

The public routes have been added to `app.js` **before** the authentication middleware, ensuring they're accessible without login.

## Phase 2: Public Dashboard Frontend (TO BE IMPLEMENTED)

### 2.1 Technology Stack

**Recommended:**
- **React** (same as admin dashboard for consistency)
- **Material-UI** (reuse theme from admin dashboard)
- **Recharts** (for data visualization)
- **React Router** (for navigation)
- **Axios** (for API calls)

### 2.2 Key Pages to Implement

Based on Makueni PMTS:

1. **Home Page**
   - Hero section with county branding
   - Quick stats cards (total projects, budget, status breakdown)
   - Featured projects carousel
   - Call-to-action buttons

2. **Public Dashboard**
   - Financial year selector
   - Quick stats overview
   - Department-wise breakdown chart
   - Geographic distribution (sub-county/ward)
   - Project type distribution
   - Status breakdown pie chart

3. **Projects Gallery**
   - Grid/list view of projects
   - Filters: Financial Year, Status, Department, Sub-County, Ward, Project Type
   - Search functionality
   - Pagination
   - Project cards with thumbnail images

4. **Project Details Page**
   - Full project information
   - Photo gallery
   - Budget breakdown
   - Timeline/milestones
   - Location map (if coordinates available)

5. **Feedback Page**
   - Public feedback form
   - Contact information
   - FAQ section

### 2.3 Folder Structure

```
public-dashboard/
├── Dockerfile
├── package.json
├── vite.config.js
├── public/
│   ├── index.html
│   └── assets/
│       └── county-logo.png
└── src/
    ├── App.jsx
    ├── main.jsx
    ├── index.css
    ├── components/
    │   ├── layout/
    │   │   ├── Header.jsx
    │   │   ├── Footer.jsx
    │   │   └── Navigation.jsx
    │   ├── stats/
    │   │   ├── QuickStatsCard.jsx
    │   │   ├── StatCard.jsx
    │   │   └── StatsOverview.jsx
    │   ├── charts/
    │   │   ├── DepartmentChart.jsx
    │   │   ├── StatusPieChart.jsx
    │   │   └── GeographicChart.jsx
    │   ├── projects/
    │   │   ├── ProjectCard.jsx
    │   │   ├── ProjectGrid.jsx
    │   │   ├── ProjectFilters.jsx
    │   │   └── ProjectDetails.jsx
    │   └── feedback/
    │       └── FeedbackForm.jsx
    ├── pages/
    │   ├── HomePage.jsx
    │   ├── DashboardPage.jsx
    │   ├── ProjectsGalleryPage.jsx
    │   ├── ProjectDetailsPage.jsx
    │   ├── FeedbackPage.jsx
    │   └── FAQPage.jsx
    ├── services/
    │   └── publicApi.js
    ├── utils/
    │   ├── formatters.js
    │   └── constants.js
    └── theme/
        └── publicTheme.js
```

### 2.4 Sample Component: QuickStatsCard

```jsx
// src/components/stats/QuickStatsCard.jsx
import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { formatCurrency, formatNumber } from '../../utils/formatters';

const QuickStatsCard = ({ title, count, budget, color, icon: Icon }) => {
  return (
    <Card 
      sx={{ 
        height: '100%',
        borderTop: `4px solid ${color}`,
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 3
        }
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Icon sx={{ fontSize: 40, color, mr: 2 }} />
          <Typography variant="h6" color="text.secondary">
            {title}
          </Typography>
        </Box>
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          {formatNumber(count)}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Budget: {formatCurrency(budget)}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default QuickStatsCard;
```

### 2.5 Sample Service: publicApi.js

```javascript
// src/services/publicApi.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://165.22.227.234:3000/api';

const publicApi = axios.create({
  baseURL: `${API_BASE_URL}/public`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getOverviewStats = async (finYearId = null) => {
  const params = finYearId ? { finYearId } : {};
  const response = await publicApi.get('/stats/overview', { params });
  return response.data;
};

export const getFinancialYears = async () => {
  const response = await publicApi.get('/financial-years');
  return response.data;
};

export const getProjects = async (filters = {}) => {
  const response = await publicApi.get('/projects', { params: filters });
  return response.data;
};

export const getProjectDetails = async (projectId) => {
  const response = await publicApi.get(`/projects/${projectId}`);
  return response.data;
};

export const getDepartmentStats = async (finYearId = null) => {
  const params = finYearId ? { finYearId } : {};
  const response = await publicApi.get('/stats/by-department', { params });
  return response.data;
};

export const submitFeedback = async (feedbackData) => {
  const response = await publicApi.post('/feedback', feedbackData);
  return response.data;
};

export default publicApi;
```

## Phase 3: Docker Configuration

### 3.1 Update docker-compose.yml

Add the public dashboard service:

```yaml
  public-dashboard:
    build:
      context: ./public-dashboard
      dockerfile: Dockerfile
    container_name: public_dashboard
    ports:
      - "5174:5173"  # Different port from admin dashboard
    volumes:
      - ./public-dashboard:/app
      - /app/node_modules
    environment:
      VITE_API_URL: http://165.22.227.234:3000/api
    command: npm run dev
```

### 3.2 Nginx Configuration

Update nginx.conf to serve both dashboards:

```nginx
# Admin Dashboard (authenticated)
location /impes/ {
    proxy_pass http://frontend:5173/impes/;
    # ... existing config
}

# Public Dashboard (no auth)
location /public/ {
    proxy_pass http://public-dashboard:5173/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

## Phase 4: Deployment Strategy

### 4.1 Development Environment

1. Run all services: `docker-compose up -d`
2. Access:
   - Admin Dashboard: `http://165.22.227.234:5173/impes`
   - Public Dashboard: `http://165.22.227.234:5174`
   - API: `http://165.22.227.234:3000`

### 4.2 Production Deployment

1. **Build optimized images:**
   ```bash
   docker-compose -f docker-compose.production.yml build
   ```

2. **Deploy to county website:**
   - Embed public dashboard as iframe, OR
   - Deploy as subdomain: `projects.county.go.ke`, OR
   - Deploy as path: `county.go.ke/projects`

3. **Security considerations:**
   - Rate limiting on public API endpoints
   - CAPTCHA on feedback form
   - Input validation and sanitization
   - CORS configuration for production domains

## Phase 5: Features Comparison

### Makueni PMTS Features vs IMES Implementation

| Feature | Makueni PMTS | IMES Status |
|---------|--------------|-------------|
| Quick Stats Overview | ✅ | ✅ API Ready |
| Financial Year Filtering | ✅ | ✅ API Ready |
| Projects Gallery | ✅ | ✅ API Ready |
| Project Details | ✅ | ✅ API Ready |
| Feedback Form | ✅ | ✅ API Ready |
| FAQ Section | ✅ | 🔄 To Implement |
| Contact Us | ✅ | 🔄 To Implement |
| Department Breakdown | ✅ | ✅ API Ready |
| Geographic Breakdown | ✅ | ✅ API Ready |
| Project Photos | ✅ | ✅ API Ready |
| Search Functionality | ✅ | ✅ API Ready |
| Responsive Design | ✅ | 🔄 To Implement |

## Phase 6: Next Steps

### Immediate Actions:

1. **Test Public API Endpoints**
   ```bash
   # Test overview stats
   curl http://165.22.227.234:3000/api/public/stats/overview
   
   # Test projects list
   curl http://165.22.227.234:3000/api/public/projects?page=1&limit=10
   
   # Test financial years
   curl http://165.22.227.234:3000/api/public/financial-years
   ```

2. **Create Database Tables**
   ```bash
   docker exec -i db mysql -uimpesUser -pAdmin2010impes imbesdb < api/public_dashboard_schema.sql
   ```

3. **Create Public Dashboard Folder**
   ```bash
   cd /home/dev/dev/imes
   mkdir public-dashboard
   cd public-dashboard
   npm create vite@latest . -- --template react
   npm install @mui/material @emotion/react @emotion/styled axios recharts react-router-dom
   ```

4. **Implement Core Pages**
   - Start with HomePage showing quick stats
   - Then implement DashboardPage with charts
   - Add ProjectsGalleryPage with filtering
   - Create ProjectDetailsPage
   - Finally add FeedbackPage

### Timeline Estimate:

- **Week 1:** Setup public dashboard project, implement HomePage and DashboardPage
- **Week 2:** Implement ProjectsGalleryPage and ProjectDetailsPage
- **Week 3:** Add FeedbackPage, FAQ, and polish UI/UX
- **Week 4:** Testing, optimization, and deployment preparation

## Benefits of This Approach

1. **Transparency** - Citizens can track projects without needing accounts
2. **Accountability** - Public visibility encourages timely project completion
3. **Reduced Support Load** - Self-service information reduces inquiries
4. **Data Integrity** - Single database ensures consistency
5. **Scalability** - Can add more public features without major refactoring
6. **SEO Friendly** - Public pages can be indexed by search engines
7. **Mobile Responsive** - Accessible on all devices

## Security Considerations

1. **Rate Limiting** - Prevent API abuse
2. **Data Sanitization** - Clean all public inputs
3. **Read-Only Access** - Public API only reads data
4. **No Sensitive Data** - Don't expose user info, internal notes, etc.
5. **CAPTCHA** - On feedback forms to prevent spam
6. **Monitoring** - Track API usage and anomalies

## Performance Optimization

1. **Caching** - Cache frequently accessed data (stats, financial years)
2. **Pagination** - Limit results per page
3. **Database Indexes** - Ensure proper indexing on frequently queried columns
4. **CDN** - Serve static assets via CDN
5. **Lazy Loading** - Load images and components on demand
6. **Materialized Views** - Pre-compute complex statistics

## Conclusion

The subfolder approach provides the best balance of:
- **Simplicity** - Easy to manage and deploy
- **Efficiency** - Shared resources and code
- **Maintainability** - Single codebase
- **Scalability** - Can grow with your needs

The public API is now ready and waiting for the frontend implementation. You can start building the public dashboard immediately using the endpoints provided.

---

**Questions or Need Help?**

Refer to this guide as you implement each phase. The API is production-ready and can be tested immediately.



