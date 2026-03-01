# 🧪 Chat System Testing Guide

## ✅ **CURRENT STATUS:**

### **🟢 All Systems Running:**
- **Backend API**: ✅ Running on port 3000 with Socket.IO
- **Frontend**: ✅ Running on port 5173 with Vite
- **Nginx Proxy**: ✅ Running on port 8080 with WebSocket support
- **Database**: ✅ MySQL with chat schema and default rooms
- **Dependencies**: ✅ socket.io and socket.io-client installed

### **🔧 Recent Fixes Applied:**
1. **Socket.IO Dependencies**: Installed in both Docker containers
2. **WebSocket Proxy**: Added Socket.IO support to Nginx configuration
3. **Connection URL**: Updated ChatContext to use correct proxy URL
4. **Container Networking**: Configured proper container communication

---

## 🎯 **HOW TO TEST THE CHAT SYSTEM:**

### **Step 1: Access the Application**
1. **Open Browser**: Navigate to `http://165.22.227.234:5173/impes/`
2. **Login**: Use your existing admin credentials
3. **Wait for Load**: Ensure the dashboard loads completely

### **Step 2: Check Chat Integration**
1. **Look for Chat Button**: Green floating chat button in bottom-right corner
2. **Check Dashboard Card**: "Recent Conversations" card on collaboration tab
3. **Verify Connection**: Check browser console for Socket.IO connection messages

### **Step 3: Test Chat Functionality**
1. **Open Chat**: Click the floating chat button
2. **Select Room**: Choose "General Discussion" from the left sidebar
3. **Send Message**: Type "Hello, testing chat!" and press Enter
4. **Upload File**: Click attachment icon and upload an image
5. **Reply to Message**: Click reply icon on a message

### **Step 4: Test Real-time Features**
1. **Open Second Tab**: Open another browser tab with the same URL
2. **Login Again**: Use the same or different user account
3. **Send Messages**: Send messages from both tabs
4. **Verify Real-time**: Messages should appear instantly in both tabs
5. **Check Typing**: Start typing in one tab, see typing indicator in the other

---

## 🔍 **DEBUGGING STEPS:**

### **If Chat Button Doesn't Appear:**
```bash
# Check if user has chat permissions
docker exec -i db mysql -u impesUser -pAdmin2010impes imbesdb -e "
SELECT u.firstName, u.lastName, r.roleName, p.privilegeName 
FROM kemri_users u 
JOIN kemri_roles r ON u.roleId = r.roleId 
JOIN kemri_role_privileges rp ON r.roleId = rp.roleId 
JOIN kemri_privileges p ON rp.privilegeId = p.privilegeId 
WHERE p.privilegeName LIKE 'chat.%' AND u.userId = 1;"
```

### **If Socket.IO Connection Fails:**
1. **Check Browser Console**: Look for connection errors
2. **Verify Nginx**: `curl -I http://165.22.227.234:8080/socket.io/`
3. **Check Backend**: `docker logs node_api --tail 20`
4. **Check Frontend**: `docker logs react_frontend --tail 20`

### **If Messages Don't Send:**
```bash
# Test API endpoint directly
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -X GET http://165.22.227.234:8080/api/chat/rooms
```

### **If Database Issues:**
```bash
# Check chat tables exist
docker exec -i db mysql -u impesUser -pAdmin2010impes imbesdb -e "
SHOW TABLES LIKE 'chat_%';"

# Check default rooms
docker exec -i db mysql -u impesUser -pAdmin2010impes imbesdb -e "
SELECT * FROM chat_rooms;"
```

---

## 🚀 **EXPECTED BEHAVIOR:**

### **✅ When Working Correctly:**
1. **Floating Chat Button**: Visible in bottom-right corner
2. **Socket.IO Connection**: Console shows "Connected to chat server"
3. **Room List**: Shows 3 default rooms (General Discussion, Project Updates, Technical Support)
4. **Real-time Messaging**: Messages appear instantly without page refresh
5. **File Upload**: Images and documents upload successfully
6. **Typing Indicators**: Shows when other users are typing
7. **Unread Counts**: Badge shows number of unread messages

### **🎨 UI Features:**
- **Material-UI Design**: Consistent with dashboard theme
- **WhatsApp-style Bubbles**: Modern message display
- **Responsive Layout**: Works on mobile and desktop
- **Dark/Light Mode**: Matches current theme setting

---

## 📊 **PERFORMANCE INDICATORS:**

### **🟢 Good Performance:**
- **Message Delivery**: < 100ms for local network
- **File Upload**: < 5 seconds for images under 5MB
- **Room Loading**: < 2 seconds for message history
- **Connection Time**: < 3 seconds for Socket.IO handshake

### **🔴 Performance Issues:**
- **Slow Messages**: > 1 second delivery time
- **Connection Drops**: Frequent disconnections
- **Upload Failures**: Files not uploading
- **Memory Leaks**: Browser tab consuming excessive memory

---

## 🛠 **TROUBLESHOOTING COMMANDS:**

### **Restart All Services:**
```bash
cd /home/dev/dev/imes
docker restart nginx_proxy react_frontend node_api
```

### **Check Service Status:**
```bash
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

### **View Real-time Logs:**
```bash
# Backend logs
docker logs -f node_api

# Frontend logs
docker logs -f react_frontend

# Nginx logs
docker logs -f nginx_proxy
```

### **Test Network Connectivity:**
```bash
# Test API
curl http://165.22.227.234:8080/api/chat/rooms

# Test Socket.IO
curl http://165.22.227.234:8080/socket.io/

# Test Frontend
curl http://165.22.227.234:5173/impes/
```

---

## 🎉 **SUCCESS CRITERIA:**

### **✅ Chat System is Working When:**
1. **Authentication**: Users can login and access dashboard
2. **Chat Button**: Floating button appears for authenticated users
3. **Room Access**: Users can see and join default chat rooms
4. **Messaging**: Users can send and receive messages in real-time
5. **File Sharing**: Users can upload and share images/documents
6. **Notifications**: Unread message counts update correctly
7. **Multi-user**: Multiple users can chat simultaneously
8. **Persistence**: Messages are saved and loaded from database

### **🚀 Ready for Production When:**
- All success criteria met ✅
- No console errors ✅
- Performance within acceptable limits ✅
- Cross-browser compatibility verified ✅
- Mobile responsiveness confirmed ✅

---

## 📞 **SUPPORT:**

### **If Issues Persist:**
1. **Check Documentation**: Review `CHAT_IMPLEMENTATION_PLAN.md`
2. **Verify Configuration**: Compare with `CHAT_IMPLEMENTATION_STATUS.md`
3. **Database Schema**: Ensure all chat tables exist and have data
4. **Container Logs**: Check all container logs for errors
5. **Network Issues**: Verify Docker networking and port mappings

### **Common Solutions:**
- **Permission Denied**: Check user roles and chat privileges
- **Connection Failed**: Restart containers and check network
- **Import Errors**: Verify socket.io-client is installed in container
- **CORS Issues**: Check backend CORS configuration
- **Database Errors**: Verify MySQL container and connection

---

**The chat system should now be fully functional! 🎉**

*Test thoroughly and enjoy your new internal communication system!*








