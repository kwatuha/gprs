# Projects Page Requirements

## Current Status
- ✅ **projects** table - CREATED (0 rows, need to migrate data)
- ✅ **users** table - EXISTS (26 users migrated)
- ✅ **categories** table - EXISTS

## Missing Tables (Required for Projects Page)

### Critical (PRIORITY 1) - Needed for basic functionality
1. **departments** - For project filtering and display
2. **sections** - For project filtering
3. **financialyears** - For project filtering
4. **programs** - For project filtering
5. **subprograms** - For project filtering

### Important (PRIORITY 2) - Needed for full functionality
6. **project_milestone_implementations** - Used for project categories (currently query fails)
7. **counties** - For location data
8. **subcounties** - For location data
9. **wards** - For location data
10. **staff** - For principal investigator information

### Optional (PRIORITY 3) - Nice to have
11. **project_counties** - Junction table for project-county relationships
12. **project_subcounties** - Junction table for project-subcounty relationships
13. **project_wards** - Junction table for project-ward relationships

## Data Migration Needed
- **72 projects** in MySQL need to be migrated to PostgreSQL
- Projects reference:
  - departments (departmentId)
  - sections (sectionId)
  - financialyears (finYearId)
  - programs (programId)
  - subprograms (subProgramId)
  - categories (categoryId)
  - users (userId)
  - staff (principalInvestigatorStaffId)

## Next Steps
1. Create missing tables (departments, sections, financialyears, programs, subprograms)
2. Migrate projects data from MySQL
3. Test projects page again
