#!/bin/bash
# scripts/list-counties.sh
# List all available county configurations

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CONFIG_DIR="$PROJECT_ROOT/config/counties"

echo "🏛️  Available County Configurations:"
echo ""

if [ ! -d "$CONFIG_DIR" ]; then
    echo "❌ County configurations directory not found: $CONFIG_DIR"
    exit 1
fi

for config_file in "$CONFIG_DIR"/*.json; do
    if [ -f "$config_file" ]; then
        COUNTY_CODE=$(basename "$config_file" .json)
        COUNTY_NAME=$(node -e "try { const c = require('$config_file'); console.log(c.county.name || 'Unknown'); } catch(e) { console.log('Error'); }" 2>/dev/null)
        DB_NAME=$(node -e "try { const c = require('$config_file'); console.log(c.database.name || 'Unknown'); } catch(e) { console.log('Error'); }" 2>/dev/null)
        PORT_NGINX=$(node -e "try { const c = require('$config_file'); console.log(c.docker.ports.nginx || 'N/A'); } catch(e) { console.log('N/A'); }" 2>/dev/null)
        PORT_API=$(node -e "try { const c = require('$config_file'); console.log(c.docker.ports.api || 'N/A'); } catch(e) { console.log('N/A'); }" 2>/dev/null)
        
        echo "  📍 $COUNTY_NAME ($COUNTY_CODE)"
        echo "     Database: $DB_NAME"
        echo "     Ports: nginx=$PORT_NGINX, api=$PORT_API"
        echo ""
    fi
done

echo "💡 To deploy a county: ./scripts/deploy-county.sh <county-code>"
echo "💡 To create a new county: ./scripts/create-county.sh <county-code> \"County Name\""




