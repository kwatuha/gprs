#!/bin/bash

# Script to add missing financial years to the database
# This script can be run from the host machine

echo "=========================================="
echo "Financial Years Population Script"
echo "=========================================="
echo ""

# Check if Docker containers are running
if ! docker ps | grep -q "node_api"; then
    echo "Error: node_api container is not running."
    echo "Please start your Docker containers first: docker-compose up -d"
    exit 1
fi

if ! docker ps | grep -q "mysql_db\|db"; then
    echo "Error: MySQL database container is not running."
    echo "Please start your Docker containers first: docker-compose up -d"
    exit 1
fi

echo "Running financial years population script..."
echo ""

# Run the Node.js script inside the API container
docker exec -it node_api node /app/scripts/add_missing_financial_years.js

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "Script completed successfully!"
    echo "=========================================="
else
    echo ""
    echo "=========================================="
    echo "Script failed. Please check the errors above."
    echo "=========================================="
    exit 1
fi


