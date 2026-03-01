# GPRS Server Deployment Guide

## Server Information
- **IP Address**: 102.210.149.119
- **Username**: fortress
- **SSH Key**: `~/.ssh/id_gprs_server`
- **Deployment Path**: `/home/fortress/gprs`

## Prerequisites

### 1. Install Docker on the Server

The server currently does not have Docker installed. You need to install it first:

**Option A: Using the installation script (Recommended)**

```bash
# The script is already copied to the server
ssh -i ~/.ssh/id_gprs_server fortress@102.210.149.119
bash install-docker-on-server.sh
```

**Option B: Quick install**

```bash
ssh -i ~/.ssh/id_gprs_server fortress@102.210.149.119

# Then run these commands on the server:
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
sudo apt-get install -y docker-compose

# IMPORTANT: Log out and log back in for group changes to take effect
exit
ssh -i ~/.ssh/id_gprs_server fortress@102.210.149.119

# Verify installation
docker --version
docker-compose --version
```

## Deployment Steps

### Step 1: Verify Docker Installation

```bash
ssh -i ~/.ssh/id_gprs_server fortress@102.210.149.119 "docker --version && docker-compose --version"
```

### Step 2: Run Deployment Script

Once Docker is installed, run the deployment script:

```bash
cd /home/dev/dev/imes_working/government_projects
./deploy-gprs-server.sh
```

The script will:
1. ✅ Test SSH connection (already working)
2. ✅ Check Docker installation
3. ✅ Create deployment directory
4. ✅ Sync files to server
5. ✅ Build and start Docker containers

### Step 3: Verify Deployment

After deployment, check the services:

```bash
ssh -i ~/.ssh/id_gprs_server fortress@102.210.149.119 "cd /home/fortress/gprs && docker-compose ps"
```

## Access URLs

Once deployed, the application will be available at:

- **Admin Frontend**: http://102.210.149.119:8081/impes/
- **Public Dashboard**: http://102.210.149.119:5177/
- **API**: http://102.210.149.119:3010/api/

## Useful Commands

### View Logs
```bash
ssh -i ~/.ssh/id_gprs_server fortress@102.210.149.119 "cd /home/fortress/gprs && docker-compose logs -f"
```

### Restart Services
```bash
ssh -i ~/.ssh/id_gprs_server fortress@102.210.149.119 "cd /home/fortress/gprs && docker-compose restart"
```

### Stop Services
```bash
ssh -i ~/.ssh/id_gprs_server fortress@102.210.149.119 "cd /home/fortress/gprs && docker-compose down"
```

### Update and Redeploy
```bash
# Make your changes locally, then:
./deploy-gprs-server.sh
```

## Current Status

✅ **SSH Connection**: Working  
✅ **SSH Key Authentication**: Configured  
✅ **File Sync**: Completed (files are on server)  
❌ **Docker**: Not installed (needs manual installation)  
⏳ **Deployment**: Waiting for Docker installation  

## Next Steps

1. **Install Docker on the server** (see Prerequisites above)
2. **Run the deployment script**: `./deploy-gprs-server.sh`
3. **Verify the deployment** by accessing the URLs above

## Troubleshooting

### Docker command not found after installation
- Make sure you logged out and back in after adding user to docker group
- Try: `newgrp docker` to activate the group without logging out

### Port conflicts
- Check if ports 8081, 5177, or 3010 are already in use
- Modify `docker-compose.yml` to use different ports if needed

### Container build failures
- Check logs: `docker-compose logs`
- Ensure all required environment variables are set
- Check disk space: `df -h`
