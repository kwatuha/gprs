# ECIMES User Manual
## Electronic County Integrated Management and Evaluation System

**Version:** 5.0  
**Last Updated:** 2025  
**System:** ECIMES (Electronic County Integrated Management and Evaluation System)

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Getting Started](#2-getting-started)
3. [System Overview](#3-system-overview)
4. [User Roles and Access](#4-user-roles-and-access)
5. [Admin Dashboard Guide](#5-admin-dashboard-guide)
6. [Public Dashboard Guide](#6-public-dashboard-guide)
7. [Common Tasks](#7-common-tasks)
8. [Troubleshooting](#8-troubleshooting)
9. [Frequently Asked Questions](#9-frequently-asked-questions)
10. [Appendices](#10-appendices)

---

## 🚀 Quick Start - Test Credentials

For testing and training purposes, use these credentials to access the Admin Dashboard:

| Field | Value |
|-------|-------|
| **Username** | `akwatuha` |
| **Password** | `reset123` |
| **Access Level** | Varies (configured by administrator) |

> ⚠️ **Important**: These are test credentials. Never use test credentials in production environments. Always change default passwords and use strong, unique passwords for all user accounts.

**Login URL (Production)**: `http://165.22.227.234:8080/impes/`  
**Login URL (Development)**: `http://localhost:5173/impes/`

---

## 📸 About Screenshots

This user manual includes references to screenshots throughout to help visualize the system interface. Screenshots are marked with a 📸 icon and include:

- **Description**: What the screenshot should show
- **Location**: File path where the screenshot should be placed

**Screenshot Directory Structure:**
```
screenshots/
├── 02-getting-started/
├── 03-system-overview/
├── 05-admin-dashboard/
└── 06-public-dashboard/
```

To add screenshots:
1. Capture screenshots from the actual system
2. Save them in the corresponding directories
3. Use the exact filenames specified in the manual
4. Ensure screenshots are clear, high-resolution, and properly annotated

See [Screenshot Index](#106-screenshot-index) for a complete list of all screenshots referenced in this manual.

---

## 1. Introduction

### 1.1 What is ECIMES?

ECIMES (Electronic County Integrated Management and Evaluation System) is a comprehensive web-based platform designed for county governments to manage, track, and monitor infrastructure and development projects transparently and efficiently.

### 1.2 Key Benefits

- **Transparency**: Public access to project information and progress
- **Accountability**: Track project status, budgets, and milestones
- **Efficiency**: Streamline project management workflows
- **Collaboration**: Enable communication between stakeholders
- **Data-Driven Decisions**: Provide analytics and reporting tools

### 1.3 Who Can Use This System?

- **County Administrators**: Full system access and management
- **Project Managers**: Manage and monitor assigned projects
- **County Staff**: Department heads and employees
- **Contractors**: View and update project progress
- **Citizens**: Public access to project information and feedback (no login required)

---

## 2. Getting Started

### 2.1 Accessing the System

#### Admin Dashboard (For County Staff)
- **URL**: `http://165.22.227.234:8080/impes/` (Production)
- **URL**: `http://localhost:5173/impes/` (Development)
- **Requires**: Username and password

#### Public Dashboard (For Citizens)
- **URL**: `http://165.22.227.234:5174/` (Production)
- **URL**: `http://localhost:5174/` (Development)
- **Requires**: No login needed

### 2.2 System Requirements

#### Browser Compatibility
- **Recommended**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Not Supported**: Internet Explorer 11

#### Internet Connection
- Stable internet connection required
- Minimum 1 Mbps for optimal performance

#### Mobile Devices
- Responsive design works on tablets and smartphones
- Some features optimized for mobile use

### 2.3 First-Time Login

1. **Obtain Credentials**: Contact your system administrator to receive your username and password
2. **Access Login Page**: Navigate to the Admin Dashboard URL
3. **Enter Credentials**: 
   - Username: (provided by administrator)
   - Password: (provided by administrator)
4. **Click "Login"**
5. **Change Password** (Recommended): After first login, consider changing your password

> 📸 **Screenshot 2.1**: Login Page
> 
> *[Screenshot should show: Login page with E-CIMES logo, username/email field, password field, and Login button on a blue gradient background]*
> 
> **Location**: `screenshots/02-getting-started/01-login-page.png`

#### Test User Credentials

For testing and training purposes, the following test user is available:

- **Username**: `akwatuha`
- **Password**: `reset123`
- **Role**: (varies based on configuration)

> ⚠️ **Note**: Test credentials should only be used in development/testing environments. Change default passwords in production.

### 2.4 Logging Out

1. Click on your **profile icon** in the top-right corner
2. Select **"Logout"** from the dropdown menu
3. You will be redirected to the login page

> 📸 **Screenshot 2.2**: User Profile Menu
> 
> *[Screenshot should show: Top-right corner with profile icon, dropdown menu showing user name, role, and Logout option]*
> 
> **Location**: `screenshots/02-getting-started/02-profile-menu.png`

---

## 3. System Overview

### 3.1 Main Components

The ECIMES system consists of two main interfaces:

1. **Admin Dashboard**: Internal system for county staff
   - Project management
   - User management
   - Reporting and analytics
   - Feedback management
   - System configuration

2. **Public Dashboard**: Public-facing transparency portal
   - Project gallery
   - Statistics and analytics
   - Feedback submission
   - No authentication required

> 📸 **Screenshot 3.1**: System Architecture Overview
> 
> *[Diagram should show: Admin Dashboard and Public Dashboard as two separate interfaces, both connecting to the backend API and database]*
> 
> **Location**: `screenshots/03-system-overview/01-system-architecture.png`

### 3.2 Key Features

- **Project Management**: Create, track, and manage projects throughout their lifecycle
- **Financial Tracking**: Monitor budgets, payments, and financial performance
- **Real-Time Communication**: Chat system for internal collaboration
- **Public Engagement**: Citizen feedback and response system
- **Analytics & Reporting**: Comprehensive dashboards and reports
- **Document Management**: Upload and manage project documents and photos
- **Approval Workflows**: Multi-level approval processes
- **Geographic Management**: Organize projects by location (County, Sub-county, Ward)

---

## 4. User Roles and Access

### 4.1 Available Roles

#### Administrator
- **Full System Access**: All features and functions
- **User Management**: Create, edit, and manage users
- **System Configuration**: Configure settings, metadata, and workflows
- **Data Access**: View all projects and data
- **Privileges**: All privileges granted

#### Project Manager
- **Project Management**: Create, edit, and manage projects
- **Team Assignment**: Assign team members to projects
- **Progress Tracking**: Update project status and progress
- **Reporting**: Generate and view reports
- **Limited Admin Access**: Cannot manage users or system settings

#### Basic User
- **View Projects**: Access assigned projects only
- **Update Information**: Update project information within assigned scope
- **Submit Reports**: Submit progress reports
- **Limited Access**: Restricted to assigned departments/wards/projects

#### Contractor
- **View Assigned Projects**: See only projects assigned to them
- **Update Progress**: Report project progress and upload photos
- **Payment Requests**: Submit payment requests
- **Limited Access**: Cannot view other contractors' projects

#### Citizen/Public
- **View Public Projects**: Browse public project gallery
- **Submit Feedback**: Provide feedback on projects
- **View Statistics**: Access public analytics
- **No Authentication**: No login required

### 4.2 Understanding Privileges

Privileges control access to specific features. Common privileges include:

- `projects.create` - Create new projects
- `projects.edit` - Edit existing projects
- `projects.delete` - Delete projects
- `projects.approve` - Approve projects
- `users.manage` - Manage user accounts
- `feedback.respond` - Respond to citizen feedback
- `feedback.moderate` - Moderate feedback submissions
- `public_content.approve` - Approve content for public display

### 4.3 Data Access Control

Your access may be restricted based on:

- **Department**: Only see projects from your department
- **Ward/Region**: Only see projects in your assigned geographic area
- **Project Assignments**: Only see projects you're assigned to
- **Budget Limits**: Only see projects within your budget authority

---

## 5. Admin Dashboard Guide

### 5.1 Dashboard Overview

The Admin Dashboard is your main workspace. It provides:

- **Quick Statistics**: Overview of key metrics
- **Project Status**: Visual representation of project statuses
- **Recent Activity**: Latest updates and changes
- **Quick Actions**: Fast access to common tasks

#### Accessing the Dashboard
1. Log in to the Admin Dashboard
2. The Dashboard is the default landing page
3. Or click **"Dashboard"** in the sidebar menu

> 📸 **Screenshot 5.1**: Admin Dashboard Overview
> 
> *[Screenshot should show: Main dashboard with statistics cards, charts, project status indicators, and sidebar navigation menu]*
> 
> **Location**: `screenshots/05-admin-dashboard/01-dashboard-overview.png`

### 5.2 Navigation Menu

The sidebar menu is organized into categories:

> 📸 **Screenshot 5.2**: Navigation Sidebar
> 
> *[Screenshot should show: Left sidebar with collapsible menu showing Dashboard, Reporting, Management, Public, and Admin sections with icons]*
> 
> **Location**: `screenshots/05-admin-dashboard/02-navigation-sidebar.png`

#### Dashboard
- **Dashboard**: Main overview page
- **Contractor Dashboard**: Specialized view for contractors

#### Reporting
- **Projects**: View and manage all projects
- **Project Dashboards**: Detailed project analytics
- **Absorption Report**: Budget absorption analysis
- **Performance Management Report**: Performance metrics
- **CAPR Report**: County Annual Performance Report

#### Management
- **Project Management**: Create and manage projects
- **Strategic Planning**: Link projects to strategic plans
- **Data Import**: Import projects from Excel
- **GIS Map**: Geographic visualization
- **Project Gantt Chart**: Timeline visualization

#### Public
- **Public Approval**: Approve projects for public display
- **Citizen Feedback**: Manage and respond to feedback
- **County Projects**: Manage county-proposed projects
- **Announcements**: Create and manage project announcements

#### Admin (Administrators Only)
- **Admin**: System administration panel
- **User Management**: Create and manage users
- **Workflow Management**: Configure approval workflows
- **Approval Levels**: Manage approval hierarchies
- **Metadata Management**: Manage reference data
- **Contractor Management**: Manage contractor accounts

### 5.3 Project Management

#### Creating a New Project

1. Navigate to **Management → Project Management**
2. Click the **"Create New Project"** button (usually a "+" icon)

> 📸 **Screenshot 5.3**: Project Management Page
> 
> *[Screenshot should show: Projects list page with "Create New Project" button, project table with columns, and filter options]*
> 
> **Location**: `screenshots/05-admin-dashboard/03-project-management-page.png`

3. Fill in the required fields:
   - **Project Name**: Descriptive name for the project
   - **Department**: Select the managing department
   - **Financial Year**: Select the relevant financial year
   - **Location**: Select County, Sub-county, and Ward
   - **Project Category**: Select category (e.g., Infrastructure, Health, Education)
   - **Project Type**: Select specific type
   - **Budget**: Enter total project budget
   - **Start Date**: Project commencement date
   - **End Date**: Expected completion date
4. Fill in optional fields as needed
5. Click **"Save"** or **"Create Project"**

> 📸 **Screenshot 5.4**: Create Project Form
> 
> *[Screenshot should show: Project creation form with all input fields, dropdowns for department/financial year/location, and Save button]*
> 
> **Location**: `screenshots/05-admin-dashboard/04-create-project-form.png`

#### Viewing Project Details

1. Navigate to **Reporting → Projects**
2. Use filters to find the project (by name, department, status, etc.)
3. Click on the project name or row to open project details

> 📸 **Screenshot 5.5**: Project Details Page
> 
> *[Screenshot should show: Project details page with tabs for Overview, Financial, Tasks, Photos, Documents, and comprehensive project information]*
> 
> **Location**: `screenshots/05-admin-dashboard/05-project-details.png`

4. View comprehensive information:
   - Basic details
   - Financial information
   - Tasks and milestones
   - Photos and documents
   - Feedback
   - History and updates

#### Editing a Project

1. Open the project details page
2. Click the **"Edit"** button
3. Modify the fields you need to update
4. Click **"Save"** to apply changes

#### Updating Project Status

1. Open the project details page
2. Click **"Edit"**
3. Find the **"Status"** field
4. Select new status:
   - **Not Started**: Project not yet begun
   - **Under Procurement**: In procurement phase
   - **Ongoing**: Currently in progress
   - **Completed**: Project finished
   - **Stalled**: Project temporarily stopped
5. Click **"Save"**

#### Updating Project Progress

1. Open the project details page
2. Find the **"Progress"** section
3. Update the **"Progress Percentage"** (0-100%)
4. Add **"Progress Notes"** describing recent work
5. Click **"Save"**

### 5.4 Financial Management

#### Viewing Project Budget

1. Open project details
2. Navigate to **"Financial Information"** tab
3. View:
   - Total budget
   - Allocated amount
   - Paid amount
   - Remaining budget
   - Financial year breakdown

#### Adding Payment Information

1. Open project details
2. Navigate to **"Payments"** or **"Financial Information"** section
3. Click **"Add Payment"** or **"Record Payment"**
4. Enter:
   - Payment amount
   - Payment date
   - Payment description
   - Supporting documents (optional)
5. Click **"Save"**

### 5.5 Task and Activity Management

#### Creating a Task

1. Open project details
2. Navigate to **"Tasks"** or **"Activities"** tab
3. Click **"Add Task"** or **"Create Task"**
4. Fill in:
   - Task name
   - Description
   - Assignee (if applicable)
   - Due date
   - Priority
5. Click **"Save"**

#### Updating Task Status

1. Open project details → Tasks tab
2. Find the task you want to update
3. Click on the task
4. Update status (e.g., Not Started, In Progress, Completed)
5. Add notes if needed
6. Click **"Save"**

### 5.6 Photo Management

#### Uploading Project Photos

1. Open project details
2. Navigate to **"Photos"** or **"Gallery"** tab
3. Click **"Upload Photo"** or **"Add Photo"**
4. Select image file (JPG, PNG - max 10MB)
5. Add photo description (optional)
6. Click **"Upload"**

> 📸 **Screenshot 5.6**: Photo Gallery
> 
> *[Screenshot should show: Photo gallery tab with grid of project photos, upload button, and photo thumbnails with descriptions]*
> 
> **Location**: `screenshots/05-admin-dashboard/06-photo-gallery.png`

#### Viewing Photo Gallery

1. Open project details
2. Navigate to **"Photos"** tab
3. Browse through photo thumbnails
4. Click on a photo to view full size
5. Use navigation arrows to browse

### 5.7 Document Management

#### Uploading Documents

1. Open project details
2. Navigate to **"Documents"** or **"Attachments"** tab
3. Click **"Upload Document"**
4. Select file (PDF, DOCX, XLSX - max 10MB)
5. Enter document name and description
6. Select document category (optional)
7. Click **"Upload"**

#### Downloading Documents

1. Open project details → Documents tab
2. Find the document you need
3. Click the **download icon** or document name
4. File will download to your computer

### 5.8 User Management (Administrators Only)

#### Creating a New User

1. Navigate to **Admin → User Management**
2. Click **"Create User"** or **"Add User"** button

> 📸 **Screenshot 5.7**: User Management Page
> 
> *[Screenshot should show: User management page with user list table, Create User button, and user information columns]*
> 
> **Location**: `screenshots/05-admin-dashboard/07-user-management.png`

3. Fill in user information:
   - **Name**: Full name
   - **Username**: Unique username
   - **Email**: Email address
   - **Password**: Initial password
   - **Role**: Select role (Admin, Project Manager, Basic User, Contractor)
   - **Department**: Assign to department (optional)
4. Click **"Create"** or **"Save"**

#### Editing User Information

1. Navigate to **Admin → User Management**
2. Find the user in the list
3. Click **"Edit"** or click on the user row
4. Modify the information
5. Click **"Save"**

#### Assigning Privileges

1. Open user details (Edit user)
2. Navigate to **"Privileges"** tab
3. Check/uncheck privileges as needed
4. Click **"Save"**

#### Activating/Deactivating Users

1. Navigate to **Admin → User Management**
2. Find the user
3. Click **"Activate"** or **"Deactivate"** button
4. Confirm the action

### 5.9 Feedback Management

#### Viewing Feedback

1. Navigate to **Public → Citizen Feedback**
2. View list of all feedback submissions
3. Filter by:
   - Status (Pending, Reviewed, Responded)
   - Project
   - Date range
4. Click on feedback to view details

> 📸 **Screenshot 5.8**: Feedback Management Page
> 
> *[Screenshot should show: Feedback list with status indicators, filter options, and feedback items with project names and messages]*
> 
> **Location**: `screenshots/05-admin-dashboard/08-feedback-management.png`

#### Moderating Feedback

1. Navigate to **Public → Citizen Feedback**
2. Find pending feedback
3. Review the feedback content
4. Click **"Approve"** or **"Reject"**
5. If rejecting, provide reason (optional)

#### Responding to Feedback

1. Open feedback details
2. Review the citizen's message
3. Click **"Respond"** or **"Add Response"**
4. Type your official response
5. Click **"Submit Response"**
6. The response will be visible on the public dashboard

> 📸 **Screenshot 5.9**: Feedback Response Form
> 
> *[Screenshot should show: Feedback details page with citizen's message, response text area, and submit button]*
> 
> **Location**: `screenshots/05-admin-dashboard/09-feedback-response.png`

### 5.10 Public Approval Management

#### Approving Projects for Public Display

1. Navigate to **Public → Public Approval**
2. View list of projects pending approval
3. Review project details
4. Check that:
   - Project information is complete
   - Photos are appropriate
   - Description is clear
5. Click **"Approve for Public Display"**
6. Project will appear on public dashboard

#### Removing Projects from Public Display

1. Navigate to **Public → Public Approval**
2. Find the project
3. Click **"Remove from Public"** or **"Revoke Approval"**
4. Confirm the action

### 5.11 Reporting and Analytics

#### Viewing Dashboard Statistics

1. Navigate to **Dashboard**
2. View key statistics:
   - Total projects
   - Active projects
   - Completed projects
   - Budget summaries
3. Click on statistics cards to see detailed views

#### Generating Reports

1. Navigate to **Reporting → Reports** (or specific report type)
2. Select filters:
   - Financial year
   - Department
   - Status
   - Date range
   - Location
3. Click **"Generate Report"**
4. Review the report
5. Export if needed (PDF/Excel)

#### Project Dashboards

1. Navigate to **Reporting → Project Dashboards**
2. Select a project
3. View comprehensive analytics:
   - Progress charts
   - Financial breakdown
   - Timeline visualization
   - Status history

### 5.12 Chat System

#### Accessing Chat

1. Look for the **chat icon** (usually a floating button or in the sidebar)
2. Click to open the chat panel
3. Select a chat room from the list

> 📸 **Screenshot 5.10**: Chat System
> 
> *[Screenshot should show: Chat panel with room list, message area, typing indicator, and file upload option]*
> 
> **Location**: `screenshots/05-admin-dashboard/10-chat-system.png`

#### Sending Messages

1. Open a chat room
2. Type your message in the input box
3. Press **Enter** or click **"Send"**
4. Message appears in real-time

#### Uploading Files in Chat

1. Open chat room
2. Click the **attachment icon** (paperclip)
3. Select file (image or document)
4. File uploads and appears in chat

#### Creating Chat Rooms

1. Navigate to chat settings (if available)
2. Click **"Create Room"**
3. Enter room name
4. Set access permissions
5. Click **"Create"**

### 5.13 Data Import

#### Importing Projects from Excel

1. Navigate to **Management → Data Import** or **Project Import**
2. Download the import template (if available)
3. Fill in the template with project data
4. Click **"Choose File"** or **"Browse"**
5. Select your completed Excel file
6. Click **"Upload"** or **"Import"**
7. Review import preview
8. Click **"Confirm Import"**
9. Verify imported projects

---

## 6. Public Dashboard Guide

### 6.1 Overview

The Public Dashboard is a transparency portal where citizens can:
- View county projects
- See project statistics
- Submit feedback
- Track project progress
- View county responses to feedback

**No login required!**

### 6.2 Navigation

The public dashboard has a simple navigation menu:

- **Home**: Overview and statistics
- **Dashboard**: Detailed analytics
- **Projects**: Project gallery
- **Feedback**: Submit and view feedback
- **Announcements**: County announcements

> 📸 **Screenshot 6.1**: Public Dashboard Homepage
> 
> *[Screenshot should show: Public dashboard homepage with navigation menu, statistics cards, and overview information]*
> 
> **Location**: `screenshots/06-public-dashboard/01-homepage.png`

### 6.3 Viewing Project Statistics

#### Home Page Overview

1. Visit the public dashboard URL
2. The home page shows:
   - Total projects count
   - Total budget
   - Projects by status
   - Quick statistics cards
3. Click on any statistic card to see detailed information

> 📸 **Screenshot 6.2**: Public Dashboard Statistics
> 
> *[Screenshot should show: Statistics cards with project counts, budget totals, and status breakdown with visual indicators]*
> 
> **Location**: `screenshots/06-public-dashboard/02-statistics-cards.png`

#### Dashboard Analytics

1. Click **"Dashboard"** in the menu
2. View comprehensive analytics:
   - Department-wise breakdown
   - Sub-county distribution
   - Ward-level statistics
   - Financial year comparison
3. Use the **Financial Year** dropdown to filter data
4. Click on charts for interactive details

> 📸 **Screenshot 6.3**: Public Dashboard Analytics
> 
> *[Screenshot should show: Analytics dashboard with charts, department breakdown table, sub-county distribution, and financial year selector]*
> 
> **Location**: `screenshots/06-public-dashboard/03-analytics-dashboard.png`

### 6.4 Browsing Projects

#### Project Gallery

1. Click **"Projects"** in the menu
2. Browse project cards showing:
   - Project photos
   - Project name
   - Location
   - Status
   - Budget
3. Use filters:
   - **Department**: Filter by department
   - **Status**: Filter by project status
   - **Financial Year**: Filter by year
   - **Search**: Search by project name
4. Click on a project card to view details

> 📸 **Screenshot 6.4**: Project Gallery
> 
> *[Screenshot should show: Grid of project cards with photos, project names, locations, status badges, and filter options]*
> 
> **Location**: `screenshots/06-public-dashboard/04-project-gallery.png`

#### Project Details

1. Click on a project card
2. View comprehensive information:
   - Project description
   - Location details
   - Status and progress
   - Budget information
   - Photo gallery
   - Timeline
3. Scroll through photos
4. View project on map (if available)

### 6.5 Submitting Feedback

#### How to Submit Feedback

1. Navigate to **"Feedback"** page, OR
2. Click on a project and use the **"Submit Feedback"** button

> 📸 **Screenshot 6.5**: Feedback Submission Form
> 
> *[Screenshot should show: Feedback form with project selector, message text area, rating stars, optional name/email fields, and submit button]*
> 
> **Location**: `screenshots/06-public-dashboard/05-feedback-form.png`

3. Fill in the feedback form:
   - **Project**: Select project (if not pre-selected)
   - **Message**: Enter your feedback (required)
   - **Ratings**: Optionally rate different aspects (1-5 stars):
     - Overall satisfaction
     - Quality
     - Timeliness
     - Communication
     - Impact
   - **Name**: Your name (optional - can submit anonymously)
   - **Email/Phone**: Contact information (optional)
4. Click **"Submit Feedback"**
5. You'll see a confirmation message

#### Viewing Your Feedback Status

1. Navigate to **"Feedback"** page
2. Scroll to see all feedback (including yours)
3. Your feedback will show:
   - Status (Pending, Reviewed, Responded)
   - County response (when available)
   - Date submitted

> 📸 **Screenshot 6.6**: Feedback List with Responses
> 
> *[Screenshot should show: List of feedback items with status badges, citizen messages, county responses, and dates]*
> 
> **Location**: `screenshots/06-public-dashboard/06-feedback-list.png`

#### Viewing County Responses

1. Navigate to **"Feedback"** page
2. Find feedback items with **"Responded"** status
3. Click to expand and view the county's official response
4. Responses are public and visible to everyone

### 6.6 Viewing Announcements

1. Click **"Announcements"** in the menu
2. View list of county announcements
3. Click on an announcement to read full details
4. Announcements may include:
   - Project updates
   - Public notices
   - Important dates
   - County communications

---

## 7. Common Tasks

### 7.1 For Administrators

#### Setting Up a New Financial Year

1. Navigate to **Admin → Metadata Management**
2. Click **"Financial Years"**
3. Click **"Add Financial Year"**
4. Enter:
   - Financial year name (e.g., "2024/2025")
   - Start date
   - End date
5. Mark as **"Active"** if this is the current year
6. Click **"Save"**

#### Bulk Importing Projects

1. Navigate to **Management → Data Import** or **Project Import**
2. Download the import template
3. Fill template with project data:
   - Project names
   - Departments
   - Budgets
   - Locations
   - Dates
4. Save the Excel file
5. Upload the file
6. Review import preview
7. Confirm import
8. Verify imported projects

#### Creating a New Department

1. Navigate to **Admin → Metadata Management**
2. Click **"Departments"**
3. Click **"Add Department"**
4. Enter department name
5. Add description (optional)
6. Click **"Save"**

#### Configuring Approval Workflow

1. Navigate to **Admin → Workflow Management**
2. Review existing workflows
3. Click **"Create Workflow"** or edit existing
4. Define approval levels:
   - Level 1: First approver role
   - Level 2: Second approver role
   - Continue for additional levels
5. Set approval order
6. Click **"Save"**

### 7.2 For Project Managers

#### Creating and Tracking a Project

1. **Create Project**: Follow steps in Section 5.3
2. **Add Tasks**: Create initial tasks and milestones
3. **Set Budget**: Enter financial information
4. **Assign Team**: Assign team members (if applicable)
5. **Upload Initial Documents**: Add project documents
6. **Regular Updates**:
   - Update progress percentage weekly
   - Upload progress photos monthly
   - Update status as project progresses
   - Add activity notes regularly

#### Monitoring Project Health

1. Navigate to **Dashboard**
2. Review project status indicators
3. Check for warnings on at-risk projects
4. Review timeline vs. actual progress
5. Check budget utilization
6. Take corrective action if needed

#### Generating Project Reports

1. Navigate to **Reporting → Project Dashboards**
2. Select your project
3. Review analytics:
   - Progress charts
   - Financial breakdown
   - Timeline
4. Export report if needed

### 7.3 For Contractors

#### Updating Project Progress

1. Log in to Contractor Dashboard
2. Navigate to **"My Projects"**
3. Select the project
4. Update **"Progress Percentage"**
5. Add **"Progress Notes"** describing work done
6. Upload recent **"Progress Photos"**
7. Click **"Save"**

#### Submitting Payment Request

1. Open project details
2. Navigate to **"Payment Requests"** section
3. Click **"New Payment Request"**
4. Enter:
   - Amount requested
   - Description of work completed
   - Supporting documents (invoices, receipts)
5. Click **"Submit"**
6. Track approval status

#### Uploading Progress Photos

1. Open project details
2. Navigate to **"Photos"** tab
3. Click **"Upload Photo"**
4. Select recent progress photos
5. Add descriptions
6. Click **"Upload"**

### 7.4 For Citizens

#### Finding Information About a Project

1. Visit the public dashboard
2. Use **"Projects"** page
3. Use search or filters to find the project
4. Click on project to view details
5. Review:
   - Project description
   - Current status
   - Progress photos
   - Budget information
   - Location

#### Submitting Feedback on a Project

1. Find the project (see above)
2. Click **"Submit Feedback"** button
3. Fill in feedback form
4. Add ratings (optional)
5. Submit
6. Check back later for county response

#### Tracking Multiple Projects

1. Bookmark the public dashboard
2. Visit regularly to check:
   - Project status updates
   - New photos
   - Progress updates
3. Use filters to focus on:
   - Your ward
   - Specific department
   - Project status

---

## 8. Troubleshooting

### 8.1 Login Issues

#### Problem: Cannot Log In

**Symptoms:**
- "Invalid credentials" error message
- Login button doesn't work

**Solutions:**
1. **Verify Credentials**: Double-check username and password (case-sensitive)
2. **Check Account Status**: Contact administrator to verify account is active
3. **Clear Browser Cache**: 
   - Press `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
   - Select "Cached images and files"
   - Clear data
4. **Try Different Browser**: Switch to Chrome, Firefox, or Edge
5. **Check Internet Connection**: Ensure stable connection
6. **Contact Administrator**: If problem persists

#### Problem: Session Expired

**Symptoms:**
- Sudden logout
- "Unauthorized" error messages

**Solutions:**
1. **Simply Log In Again**: Session may have expired (default: 24 hours)
2. **Check System Clock**: Ensure your computer's clock is correct
3. **Clear Browser Data**: Clear cookies and cache
4. **Contact Administrator**: If problem continues

### 8.2 Data Display Issues

#### Problem: Projects Not Showing

**Symptoms:**
- Empty project list
- "No projects found" message

**Solutions:**
1. **Check Filters**: Remove or adjust filters that may be too restrictive
2. **Verify Access**: Check if you have access to the projects (data access control)
3. **Check Status Filter**: Ensure status filter includes relevant statuses
4. **Refresh Page**: Press `F5` or `Ctrl+R`
5. **Contact Administrator**: If you believe you should have access

#### Problem: Statistics Not Loading

**Symptoms:**
- Loading spinner never stops
- "Failed to load" error

**Solutions:**
1. **Select Financial Year**: Ensure a financial year is selected
2. **Refresh Page**: Hard refresh with `Ctrl+Shift+R`
3. **Check Internet**: Verify stable connection
4. **Try Later**: Server may be temporarily busy
5. **Contact Support**: If problem persists

### 8.3 File Upload Issues

#### Problem: Photo Upload Fails

**Symptoms:**
- Upload progress stuck
- "Upload failed" error

**Solutions:**
1. **Check File Size**: Maximum 10MB per file
2. **Check File Format**: Use JPG or PNG only
3. **Reduce File Size**: Compress image before uploading
4. **Check Internet**: Ensure stable connection
5. **Try Smaller File**: Test with a smaller image first
6. **Contact Support**: If problem continues

#### Problem: Document Upload Fails

**Symptoms:**
- File not appearing after upload
- Upload error message

**Solutions:**
1. **Check File Format**: Use PDF, DOCX, or XLSX
2. **Check File Size**: Maximum 10MB
3. **Check File Name**: Avoid special characters
4. **Try Different File**: Test with another document
5. **Contact Support**: If problem persists

### 8.4 Performance Issues

#### Problem: Pages Load Slowly

**Symptoms:**
- Pages take 10+ seconds to load
- Timeout errors

**Solutions:**
1. **Check Internet Speed**: Test connection speed
2. **Clear Browser Cache**: Clear cached files
3. **Close Other Tabs**: Free up browser resources
4. **Use Filters**: Limit data displayed using filters
5. **Try Different Browser**: Some browsers perform better
6. **Check Server Status**: Contact administrator if system-wide issue

#### Problem: Chat Not Working

**Symptoms:**
- Messages not sending
- Real-time updates not working

**Solutions:**
1. **Refresh Page**: Reload the page
2. **Check Internet**: Ensure stable connection
3. **Check Browser Console**: Press `F12` and look for errors
4. **Try Different Browser**: WebSocket issues may be browser-specific
5. **Contact Support**: If problem continues

### 8.5 Getting Help

#### When to Contact Support

Contact your system administrator or support team if:
- Login issues persist after trying solutions
- Data appears incorrect
- Features not working as expected
- System errors or crashes
- Security concerns

#### Information to Provide

When reporting issues, provide:
1. **Description**: What you were trying to do
2. **Error Messages**: Exact error text
3. **Steps to Reproduce**: What you did before the error
4. **Browser**: Browser name and version
5. **User Role**: Your role in the system
6. **Screenshots**: If possible

---

## 9. Frequently Asked Questions

### 9.1 General Questions

**Q: What browsers are supported?**  
A: Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+). Internet Explorer 11 is not supported.

**Q: Can I use the system on mobile?**  
A: Yes! The system is responsive and works on tablets and smartphones. Some features are optimized for mobile.

**Q: Is there a mobile app?**  
A: Currently, the system is web-based only. A mobile app is planned for future releases.

**Q: Do I need special software?**  
A: No special software needed. Just a modern web browser and internet connection.

**Q: Is my data secure?**  
A: Yes. The system uses secure authentication, encrypted connections (HTTPS in production), and follows security best practices.

### 9.2 Project Management Questions

**Q: How do I create a new project?**  
A: Navigate to Management → Project Management → Create New Project. Fill in required fields and save.

**Q: Can I delete a project?**  
A: Administrators can delete projects. However, consider archiving instead to maintain historical records.

**Q: How do I update project status?**  
A: Open project details → Click Edit → Update Status field → Save.

**Q: Can I edit a project after it's created?**  
A: Yes, if you have edit privileges. Open project details and click Edit.

**Q: How do I add photos to a project?**  
A: Open project details → Photos tab → Upload Photo → Select file → Upload.

**Q: What file formats are supported for uploads?**  
A: Photos: JPG, PNG. Documents: PDF, DOCX, XLSX. Maximum file size: 10MB per file.

### 9.3 User Management Questions

**Q: How do I create a new user?**  
A: Administrators: Navigate to Admin → User Management → Create User. Fill in details and assign role.

**Q: Can users reset their own passwords?**  
A: Password reset functionality is planned. Currently, administrators can reset passwords.

**Q: How do I restrict a user's access?**  
A: Use Data Access Control settings to limit users to specific departments, wards, or projects.

**Q: What's the difference between roles and privileges?**  
A: Roles are collections of privileges (e.g., "Project Manager"). Privileges are specific permissions (e.g., "projects.create").

### 9.4 Public Dashboard Questions

**Q: How do projects appear on the public dashboard?**  
A: Projects must be approved for public display by administrators using the Public Approval feature.

**Q: Can citizens edit or delete feedback?**  
A: No, citizens cannot edit or delete submitted feedback. They can submit additional feedback if needed.

**Q: How quickly are feedback responses provided?**  
A: Response time depends on county staff. A 5-business-day response time is recommended.

**Q: Can I submit anonymous feedback?**  
A: Yes! Name and contact information are optional when submitting feedback.

**Q: How do I find projects in my area?**  
A: Use the filters on the Projects page to filter by Sub-county or Ward.

### 9.5 Technical Questions

**Q: What if I forget my password?**  
A: Contact your system administrator to reset your password.

**Q: Why can't I see certain projects?**  
A: Your access may be restricted by department, ward, or project assignments. Contact administrator if you believe you should have access.

**Q: How do I export data?**  
A: Use the Reports feature to generate reports, then export to PDF or Excel (if available).

**Q: Can I work offline?**  
A: No, the system requires an active internet connection.

**Q: What happens if the server goes down?**  
A: The system will be unavailable until the server is restored. Regular backups ensure data recovery.

### 9.6 Feedback Questions

**Q: How do I submit feedback?**  
A: Visit the public dashboard → Feedback page → Fill in form → Submit. Or click "Submit Feedback" on a project page.

**Q: Will my feedback be public?**  
A: Yes, approved feedback is visible on the public dashboard. You can submit anonymously if preferred.

**Q: How do I know if my feedback was responded to?**  
A: Check the Feedback page. Feedback with responses will show "Responded" status and display the county's response.

**Q: Can I rate projects?**  
A: Yes! When submitting feedback, you can optionally provide 1-5 star ratings for different aspects.

---

## 10. Appendices

### 10.1 Keyboard Shortcuts

#### Browser Shortcuts
- `F12`: Open Developer Tools
- `Ctrl+R` / `Cmd+R`: Refresh page
- `Ctrl+Shift+R` / `Cmd+Shift+R`: Hard refresh (clear cache)
- `Ctrl+F` / `Cmd+F`: Find on page
- `Esc`: Close modal/dialog

#### Application Shortcuts (Planned)
- `Ctrl+N` / `Cmd+N`: New project (planned)
- `Ctrl+S` / `Cmd+S`: Save (planned)
- `Ctrl+F` / `Cmd+F`: Search/filter (planned)

### 10.2 Glossary

**ECIMES**: Electronic County Integrated Management and Evaluation System

**Project Status**:
- **Not Started**: Project not yet begun
- **Under Procurement**: In procurement phase
- **Ongoing**: Currently in progress
- **Completed**: Project finished
- **Stalled**: Project temporarily stopped

**Financial Year (FY)**: Annual budget period (e.g., 2024/2025)

**Ward**: Smallest geographic administrative division

**Sub-county**: Geographic administrative division above ward

**Department**: Organizational unit managing projects

**Privilege**: Permission to perform specific action

**Role**: Collection of privileges assigned to user type

**Public Approval**: Process of making content visible on public dashboard

**Moderation**: Process of reviewing and approving content

### 10.3 Quick Reference

#### Common URLs

**Production:**
- Admin Dashboard: `http://165.22.227.234:8080/impes/`
- Public Dashboard: `http://165.22.227.234:5174/`
- API: `http://165.22.227.234:3000/api`

**Development:**
- Admin Dashboard: `http://localhost:5173/impes/`
- Public Dashboard: `http://localhost:5174/`
- API: `http://localhost:3000/api`

#### Test User Credentials

For testing and training purposes:

- **Username**: `akwatuha`
- **Password**: `reset123`
- **Note**: This is a test account. Change default passwords in production environments.

> ⚠️ **Security Reminder**: Never use test credentials in production. Always change default passwords and use strong, unique passwords for all user accounts.

#### Common Tasks Quick Links

- **Create Project**: Management → Project Management → Create New Project
- **View Projects**: Reporting → Projects
- **Manage Users**: Admin → User Management
- **Respond to Feedback**: Public → Citizen Feedback
- **Approve Public Content**: Public → Public Approval
- **View Dashboard**: Dashboard (sidebar menu)

### 10.4 Contact Information

#### System Support

For technical support or questions:
1. Review this user manual
2. Check troubleshooting section (Section 8)
3. Contact your system administrator
4. Review system documentation files

#### System Information

- **System Name**: ECIMES v5.0
- **System Location**: `/home/dev/dev/imes_working/v5/imes`
- **Version**: 5.0
- **Last Updated**: 2025

### 10.5 Additional Resources

#### Documentation Files

The following documentation files are available in the project:

- `ECIMES_SYSTEM_DOCUMENTATION.md`: Comprehensive technical documentation
- `QUICK_START.md`: Quick start guide
- `DEPLOYMENT_GUIDE.md`: Deployment instructions
- `USER_ACCESS_CONTROL_GUIDE.md`: Access control configuration
- `FEEDBACK_RATING_COMPLETE_GUIDE.md`: Feedback system details
- `CHAT_SYSTEM_READY.md`: Chat system documentation

#### External Resources

- Material-UI Documentation: https://mui.com/
- React Documentation: https://react.dev/
- MySQL Documentation: https://dev.mysql.com/doc/

### 10.6 Screenshot Index

This manual references screenshots throughout. Below is a complete index of all screenshots mentioned:

#### Getting Started Screenshots
- **2.1**: Login Page (`screenshots/02-getting-started/01-login-page.png`)
- **2.2**: User Profile Menu (`screenshots/02-getting-started/02-profile-menu.png`)

#### System Overview Screenshots
- **3.1**: System Architecture Overview (`screenshots/03-system-overview/01-system-architecture.png`)

#### Admin Dashboard Screenshots
- **5.1**: Admin Dashboard Overview (`screenshots/05-admin-dashboard/01-dashboard-overview.png`)
- **5.2**: Navigation Sidebar (`screenshots/05-admin-dashboard/02-navigation-sidebar.png`)
- **5.3**: Project Management Page (`screenshots/05-admin-dashboard/03-project-management-page.png`)
- **5.4**: Create Project Form (`screenshots/05-admin-dashboard/04-create-project-form.png`)
- **5.5**: Project Details Page (`screenshots/05-admin-dashboard/05-project-details.png`)
- **5.6**: Photo Gallery (`screenshots/05-admin-dashboard/06-photo-gallery.png`)
- **5.7**: User Management Page (`screenshots/05-admin-dashboard/07-user-management.png`)
- **5.8**: Feedback Management Page (`screenshots/05-admin-dashboard/08-feedback-management.png`)
- **5.9**: Feedback Response Form (`screenshots/05-admin-dashboard/09-feedback-response.png`)
- **5.10**: Chat System (`screenshots/05-admin-dashboard/10-chat-system.png`)

#### Public Dashboard Screenshots
- **6.1**: Public Dashboard Homepage (`screenshots/06-public-dashboard/01-homepage.png`)
- **6.2**: Public Dashboard Statistics (`screenshots/06-public-dashboard/02-statistics-cards.png`)
- **6.3**: Public Dashboard Analytics (`screenshots/06-public-dashboard/03-analytics-dashboard.png`)
- **6.4**: Project Gallery (`screenshots/06-public-dashboard/04-project-gallery.png`)
- **6.5**: Feedback Submission Form (`screenshots/06-public-dashboard/05-feedback-form.png`)
- **6.6**: Feedback List with Responses (`screenshots/06-public-dashboard/06-feedback-list.png`)

> 📝 **Note**: Screenshots should be captured from the actual system and placed in the corresponding directories. Each screenshot should be:
> - High resolution (minimum 1920x1080 or equivalent)
> - Clear and well-lit
> - Annotated if necessary to highlight important elements
> - Saved in PNG format for best quality

### 10.7 Detailed Screenshot Descriptions

For content creators capturing screenshots, here are detailed descriptions of what each screenshot should show:

#### Getting Started Screenshots

**Screenshot 2.1 - Login Page**
- Full browser window showing the login page
- E-CIMES logo prominently displayed at top
- "Electronic County Integrated Monitoring & Evaluation System" subtitle
- Username/Email input field (empty)
- Password input field (empty)
- "Login" button
- Blue gradient background
- Optional: Show URL in address bar

**Screenshot 2.2 - User Profile Menu**
- Top-right corner of admin dashboard
- User profile icon/avatar visible
- Dropdown menu open showing:
  - User name (e.g., "akwatuha")
  - User role
  - "Logout" option
- Highlight the logout option

#### System Overview Screenshots

**Screenshot 3.1 - System Architecture Overview**
- Diagram showing:
  - Admin Dashboard box (left)
  - Public Dashboard box (right)
  - Both connecting to API/Backend (center)
  - Database at bottom
- Use arrows to show data flow
- Label each component clearly

#### Admin Dashboard Screenshots

**Screenshot 5.1 - Admin Dashboard Overview**
- Full dashboard view
- Statistics cards at top (Total Projects, Active Projects, etc.)
- Charts/graphs in middle section
- Sidebar navigation visible (left)
- Project status indicators
- Recent activity section (if available)

**Screenshot 5.2 - Navigation Sidebar**
- Left sidebar fully expanded
- All menu categories visible:
  - Dashboard section
  - Reporting section
  - Management section
  - Public section
  - Admin section
- Icons and labels clearly visible
- Highlight active menu item

**Screenshot 5.3 - Project Management Page**
- Projects list/table view
- "Create New Project" button visible (top-right or top-left)
- Table columns: Project Name, Department, Status, Budget, etc.
- Filter/search bar visible
- Pagination controls (if applicable)
- At least 3-5 sample projects in the list

**Screenshot 5.4 - Create Project Form**
- Full project creation form
- All input fields visible:
  - Project Name field
  - Department dropdown
  - Financial Year dropdown
  - Location selectors (County, Sub-county, Ward)
  - Budget field
  - Date pickers
  - Status dropdown
- "Save" or "Create" button visible
- Form validation indicators (if any)

**Screenshot 5.5 - Project Details Page**
- Complete project details view
- Tabs visible: Overview, Financial, Tasks, Photos, Documents, Feedback
- Project information displayed:
  - Project name (header)
  - Basic details (description, location, dates)
  - Status badge
  - Progress percentage
- "Edit" button visible
- At least one tab content visible

**Screenshot 5.6 - Photo Gallery**
- Photos tab of project details
- Grid of photo thumbnails (at least 3-4 photos)
- "Upload Photo" button visible
- Photo descriptions/captions visible
- Click on one photo to show lightbox view (optional second screenshot)

**Screenshot 5.7 - User Management Page**
- User list/table view
- "Create User" button visible
- Table columns: Name, Username, Email, Role, Status
- At least 3-5 sample users in list
- Filter/search options visible
- Action buttons (Edit, Activate/Deactivate) visible

**Screenshot 5.8 - Feedback Management Page**
- Feedback list view
- Filter options: Status, Project, Date range
- Feedback items showing:
  - Project name
  - Citizen message (truncated)
  - Status badge (Pending/Reviewed/Responded)
  - Date submitted
- "Approve/Reject" buttons visible
- "Respond" button visible for pending items

**Screenshot 5.9 - Feedback Response Form**
- Feedback details view
- Citizen's original message displayed
- Response text area (empty or with draft)
- "Submit Response" button
- Status indicator
- Project information visible

**Screenshot 5.10 - Chat System**
- Chat panel/sidebar open
- Chat room list visible
- Message area showing:
  - Previous messages (at least 2-3)
  - Message input box
  - Send button
  - File upload icon
- Typing indicator (if applicable)
- Online status indicators

#### Public Dashboard Screenshots

**Screenshot 6.1 - Public Dashboard Homepage**
- Full homepage view
- Navigation menu (top or side)
- Statistics cards:
  - Total Projects card
  - Total Budget card
  - Projects by Status cards
- "View Projects" or similar call-to-action button
- Clean, public-facing design

**Screenshot 6.2 - Public Dashboard Statistics**
- Close-up of statistics cards section
- 4-6 statistic cards visible
- Each card showing:
  - Icon
  - Number/metric
  - Label
  - Color coding
- Cards arranged in grid layout

**Screenshot 6.3 - Public Dashboard Analytics**
- Analytics dashboard page
- Financial Year dropdown selector
- Department breakdown table (with data)
- Sub-county distribution chart/graph
- Ward-level statistics
- Interactive elements visible
- Charts clearly labeled

**Screenshot 6.4 - Project Gallery**
- Grid of project cards (at least 6-9 cards visible)
- Each card showing:
  - Project photo (thumbnail)
  - Project name
  - Location (Ward/Sub-county)
  - Status badge
  - Budget amount
- Filter options visible (Department, Status, Financial Year, Search)
- Pagination (if applicable)

**Screenshot 6.5 - Feedback Submission Form**
- Feedback form modal or page
- Project selector dropdown (with project selected)
- Message text area (empty)
- Rating stars (5 categories, all empty)
- Optional fields:
  - Name field (empty)
  - Email/Phone field (empty)
- "Submit Feedback" button
- "Submit Anonymously" option visible

**Screenshot 6.6 - Feedback List with Responses**
- Feedback page/list view
- Multiple feedback items visible (at least 3-4)
- Each item showing:
  - Project name
  - Citizen message
  - Status badge
  - Date
  - County response (for responded items)
- Expandable/collapsible items
- "Responded" items clearly marked

---

## Document Information

**Document Title**: ECIMES User Manual  
**Version**: 1.0  
**Last Updated**: 2025  
**Intended Audience**: All ECIMES users (Administrators, Project Managers, Staff, Contractors, Citizens)  
**Document Status**: Current

---

**End of User Manual**

For questions or updates to this manual, please contact your system administrator.

