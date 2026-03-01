#!/bin/bash

# Script to set up Citizen Proposals, County Proposed Projects, and Project Announcements
# Usage: ./api/scripts/setup_citizen_features.sh [database_name] [username] [password]

DB_NAME=${1:-"imbesdb"}
DB_USER=${2:-"root"}
DB_PASS=${3:-""}

if [ -z "$DB_PASS" ]; then
    echo "Usage: $0 [database_name] [username] [password]"
    echo "Example: $0 imbesdb root mypassword"
    exit 1
fi

echo "Setting up Citizen Features tables..."
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo ""

# Run migrations (using safe versions that handle missing kemri_users table)
echo "1. Creating citizen_proposals table..."
if [ -f "api/migrations/create_citizen_proposals_table_safe.sql" ]; then
    mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < api/migrations/create_citizen_proposals_table_safe.sql
else
    mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < api/migrations/create_citizen_proposals_table.sql
fi

echo "2. Creating county_proposed_projects tables..."
if [ -f "api/migrations/create_county_proposed_projects_table_safe.sql" ]; then
    mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < api/migrations/create_county_proposed_projects_table_safe.sql
else
    mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < api/migrations/create_county_proposed_projects_table.sql
fi

echo "3. Creating project_announcements table..."
if [ -f "api/migrations/create_project_announcements_table_safe.sql" ]; then
    mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < api/migrations/create_project_announcements_table_safe.sql
else
    mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < api/migrations/create_project_announcements_table.sql
fi

echo "4. Seeding sample data..."
mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < api/migrations/seed_sample_data.sql

echo ""
echo "Setup complete!"
echo "Run 'node api/scripts/check_tables_exist.js' to verify tables were created."

