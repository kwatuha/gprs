#!/bin/bash
# Export schema from remote PostgreSQL database
# Usage: ./export-remote-postgres-schema.sh [password]

REMOTE_HOST="74.208.68.65"
REMOTE_USER="postgres"
REMOTE_PASSWORD="${REMOTE_PG_PASSWORD:-r2MdF1Aq}"
REMOTE_DB="government_projects"
OUTPUT_FILE="scripts/migration/schema/remote-postgres-schema.sql"

# Get password from argument, environment variable, or use default
if [ -n "$1" ]; then
    PASSWORD="$1"
elif [ -n "$REMOTE_PG_PASSWORD" ]; then
    PASSWORD="$REMOTE_PG_PASSWORD"
else
    PASSWORD="r2MdF1Aq"
fi

echo "Exporting schema from remote PostgreSQL database..."

# Export schema only (no data)
PGPASSWORD="$PASSWORD" pg_dump -h "$REMOTE_HOST" -U "$REMOTE_USER" -d "$REMOTE_DB" \
    --schema-only \
    --no-owner \
    --no-privileges \
    --file="$OUTPUT_FILE"

if [ $? -eq 0 ]; then
    echo "✓ Schema exported to $OUTPUT_FILE"
    
    # Also export table list
    PGPASSWORD="$PASSWORD" psql -h "$REMOTE_HOST" -U "$REMOTE_USER" -d "$REMOTE_DB" \
        -c "\dt" > "scripts/migration/schema/remote-postgres-tables.txt" 2>&1
    
    # Export table count
    PGPASSWORD="$PASSWORD" psql -h "$REMOTE_HOST" -U "$REMOTE_USER" -d "$REMOTE_DB" \
        -c "SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'public';" \
        >> "scripts/migration/schema/remote-postgres-tables.txt" 2>&1
    
    echo "✓ Table list exported"
else
    echo "✗ Failed to export schema"
    exit 1
fi
