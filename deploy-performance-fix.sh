#!/bin/bash

# Performance Optimization Deployment Script
# Deploy optimized frontend configuration to remote server

set -e

# Configuration
REMOTE_USER="kunye"
REMOTE_HOST="165.22.227.234"
REMOTE_PATH="/projects/imes"
SSH_KEY="$HOME/.ssh/id_asusme"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}  Frontend Performance Optimization Deployment${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""

print_status() {
    echo -e "${YELLOW}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Step 1: Copy optimized files
print_status "Step 1: Copying optimized configuration files..."

echo "  - Copying vite.config.js..."
scp -i "$SSH_KEY" frontend/vite.config.js "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/frontend/"

echo "  - Copying optimized index.html..."
scp -i "$SSH_KEY" frontend/index.html "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/frontend/"

echo "  - Copying docker-compose.yml with HMR config..."
scp -i "$SSH_KEY" docker-compose.yml "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/"

print_success "All files copied"
echo ""

# Step 2: Restart container
print_status "Step 2: Restarting frontend container..."

ssh -i "$SSH_KEY" "$REMOTE_USER@$REMOTE_HOST" << 'ENDSSH'
cd /projects/imes

echo "  - Stopping frontend..."
docker-compose stop frontend

echo "  - Removing old container..."
docker-compose rm -f frontend

echo "  - Starting with optimized config..."
docker-compose up -d frontend

echo "  - Waiting 15 seconds for startup..."
sleep 15
ENDSSH

print_success "Container restarted"
echo ""

# Step 3: Verify deployment
print_status "Step 3: Verifying optimizations..."

ssh -i "$SSH_KEY" "$REMOTE_USER@$REMOTE_HOST" << 'ENDSSH'
cd /projects/imes

echo ""
echo "Container Status:"
docker ps | grep react_frontend

echo ""
echo "HMR Environment Variables:"
docker inspect react_frontend | grep -A 2 "VITE_HMR"

echo ""
echo "Recent Logs:"
docker-compose logs --tail=15 frontend

echo ""
echo "Testing HTTP Response:"
curl -s -I http://localhost:5175/impes/ | head -5
ENDSSH

echo ""
print_success "Deployment completed!"
echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}  Performance Improvements Applied:${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "✅ WebSocket/HMR fixed - connects to port 5175"
echo "✅ CDN preconnect/dns-prefetch added"
echo "✅ Scripts load async/defer (non-blocking)"
echo "✅ Dependency pre-bundling optimized"
echo "✅ Production build config added"
echo ""
echo "Expected Improvements:"
echo "  • ~50% faster first load time"
echo "  • No WebSocket connection errors"
echo "  • Parallel CDN resource loading"
echo "  • Better browser caching"
echo ""
echo -e "${YELLOW}Next: Clear browser cache and test at:${NC}"
echo -e "${YELLOW}  http://${REMOTE_HOST}:5175/impes/${NC}"
echo ""
echo "Use Ctrl+Shift+R (hard refresh) to clear browser cache"
echo ""


