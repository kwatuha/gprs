# Performance Testing Guide

Use this guide to measure and compare performance before and after the optimization.

## Before You Start

Have ready:
- Browser with DevTools (Chrome or Firefox recommended)
- Stopwatch or timer
- Notepad to record results

---

## Test 1: Initial Page Load Time

### Steps:
1. **Clear browser cache completely**
   - Chrome: Ctrl+Shift+Delete → Select "All time" → Check "Cached images and files"
   - Firefox: Ctrl+Shift+Delete → Select "Everything" → Check "Cache"

2. **Open DevTools**
   - Press F12
   - Go to "Network" tab
   - Check "Disable cache" option

3. **Load the page**
   - Go to: `http://165.22.227.234:8080/impes/`
   - Start timing when you press Enter
   - Stop when page is fully interactive (you can click elements)

4. **Record metrics from Network tab:**
   - DOMContentLoaded: _____ ms
   - Load: _____ ms  
   - Total requests: _____
   - Total transferred: _____ MB
   - Total resources: _____ MB

### Expected Results:

#### Before Optimization (Dev Mode)
- DOMContentLoaded: 8,000-15,000 ms
- Load: 15,000-30,000 ms
- Total transferred: 10-15 MB
- Total resources: 10-15 MB

#### After Optimization (Prod Mode)
- DOMContentLoaded: 800-1,500 ms
- Load: 2,000-5,000 ms
- Total transferred: 2-3 MB (with compression)
- Total resources: 5-8 MB

---

## Test 2: Subsequent Page Load (With Cache)

### Steps:
1. **Keep DevTools open** but **uncheck "Disable cache"**
2. **Reload the page** (Ctrl+R or F5)
3. **Record timing**

### Expected Results:

#### Before Optimization
- Load: 5,000-10,000 ms (still slow, minimal caching)

#### After Optimization  
- Load: 300-1,000 ms (much faster, assets cached!)
- Many resources show "304 Not Modified" or loaded from cache

---

## Test 3: Bundle Analysis

### In DevTools Network Tab:

#### Filter by JavaScript (.js files)

**Before Optimization:**
- Usually ONE large bundle: `index.js` or similar
- Size: ~5-10 MB uncompressed
- No hash in filename
- No gzip compression

**After Optimization:**
- MULTIPLE smaller chunks:
  - `index-[hash].js` (~200-500 KB)
  - `vendor-[hash].js` (~500-800 KB)
  - `mui-[hash].js` (~300-500 KB)
  - `charts-[hash].js` (~400-600 KB)
  - `maps-[hash].js` (~300-400 KB)
  - etc.
- Files have hashes in names (e.g., `index-abc12345.js`)
- Response headers show: `Content-Encoding: gzip`

---

## Test 4: Compression Check

### Steps:
1. In DevTools Network tab, click on any `.js` file
2. Go to "Headers" tab
3. Look under "Response Headers"

### What to Check:

**Before Optimization:**
```
Content-Type: application/javascript
Content-Length: 5432100
```
(No compression!)

**After Optimization:**
```
Content-Type: application/javascript
Content-Encoding: gzip
Content-Length: 876543
```
(Gzipped - much smaller!)

---

## Test 5: Real-World User Experience

### Simulate Slow Connection:

1. In DevTools, go to Network tab
2. Change throttling from "No throttling" to "Fast 3G"
3. Reload page
4. Record load time

### Expected Results:

#### Before Optimization
- Load time on Fast 3G: 60+ seconds (unusable!)

#### After Optimization
- Load time on Fast 3G: 8-15 seconds (acceptable)

---

## Test 6: Check Production Build Artifacts

### Verify Production Build is Active:

```bash
ssh kunye@165.22.227.234

# Check if files are minified and have hashes
docker exec react_frontend ls -la /usr/share/nginx/html/assets/

# Should see files like:
# index-a1b2c3d4.js
# vendor-e5f6g7h8.js
# mui-i9j0k1l2.js
```

**Development mode** would show:
- Files in `/app/src/` instead of `/usr/share/nginx/html/`
- No hashes in filenames
- Larger, unoptimized files

**Production mode** shows:
- Files in `/usr/share/nginx/html/assets/`
- Hashes in all filenames
- Minified, optimized bundles

---

## Test 7: Cache Verification

### Steps:
1. Load page normally (Network tab open)
2. Look at individual resource requests
3. Check "Size" column

### What to Look For:

**First Load:**
```
index-abc123.js    500 KB    (from server)
vendor-def456.js   800 KB    (from server)
```

**Second Load (after refresh):**
```
index-abc123.js    (disk cache)
vendor-def456.js   (disk cache)
```

This means caching is working! 🎉

---

## Test 8: Mobile Performance

### Using Chrome DevTools:

1. Press F12
2. Click "Toggle device toolbar" (phone icon) or Ctrl+Shift+M
3. Select a mobile device (e.g., "iPhone 12 Pro")
4. Reload page
5. Record load time

### Expected Results:

#### Before Optimization
- Mobile load time: 20-45 seconds

#### After Optimization
- Mobile load time: 3-8 seconds

---

## Benchmarking Template

Use this table to record your results:

| Test | Before (Dev) | After (Prod) | Improvement |
|------|-------------|--------------|-------------|
| Initial Load (ms) | | | |
| Subsequent Load (ms) | | | |
| Total Transfer Size (MB) | | | |
| DOMContentLoaded (ms) | | | |
| Number of JS Files | | | |
| Largest JS File (MB) | | | |
| Fast 3G Load (sec) | | | |
| Mobile Load (sec) | | | |
| Gzip Enabled? | No | | |
| Assets Cached? | No | | |

---

## Automated Testing (Optional)

### Using Lighthouse (Built into Chrome):

1. Open DevTools (F12)
2. Go to "Lighthouse" tab
3. Select:
   - Mode: Navigation
   - Device: Mobile or Desktop
   - Categories: Performance
4. Click "Analyze page load"

### Target Scores After Optimization:

- Performance: **70-90** (was probably 10-30)
- First Contentful Paint: **< 2s** (was 5-10s)
- Largest Contentful Paint: **< 3s** (was 10-20s)
- Time to Interactive: **< 4s** (was 15-30s)

---

## Red Flags

If you see these after "optimization", something went wrong:

🚩 Load time still > 10 seconds  
🚩 No file hashes in JS filenames  
🚩 No gzip compression in response headers  
🚩 Only 1-2 JavaScript files instead of many chunks  
🚩 Files served from `/src/` instead of `/assets/`  
🚩 Lighthouse Performance score < 50  

**Solution:** Check `QUICK_PERFORMANCE_FIX.md` troubleshooting section.

---

## Success Indicators

You should see:

✅ Initial load < 5 seconds  
✅ Subsequent loads < 1 second  
✅ Multiple JavaScript chunks (vendor, mui, charts, etc.)  
✅ Files have hashes (e.g., `index-a1b2c3.js`)  
✅ Gzip compression active  
✅ Assets cached on reload (304 or from cache)  
✅ Lighthouse Performance score > 70  
✅ Mobile load time < 8 seconds  

---

## Share Your Results

After testing, share with team:

```
Performance Test Results - [Date]

Before Optimization:
- Initial Load: XX seconds
- Bundle Size: XX MB
- Performance Score: XX/100

After Optimization:
- Initial Load: XX seconds  
- Bundle Size: XX MB
- Performance Score: XX/100

Improvement: XX% faster! 🚀
```

---

## Next Steps

If performance is still not acceptable after optimization:

1. Check `OPTIONAL_LAZY_LOADING.md` for additional 40-60% improvement
2. Review `PRODUCTION_PERFORMANCE_GUIDE.md` for advanced optimizations
3. Consider CDN for global users
4. Optimize images in `/uploads` directory
5. Review database query performance (API side)


