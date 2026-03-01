# Development to Production Workflow

This guide explains how to develop locally and deploy to production.

## 📁 Directory Structure

```
/home/dev/dev/imes_working/v5/imes/
├── frontend/                    # Main application frontend
├── public-dashboard/            # Public dashboard
├── api/                         # Backend API
├── docker-compose.yml           # LOCAL development setup
├── docker-compose.prod.yml      # PRODUCTION setup
└── deploy-to-production.sh      # Deployment script
```

## 🔧 Local Development

### 1. Start Local Environment

```bash
cd /home/dev/dev/imes_working/v5/imes

# Start all services
docker-compose up -d

# Or start specific services
docker-compose up -d frontend api mysql_db public-dashboard
```

### 2. Access Local Services

- **Main Application**: http://localhost:5173/impes
- **Public Dashboard**: http://localhost:5174
- **API**: http://localhost:3000
- **MySQL**: localhost:3307

### 3. Make Changes

**Frontend Changes:**
```bash
# Edit files in: frontend/src/
# Changes auto-reload via HMR
# No restart needed!
```

**Public Dashboard Changes:**
```bash
# Edit files in: public-dashboard/src/
# Changes auto-reload via HMR
# No restart needed!
```

**API Changes:**
```bash
# Edit files in: api/
# Restart API to see changes:
docker-compose restart api
```

**Configuration Changes:**
```bash
# Edit: vite.config.js, package.json, Dockerfile, etc.
# Rebuild affected service:
docker-compose up -d --build frontend
# or
docker-compose up -d --build public-dashboard
```

### 4. View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f frontend
docker-compose logs -f public-dashboard
docker-compose logs -f api
```

### 5. Stop Local Environment

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (fresh start)
docker-compose down -v
```

## 🚀 Deploy to Production

### Method 1: Using the Deployment Script (Recommended)

```bash
cd /home/dev/dev/imes_working/v5/imes

# Run the deployment script
./deploy-to-production.sh
```

**What it does:**
1. ✅ Validates you're in the correct directory
2. ✅ Asks for confirmation
3. ✅ Removes local .env.local files
4. ✅ Syncs code to production server (excludes node_modules, .git, etc.)
5. ✅ Removes remote .env.local files
6. ✅ Stops production services
7. ✅ Builds fresh production images
8. ✅ Starts production services
9. ✅ Shows deployment status

### Method 2: Manual Deployment

```bash
cd /home/dev/dev/imes_working/v5/imes

# 1. Clean up local .env.local files
find . -name ".env.local" -type f -delete

# 2. Sync to server
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude 'dist' \
    --exclude '.env.local' \
    ./ kunye@165.22.227.234:/projects/

# 3. Deploy on server
ssh kunye@165.22.227.234 << 'EOF'
    cd /projects
    
    # Clean remote .env.local files
    find . -name ".env.local" -type f -delete
    
    # Rebuild and restart
    docker-compose -f docker-compose.prod.yml down
    docker-compose -f docker-compose.prod.yml build --no-cache
    docker-compose -f docker-compose.prod.yml up -d
    
    # Show status
    docker-compose -f docker-compose.prod.yml ps
EOF
```

## 🧪 Testing Before Production

### 1. Test Production Build Locally (Optional)

```bash
cd /home/dev/dev/imes_working/v5/imes

# Build production images locally
docker-compose -f docker-compose.prod.yml build

# Run production setup locally
docker-compose -f docker-compose.prod.yml up

# Test at: http://localhost:8080/impes
```

### 2. Check for Common Issues

**Before deploying, verify:**

- [ ] No `.env.local` files with hardcoded IPs
- [ ] All imports are correct
- [ ] No console errors in browser
- [ ] API calls work locally
- [ ] Build completes without errors
- [ ] No large files in dist/ causing slow builds

## 📊 Production URLs

After deployment, access:

- **Main Application**: http://165.22.227.234:8080/impes
- **Public Dashboard**: http://165.22.227.234:5174
- **API**: http://165.22.227.234:3000

## 🔍 Troubleshooting

### Check Production Logs

```bash
# SSH into server
ssh kunye@165.22.227.234

# View logs
cd /projects
docker-compose -f docker-compose.prod.yml logs -f

# View specific service
docker-compose -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.prod.yml logs -f public-dashboard
```

### Restart Production Services

```bash
ssh kunye@165.22.227.234 "cd /projects && docker-compose -f docker-compose.prod.yml restart"
```

### Force Rebuild a Service

```bash
ssh kunye@165.22.227.234 << 'EOF'
    cd /projects
    docker-compose -f docker-compose.prod.yml stop frontend
    docker-compose -f docker-compose.prod.yml build --no-cache frontend
    docker-compose -f docker-compose.prod.yml up -d frontend
EOF
```

### Clean Up Docker Resources

```bash
ssh kunye@165.22.227.234 << 'EOF'
    # Remove unused containers
    docker container prune -f
    
    # Remove unused images
    docker image prune -f
    
    # Remove build cache (frees up space)
    docker builder prune -f
EOF
```

## 📝 Best Practices

### 1. Version Control

```bash
# Before deploying, commit your changes
git add .
git commit -m "Description of changes"
git push
```

### 2. Backup Database

```bash
# Backup production database before major changes
ssh kunye@165.22.227.234 << 'EOF'
    docker exec db mysqldump -u impesUser -pAdmin2010impes imbesdb > /tmp/backup_$(date +%Y%m%d_%H%M%S).sql
EOF
```

### 3. Test Locally First

- Always test changes in local development environment
- Use `docker-compose up -d` for local testing
- Only deploy to production after verifying locally

### 4. Monitor After Deployment

- Check production logs after deployment
- Test key features in browser
- Monitor for any errors or issues

### 5. Environment Files

**NEVER commit or deploy:**
- `.env.local` files
- Files with hardcoded IPs or passwords
- Development-specific configurations

## 🔄 Quick Reference Commands

```bash
# LOCAL DEVELOPMENT
cd /home/dev/dev/imes_working/v5/imes
docker-compose up -d                    # Start
docker-compose logs -f frontend         # View logs
docker-compose restart api              # Restart service
docker-compose down                     # Stop

# DEPLOY TO PRODUCTION
cd /home/dev/dev/imes_working/v5/imes
./deploy-to-production.sh               # Deploy

# CHECK PRODUCTION
ssh kunye@165.22.227.234 "cd /projects && docker-compose -f docker-compose.prod.yml ps"
ssh kunye@165.22.227.234 "cd /projects && docker-compose -f docker-compose.prod.yml logs -f"
```

## 🎯 Typical Workflow

1. **Start Local Dev**: `docker-compose up -d`
2. **Make Changes**: Edit code in `frontend/`, `public-dashboard/`, or `api/`
3. **Test Locally**: http://localhost:5173/impes or http://localhost:5174
4. **Commit Changes**: `git add . && git commit -m "..." && git push`
5. **Deploy**: `./deploy-to-production.sh`
6. **Verify**: Test at http://165.22.227.234:8080/impes
7. **Monitor**: Check logs for any errors

---

**Need Help?**
- Check logs first: `docker-compose logs -f [service]`
- Rebuild if needed: `docker-compose up -d --build [service]`
- For production issues, SSH and check: `ssh kunye@165.22.227.234`



























