# Missing Tables List

## Summary
- **Total MySQL tables**: 117
- **Total PostgreSQL tables**: 67
- **Missing tables**: 50

## Critical for Login/Auth (PRIORITY 1) ✅
- ✅ **users** - EXISTS
- ✅ **roles** - EXISTS  
- ✅ **privileges** - EXISTS
- ✅ **role_privileges** - EXISTS
- ⚠️ **contractor_users** - MISSING (needed for contractor login)

**Status**: Login endpoint is working! Returns "Invalid credentials" which means queries succeed.

## Core Project Management (PRIORITY 2)
- ⚠️ **projects** - MISSING (we created a simplified version, but full structure needed)
- ⚠️ **departments** - MISSING (needed for project filtering)
- ⚠️ **sections** - MISSING (needed for project filtering)
- ✅ **categories** - EXISTS
- ⚠️ **financialyears** - MISSING (needed for project filtering)
- ⚠️ **programs** - MISSING
- ⚠️ **subprograms** - MISSING

## Project Details & Management (PRIORITY 3)
- **project_announcements**
- **project_assignments**
- **project_climate_risk**
- **project_concept_notes**
- **project_contractor_assignments**
- **project_counties**
- **project_documents**
- **project_esohsg_screening**
- **project_financials**
- **project_fy_breakdown**
- **project_hazard_assessment**
- **project_implementation_plan**
- **project_m_and_e**
- **project_maps**
- **project_milestone_implementations**
- **project_milestones**
- **project_monitoring_records**
- **project_needs_assessment**
- **project_payment_requests**
- **project_photos**
- **project_readiness**
- **project_risks**
- **project_roles**
- **project_staff_assignments**
- **project_stages**
- **project_stakeholders**
- **project_subcounties**
- **project_sustainability**
- **project_wards**
- **project_workflows**
- **project_workflow_steps**

## Budget Management (PRIORITY 4)
- ✅ **budgets** - EXISTS
- ✅ **budget_items** - EXISTS
- ✅ **budget_changes** - EXISTS
- ⚠️ **budget_combinations** - MISSING

## Location/Geography (PRIORITY 5)
- **counties**
- **subcounties**
- **wards**

## Employee/HR Management (PRIORITY 6 - likely not needed)
- **employee_bank_details**
- **employee_benefits**
- **employee_compensation**
- **employee_contracts**
- **employee_dependants**
- **employee_disciplinary**
- **employee_leave_entitlements**
- **employee_loans**
- **employee_memberships**
- **employee_performance**
- **employee_project_assignments**
- **employee_promotions**
- **employee_retirements**
- **employee_terminations**
- **employee_training**
- **staff**
- **job_groups**
- **leave_applications**
- **leave_types**
- **monthly_payroll**
- **public_holidays**

## Other Features (PRIORITY 7)
- **activities**
- **annual_workplans**
- **approved_public_feedback**
- **assigned_assets**
- **attachments**
- **attachmenttypes**
- **attendance**
- **chat_message_reactions**
- **chat_messages**
- **chat_room_participants**
- **chat_rooms**
- **citizen_proposals**
- **component_data_access_rules**
- **contractors**
- **county_proposed_project_milestones**
- **county_proposed_projects**
- **dashboard_components**
- **dashboard_permissions**
- **dashboard_tabs**
- **feedback_moderation**
- **feedback_moderation_settings**
- **inspection_teams**
- **milestone_activities**
- **milestone_attachments**
- **moderation_queue**
- **participants**
- **payment_approval_history**
- **payment_approval_levels**
- **payment_details**
- **payment_request_approvals**
- **payment_request_documents**
- **payment_request_milestones**
- **payment_status_definitions**
- **planningdocuments**
- **projectfeedback**
- **public_feedback**
- **role_dashboard_config**
- **role_dashboard_permissions**
- **strategicplans**
- **studyparticipants**
- **user_dashboard_preferences**
- **user_data_filters**
- **user_department_assignments**
- **user_project_assignments**
- **user_ward_assignments**

## Next Steps
1. ✅ Login is working - test with actual user credentials
2. Navigate to http://localhost:8081/impes/login to test the UI
3. Identify which features you need
4. Create tables for those features only
