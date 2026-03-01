# IMES Public Dashboard

A public-facing dashboard for the County Projects Monitoring & Tracking System, inspired by the [Makueni County PMTS](https://pmts.makueni.go.ke/).

## 🎯 Overview

This dashboard provides citizens with transparent access to county project information without requiring authentication. It displays real-time statistics, project details, and allows public feedback.

## ✨ Features

### 1. Home Page
- **Quick Statistics Overview**: Total projects, budgets, and status breakdown
- **Hero Section**: Eye-catching introduction with call-to-action buttons
- **About Section**: Information about transparency, accountability, and efficiency
- **Responsive Design**: Works on all devices

### 2. Dashboard Page
- **Financial Year Filter**: View statistics for specific financial years or all years
- **Quick Stats Cards**: Animated cards showing project counts and budgets
- **Interactive Charts**:
  - Project Status Distribution (Pie Chart)
  - Budget by Department (Bar Chart)
  - Projects by Category (Bar Chart)
- **Real-time Data**: Fetches latest data from the API

### 3. Feedback Page
- **Public Feedback Form**: Citizens can submit feedback without logging in
- **Contact Information**: Display county contact details
- **Form Validation**: Ensures required fields are filled
- **Success/Error Messages**: Clear feedback on submission status

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Access to the IMES API

### Installation

1. **The project is already set up!** It's located at `/home/dev/dev/imes/public-dashboard`

2. **Access the dashboard:**
   - **Public Dashboard**: http://165.22.227.234:5174
   - **Admin Dashboard**: http://165.22.227.234:5173
   - **API**: http://165.22.227.234:3000

### Running Locally (without Docker)

```bash
cd /home/dev/dev/imes/public-dashboard
npm install
npm run dev
```

The dashboard will be available at http://165.22.227.234:5173

### Running with Docker

```bash
cd /home/dev/dev/imes
docker compose up -d public-dashboard
```

## 📁 Project Structure

```
public-dashboard/
├── public/
│   └── index.html          # HTML template
├── src/
│   ├── components/
│   │   └── StatCard.jsx    # Reusable stat card component
│   ├── pages/
│   │   ├── HomePage.jsx    # Landing page with quick stats
│   │   ├── DashboardPage.jsx  # Full dashboard with charts
│   │   └── FeedbackPage.jsx   # Public feedback form
│   ├── services/
│   │   └── publicApi.js    # API service layer
│   ├── utils/
│   │   └── formatters.js   # Utility functions
│   ├── App.jsx             # Main app component with routing
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── Dockerfile              # Docker configuration
├── package.json            # Dependencies
├── vite.config.js          # Vite configuration
└── README.md               # This file
```

## 🔌 API Integration

The dashboard connects to the IMES public API endpoints:

### Statistics
- `GET /api/public/stats/overview` - Overall project statistics
- `GET /api/public/stats/by-department` - Department breakdown
- `GET /api/public/stats/by-subcounty` - Sub-county breakdown
- `GET /api/public/stats/by-project-type` - Project type statistics

### Financial Years
- `GET /api/public/financial-years` - List all financial years

### Projects
- `GET /api/public/projects` - List projects with filtering
- `GET /api/public/projects/:id` - Get project details

### Metadata
- `GET /api/public/metadata/departments` - List departments
- `GET /api/public/metadata/subcounties` - List sub-counties
- `GET /api/public/metadata/project-types` - List project categories

### Feedback
- `POST /api/public/feedback` - Submit public feedback

## 🎨 Customization

### Changing Colors

Edit `src/main.jsx` to customize the theme:

```javascript
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Change primary color
    },
    secondary: {
      main: '#dc004e', // Change secondary color
    },
  },
});
```

### Updating County Information

Edit `src/pages/FeedbackPage.jsx` to update contact information:

```javascript
<Typography variant="body1">
  <strong>Email:</strong> your-email@county.go.ke
</Typography>
<Typography variant="body1">
  <strong>Phone:</strong> +254 XXX XXX XXX
</Typography>
```

### Adding Logo

1. Place your logo in `public/` folder
2. Update `public/index.html` to reference it
3. Update `src/App.jsx` to display it in the navigation bar

## 📊 Charts and Visualizations

The dashboard uses **Recharts** for data visualization:

- **Pie Chart**: Project status distribution
- **Bar Charts**: Department budgets and project categories
- **Responsive**: All charts adapt to screen size

## 🔒 Security

- **No Authentication Required**: Public access by design
- **Read-Only**: Cannot modify any data
- **Rate Limiting**: Should be implemented on API level
- **Input Validation**: All form inputs are validated
- **CORS**: Configured for cross-origin requests

## 🚢 Deployment

### Development
```bash
docker compose up -d public-dashboard
```

### Production

1. Build optimized version:
```bash
cd public-dashboard
npm run build
```

2. Serve the `dist` folder using Nginx or any static file server

3. Update API URL in environment variables

### Deployment Options

1. **Subdomain**: `projects.county.go.ke`
2. **Path**: `county.go.ke/projects`
3. **Iframe**: Embed in existing county website

## 🧪 Testing

### Manual Testing Checklist

- [ ] Home page loads with correct statistics
- [ ] Navigation works between pages
- [ ] Financial year filter updates dashboard
- [ ] Charts display correctly
- [ ] Feedback form submits successfully
- [ ] Responsive design works on mobile
- [ ] Error handling displays appropriate messages

## 📈 Performance

- **Fast Loading**: Vite for optimized builds
- **Code Splitting**: React Router lazy loading
- **Caching**: API responses can be cached
- **Lazy Loading**: Images and components load on demand

## 🔧 Troubleshooting

### Dashboard not loading?
- Check if API is running: `docker compose ps`
- Check logs: `docker compose logs public-dashboard`
- Verify API URL in environment variables

### Charts not displaying?
- Check browser console for errors
- Verify API is returning data
- Check network tab for failed requests

### Styling issues?
- Clear browser cache
- Check if MUI is properly installed
- Verify theme configuration

## 🤝 Contributing

This dashboard is part of the IMES project. To contribute:

1. Make changes in the `public-dashboard` directory
2. Test locally
3. Submit for review

## 📝 License

Part of the County Government IMES Project

## 🎉 Features Comparison with Makueni PMTS

| Feature | Makueni PMTS | IMES Public Dashboard |
|---------|--------------|----------------------|
| Quick Stats | ✅ | ✅ |
| Financial Year Filter | ✅ | ✅ |
| Project Gallery | ✅ | 🔄 (To be added) |
| Project Details | ✅ | 🔄 (To be added) |
| Feedback Form | ✅ | ✅ |
| Department Breakdown | ✅ | ✅ |
| Interactive Charts | ✅ | ✅ |
| Responsive Design | ✅ | ✅ |
| Search Functionality | ✅ | 🔄 (To be added) |

## 🔮 Future Enhancements

- [ ] Projects Gallery Page with advanced filtering
- [ ] Individual Project Details Page with photos
- [ ] Search functionality
- [ ] Map view of projects
- [ ] Export data to PDF/Excel
- [ ] Multi-language support
- [ ] Dark mode toggle
- [ ] Print-friendly views

## 📞 Support

For issues or questions, contact the development team or submit feedback through the dashboard.

---

**Built with ❤️ for transparency and accountability**



