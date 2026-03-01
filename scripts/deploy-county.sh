#!/bin/bash
# scripts/deploy-county.sh
# Deploy application for a specific county

set -e

COUNTY_CODE=${1:-default}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "🏛️  Deploying for county: $COUNTY_CODE"
echo ""

# Export COUNTY_CODE for Node.js scripts
export COUNTY_CODE=$COUNTY_CODE

# Check if county config exists
CONFIG_FILE="$PROJECT_ROOT/config/counties/${COUNTY_CODE,,}.json"
if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ County configuration not found: $CONFIG_FILE"
    echo "Available counties:"
    ls -1 "$PROJECT_ROOT/config/counties"/*.json | xargs -n1 basename | sed 's/.json$//' | sed 's/^/  - /'
    exit 1
fi

echo "✓ Found county configuration: $CONFIG_FILE"
echo ""

# Generate docker-compose.yml
echo "📝 Generating docker-compose.yml..."
cd "$PROJECT_ROOT"
node scripts/generate-docker-compose.js "$COUNTY_CODE"

# Load county config to get database name
DB_NAME=$(node -e "const config = require('./config/counties/${COUNTY_CODE,,}.json'); console.log(config.database.name);")

echo ""
echo "🐳 Starting Docker containers for $COUNTY_CODE..."
echo "   Database: $DB_NAME"
echo ""

# Stop existing containers if running
echo "🛑 Stopping existing containers..."
docker-compose down 2>/dev/null || true

# Start new containers
echo "🚀 Starting containers..."
docker-compose up -d

echo ""
echo "✓ Deployment complete!"
echo ""
echo "📊 Access points:"
echo "   - Frontend: http://localhost:$(node -e "const config = require('./config/counties/${COUNTY_CODE,,}.json'); console.log(config.docker.ports.frontend);")"
echo "   - Public Dashboard: http://localhost:$(node -e "const config = require('./config/counties/${COUNTY_CODE,,}.json'); console.log(config.docker.ports.publicDashboard);")"
echo "   - API: http://localhost:$(node -e "const config = require('./config/counties/${COUNTY_CODE,,}.json'); console.log(config.docker.ports.api);")"
echo "   - Nginx: http://localhost:$(node -e "const config = require('./config/counties/${COUNTY_CODE,,}.json'); console.log(config.docker.ports.nginx);")"
echo ""
echo "📝 View logs: docker-compose logs -f"
echo "🛑 Stop: docker-compose down"




