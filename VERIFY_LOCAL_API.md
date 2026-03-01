# 🔍 Verify Local API is Being Used

## Quick Browser Verification

### Step 1: Open Your App
```
http://localhost:5175/impes
```
(Note: Your frontend is on port 5175, not 5173)

### Step 2: Open DevTools
Press **F12** or **Right-click → Inspect**

### Step 3: Check Environment (Console Tab)
Paste this in the Console:
```javascript
console.log('🔧 Environment Check:');
console.log('API URL:', import.meta.env.VITE_API_URL);
console.log('Mode:', import.meta.env.MODE);
console.log('Socket URL:', import.meta.env.VITE_SOCKET_URL);
```

**Expected Output:**
```
🔧 Environment Check:
API URL: /api
Mode: development
Socket URL: http://localhost:3000
```

### Step 4: Check Network Calls (Network Tab)
1. Go to **Network** tab
2. Click **Fetch/XHR** to filter
3. Reload the page (F5)
4. Look at the API requests

**✅ CORRECT (Using Local API):**
```
http://localhost:5175/api/projects
http://localhost:5175/api/users
http://localhost:5175/api/dashboard/stats
```
The domain should be `localhost:5175` (your frontend URL)

**❌ WRONG (Using Production API):**
```
http://165.22.227.234:3000/api/projects
http://165.22.227.234:8080/api/users
```

### Step 5: Verify Proxy is Working
Click on any `/api/...` request in the Network tab and check:

**Request URL:** Should be `http://localhost:5175/api/...`
**Status:** Should be 200 OK or 401/403 (auth required)

If you see 200/401/403, the proxy is working! The Vite server is forwarding your requests to `localhost:3000`.

---

## 📊 Visual Guide

```
┌──────────────────────────────────────┐
│  Browser                             │
│  http://localhost:5175/impes         │
└────────────┬─────────────────────────┘
             │
             │ Makes request to:
             │ /api/projects
             ↓
┌──────────────────────────────────────┐
│  Vite Dev Server (Frontend)          │
│  Port 5175                           │
│  Sees: /api/* requests               │
└────────────┬─────────────────────────┘
             │
             │ Proxy forwards to:
             │ http://localhost:3000/api/projects
             ↓
┌──────────────────────────────────────┐
│  Node.js API Server                  │
│  Port 3000                           │
│  Returns: JSON data                  │
└──────────────────────────────────────┘
```

---

## 🧪 Command Line Tests

### Test 1: API Direct Access
```bash
curl http://localhost:3000/api/projects
```
**Expected:** JSON response (might say "No token" - that's OK!)

### Test 2: Frontend Proxy
```bash
curl http://localhost:5175/api/projects
```
**Expected:** Same response as Test 1 (proxy working!)

### Test 3: Check Running Containers
```bash
docker ps
```
**Expected:** Should see `node_api`, `react_frontend`, `db`

---

## 🚨 Troubleshooting

### Issue: Seeing Production URLs (165.22.227.234)

**Solution:**
```bash
# 1. Stop containers
docker compose down

# 2. Rebuild frontend
docker compose up -d --build frontend

# 3. Clear browser cache
# In browser: Ctrl+Shift+Delete → Clear cache

# 4. Hard reload
# Ctrl+Shift+R or Cmd+Shift+R
```

### Issue: 404 on /api calls

**Solution:**
1. Check API is running: `docker ps | grep node_api`
2. Check vite.config.js has proxy configured
3. Restart frontend: `docker compose restart frontend`

### Issue: CORS errors

**Solution:**
This shouldn't happen with proxy, but if it does:
1. Verify you're accessing via `localhost:5175` (not IP)
2. Check vite.config.js proxy has `changeOrigin: true`
3. Restart: `docker compose restart frontend`

---

## ✅ Success Checklist

- [ ] Opened app at `http://localhost:5175/impes`
- [ ] Console shows `API URL: /api` and `Mode: development`
- [ ] Network tab shows requests to `localhost:5175/api/...`
- [ ] No requests to `165.22.227.234`
- [ ] Data loads correctly in the app

If all checkboxes are ✅, you're using the **local API**! 🎉

---

## 📝 Quick Reference

| What | URL | Purpose |
|------|-----|---------|
| Frontend | http://localhost:5175/impes | Your app |
| API Direct | http://localhost:3000/api | API (direct) |
| API Proxied | http://localhost:5175/api | API (via proxy) |
| Public Dashboard | http://localhost:5174 | Public view |
| Database | localhost:3307 | MySQL |

---

## 🎯 Pro Tip

Add this to your browser bookmarks:
```javascript
javascript:(function(){console.log('API:',import.meta.env.VITE_API_URL,'Mode:',import.meta.env.MODE);alert('API: '+import.meta.env.VITE_API_URL+'\nMode: '+import.meta.env.MODE)})()
```

Click it anytime to instantly see which environment you're using!

---

**Need more help?** Run the verification script:
```bash
./verify-local-setup.sh
```



























