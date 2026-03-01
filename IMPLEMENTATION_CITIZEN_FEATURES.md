# Implementation: Citizen Proposals, County Proposed Projects, and Project Announcements

## Overview
This document describes the implementation of three features that were previously using sample/mock data:
1. **Citizen Proposals** - Allows citizens to submit project proposals
2. **County Proposed Projects** - Displays projects proposed by the County Government
3. **Project Announcements** - Shows project-related announcements and events

## Database Schema

### Tables Created

1. **citizen_proposals** - Stores citizen-submitted project proposals
2. **county_proposed_projects** - Stores county government proposed projects
3. **county_proposed_project_milestones** - Stores milestones for county proposed projects
4. **project_announcements** - Stores project announcements and events

### Migration Files

All migration files are located in `api/migrations/`:
- `create_citizen_proposals_table.sql`
- `create_county_proposed_projects_table.sql`
- `create_project_announcements_table.sql`
- `seed_sample_data.sql` - Contains sample data for demo purposes

## Setup Instructions

### 1. Run Database Migrations

Execute the migration files in order:

```bash
# Connect to your MySQL database
mysql -u your_username -p your_database_name

# Run migrations
source api/migrations/create_citizen_proposals_table.sql
source api/migrations/create_county_proposed_projects_table.sql
source api/migrations/create_project_announcements_table.sql
source api/migrations/seed_sample_data.sql
```

Or run them all at once:
```bash
mysql -u your_username -p your_database_name < api/migrations/create_citizen_proposals_table.sql
mysql -u your_username -p your_database_name < api/migrations/create_county_proposed_projects_table.sql
mysql -u your_username -p your_database_name < api/migrations/create_project_announcements_table.sql
mysql -u your_username -p your_database_name < api/migrations/seed_sample_data.sql
```

### 2. API Endpoints

New public API endpoints have been added to `api/routes/publicRoutes.js`:

#### Citizen Proposals
- `GET /api/public/citizen-proposals` - Get all proposals (with filtering)
- `GET /api/public/citizen-proposals/:id` - Get specific proposal
- `POST /api/public/citizen-proposals` - Submit new proposal

#### County Proposed Projects
- `GET /api/public/county-proposed-projects` - Get all projects (with filtering)
- `GET /api/public/county-proposed-projects/:id` - Get specific project

#### Project Announcements
- `GET /api/public/announcements` - Get all announcements (with filtering)
- `GET /api/public/announcements/:id` - Get specific announcement

### 3. Frontend Updates

All three pages have been updated to use real API calls:

1. **CitizenProposalsPage.jsx** - Now fetches from API and submits proposals
2. **CountyProposedProjectsPage.jsx** - Now fetches from API
3. **AnnouncementsPage.jsx** - Now fetches from API

The API service functions have been added to `public-dashboard/src/services/publicApi.js`:
- `getCitizenProposals()`
- `submitCitizenProposal()`
- `getCitizenProposal()`
- `getCountyProposedProjects()`
- `getCountyProposedProject()`
- `getAnnouncements()`
- `getAnnouncement()`

## Sample Data

The `seed_sample_data.sql` file includes:

- **5 Citizen Proposals** with various statuses (Under Review, Approved, Rejected)
- **6 County Proposed Projects** across different categories
- **30+ Milestones** for the county projects
- **7 Project Announcements** covering different categories

## Features

### Citizen Proposals
- Citizens can submit project proposals through a form
- Proposals include: title, description, category, location, estimated cost, proposer details, justification, expected benefits, timeline
- Status tracking: Draft, Under Review, Approved, Rejected
- View all submitted proposals with filtering

### County Proposed Projects
- Display county government proposed projects
- Filter by category, status, and priority
- Detailed project information including:
  - Budget allocation and utilization
  - Progress tracking
  - Milestones with completion status
  - Stakeholders and risks
  - Project manager and department information

### Project Announcements
- Display project-related announcements
- Categories: Public Participation, Project Launch, Project Update, Call for Proposals, Service Notice, Emergency, General
- Filter by category and status
- Event details including date, time, location, organizer
- Attendance tracking for events

## Testing

After running the migrations and seeding sample data:

1. Navigate to the Citizen Proposals page - you should see 5 sample proposals
2. Try submitting a new proposal - it should be saved to the database
3. Navigate to County Proposed Projects - you should see 6 sample projects
4. Navigate to Project Announcements - you should see 7 sample announcements

## Notes

- All tables include `voided` flag for soft deletion
- Foreign keys reference `kemri_users` for user tracking
- Timestamps are automatically managed (created_at, updated_at)
- Sample data uses realistic Kenyan county project scenarios

