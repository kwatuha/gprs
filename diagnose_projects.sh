#!/bin/bash

# Project Loading Diagnostic Script
echo "========================================"
echo "IMES Project Loading Diagnostic Tool"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Check if backend is running
echo "1. Checking if backend API is running..."
if curl -s http://165.22.227.234:3000/ > /dev/null; then
    echo -e "${GREEN}✓ Backend API is running${NC}"
else
    echo -e "${RED}✗ Backend API is NOT running${NC}"
    echo "  Solution: Start the backend with 'cd api && npm start' or 'docker-compose up'"
    exit 1
fi
echo ""

# 2. Check if database container is running (if using Docker)
echo "2. Checking if database is accessible..."
if command -v docker &> /dev/null; then
    if docker ps | grep -q mysql; then
        echo -e "${GREEN}✓ MySQL container is running${NC}"
    else
        echo -e "${YELLOW}⚠ MySQL container not found (might be running directly)${NC}"
    fi
fi
echo ""

# 3. Check if the projects endpoint is accessible
echo "3. Checking /api/projects endpoint (without auth)..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://165.22.227.234:3000/api/projects)
if [ "$RESPONSE" = "401" ]; then
    echo -e "${GREEN}✓ Endpoint exists (returns 401 - needs authentication)${NC}"
elif [ "$RESPONSE" = "200" ]; then
    echo -e "${GREEN}✓ Endpoint is accessible${NC}"
elif [ "$RESPONSE" = "500" ]; then
    echo -e "${RED}✗ Server error (500) - Check backend logs${NC}"
else
    echo -e "${YELLOW}⚠ Unexpected response code: $RESPONSE${NC}"
fi
echo ""

# 4. Check if frontend is running
echo "4. Checking if frontend is running..."
if curl -s http://165.22.227.234:5173/ > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend is running on port 5173${NC}"
elif curl -s http://165.22.227.234:3001/ > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend is running on port 3001${NC}"
else
    echo -e "${YELLOW}⚠ Frontend might not be running${NC}"
    echo "  Solution: Start with 'cd frontend && npm run dev'"
fi
echo ""

# 5. Check backend logs for errors
echo "5. Checking recent backend logs..."
if [ -f "api/package.json" ]; then
    echo -e "${YELLOW}Backend log check:${NC}"
    echo "  Run: 'docker logs imes-api-1 --tail 50' (if using Docker)"
    echo "  Or check the terminal where you started 'npm start'"
fi
echo ""

# 6. Provide next steps
echo "========================================"
echo "Next Steps:"
echo "========================================"
echo "1. Open your browser's Developer Console (F12)"
echo "2. Go to the Network tab"
echo "3. Try to load projects again"
echo "4. Look for the /api/projects request"
echo "5. Check the Status Code and Response"
echo ""
echo "Common Issues:"
echo "- 401: Not authenticated - try logging out and back in"
echo "- 403: No permission - user needs 'project.read_all' privilege"
echo "- 500: Server error - check backend logs"
echo "- Network Error: Backend not running or wrong URL"
echo ""
echo "For detailed diagnostic guide, see:"
echo "  ./diagnose_projects_error.md"
echo "========================================"

