#!/bin/bash
# scripts/create-county.sh
# Create a new county configuration from template

set -e

if [ -z "$1" ]; then
    echo "Usage: $0 <county-code> [county-name]"
    echo "Example: $0 nyando \"Nyando County\""
    exit 1
fi

COUNTY_CODE=$(echo "$1" | tr '[:upper:]' '[:lower:]')
COUNTY_NAME=${2:-"$(echo "$COUNTY_CODE" | sed 's/^./\U&/g') County"}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CONFIG_DIR="$PROJECT_ROOT/config/counties"
CONFIG_FILE="$CONFIG_DIR/${COUNTY_CODE}.json"

if [ -f "$CONFIG_FILE" ]; then
    echo "❌ County configuration already exists: $CONFIG_FILE"
    exit 1
fi

# Read default config as template
DEFAULT_CONFIG="$CONFIG_DIR/default.json"
if [ ! -f "$DEFAULT_CONFIG" ]; then
    echo "❌ Default configuration not found: $DEFAULT_CONFIG"
    exit 1
fi

echo "🏛️  Creating county configuration for: $COUNTY_NAME ($COUNTY_CODE)"
echo ""

# Generate unique ports (increment from default)
LAST_PORT_NGINX=$(ls "$CONFIG_DIR"/*.json 2>/dev/null | xargs -I{} node -e "try { const c = require('{}'); console.log(c.docker.ports.nginx || 8080); } catch(e) {}" | sort -n | tail -1 || echo "8080")
LAST_PORT_API=$(ls "$CONFIG_DIR"/*.json 2>/dev/null | xargs -I{} node -e "try { const c = require('{}'); console.log(c.docker.ports.api || 3000); } catch(e) {}" | sort -n | tail -1 || echo "3000")
LAST_PORT_MYSQL=$(ls "$CONFIG_DIR"/*.json 2>/dev/null | xargs -I{} node -e "try { const c = require('{}'); console.log(c.docker.ports.mysql || 3307); } catch(e) {}" | sort -n | tail -1 || echo "3307")

NEW_PORT_NGINX=$((LAST_PORT_NGINX + 1))
NEW_PORT_API=$((LAST_PORT_API + 1))
NEW_PORT_MYSQL=$((LAST_PORT_MYSQL + 1))
NEW_PORT_FRONTEND=$((NEW_PORT_NGINX + 100))
NEW_PORT_PUBLIC=$((NEW_PORT_NGINX + 101))

# Create config from template
node -e "
const fs = require('fs');
const defaultConfig = JSON.parse(fs.readFileSync('$DEFAULT_CONFIG', 'utf8'));

const newConfig = {
  ...defaultConfig,
  county: {
    code: '${COUNTY_CODE^^}',
    name: '${COUNTY_NAME}',
    displayName: '${COUNTY_NAME} Government'
  },
  database: {
    name: '${COUNTY_CODE}_db',
    seedFile: 'api/seeds/${COUNTY_CODE}_setup.sql'
  },
  docker: {
    ports: {
      nginx: $NEW_PORT_NGINX,
      frontend: $NEW_PORT_FRONTEND,
      publicDashboard: $NEW_PORT_PUBLIC,
      api: $NEW_PORT_API,
      mysql: $NEW_PORT_MYSQL
    },
    containers: {
      nginx: '${COUNTY_CODE}_nginx_proxy',
      frontend: '${COUNTY_CODE}_react_frontend',
      publicDashboard: '${COUNTY_CODE}_public_dashboard',
      api: '${COUNTY_CODE}_node_api',
      mysql: '${COUNTY_CODE}_db'
    },
    volumes: {
      mysql: '${COUNTY_CODE}_db_data'
    }
  },
  organization: {
    name: '${COUNTY_NAME} Government',
    contact: {
      email: 'info@${COUNTY_CODE}.go.ke',
      phone: '+254-XXX-XXXXXX',
      address: '${COUNTY_NAME} Headquarters',
      website: 'https://www.${COUNTY_CODE}.go.ke'
    }
  }
};

fs.writeFileSync('$CONFIG_FILE', JSON.stringify(newConfig, null, 2));
console.log('✓ Created configuration file');
"

echo "✓ County configuration created: $CONFIG_FILE"
echo ""
echo "📝 Next steps:"
echo "   1. Edit $CONFIG_FILE to customize:"
echo "      - Organization contact details"
echo "      - Labels (department, section, etc.)"
echo "      - Features enabled"
echo ""
echo "   2. Create seed file: $PROJECT_ROOT/api/seeds/${COUNTY_CODE}_setup.sql"
echo "      (You can copy from api/init.sql as a starting point)"
echo ""
echo "   3. Deploy the county:"
echo "      ./scripts/deploy-county.sh $COUNTY_CODE"
echo ""




