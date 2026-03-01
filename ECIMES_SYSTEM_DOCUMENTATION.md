# ECIMES (Electronic County Integrated Management and Evaluation System)
## System and Functional Features Documentation

**Version:** 5.0  
**Last Updated:** 2025  
**System Location:** `/home/dev/dev/imes_working/v5/imes`

---

## Table of Contents

1. [System Overview](#system-overview)
2. [System Architecture](#system-architecture)
3. [Core Modules](#core-modules)
4. [Functional Features](#functional-features)
5. [User Roles and Access Control](#user-roles-and-access-control)
6. [Technical Specifications](#technical-specifications)
7. [API Endpoints](#api-endpoints)
8. [Deployment Information](#deployment-information)

---

## 1. System Overview

### 1.1 Purpose
ECIMES is a comprehensive web-based project monitoring and tracking system designed for county governments to manage, track, and monitor infrastructure and development projects transparently and efficiently.

### 1.2 Key Objectives
- **Transparency**: Public access to project information and progress
- **Accountability**: Track project status, budgets, and milestones
- **Efficiency**: Streamline project management workflows
- **Collaboration**: Enable communication between stakeholders
- **Data-Driven Decisions**: Provide analytics and reporting tools

### 1.3 Target Users
- **County Administrators**: System administrators with full access
- **Project Managers**: Manage and monitor assigned projects
- **County Staff**: Department heads and employees
- **Contractors**: View and update project progress
- **Citizens**: Public access to project information and feedback

---

## 2. System Architecture

### 2.1 Technology Stack

#### Frontend
- **React 18+**: Modern UI framework
- **Vite**: Build tool and development server
- **Material-UI (MUI)**: Component library
- **React Router**: Client-side routing
- **Axios**: HTTP client for API calls
- **Socket.IO Client**: Real-time communication
- **Recharts**: Data visualization

#### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **MySQL 8.0**: Relational database
- **Socket.IO**: Real-time WebSocket communication
- **JWT**: Authentication and authorization
- **Multer**: File upload handling
- **XLSX**: Excel file processing

#### Infrastructure
- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration
- **Nginx**: Reverse proxy and load balancer
- **Linux**: Operating system

### 2.2 System Components

```
┌─────────────────────────────────────────────────────────┐
│                    ECIMES System                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────┐      ┌──────────────────┐        │
│  │  Public          │      │  Admin           │        │
│  │  Dashboard       │      │  Dashboard       │        │
│  │  (React)         │      │  (React)         │        │
│  │  Port: 5174      │      │  Port: 5173      │        │
│  └────────┬─────────┘      └────────┬─────────┘        │
│           │                         │                   │
│           │                         │                   │
│           └──────────┬──────────────┘                   │
│                      │                                  │
│            ┌─────────▼─────────┐                        │
│            │   Nginx Proxy      │                        │
│            │   Port: 8080       │                        │
│            └─────────┬─────────┘                        │
│                      │                                  │
│            ┌─────────▼─────────┐                        │
│            │   API Server       │                        │
│            │   (Express.js)     │                        │
│            │   Port: 3000       │                        │
│            │   Socket.IO        │                        │
│            └─────────┬─────────┘                        │
│                      │                                  │
│            ┌─────────▼─────────┐                        │
│            │   MySQL Database   │                        │
│            │   Port: 3307       │                        │
│            │   Database:        │                        │
│            │   imbesdb          │                        │
│            └────────────────────┘                        │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Core Modules

### 3.1 Project Management Module
Comprehensive project lifecycle management from conception to completion.

**Key Features:**
- Project creation and configuration
- Project categories and types
- Financial year assignment
- Department and section assignment
- Geographic assignment (County, Sub-county, Ward)
- Program and sub-program linking
- Status tracking (Not Started, Ongoing, Completed, Stalled, Under Procurement)
- Project approval workflow
- Public approval for public dashboard display

**Sub-modules:**
- Project Concept Notes
- Needs Assessment
- Financial Planning and Breakdown
- Sustainability Planning
- Implementation Planning
- Monitoring & Evaluation
- Risk Management
- Stakeholder Management
- Project Readiness Assessment
- Hazard Assessment
- Climate Risk Assessment
- ESOHSG Screening

### 3.2 Financial Management Module
Track project budgets, payments, and financial performance.

**Features:**
- Project budget allocation
- Financial year breakdown
- Payment requests and processing
- Payment status tracking
- Budget vs. actual comparison
- Financial reporting
- Currency formatting and display

### 3.3 User Management Module
Manage system users, roles, and permissions.

**Features:**
- User account creation and management
- Role-based access control (RBAC)
- Privilege assignment
- User activation/deactivation
- Password management
- User authentication (JWT)
- Session management

**Roles:**
- Administrator
- Project Manager
- Basic User
- Contractor
- Governor (planned)

### 3.4 Department and Organization Module
Manage organizational structure.

**Features:**
- Department management
- Section management
- Organization hierarchy
- Assignment of users to departments
- Department-based project filtering

### 3.5 Geographic Management Module
Manage county geographic structure.

**Features:**
- County management
- Sub-county management
- Ward management
- Geographic assignment of projects
- Geographic-based filtering and reporting

### 3.6 Metadata Management Module
Manage system reference data.

**Features:**
- Financial year management
- Project category management
- Project type management
- Program and sub-program management
- Approval level management

### 3.7 Strategic Planning Module
Link projects to strategic plans.

**Features:**
- Strategic plan creation
- Project linkage to strategic plans
- Strategic plan reporting
- Annual work plan management

### 3.8 Contractor Management Module
Manage contractors and their assignments.

**Features:**
- Contractor registration
- Contractor profile management
- Photo upload for contractors
- Project-contractor assignment
- Contractor dashboard
- Payment tracking per contractor

### 3.9 Task and Activity Management Module
Manage project tasks and activities.

**Features:**
- Task creation and assignment
- Activity tracking
- Milestone management
- Category milestones
- Task dependencies
- Task assignees
- Progress tracking
- Scheduling and timelines

### 3.10 Monitoring and Evaluation Module
Track project progress and performance.

**Features:**
- Project monitoring records
- Observations and site visits
- Photo documentation
- Progress reports
- Warning system for at-risk projects
- Performance indicators
- Completion tracking

### 3.11 Document Management Module
Manage project-related documents.

**Features:**
- Document upload and storage
- Document categorization
- Project attachments
- Certificate management
- PDF generation
- File download

### 3.12 Feedback and Engagement Module
Enable citizen engagement and feedback.

**Features:**
- Public feedback submission (anonymous allowed)
- Feedback moderation
- Feedback response system
- Project-specific feedback
- Feedback rating system
- Public feedback forum
- Feedback analytics

**Feedback Workflow:**
1. Citizen submits feedback (public dashboard)
2. Feedback appears in moderation queue
3. Moderator reviews and approves/rejects
4. Approved feedback visible on public dashboard
5. County staff responds to feedback
6. Response visible to public

### 3.13 Public Dashboard Module
Public-facing interface for transparency.

**Features:**
- Public project gallery
- Project statistics and analytics
- Department-wise breakdown
- Sub-county and ward distribution
- Financial year filtering
- Interactive charts and visualizations
- Public feedback submission
- View county responses to feedback
- No authentication required

**Key Pages:**
- Homepage: Overview and navigation
- Dashboard: Analytics and statistics
- Projects: Project gallery with photos
- Feedback: Submit and view feedback

### 3.14 Chat/Communication Module
Internal real-time communication system.

**Features:**
- Real-time messaging
- Multiple chat rooms
- File uploads (images, documents)
- Typing indicators
- Online/offline status
- Read receipts
- Message replies
- Room-based organization
- Role-based access to rooms

**Chat Rooms:**
- General Discussion
- Project Updates
- Administrative
- Technical Support
- Announcements
- Department-specific rooms

### 3.15 Reporting Module
Generate reports and analytics.

**Features:**
- Project status reports
- Financial reports
- Department reports
- Geographic reports
- Custom report generation
- Export to PDF/Excel
- Dashboard analytics
- Three-tier analytics (County, Sub-county, Ward)

### 3.16 Approval and Workflow Module
Manage project approval workflows.

**Features:**
- Multi-level approval system
- Approval level configuration
- Approval workflow tracking
- Revision requests
- Approval notes and comments
- Public content approval
- Project announcement approvals

### 3.17 Data Access Control Module
Fine-grained data access management.

**Features:**
- User department assignments
- User ward assignments
- User project assignments
- Custom data filters
- Component-level access rules
- Data filtering based on:
  - Department
  - Ward/Region
  - Project assignments
  - Budget limits
  - Status filters

### 3.18 Photo Management Module
Manage project and contractor photos.

**Features:**
- Photo upload
- Photo gallery per project
- Contractor photo management
- Photo organization
- Photo approval for public display
- Photo metadata

### 3.19 Project Announcements Module
Manage public project announcements.

**Features:**
- Announcement creation
- Approval workflow
- Public display
- Status tracking
- Categorization

### 3.20 Citizen Proposals Module
Manage citizen-proposed projects.

**Features:**
- Citizen proposal submission
- Proposal review
- Approval workflow
- Integration with project management

---

## 4. Functional Features

### 4.1 Authentication and Authorization

#### Authentication
- JWT-based authentication
- Secure password storage
- Session management
- Login/logout functionality
- Password reset (planned)

#### Authorization
- Role-based access control (RBAC)
- Privilege-based feature access
- Route protection
- API endpoint authorization
- Component-level access control

### 4.2 Dashboard Features

#### Admin Dashboard
- **Overview Tab**: System-wide statistics
  - Total projects count
  - Active projects
  - Completed projects
  - Budget summaries
  - User statistics
- **Projects Tab**: Project management interface
- **Team Tab**: User management
- **Analytics Tab**: Data visualizations
- **Resource Utilization Tab**: Resource tracking

#### Public Dashboard
- Quick statistics overview
- Financial year selector
- Department analytics table
- Sub-county analytics table
- Interactive project modals
- Real-time data updates

### 4.3 Project Management Features

#### Project Creation
- Form-based project creation
- Required fields validation
- Auto-generation of project reference numbers
- Default status assignment
- Creator tracking

#### Project Editing
- Full project details editing
- Status updates
- Progress tracking
- Budget updates
- Timeline adjustments

#### Project Viewing
- Detailed project view
- Project history
- Related documents
- Photo gallery
- Feedback display
- Financial breakdown
- Task and activity list

#### Project Filtering and Search
- Filter by status
- Filter by department
- Filter by financial year
- Filter by location (county, sub-county, ward)
- Filter by category
- Search by project name
- Filter by date range

#### Project Approval
- Multi-level approval process
- Approval status tracking
- Revision requests
- Approval notes
- Public content approval

### 4.4 Financial Features

#### Budget Management
- Project budget entry
- Financial year breakdown
- Budget vs. actual tracking
- Currency formatting (KES)
- Budget reporting

#### Payment Management
- Payment request creation
- Payment approval workflow
- Payment status tracking
- Payment history
- Payment reporting

### 4.5 User Interface Features

#### Navigation
- Responsive sidebar navigation
- Breadcrumb navigation
- Role-based menu items
- Quick access buttons
- Floating action buttons (chat)

#### Data Display
- Data tables with sorting
- Pagination
- Search functionality
- Filters and advanced filters
- Modal dialogs for details
- Card-based layouts
- List views

#### Forms
- Form validation
- Required field indicators
- Date pickers
- Dropdown selectors
- Multi-select components
- File upload components
- Rich text editing (planned)

#### Notifications
- Success messages
- Error messages
- Warning messages
- Info messages
- Toast notifications
- Badge notifications (unread counts)

### 4.6 Real-Time Features

#### Chat System
- Real-time messaging
- Typing indicators
- Online status
- Read receipts
- File sharing
- Message threading

#### Live Updates
- Project status updates
- Notification system (planned)
- Dashboard refresh

### 4.7 Data Visualization

#### Charts and Graphs
- Pie charts (status distribution)
- Bar charts (department/project comparison)
- Line charts (trends over time)
- Progress circles
- Geographic charts (planned)

#### Analytics
- Project statistics
- Financial analytics
- Department analytics
- Geographic analytics
- Time-based analytics

### 4.8 File Management

#### Upload Features
- Multiple file upload
- Image upload
- Document upload
- File type validation
- File size limits
- Progress indicators

#### Download Features
- File download
- PDF generation
- Excel export (planned)
- Report export

### 4.9 Search and Filtering

#### Search Capabilities
- Full-text search
- Project name search
- User search
- Quick search
- Advanced search

#### Filtering Options
- Status filters
- Date range filters
- Department filters
- Location filters
- Category filters
- Financial year filters
- Multi-criteria filtering

### 4.10 Reporting Features

#### Standard Reports
- Project status report
- Financial report
- Department report
- Geographic report
- User activity report (planned)

#### Custom Reports
- Report builder (planned)
- Scheduled reports (planned)
- Email reports (planned)

### 4.11 Import/Export Features

#### Data Import
- Excel import for projects
- Bulk data import
- Strategic plan import
- Map data import
- Template-based import

#### Data Export
- Excel export
- PDF export
- CSV export (planned)

### 4.12 Workflow Features

#### Project Workflow
- Status transitions
- Approval workflows
- Revision workflows
- Assignment workflows

#### Task Workflow
- Task creation
- Task assignment
- Task completion
- Task dependencies

### 4.13 Integration Features

#### GIS Integration
- Map display (planned)
- Geographic data visualization
- Location-based filtering

#### External Integrations
- Payment gateway (planned)
- Email service (planned)
- SMS notifications (planned)

---

## 5. User Roles and Access Control

### 5.1 Role Hierarchy

1. **Administrator**
   - Full system access
   - User management
   - System configuration
   - All CRUD operations

2. **Project Manager**
   - Project management
   - Team assignment
   - Progress tracking
   - Reporting

3. **Basic User**
   - View assigned projects
   - Update project information
   - Submit reports
   - Limited access

4. **Contractor**
   - View assigned projects
   - Update project progress
   - Upload photos
   - Submit payment requests

5. **Citizen/Public**
   - View public projects
   - Submit feedback
   - View statistics
   - No authentication required

### 5.2 Privilege System

Privileges control access to specific features:
- `projects.create`
- `projects.edit`
- `projects.delete`
- `projects.approve`
- `users.manage`
- `feedback.respond`
- `feedback.moderate`
- `public_content.approve`
- And many more...

### 5.3 Data Access Control

Users can be restricted to:
- Specific departments
- Specific wards/regions
- Specific projects
- Budget limits
- Status filters

---

## 6. Technical Specifications

### 6.1 Database Schema

**Core Tables:**
- `kemri_projects`: Main projects table
- `kemri_users`: User accounts
- `kemri_departments`: Department information
- `kemri_counties`: County information
- `kemri_subcounties`: Sub-county information
- `kemri_wards`: Ward information
- `kemri_financial_years`: Financial year data
- `kemri_contractors`: Contractor information

**Project-Related Tables:**
- `kemri_project_concept_notes`
- `kemri_project_financials`
- `kemri_project_milestones`
- `kemri_project_tasks`
- `kemri_project_activities`
- `kemri_project_photos`
- `kemri_project_feedback`
- And 20+ more related tables

**System Tables:**
- `kemri_roles`: User roles
- `kemri_privileges`: System privileges
- `kemri_user_privileges`: User-privilege assignments
- `kemri_chat_rooms`: Chat rooms
- `kemri_chat_messages`: Chat messages
- `public_feedback`: Public feedback submissions

### 6.2 API Architecture

**Base URL:** `/api`

**Main Route Groups:**
- `/api/auth`: Authentication
- `/api/users`: User management
- `/api/projects`: Project management
- `/api/departments`: Department management
- `/api/public`: Public endpoints
- `/api/dashboard`: Dashboard data
- `/api/chat`: Chat system
- `/api/feedback`: Feedback management

### 6.3 Security Features

- JWT token authentication
- Password hashing (bcrypt)
- SQL injection prevention (parameterized queries)
- XSS protection
- CORS configuration
- Rate limiting (planned)
- Input validation
- File upload validation

### 6.4 Performance Optimizations

- Database indexing
- Query optimization
- Connection pooling
- Caching (planned)
- Code splitting
- Lazy loading
- Production build optimization
- Gzip compression
- Static asset optimization

---

## 7. API Endpoints

### 7.1 Authentication Endpoints

- `POST /api/auth/login`: User login
- `POST /api/auth/register`: User registration (admin only)
- `GET /api/auth/me`: Get current user
- `POST /api/auth/logout`: User logout

### 7.2 Project Endpoints

- `GET /api/projects`: Get all projects
- `GET /api/projects/:id`: Get project details
- `POST /api/projects`: Create project
- `PUT /api/projects/:id`: Update project
- `DELETE /api/projects/:id`: Delete project
- `GET /api/projects/:id/photos`: Get project photos
- `POST /api/projects/:id/photos`: Upload project photo
- `GET /api/projects/:id/tasks`: Get project tasks
- `POST /api/projects/:id/tasks`: Create task
- `GET /api/projects/map`: Get map data
- And 50+ more project-related endpoints

### 7.3 Public Endpoints

- `GET /api/public/stats/overview`: Overview statistics
- `GET /api/public/stats/by-department`: Department statistics
- `GET /api/public/stats/by-subcounty`: Sub-county statistics
- `GET /api/public/stats/by-ward`: Ward statistics
- `GET /api/public/projects`: List public projects
- `GET /api/public/projects/:id`: Get public project details
- `POST /api/public/feedback`: Submit public feedback
- `GET /api/public/feedback`: Get public feedback

### 7.4 User Endpoints

- `GET /api/users`: Get all users
- `GET /api/users/:id`: Get user details
- `POST /api/users`: Create user
- `PUT /api/users/:id`: Update user
- `DELETE /api/users/:id`: Delete user
- `PUT /api/users/:id/activate`: Activate user
- `PUT /api/users/:id/deactivate`: Deactivate user

### 7.5 Dashboard Endpoints

- `GET /api/dashboard/statistics/:fyId`: Get statistics
- `GET /api/dashboard/metrics/:fyId`: Get metrics
- `GET /api/dashboard/config`: Get dashboard configuration

### 7.6 Chat Endpoints

- `GET /api/chat/rooms`: Get chat rooms
- `GET /api/chat/rooms/:id/messages`: Get room messages
- `POST /api/chat/messages`: Send message
- `POST /api/chat/upload`: Upload file to chat

---

## 8. Deployment Information

### 8.1 Environment Configuration

**Development:**
- Frontend: http://localhost:5173
- Public Dashboard: http://localhost:5174
- API: http://localhost:3000
- Database: localhost:3307

**Production:**
- Frontend: http://165.22.227.234:5173
- Public Dashboard: http://165.22.227.234:5174
- API: http://165.22.227.234:3000
- Nginx Proxy: http://165.22.227.234:8080

### 8.2 Docker Configuration

**Services:**
- `nginx_proxy`: Nginx reverse proxy
- `react_frontend`: Admin dashboard
- `public_dashboard`: Public dashboard
- `node_api`: Backend API
- `mysql_db`: MySQL database

**Volumes:**
- `db_data`: Database persistent storage
- `nginx_cache`: Nginx cache

### 8.3 Deployment Process

1. Build production containers
2. Run database migrations
3. Start services with docker-compose
4. Configure nginx
5. Set up SSL (production)
6. Monitor logs

---

## 9. System Requirements

### 9.1 Server Requirements

- **CPU**: 2+ cores recommended
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 50GB minimum
- **OS**: Linux (Ubuntu 20.04+ recommended)

### 9.2 Software Requirements

- Docker 20.10+
- Docker Compose 1.29+
- Node.js 18+ (for development)
- MySQL 8.0 (via Docker)

### 9.3 Browser Requirements

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## 10. Future Enhancements

### Planned Features
- Mobile application
- Advanced analytics and AI insights
- Email notifications
- SMS notifications
- Advanced reporting with custom templates
- Workflow automation
- Document templates
- Advanced GIS integration
- Multi-language support
- Audit trail enhancements
- Backup and restore automation
- Performance monitoring dashboard

---

## 11. User Workflows and Business Processes

### 11.1 Project Creation Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                   PROJECT CREATION WORKFLOW                  │
└─────────────────────────────────────────────────────────────┘

1. PROJECT INITIATION
   ↓
   Admin/Project Manager creates new project
   - Fill project basic details
   - Select department, financial year
   - Assign geographic location
   - Set budget and timeline
   ↓
   Status: "Not Started"

2. PROJECT CONCEPT & PLANNING
   ↓
   Complete project concept note
   - Needs assessment
   - Implementation plan
   - Financial breakdown
   - Risk assessment
   ↓
   Submit for approval

3. APPROVAL PROCESS
   ↓
   Approval level 1 → Approval level 2 → ... → Final approval
   - Revision requests handled
   - Approval notes added
   ↓
   Status: "Under Procurement" or "Ongoing"

4. PROJECT EXECUTION
   ↓
   Assign contractor (if applicable)
   - Create tasks and milestones
   - Upload progress photos
   - Submit payment requests
   - Update progress percentage
   ↓
   Status: "Ongoing"

5. MONITORING & EVALUATION
   ↓
   Regular site visits
   - Record observations
   - Update status
   - Handle warnings
   - Track milestones
   ↓
   Continuous monitoring

6. PROJECT COMPLETION
   ↓
   Mark project as completed
   - Final documentation
   - Photo gallery
   - Completion certificate
   ↓
   Status: "Completed"

7. PUBLIC APPROVAL (Optional)
   ↓
   Approve for public dashboard display
   - Review content
   - Approve public visibility
   ↓
   Visible on public dashboard
```

### 11.2 Feedback Processing Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                  FEEDBACK PROCESSING WORKFLOW                │
└─────────────────────────────────────────────────────────────┘

1. CITIZEN SUBMISSION
   ↓
   Citizen submits feedback via public dashboard
   - Optional: Name, contact info
   - Required: Message, project selection
   - Optional: 5-point ratings
   ↓
   Status: "Pending"

2. MODERATION REVIEW
   ↓
   County staff reviews feedback
   - Approve or reject
   - Mark inappropriate content
   ↓
   Status: "Reviewed" or "Rejected"

3. RESPONSE PREPARATION
   ↓
   Assigned staff prepares response
   - Research project details
   - Draft official response
   ↓
   Status: "Under Review"

4. RESPONSE SUBMISSION
   ↓
   Submit official response
   - Response text
   - Update status
   ↓
   Status: "Responded"

5. PUBLIC DISPLAY
   ↓
   Feedback and response visible on public dashboard
   - Complete transparency
   - Citizen can see response
   ↓
   Status: "Responded"

6. ARCHIVING
   ↓
   Completed feedback archived
   - Historical records
   - Analytics tracking
   ↓
   Status: "Archived"
```

### 11.3 User Management Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    USER MANAGEMENT WORKFLOW                  │
└─────────────────────────────────────────────────────────────┘

1. USER CREATION
   ↓
   Admin creates user account
   - Basic info (name, email, username)
   - Assign role
   - Set initial password
   ↓
   Status: "Active"

2. PRIVILEGE ASSIGNMENT
   ↓
   Assign specific privileges
   - Select from privilege list
   - Role-based defaults applied
   ↓
   Access configured

3. DATA ACCESS CONFIGURATION
   ↓
   Configure data access limits
   - Department assignments
   - Ward/region assignments
   - Project assignments
   - Budget limits
   ↓
   Data access restricted

4. USER ACTIVATION
   ↓
   User receives credentials
   - First login
   - Password change (recommended)
   ↓
   User active in system

5. ONGOING MANAGEMENT
   ↓
   Monitor user activity
   - Disable if needed
   - Update privileges
   - Modify assignments
   ↓
   Continuous management
```

### 11.4 Payment Processing Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    PAYMENT PROCESSING WORKFLOW               │
└─────────────────────────────────────────────────────────────┘

1. PAYMENT REQUEST CREATION
   ↓
   Contractor/Project Manager creates request
   - Select project
   - Enter amount
   - Attach supporting documents
   ↓
   Status: "Pending"

2. APPROVAL PROCESS
   ↓
   Review by authorized personnel
   - Verify project status
   - Check budget availability
   - Review documentation
   ↓
   Approve or Reject

3. PAYMENT PROCESSING
   ↓
   Approved payments processed
   - Update payment status
   - Record payment date
   - Update project paid amount
   ↓
   Status: "Processed"

4. BUDGET UPDATE
   ↓
   Project budget automatically updated
   - Track paid vs. allocated
   - Calculate remaining budget
   ↓
   Financial records updated
```

---

## 12. Use Cases and Scenarios

### 12.1 Administrator Use Cases

#### Use Case 1: Setting Up New Financial Year
**Actor:** Administrator  
**Goal:** Configure system for new financial year

**Steps:**
1. Navigate to Metadata Management
2. Select Financial Years
3. Create new financial year entry
4. Set start and end dates
5. Mark as active
6. Create projects for new financial year

**Expected Result:** Projects can now be assigned to new financial year

#### Use Case 2: Bulk Project Import
**Actor:** Administrator  
**Goal:** Import multiple projects from Excel

**Steps:**
1. Navigate to Project Import page
2. Download template
3. Fill template with project data
4. Upload completed template
5. Review import preview
6. Confirm import
7. Verify imported projects

**Expected Result:** All projects imported successfully with data validated

### 12.2 Project Manager Use Cases

#### Use Case 3: Creating and Managing Project
**Actor:** Project Manager  
**Goal:** Create and track project progress

**Steps:**
1. Navigate to Projects page
2. Click "Create New Project"
3. Fill project details form
4. Assign department and location
5. Set budget and timeline
6. Save project
7. Add tasks and milestones
8. Update progress as work continues
9. Upload progress photos
10. Submit completion when done

**Expected Result:** Project created, tracked, and completed successfully

#### Use Case 4: Monitoring Project Health
**Actor:** Project Manager  
**Goal:** Identify at-risk projects

**Steps:**
1. Navigate to Dashboard
2. View Projects tab
3. Review project status indicators
4. Check warnings for at-risk projects
5. Review project timeline vs. actual progress
6. Take corrective action if needed

**Expected Result:** At-risk projects identified and addressed

### 12.3 Contractor Use Cases

#### Use Case 5: Updating Project Progress
**Actor:** Contractor  
**Goal:** Report project progress to county

**Steps:**
1. Log into Contractor Dashboard
2. View assigned projects
3. Select active project
4. Update progress percentage
5. Upload recent photos
6. Add activity notes
7. Submit progress update

**Expected Result:** Progress updated and visible to county staff

#### Use Case 6: Submitting Payment Request
**Actor:** Contractor  
**Goal:** Request payment for completed work

**Steps:**
1. Navigate to project details
2. Click "Payment Requests"
3. Create new payment request
4. Enter amount and description
5. Attach supporting documents
6. Submit for approval
7. Track approval status

**Expected Result:** Payment request submitted and tracked

### 12.4 Citizen Use Cases

#### Use Case 7: Viewing Project Information
**Actor:** Citizen  
**Goal:** Access project transparency information

**Steps:**
1. Visit public dashboard URL
2. Navigate to Projects page
3. Browse project gallery
4. Filter by department or location
5. View project details
6. Check project photos
7. Review project status

**Expected Result:** Project information accessed without login

#### Use Case 8: Submitting Feedback
**Actor:** Citizen  
**Goal:** Provide feedback on county project

**Steps:**
1. Visit public dashboard
2. Navigate to Feedback page or select project
3. Fill feedback form
4. Select project (if not pre-selected)
5. Enter feedback message
6. Optionally add ratings
7. Optionally provide contact info
8. Submit feedback
9. Track feedback status
10. View county response when available

**Expected Result:** Feedback submitted and response received

### 12.5 County Staff Use Cases

#### Use Case 9: Responding to Citizen Feedback
**Actor:** County Staff  
**Goal:** Provide official response to citizen concerns

**Steps:**
1. Navigate to Feedback Management
2. View pending feedback
3. Select feedback item
4. Review feedback details and project context
5. Draft official response
6. Submit response
7. Update feedback status

**Expected Result:** Citizen receives official response

#### Use Case 10: Generating Reports
**Actor:** County Staff  
**Goal:** Generate project status report

**Steps:**
1. Navigate to Reports page
2. Select report type
3. Choose filters (department, date range, status)
4. Generate report
5. Review report data
6. Export to PDF/Excel (if available)

**Expected Result:** Report generated with accurate data

---

## 13. Data Flow and Information Architecture

### 13.1 Data Flow Diagram

```
┌──────────────┐
│   Citizens   │
│  (Public)    │
└──────┬───────┘
       │
       │ Browse Projects
       │ Submit Feedback
       │ View Statistics
       │
       ▼
┌──────────────────────────┐
│   Public Dashboard       │
│   (Port 5174)            │
└──────┬───────────────────┘
       │
       │ HTTP Requests
       │
       ▼
┌──────────────────────────┐
│   Nginx Proxy            │
│   (Port 8080)            │
└──────┬───────────────────┘
       │
       │ Routes requests
       │
       ├──────────────────────────┐
       │                          │
       ▼                          ▼
┌─────────────────┐    ┌──────────────────────┐
│ Public API      │    │ Admin API            │
│ /api/public/*   │    │ /api/*               │
└──────┬──────────┘    └──────┬───────────────┘
       │                      │
       │                      │ JWT Auth
       │                      │
       └──────────┬───────────┘
                  │
                  ▼
         ┌─────────────────┐
         │   API Server    │
         │   (Express.js)  │
         │   Port 3000     │
         └────────┬────────┘
                  │
                  │ SQL Queries
                  │
                  ▼
         ┌─────────────────┐
         │  MySQL Database │
         │  (imbesdb)      │
         │  Port 3307      │
         └─────────────────┘
                  │
                  │ Persistent Storage
                  │
                  ▼
         ┌─────────────────┐
         │  File Storage   │
         │  /uploads/      │
         │  - Photos       │
         │  - Documents    │
         │  - Chat files   │
         └─────────────────┘
```

### 13.2 Authentication Flow

```
┌─────────────┐
│    User     │
└──────┬──────┘
       │
       │ 1. Submit Credentials
       │
       ▼
┌─────────────────┐
│  Login Form     │
│  (Frontend)     │
└──────┬──────────┘
       │
       │ 2. POST /api/auth/login
       │    {username, password}
       │
       ▼
┌─────────────────┐
│  API Server     │
│  (Backend)      │
└──────┬──────────┘
       │
       │ 3. Verify Credentials
       │    Query Database
       │
       ▼
┌─────────────────┐
│  MySQL Database │
└──────┬──────────┘
       │
       │ 4. Return User Data
       │
       ▼
┌─────────────────┐
│  API Server     │
│  Generate JWT   │
└──────┬──────────┘
       │
       │ 5. Return JWT Token
       │    {token, user, privileges}
       │
       ▼
┌─────────────────┐
│  Frontend       │
│  Store in Local │
│  Storage        │
└──────┬──────────┘
       │
       │ 6. Include JWT in
       │    Future Requests
       │    Header: x-auth-token
       │
       ▼
┌─────────────────┐
│  Protected      │
│  Resources      │
└─────────────────┘
```

### 13.3 Real-Time Communication Flow (Chat)

```
┌──────────────┐              ┌──────────────┐
│   User A     │              │   User B     │
└──────┬───────┘              └──────┬───────┘
       │                             │
       │ 1. Send Message             │
       │    Socket.emit()            │
       │                             │
       ▼                             │
┌──────────────────────────────────┐ │
│      Socket.IO Server            │ │
│      (Express + Socket.IO)       │ │
└──────┬───────────────────────────┘ │
       │                             │
       │ 2. Broadcast to Room        │
       │    io.to(roomId).emit()     │
       │                             │
       │                             ▼
       │                    ┌─────────────────┐
       │                    │   User B        │
       │                    │   Receives      │
       │                    │   Message       │
       │                    └─────────────────┘
       │
       │ 3. Store in Database
       ▼
┌─────────────────┐
│  MySQL Database │
│  (Chat Messages)│
└─────────────────┘
```

---

## 14. Best Practices and Guidelines

### 14.1 Project Management Best Practices

#### Project Naming Conventions
- Use descriptive project names
- Include location identifier (e.g., "Road Construction - Ward X")
- Include project type (e.g., "Water Project - Borehole")
- Maintain consistent naming format

#### Status Management
- Update project status regularly (weekly recommended)
- Use appropriate status transitions:
  - Not Started → Under Procurement → Ongoing → Completed
- Document status changes with reasons
- Don't skip status levels

#### Budget Management
- Enter accurate budget figures at project creation
- Update paid amounts promptly after payments
- Monitor budget utilization regularly
- Set alerts for budget overruns

#### Documentation
- Upload all relevant documents
- Name files descriptively
- Maintain organized photo galleries
- Keep project descriptions updated

### 14.2 User Management Best Practices

#### Role Assignment
- Assign minimum necessary privileges
- Review user access regularly
- Remove access for inactive users
- Use data access controls to limit scope

#### Security
- Enforce strong password policies
- Regularly review user activity
- Disable unused accounts promptly
- Monitor privileged user actions

#### Onboarding
- Provide user training
- Document user roles and responsibilities
- Create user guides for common tasks
- Establish support channels

### 14.3 Data Quality Best Practices

#### Data Entry
- Enter complete information
- Validate data before submission
- Use consistent formats (dates, currency)
- Review data regularly for accuracy

#### Data Maintenance
- Regularly audit project data
- Update outdated information
- Archive completed projects appropriately
- Maintain data integrity

### 14.4 Public Dashboard Best Practices

#### Content Management
- Approve projects for public display carefully
- Ensure project descriptions are clear
- Use high-quality project photos
- Keep information current

#### Feedback Management
- Respond to feedback promptly (within 5 business days recommended)
- Provide professional, helpful responses
- Track feedback trends
- Address common concerns proactively

---

## 15. Troubleshooting and Common Issues

### 15.1 Authentication Issues

#### Problem: Cannot Login
**Symptoms:**
- "Invalid credentials" error
- Login form not submitting

**Solutions:**
1. Verify username and password are correct
2. Check if account is active (not deactivated)
3. Clear browser cache and cookies
4. Try different browser
5. Check if JWT token expired (try logging out and back in)
6. Verify API server is running

#### Problem: Session Expired
**Symptoms:**
- Sudden logout
- "Unauthorized" errors

**Solutions:**
1. JWT token may have expired (default: 24 hours)
2. Simply log in again
3. Check token expiration settings in backend
4. Ensure system clock is synchronized

### 15.2 Data Display Issues

#### Problem: Projects Not Showing
**Symptoms:**
- Empty project list
- "No projects found" message

**Solutions:**
1. Check if filters are too restrictive
2. Verify user has access to projects (data access control)
3. Check project status filters
4. Verify database has project data
5. Check API response in browser developer tools
6. Verify user has appropriate privileges

#### Problem: Statistics Not Loading
**Symptoms:**
- "Failed to load statistics" error
- Dashboard shows loading spinner indefinitely

**Solutions:**
1. Check if financial year is selected
2. Verify API endpoint is accessible
3. Check browser console for errors
4. Verify database has data for selected period
5. Check network connectivity

### 15.3 File Upload Issues

#### Problem: Photo Upload Fails
**Symptoms:**
- Upload progress stuck
- "Upload failed" error

**Solutions:**
1. Check file size (max 10MB recommended)
2. Verify file format (JPG, PNG supported)
3. Check uploads directory permissions
4. Verify disk space available
5. Check API server logs for errors
6. Try smaller file size

#### Problem: Document Upload Fails
**Symptoms:**
- File not appearing after upload
- Upload error message

**Solutions:**
1. Check file format (PDF, DOCX, XLSX supported)
2. Verify file size limits
3. Check server storage space
4. Review file upload logs

### 15.4 Performance Issues

#### Problem: Slow Page Loading
**Symptoms:**
- Pages take long to load
- Timeout errors

**Solutions:**
1. Check network connection
2. Verify server resources (CPU, RAM)
3. Check database query performance
4. Review number of records being loaded
5. Use filters to limit data
6. Clear browser cache
7. Consider production build optimizations

#### Problem: Chat Not Working
**Symptoms:**
- Messages not sending
- Real-time updates not working

**Solutions:**
1. Check WebSocket connection (Socket.IO)
2. Verify Socket.IO server is running
3. Check firewall settings for WebSocket ports
4. Refresh page to reconnect
5. Check browser console for WebSocket errors
6. Verify user has chat privileges

### 15.5 Database Issues

#### Problem: Data Not Saving
**Symptoms:**
- Form submissions fail
- Changes not persisting

**Solutions:**
1. Check database connection
2. Verify database server is running
3. Check database user permissions
4. Review API error logs
5. Verify foreign key constraints
6. Check required fields are filled

### 15.6 Getting Help

#### Log Collection
When reporting issues, collect:
1. Browser console errors (F12 → Console)
2. Network tab errors (F12 → Network)
3. API response errors
4. Server logs
5. Steps to reproduce
6. User role and privileges

#### Support Channels
- Review system documentation
- Check troubleshooting guides
- Review API logs
- Contact system administrator
- Check database status

---

## 16. Security Considerations

### 16.1 Authentication Security

#### Password Security
- Passwords are hashed using bcrypt
- Minimum password requirements (configurable)
- Password change recommendations
- Account lockout after failed attempts (recommended)

#### Session Security
- JWT tokens with expiration
- Secure token storage
- HTTP-only cookies (if configured)
- Token refresh mechanism

### 16.2 Authorization Security

#### Role-Based Access Control
- Strict role verification
- Privilege-based feature access
- Route-level protection
- API endpoint authorization

#### Data Access Control
- User-scoped data filtering
- Department-based restrictions
- Geographic access limits
- Budget-based restrictions

### 16.3 Data Security

#### Input Validation
- Server-side validation
- SQL injection prevention (parameterized queries)
- XSS protection
- File upload validation

#### Data Encryption
- HTTPS in production (recommended)
- Database encryption at rest (configurable)
- Sensitive data handling
- Secure file storage

### 16.4 API Security

#### Rate Limiting
- Request rate limits (recommended)
- API throttling
- Abuse prevention

#### CORS Configuration
- Configured for allowed origins
- Credential handling
- Preflight request handling

### 16.5 Security Best Practices

#### For Administrators
1. Regularly review user access
2. Monitor user activity logs
3. Keep system updated
4. Use strong admin passwords
5. Enable audit logging
6. Regular security audits

#### For Users
1. Use strong passwords
2. Don't share credentials
3. Log out when finished
4. Report suspicious activity
5. Keep browsers updated

---

## 17. Performance Optimization

### 17.1 Frontend Optimization

#### Code Splitting
- Lazy loading of routes
- Component-level code splitting
- Dynamic imports
- Reduced initial bundle size

#### Asset Optimization
- Image compression
- Minification in production
- Gzip compression
- Browser caching
- CDN usage (if configured)

#### Bundle Optimization
- Tree shaking
- Dead code elimination
- Vendor chunk separation
- Production build optimizations

### 17.2 Backend Optimization

#### Database Optimization
- Proper indexing
- Query optimization
- Connection pooling
- Prepared statements
- Efficient JOIN operations

#### API Optimization
- Response caching
- Pagination for large datasets
- Field selection (return only needed fields)
- Batch operations where possible

### 17.3 Infrastructure Optimization

#### Server Configuration
- Adequate CPU and RAM
- SSD storage for database
- Load balancing (if multiple instances)
- Auto-scaling (if configured)

#### Caching Strategies
- Nginx caching
- Database query caching
- API response caching
- Static asset caching

### 17.4 Monitoring and Metrics

#### Performance Metrics
- Page load times
- API response times
- Database query performance
- Server resource usage
- Error rates

#### Tools
- Browser DevTools
- Server monitoring tools
- Database performance tools
- Application performance monitoring (APM)

---

## 18. Integration Guidelines

### 18.1 API Integration

#### RESTful API Design
- Standard HTTP methods (GET, POST, PUT, DELETE)
- Consistent URL structure
- JSON request/response format
- Error handling standards

#### Authentication
- JWT token-based authentication
- Include token in request headers: `x-auth-token`
- Token expiration handling
- Refresh token mechanism

#### Example API Call
```javascript
// JavaScript/Node.js example
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'x-auth-token': 'your-jwt-token-here'
  }
});

// Get projects
const projects = await api.get('/projects');

// Create project
const newProject = await api.post('/projects', {
  projectName: 'New Project',
  departmentId: 1,
  // ... other fields
});
```

### 18.2 Webhook Integration (Future)

#### Planned Webhooks
- Project status changes
- Payment approvals
- Feedback submissions
- User activity events

### 18.3 Third-Party Integrations

#### Payment Gateways (Planned)
- M-Pesa integration
- Bank payment integration
- Payment status webhooks

#### Email Service (Planned)
- SMTP configuration
- Email notifications
- Report emailing

#### SMS Service (Planned)
- SMS notifications
- OTP for authentication
- Alert messages

---

## 19. UI/UX Guidelines

### 19.1 Design Principles

#### Material Design
- Follows Material-UI design guidelines
- Consistent component usage
- Accessibility standards
- Responsive layouts

#### Color Scheme
- Primary color: County branding color
- Status colors:
  - Green: Completed/Success
  - Blue: Ongoing/Info
  - Orange: Warning/At Risk
  - Red: Error/Stalled
  - Gray: Not Started/Pending

#### Typography
- Clear hierarchy
- Readable font sizes
- Consistent font families
- Proper contrast ratios

### 19.2 Navigation Patterns

#### Sidebar Navigation
- Collapsible sidebar
- Icon + text labels
- Active state indicators
- Role-based menu items

#### Breadcrumbs
- Hierarchical navigation
- Clickable path segments
- Current page indicator

#### Quick Actions
- Floating action buttons
- Context menus
- Keyboard shortcuts (planned)

### 19.3 Form Design

#### Input Fields
- Clear labels
- Placeholder text
- Help text where needed
- Validation messages
- Required field indicators

#### Buttons
- Primary actions (blue/primary color)
- Secondary actions (gray/outlined)
- Destructive actions (red)
- Loading states
- Disabled states

### 19.4 Feedback and Notifications

#### Toast Notifications
- Success (green)
- Error (red)
- Warning (orange)
- Info (blue)
- Auto-dismiss after 5 seconds

#### Progress Indicators
- Loading spinners
- Progress bars
- Skeleton screens
- Percentage indicators

---

## 20. System Limitations and Known Issues

### 20.1 Current Limitations

#### File Upload
- Maximum file size: 10MB per file
- Supported formats: JPG, PNG, PDF, DOCX, XLSX
- No video upload support currently

#### Concurrent Users
- Optimized for 50-100 concurrent users
- May require load balancing for higher loads

#### Database
- Single database instance
- No read replicas currently
- Manual backup process (automation recommended)

#### Real-Time Features
- Chat requires active WebSocket connection
- May disconnect on network issues
- Automatic reconnection implemented

### 20.2 Known Issues

#### Browser Compatibility
- Some features may not work in older browsers
- IE11 not supported
- Mobile Safari may have minor issues

#### Performance
- Large project lists may load slowly
- Complex queries may take time
- Image-heavy pages may be slow on slow connections

### 20.3 Workarounds

#### For Large Data Sets
- Use filters to limit results
- Use pagination
- Export to Excel for offline analysis

#### For Slow Connections
- Enable caching
- Reduce image sizes before upload
- Use mobile-optimized views

---

## 21. Maintenance Guidelines

### 21.1 Regular Maintenance Tasks

#### Daily
- Monitor system logs
- Check for errors
- Review user activity
- Verify backups ran (if automated)

#### Weekly
- Review project status updates
- Check for stuck processes
- Review feedback queue
- Monitor system performance

#### Monthly
- Review user access
- Audit user privileges
- Check database size
- Review system logs for patterns
- Update documentation

#### Quarterly
- Security audit
- Performance review
- User training (if needed)
- System updates
- Backup verification

### 21.2 Backup Procedures

#### Database Backup
```bash
# Manual backup
docker exec db mysqldump -u impesUser -pAdmin2010impes imbesdb > backup_$(date +%Y%m%d).sql

# Restore
docker exec -i db mysql -u impesUser -pAdmin2010impes imbesdb < backup_YYYYMMDD.sql
```

#### File Backup
- Backup `/uploads` directory
- Include photos and documents
- Regular backup schedule recommended

### 21.3 Update Procedures

#### Application Updates
1. Backup database and files
2. Pull latest code
3. Update dependencies
4. Run migrations
5. Rebuild containers
6. Test thoroughly
7. Deploy to production

#### Security Updates
1. Monitor security advisories
2. Update dependencies promptly
3. Test in staging first
4. Apply security patches
5. Monitor after deployment

---

## 22. Glossary of Terms

See [Appendix A: Glossary](#appendix-a-glossary) below.

---

## 23. Support and Maintenance

### Documentation
- Comprehensive inline code comments
- API documentation
- User guides
- Deployment guides
- Troubleshooting guides

### Maintenance
- Regular database backups recommended
- Log rotation
- Security updates
- Performance monitoring
- Error tracking

---

## Appendix A: Glossary

### System Terms
- **ECIMES**: Electronic County Integrated Management and Evaluation System
- **IMES**: Integrated Management and Evaluation System
- **PMTS**: Project Monitoring and Tracking System

### Technical Terms
- **API**: Application Programming Interface - Endpoints for system communication
- **JWT**: JSON Web Token - Authentication token format
- **RBAC**: Role-Based Access Control - Permission system based on user roles
- **REST**: Representational State Transfer - API architectural style
- **CRUD**: Create, Read, Update, Delete - Basic database operations
- **SQL**: Structured Query Language - Database query language
- **HTTP**: HyperText Transfer Protocol - Web communication protocol
- **HTTPS**: Secure HTTP - Encrypted web communication
- **WebSocket**: Real-time bidirectional communication protocol
- **Socket.IO**: JavaScript library for real-time communication

### Project Terms
- **PI**: Principal Investigator - Person responsible for project
- **FY**: Financial Year - Annual budget period
- **M&E**: Monitoring and Evaluation - Project tracking process
- **ESOHSG**: Environment, Safety, Occupational Health, and Social Governance
- **Milestone**: Significant project event or checkpoint
- **Task**: Individual work item within project
- **Activity**: Specific action or work unit
- **Status**: Current state of project (Not Started, Ongoing, Completed, etc.)

### Organization Terms
- **Department**: Organizational unit managing projects
- **Section**: Sub-unit within department
- **Ward**: Geographic administrative division
- **Sub-county**: Geographic administrative division above ward
- **County**: Highest level geographic administrative division

### System Terms
- **Dashboard**: Main overview page showing key metrics
- **Privilege**: Permission to perform specific action
- **Role**: Collection of privileges assigned to user type
- **Feedback**: Citizen input or comments on projects
- **Moderation**: Process of reviewing and approving content
- **Public Approval**: Process of making content visible on public dashboard

---

## Appendix B: Quick Reference Guide

### Common URLs

#### Development Environment
- Admin Dashboard: `http://localhost:5173/impes/`
- Public Dashboard: `http://localhost:5174/`
- API: `http://localhost:3000/api`
- Database: `localhost:3307`

#### Production Environment
- Admin Dashboard: `http://165.22.227.234:5173/impes/`
- Public Dashboard: `http://165.22.227.234:5174/`
- API: `http://165.22.227.234:3000/api`
- Nginx Proxy: `http://165.22.227.234:8080/impes/`

### Quick Commands

#### Docker Commands
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Restart service
docker-compose restart [service-name]

# Rebuild service
docker-compose build [service-name]
```

#### Database Commands
```bash
# Connect to database
docker exec -it db mysql -u impesUser -pAdmin2010impes imbesdb

# Backup database
docker exec db mysqldump -u impesUser -pAdmin2010impes imbesdb > backup.sql

# Restore database
docker exec -i db mysql -u impesUser -pAdmin2010impes imbesdb < backup.sql
```

### Keyboard Shortcuts

#### Browser Shortcuts
- `F12`: Open Developer Tools
- `Ctrl+R` / `Cmd+R`: Refresh page
- `Ctrl+Shift+R` / `Cmd+Shift+R`: Hard refresh (clear cache)
- `Ctrl+F` / `Cmd+F`: Find on page

#### Application Shortcuts (Planned)
- `Ctrl+N` / `Cmd+N`: New project
- `Ctrl+S` / `Cmd+S`: Save
- `Ctrl+F` / `Cmd+F`: Search/filter
- `Esc`: Close modal/dialog

---

## Appendix C: System Metrics and Statistics

### System Capacity

#### Database
- **Current Size**: Variable (depends on usage)
- **Max Recommended**: 50GB per database
- **Table Count**: 50+ tables
- **Indexes**: Optimized for query performance

#### File Storage
- **Upload Directory**: `/uploads`
- **Subdirectories**:
  - `project-photos/`: Project images
  - `contractor-photos/`: Contractor images
  - `chat-files/`: Chat attachments
  - `payment-requests/`: Payment documents

#### Performance Benchmarks
- **Page Load Time**: 2-5 seconds (production)
- **API Response Time**: < 500ms average
- **Database Query Time**: < 100ms average
- **File Upload**: Depends on file size and network

### Data Statistics

#### Typical Project Data
- **Projects per County**: 50-500+
- **Departments**: 10-20
- **Financial Years**: 3-5 active
- **Users**: 20-100+
- **Feedback Items**: Variable

#### Data Retention
- **Active Projects**: Unlimited
- **Completed Projects**: Archived but retained
- **User Activity**: Logged with timestamps
- **Feedback**: Retained for historical records

---

## Appendix D: Change Log Template

### Version 5.0 (Current)

#### Added Features
- Public dashboard with transparency features
- Two-way feedback system with ratings
- Real-time chat system
- Enhanced analytics and reporting
- Multi-level approval workflows
- Data access control system

#### Improvements
- Performance optimizations (80-90% faster)
- Production build configuration
- Enhanced security measures
- Better error handling
- Improved UI/UX

#### Bug Fixes
- Fixed statistics loading issues
- Resolved authentication token expiration
- Fixed file upload problems
- Corrected data filtering issues

---

## Appendix E: Contact and Support Information

### System Support

#### Technical Support
- Review documentation first
- Check troubleshooting guide (Section 15)
- Review system logs
- Contact system administrator

#### Documentation
- All documentation files in project root
- API documentation in code comments
- User guides available
- Video tutorials (if available)

### System Information
- **System Name**: ECIMES v5.0
- **Location**: `/home/dev/dev/imes_working/v5/imes`
- **License**: (Specify if applicable)
- **Maintainer**: (Specify if applicable)

---

## Appendix F: Frequently Asked Questions (FAQ)

### General Questions

**Q: What browsers are supported?**  
A: Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+). IE11 is not supported.

**Q: Can I use the system on mobile?**  
A: Yes, the system is responsive and works on mobile devices. Some features may have optimized mobile views.

**Q: Is there a mobile app?**  
A: Currently, the system is web-based only. A mobile app is planned for future releases.

### Project Management Questions

**Q: How do I create a new project?**  
A: Navigate to Projects → Create New Project, fill in the required fields, and save.

**Q: Can I delete a project?**  
A: Yes, administrators can delete projects. However, consider archiving instead for historical records.

**Q: How do I update project status?**  
A: Go to project details, click Edit, update the status field, and save.

### User Management Questions

**Q: How do I create a new user?**  
A: Administrators can create users via User Management → Create User.

**Q: Can users reset their own passwords?**  
A: Password reset functionality is planned for future releases. Currently, administrators can reset passwords.

**Q: How do I restrict a user's access?**  
A: Use Data Access Control settings to limit users to specific departments, wards, or projects.

### Public Dashboard Questions

**Q: How do projects appear on the public dashboard?**  
A: Projects must be approved for public display. Use the Public Approval feature to make projects visible.

**Q: Can citizens edit or delete feedback?**  
A: No, citizens cannot edit or delete submitted feedback. They can submit additional feedback if needed.

**Q: How quickly are feedback responses provided?**  
A: Response time depends on county staff. A 5-business-day response time is recommended.

### Technical Questions

**Q: How do I backup the system?**  
A: See Section 21.2 for backup procedures. Database and file backups are both important.

**Q: What happens if the server goes down?**  
A: The system will be unavailable until the server is restored. Regular backups ensure data recovery.

**Q: Can I integrate with other systems?**  
A: Yes, the REST API allows integration. See Section 18 for integration guidelines.

---

## Appendix G: Additional Resources

### Internal Documentation
- `QUICK_START.md`: Quick start guide
- `DEPLOYMENT_GUIDE.md`: Detailed deployment instructions
- `USER_ACCESS_CONTROL_GUIDE.md`: Access control configuration
- `PUBLIC_DASHBOARD_IMPLEMENTATION_GUIDE.md`: Public dashboard details
- `FEEDBACK_RATING_COMPLETE_GUIDE.md`: Feedback system guide
- `CHAT_SYSTEM_READY.md`: Chat system documentation

### External Resources
- Material-UI Documentation: https://mui.com/
- React Documentation: https://react.dev/
- Node.js Documentation: https://nodejs.org/docs
- MySQL Documentation: https://dev.mysql.com/doc/
- Docker Documentation: https://docs.docker.com/

### Training Resources
- User training materials (if available)
- Video tutorials (if available)
- Best practices guide (Section 14)
- Use cases and scenarios (Section 12)

---

---

## Appendix B: Version History

- **v5.0** (Current): Complete system with public dashboard, chat, feedback system
- **v4.0**: Enhanced project management, approval workflows
- **v3.0**: Basic project management system
- **v2.0**: Initial implementation
- **v1.0**: Prototype

---

**Document End**

