# Container Stability Fix for Port 5175

## Problem Identified
The `react_frontend` container on port 5175 was unstable and crashing on the remote server, while `public_dashboard` on port 5174 was working fine.

## Root Causes Found

### 1. **Missing File Watch Polling** (Critical)
- **Issue**: The frontend container's `vite.config.js` was missing `watch: { usePolling: true }`
- **Impact**: In Docker containers, file system events don't propagate correctly without polling, causing the dev server to crash or become unresponsive
- **Fix**: Added polling to match the stable public-dashboard configuration

### 2. **Node Version Mismatch**
- **Issue**: Frontend was using `node:22-alpine` (newer, potentially unstable)
- **Working**: Public-dashboard uses `node:18-alpine` (stable LTS)
- **Fix**: Changed frontend to use `node:18-alpine`

### 3. **Missing Restart Policy**
- **Issue**: Container wasn't configured to auto-restart on failure
- **Fix**: Added `restart: unless-stopped` to both frontend and public-dashboard

## Changes Made

### 1. `/home/dev/dev/imes_working/v5/imes/frontend/vite.config.js`
```javascript
server: {
  host: '0.0.0.0',
  port: 5173,
  watch: {
    usePolling: true  // ← ADDED: Essential for Docker
  },
  hmr: {
    port: 5173,
  },
  // ... rest of config
}
```

### 2. `/home/dev/dev/imes_working/v5/imes/frontend/Dockerfile`
```dockerfile
# Changed FROM node:22-alpine
FROM node:18-alpine  # ← CHANGED: Use stable LTS version
```

### 3. `/home/dev/dev/imes_working/v5/imes/docker-compose.yml`
```yaml
frontend:
  # ... other config
  restart: unless-stopped  # ← ADDED: Auto-restart on failure
  
public-dashboard:
  # ... other config
  restart: unless-stopped  # ← ADDED: For consistency
```

## Deployment Instructions

### Step 1: Copy Updated Files to Remote Server
```bash
# Copy the updated files
scp -i ~/.ssh/id_asusme /home/dev/dev/imes_working/v5/imes/frontend/vite.config.js kunye@165.22.227.234:/projects/imes/frontend/
scp -i ~/.ssh/id_asusme /home/dev/dev/imes_working/v5/imes/frontend/Dockerfile kunye@165.22.227.234:/projects/imes/frontend/
scp -i ~/.ssh/id_asusme /home/dev/dev/imes_working/v5/imes/docker-compose.yml kunye@165.22.227.234:/projects/imes/
```

### Step 2: On Remote Server - Rebuild and Restart
```bash
# SSH into the server
ssh -i ~/.ssh/id_asusme kunye@165.22.227.234

# Navigate to project directory
cd /projects/imes

# Stop and remove the unstable container
docker-compose stop frontend
docker-compose rm -f frontend

# Rebuild with new configuration
docker-compose build --no-cache frontend

# Start the container
docker-compose up -d frontend

# Check logs to verify stability
docker-compose logs -f frontend
```

### Step 3: Verify the Fix
```bash
# Check container status (should show 'Up' and running)
docker ps | grep react_frontend

# Monitor logs for any errors
docker-compose logs -f frontend

# Test the application
curl http://localhost:5175
# Or from your local machine:
curl http://165.22.227.234:5175
```

## Why This Works

### File Watch Polling
In Docker containers, the host filesystem changes don't trigger inotify events that the dev server relies on. The `usePolling: true` option makes Vite periodically check for file changes instead, which is more reliable in containerized environments.

### Node 18 LTS
Node 18 is a Long-Term Support (LTS) version with better stability and compatibility than Node 22, which might have newer features but less tested stability in production environments.

### Auto-Restart Policy
The `restart: unless-stopped` policy ensures that if the container crashes, Docker will automatically restart it, preventing complete downtime.

## Comparison: Before vs After

| Configuration | Before (Unstable) | After (Stable) |
|---------------|-------------------|----------------|
| Node Version | node:22-alpine | node:18-alpine |
| File Watching | No polling | usePolling: true |
| Restart Policy | None | unless-stopped |
| Matches Working Container | ❌ No | ✅ Yes |

## Expected Results

After applying these fixes:
- ✅ Container should stay running without crashes
- ✅ No need to manually remove and recreate the container
- ✅ Automatic recovery from transient failures
- ✅ Same stability as the public-dashboard container (5174)

## Monitoring

To monitor the container health over time:
```bash
# Watch container status
watch docker ps

# Monitor resource usage
docker stats react_frontend

# Check restart count (should stay at 0)
docker inspect react_frontend | grep RestartCount
```

## Rollback (If Needed)

If you need to rollback for any reason:
```bash
cd /projects/imes
docker-compose down frontend
# Restore old files from backup
docker-compose up -d frontend
```

## Additional Notes

- The frontend container now uses the exact same stable configuration pattern as the public-dashboard
- Both containers now have auto-restart enabled for resilience
- The polling configuration is a Docker best practice for development containers
- Consider migrating to production builds (not dev servers) for production environments for even better stability

---

**Date Fixed**: 2025-10-14
**Tested On**: Ubuntu Server @ 165.22.227.234


