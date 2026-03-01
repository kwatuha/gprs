# 🎨 Theme Quick Reference Card

## One-Page Color Guide

### **Primary Colors:**
```
#1976d2  ████████  Blue (Primary)
#9c27b0  ████████  Purple (Secondary)
```

### **Status Colors:**
```
#4caf50  ████████  Success / Completed
#ff9800  ████████  Warning / At Risk
#f44336  ████████  Error / Stalled
#29b6f6  ████████  Info / Ongoing
```

### **Background Colors:**
```
#f5f7fa  ░░░░░░░░  Main background
#ffffff  ████████  Cards/Paper
#f0f2f5  ▒▒▒▒▒▒▒▒  Hover
#e3f2fd  ▓▓▓▓▓▓▓▓  Selected
```

### **Text Colors:**
```
#1a202c  ████████  Primary text
#718096  ████████  Secondary text
#cbd5e0  ░░░░░░░░  Disabled text
```

### **Grey Scale:**
```
#fafafa  ░░░░░░░░  Grey 50 (Lightest)
#f5f5f5  ░░░░░░░░  Grey 100
#eeeeee  ▒▒▒▒▒▒▒▒  Grey 200
#e0e0e0  ▒▒▒▒▒▒▒▒  Grey 300
#bdbdbd  ▓▓▓▓▓▓▓▓  Grey 400
#9e9e9e  ▓▓▓▓▓▓▓▓  Grey 500 (Medium)
#757575  ████████  Grey 600
#616161  ████████  Grey 700
#424242  ████████  Grey 800
#212121  ████████  Grey 900 (Darkest)
```

### **Gradients:**
```
Purple:  #667eea → #764ba2
Blue:    #4facfe → #00f2fe
Pink:    #f093fb → #f5576c
Orange:  #fa709a → #fee140
Green:   #30cfd0 → #330867
Sunset:  #ff6e7f → #bfe9ff
```

---

## Quick Usage Examples

### **1. Apply Primary Color:**
```javascript
sx={{ color: theme.palette.primary.main }}
```

### **2. Use Gradient:**
```javascript
sx={{ background: getGradient('purple') }}
```

### **3. Status Color:**
```javascript
sx={{ backgroundColor: getStatusColor('Completed') }}
```

### **4. Text Color:**
```javascript
sx={{ color: theme.palette.text.secondary }}
```

### **5. Background:**
```javascript
sx={{ backgroundColor: theme.palette.background.paper }}
```

---

## Common Patterns

### **Card with Gradient Header:**
```javascript
<Card>
  <Box sx={{ background: getGradient('purple'), p: 2, color: 'white' }}>
    Header
  </Box>
  <CardContent>
    Content
  </CardContent>
</Card>
```

### **Hover Effect:**
```javascript
sx={{
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    transform: 'translateY(-4px)'
  }
}}
```

### **Status Chip:**
```javascript
<Chip
  label={status}
  sx={{
    backgroundColor: getStatusColor(status),
    color: 'white'
  }}
/>
```

---

## File Location

**Main Theme File:**
```
/frontend/src/theme/modernTheme.js
```

**To Customize:**
1. Edit colors in modernTheme.js
2. Rebuild: `npm run build`
3. Restart: `docker compose restart frontend`

---

## Key Benefits

✅ **No Mode Toggle** - Single, consistent theme  
✅ **Clear Naming** - `theme.palette.primary.main` (not `colors.grey[100]`)  
✅ **Easy Customization** - All colors in one file  
✅ **Modern Look** - Inspired by public dashboard  
✅ **Gradient Support** - Beautiful visual effects  
✅ **Utility Functions** - Helper functions included  

---

**Full Documentation:** `/MODERN_THEME_GUIDE.md`

**Test Live:** `http://165.22.227.234/impes/`


