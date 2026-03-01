#!/bin/bash

# Production Deployment Script for IMPES Application
# This script deploys the optimized production build

set -e  # Exit on error

echo "============================================"
echo "IMPES Production Deployment Script"
echo "============================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
REMOTE_USER="kunye"
REMOTE_HOST="165.22.227.234"
REMOTE_PATH="/projects"
LOCAL_PATH="$(pwd)"

echo -e "${BLUE}Step 1: Stopping existing containers (if any)...${NC}"
ssh ${REMOTE_USER}@${REMOTE_HOST} "cd ${REMOTE_PATH} && (docker-compose -f docker-compose.prod.yml down 2>/dev/null || docker-compose down 2>/dev/null || true)"

echo -e "${BLUE}Step 2: Syncing files to remote server...${NC}"
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude 'frontend/dist' \
  --exclude 'frontend/node_modules' \
  --exclude 'api/node_modules' \
  --exclude 'public-dashboard/node_modules' \
  --exclude 'uploads' \
  "${LOCAL_PATH}/" "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/"

echo -e "${BLUE}Step 3: Building and starting containers on remote server...${NC}"
ssh ${REMOTE_USER}@${REMOTE_HOST} << 'EOF'
cd /projects

echo "Building frontend with production optimizations..."
docker-compose -f docker-compose.prod.yml build --no-cache frontend

echo "Building public-dashboard with production optimizations..."
docker-compose -f docker-compose.prod.yml build --no-cache public-dashboard

echo "Starting all services..."
docker-compose -f docker-compose.prod.yml up -d

echo "Waiting for services to be healthy..."
sleep 10

echo "Checking container status..."
docker-compose -f docker-compose.prod.yml ps

echo "Pruning unused images to save space..."
docker image prune -f

echo ""
echo "============================================"
echo "Deployment Complete!"
echo "============================================"
echo "Access your application at: http://165.22.227.234:8080/impes/"
echo ""
echo "Useful commands:"
echo "  View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "  Restart:   docker-compose -f docker-compose.prod.yml restart"
echo "  Stop:      docker-compose -f docker-compose.prod.yml down"
echo ""
EOF

echo -e "${GREEN}✓ Deployment successful!${NC}"
echo -e "${YELLOW}Note: The first load may take a moment as the browser caches assets.${NC}"
echo -e "${YELLOW}      Subsequent loads will be much faster.${NC}"

