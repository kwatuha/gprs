# Projects Table Comparison: Remote vs Local

## Overview

The remote PostgreSQL table uses a **modern JSONB-based design** with fewer columns, while the local table uses a **traditional relational design** with many individual columns.

---

## Remote PostgreSQL Table Structure
**Host:** 74.208.68.65  
**Database:** government_projects  
**Table:** projects  
**Total Columns:** 17

### Columns

| Column Name | Type | Nullable | Default | Description |
|------------|------|----------|---------|-------------|
| `project_id` | integer | NO | `nextval('projects_project_id_seq'::regclass)` | Primary key |
| `name` | text | NO | - | Project name |
| `description` | text | YES | - | Project description |
| `sector` | text | YES | - | Project sector |
| `implementing_agency` | text | YES | - | Implementing agency |
| `location` | **jsonb** | YES | - | **Location data (county, constituency, geocoordinates, etc.)** |
| `budget` | **jsonb** | YES | - | **Budget data (source, allocated_amount_kes, disbursed_amount_kes, etc.)** |
| `timeline` | **jsonb** | YES | - | **Timeline data (start_date, expected_completion_date, etc.)** |
| `progress` | **jsonb** | YES | - | **Progress data (status, percentage_complete, latest_update_summary, etc.)** |
| `public_engagement` | **jsonb** | YES | - | **Public engagement data (feedback_enabled, complaints_received, etc.)** |
| `data_sources` | **jsonb** | YES | - | **Data source information** |
| `created_at` | timestamp | YES | `CURRENT_TIMESTAMP` | Creation timestamp |
| `updated_at` | timestamp | YES | `CURRENT_TIMESTAMP` | Update timestamp |
| `name_tsv` | tsvector | YES | Generated | Full-text search vector (auto-generated) |
| `notes` | **jsonb** | YES | - | **Additional notes** |
| `ministry` | text | YES | - | Ministry |
| `state_department` | text | YES | - | State department |

### Indexes
- Primary key: `projects_pkey` on `project_id`
- Full-text search: `idx_projects_name_tsv` (GIN index on `name_tsv`)

### Foreign Key References (from other tables)
- `feedback.project_id` → `projects.project_id`
- `project_counties.project_id` → `projects.project_id`
- `public_wifi.project_id` → `projects.project_id`
- `project_rag_index.project_id` → `projects.project_id`
- `project_sites.project_id` → `projects.project_id`

---

## Local PostgreSQL Table Structure
**Host:** localhost:5433  
**Database:** government_projects  
**Table:** projects  
**Total Columns:** 41

### Columns

| Column Name | Type | Nullable | Default | Notes |
|------------|------|----------|---------|-------|
| `id` | integer | NO | `nextval('projects_id_seq'::regclass)` | Primary key (different name) |
| `projectname` | varchar(255) | YES | NULL | Maps to remote `name` |
| `projectdescription` | text | YES | - | Maps to remote `description` |
| `directorate` | varchar(255) | YES | NULL | Could map to remote `implementing_agency` or `state_department` |
| `startdate` | timestamp | YES | - | Should go into `timeline` JSONB |
| `enddate` | timestamp | YES | - | Should go into `timeline` JSONB |
| `costofproject` | numeric(15,2) | YES | NULL | Should go into `budget` JSONB |
| `paidout` | numeric(15,2) | YES | NULL | Should go into `budget` JSONB |
| `objective` | text | YES | - | Could go into `notes` JSONB |
| `expectedoutput` | text | YES | - | Could go into `notes` JSONB |
| `principalinvestigator` | text | YES | - | Could go into `notes` JSONB |
| `expectedoutcome` | text | YES | - | Could go into `notes` JSONB |
| `status` | varchar(255) | YES | NULL | Should go into `progress` JSONB |
| `statusreason` | text | YES | - | Should go into `progress` JSONB |
| `createdat` | timestamp | YES | `CURRENT_TIMESTAMP` | Maps to remote `created_at` |
| `principalinvestigatorstaffid` | integer | YES | - | Foreign key - could go into `notes` JSONB |
| `departmentid` | integer | YES | - | Foreign key - could map to remote `ministry` or `state_department` |
| `sectionid` | integer | YES | - | Foreign key - could map to remote `state_department` |
| `finyearid` | integer | YES | - | Could go into `timeline` JSONB |
| `programid` | integer | YES | - | Could go into `notes` JSONB |
| `subprogramid` | integer | YES | - | Could go into `notes` JSONB |
| `categoryid` | integer | YES | - | Could map to remote `sector` |
| `userid` | integer | YES | - | Could go into `data_sources` JSONB |
| `voided` | boolean | YES | false | **Not in remote - might need soft delete handling** |
| `updatedat` | timestamp | YES | `CURRENT_TIMESTAMP` | Maps to remote `updated_at` |
| `defaultphotoid` | integer | YES | - | Could go into `notes` JSONB |
| `overallprogress` | numeric(5,2) | YES | 0.00 | Should go into `progress` JSONB |
| `workflowid` | integer | YES | - | Could go into `notes` JSONB |
| `currentstageid` | integer | YES | - | Could go into `notes` JSONB |
| `approved_for_public` | boolean | YES | false | Should go into `public_engagement` JSONB |
| `approved_by` | integer | YES | - | Should go into `public_engagement` JSONB |
| `approved_at` | timestamp | YES | - | Should go into `public_engagement` JSONB |
| `approval_notes` | text | YES | - | Should go into `public_engagement` JSONB |
| `revision_requested` | boolean | YES | false | Should go into `public_engagement` JSONB |
| `revision_notes` | text | YES | - | Should go into `public_engagement` JSONB |
| `revision_requested_by` | integer | YES | - | Should go into `public_engagement` JSONB |
| `revision_requested_at` | timestamp | YES | - | Should go into `public_engagement` JSONB |
| `revision_submitted_at` | timestamp | YES | - | Should go into `public_engagement` JSONB |
| `budgetid` | integer | YES | - | Foreign key - could go into `budget` JSONB |
| `projectrefnum` | varchar(255) | YES | NULL | Could go into `data_sources` JSONB |
| `contracted` | boolean | YES | - | Could go into `budget` JSONB |

### Indexes
- Primary key: `projects_pkey` on `id`

---

## Key Differences

### 1. **Primary Key Column Name**
- **Remote:** `project_id`
- **Local:** `id`
- **Action:** Need to rename `id` → `project_id` or update all references

### 2. **Column Naming Convention**
- **Remote:** Uses `snake_case` (e.g., `created_at`, `updated_at`)
- **Local:** Uses `camelCase` (e.g., `createdat`, `updatedat`)
- **Action:** Standardize to `snake_case` to match remote

### 3. **Data Structure Approach**
- **Remote:** Uses **JSONB columns** to store structured data
  - `location` - stores geographic/location data
  - `budget` - stores financial data
  - `timeline` - stores date/time information
  - `progress` - stores status and progress information
  - `public_engagement` - stores approval/feedback data
  - `data_sources` - stores metadata
  - `notes` - stores additional notes
- **Local:** Uses **individual columns** for each piece of data
- **Action:** Consolidate related columns into JSONB columns

### 4. **Missing Columns in Local**
- `sector` - not directly mapped (could use `categoryid` lookup)
- `implementing_agency` - partially mapped to `directorate`
- `ministry` - not directly mapped (could use `departmentid` lookup)
- `state_department` - partially mapped to `sectionid`
- `name_tsv` - auto-generated full-text search vector (needs to be added)

### 5. **Extra Columns in Local**
- `voided` - soft delete flag (not in remote, but might be useful)
- Many foreign key columns (`departmentid`, `sectionid`, `finyearid`, etc.) - these should be stored as references in JSONB or removed if not needed

---

## Recommended Migration Strategy

### Phase 1: Add JSONB Columns (Non-Breaking)
1. Add new JSONB columns to local table:
   - `location` (jsonb)
   - `budget` (jsonb)
   - `timeline` (jsonb)
   - `progress` (jsonb)
   - `public_engagement` (jsonb)
   - `data_sources` (jsonb)
   - `notes` (jsonb)
   - `sector` (text)
   - `implementing_agency` (text)
   - `ministry` (text)
   - `state_department` (text)
   - `name_tsv` (tsvector, generated)

### Phase 2: Migrate Data to JSONB
2. Populate JSONB columns from existing columns:
   - **location:** Extract from `project_counties`, `project_subcounties`, `project_wards` tables (if they exist)
   - **budget:** Combine `costofproject`, `paidout`, `budgetid`, `contracted`
   - **timeline:** Combine `startdate`, `enddate`, `finyearid`
   - **progress:** Combine `status`, `statusreason`, `overallprogress`
   - **public_engagement:** Combine all approval/revision fields
   - **data_sources:** Store `projectrefnum`, `userid`, metadata
   - **notes:** Combine `objective`, `expectedoutput`, `expectedoutcome`, `principalinvestigator`, etc.

### Phase 3: Update Application Code
3. Update API routes to:
   - Read from JSONB columns instead of individual columns
   - Write to JSONB columns instead of individual columns
   - Handle JSONB queries (PostgreSQL JSONB operators)

### Phase 4: Rename Columns
4. Rename columns to match remote:
   - `id` → `project_id`
   - `projectname` → `name`
   - `projectdescription` → `description`
   - `createdat` → `created_at`
   - `updatedat` → `updated_at`

### Phase 5: Remove Old Columns (Optional)
5. After verifying everything works:
   - Drop old individual columns
   - Keep `voided` if soft delete is needed, or remove if not

---

## JSONB Column Structure Examples

### `location` JSONB
```json
{
  "county": "Nairobi",
  "constituency": "Westlands",
  "ward": "Parklands",
  "geocoordinates": {
    "lat": -1.2921,
    "lng": 36.8219
  }
}
```

### `budget` JSONB
```json
{
  "source": "Government",
  "allocated_amount_kes": 85000000.00,
  "disbursed_amount_kes": 50000000.00,
  "contracted": true,
  "budget_id": 123
}
```

### `timeline` JSONB
```json
{
  "start_date": "2024-12-24",
  "expected_completion_date": "2025-12-24",
  "financial_year": "FY2024/2025",
  "last_updated": "2024-01-15"
}
```

### `progress` JSONB
```json
{
  "status": "In Progress",
  "status_reason": "On schedule",
  "percentage_complete": 45.50,
  "latest_update_summary": "Project progressing well"
}
```

### `public_engagement` JSONB
```json
{
  "approved_for_public": true,
  "approved_by": 1,
  "approved_at": "2024-01-10T10:00:00Z",
  "approval_notes": "Approved for public viewing",
  "revision_requested": false,
  "feedback_enabled": true,
  "complaints_received": 0
}
```

### `data_sources` JSONB
```json
{
  "project_ref_num": "PRJ-2024-001",
  "created_by_user_id": 1,
  "source_system": "IMBES",
  "import_date": "2024-01-15"
}
```

### `notes` JSONB
```json
{
  "objective": "Study climate change impact",
  "expected_output": "Research report",
  "expected_outcome": "Policy recommendations",
  "principal_investigator": "Dr. John Doe",
  "additional_notes": "Collaboration with WHO"
}
```

---

## Next Steps

1. ✅ **Compare table structures** (DONE)
2. ⏳ **Create migration script** to add JSONB columns
3. ⏳ **Create data migration script** to populate JSONB from existing columns
4. ⏳ **Update API routes** to use JSONB columns
5. ⏳ **Test with existing 5 projects**
6. ⏳ **Rename columns** to match remote structure
7. ⏳ **Remove old columns** (optional)
