# Project Form Redesign Plan

## Current Issues
1. Projects can be created without sites
2. Project-level budget exists separately from site budgets
3. No project category/type to determine relevant fields
4. Sites are optional, but projects should require at least one site

## Proposed Solution

### 1. Project Category/Type Selection
- Add project category/type dropdown at the top
- Categories determine which site fields are shown:
  - **Healthcare**: bed_capacity, units (wards/rooms)
  - **Education**: units (classrooms), acreage
  - **Infrastructure**: acreage, units (kilometers for roads)
  - **Markets**: stalls, units (shops)
  - **Public Facilities**: units, acreage
  - **Offices**: units (offices), acreage

### 2. Form Structure
**Option A: Two-Step Wizard (Recommended)**
1. **Step 1: Project Basic Info**
   - Project Name (required)
   - Project Description
   - Sector
   - Category/Type (required) - determines site fields
   - Implementing Agency
   - Ministry
   - State Department
   - Status
   - Start/End Dates (project-level)
   - Geographical Coverage (counties, subcounties, wards)

2. **Step 2: Project Sites** (Required - at least one)
   - Add sites with category-specific fields
   - Site-level budget, status, progress
   - Project-level budget calculated from sites (with override option)

**Option B: Single Form with Required Sites**
- All fields in one form
- Sites section is required
- At least one site must be added before submission
- Project budget auto-calculated from sites (can override)

### 3. Budget Handling
- **Site-level budgets**: contract_sum_kes, approved_cost_kes, amount_disbursed_kes
- **Project-level budget**: 
  - Auto-calculated as sum of all site budgets
  - Allow manual override (for planning vs actual)
  - Show breakdown: "Total from sites: X, Override: Y"

### 4. Site Fields by Category
```javascript
const SITE_FIELDS_BY_CATEGORY = {
  'Healthcare': ['bed_capacity', 'units', 'acreage'],
  'Education': ['units', 'acreage'],
  'Infrastructure': ['acreage', 'units'], // units = km for roads
  'Markets': ['stalls', 'units', 'acreage'],
  'Public Facilities': ['units', 'acreage'],
  'Offices': ['units', 'acreage'],
  'Default': ['units', 'stalls', 'bed_capacity', 'acreage'] // Show all
};
```

### 5. Adding Sites to Existing Projects
- Separate "Manage Sites" button/page for existing projects
- Can add/edit/delete sites
- Recalculate project budget when sites change
- Show warning if project has no sites

### 6. Form Validation
- Project name: required
- Category/Type: required
- At least one site: required
- Each site must have: site_name, location (county/ward), budget info

## Implementation Steps
1. Add project category/type dropdown
2. Make sites section required
3. Add budget calculation logic
4. Implement category-based field visibility
5. Add validation for required sites
6. Create separate site management interface
