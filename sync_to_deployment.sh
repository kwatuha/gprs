#!/bin/bash
# Sync modified files to deployment server 102.210.149.119
# Review this script before running

DEPLOYMENT_HOST="102.210.149.119"
DEPLOYMENT_USER="${DEPLOYMENT_USER:-root}"  # Change if different user
DEPLOYMENT_PATH="${DEPLOYMENT_PATH:-/path/to/government_projects}"  # Update with actual path

# Files we modified
FILES=(
    "api/routes/projectRoutes.js"
    "frontend/src/pages/CentralImportPage.jsx"
    "frontend/src/configs/projectTableConfig.js"
    "frontend/src/pages/ProjectManagementPage.jsx"
    "frontend/src/configs/menuConfig.json"
)

echo "=========================================="
echo "Files to sync to ${DEPLOYMENT_HOST}:"
echo "=========================================="
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file"
    else
        echo "  ✗ $file (NOT FOUND)"
    fi
done
echo ""

# Dry run first (shows what would be synced without actually doing it)
echo "DRY RUN - Showing what would be synced:"
echo "----------------------------------------"
rsync -avzn --progress \
    "${FILES[@]}" \
    "${DEPLOYMENT_USER}@${DEPLOYMENT_HOST}:${DEPLOYMENT_PATH}/"

echo ""
echo "=========================================="
echo "To actually sync, run:"
echo "  rsync -avz --progress \\"
echo "      ${FILES[@]} \\"
echo "      ${DEPLOYMENT_USER}@${DEPLOYMENT_HOST}:${DEPLOYMENT_PATH}/"
echo ""
echo "Or uncomment the line below and run this script again"
echo "=========================================="

# Uncomment the line below to actually perform the sync
# rsync -avz --progress "${FILES[@]}" "${DEPLOYMENT_USER}@${DEPLOYMENT_HOST}:${DEPLOYMENT_PATH}/"
