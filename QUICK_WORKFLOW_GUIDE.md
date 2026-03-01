# Quick Workflow Guide

## 🏃 TL;DR - Daily Development Workflow

### 1️⃣ Start Working
```bash
cd /home/dev/dev/imes_working/v5/imes
docker-compose up -d
```
→ Open http://localhost:5173/impes (main app) or http://localhost:5174 (public dashboard)

### 2️⃣ Make Changes
- Edit files in `frontend/src/` or `public-dashboard/src/`
- Browser auto-refreshes! ✨

### 3️⃣ Deploy to Production
```bash
./deploy-to-production.sh
```
→ Test at http://165.22.227.234:8080/impes

### 4️⃣ Stop Working
```bash
docker-compose down
```

---

## 📍 Where to Edit

| What You Want to Change | Where to Edit | Restart Needed? |
|------------------------|---------------|-----------------|
| Main app UI/logic | `frontend/src/` | ❌ Auto-reload |
| Public dashboard UI/logic | `public-dashboard/src/` | ❌ Auto-reload |
| API endpoints | `api/routes/` or `api/controllers/` | ✅ `docker-compose restart api` |
| Database schema | `api/init.sql` | ✅ Rebuild DB |
| Vite config | `frontend/vite.config.js` | ✅ `docker-compose up -d --build frontend` |
| Nginx config | `nginx/nginx.conf` | ✅ Restart nginx |

---

## 🔍 Common Commands

```bash
# View logs
docker-compose logs -f                  # All services
docker-compose logs -f frontend         # Just frontend
docker-compose logs -f public-dashboard # Just public dashboard

# Restart a service
docker-compose restart api
docker-compose restart frontend

# Rebuild a service
docker-compose up -d --build frontend
docker-compose up -d --build public-dashboard

# Check what's running
docker-compose ps

# Full reset (nuclear option!)
docker-compose down -v
docker-compose up -d --build
```

---

## 🚨 Before Deploying - Checklist

- [ ] Tested locally (http://localhost:5173/impes)
- [ ] No console errors in browser dev tools
- [ ] No `.env.local` files in project
- [ ] Changes committed to git

---

## 🆘 Quick Fixes

**Frontend not updating?**
```bash
docker-compose restart frontend
# or
docker-compose up -d --build frontend
```

**API changes not working?**
```bash
docker-compose restart api
```

**Production not working after deploy?**
```bash
ssh kunye@165.22.227.234
cd /projects
docker-compose -f docker-compose.prod.yml logs -f
```

**Need fresh start?**
```bash
docker-compose down
docker-compose up -d --build
```

---

## 🌐 URLs

**Local Development:**
- Main App: http://localhost:5173/impes
- Public Dashboard: http://localhost:5174
- API: http://localhost:3000

**Production:**
- Main App: http://165.22.227.234:8080/impes
- Public Dashboard: http://165.22.227.234:5174
- API: http://165.22.227.234:3000

---

## 💡 Pro Tips

1. **Always test locally first** - Use `docker-compose up -d`
2. **Watch the logs** - `docker-compose logs -f` catches issues early
3. **HMR is your friend** - Edit `.jsx` files and see changes instantly
4. **API changes need restart** - `docker-compose restart api`
5. **When in doubt, rebuild** - `docker-compose up -d --build [service]`

---

## 🌍 Working from Another Computer?

**Good News:** No configuration needed! Just access:
```
http://YOUR_DEV_MACHINE_IP:5173/impes
```

All API calls work automatically through the Vite proxy.

**Need to point to different API?** Create `frontend/.env.local`:
```bash
VITE_PROXY_TARGET=http://192.168.1.100:3000
```

---

**Full Documentation:**
- `ENVIRONMENT_SETUP_SUMMARY.md` - **Environment configuration overview**
- `ENVIRONMENT_CONFIGURATION.md` - Complete environment guide
- `DEVELOPMENT_WORKFLOW.md` - Detailed development guide

