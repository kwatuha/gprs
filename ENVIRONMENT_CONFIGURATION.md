# Environment Configuration Guide

## 🎯 Overview

This project uses **environment-based configuration** to handle different API URLs for local development and production deployments. This eliminates the need to hardcode IPs and makes the application portable.

---

## 📁 Environment Files

### `.env.development` (Local Development)
Used when running `docker-compose up` or `npm run dev`

```bash
# Uses Vite proxy to avoid CORS
VITE_API_URL=/api
VITE_SOCKET_URL=http://localhost:3000
VITE_API_BASE_URL=/api
```

### `.env.production` (Production Build)
Used when building for production with `npm run build`

```bash
# Uses nginx proxy in production
VITE_API_URL=/api
VITE_SOCKET_URL=
VITE_API_BASE_URL=/api
```

### `.env.local` (❌ NEVER COMMIT)
For local overrides and secrets. **Automatically ignored by git**.

---

## 🔄 How It Works

### Local Development Flow

```
Browser → http://localhost:5173/impes
   ↓
Frontend requests /api/...
   ↓
Vite Dev Server (vite.config.js proxy)
   ↓
http://localhost:3000/api/...
   ↓
API Container
```

**Configuration:**
- Vite proxy in `vite.config.js` routes `/api` → `http://localhost:3000`
- Frontend uses relative path `/api`
- No CORS issues!

### Production Flow

```
Browser → http://165.22.227.234:8080/impes
   ↓
Nginx Proxy (port 8080)
   ↓
Frontend requests /api/...
   ↓
Nginx routes /api → http://api:3000
   ↓
API Container
```

**Configuration:**
- Nginx proxy in `nginx-production.conf` routes `/api` → `http://api:3000`
- Frontend built with relative path `/api`
- No CORS issues!

---

## ✅ Benefits of This Approach

1. **No Hardcoded IPs** - Frontend code never contains server IPs
2. **Portable** - Works on any server without code changes
3. **CORS-Free** - Proxy handles all requests on same domain
4. **Secure** - Secrets stay in `.env.local` (never committed)
5. **Simple** - One deployment script works everywhere

---

## 🛠️ How to Use

### For Local Development

1. **Start services:**
   ```bash
   cd /home/dev/dev/imes_working/v5/imes
   docker-compose up -d
   ```

2. **Access app:**
   - Main App: http://localhost:5173/impes
   - Public Dashboard: http://localhost:5174

3. **Environment variables automatically loaded from `.env.development`**

4. **Optional: Override locally (create `.env.local`):**
   ```bash
   # .env.local (never committed)
   VITE_PROXY_TARGET=http://192.168.1.100:3000  # Point to different API
   ```

### For Production Deployment

1. **Deploy using script:**
   ```bash
   cd /home/dev/dev/imes_working/v5/imes
   ./deploy-to-production.sh
   ```

2. **Environment variables automatically loaded from `.env.production`**

3. **The script automatically:**
   - Removes any `.env.local` files
   - Syncs code to server
   - Builds with production config
   - Deploys to server

---

## 📝 Environment Variables Reference

| Variable | Development | Production | Description |
|----------|-------------|------------|-------------|
| `VITE_API_URL` | `/api` | `/api` | Base URL for API calls |
| `VITE_SOCKET_URL` | `http://localhost:3000` | Empty (auto-detect) | Socket.IO server URL |
| `VITE_API_BASE_URL` | `/api` | `/api` | Alternative API base URL |
| `VITE_PROXY_TARGET` | `http://localhost:3000` | N/A (nginx handles) | Vite dev server proxy target |

---

## 🔧 Customization

### Change API Server in Development

**Option 1: Environment Variable**
```bash
# Set before starting
export VITE_PROXY_TARGET=http://192.168.1.100:3000
docker-compose up -d
```

**Option 2: Create `.env.local`**
```bash
# frontend/.env.local
VITE_PROXY_TARGET=http://192.168.1.100:3000
```

### Point to External API from Another Computer

**Problem:** You want to access the dev server from another computer on your network.

**Solution:**
```bash
# On your development machine, create frontend/.env.local
VITE_PROXY_TARGET=http://YOUR_DEV_MACHINE_IP:3000
```

Then access from other computer:
```
http://YOUR_DEV_MACHINE_IP:5173/impes
```

---

## 🚨 Common Issues & Solutions

### Issue 1: "API calls failing in development"

**Symptom:** 404 or CORS errors

**Solution:**
1. Check API is running: `docker-compose ps`
2. Verify proxy config in `vite.config.js`
3. Check `.env.development` has `VITE_API_URL=/api`
4. Restart frontend: `docker-compose restart frontend`

### Issue 2: "Hardcoded IP still showing in code"

**Symptom:** Old IP addresses in console logs

**Solution:**
1. Search for hardcoded IPs: `grep -r "165.22.227.234" frontend/src/`
2. Replace with: `import.meta.env.VITE_API_URL || '/api'`
3. Rebuild: `docker-compose up -d --build frontend`

### Issue 3: "Production deployment using wrong API"

**Symptom:** Production app tries to connect to localhost

**Solution:**
1. Ensure `.env.local` is deleted: `find . -name ".env.local" -delete`
2. Redeploy: `./deploy-to-production.sh`
3. The script now automatically removes `.env.local` files

### Issue 4: "Socket.IO not connecting"

**Symptom:** Chat/realtime features not working

**Solution:**
- **Development:** Set `VITE_SOCKET_URL=http://localhost:3000` in `.env.development`
- **Production:** Leave empty, auto-detects from `window.location`

---

## 📚 Code Examples

### Correct Way to Use API URL

```javascript
// ✅ GOOD - Uses environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const response = await axios.get(`${API_BASE_URL}/projects`);
```

```javascript
// ❌ BAD - Hardcoded IP
const API_BASE_URL = 'http://165.22.227.234:3000/api';
```

### Socket.IO Connection

```javascript
// ✅ GOOD - Auto-detects or uses environment variable
const socketUrl = import.meta.env.VITE_SOCKET_URL || 
  (window.location.protocol + '//' + window.location.host);

const socket = io(socketUrl);
```

```javascript
// ❌ BAD - Hardcoded IP
const socket = io('http://165.22.227.234:8080');
```

---

## 🔐 Security Notes

1. **`.env.local` is never committed** - Use it for secrets and local overrides
2. **`.env.development` and `.env.production` are committed** - They contain no secrets
3. **All API URLs use relative paths** - No exposed server IPs in frontend code
4. **Nginx handles routing** - Backend never exposed directly to internet

---

## 📋 Checklist for New Deployments

Before deploying to a new server:

- [ ] Update deployment script with new server IP/hostname
- [ ] Ensure nginx proxy configuration is correct
- [ ] Verify `.env.production` uses relative paths
- [ ] Test locally first with `docker-compose up`
- [ ] Run deployment script: `./deploy-to-production.sh`
- [ ] Verify API calls work from browser dev tools
- [ ] Test from another computer on network

---

## 🎓 Best Practices

1. **Always use environment variables** for URLs, never hardcode
2. **Use relative paths** (`/api`) whenever possible
3. **Never commit `.env.local`** - It's in `.gitignore` for a reason
4. **Test locally before deploying** - `docker-compose up` is fast
5. **Use the deployment script** - It handles all the cleanup automatically

---

## 🆘 Getting Help

If you encounter issues:

1. **Check logs:**
   ```bash
   # Local
   docker-compose logs -f frontend
   
   # Production
   ssh kunye@165.22.227.234 "cd /projects && docker-compose -f docker-compose.prod.yml logs -f frontend"
   ```

2. **Verify environment:**
   ```bash
   # Check what environment Vite is using
   echo "Mode: development or production"
   
   # Check loaded variables (in browser console)
   console.log(import.meta.env)
   ```

3. **Test API directly:**
   ```bash
   # Should work
   curl http://localhost:3000/api/projects
   ```

---

**For more information, see:**
- `DEVELOPMENT_WORKFLOW.md` - Complete development guide
- `QUICK_WORKFLOW_GUIDE.md` - Quick reference
- `deploy-to-production.sh` - Deployment automation



























