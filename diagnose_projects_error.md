# Project Loading Error - Diagnostic Guide

## Error: "Failed to load projects. Please try again later."

### Quick Diagnostic Steps:

#### 1. Check Browser Console
Open your browser's developer console (F12) and look for:
- **Network errors**: Check if the API call to `/api/projects` is failing
- **Status code**: Look for 401 (auth), 403 (permission), 500 (server error)
- **Error messages**: Any detailed error messages in the console

#### 2. Check User Privileges
The user must have the `project.read_all` privilege to view projects.

**To verify:**
```sql
-- Check user privileges
SELECT u.username, u.roleName, p.privilegeName 
FROM kemri_users u
JOIN kemri_user_privileges up ON u.userId = up.userId
JOIN kemri_privileges p ON up.privilegeId = p.privilegeId
WHERE u.username = 'YOUR_USERNAME';
```

**To grant the privilege:**
```sql
-- Find the privilege ID
SELECT privilegeId FROM kemri_privileges WHERE privilegeName = 'project.read_all';

-- Grant to user (replace USER_ID and PRIVILEGE_ID)
INSERT INTO kemri_user_privileges (userId, privilegeId)
VALUES (USER_ID, PRIVILEGE_ID);
```

#### 3. Check Backend API
Test if the backend is running:
```bash
# From the project root
cd /home/dev/dev/imes
curl http://165.22.227.234:3000/api/projects -H "Authorization: Bearer YOUR_TOKEN"
```

#### 4. Check Database Connection
Verify the database is accessible:
```bash
# Test database connection
mysql -u YOUR_DB_USER -p YOUR_DB_NAME -e "SELECT COUNT(*) FROM kemri_projects WHERE voided = 0;"
```

#### 5. Check API Logs
Look at the backend logs for error details:
```bash
# If running in Docker
docker logs imes-api-1

# If running directly
# Check the terminal where you started the backend
```

### Common Fixes:

#### Fix 1: Grant Project Reading Privilege
```sql
-- For admin user
INSERT INTO kemri_user_privileges (userId, privilegeId)
SELECT u.userId, p.privilegeId 
FROM kemri_users u, kemri_privileges p
WHERE u.username = 'admin' 
AND p.privilegeName = 'project.read_all'
AND NOT EXISTS (
    SELECT 1 FROM kemri_user_privileges up 
    WHERE up.userId = u.userId AND up.privilegeId = p.privilegeId
);
```

#### Fix 2: Restart Backend Service
```bash
cd /home/dev/dev/imes
# If using Docker
docker-compose restart api

# If running directly
# Stop the current process (Ctrl+C) and restart
cd api
npm start
```

#### Fix 3: Clear Browser Cache & Re-login
1. Clear browser cache (Ctrl+Shift+Delete)
2. Logout of the application
3. Login again

#### Fix 4: Check Environment Variables
Ensure the API URL is correctly configured:

**File:** `/home/dev/dev/imes/frontend/src/api/axiosInstance.js`
```javascript
// Should point to your backend
const axiosInstance = axios.create({
  baseURL: 'http://165.22.227.234:3000/api',  // Verify this is correct
  // ...
});
```

### Error Code Meanings:

| Status Code | Meaning | Solution |
|-------------|---------|----------|
| 401 | Unauthorized | Re-login or check token expiration |
| 403 | Forbidden | Check user privileges |
| 404 | Not Found | Verify API route is registered |
| 500 | Server Error | Check backend logs and database |
| Network Error | Backend Down | Verify backend is running |

### Debug Mode:

Add more detailed logging to see what's happening:

1. **Frontend (temporary debug)**:
   Edit `/home/dev/dev/imes/frontend/src/hooks/useProjectData.jsx` line 42:
   ```javascript
   } catch (err) {
     console.error("Error fetching projects:", err);
     console.error("Error response:", err.response);  // ADD THIS
     console.error("Error message:", err.message);     // ADD THIS
     console.error("Error status:", err.response?.status); // ADD THIS
     setProjects([]);
     setError(err.response?.data?.message || err.message || "Failed to load projects. Please try again.");
   }
   ```

2. **Backend (temporary debug)**:
   Edit `/home/dev/dev/imes/api/routes/projectRoutes.js` line 600:
   ```javascript
   } catch (error) {
     console.error('Error fetching projects:', error);
     console.error('Error stack:', error.stack);  // ADD THIS
     console.error('Error query:', query);         // ADD THIS
     res.status(500).json({ message: 'Error fetching projects', error: error.message });
   }
   ```

### Still Having Issues?

Please provide the following information:
1. Browser console error messages
2. Backend log output
3. HTTP status code from the failed request
4. Your username and role
5. Whether you're running locally or in Docker

