# IMPES Application Deployment Guide

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Local Development Setup](#local-development-setup)
4. [Deployment to New Machine](#deployment-to-new-machine)
5. [Pushing Images to GitHub Container Registry](#pushing-images-to-github-container-registry)
6. [Troubleshooting](#troubleshooting)
7. [Maintenance](#maintenance)

---

## Overview

This guide covers the complete deployment workflow for the IMPES (Integrated Management and Project Execution System) application. The application is containerized using Docker and consists of:

- **Frontend**: React application served via Nginx
- **Backend**: Node.js/Express API
- **Database**: MySQL 8.0
- **Reverse Proxy**: Nginx for routing and load balancing

---

## Prerequisites

### Required Software
- Docker Engine 20.10+
- Docker Compose 2.0+
- Git
- At least 4GB RAM
- 10GB free disk space

### System Requirements
- Linux (Ubuntu 20.04+ recommended)
- Ports 80, 3000, 3306, 5173 available
- Internet connection for initial image pulls

---

## Local Development Setup

### 1. Clone Repository
```bash
git clone <your-repository-url>
cd impes
```

### 2. Environment Configuration
The application is configured to use relative URLs, making it portable without configuration changes.

### 3. Start Development Environment
```bash
# Build all containers
docker-compose build

# Start services
docker-compose up -d

# Check status
docker-compose ps
```

### 4. Access Application
- **Frontend**: http://165.22.227.234/impes/
- **API**: http://165.22.227.234/api/
- **Uploads**: http://165.22.227.234/uploads/

---

## Deployment to New Machine

### Step 1: Install Docker
```bash
# Update package list
sudo apt update

# Install Docker
sudo apt install docker.io docker-compose

# Start and enable Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add user to docker group (optional)
sudo usermod -aG docker $USER
# Logout and login again for group changes to take effect
```

### Step 2: Transfer Application
```bash
# Option A: Clone from Git
git clone <your-repository-url>
cd impes

# Option B: Copy files via SCP
scp -r /path/to/impes user@new-machine:/destination/path/

# Option C: Copy files via rsync
rsync -avz /path/to/impes/ user@new-machine:/destination/path/impes/
```

### Step 3: Deploy Application
```bash
# Navigate to application directory
cd /path/to/impes

# Build containers (first time only)
docker-compose build

# Start all services
docker-compose up -d

# Verify deployment
docker-compose ps
```

### Step 4: Verify Deployment
```bash
# Test frontend
curl http://165.22.227.234/impes/

# Test API
curl http://165.22.227.234/api/auth/login

# Check logs
docker-compose logs
```

---

## Pushing Images to GitHub Container Registry

### Step 1: Prepare GitHub Container Registry

1. **Create Personal Access Token**
   - Go to GitHub → Settings → Developer settings → Personal access tokens
   - Generate new token with `write:packages` scope
   - Copy the token

2. **Login to GitHub Container Registry**
```bash
# Login to GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Or manually
docker login ghcr.io
# Username: your-github-username
# Password: your-personal-access-token
```

### Step 2: Tag Images for GitHub Registry

```bash
# Tag your images with GitHub Container Registry format
docker tag impes-frontend ghcr.io/USERNAME/impes-frontend:latest
docker tag impes-api ghcr.io/USERNAME/impes-api:latest
docker tag nginx:alpine ghcr.io/USERNAME/impes-nginx:latest

# For versioned releases
docker tag impes-frontend ghcr.io/USERNAME/impes-frontend:v1.0.0
docker tag impes-api ghcr.io/USERNAME/impes-api:v1.0.0
```

### Step 3: Push Images to Registry

```bash
# Push all tagged images
docker push ghcr.io/USERNAME/impes-frontend:latest
docker push ghcr.io/USERNAME/impes-api:latest
docker push ghcr.io/USERNAME/impes-nginx:latest

# Push versioned releases
docker push ghcr.io/USERNAME/impes-frontend:v1.0.0
docker push ghcr.io/USERNAME/impes-api:v1.0.0
```

### Step 4: Update docker-compose.yml for Production

Create a production version of your docker-compose.yml:

```yaml
services:
  nginx_proxy:
    image: ghcr.io/USERNAME/impes-nginx:latest
    container_name: nginx_proxy
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - frontend
      - api

  frontend:
    image: ghcr.io/USERNAME/impes-frontend:latest
    container_name: react_frontend
    ports:
      - "5173:80"
    depends_on:
      - api

  api:
    image: ghcr.io/USERNAME/impes-api:latest
    container_name: node_api
    ports:
      - "3000:3000"
    depends_on:
      - mysql_db
    environment:
      DB_HOST: db
      DB_USER: impesUser
      DB_PASSWORD: Admin2010impes
      DB_NAME: imbesdb

  mysql_db:
    image: mysql:8.0
    container_name: db
    restart: always
    command: --default-authentication-plugin=mysql_native_password
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: imbesdb
      MYSQL_USER: impesUser
      MYSQL_PASSWORD: Admin2010impes
    volumes:
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
      - db_data:/var/lib/mysql
    ports:
      - "3306:3306"

volumes:
  db_data:
```

### Step 5: Automated Build and Push Script

Create a `deploy.sh` script:

```bash
#!/bin/bash

# Set variables
GITHUB_USERNAME="your-github-username"
VERSION="v1.0.0"

# Build images
echo "Building Docker images..."
docker-compose build

# Tag images
echo "Tagging images for GitHub Container Registry..."
docker tag impes-frontend ghcr.io/$GITHUB_USERNAME/impes-frontend:latest
docker tag impes-frontend ghcr.io/$GITHUB_USERNAME/impes-frontend:$VERSION
docker tag impes-api ghcr.io/$GITHUB_USERNAME/impes-api:latest
docker tag impes-api ghcr.io/$GITHUB_USERNAME/impes-api:$VERSION
docker tag nginx:alpine ghcr.io/$GITHUB_USERNAME/impes-nginx:latest
docker tag nginx:alpine ghcr.io/$GITHUB_USERNAME/impes-nginx:$VERSION

# Push images
echo "Pushing images to GitHub Container Registry..."
docker push ghcr.io/$GITHUB_USERNAME/impes-frontend:latest
docker push ghcr.io/$GITHUB_USERNAME/impes-frontend:$VERSION
docker push ghcr.io/$GITHUB_USERNAME/impes-api:latest
docker push ghcr.io/$GITHUB_USERNAME/impes-api:$VERSION
docker push ghcr.io/$GITHUB_USERNAME/impes-nginx:latest
docker push ghcr.io/$GITHUB_USERNAME/impes-nginx:$VERSION

echo "Deployment completed successfully!"
```

Make it executable:
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## Production Deployment Workflow

### 1. Quick Deploy Command
```bash
# One-liner deployment
git clone <repo> && cd impes && docker-compose up -d
```

### 2. Production Environment Variables
Create `.env.production`:
```bash
NODE_ENV=production
DB_HOST=db
DB_USER=impesUser
DB_PASSWORD=your_secure_password
DB_NAME=imbesdb
```

### 3. Health Check Endpoints
```bash
# Frontend health check
curl http://165.22.227.234/impes/

# API health check
curl http://165.22.227.234/api/

# Database connection test
docker-compose exec api node -e "console.log('API running')"
```

---

## Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Check what's using the port
sudo netstat -tulpn | grep :80

# Kill process if needed
sudo pkill -f <process-name>
```

#### 2. Permission Denied
```bash
# Restart Docker service
sudo systemctl restart docker

# Check Docker group membership
groups $USER
```

#### 3. Container Won't Start
```bash
# Check logs
docker-compose logs <service-name>

# Check container status
docker-compose ps -a
```

#### 4. Database Connection Issues
```bash
# Check MySQL container
docker-compose logs mysql_db

# Restart database
docker-compose restart mysql_db
```

### Debug Commands
```bash
# View all containers
docker ps -a

# View container logs
docker logs <container-name>

# Execute commands in container
docker exec -it <container-name> /bin/bash

# Check network
docker network ls
docker network inspect impes_default
```

---

## Maintenance

### Regular Tasks

#### 1. Update Images
```bash
# Pull latest images
docker-compose pull

# Restart services
docker-compose up -d
```

#### 2. Backup Database
```bash
# Create backup
docker-compose exec mysql_db mysqldump -u root -p imbesdb > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
docker-compose exec -T mysql_db mysql -u root -p imbesdb < backup_file.sql
```

#### 3. Clean Up
```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove unused networks
docker network prune
```

#### 4. Monitor Resources
```bash
# Check resource usage
docker stats

# Check disk usage
docker system df
```

---

## Security Considerations

### 1. Environment Variables
- Never commit `.env` files to version control
- Use strong passwords for database
- Rotate secrets regularly

### 2. Network Security
- Configure firewall rules
- Use HTTPS in production
- Limit container network access

### 3. Container Security
- Keep base images updated
- Scan images for vulnerabilities
- Use non-root users in containers

---

## Support and Resources

### Documentation
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)

### Community
- Docker Community Forums
- GitHub Issues
- Stack Overflow

---

## Conclusion

This deployment guide provides a comprehensive workflow for deploying the IMPES application on any machine. The containerized approach ensures consistency across environments and simplifies deployment processes.

Key benefits of this setup:
- **Portability**: Works on any machine with Docker
- **Consistency**: Same environment everywhere
- **Scalability**: Easy to scale horizontally
- **Maintainability**: Simple updates and rollbacks

For questions or issues, refer to the troubleshooting section or create an issue in the project repository.

---

*Last updated: $(date)*
*Version: 1.0*
