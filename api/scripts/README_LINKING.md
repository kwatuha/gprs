# Milestone-Activity Linking Guide

## Overview

This document explains how milestones and activities are linked in the system and when to use each approach.

## How the Linking Works

### Data Flow:
1. **Project** → has a `categoryId` → Category has milestone templates
2. **Project** → has a `subProgramId` → SubProgram has Workplans
3. **Workplan** → has Activities
4. **Milestone** → linked to Activities via `kemri_milestone_activities` table

### Display Logic (ProjectDetailsPage):
- Fetches Workplans by `subProgramId`
- Fetches Activities linked to those Workplans
- Fetches Milestones for the Project
- Fetches Activity-Milestone links from `kemri_milestone_activities`
- Displays Workplans → Activities → Milestones

## When to Reimport vs Use Fix Script

### ✅ **Use the Fix Script** (`link_milestones_to_activities.js`) if:
- You already imported data and it's mostly correct
- Projects, activities, and milestones exist but aren't linked
- You want to avoid reimporting (preserves IDs, timestamps, etc.)
- You want to create missing milestones from category templates

### ✅ **Reimport** if:
- Data is incomplete or incorrect
- Many fields are missing
- You want fresh data from the cleaned Excel file
- Categories and milestone templates weren't set up before

## Running the Fix Script

### Option 1: Inside Docker Container
```bash
docker exec -it node_api node scripts/link_milestones_to_activities.js
```

### Option 2: If you have direct DB access
```bash
cd api
node scripts/link_milestones_to_activities.js
```

## What the Script Does

1. **Finds all projects with activities**
2. **For each project:**
   - Checks if milestones exist
   - If no milestones but category exists → Creates milestones from category templates
   - Links activities to milestones using:
     - Exact name matching
     - Fuzzy matching (keywords in names/descriptions)
     - Default linking to first milestone if no match found

3. **Creates links in `kemri_milestone_activities` table**

## Running Category Setup First

Before running the linking script, ensure categories have milestone templates:

```bash
docker exec -it node_api node scripts/create_project_categories_with_milestones.js
```

This creates:
- 8 project categories (Road Construction, Building Construction, etc.)
- Milestone templates for each category
- Proper sequence orders

## Verification

After running the script, check:
1. Project has milestones: `SELECT * FROM kemri_project_milestones WHERE projectId = ?`
2. Activities are linked: `SELECT * FROM kemri_milestone_activities WHERE milestoneId IN (SELECT milestoneId FROM kemri_project_milestones WHERE projectId = ?)`
3. Project details page shows Work Plans & Milestones tab with data

## Complete Workflow

```bash
# 1. Create categories with milestone templates
docker exec -it node_api node scripts/create_project_categories_with_milestones.js

# 2. Link existing milestones to activities
docker exec -it node_api node scripts/link_milestones_to_activities.js

# 3. Verify on project details page
# Navigate to: http://localhost:8080/impes/projects/{projectId}
# Check "Timeline & Milestones" tab
```

## Troubleshooting

### If milestones still don't show:
1. Check project has `categoryId`: `SELECT categoryId FROM kemri_projects WHERE id = ?`
2. Check category has milestone templates: `SELECT * FROM category_milestones WHERE categoryId = ?`
3. Check activities exist: `SELECT * FROM kemri_activities WHERE projectId = ?`
4. Check links exist: `SELECT * FROM kemri_milestone_activities WHERE milestoneId IN (...)`

### If workplans don't show:
1. Check project has `subProgramId`: `SELECT subProgramId FROM kemri_projects WHERE id = ?`
2. Check workplans exist: `SELECT * FROM kemri_annual_workplans WHERE subProgramId = ?`
3. Check activities are linked to workplan: `SELECT * FROM kemri_activities WHERE workplanId = ?`












