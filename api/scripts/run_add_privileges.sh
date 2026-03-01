#!/bin/bash

# Script to add privileges for County Proposed Projects and Project Announcements
# This script runs the SQL migration to add the new privileges

DB_USER="impesUser"
DB_PASS="Admin2010impes"
DB_NAME="gov_imbesdb"
MIGRATION_FILE="api/migrations/add_county_projects_announcements_privileges.sql"

echo "Adding privileges for County Proposed Projects and Project Announcements..."

# Check if migration file exists
if [ ! -f "$MIGRATION_FILE" ]; then
    echo "Error: Migration file not found: $MIGRATION_FILE"
    exit 1
fi

# Run the migration
docker exec -i gov_db mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$MIGRATION_FILE"

if [ $? -eq 0 ]; then
    echo "✓ Privileges added successfully!"
    echo ""
    echo "The following privileges have been created:"
    echo "  - county_proposed_projects.read"
    echo "  - county_proposed_projects.create"
    echo "  - county_proposed_projects.update"
    echo "  - county_proposed_projects.delete"
    echo "  - project_announcements.read"
    echo "  - project_announcements.create"
    echo "  - project_announcements.update"
    echo "  - project_announcements.delete"
    echo ""
    echo "These privileges have been assigned to the admin role (roleId = 1)."
else
    echo "Error: Failed to add privileges. Please check the error messages above."
    exit 1
fi

