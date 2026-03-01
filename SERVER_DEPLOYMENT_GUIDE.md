# IMPES Server Deployment Guide

## Quick Deployment

### Option 1: Automated Deployment (Recommended)

The easiest way to deploy is using the automated deployment script:

```bash
# From your local machine, run:
./deploy-to-server.sh
```

This script will:
- ✅ Test SSH connection to the server
- ✅ Create necessary directories
- ✅ Sync files (excluding node_modules, .git, etc.)
- ✅ Install Docker if needed on the server
- ✅ Build and start containers
- ✅ Show deployment status

### Option 2: Manual Deployment

If you prefer manual control:

#### Step 1: Copy Files to Server

Using rsync (recommended):
```bash
rsync -avz --progress \
  -e "ssh -i ~/.ssh/id_asusme" \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '.env' \
  --exclude 'dist' \
  --exclude 'build' \
  --exclude 'db_data' \
  ./ kunye@165.22.227.234:/projects/imes/
```

Or using scp (simpler but copies everything):
```bash
scp -r -i ~/.ssh/id_asusme \
  ~/dev/imes_working/v5/imes \
  kunye@165.22.227.234:/projects/
```

#### Step 2: SSH into Server

```bash
ssh -i ~/.ssh/id_asusme kunye@165.22.227.234
```

#### Step 3: Install Docker (if not installed)

```bash
# Update package list
sudo apt update

# Install Docker
sudo apt install -y docker.io docker-compose

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add user to docker group
sudo usermod -aG docker $USER

# Logout and login again for group changes
exit
# SSH back in
ssh -i ~/.ssh/id_asusme kunye@165.22.227.234
```

#### Step 4: Deploy Application

```bash
# Navigate to application directory
cd /projects/imes

# For production deployment
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Or for development deployment
docker-compose build
docker-compose up -d

# Check status
docker-compose ps
```

## Server Configuration

**Server Details:**
- IP: `165.22.227.234`
- User: `kunye`
- SSH Key: `~/.ssh/id_asusme`
- Deployment Path: `/projects/imes`

## Accessing the Application

After deployment, access your application at:

### Production Deployment (docker-compose.prod.yml):
- **Frontend**: http://165.22.227.234/impes/
- **API**: http://165.22.227.234/api/
- **Public Dashboard**: http://165.22.227.234:5174/
- **MySQL**: localhost:3306 (internal only)

### Development Deployment (docker-compose.yml):
- **Frontend**: http://165.22.227.234:5173/
- **API**: http://165.22.227.234:3000/api/
- **Public Dashboard**: http://165.22.227.234:5174/
- **Nginx Proxy**: http://165.22.227.234:8080/
- **MySQL**: localhost:3307 (internal only)

## Useful Commands

### Check Deployment Status
```bash
ssh -i ~/.ssh/id_asusme kunye@165.22.227.234 \
  'cd /projects/imes && docker-compose ps'
```

### View Logs
```bash
# All services
ssh -i ~/.ssh/id_asusme kunye@165.22.227.234 \
  'cd /projects/imes && docker-compose logs'

# Specific service
ssh -i ~/.ssh/id_asusme kunye@165.22.227.234 \
  'cd /projects/imes && docker-compose logs api'

# Follow logs (live)
ssh -i ~/.ssh/id_asusme kunye@165.22.227.234 \
  'cd /projects/imes && docker-compose logs -f'
```

### Restart Services
```bash
# Restart all services
ssh -i ~/.ssh/id_asusme kunye@165.22.227.234 \
  'cd /projects/imes && docker-compose restart'

# Restart specific service
ssh -i ~/.ssh/id_asusme kunye@165.22.227.234 \
  'cd /projects/imes && docker-compose restart api'
```

### Stop Services
```bash
ssh -i ~/.ssh/id_asusme kunye@165.22.227.234 \
  'cd /projects/imes && docker-compose down'
```

### Update Deployment
```bash
# Re-run the deployment script
./deploy-to-server.sh

# Or manually:
rsync -avz --progress -e "ssh -i ~/.ssh/id_asusme" \
  --exclude 'node_modules' --exclude '.git' \
  ./ kunye@165.22.227.234:/projects/imes/

ssh -i ~/.ssh/id_asusme kunye@165.22.227.234 \
  'cd /projects/imes && docker-compose build && docker-compose up -d'
```

### Database Backup
```bash
# Create backup
ssh -i ~/.ssh/id_asusme kunye@165.22.227.234 \
  'cd /projects/imes && docker-compose exec -T mysql_db \
  mysqldump -u impesUser -pAdmin2010impes imbesdb > backup_$(date +%Y%m%d_%H%M%S).sql'

# Download backup to local machine
scp -i ~/.ssh/id_asusme \
  kunye@165.22.227.234:/projects/imes/backup_*.sql \
  ./backups/
```

## Firewall Configuration

If you have a firewall enabled on the server:

```bash
# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS (if using SSL)
sudo ufw allow 443/tcp

# Allow application ports (if needed)
sudo ufw allow 3000/tcp
sudo ufw allow 5173/tcp
sudo ufw allow 5174/tcp
```

## Troubleshooting

### Port Already in Use
```bash
# Check what's using a port
sudo netstat -tulpn | grep :80

# Or using ss
sudo ss -tulpn | grep :80
```

### Container Won't Start
```bash
# Check logs
ssh -i ~/.ssh/id_asusme kunye@165.22.227.234 \
  'cd /projects/imes && docker-compose logs <service-name>'

# Check container status
ssh -i ~/.ssh/id_asusme kunye@165.22.227.234 \
  'cd /projects/imes && docker-compose ps -a'

# Rebuild and restart
ssh -i ~/.ssh/id_asusme kunye@165.22.227.234 \
  'cd /projects/imes && docker-compose down && docker-compose build && docker-compose up -d'
```

### Database Connection Issues
```bash
# Check MySQL logs
ssh -i ~/.ssh/id_asusme kunye@165.22.227.234 \
  'cd /projects/imes && docker-compose logs mysql_db'

# Restart database
ssh -i ~/.ssh/id_asusme kunye@165.22.227.234 \
  'cd /projects/imes && docker-compose restart mysql_db'
```

### Permission Issues
```bash
# Fix file permissions
ssh -i ~/.ssh/id_asusme kunye@165.22.227.234 \
  'sudo chown -R kunye:kunye /projects/imes'

# Fix Docker permissions
ssh -i ~/.ssh/id_asusme kunye@165.22.227.234 \
  'sudo usermod -aG docker kunye'
```

## Production Checklist

Before deploying to production:

- [ ] Change default database passwords in docker-compose.prod.yml
- [ ] Set up SSL/HTTPS using Let's Encrypt
- [ ] Configure firewall rules
- [ ] Set up automated backups
- [ ] Configure monitoring and logging
- [ ] Test all functionality
- [ ] Set up domain name and DNS
- [ ] Enable automatic container restart policies

## Security Recommendations

1. **Change Default Passwords**
   - Update MySQL root password
   - Update application database credentials
   - Use environment variables or secrets management

2. **Enable SSL/HTTPS**
   - Use Let's Encrypt for free SSL certificates
   - Configure nginx for HTTPS
   - Redirect HTTP to HTTPS

3. **Firewall Configuration**
   - Only expose necessary ports
   - Use UFW or iptables
   - Restrict database access to internal network only

4. **Regular Updates**
   - Keep Docker images updated
   - Update system packages regularly
   - Monitor security advisories

## Quick Reference

```bash
# Deployment script help
./deploy-to-server.sh --help

# Dry run (see what would be synced)
./deploy-to-server.sh --dry-run

# Full deployment
./deploy-to-server.sh
```

---

## Support

For issues or questions:
1. Check the logs first: `docker-compose logs`
2. Review the troubleshooting section above
3. Check Docker documentation: https://docs.docker.com/
4. Review nginx configuration in `./nginx/nginx.conf`

---

*Last updated: October 2025*


