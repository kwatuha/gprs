# IMPES Application - Quick Deployment Guide

## 🚀 Quick Start

### 1. Clone and Deploy (Development)
```bash
git clone <your-repo>
cd impes
docker-compose up -d
```

### 2. Access Your Application
- **Frontend**: http://165.22.227.234/impes/
- **API**: http://165.22.227.234/api/
- **Uploads**: http://165.22.227.234/uploads/

## 📦 Production Deployment

### Step 1: Push Images to GitHub Container Registry
```bash
# Update your GitHub username in deploy.sh
nano deploy.sh

# Set your GitHub token
export GITHUB_TOKEN=your_token_here

# Run deployment script
./deploy.sh
```

### Step 2: Deploy on Production Machine
```bash
# Copy production files to target machine
scp docker-compose.production.yml user@server:/path/to/app/
scp nginx/nginx.conf user@server:/path/to/app/nginx/
scp init.sql user@server:/path/to/app/

# On target machine
cd /path/to/app
# Edit docker-compose.production.yml and replace USERNAME with your GitHub username
nano docker-compose.production.yml

# Deploy
docker-compose -f docker-compose.production.yml up -d
```

## 🔧 Configuration Files

- `docker-compose.yml` - Development environment
- `docker-compose.production.yml` - Production environment
- `deploy.sh` - Automated deployment script
- `nginx/nginx.conf` - Nginx configuration
- `init.sql` - Database initialization

## 📋 Requirements

- Docker Engine 20.10+
- Docker Compose 2.0+
- 4GB RAM minimum
- 10GB disk space
- Ports 80, 3000, 3306, 5173 available

## 🆘 Troubleshooting

```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs

# Restart services
docker-compose restart

# Check resource usage
docker stats
```

## 📚 Full Documentation

See `DEPLOYMENT_GUIDE.md` for comprehensive deployment instructions.

## 🔐 Security Notes

- Change default passwords in production
- Use HTTPS in production
- Configure firewall rules
- Never commit `.env` files

---

**Need Help?** Check the troubleshooting section or create an issue in the repository.
