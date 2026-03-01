# 🚀 Quick Start Guide - Public Dashboard

## Access Your Dashboards

### Public Dashboard (NEW! 🎉)
**URL**: http://165.22.227.234:5174

**Features**:
- Home page with quick stats
- Interactive dashboard with charts
- Public feedback form
- No login required!

### Admin Dashboard (Existing)
**URL**: http://165.22.227.234:5173/impes/login

**Features**:
- Full project management
- User management
- Role-based access
- Chat system

### API
**URL**: http://165.22.227.234:3000

---

## Container Status

Check if all containers are running:
```bash
docker compose ps
```

**Expected Output**:
```
✅ db                 - MySQL database
✅ node_api           - Backend API
✅ react_frontend     - Admin dashboard
✅ public_dashboard   - Public dashboard (NEW!)
✅ nginx_proxy        - Reverse proxy
```

---

## Quick Commands

### Start All Services
```bash
cd /home/dev/dev/imes
docker compose up -d
```

### Stop All Services
```bash
docker compose down
```

### Restart Public Dashboard
```bash
docker compose restart public-dashboard
```

### View Logs
```bash
# Public dashboard logs
docker compose logs -f public-dashboard

# API logs
docker compose logs -f api

# All logs
docker compose logs -f
```

### Rebuild Public Dashboard
```bash
docker compose build public-dashboard
docker compose up -d public-dashboard
```

---

## Test the Public API

```bash
# Get overview statistics
curl http://165.22.227.234:3000/api/public/stats/overview | json_pp

# Get financial years
curl http://165.22.227.234:3000/api/public/financial-years | json_pp

# Get department stats
curl http://165.22.227.234:3000/api/public/stats/by-department | json_pp
```

---

## Troubleshooting

### Dashboard not loading?
1. Check if container is running: `docker compose ps`
2. Check logs: `docker compose logs public-dashboard`
3. Restart: `docker compose restart public-dashboard`

### No data showing?
1. Check API is running: `curl http://165.22.227.234:3000/api/public/stats/overview`
2. Check database connection
3. Verify data exists in database

### Port already in use?
Change the port in `docker-compose.yml`:
```yaml
public-dashboard:
  ports:
    - "5175:5173"  # Change 5174 to 5175
```

---

## File Locations

- **Public Dashboard Code**: `/home/dev/dev/imes/public-dashboard/`
- **API Code**: `/home/dev/dev/imes/api/`
- **Public API Routes**: `/home/dev/dev/imes/api/routes/publicRoutes.js`
- **Docker Compose**: `/home/dev/dev/imes/docker-compose.yml`

---

## Documentation

- **Implementation Guide**: `PUBLIC_DASHBOARD_IMPLEMENTATION_GUIDE.md`
- **API Summary**: `PUBLIC_API_SUMMARY.md`
- **Completion Summary**: `PUBLIC_DASHBOARD_COMPLETE.md`
- **Dashboard README**: `public-dashboard/README.md`

---

## Next Steps

1. ✅ **Test the dashboard** - Visit http://165.22.227.234:5174
2. ✅ **Explore all pages** - Home, Dashboard, Feedback
3. ✅ **Submit test feedback** - Try the feedback form
4. ✅ **Check the charts** - View interactive visualizations
5. 🔄 **Customize** - Add your county logo and colors
6. 🔄 **Deploy** - Plan production deployment

---

## Quick Customization

### Change County Name
Edit `public-dashboard/src/App.jsx` line 17:
```javascript
<Typography variant="h6">
  Your County Name PMTS  // Change this
</Typography>
```

### Update Colors
Edit `public-dashboard/src/main.jsx` line 7:
```javascript
primary: {
  main: '#1976d2',  // Change this color
},
```

### Update Contact Info
Edit `public-dashboard/src/pages/FeedbackPage.jsx` line 140:
```javascript
<strong>Email:</strong> your-email@county.go.ke
```

---

## Support

- Check logs for errors
- Review documentation files
- Test API endpoints directly
- Verify database connection

---

**🎉 Your public dashboard is ready! Visit http://165.22.227.234:5174 now!**



