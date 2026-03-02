const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const pool = require('../config/db'); // Import the database connection pool
const multer = require('multer');
const xlsx = require('xlsx');
const { addStatusFilter } = require('../utils/statusFilterHelper');

// --- Consolidated Imports for All Sub-Routers ---
const appointmentScheduleRoutes = require('./appointmentScheduleRoutes');
const projectAttachmentRoutes = require('./projectAttachmentRoutes');
const projectCertificateRoutes = require('./projectCertificateRoutes');
const projectFeedbackRoutes = require('./projectFeedbackRoutes');
const projectMapRoutes = require('./projectMapRoutes');
const projectMonitoringRoutes = require('./projectMonitoringRoutes');
const projectObservationRoutes = require('./projectObservationRoutes');
const projectPaymentRoutes = require('./projectPaymentRoutes');
const projectSchedulingRoutes = require('./projectSchedulingRoutes');
const projectCategoryRoutes = require('./metadata/projectCategoryRoutes');
const projectWarningRoutes = require('./projectWarningRoutes');
const projectProposalRatingRoutes = require('./projectProposalRatingRoutes');
const { projectRouter: projectPhotoRouter, photoRouter } = require('./projectPhotoRoutes'); 
const projectAssignmentRoutes = require('./projectAssignmentRoutes');


// Base SQL query for project details with all left joins
const BASE_PROJECT_SELECT_JOINS = `
    SELECT
        p.id,
        p.projectName,
        p.projectDescription,
        p.directorate,
        p.startDate,
        p.endDate,
        p.costOfProject,
        p.paidOut,
        p.objective,
        p.expectedOutput,
        p.expectedOutcome,
        p.status,
        p.statusReason,
        p.ProjectRefNum,
        p.Contracted,
        p.createdAt,
        p.updatedAt,
        p.voided,
        NULL AS piFirstName,
        NULL AS piLastName,
        NULL AS piEmail,
        p.departmentId,
        cd.name AS departmentName,
        cd.alias AS departmentAlias,
        p.sectionId,
        ds.name AS sectionName,
        p.finYearId,
        fy.finYearName AS financialYearName,
        p.programId,
        pr.programme AS programName,
        p.subProgramId,
        spr.subProgramme AS subProgramName,
        p.categoryId,
        projCat.categoryName,
        p.userId AS creatorUserId,
        u.firstName AS creatorFirstName,
        u.lastName AS creatorLastName,
        p.approved_for_public,
        p.approved_by,
        p.approved_at,
        p.approval_notes,
        p.revision_requested,
        p.revision_notes,
        p.revision_requested_by,
        p.revision_requested_at,
        p.revision_submitted_at,
        p.overallProgress,
        GROUP_CONCAT(DISTINCT c.name ORDER BY c.name SEPARATOR ', ') AS countyNames,
        GROUP_CONCAT(DISTINCT sc.name ORDER BY sc.name SEPARATOR ', ') AS subcountyNames,
        GROUP_CONCAT(DISTINCT w.name ORDER BY w.name SEPARATOR ', ') AS wardNames
    FROM
        kemri_projects p
    LEFT JOIN
        kemri_departments cd ON p.departmentId = cd.departmentId AND (cd.voided IS NULL OR cd.voided = 0)
    LEFT JOIN
        kemri_sections ds ON p.sectionId = ds.sectionId AND (ds.voided IS NULL OR ds.voided = 0)
    LEFT JOIN
        kemri_financialyears fy ON p.finYearId = fy.finYearId AND (fy.voided IS NULL OR fy.voided = 0)
    LEFT JOIN
        kemri_programs pr ON p.programId = pr.programId
    LEFT JOIN
        kemri_subprograms spr ON p.subProgramId = spr.subProgramId
    LEFT JOIN
        kemri_project_counties pc ON p.id = pc.projectId AND (pc.voided IS NULL OR pc.voided = 0)
    LEFT JOIN
        kemri_counties c ON pc.countyId = c.countyId
    LEFT JOIN
        kemri_project_subcounties psc ON p.id = psc.projectId AND (psc.voided IS NULL OR psc.voided = 0)
    LEFT JOIN
        kemri_subcounties sc ON psc.subcountyId = sc.subcountyId AND (sc.voided IS NULL OR sc.voided = 0)
    LEFT JOIN
        kemri_project_wards pw ON p.id = pw.projectId AND (pw.voided IS NULL OR pw.voided = 0)
    LEFT JOIN
        kemri_wards w ON pw.wardId = w.wardId AND (w.voided IS NULL OR w.voided = 0)
    LEFT JOIN
        kemri_project_milestone_implementations projCat ON p.categoryId = projCat.categoryId
    LEFT JOIN
        kemri_users u ON p.userId = u.userId
`;

// Corrected full query for fetching a single project by ID
// For PostgreSQL, use the new JSONB structure; for MySQL, use the old structure
const GET_SINGLE_PROJECT_QUERY = (DB_TYPE) => {
    if (DB_TYPE === 'postgresql') {
        // Use the same query structure as GET /api/projects/ but with WHERE clause
        return `
            SELECT
                p.project_id AS id,
                p.name AS "projectName",
                p.description AS "projectDescription",
                p.implementing_agency AS "directorate",
                (p.timeline->>'start_date')::date AS "startDate",
                (p.timeline->>'expected_completion_date')::date AS "endDate",
                (p.budget->>'allocated_amount_kes')::numeric AS "costOfProject",
                (p.budget->>'disbursed_amount_kes')::numeric AS "paidOut",
                p.budget->>'source' AS "budgetSource",
                p.notes->>'objective' AS "objective",
                p.notes->>'expected_output' AS "expectedOutput",
                NULL AS "principalInvestigator",
                p.notes->>'expected_outcome' AS "expectedOutcome",
                p.progress->>'status' AS "status",
                p.progress->>'status_reason' AS "statusReason",
                p.progress->>'latest_update_summary' AS "progressSummary",
                p.data_sources->>'project_ref_num' AS "ProjectRefNum",
                p.data_sources AS "dataSources",
                (p.budget->>'contracted')::boolean AS "Contracted",
                (p.location->>'geocoordinates')::jsonb AS "geocoordinates",
                (p.location->'geocoordinates'->>'lat') AS "latitude",
                (p.location->'geocoordinates'->>'lng') AS "longitude",
                (p.public_engagement->>'feedback_enabled')::boolean AS "feedbackEnabled",
                p.public_engagement->>'common_feedback' AS "commonFeedback",
                (p.public_engagement->>'complaints_received')::integer AS "complaintsReceived",
                p.created_at AS "createdAt",
                p.updated_at AS "updatedAt",
                p.voided,
                NULL AS "principalInvestigatorStaffId",
                NULL AS "piFirstName",
                NULL AS "piLastName",
                NULL AS "piEmail",
                NULL AS "departmentId",
                p.ministry AS "ministry",
                p.ministry AS "departmentName",
                NULL AS "departmentAlias",
                NULL AS "sectionId",
                p.state_department AS "stateDepartment",
                p.state_department AS "sectionName",
                NULL AS "finYearId",
                NULL AS "financialYearName",
                (p.notes->>'program_id')::integer AS "programId",
                pr.programme AS "programName",
                (p.notes->>'subprogram_id')::integer AS "subProgramId",
                spr."subProgramme" AS "subProgramName",
                p.category_id AS "categoryId",
                p.sector AS "sector",
                cat."categoryName" AS "categoryName",
                (p.data_sources->>'created_by_user_id')::integer AS "userId",
                NULL AS "creatorFirstName",
                NULL AS "creatorLastName",
                (p.public_engagement->>'approved_for_public')::boolean AS "approved_for_public",
                (p.public_engagement->>'approved_by')::integer AS "approved_by",
                (p.public_engagement->>'approved_at')::timestamp AS "approved_at",
                p.public_engagement->>'approval_notes' AS "approval_notes",
                (p.public_engagement->>'revision_requested')::boolean AS "revision_requested",
                p.public_engagement->>'revision_notes' AS "revision_notes",
                (p.public_engagement->>'revision_requested_by')::integer AS "revision_requested_by",
                (p.public_engagement->>'revision_requested_at')::timestamp AS "revision_requested_at",
                (p.public_engagement->>'revision_submitted_at')::timestamp AS "revision_submitted_at",
                (p.progress->>'percentage_complete')::numeric AS "overallProgress",
                (p.budget->>'budget_id')::integer AS "budgetId",
                NULL AS "countyNames",
                NULL AS "subcountyNames",
                NULL AS "wardNames"
            FROM projects p
            LEFT JOIN programs pr ON (p.notes->>'program_id')::integer = pr."programId" AND (pr.voided IS NULL OR pr.voided = false)
            LEFT JOIN subprograms spr ON (p.notes->>'subprogram_id')::integer = spr."subProgramId" AND (spr.voided IS NULL OR spr.voided = false)
            LEFT JOIN categories cat ON p.category_id = cat."categoryId" AND (cat.voided IS NULL OR cat.voided = false)
            WHERE p.project_id = $1 AND (p.voided IS NULL OR p.voided = false)
        `;
    } else {
        return `
            ${BASE_PROJECT_SELECT_JOINS}
            WHERE p.id = ? AND (p.voided IS NULL OR p.voided = 0)
            GROUP BY p.id;
        `;
    }
};

// --- Validation Middleware ---
const validateProject = (req, res, next) => {
    const { projectName, name } = req.body;
    // Accept either projectName (frontend) or name (API)
    const projectNameValue = projectName || name;
    if (!projectNameValue || !projectNameValue.trim()) {
        return res.status(400).json({ message: 'Missing required field: projectName or name' });
    }
    // Normalize to projectName for consistency
    if (name && !projectName) {
        req.body.projectName = name;
    }
    next();
};

// Utility function to check if project exists
const checkProjectExists = async (projectId) => {
    const DB_TYPE = process.env.DB_TYPE || 'mysql';
    const tableName = DB_TYPE === 'postgresql' ? 'projects' : 'kemri_projects';
    const idColumn = DB_TYPE === 'postgresql' ? 'project_id' : 'id';
    // Only exclude projects where voided = 1/true, include null and false
    const voidedCondition = DB_TYPE === 'postgresql' 
        ? '(voided IS NULL OR voided = false)' 
        : '(voided IS NULL OR voided = 0)';
    const query = `SELECT ${idColumn} FROM ${tableName} WHERE ${idColumn} = ? AND ${voidedCondition}`;
    const result = await pool.execute(query, [projectId]);
    const rows = DB_TYPE === 'postgresql' ? (result.rows || result) : (Array.isArray(result) ? result[0] : result);
    return Array.isArray(rows) ? rows.length > 0 : (rows && rows.length > 0);
};

// Helper function to extract all coordinates from a GeoJSON geometry object
const extractCoordinates = (geometry) => {
    if (!geometry) return [];
    if (geometry.type === 'Point') return [geometry.coordinates];
    if (geometry.type === 'LineString' || geometry.type === 'MultiPoint') return geometry.coordinates;
    if (geometry.type === 'Polygon') return geometry.coordinates[0];
    if (geometry.type === 'MultiPolygon') return geometry.coordinates.flat(Infinity);
    return [];
};


// --- CRUD Operations for Projects (kemri_projects) ---

// Define junction table routers
const projectCountiesRouter = express.Router({ mergeParams: true });
const projectSubcountiesRouter = express.Router({ mergeParams: true });
const projectWardsRouter = express.Router({ mergeParams: true });

// Mount other route files
router.use('/appointmentschedules', appointmentScheduleRoutes);
router.use('/project_attachments', projectAttachmentRoutes);
router.use('/project_certificates', projectCertificateRoutes);
router.use('/project_feedback', projectFeedbackRoutes);
router.use('/project_maps', projectMapRoutes);
router.use('/project_observations', projectObservationRoutes);
router.use('/project_payments', projectPaymentRoutes);
router.use('/projectscheduling', projectSchedulingRoutes);
router.use('/projectcategories', projectCategoryRoutes);
router.use('/:projectId/monitoring', projectMonitoringRoutes);


// Mount junction table routers
router.use('/:projectId/counties', projectCountiesRouter);
router.use('/:projectId/subcounties', projectSubcountiesRouter);
router.use('/:projectId/wards', projectWardsRouter);
router.use('/:projectId/photos', projectPhotoRouter);

// --- Project Import Endpoints (MUST come before parameterized routes) ---
// Multer storage for temp uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// Header normalization and mapping for Projects
const normalizeHeader = (header) => String(header || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

const projectHeaderMap = {
    // Canonical -> Variants (normalized)
    projectName: ['projectname', 'name', 'title', 'project', 'project_name', 'project name'],
    ProjectDescription: ['projectdescription', 'description', 'details', 'projectdesc'],
    ProjectRefNum: ['projectrefnum', 'projectrefnumber', 'ref', 'refnum', 'refnumber', 'reference', 'projectreference', 'projectref', 'project ref num', 'project ref number'],
    Status: ['status', 'projectstatus', 'currentstatus'],
    budget: ['budget', 'estimatedcost', 'budgetkes', 'projectcost', 'costofproject'],
    amountPaid: ['amountpaid', 'disbursed', 'expenditure', 'paidout', 'amount paid'],
    financialYear: ['financialyear', 'financial-year', 'financial year', 'fy', 'adp', 'year'],
    department: ['department', 'implementingdepartment'],
    directorate: ['directorate'],
    sector: ['sector'],
    agency: ['agency', 'implementingagency', 'implementing_agency', 'implementing agency'],
    'sub-county': ['subcounty', 'subcountyname', 'subcountyid', 'sub-county', 'subcounty_', 'sub county'],
    ward: ['ward', 'wardname', 'wardid'],
    Contracted: ['contracted', 'contractamount', 'contractedamount', 'contractsum', 'contract value', 'contract value (kes)'],
    StartDate: ['startdate', 'projectstartdate', 'commencementdate', 'start', 'start date'],
    EndDate: ['enddate', 'projectenddate', 'completiondate', 'end', 'end date']
};

// Reverse lookup: normalized variant -> canonical
const variantToCanonical = (() => {
    const map = {};
    Object.entries(projectHeaderMap).forEach(([canonical, variants]) => {
        variants.forEach(v => { map[v] = canonical; });
    });
    return map;
})();

// Helper function to validate and fix invalid dates
// Returns: { year, month, day, corrected, originalDay }
const validateAndFixDate = (year, month, day) => {
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    
    // Check for leap year (February can have 29 days)
    if (month === 2 && ((year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0))) {
        daysInMonth[1] = 29;
    }
    
    const maxDays = daysInMonth[month - 1];
    const originalDay = day;
    if (day > maxDays) {
        // Fix invalid dates: e.g., June 31 -> June 30, February 30 -> February 28/29
        const fixedDay = maxDays;
        console.warn(`Fixed invalid date: ${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} -> ${year}-${String(month).padStart(2, '0')}-${String(fixedDay).padStart(2, '0')}`);
        return { year, month, day: fixedDay, corrected: true, originalDay };
    }
    
    return { year, month, day, corrected: false, originalDay };
};

// Enhanced parseDateToYMD that tracks corrections
// Returns: { date: string, corrected: boolean, originalValue: string, correctionMessage: string } or null
const parseDateToYMD = (value, trackCorrections = false) => {
    if (!value) return trackCorrections ? null : null;
    const originalValue = String(value);
    
    if (value instanceof Date && !isNaN(value.getTime())) {
        const yyyy = value.getFullYear();
        const mm = value.getMonth() + 1;
        const dd = value.getDate();
        const fixed = validateAndFixDate(yyyy, mm, dd);
        const dateStr = `${fixed.year}-${String(fixed.month).padStart(2, '0')}-${String(fixed.day).padStart(2, '0')}`;
        
        if (trackCorrections && fixed.corrected) {
            return {
                date: dateStr,
                corrected: true,
                originalValue: originalValue,
                correctionMessage: `Date corrected from ${yyyy}-${String(mm).padStart(2, '0')}-${String(fixed.originalDay).padStart(2, '0')} to ${dateStr} (invalid day for month)`
            };
        }
        return trackCorrections ? { date: dateStr, corrected: false, originalValue: originalValue } : dateStr;
    }
    if (typeof value !== 'string') return trackCorrections ? value : value;
    const s = value.trim();
    
    // Fix common typos in month names (e.g., "0ct" -> "Oct", "0CT" -> "OCT")
    let normalized = s.replace(/\b0ct\b/gi, 'Oct').replace(/\b0ctober\b/gi, 'October');
    
    // Try to parse as text date (e.g., "6 Oct 2025", "6 October 2025", "Oct 6, 2025")
    const monthNames = {
        'jan': 1, 'january': 1, 'feb': 2, 'february': 2, 'mar': 3, 'march': 3,
        'apr': 4, 'april': 4, 'may': 5, 'jun': 6, 'june': 6,
        'jul': 7, 'july': 7, 'aug': 8, 'august': 8, 'sep': 9, 'september': 9,
        'oct': 10, 'october': 10, 'nov': 11, 'november': 11, 'dec': 12, 'december': 12
    };
    
    // Pattern: DD Month YYYY or Month DD, YYYY or DD-Month-YYYY
    let m = normalized.match(/\b(\d{1,2})\s+([a-z]+)\s+(\d{4})\b/i);
    if (m) {
        const day = parseInt(m[1], 10);
        const monthName = m[2].toLowerCase();
        const year = parseInt(m[3], 10);
        if (monthNames[monthName] && day >= 1 && day <= 31 && year >= 1900 && year <= 2100) {
            const month = monthNames[monthName];
            const fixed = validateAndFixDate(year, month, day);
            const dateStr = `${fixed.year}-${String(fixed.month).padStart(2, '0')}-${String(fixed.day).padStart(2, '0')}`;
            if (trackCorrections && fixed.corrected) {
                return {
                    date: dateStr,
                    corrected: true,
                    originalValue: originalValue,
                    correctionMessage: `Date corrected from ${year}-${String(month).padStart(2, '0')}-${String(fixed.originalDay).padStart(2, '0')} to ${dateStr} (invalid day for month)`
                };
            }
            return trackCorrections ? { date: dateStr, corrected: false, originalValue: originalValue } : dateStr;
        }
    }
    
    // Pattern: Month DD, YYYY or Month DD YYYY
    m = normalized.match(/\b([a-z]+)\s+(\d{1,2}),?\s+(\d{4})\b/i);
    if (m) {
        const monthName = m[1].toLowerCase();
        const day = parseInt(m[2], 10);
        const year = parseInt(m[3], 10);
        if (monthNames[monthName] && day >= 1 && day <= 31 && year >= 1900 && year <= 2100) {
            const month = monthNames[monthName];
            const fixed = validateAndFixDate(year, month, day);
            const dateStr = `${fixed.year}-${String(fixed.month).padStart(2, '0')}-${String(fixed.day).padStart(2, '0')}`;
            if (trackCorrections && fixed.corrected) {
                return {
                    date: dateStr,
                    corrected: true,
                    originalValue: originalValue,
                    correctionMessage: `Date corrected from ${year}-${String(month).padStart(2, '0')}-${String(fixed.originalDay).padStart(2, '0')} to ${dateStr} (invalid day for month)`
                };
            }
            return trackCorrections ? { date: dateStr, corrected: false, originalValue: originalValue } : dateStr;
        }
    }
    
    // Replace multiple separators with a single dash for easier parsing
    const norm = normalized.replace(/[\.\/]/g, '-');
    // Try YYYY-MM-DD
    m = norm.match(/^\s*(\d{4})-(\d{1,2})-(\d{1,2})\s*$/);
    if (m) {
        const yyyy = parseInt(m[1], 10);
        const mm = parseInt(m[2], 10);
        const dd = parseInt(m[3], 10);
        if (yyyy >= 1900 && yyyy <= 2100 && mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31) {
            const fixed = validateAndFixDate(yyyy, mm, dd);
            const dateStr = `${fixed.year}-${String(fixed.month).padStart(2, '0')}-${String(fixed.day).padStart(2, '0')}`;
            if (trackCorrections && fixed.corrected) {
                return {
                    date: dateStr,
                    corrected: true,
                    originalValue: originalValue,
                    correctionMessage: `Date corrected from ${yyyy}-${String(mm).padStart(2, '0')}-${String(fixed.originalDay).padStart(2, '0')} to ${dateStr} (invalid day for month)`
                };
            }
            return trackCorrections ? { date: dateStr, corrected: false, originalValue: originalValue } : dateStr;
        }
    }
    // Try DD-MM-YYYY or MM-DD-YYYY (need to detect which format)
    // Common patterns: MM/DD/YYYY (US) or DD/MM/YYYY (European)
    // Since we see "06/31/2025", this is likely MM/DD/YYYY format
    m = norm.match(/^\s*(\d{1,2})-(\d{1,2})-(\d{4})\s*$/);
    if (m) {
        const first = parseInt(m[1], 10);
        const second = parseInt(m[2], 10);
        const yyyy = parseInt(m[3], 10);
        
        if (yyyy >= 1900 && yyyy <= 2100) {
            let mm, dd;
            // Heuristic: If first number > 12, it's likely DD-MM-YYYY format
            if (first > 12 && second <= 12) {
                // DD-MM-YYYY format
                dd = first;
                mm = second;
            } else if (first <= 12 && second <= 31) {
                // MM-DD-YYYY format (US format - more common in Excel)
                mm = first;
                dd = second;
            } else {
                // Try DD-MM-YYYY as fallback
                dd = first;
                mm = second;
            }
            
            if (mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31) {
                const fixed = validateAndFixDate(yyyy, mm, dd);
                const dateStr = `${fixed.year}-${String(fixed.month).padStart(2, '0')}-${String(fixed.day).padStart(2, '0')}`;
                if (trackCorrections && fixed.corrected) {
                    return {
                        date: dateStr,
                        corrected: true,
                        originalValue: originalValue,
                        correctionMessage: `Date corrected from ${yyyy}-${String(mm).padStart(2, '0')}-${String(fixed.originalDay).padStart(2, '0')} to ${dateStr} (invalid day for month)`
                    };
                }
                return trackCorrections ? { date: dateStr, corrected: false, originalValue: originalValue } : dateStr;
            }
        }
    }
    
    // If all parsing fails, return null instead of the original string to avoid database errors
    console.warn(`Could not parse date: "${s}"`);
    return trackCorrections ? null : null;
};

const mapRowUsingHeaderMap = (headers, row, trackCorrections = false) => {
    const obj = {};
    const corrections = [];
    
    for (let i = 0; i < headers.length; i++) {
        const rawHeader = headers[i];
        const normalized = normalizeHeader(rawHeader);
        const canonical = variantToCanonical[normalized] || rawHeader; // keep unknowns
        let value = row[i];
        
        // Normalize dates (Excel Date objects or strings) to YYYY-MM-DD
        if (canonical === 'StartDate' || canonical === 'EndDate' || /date/i.test(String(canonical))) {
            const dateResult = parseDateToYMD(value, trackCorrections);
            if (trackCorrections && dateResult && dateResult.corrected) {
                corrections.push({
                    field: canonical,
                    originalValue: dateResult.originalValue,
                    correctedValue: dateResult.date,
                    message: dateResult.correctionMessage
                });
                value = dateResult.date;
            } else if (trackCorrections && dateResult && dateResult.date) {
                value = dateResult.date;
            } else if (!trackCorrections) {
                value = dateResult;
            }
        }
        
        // Map amountPaid to Disbursed for display in preview
        if (canonical === 'amountPaid') {
            obj['Disbursed'] = value === '' ? null : value;
            // Also keep amountPaid for internal processing
            obj['amountPaid'] = value === '' ? null : value;
        } else {
            obj[canonical] = value === '' ? null : value;
        }
    }
    
    if (trackCorrections) {
        return { row: obj, corrections };
    }
    return obj;
};
/**
 * @route POST /api/projects/import-data
 * @description Preview project data from uploaded file
 */
router.post('/import-data', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }
    const filePath = req.file.path;
    try {
        const workbook = xlsx.readFile(filePath, { cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

        if (rawData.length < 2) {
            fs.unlink(filePath, () => {});
            return res.status(400).json({ success: false, message: 'Uploaded Excel file is empty or has no data rows.' });
        }

        const headers = rawData[0];
        // Filter out completely empty rows to avoid processing millions of empty rows
        const dataRows = rawData.slice(1).filter(row => {
            if (!row || !Array.isArray(row)) return false;
            // Check if row has any non-empty cells
            return row.some(cell => {
                return cell !== undefined && cell !== null && cell !== '';
            });
        });

        // Build unrecognized headers list
        const normalizedKnown = new Set(Object.keys(variantToCanonical));
        const unrecognizedHeaders = [];
        headers.forEach(h => {
            const norm = normalizeHeader(h);
            if (!normalizedKnown.has(norm) && !Object.prototype.hasOwnProperty.call(projectHeaderMap, h)) {
                // Allow canonical headers to pass even if not normalized in map
                const isCanonical = Object.keys(projectHeaderMap).includes(h);
                if (!isCanonical && !unrecognizedHeaders.includes(h)) {
                    unrecognizedHeaders.push(h);
                }
            }
        });

        // Track corrections during preview
        const allCorrections = [];
        const fullDataWithCorrections = dataRows.map(r => {
            const result = mapRowUsingHeaderMap(headers, r, true);
            if (result.corrections && result.corrections.length > 0) {
                allCorrections.push(...result.corrections.map(c => ({
                    ...c,
                    row: dataRows.indexOf(r) + 2 // Excel row number (1-indexed header + row index)
                })));
            }
            return result.row;
        }).filter(row => {
            // Skip rows where project name is empty, null, or has less than 3 characters
            const projectName = (row.projectName || row.Project_Name || row['Project Name'] || '').toString().trim();
            return projectName && projectName.length >= 3;
        });
        
        const fullData = fullDataWithCorrections;
        const previewLimit = 10;
        const previewData = fullData.slice(0, previewLimit);

        fs.unlink(filePath, () => {});
        return res.status(200).json({
            success: true,
            message: `File parsed successfully. Review ${previewData.length} of ${fullData.length} rows.${allCorrections.length > 0 ? ` ${allCorrections.length} data correction(s) applied.` : ''}`,
            previewData,
            headers,
            fullData,
            unrecognizedHeaders,
            corrections: allCorrections.length > 0 ? allCorrections : undefined
        });
    } catch (err) {
        fs.unlink(filePath, () => {});
        console.error('Project import preview error:', err);
        return res.status(500).json({ success: false, message: `File parsing failed: ${err.message}` });
    }
});

/**
 * @route POST /api/projects/check-metadata-mapping
 * @description Check metadata mappings for import data (DISABLED - metadata preview not required)
 */
router.post('/check-metadata-mapping', async (req, res) => {
    // Metadata preview disabled - return empty mapping summary
    const { dataToImport } = req.body || {};
    const totalRows = dataToImport && Array.isArray(dataToImport) ? dataToImport.length : 0;
    
    return res.status(200).json({
        success: true,
        message: 'Metadata preview is disabled. Import will proceed without metadata validation.',
        mappingSummary: {
            departments: { existing: [], new: [], unmatched: [] },
            directorates: { existing: [], new: [], unmatched: [] },
            wards: { existing: [], new: [], unmatched: [] },
            subcounties: { existing: [], new: [], unmatched: [] },
            financialYears: { existing: [], new: [], unmatched: [] },
            totalRows: totalRows,
            rowsWithUnmatchedMetadata: []
        }
    });
});

// Original implementation (disabled - kept for reference)
router.post('/check-metadata-mapping-old', async (req, res) => {
    const { dataToImport } = req.body || {};
    if (!dataToImport || !Array.isArray(dataToImport) || dataToImport.length === 0) {
        return res.status(400).json({ success: false, message: 'No data provided for metadata mapping check.' });
    }

    // Enhanced normalization: trim, normalize spaces/slashes, handle apostrophes, collapse multiple spaces
    const normalizeStr = (v) => {
        if (typeof v !== 'string') return v;
        let normalized = v.trim();
        // Remove apostrophes (handle different apostrophe characters: ', ', ', `, and Unicode variants)
        // Use a more comprehensive pattern to catch all apostrophe-like characters
        normalized = normalized.replace(/[''"`\u0027\u2018\u2019\u201A\u201B\u2032\u2035]/g, '');
        // Normalize slashes: remove spaces around existing slashes
        normalized = normalized.replace(/\s*\/\s*/g, '/');
        // Collapse multiple spaces to single space
        normalized = normalized.replace(/\s+/g, ' ');
        // Don't automatically convert spaces to slashes - this causes issues with names like "Kisumu Central"
        // The matching logic will handle both space and slash variations
        return normalized;
    };

    // Normalize alias for matching: remove &, commas, and spaces, then lowercase
    // This allows "WECV&NR", "WECVNR", "WE,CV,NR" to all match
    const normalizeAlias = (v) => {
        if (typeof v !== 'string') return v;
        return normalizeStr(v)
            .replace(/[&,]/g, '')  // Remove ampersands and commas
            .replace(/\s+/g, '')   // Remove all spaces
            .toLowerCase();         // Lowercase for case-insensitive matching
    };

    let connection;
    const mappingSummary = {
        departments: { existing: [], new: [], unmatched: [] },
        directorates: { existing: [], new: [], unmatched: [] },
        wards: { existing: [], new: [], unmatched: [] },
        subcounties: { existing: [], new: [], unmatched: [] },
        financialYears: { existing: [], new: [], unmatched: [] },
        totalRows: dataToImport.length,
        rowsWithUnmatchedMetadata: []
    };

    try {
        connection = await pool.getConnection();

        // Collect unique values from all rows
        const uniqueDepartments = new Set();
        const uniqueDirectorates = new Set();
        const uniqueWards = new Set();
        const uniqueSubcounties = new Set();
        const uniqueFinancialYears = new Set();

        dataToImport.forEach((row, index) => {
            // Skip rows where project name is empty, null, or has less than 3 characters
            const projectName = (row.projectName || row.Project_Name || row['Project Name'] || '').toString().trim();
            if (!projectName || projectName.length < 3) {
                return; // Skip this row
            }
            
            const dept = normalizeStr(row.department || row.Department);
            const directorate = normalizeStr(row.directorate || row.Directorate);
            const ward = normalizeStr(row.ward || row.Ward || row['Ward Name']);
            const subcounty = normalizeStr(row['sub-county'] || row.SubCounty || row['Sub County'] || row.Subcounty);
            const finYear = normalizeStr(row.financialYear || row.FinancialYear || row['Financial Year'] || row.ADP || row.Year);

            if (dept) uniqueDepartments.add(dept);
            if (directorate) uniqueDirectorates.add(directorate);
            if (ward) uniqueWards.add(ward);
            if (subcounty) uniqueSubcounties.add(subcounty);
            if (finYear) uniqueFinancialYears.add(finYear);
        });

        // Check departments (by name and alias)
        if (uniqueDepartments.size > 0) {
            const deptList = Array.from(uniqueDepartments);
            // Get all departments and check manually (to handle comma-separated aliases properly)
            const [allDepts] = await connection.query(
                `SELECT name, alias FROM kemri_departments 
                 WHERE (voided IS NULL OR voided = 0)`
            );
            const existingNames = new Set();
            const existingAliases = new Set();
            const aliasMap = new Map(); // Map alias -> name for tracking
            
            allDepts.forEach(d => {
                if (d.name) existingNames.add(normalizeStr(d.name).toLowerCase()); // Store lowercase for case-insensitive matching
                if (d.alias) {
                    // Store normalized alias (without &, commas, spaces) for flexible matching
                    const normalizedAlias = normalizeAlias(d.alias);
                    existingAliases.add(normalizedAlias);
                    aliasMap.set(normalizedAlias, d.name);
                    
                    // Also store split parts (for backwards compatibility)
                    const aliases = d.alias.split(',').map(a => normalizeStr(a).toLowerCase());
                    aliases.forEach(a => {
                        existingAliases.add(a);
                        aliasMap.set(a, d.name);
                    });
                    
                    // Also store full alias string (normalized)
                    const fullAlias = normalizeStr(d.alias).toLowerCase();
                    existingAliases.add(fullAlias);
                    aliasMap.set(fullAlias, d.name);
                }
            });
            
            deptList.forEach(dept => {
                const normalizedDept = normalizeStr(dept).toLowerCase(); // Case-insensitive matching
                const normalizedDeptAlias = normalizeAlias(dept); // Alias-style normalization (no &, commas, spaces)
                let found = false;
                
                // Check against existing names (case-insensitive) - direct Set lookup
                if (existingNames.has(normalizedDept)) {
                    mappingSummary.departments.existing.push(dept);
                    found = true;
                }
                
                // Check against aliases (case-insensitive) - try both normalizations
                if (!found && (existingAliases.has(normalizedDept) || existingAliases.has(normalizedDeptAlias))) {
                    mappingSummary.departments.existing.push(dept);
                    found = true;
                }
                
                if (!found) {
                    mappingSummary.departments.new.push(dept);
                }
            });
        }

        // Check directorates (sections) - by name and alias
        if (uniqueDirectorates.size > 0) {
            const dirList = Array.from(uniqueDirectorates);
            // Get all sections and check manually (to handle comma-separated aliases properly)
            const [allSections] = await connection.query(
                `SELECT name, alias FROM kemri_sections 
                 WHERE (voided IS NULL OR voided = 0)`
            );
            const existingNames = new Set();
            const existingAliases = new Set();
            
            allSections.forEach(d => {
                if (d.name) existingNames.add(normalizeStr(d.name).toLowerCase()); // Store lowercase for case-insensitive matching
                if (d.alias) {
                    // Store normalized alias (without &, commas, spaces) for flexible matching
                    const normalizedAlias = normalizeAlias(d.alias);
                    existingAliases.add(normalizedAlias);
                    
                    // Also store split parts (for backwards compatibility)
                    const aliases = d.alias.split(',').map(a => normalizeStr(a).toLowerCase());
                    aliases.forEach(a => existingAliases.add(a));
                    
                    // Also store full alias string (normalized)
                    const fullAlias = normalizeStr(d.alias).toLowerCase();
                    existingAliases.add(fullAlias);
                }
            });
            
            dirList.forEach(dir => {
                const normalizedDir = normalizeStr(dir).toLowerCase(); // Case-insensitive matching
                const normalizedDirAlias = normalizeAlias(dir); // Alias-style normalization (no &, commas, spaces)
                let found = false;
                
                // Check against existing names (case-insensitive) - direct Set lookup
                if (existingNames.has(normalizedDir)) {
                    mappingSummary.directorates.existing.push(dir);
                    found = true;
                }
                
                // Check against aliases (case-insensitive) - try both normalizations
                if (!found && (existingAliases.has(normalizedDir) || existingAliases.has(normalizedDirAlias))) {
                    mappingSummary.directorates.existing.push(dir);
                    found = true;
                }
                
                if (!found) {
                    mappingSummary.directorates.new.push(dir);
                }
            });
        }

        // Check wards (case-insensitive matching)
        if (uniqueWards.size > 0) {
            const wardList = Array.from(uniqueWards);
            // Get all wards and do case-insensitive matching
            const [allWards] = await connection.query(
                `SELECT name FROM kemri_wards WHERE (voided IS NULL OR voided = 0)`
            );
            // Create a case-insensitive map: lowercase name -> actual name
            // Store both the normalized version and variations (with/without slashes, word order variations)
            const wardNameMap = new Map();
            const wardWordSetMap = new Map(); // Map of sorted word sets -> actual name (for order-independent matching)
            
            allWards.forEach(w => {
                if (w.name) {
                    const normalized = normalizeStr(w.name).toLowerCase();
                    wardNameMap.set(normalized, w.name);
                    // Also store with space converted to slash and vice versa for flexible matching
                    const withSlash = normalized.replace(/\s+/g, '/');
                    if (withSlash !== normalized) {
                        wardNameMap.set(withSlash, w.name);
                    }
                    const withSpace = normalized.replace(/\//g, ' ');
                    if (withSpace !== normalized) {
                        wardNameMap.set(withSpace, w.name);
                    }
                    
                    // Create a word set for order-independent matching
                    const words = normalized.split(/[\s\/]+/).filter(w => w.length > 0).sort().join(' ');
                    if (words) {
                        wardWordSetMap.set(words, w.name);
                    }
                }
            });
            
            wardList.forEach(ward => {
                // Strip "Ward" suffix if present (case-insensitive)
                let wardName = normalizeStr(ward).toLowerCase();
                wardName = wardName.replace(/\s+ward\s*$/i, '').trim();
                
                let found = false;
                
                // Try exact match first
                if (wardNameMap.has(wardName)) {
                    mappingSummary.wards.existing.push(ward);
                    found = true;
                } else {
                    // Try with space converted to slash (for compound names like "Masogo Nyangoma" -> "Masogo/Nyangoma")
                    const withSlash = wardName.replace(/\s+/g, '/');
                    if (wardNameMap.has(withSlash)) {
                        mappingSummary.wards.existing.push(ward);
                        found = true;
                    } else {
                        // Try with slash converted to space (for cases like "KISUMU/CENTRAL" -> "KISUMU CENTRAL")
                        const withSpace = wardName.replace(/\//g, ' ');
                        if (wardNameMap.has(withSpace)) {
                            mappingSummary.wards.existing.push(ward);
                            found = true;
                        } else {
                            // Try order-independent matching (e.g., "Nyangoma Masogo" matches "Masogo/Nyangoma")
                            const words = wardName.split(/[\s\/]+/).filter(w => w.length > 0).sort().join(' ');
                            if (words && wardWordSetMap.has(words)) {
                                mappingSummary.wards.existing.push(ward);
                                found = true;
                            }
                        }
                    }
                }
                
                if (!found) {
                    mappingSummary.wards.new.push(ward);
                }
            });
        }

        // Check subcounties (case-insensitive matching)
        if (uniqueSubcounties.size > 0) {
            const subcountyList = Array.from(uniqueSubcounties);
            // Get all subcounties and do case-insensitive matching
            const [allSubcounties] = await connection.query(
                `SELECT name FROM kemri_subcounties WHERE (voided IS NULL OR voided = 0)`
            );
            // Create a case-insensitive map: lowercase name -> actual name
            // Store both the normalized version and variations (with/without slashes, word order variations)
            const subcountyNameMap = new Map();
            const subcountyWordSetMap = new Map(); // Map of sorted word sets -> actual name (for order-independent matching)
            
            allSubcounties.forEach(s => {
                if (s.name) {
                    const normalized = normalizeStr(s.name).toLowerCase();
                    subcountyNameMap.set(normalized, s.name);
                    // Also store with space converted to slash and vice versa for flexible matching
                    const withSlash = normalized.replace(/\s+/g, '/');
                    if (withSlash !== normalized) {
                        subcountyNameMap.set(withSlash, s.name);
                    }
                    const withSpace = normalized.replace(/\//g, ' ');
                    if (withSpace !== normalized) {
                        subcountyNameMap.set(withSpace, s.name);
                    }
                    
                    // Create a word set for order-independent matching
                    const words = normalized.split(/[\s\/]+/).filter(w => w.length > 0).sort().join(' ');
                    if (words) {
                        subcountyWordSetMap.set(words, s.name);
                    }
                }
            });
            
            subcountyList.forEach(subcounty => {
                // Strip "SC" or "Subcounty" or "Sub County" suffix if present (case-insensitive)
                let subcountyName = normalizeStr(subcounty).toLowerCase();
                subcountyName = subcountyName.replace(/\s+sc\s*$/i, '').trim();
                subcountyName = subcountyName.replace(/\s+subcounty\s*$/i, '').trim();
                subcountyName = subcountyName.replace(/\s+sub\s+county\s*$/i, '').trim();
                
                let found = false;
                
                // Try exact match first
                if (subcountyNameMap.has(subcountyName)) {
                    mappingSummary.subcounties.existing.push(subcounty);
                    found = true;
                } else {
                    // Try with space converted to slash (for compound names)
                    const withSlash = subcountyName.replace(/\s+/g, '/');
                    if (subcountyNameMap.has(withSlash)) {
                        mappingSummary.subcounties.existing.push(subcounty);
                        found = true;
                    } else {
                        // Try with slash converted to space
                        const withSpace = subcountyName.replace(/\//g, ' ');
                        if (subcountyNameMap.has(withSpace)) {
                            mappingSummary.subcounties.existing.push(subcounty);
                            found = true;
                        } else {
                            // Try order-independent matching (e.g., "Nyangoma Masogo" matches "Masogo/Nyangoma")
                            const words = subcountyName.split(/[\s\/]+/).filter(w => w.length > 0).sort().join(' ');
                            if (words && subcountyWordSetMap.has(words)) {
                                mappingSummary.subcounties.existing.push(subcounty);
                                found = true;
                            }
                        }
                    }
                }
                
                if (!found) {
                    mappingSummary.subcounties.new.push(subcounty);
                }
            });
        }

        // Check financial years (with flexible matching for formats like "FY2014/2015", "fy2014/2015", "2014/2015", "2014-2015", "fy 2014-2015")
        if (uniqueFinancialYears.size > 0) {
            const fyList = Array.from(uniqueFinancialYears);
            // Get all financial years and do flexible matching (exclude voided)
            const [allFYs] = await connection.query(
                `SELECT finYearName FROM kemri_financialyears WHERE (voided IS NULL OR voided = 0)`
            );
            
            // Normalize financial year name: strip FY prefix, normalize separators to slash, lowercase
            // Also handles concatenated years like "20232024" -> "2023/2024"
            const normalizeFinancialYear = (name, trackCorrections = false) => {
                if (!name) return trackCorrections ? { normalized: '', corrected: false, originalValue: '' } : '';
                
                const originalValue = String(name).trim();
                
                // Convert to string if not already, and normalize
                let strValue = '';
                if (typeof name === 'string') {
                    strValue = name.trim();
                } else {
                    strValue = String(name || '').trim();
                }
                
                if (!strValue) return trackCorrections ? { normalized: '', corrected: false, originalValue: originalValue } : '';
                
                let normalized = strValue.toLowerCase();
                let wasCorrected = false;
                
                // Check for concatenated years like "20232024" (8 digits) or "2023-2024" (without separator)
                // Pattern: 4 digits followed by 4 digits (e.g., "20232024")
                const concatenatedMatch = normalized.match(/^(\d{4})(\d{4})$/);
                if (concatenatedMatch) {
                    const year1 = concatenatedMatch[1];
                    const year2 = concatenatedMatch[2];
                    // Validate years are reasonable (1900-2100 range and consecutive)
                    const y1 = parseInt(year1, 10);
                    const y2 = parseInt(year2, 10);
                    if (y1 >= 1900 && y1 <= 2100 && y2 >= 1900 && y2 <= 2100 && y2 === y1 + 1) {
                        normalized = `${year1}/${year2}`;
                        wasCorrected = true;
                    }
                }
                
                // Remove FY or fy prefix (with optional space)
                normalized = normalized.replace(/^fy\s*/i, '');
                // Normalize all separators (space, dash) to slash
                normalized = normalized.replace(/[\s\-]/g, '/');
                // Remove any extra slashes
                normalized = normalized.replace(/\/+/g, '/');
                const finalNormalized = normalized.trim();
                
                if (trackCorrections && wasCorrected) {
                    return {
                        normalized: finalNormalized,
                        corrected: true,
                        originalValue: originalValue,
                        correctionMessage: `Financial year corrected from "${originalValue}" to "${finalNormalized}" (concatenated years split)`
                    };
                }
                
                return trackCorrections ? {
                    normalized: finalNormalized,
                    corrected: false,
                    originalValue: originalValue,
                    correctionMessage: null
                } : finalNormalized;
            };
            
            // Create a map: normalized year (e.g., "2014/2015") -> actual database name (e.g., "FY2014/2015")
            const fyNormalizedMap = new Map();
            
            allFYs.forEach(fy => {
                if (fy.finYearName) {
                    const normalized = normalizeFinancialYear(fy.finYearName);
                    // Store the normalized version pointing to the actual database name
                    fyNormalizedMap.set(normalized, fy.finYearName);
                }
            });
            
            fyList.forEach(fy => {
                const normalizedFY = normalizeFinancialYear(fy);
                let found = false;
                
                // Check if normalized version exists in database
                if (normalizedFY && fyNormalizedMap.has(normalizedFY)) {
                    mappingSummary.financialYears.existing.push(fy);
                    found = true;
                }
                
                if (!found) {
                    mappingSummary.financialYears.new.push(fy);
                }
            });
        }

        // Identify rows with unmatched metadata (for warnings)
        dataToImport.forEach((row, index) => {
            // Skip rows where project name is empty, null, or has less than 3 characters
            const projectName = (row.projectName || row.Project_Name || row['Project Name'] || '').toString().trim();
            if (!projectName || projectName.length < 3) {
                return; // Skip this row
            }
            
            const dept = normalizeStr(row.department || row.Department);
            const ward = normalizeStr(row.ward || row.Ward || row['Ward Name']);
            const subcounty = normalizeStr(row['sub-county'] || row.SubCounty || row['Sub County'] || row.Subcounty);
            const finYear = normalizeStr(row.financialYear || row.FinancialYear || row['Financial Year'] || row.ADP || row.Year);
            
            const unmatched = [];
            if (dept && !mappingSummary.departments.existing.includes(dept) && !mappingSummary.departments.new.includes(dept)) {
                unmatched.push(`Department: ${dept}`);
            }
            if (ward && !mappingSummary.wards.existing.includes(ward) && !mappingSummary.wards.new.includes(ward)) {
                unmatched.push(`Ward: ${ward}`);
            }
            if (subcounty && !mappingSummary.subcounties.existing.includes(subcounty) && !mappingSummary.subcounties.new.includes(subcounty)) {
                unmatched.push(`Sub-county: ${subcounty}`);
            }
            if (finYear && !mappingSummary.financialYears.existing.includes(finYear) && !mappingSummary.financialYears.new.includes(finYear)) {
                unmatched.push(`Financial Year: ${finYear}`);
            }
            
            if (unmatched.length > 0) {
                mappingSummary.rowsWithUnmatchedMetadata.push({
                    rowNumber: index + 2, // +2 because index is 0-based and Excel rows start at 2 (header + 1)
                    projectName: normalizeStr(row.projectName || row.Project_Name || row['Project Name']) || 
                                normalizeStr(row.ProjectRefNum || row.Project_Ref_Num || row['Project Ref Num']) || 
                                `Row ${index + 2}`,
                    unmatched: unmatched
                });
            }
        });

        return res.status(200).json({
            success: true,
            message: 'Metadata mapping check completed',
            mappingSummary
        });
    } catch (err) {
        console.error('Metadata mapping check error:', err);
        return res.status(500).json({ 
            success: false, 
            message: 'Failed to check metadata mappings',
            error: err.message 
        });
    } finally {
        if (connection) connection.release();
    }
});

/**
 * @route POST /api/projects/confirm-import-data
 * @description Confirm and import project data
 */
router.post('/confirm-import-data', async (req, res) => {
    const { dataToImport } = req.body || {};
    if (!dataToImport || !Array.isArray(dataToImport) || dataToImport.length === 0) {
        return res.status(400).json({ success: false, message: 'No data provided for import confirmation.' });
    }

    // PostgreSQL only - no MySQL support
    const DB_TYPE = 'postgresql';
    const tableName = 'projects';
    const idColumn = 'project_id';

    const toBool = (v) => {
        if (typeof v === 'number') return v !== 0;
        if (typeof v === 'boolean') return v;
        if (typeof v === 'string') {
            const s = v.trim().toLowerCase();
            return ['1','true','yes','y','contracted'].includes(s);
        }
        return false;
    };

    // Enhanced normalization: trim, normalize spaces/slashes, handle apostrophes, collapse multiple spaces
    const normalizeStr = (v) => {
        if (typeof v !== 'string') return v;
        let normalized = v.trim();
        // Remove apostrophes (handle different apostrophe characters: ', ', ', `, and Unicode variants)
        // Use a more comprehensive pattern to catch all apostrophe-like characters
        normalized = normalized.replace(/[''"`\u0027\u2018\u2019\u201A\u201B\u2032\u2035]/g, '');
        // Normalize slashes: remove spaces around existing slashes
        normalized = normalized.replace(/\s*\/\s*/g, '/');
        // Collapse multiple spaces to single space
        normalized = normalized.replace(/\s+/g, ' ');
        // Don't automatically convert spaces to slashes - this causes issues with names like "Kisumu Central"
        // The matching logic will handle both space and slash variations
        return normalized;
    };

    // Normalize alias for matching: remove &, commas, and spaces, then lowercase
    // This allows "WECV&NR", "WECVNR", "WE,CV,NR" to all match
    const normalizeAlias = (v) => {
        if (typeof v !== 'string') return v;
        return normalizeStr(v)
            .replace(/[&,]/g, '')  // Remove ampersands and commas
            .replace(/\s+/g, '')   // Remove all spaces
            .toLowerCase();         // Lowercase for case-insensitive matching
    };

    let connection;
    const summary = { 
        projectsCreated: 0, 
        projectsUpdated: 0, 
        errors: [],
        dataCorrections: [] // Track date corrections only
    };

    try {
        if (DB_TYPE === 'postgresql') {
            // PostgreSQL: Use pool.query with BEGIN/COMMIT
            await pool.query('BEGIN');
        } else {
            // MySQL: Use connection transaction
            connection = await pool.getConnection();
            await connection.beginTransaction();
        }

        for (let i = 0; i < dataToImport.length; i++) {
            const row = dataToImport[i] || {};
            try {
                const projectName = normalizeStr(row.projectName || row.Project_Name || row['Project Name']);
                const projectRef = normalizeStr(row.ProjectRefNum || row.Project_Ref_Num || row['Project Ref Num']);
                
                // Skip rows where project name is empty, null, or has less than 3 characters
                const projectNameStr = (projectName || '').toString().trim();
                if (!projectNameStr || projectNameStr.length < 3) {
                    continue; // Skip this row
                }
                
                if (!projectName && !projectRef) {
                    throw new Error('Missing projectName and ProjectRefNum');
                }

                // Skip metadata resolution - no department, directorate, financial year, ward, subcounty linking

                // Prepare project payload
                const toMoney = (v) => {
                    if (v == null || v === '') return null;
                    const cleaned = String(v).replace(/,/g, '').trim();
                    if (!cleaned) return null;
                    const num = Number(cleaned);
                    return isNaN(num) ? null : num;
                };
                // Ensure dates are in YYYY-MM-DD format - track corrections
                const normalizeDate = (dateValue, fieldName) => {
                    if (!dateValue) return { date: null, corrected: false };
                    try {
                        // If already in YYYY-MM-DD format, return as-is
                        if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateValue)) {
                            return { date: dateValue.split(' ')[0], corrected: false }; // Take only date part if there's time
                        }
                        // Try to parse if it's a date string or object
                        const parsed = parseDateToYMD(dateValue, true);
                        // Validate the parsed date is in correct format
                        if (parsed && parsed.date && typeof parsed.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(parsed.date)) {
                            if (parsed.corrected) {
                                summary.dataCorrections.push({
                                    row: i + 2,
                                    field: fieldName,
                                    originalValue: parsed.originalValue,
                                    correctedValue: parsed.date,
                                    message: parsed.correctionMessage
                                });
                            }
                            return { date: parsed.date, corrected: parsed.corrected };
                        }
                        // If parsing failed or returned invalid format, return null
                        return { date: null, corrected: false };
                    } catch (dateErr) {
                        console.warn(`Date parsing error for value "${dateValue}":`, dateErr.message);
                        return { date: null, corrected: false };
                    }
                };
                const projectPayload = {
                    projectName: projectName || null,
                    ProjectRefNum: projectRef || null,
                    projectDescription: normalizeStr(row.ProjectDescription || row.Description) || null,
                    status: normalizeStr(row.Status) || null,
                    costOfProject: toMoney(row.budget),
                    paidOut: toMoney(row.amountPaid),
                    startDate: normalizeDate(row.StartDate, 'StartDate').date,
                    endDate: normalizeDate(row.EndDate, 'EndDate').date,
                    directorate: normalizeStr(row.directorate || row.Directorate) || null,
                    sector: normalizeStr(row.sector || row.Sector) || null,
                    implementing_agency: normalizeStr(row.agency || row.Agency || row.implementing_agency || row['Implementing Agency'] || row['implementing agency']) || null,
                    Contracted: toMoney(row.Contracted),
                };
                
                // Remove any properties with NaN values to prevent MySQL errors
                Object.keys(projectPayload).forEach(key => {
                    const value = projectPayload[key];
                    if (value !== null && typeof value === 'number' && isNaN(value)) {
                        console.warn(`Row ${i + 2}: Removing NaN value for field "${key}"`);
                        projectPayload[key] = null;
                    }
                });

                // Upsert by ProjectRefNum first, else by projectName
                let projectId = null;
                const placeholder = '$';
                const refNumColumn = 'name'; // PostgreSQL uses name field
                const nameColumn = 'name';
                
                if (projectPayload.ProjectRefNum) {
                    const checkRefQuery = `SELECT project_id FROM ${tableName} WHERE name = $1 AND (voided IS NULL OR voided = false)`;
                    const checkRefParams = [projectPayload.ProjectRefNum];
                    const existByRef = await pool.query(checkRefQuery, checkRefParams);
                    const existByRefRows = existByRef.rows;
                    
                    if (existByRefRows && existByRefRows.length > 0) {
                        projectId = existByRefRows[0][idColumn];
                        // Log payload for debugging if there are issues
                        if (process.env.NODE_ENV === 'development') {
                            console.log(`Row ${i + 2}: Updating project ${projectId} with payload:`, JSON.stringify(projectPayload, null, 2));
                        }
                        
                        if (DB_TYPE === 'postgresql') {
                            // PostgreSQL: Build UPDATE query with JSONB fields
                            const timeline = JSON.stringify({
                                start_date: projectPayload.startDate || null,
                                expected_completion_date: projectPayload.endDate || null,
                                financial_year: projectPayload.finYearId ? String(projectPayload.finYearId) : null
                            });
                            const budget = JSON.stringify({
                                allocated_amount_kes: projectPayload.costOfProject || 0,
                                disbursed_amount_kes: projectPayload.paidOut || 0,
                                contracted: projectPayload.Contracted || false,
                                budget_id: null,
                                source: null
                            });
                            const progress = JSON.stringify({
                                status: projectPayload.status || 'Not Started',
                                status_reason: null,
                                percentage_complete: 0,
                                latest_update_summary: null
                            });
                            
                            const updateQuery = `
                                UPDATE ${tableName} SET
                                    name = $1,
                                    description = $2,
                                    implementing_agency = $3,
                                    sector = $4,
                                    timeline = $5::jsonb,
                                    budget = $6::jsonb,
                                    progress = $7::jsonb,
                                    updated_at = CURRENT_TIMESTAMP
                                WHERE ${idColumn} = $8
                            `;
                            await pool.query(updateQuery, [
                                projectPayload.projectName,
                                projectPayload.projectDescription,
                                projectPayload.implementing_agency,
                                projectPayload.sector,
                                timeline,
                                budget,
                                progress,
                                projectId
                            ]);
                        } else {
                            await connection.query(`UPDATE ${tableName} SET ? WHERE ${idColumn} = ?`, [projectPayload, projectId]);
                        }
                        summary.projectsUpdated++;
                    }
                }
                if (!projectId && projectPayload.projectName) {
                    const checkNameQuery = `SELECT project_id FROM ${tableName} WHERE name = $1 AND (voided IS NULL OR voided = false)`;
                    const checkNameParams = [projectPayload.projectName];
                    const existByName = await pool.query(checkNameQuery, checkNameParams);
                    const existByNameRows = existByName.rows;
                    
                    if (existByNameRows && existByNameRows.length > 0) {
                        projectId = existByNameRows[0][idColumn];
                        // Log payload for debugging if there are issues
                        if (process.env.NODE_ENV === 'development') {
                            console.log(`Row ${i + 2}: Updating project ${projectId} with payload:`, JSON.stringify(projectPayload, null, 2));
                        }
                        
                        // PostgreSQL: Build UPDATE query with JSONB fields
                        const timeline = JSON.stringify({
                            start_date: projectPayload.startDate || null,
                            expected_completion_date: projectPayload.endDate || null
                        });
                        const budget = JSON.stringify({
                            allocated_amount_kes: projectPayload.costOfProject || 0,
                            disbursed_amount_kes: projectPayload.paidOut || 0,
                            contracted: projectPayload.Contracted || false,
                            budget_id: null,
                            source: null
                        });
                        const progress = JSON.stringify({
                            status: projectPayload.status || 'Not Started',
                            status_reason: null,
                            percentage_complete: 0,
                            latest_update_summary: null
                        });
                        
                        const updateQuery = `
                            UPDATE ${tableName} SET
                                name = $1,
                                description = $2,
                                implementing_agency = $3,
                                sector = $4,
                                timeline = $5::jsonb,
                                budget = $6::jsonb,
                                progress = $7::jsonb,
                                updated_at = CURRENT_TIMESTAMP
                            WHERE ${idColumn} = $8
                        `;
                        await pool.query(updateQuery, [
                            projectPayload.projectName,
                            projectPayload.projectDescription,
                            projectPayload.implementing_agency,
                            projectPayload.sector,
                            timeline,
                            budget,
                            progress,
                            projectId
                        ]);
                        summary.projectsUpdated++;
                    }
                }
                if (!projectId) {
                    // Log payload for debugging if there are issues
                    if (process.env.NODE_ENV === 'development') {
                        console.log(`Row ${i + 2}: Inserting new project with payload:`, JSON.stringify(projectPayload, null, 2));
                    }
                    
                        // PostgreSQL: Build INSERT query with JSONB fields
                        const timeline = JSON.stringify({
                            start_date: projectPayload.startDate || null,
                            expected_completion_date: projectPayload.endDate || null
                        });
                        const budget = JSON.stringify({
                            allocated_amount_kes: projectPayload.costOfProject || 0,
                            disbursed_amount_kes: projectPayload.paidOut || 0,
                            contracted: projectPayload.Contracted || false,
                            budget_id: null,
                            source: null
                        });
                        const progress = JSON.stringify({
                            status: projectPayload.status || 'Not Started',
                            status_reason: null,
                            percentage_complete: 0,
                            latest_update_summary: null
                        });
                        const notes = JSON.stringify({
                            objective: null,
                            expected_output: null,
                            expected_outcome: null,
                            program_id: null,
                            subprogram_id: null
                        });
                        const dataSources = JSON.stringify({
                            project_ref_num: projectPayload.ProjectRefNum || null,
                            created_by_user_id: 1
                        });
                        const publicEngagement = JSON.stringify({
                            approved_for_public: false,
                            approved_by: null,
                            approved_at: null,
                            approval_notes: null,
                            revision_requested: false,
                            revision_notes: null,
                            revision_requested_by: null,
                            revision_requested_at: null,
                            revision_submitted_at: null,
                            feedback_enabled: true,
                            common_feedback: null,
                            complaints_received: 0
                        });
                        const location = JSON.stringify({
                            county: null,
                            constituency: null,
                            ward: null,
                            geocoordinates: {
                                lat: null,
                                lng: null
                            }
                        });
                        
                        const insertQuery = `
                            INSERT INTO ${tableName} (
                                name, description, implementing_agency, sector, ministry, state_department, category_id,
                                timeline, budget, progress, notes, data_sources, public_engagement, location,
                                created_at, updated_at, voided
                            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9::jsonb, $10::jsonb, $11::jsonb, $12::jsonb, $13::jsonb, $14::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false)
                            RETURNING ${idColumn}
                        `;
                        const result = await pool.query(insertQuery, [
                            projectPayload.projectName,
                            projectPayload.projectDescription || null,
                            projectPayload.implementing_agency || null,
                            projectPayload.sector || null,
                            null, // ministry
                            null, // state_department
                            null, // category_id
                            timeline,
                            budget,
                            progress,
                            notes,
                            dataSources,
                            publicEngagement,
                            location
                        ]);
                        projectId = result.rows[0][idColumn];
                        summary.projectsCreated++;
                    }

                // Link Subcounty, Ward, Contractor - PostgreSQL: Skip for now (requires junction table implementation)
                // TODO: Implement these linking features for PostgreSQL

            } catch (rowErr) {
                console.error(`Error processing row ${i + 2}:`, rowErr);
                const errorMsg = `Row ${i + 2}: ${rowErr.message || String(rowErr)}`;
                summary.errors.push(errorMsg);
                // Also log the full error for debugging
                if (rowErr.stack) {
                    console.error(`Row ${i + 2} error stack:`, rowErr.stack);
                }
            }
        }

        if (summary.errors.length > 0) {
            await pool.query('ROLLBACK');
            console.error('Import failed with errors:', summary.errors);
            // Show first few errors in the main message for better visibility
            const errorPreview = summary.errors.slice(0, 5).join('; ');
            const errorMessage = summary.errors.length > 5 
                ? `Import failed with ${summary.errors.length} errors. First errors: ${errorPreview}...`
                : `Import failed with errors: ${errorPreview}`;
            return res.status(400).json({ 
                success: false, 
                message: errorMessage,
                details: { 
                    errors: summary.errors,
                    errorCount: summary.errors.length,
                    totalRows: dataToImport.length,
                    summary: {
                        projectsCreated: summary.projectsCreated,
                        projectsUpdated: summary.projectsUpdated
                    }
                } 
            });
        }

        await pool.query('COMMIT');
        
        return res.status(200).json({ 
            success: true, 
            message: 'Projects imported successfully',
            details: summary 
        });
    } catch (err) {
        await pool.query('ROLLBACK');
        console.error('Project import confirmation error:', err);
        return res.status(500).json({ 
            success: false, 
            message: err.message || 'Failed to import projects',
            details: { error: err.message, stack: process.env.NODE_ENV === 'development' ? err.stack : undefined }
        });
    } finally {
        // No connection to release for PostgreSQL (using pool)
    }
});

/**
 * @route GET /api/projects/template
 * @description Download project import template
 */
router.get('/template', async (req, res) => {
    try {
        // Resolve the path to the projects template stored under api/templates
        const templatePath = path.resolve(__dirname, '..', 'templates', 'projects_import_template.xlsx');
        if (!fs.existsSync(templatePath)) {
            return res.status(404).json({ message: 'Projects template not found on server' });
        }
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="projects_import_template.xlsx"');
        return res.sendFile(templatePath);
    } catch (err) {
        console.error('Error serving projects template:', err);
        return res.status(500).json({ message: 'Failed to serve projects template' });
    }
});

// --- Analytics Endpoints (MUST come before parameterized routes) ---
/**
 * @route GET /api/projects/status-counts
 * @description Get count of projects by status with optional filters
 */
router.get('/status-counts', async (req, res) => {
    try {
        const DB_TYPE = process.env.DB_TYPE || 'mysql';
        const placeholder = DB_TYPE === 'postgresql' ? '$' : '?';
        let placeholderIndex = 1;
        
        const { 
            finYearId, 
            status, 
            department, 
            departmentId,
            projectType, 
            section,
            subCounty,
            ward
        } = req.query;

        let whereConditions = [
            DB_TYPE === 'postgresql' ? 'p.voided = false' : 'p.voided = 0',
            DB_TYPE === 'postgresql' ? `p.progress->>'status' IS NOT NULL` : 'p.status IS NOT NULL'
        ];
        const queryParams = [];

        if (finYearId) {
            if (DB_TYPE === 'postgresql') {
                whereConditions.push(`(p.timeline->>'financial_year') = ${placeholder}${placeholderIndex}`);
            } else {
                whereConditions.push(`p.finYearId = ${placeholder}`);
            }
            queryParams.push(finYearId);
            placeholderIndex++;
        }

        // Use shared status filter helper for consistent normalization
        const statusValue = status || req.query.projectStatus;
        if (statusValue) {
            if (DB_TYPE === 'postgresql') {
                whereConditions.push(`p.progress->>'status' = ${placeholder}${placeholderIndex}`);
            } else {
                whereConditions.push(`p.status = ${placeholder}`);
            }
            queryParams.push(statusValue);
            placeholderIndex++;
        }

        if (department || departmentId) {
            if (DB_TYPE === 'postgresql') {
                whereConditions.push(`p.ministry = ${placeholder}${placeholderIndex}`);
            } else {
                whereConditions.push(`(d.name = ${placeholder} OR d.alias = ${placeholder} OR p.departmentId = ${placeholder})`);
                const deptValue = department || departmentId;
                queryParams.push(deptValue, deptValue);
            }
            const deptValue = department || departmentId;
            queryParams.push(deptValue);
            placeholderIndex++;
        }

        if (projectType) {
            if (DB_TYPE === 'postgresql') {
                whereConditions.push(`p.sector = ${placeholder}${placeholderIndex}`);
            } else {
                whereConditions.push(`(pc.categoryName = ${placeholder} OR pc.name = ${placeholder})`);
                queryParams.push(projectType);
            }
            queryParams.push(projectType);
            placeholderIndex++;
        }

        if (section) {
            if (DB_TYPE === 'postgresql') {
                whereConditions.push(`p.state_department = ${placeholder}${placeholderIndex}`);
            } else {
                whereConditions.push(`s.name = ${placeholder}`);
            }
            queryParams.push(section);
            placeholderIndex++;
        }

        // Skip subcounty/ward filters for PostgreSQL (tables don't exist)
        if (subCounty && DB_TYPE !== 'postgresql') {
            whereConditions.push(`EXISTS (
                SELECT 1 FROM kemri_project_subcounties psc 
                WHERE psc.projectId = p.id 
                AND (psc.subcountyId IN (SELECT subcountyId FROM kemri_subcounties WHERE name = ${placeholder} OR alias = ${placeholder}))
                AND psc.voided = 0
            )`);
            queryParams.push(subCounty, subCounty);
            placeholderIndex += 2;
        }

        if (ward && DB_TYPE !== 'postgresql') {
            whereConditions.push(`EXISTS (
                SELECT 1 FROM kemri_project_wards pw 
                WHERE pw.projectId = p.id 
                AND (pw.wardId IN (SELECT wardId FROM kemri_wards WHERE name = ${placeholder} OR alias = ${placeholder}))
                AND pw.voided = 0
            )`);
            queryParams.push(ward, ward);
            placeholderIndex += 2;
        }

        let sqlQuery = `
            SELECT
                ${DB_TYPE === 'postgresql' ? `p.progress->>'status'` : 'p.status'} AS status,
                COUNT(${DB_TYPE === 'postgresql' ? 'p.project_id' : 'p.id'}) AS count
            FROM projects p
        `;
        
        // Add joins only if needed (MySQL only)
        if (DB_TYPE !== 'postgresql') {
            sqlQuery += ` LEFT JOIN kemri_departments d ON p.departmentId = d.departmentId AND d.voided = 0`;
            
            if (projectType) {
                sqlQuery += ` LEFT JOIN kemri_project_milestone_implementations pc ON p.categoryId = pc.categoryId`;
            }
            if (section) {
                sqlQuery += ` LEFT JOIN kemri_sections s ON p.sectionId = s.sectionId`;
            }
        }
        
        sqlQuery += ` WHERE ${whereConditions.join(' AND ')}
            GROUP BY ${DB_TYPE === 'postgresql' ? `p.progress->>'status'` : 'p.status'}
            ORDER BY ${DB_TYPE === 'postgresql' ? `p.progress->>'status'` : 'p.status'}
        `;
        
        const result = await pool.execute(sqlQuery, queryParams);
        const rows = DB_TYPE === 'postgresql' ? (result.rows || result) : (Array.isArray(result) ? result[0] : result);
        const data = Array.isArray(rows) ? rows : [rows];
        
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching project status counts:', error);
        res.status(500).json({ message: 'Error fetching project status counts', error: error.message });
    }
});

/**
 * @route GET /api/projects/directorate-counts
 * @description Get count of projects by directorate with optional filters
 */
router.get('/directorate-counts', async (req, res) => {
    try {
        const DB_TYPE = process.env.DB_TYPE || 'mysql';
        const placeholder = DB_TYPE === 'postgresql' ? '$' : '?';
        let placeholderIndex = 1;
        
        const { 
            finYearId, 
            status, 
            department, 
            departmentId,
            projectType, 
            section,
            subCounty,
            ward
        } = req.query;

        let whereConditions = [
            DB_TYPE === 'postgresql' ? 'p.voided = false' : 'p.voided = 0',
            DB_TYPE === 'postgresql' ? `p.implementing_agency IS NOT NULL` : 'p.directorate IS NOT NULL'
        ];
        const queryParams = [];

        if (finYearId) {
            if (DB_TYPE === 'postgresql') {
                whereConditions.push(`(p.timeline->>'financial_year') = ${placeholder}${placeholderIndex}`);
            } else {
                whereConditions.push(`p.finYearId = ${placeholder}`);
            }
            queryParams.push(finYearId);
            placeholderIndex++;
        }

        if (status || req.query.projectStatus) {
            const statusValue = status || req.query.projectStatus;
            if (DB_TYPE === 'postgresql') {
                whereConditions.push(`p.progress->>'status' = ${placeholder}${placeholderIndex}`);
            } else {
                whereConditions.push(`p.status = ${placeholder}`);
            }
            queryParams.push(statusValue);
            placeholderIndex++;
        }

        if (department || departmentId) {
            if (DB_TYPE === 'postgresql') {
                whereConditions.push(`p.ministry = ${placeholder}${placeholderIndex}`);
            } else {
                whereConditions.push(`(d.name = ${placeholder} OR d.alias = ${placeholder} OR p.departmentId = ${placeholder})`);
                const deptValue = department || departmentId;
                queryParams.push(deptValue, deptValue);
            }
            const deptValue = department || departmentId;
            queryParams.push(deptValue);
            placeholderIndex++;
        }

        if (projectType) {
            if (DB_TYPE === 'postgresql') {
                whereConditions.push(`p.sector = ${placeholder}${placeholderIndex}`);
            } else {
                whereConditions.push(`(pc.categoryName = ${placeholder} OR pc.name = ${placeholder})`);
                queryParams.push(projectType);
            }
            queryParams.push(projectType);
            placeholderIndex++;
        }

        if (section) {
            if (DB_TYPE === 'postgresql') {
                whereConditions.push(`p.state_department = ${placeholder}${placeholderIndex}`);
            } else {
                whereConditions.push(`s.name = ${placeholder}`);
            }
            queryParams.push(section);
            placeholderIndex++;
        }

        // Skip subcounty/ward filters for PostgreSQL (tables don't exist)
        if (subCounty && DB_TYPE !== 'postgresql') {
            whereConditions.push(`EXISTS (
                SELECT 1 FROM kemri_project_subcounties psc 
                WHERE psc.projectId = p.id 
                AND (psc.subcountyId IN (SELECT subcountyId FROM kemri_subcounties WHERE name = ${placeholder} OR alias = ${placeholder}))
                AND psc.voided = 0
            )`);
            queryParams.push(subCounty, subCounty);
            placeholderIndex += 2;
        }

        if (ward && DB_TYPE !== 'postgresql') {
            whereConditions.push(`EXISTS (
                SELECT 1 FROM kemri_project_wards pw 
                WHERE pw.projectId = p.id 
                AND (pw.wardId IN (SELECT wardId FROM kemri_wards WHERE name = ${placeholder} OR alias = ${placeholder}))
                AND pw.voided = 0
            )`);
            queryParams.push(ward, ward);
            placeholderIndex += 2;
        }

        let sqlQuery = `
            SELECT
                ${DB_TYPE === 'postgresql' ? 'COALESCE(p.implementing_agency, \'Unassigned\')' : 'p.directorate'} AS directorate,
                COUNT(${DB_TYPE === 'postgresql' ? 'p.project_id' : 'p.id'}) AS count
            FROM projects p
        `;
        
        // Add joins only if needed (MySQL only)
        if (DB_TYPE !== 'postgresql') {
            sqlQuery += ` LEFT JOIN kemri_departments d ON p.departmentId = d.departmentId AND d.voided = 0`;
            
            if (projectType) {
                sqlQuery += ` LEFT JOIN kemri_project_milestone_implementations pc ON p.categoryId = pc.categoryId`;
            }
            if (section) {
                sqlQuery += ` LEFT JOIN kemri_sections s ON p.sectionId = s.sectionId`;
            }
        }
        
        sqlQuery += ` WHERE ${whereConditions.join(' AND ')}
            GROUP BY ${DB_TYPE === 'postgresql' ? 'COALESCE(p.implementing_agency, \'Unassigned\')' : 'p.directorate'}
            ORDER BY ${DB_TYPE === 'postgresql' ? 'COALESCE(p.implementing_agency, \'Unassigned\')' : 'p.directorate'}
        `;
        
        const result = await pool.execute(sqlQuery, queryParams);
        const rows = DB_TYPE === 'postgresql' ? (result.rows || result) : (Array.isArray(result) ? result[0] : result);
        const data = Array.isArray(rows) ? rows : [rows];
        
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching project directorate counts:', error);
        res.status(500).json({ message: 'Error fetching project directorate counts', error: error.message });
    }
});

/**
 * @route GET /api/projects/funding-overview
 * @description Get funding overview by status
 */
router.get('/funding-overview', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                p.status AS status,
                SUM(p.costOfProject) AS totalBudget,
                SUM(p.paidOut) AS totalPaid,
                COUNT(p.id) AS projectCount
            FROM kemri_projects p
            WHERE (p.voided IS NULL OR p.voided = 0) AND p.status IS NOT NULL
            GROUP BY p.status
            ORDER BY p.status
        `);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching project funding overview:', error);
        res.status(500).json({ message: 'Error fetching project funding overview', error: error.message });
    }
});

/**
 * @route GET /api/projects/pi-counts
 * @description Get count of projects by principal investigator
 * @deprecated This endpoint is deprecated as principalInvestigator field was removed during database harmonization
 */
router.get('/pi-counts', async (req, res) => {
    try {
        // Return empty array as principalInvestigator field no longer exists
        res.status(200).json([]);
    } catch (error) {
        console.error('Error fetching project PI counts:', error);
        res.status(500).json({ message: 'Error fetching project PI counts', error: error.message });
    }
});

/**
 * @route GET /api/projects/participants-per-project
 * @description Get participants per project
 */
router.get('/participants-per-project', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                p.projectName AS projectName,
                COUNT(pp.participantId) AS participantCount
            FROM kemri_projects p
            LEFT JOIN kemri_project_participants pp ON p.id = pp.projectId
            WHERE (p.voided IS NULL OR p.voided = 0)
            GROUP BY p.id, p.projectName
            ORDER BY participantCount DESC
            LIMIT 10
        `);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching participants per project:', error);
        res.status(500).json({ message: 'Error fetching participants per project', error: error.message });
    }
});

// NEW: Contractor Assignment Routes
/**
 * @route GET /api/projects/:projectId/contractors
 * @description Get all contractors assigned to a specific project.
 * @access Private
 */
router.get('/:projectId/contractors', async (req, res) => {
    const { projectId } = req.params;
    try {
        const [rows] = await pool.query(
            `SELECT c.* FROM kemri_contractors c
             JOIN kemri_project_contractor_assignments pca ON c.contractorId = pca.contractorId
             WHERE pca.projectId = ?`,
            [projectId]
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching contractors for project:', error);
        res.status(500).json({ message: 'Error fetching contractors for project', error: error.message });
    }
});

/**
 * @route POST /api/projects/:projectId/assign-contractor
 * @description Assign a contractor to a project.
 * @access Private
 */
router.post('/:projectId/assign-contractor', async (req, res) => {
    const { projectId } = req.params;
    const { contractorId } = req.body;
    
    if (!contractorId) {
        return res.status(400).json({ message: 'Contractor ID is required.' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO kemri_project_contractor_assignments (projectId, contractorId) VALUES (?, ?)',
            [projectId, contractorId]
        );
        res.status(201).json({ message: 'Contractor assigned to project successfully.', assignmentId: result.insertId });
    } catch (error) {
        console.error('Error assigning contractor to project:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'This contractor is already assigned to this project.' });
        }
        res.status(500).json({ message: 'Error assigning contractor to project', error: error.message });
    }
});

/**
 * @route DELETE /api/projects/:projectId/remove-contractor/:contractorId
 * @description Remove a contractor's assignment from a project.
 * @access Private
 */
router.delete('/:projectId/remove-contractor/:contractorId', async (req, res) => {
    const { projectId, contractorId } = req.params;
    try {
        const [result] = await pool.query(
            'DELETE FROM kemri_project_contractor_assignments WHERE projectId = ? AND contractorId = ?',
            [projectId, contractorId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Assignment not found.' });
        }
        res.status(204).send();
    } catch (error) {
        console.error('Error removing contractor assignment:', error);
        res.status(500).json({ message: 'Error removing contractor assignment', error: error.message });
    }
});


// NEW: Route for fetching payment requests for a project
router.get('/:projectId/payment-requests', async (req, res) => {
    const { projectId } = req.params;
    try {
        const [rows] = await pool.query(
            'SELECT * FROM kemri_project_payment_requests WHERE projectId = ? ORDER BY submittedAt DESC',
            [projectId]
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching payment requests for project:', error);
        res.status(500).json({ message: 'Error fetching payment requests for project', error: error.message });
    }
});



// NEW: Route for fetching contractor photos for a project
router.get('/:projectId/contractor-photos', async (req, res) => {
    const { projectId } = req.params;
    try {
        const [rows] = await pool.query(
            'SELECT * FROM kemri_contractor_photos WHERE projectId = ? ORDER BY submittedAt DESC',
            [projectId]
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching contractor photos for project:', error);
        res.status(500).json({ message: 'Error fetching contractor photos for project', error: error.message });
    }
});


/**
 * @route GET /api/projects/maps-data
 * @description Get all project and GeoJSON data for the map, with optional filters.
 * @access Private
 */
router.get('/maps-data', async (req, res) => {
    const { countyId, subcountyId, wardId, projectType } = req.query;
    
    let query = `
        SELECT
            p.id,
            p.projectName,
            p.projectDescription,
            p.status,
            pm.mapId,
            pm.map AS geoJson
        FROM
            kemri_projects p
        JOIN
            kemri_project_maps pm ON p.id = pm.projectId
        WHERE 1=1
    `;

    const queryParams = [];
    
    // Add filtering based on the junction tables
    if (countyId) {
        query += ` AND p.id IN (
            SELECT projectId FROM kemri_project_counties WHERE countyId = ?
        )`;
        queryParams.push(countyId);
    }
    if (subcountyId) {
        query += ` AND p.id IN (
            SELECT projectId FROM kemri_project_subcounties WHERE subcountyId = ?
        )`;
        queryParams.push(subcountyId);
    }
    if (wardId) {
        query += ` AND p.id IN (
            SELECT projectId FROM kemri_project_wards WHERE wardId = ?
        )`;
        queryParams.push(wardId);
    }
    if (projectType && projectType !== 'all') {
        query += ` AND p.projectType = ?`;
        queryParams.push(projectType);
    }
    
    query += ` ORDER BY p.id;`;

    try {
        const [rows] = await pool.query(query, queryParams);

        let minLat = Infinity, minLng = Infinity, maxLat = -Infinity, maxLng = -Infinity;

        // Process GeoJSON to get a single bounding box and parse the data for the frontend
        const projectsWithGeoJson = rows.map(row => {
            try {
                const geoJson = JSON.parse(row.geoJson);
                
                const coordinates = extractCoordinates(geoJson.geometry);
                coordinates.forEach(coord => {
                    const [lng, lat] = coord;
                    if (isFinite(lat) && isFinite(lng)) {
                        minLat = Math.min(minLat, lat);
                        minLng = Math.min(minLng, lng);
                        maxLat = Math.max(maxLat, lat);
                        maxLng = Math.max(maxLng, lng);
                    }
                });

                return {
                    id: row.id,
                    projectName: row.projectName,
                    projectDescription: row.projectDescription,
                    status: row.status,
                    geoJson: geoJson,
                };
            } catch (e) {
                console.error("Error parsing GeoJSON for project:", row.id, e);
                return null;
            }
        }).filter(item => item !== null);

        const boundingBox = isFinite(minLat) ? { minLat, minLng, maxLat, maxLng } : null;

        const responseData = {
            projects: projectsWithGeoJson,
            boundingBox: boundingBox
        };

        res.status(200).json(responseData);
    } catch (error) {
        console.error('Error fetching filtered map data:', error);
        res.status(500).json({ message: 'Error fetching filtered map data', error: error.message });
    }
});


/**
 * @route GET /api/projects/
 * @description Get all active projects with optional filtering
 * @returns {Array} List of projects with joined data
 */
router.get('/', async (req, res) => {
    try {
        const {
            projectName, startDate, endDate, status, departmentId, sectionId,
            finYearId, programId, subProgramId, countyId, subcountyId, wardId, categoryId, budgetId
        } = req.query;

        // Get DB_TYPE first
        const DB_TYPE = process.env.DB_TYPE || 'mysql';
        
        // Check if programs and subprograms tables exist (for PostgreSQL)
        let programsTableExists = false;
        let subprogramsTableExists = false;
        if (DB_TYPE === 'postgresql') {
            try {
                const programsCheck = await pool.query(`
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_schema = 'public' 
                        AND table_name = 'programs'
                    )
                `);
                programsTableExists = programsCheck.rows[0].exists;
                
                const subprogramsCheck = await pool.query(`
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_schema = 'public' 
                        AND table_name = 'subprograms'
                    )
                `);
                subprogramsTableExists = subprogramsCheck.rows[0].exists;
            } catch (checkError) {
                console.warn('Could not check for programs/subprograms tables:', checkError.message);
                // Continue without joins if check fails
            }
        }
        
        // Query using new JSONB structure for PostgreSQL
        // Build SELECT with conditional joins based on table existence
        const programNameSelect = programsTableExists ? 'pr."programme"' : 'NULL';
        const subProgramNameSelect = subprogramsTableExists ? 'spr."subProgramme"' : 'NULL';
        
        const BASE_PROJECT_SELECT = DB_TYPE === 'postgresql' ? 
            `SELECT
                p.project_id AS id,
                p.name AS "projectName",
                p.description AS "projectDescription",
                p.implementing_agency AS directorate,
                (p.timeline->>'start_date')::date AS "startDate",
                (p.timeline->>'expected_completion_date')::date AS "endDate",
                (p.budget->>'allocated_amount_kes')::numeric AS "costOfProject",
                (p.budget->>'disbursed_amount_kes')::numeric AS "paidOut",
                p.budget->>'source' AS "budgetSource",
                p.notes->>'objective' AS objective,
                p.notes->>'expected_output' AS "expectedOutput",
                NULL AS "principalInvestigator",
                p.notes->>'expected_outcome' AS "expectedOutcome",
                p.progress->>'status' AS status,
                p.progress->>'status_reason' AS "statusReason",
                p.progress->>'latest_update_summary' AS "progressSummary",
                p.data_sources->>'project_ref_num' AS "ProjectRefNum",
                p.data_sources AS "dataSources",
                (p.budget->>'contracted')::boolean AS "Contracted",
                (p.location->>'geocoordinates')::jsonb AS "geocoordinates",
                (p.location->'geocoordinates'->>'lat') AS "latitude",
                (p.location->'geocoordinates'->>'lng') AS "longitude",
                (p.public_engagement->>'feedback_enabled')::boolean AS "feedbackEnabled",
                p.public_engagement->>'common_feedback' AS "commonFeedback",
                (p.public_engagement->>'complaints_received')::integer AS "complaintsReceived",
                p.created_at AS "createdAt",
                p.updated_at AS "updatedAt",
                p.voided,
                NULL AS "principalInvestigatorStaffId",
                NULL AS piFirstName,
                NULL AS piLastName,
                NULL AS piEmail,
                NULL AS "departmentId",
                p.ministry AS "ministry",
                p.ministry AS departmentName,
                NULL AS departmentAlias,
                NULL AS "sectionId",
                p.state_department AS "stateDepartment",
                p.state_department AS sectionName,
                NULL AS "finYearId",
                NULL AS financialYearName,
                (p.notes->>'program_id')::integer AS "programId",
                ` + programNameSelect + ` AS "programName",
                (p.notes->>'subprogram_id')::integer AS "subProgramId",
                ` + subProgramNameSelect + ` AS "subProgramName",
                p.category_id AS "categoryId",
                p.sector AS "sector",
                cat."categoryName" AS "categoryName",
                (p.data_sources->>'created_by_user_id')::integer AS "userId",
                NULL AS creatorFirstName,
                NULL AS creatorLastName,
                (p.public_engagement->>'approved_for_public')::boolean AS approved_for_public,
                (p.public_engagement->>'approved_by')::integer AS approved_by,
                (p.public_engagement->>'approved_at')::timestamp AS approved_at,
                p.public_engagement->>'approval_notes' AS approval_notes,
                (p.public_engagement->>'revision_requested')::boolean AS revision_requested,
                p.public_engagement->>'revision_notes' AS revision_notes,
                (p.public_engagement->>'revision_requested_by')::integer AS revision_requested_by,
                (p.public_engagement->>'revision_requested_at')::timestamp AS revision_requested_at,
                (p.public_engagement->>'revision_submitted_at')::timestamp AS revision_submitted_at,
                (p.progress->>'percentage_complete')::numeric AS "overallProgress",
                (p.budget->>'budget_id')::integer AS budgetId,
                NULL AS countyNames,
                NULL AS subcountyNames,
                NULL AS wardNames
        ` : `
            SELECT
                p.id,
                p.projectName,
                p.projectDescription,
                p.directorate,
                p.startDate,
                p.endDate,
                p.costOfProject,
                p.paidOut,
                p.objective,
                p.expectedOutput,
                p.expectedOutcome,
                p.status,
                p.statusReason,
                p.ProjectRefNum,
                p.Contracted,
                p.createdAt,
                p.updatedAt,
                p.voided,
                NULL AS piFirstName,
                NULL AS piLastName,
                NULL AS piEmail,
                p.departmentId,
                NULL AS departmentName,
                NULL AS departmentAlias,
                p.sectionId,
                NULL AS sectionName,
                p.finYearId,
                NULL AS financialYearName,
                p.programId,
                NULL AS programName,
                p.subProgramId,
                NULL AS subProgramName,
                p.categoryId,
                NULL AS categoryName,
                p.userId AS creatorUserId,
                NULL AS creatorFirstName,
                NULL AS creatorLastName,
                p.approved_for_public,
                p.approved_by,
                p.approved_at,
                p.approval_notes,
                p.revision_requested,
                p.revision_notes,
                p.revision_requested_by,
                p.revision_requested_at,
                NULL AS revision_submitted_at,
                p.overallProgress,
                NULL AS budgetId,
                NULL AS countyNames,
                NULL AS subcountyNames,
                NULL AS wardNames
        `;
        
        // This part dynamically builds the query.
        // Add LEFT JOINs for programs and subprograms (only if tables exist)
        let fromAndJoinClauses = DB_TYPE === 'postgresql' ? `
            FROM
                projects p
            ${programsTableExists ? `LEFT JOIN programs pr ON (p.notes->>'program_id')::integer = pr."programId" AND (pr.voided IS NULL OR pr.voided = false)` : ''}
            ${subprogramsTableExists ? `LEFT JOIN subprograms spr ON (p.notes->>'subprogram_id')::integer = spr."subProgramId" AND (spr.voided IS NULL OR spr.voided = false)` : ''}
            LEFT JOIN categories cat ON p.category_id = cat."categoryId" AND (cat.voided IS NULL OR cat.voided = false)
        ` : `
            FROM
                projects p
            LEFT JOIN programs pr ON p.programId = pr.programId AND (pr.voided IS NULL OR pr.voided = 0)
            LEFT JOIN subprograms spr ON p.subProgramId = spr.subProgramId AND (spr.voided IS NULL OR spr.voided = 0)
        `;

        let queryParams = [];
        let whereConditions = [];
        
        if (DB_TYPE === 'postgresql') {
            whereConditions = ['p.voided = false'];
        } else {
            whereConditions = ['p.voided = 0'];
        }

        // Location filters disabled for now (tables don't exist)
        // if (countyId) {
        //     whereConditions.push('pc.countyId = ?');
        //     queryParams.push(parseInt(countyId));
        // }
        // if (subcountyId) {
        //     whereConditions.push('psc.subcountyId = ?');
        //     queryParams.push(parseInt(subcountyId));
        // }
        // if (wardId) {
        //     whereConditions.push('pw.wardId = ?');
        //     queryParams.push(parseInt(wardId));
        // }

        // Add other non-location filters
        if (projectName) { 
            whereConditions.push(DB_TYPE === 'postgresql' ? 'p.name ILIKE ?' : 'p.projectName LIKE ?'); 
            queryParams.push(`%${projectName}%`); 
        }
        if (startDate) { 
            whereConditions.push(DB_TYPE === 'postgresql' ? "(p.timeline->>'start_date')::date >= ?" : 'p.startDate >= ?'); 
            queryParams.push(startDate); 
        }
        if (endDate) { 
            whereConditions.push(DB_TYPE === 'postgresql' ? "(p.timeline->>'expected_completion_date')::date <= ?" : 'p.endDate <= ?'); 
            queryParams.push(endDate); 
        }
        if (status) {
            if (DB_TYPE === 'postgresql') {
                // Query JSONB field for status
                whereConditions.push("p.progress->>'status' ILIKE ?");
                queryParams.push(`%${status}%`);
            } else {
                // Use the statusFilterHelper for MySQL
                addStatusFilter(status, whereConditions, queryParams);
            }
        }
        if (departmentId) { 
            // For PostgreSQL, we now use ministry text field, but can also search by name
            if (DB_TYPE === 'postgresql') {
                whereConditions.push('p.ministry ILIKE ?');
                queryParams.push(`%${departmentId}%`);
            } else {
                whereConditions.push('p.departmentId = ?'); 
                queryParams.push(parseInt(departmentId)); 
            }
        }
        if (sectionId) { 
            // For PostgreSQL, we now use state_department text field
            if (DB_TYPE === 'postgresql') {
                whereConditions.push('p.state_department ILIKE ?');
                queryParams.push(`%${sectionId}%`);
            } else {
                whereConditions.push('p.sectionId = ?'); 
                queryParams.push(parseInt(sectionId)); 
            }
        }
        if (finYearId) { 
            // Financial year is now in timeline JSONB
            if (DB_TYPE === 'postgresql') {
                whereConditions.push("p.timeline->>'financial_year' = ?");
                queryParams.push(finYearId);
            } else {
                whereConditions.push('p.finYearId = ?'); 
                queryParams.push(parseInt(finYearId)); 
            }
        }
        if (programId) { 
            // Program ID is now in notes JSONB
            if (DB_TYPE === 'postgresql') {
                whereConditions.push("(p.notes->>'program_id')::integer = ?");
                queryParams.push(parseInt(programId));
            } else {
                whereConditions.push('p.programId = ?'); 
                queryParams.push(parseInt(programId)); 
            }
        }
        if (subProgramId) { 
            // Subprogram ID is now in notes JSONB
            if (DB_TYPE === 'postgresql') {
                whereConditions.push("(p.notes->>'subprogram_id')::integer = ?");
                queryParams.push(parseInt(subProgramId));
            } else {
                whereConditions.push('p.subProgramId = ?'); 
                queryParams.push(parseInt(subProgramId)); 
            }
        }
        if (categoryId) { 
            // Filter by category_id column
            if (DB_TYPE === 'postgresql') {
                whereConditions.push('p.category_id = ?');
                queryParams.push(parseInt(categoryId));
            } else {
                whereConditions.push('p.categoryId = ?'); 
                queryParams.push(parseInt(categoryId)); 
            }
        }
        if (budgetId) { 
            // Budget ID is now in budget JSONB
            if (DB_TYPE === 'postgresql') {
                whereConditions.push("(p.budget->>'budget_id')::integer = ?");
                queryParams.push(parseInt(budgetId));
            } else {
                whereConditions.push('p.budgetId = ?'); 
                queryParams.push(parseInt(budgetId)); 
            }
        }

        // Build the final query (no location select clauses needed - already in BASE_PROJECT_SELECT as NULL)
        let query = `${BASE_PROJECT_SELECT} ${fromAndJoinClauses}`;

        // Add voided condition - only exclude projects where voided = 1/true, include null and false
        const voidedCondition = DB_TYPE === 'postgresql' 
            ? '(p.voided IS NULL OR p.voided = false)'
            : '(p.voided IS NULL OR p.voided = 0)';
        
        if (whereConditions.length > 0) {
            query += ` WHERE ${voidedCondition} AND ${whereConditions.join(' AND ')}`;
        } else {
            query += ` WHERE ${voidedCondition}`;
        }
        // No GROUP BY needed since we're not using aggregations
        query += ` ORDER BY ${DB_TYPE === 'postgresql' ? 'p.project_id' : 'p.id'}`;

        // Convert MySQL ? placeholders to PostgreSQL $1, $2, etc. if needed
        if (DB_TYPE === 'postgresql') {
            let paramIndex = 1;
            query = query.replace(/\?/g, () => `$${paramIndex++}`);
        }
        
        // Log query for debugging (first 500 chars)
        console.log('Executing projects query (first 500 chars):', query.substring(0, 500));
        console.log('Query params:', queryParams);
        
        // Use execute for PostgreSQL to handle placeholder conversion
        const result = await pool.execute(query, queryParams);
        const rows = DB_TYPE === 'postgresql' ? (result.rows || result) : (Array.isArray(result) ? result[0] : result);
        console.log('Projects query returned', rows?.length || 0, 'rows');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching projects:', error);
        console.error('Error stack:', error.stack);
        console.error('Query that failed (first 500 chars):', query?.substring(0, 500));
        res.status(500).json({ message: 'Error fetching projects', error: error.message });
    }
});


// ==================== PROJECT APPROVAL ROUTE (must be before /:id route) ====================

/**
 * @route PUT /api/projects/:id/approval
 * @description Approve, revoke, or request revision for a project (for public viewing)
 * @access Protected - requires public_content.approve privilege or admin role
 */
router.put('/:id/approval', async (req, res) => {
    // Check if user is authenticated
    if (!req.user) {
        return res.status(401).json({ 
            error: 'Authentication required' 
        });
    }
    
    // Check if user is admin or has public_content.approve privilege
    const isAdmin = req.user?.roleName === 'admin';
    const hasPrivilege = req.user?.privileges?.includes('public_content.approve');
    
    if (!isAdmin && !hasPrivilege) {
        return res.status(403).json({ 
            error: 'Access denied. You do not have the necessary privileges to perform this action.' 
        });
    }
    
    try {
        const DB_TYPE = process.env.DB_TYPE || 'mysql';
        const { id } = req.params;
        const { 
            approved_for_public, 
            approval_notes, 
            approved_by, 
            approved_at,
            revision_requested,
            revision_notes,
            revision_requested_by,
            revision_requested_at
        } = req.body;

        if (DB_TYPE === 'postgresql') {
            // PostgreSQL: Update JSONB field
            // First, get the current public_engagement JSONB
            const getCurrentQuery = 'SELECT public_engagement FROM projects WHERE project_id = $1 AND voided = false';
            const currentResult = await pool.query(getCurrentQuery, [id]);
            
            if (currentResult.rows.length === 0) {
                return res.status(404).json({ error: 'Project not found' });
            }
            
            // Get current public_engagement or initialize empty object
            let publicEngagement = currentResult.rows[0].public_engagement || {};
            
            // Update the JSONB object
            if (revision_requested !== undefined) {
                publicEngagement.revision_requested = revision_requested;
                
                if (revision_requested) {
                    publicEngagement.revision_notes = revision_notes || null;
                    publicEngagement.revision_requested_by = revision_requested_by || req.user.id || req.user.userId;
                    const revisionRequestedAt = revision_requested_at ? new Date(revision_requested_at) : new Date();
                    publicEngagement.revision_requested_at = revisionRequestedAt.toISOString();
                    // Reset approval when revision is requested
                    publicEngagement.approved_for_public = false;
                } else {
                    // Clear revision fields
                    publicEngagement.revision_notes = null;
                    publicEngagement.revision_requested_by = null;
                    publicEngagement.revision_requested_at = null;
                }
            }
            
            if (approved_for_public !== undefined) {
                publicEngagement.approved_for_public = approved_for_public;
                publicEngagement.approval_notes = approval_notes || null;
                publicEngagement.approved_by = approved_by || req.user.id || req.user.userId;
                const approvedAt = approved_at ? new Date(approved_at) : new Date();
                publicEngagement.approved_at = approvedAt.toISOString();
                
                // Clear revision request when approving/rejecting
                if (revision_requested === undefined) {
                    publicEngagement.revision_requested = false;
                    publicEngagement.revision_notes = null;
                }
            }
            
            // Update the JSONB field
            const updateQuery = `
                UPDATE projects
                SET public_engagement = $1, updated_at = NOW()
                WHERE project_id = $2 AND voided = false
            `;
            
            const updateResult = await pool.query(updateQuery, [JSON.stringify(publicEngagement), id]);
            
            console.log('=== PROJECT APPROVAL UPDATE (PostgreSQL) ===');
            console.log('Project ID:', id);
            console.log('Updated public_engagement:', JSON.stringify(publicEngagement, null, 2));
            console.log('Rows affected:', updateResult.rowCount);
            console.log('==========================================');
            
            if (updateResult.rowCount === 0) {
                return res.status(404).json({ error: 'Project not found' });
            }
            
            let message = 'Project updated successfully';
            if (revision_requested) {
                message = 'Revision requested successfully';
            } else if (approved_for_public !== undefined) {
                message = `Project ${approved_for_public ? 'approved' : 'revoked'} for public viewing`;
            }
            
            res.json({
                success: true,
                message
            });
        } else {
            // MySQL: Update direct columns
            let updateFields = [];
            let updateValues = [];

            if (revision_requested !== undefined) {
                updateFields.push('revision_requested = ?');
                updateValues.push(revision_requested ? 1 : 0);
                
                if (revision_requested) {
                    updateFields.push('revision_notes = ?');
                    updateFields.push('revision_requested_by = ?');
                    updateFields.push('revision_requested_at = ?');
                    updateValues.push(revision_notes || null);
                    updateValues.push(revision_requested_by || req.user.userId);
                    const revisionRequestedAt = revision_requested_at ? new Date(revision_requested_at) : new Date();
                    updateValues.push(revisionRequestedAt.toISOString().slice(0, 19).replace('T', ' '));
                    updateFields.push('approved_for_public = 0');
                } else {
                    updateFields.push('revision_notes = NULL');
                    updateFields.push('revision_requested_by = NULL');
                    updateFields.push('revision_requested_at = NULL');
                }
            }

            if (approved_for_public !== undefined) {
                updateFields.push('approved_for_public = ?');
                updateFields.push('approval_notes = ?');
                updateFields.push('approved_by = ?');
                updateFields.push('approved_at = ?');
                updateValues.push(approved_for_public ? 1 : 0);
                updateValues.push(approval_notes || null);
                updateValues.push(approved_by || req.user.userId);
                const approvedAt = approved_at ? new Date(approved_at) : new Date();
                updateValues.push(approvedAt.toISOString().slice(0, 19).replace('T', ' '));
                
                if (revision_requested === undefined) {
                    updateFields.push('revision_requested = 0');
                    updateFields.push('revision_notes = NULL');
                }
            }

            if (updateFields.length === 0) {
                return res.status(400).json({ error: 'No update fields provided' });
            }

            updateValues.push(id);

            const query = `
                UPDATE kemri_projects
                SET ${updateFields.join(', ')}
                WHERE id = ? AND voided = 0
            `;

            const [result] = await pool.query(query, updateValues);

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Project not found' });
            }

            let message = 'Project updated successfully';
            if (revision_requested) {
                message = 'Revision requested successfully';
            } else if (approved_for_public !== undefined) {
                message = `Project ${approved_for_public ? 'approved' : 'revoked'} for public viewing`;
            }

            res.json({
                success: true,
                message
            });
        }
    } catch (error) {
        console.error('=== ERROR UPDATING PROJECT APPROVAL ===');
        console.error('Error:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('Request params:', req.params);
        console.error('Request body:', req.body);
        console.error('========================================');
        res.status(500).json({ 
            error: 'Failed to update approval status',
            details: error.message 
        });
    }
});

/**
 * @route PUT /api/projects/:id/progress
 * @description Update overall progress for a project (0, 25, 50, 75, 100)
 * @access Protected - requires public_content.approve privilege or admin role
 */
router.put('/:id/progress', async (req, res) => {
    // Check if user is authenticated
    if (!req.user) {
        return res.status(401).json({ 
            error: 'Authentication required' 
        });
    }
    
    // Check if user is admin or has public_content.approve privilege
    const isAdmin = req.user?.roleName === 'admin';
    const hasPrivilege = req.user?.privileges?.includes('public_content.approve');
    
    if (!isAdmin && !hasPrivilege) {
        return res.status(403).json({ 
            error: 'Access denied. You do not have the necessary privileges to perform this action.' 
        });
    }
    
    try {
        const { id } = req.params;
        const { overallProgress } = req.body;

        // Validate progress value
        const validProgressValues = [0, 25, 50, 75, 100];
        if (overallProgress === undefined || overallProgress === null) {
            return res.status(400).json({ error: 'overallProgress is required' });
        }
        
        const progressValue = parseInt(overallProgress);
        if (isNaN(progressValue) || !validProgressValues.includes(progressValue)) {
            return res.status(400).json({ 
                error: 'overallProgress must be one of: 0, 25, 50, 75, 100' 
            });
        }

        // Update the project's overallProgress
        const query = `
            UPDATE kemri_projects
            SET overallProgress = ?
            WHERE id = ? AND voided = 0
        `;

        console.log('=== UPDATING PROJECT PROGRESS ===');
        console.log('Project ID:', id);
        console.log('Progress Value:', progressValue);
        console.log('Query:', query);
        console.log('Query Params:', [progressValue, id]);

        const [result] = await pool.query(query, [progressValue, id]);

        console.log('Update result:', {
            affectedRows: result.affectedRows,
            insertId: result.insertId,
            changedRows: result.changedRows
        });

        if (result.affectedRows === 0) {
            console.log('No rows affected - project not found or already voided');
            return res.status(404).json({ error: 'Project not found' });
        }

        // Verify the update by fetching the updated value
        const [verifyRows] = await pool.query(
            'SELECT overallProgress FROM kemri_projects WHERE id = ? AND voided = 0',
            [id]
        );
        
        if (verifyRows.length > 0) {
            console.log('Verified updated progress:', verifyRows[0].overallProgress);
        }

        console.log('=== PROGRESS UPDATE SUCCESSFUL ===');

        res.json({
            success: true,
            message: `Project progress updated to ${progressValue}%`,
            overallProgress: progressValue
        });
    } catch (error) {
        console.error('Error updating project progress:', error);
        res.status(500).json({ 
            error: 'Failed to update project progress',
            details: error.message 
        });
    }
});

/**
 * @route GET /api/projects/:id
 * @description Get a single active project by ID with joined data
 * @returns {Object} Project details with joined data
 */
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    if (isNaN(parseInt(id))) {
        return res.status(400).json({ message: 'Invalid project ID' });
    }
    try {
        const DB_TYPE = process.env.DB_TYPE || 'mysql';
        const query = GET_SINGLE_PROJECT_QUERY(DB_TYPE);
        const result = await pool.execute(query, [id]);
        const rows = DB_TYPE === 'postgresql' ? (result.rows || result) : (Array.isArray(result) ? result[0] : result);
        const project = Array.isArray(rows) ? rows[0] : rows;
        if (project) {
            res.status(200).json(project);
        } else {
            res.status(404).json({ message: 'Project not found' });
        }
    } catch (error) {
        console.error('Error fetching project:', error);
        res.status(500).json({ message: 'Error fetching project', error: error.message });
    }
});

/**
 * @route POST /api/projects/
 * @description Create a new project, with optional milestone generation
 * @returns {Object} Created project with joined data
 */
router.post('/', validateProject, async (req, res) => {
    const DB_TYPE = process.env.DB_TYPE || 'mysql';
    const { categoryId, ...projectData } = req.body;
    
    // TODO: Get userId from authenticated user (e.g., req.user.userId)
    const userId = req.user?.id || req.user?.userId || 1; // Placeholder for now

    let connection;
    try {
        if (DB_TYPE === 'postgresql') {
            // PostgreSQL: Use pool.query with BEGIN/COMMIT
            await pool.query('BEGIN');
        } else {
            // MySQL: Use connection transaction
            connection = await pool.getConnection();
            await connection.beginTransaction();
        }

        try {
            let newProjectId;
            
            if (DB_TYPE === 'postgresql') {
                // PostgreSQL: Map data to new JSONB structure
                const {
                    projectName,
                    projectDescription,
                    directorate,
                    startDate,
                    endDate,
                    costOfProject,
                    paidOut,
                    objective,
                    expectedOutput,
                    expectedOutcome,
                    status,
                    statusReason,
                    ProjectRefNum,
                    Contracted,
                    ministry,
                    stateDepartment,
                    sector,
                    finYearId,
                    programId,
                    subProgramId,
                    overallProgress,
                    budgetSource,
                    progressSummary,
                    latitude,
                    longitude,
                    feedbackEnabled,
                    commonFeedback,
                    complaintsReceived,
                    dataSources
                } = projectData;

                // Build JSONB objects
                const timeline = JSON.stringify({
                    start_date: startDate || null,
                    expected_completion_date: endDate || null,
                    financial_year: finYearId ? String(finYearId) : null
                });

                const budget = JSON.stringify({
                    allocated_amount_kes: costOfProject || 0,
                    disbursed_amount_kes: paidOut || 0,
                    contracted: Contracted || false,
                    budget_id: null,
                    source: budgetSource || null
                });

                const progress = JSON.stringify({
                    status: status || 'Not Started',
                    status_reason: statusReason || null,
                    percentage_complete: overallProgress || 0,
                    latest_update_summary: progressSummary || null
                });

                const notes = JSON.stringify({
                    objective: objective || null,
                    expected_output: expectedOutput || null,
                    expected_outcome: expectedOutcome || null,
                    program_id: programId || null,
                    subprogram_id: subProgramId || null
                });

                // Handle dataSources - can be array or object
                let dataSourcesJson;
                if (dataSources && Array.isArray(dataSources) && dataSources.length > 0) {
                    dataSourcesJson = JSON.stringify(dataSources);
                } else {
                    dataSourcesJson = JSON.stringify({
                        project_ref_num: ProjectRefNum || null,
                        created_by_user_id: userId
                    });
                }

                const publicEngagement = JSON.stringify({
                    approved_for_public: false,
                    approved_by: null,
                    approved_at: null,
                    approval_notes: null,
                    revision_requested: false,
                    revision_notes: null,
                    revision_requested_by: null,
                    revision_requested_at: null,
                    revision_submitted_at: null,
                    feedback_enabled: feedbackEnabled !== undefined ? feedbackEnabled : true,
                    common_feedback: commonFeedback || null,
                    complaints_received: complaintsReceived || 0
                });

                const location = JSON.stringify({
                    county: null,
                    constituency: null,
                    ward: null,
                    geocoordinates: {
                        lat: latitude || null,
                        lng: longitude || null
                    }
                });

                // Insert into PostgreSQL with JSONB structure
                const insertQuery = `
                    INSERT INTO projects (
                        name, description, implementing_agency, sector, ministry, state_department, category_id,
                        timeline, budget, progress, notes, data_sources, public_engagement, location,
                        created_at, updated_at, voided
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9::jsonb, $10::jsonb, $11::jsonb, $12::jsonb, $13::jsonb, $14::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false)
                    RETURNING project_id
                `;
                
                const result = await pool.query(insertQuery, [
                    projectName,
                    projectDescription || null,
                    directorate || null,
                    sector || null,
                    ministry || null,
                    stateDepartment || null,
                    categoryId || null,
                    timeline,
                    budget,
                    progress,
                    notes,
                    dataSourcesJson,
                    publicEngagement,
                    location
                ]);
                
                newProjectId = result.rows[0].project_id;
            } else {
                // MySQL: Use old structure
                const newProject = {
                    createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
                    userId,
                    ...projectData,
                };

                const [result] = await connection.query('INSERT INTO kemri_projects SET ?', newProject);
                newProjectId = result.insertId;
            }

            // NEW: Automatically create milestones from the category template
            if (categoryId) {
                const milestoneQuery = DB_TYPE === 'postgresql' 
                    ? 'SELECT "milestoneName", description, "sequenceOrder" FROM category_milestones WHERE "categoryId" = $1'
                    : 'SELECT milestoneName, description, sequenceOrder FROM category_milestones WHERE categoryId = ?';
                
                const milestoneResult = DB_TYPE === 'postgresql' 
                    ? await pool.query(milestoneQuery, [categoryId])
                    : await connection.query(milestoneQuery, [categoryId]);
                
                const milestoneTemplates = DB_TYPE === 'postgresql' 
                    ? milestoneResult.rows 
                    : (Array.isArray(milestoneResult) ? milestoneResult[0] : milestoneResult);

                if (milestoneTemplates && milestoneTemplates.length > 0) {
                    if (DB_TYPE === 'postgresql') {
                        // PostgreSQL: Insert milestones
                        // Note: category_milestones uses camelCase (milestoneName), project_milestones uses snake_case (milestone_name)
                        for (const m of milestoneTemplates) {
                            await pool.query(
                                `INSERT INTO project_milestones (
                                    project_id, milestone_name, description, sequence_order, status, user_id, created_at
                                ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)`,
                                [
                                    newProjectId,
                                    m.milestoneName || m.milestone_name, // Handle both camelCase and snake_case
                                    m.description || null,
                                    m.sequenceOrder || m.sequence_order, // Handle both camelCase and snake_case
                                    'Not Started',
                                    userId
                                ]
                            );
                        }
                    } else {
                        // MySQL: Insert milestones
                        const milestoneValues = milestoneTemplates.map(m => [
                            newProjectId,
                            m.milestoneName || m.milestone_name,
                            m.description,
                            m.sequenceOrder || m.sequence_order,
                            'Not Started',
                            userId,
                            new Date().toISOString().slice(0, 19).replace('T', ' ')
                        ]);

                        await connection.query(
                            'INSERT INTO kemri_project_milestones (projectId, milestoneName, description, sequenceOrder, status, userId, createdAt) VALUES ?',
                            [milestoneValues]
                        );
                    }
                }
            }

            // Fetch the created project
            const query = GET_SINGLE_PROJECT_QUERY(DB_TYPE);
            const result = DB_TYPE === 'postgresql' 
                ? await pool.query(query, [newProjectId])
                : await connection.query(query, [newProjectId]);
            
            const rows = DB_TYPE === 'postgresql' ? (result.rows || result) : (Array.isArray(result) ? result[0] : result);
            const project = Array.isArray(rows) ? rows[0] : rows;
            
            if (DB_TYPE === 'postgresql') {
                await pool.query('COMMIT');
            } else {
                await connection.commit();
            }
            
            res.status(201).json(project || { id: newProjectId, message: 'Project created' });
        } catch (error) {
            if (DB_TYPE === 'postgresql') {
                await pool.query('ROLLBACK');
            } else {
                await connection.rollback();
                connection.release();
            }
            throw error;
        } finally {
            if (DB_TYPE !== 'postgresql' && connection) {
                connection.release();
            }
        }
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ message: 'Error creating project', error: error.message });
    }
});

// NEW: API Route to Apply Latest Milestone Templates
/**
 * @route POST /api/projects/:projectId/apply-template
 * @description Applies the latest milestones from a category template to an existing project.
 * @access Private (requires authentication and privilege)
 */
router.post('/apply-template/:projectId', async (req, res) => {
    const { projectId } = req.params;
    // TODO: Get userId from authenticated user (e.g., req.user.userId)
    const userId = 1; // Placeholder for now

    try {
        const [projectRows] = await pool.query('SELECT categoryId FROM kemri_projects WHERE id = ? AND voided = 0', [projectId]);
        const project = projectRows[0];

        if (!project || !project.categoryId) {
            return res.status(400).json({ message: 'Project not found or has no associated category' });
        }

        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const [milestoneTemplates] = await connection.query(
                'SELECT milestoneName, description, sequenceOrder FROM category_milestones WHERE categoryId = ?',
                [project.categoryId]
            );

            // Fetch existing milestone names for the project to prevent duplicates
            const [existingMilestones] = await connection.query(
                'SELECT milestoneName FROM kemri_project_milestones WHERE projectId = ?',
                [projectId]
            );
            const existingMilestoneNames = new Set(existingMilestones.map(m => m.milestoneName));

            // Filter out templates that already exist in the project
            const milestonesToAdd = milestoneTemplates.filter(m => !existingMilestoneNames.has(m.milestoneName));

            if (milestonesToAdd.length > 0) {
                const milestoneValues = milestonesToAdd.map(m => [
                    projectId,
                    m.milestoneName,
                    m.description,
                    m.sequenceOrder,
                    'Not Started', // Initial status
                    userId, // Creator of the milestone
                    new Date().toISOString().slice(0, 19).replace('T', ' '),
                ]);

                await connection.query(
                    'INSERT INTO kemri_project_milestones (projectId, milestoneName, description, sequenceOrder, status, userId, createdAt) VALUES ?',
                    [milestoneValues]
                );
            }

            await connection.commit();
            res.status(200).json({ message: `${milestonesToAdd.length} new milestones applied from template` });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error applying milestone template:', error);
        res.status(500).json({ message: 'Error applying milestone template', error: error.message });
    }
});

/**
 * @route PUT /api/projects/:id
 * @description Update an existing project
 * @returns {Object} Updated project with joined data
 */
router.put('/:id', validateProject, async (req, res) => {
    const { id } = req.params;
    if (isNaN(parseInt(id))) { return res.status(400).json({ message: 'Invalid project ID' }); }
    const projectData = { ...req.body };
    delete projectData.id;
    
    const DB_TYPE = process.env.DB_TYPE || 'mysql';
    
    try {
        if (DB_TYPE === 'postgresql') {
            // PostgreSQL: Update JSONB fields
            const {
                projectName,
                projectDescription,
                directorate,
                startDate,
                endDate,
                costOfProject,
                paidOut,
                objective,
                expectedOutput,
                expectedOutcome,
                status,
                statusReason,
                ProjectRefNum,
                Contracted,
                ministry,
                stateDepartment,
                sector,
                finYearId,
                programId,
                subProgramId,
                overallProgress,
                budgetSource,
                progressSummary,
                latitude,
                longitude,
                feedbackEnabled,
                commonFeedback,
                complaintsReceived,
                dataSources,
                categoryId
            } = projectData;

            // Build JSONB objects (merge with existing data if needed)
            const timeline = JSON.stringify({
                start_date: startDate || null,
                expected_completion_date: endDate || null,
                financial_year: finYearId ? String(finYearId) : null
            });

            const budget = JSON.stringify({
                allocated_amount_kes: costOfProject || 0,
                disbursed_amount_kes: paidOut || 0,
                contracted: Contracted || false,
                budget_id: null,
                source: budgetSource || null
            });

            const progress = JSON.stringify({
                status: status || 'Not Started',
                status_reason: statusReason || null,
                percentage_complete: overallProgress || 0,
                latest_update_summary: progressSummary || null
            });

            const notes = JSON.stringify({
                objective: objective || null,
                expected_output: expectedOutput || null,
                expected_outcome: expectedOutcome || null,
                program_id: programId || null,
                subprogram_id: subProgramId || null
            });

            // Handle dataSources - can be array or object
            let dataSourcesJson;
            if (dataSources && Array.isArray(dataSources) && dataSources.length > 0) {
                dataSourcesJson = JSON.stringify(dataSources);
            } else {
                dataSourcesJson = JSON.stringify({
                    project_ref_num: ProjectRefNum || null
                });
            }

            const publicEngagement = JSON.stringify({
                approved_for_public: false,
                approved_by: null,
                approved_at: null,
                approval_notes: null,
                revision_requested: false,
                revision_notes: null,
                revision_requested_by: null,
                revision_requested_at: null,
                revision_submitted_at: null,
                feedback_enabled: feedbackEnabled !== undefined ? feedbackEnabled : true,
                common_feedback: commonFeedback || null,
                complaints_received: complaintsReceived || 0
            });

            const location = JSON.stringify({
                county: null,
                constituency: null,
                ward: null,
                geocoordinates: {
                    lat: latitude || null,
                    lng: longitude || null
                }
            });

            // Update PostgreSQL with JSONB structure
            const updateQuery = `
                UPDATE projects 
                SET 
                    name = $1,
                    description = $2,
                    implementing_agency = $3,
                    sector = $4,
                    ministry = $5,
                    state_department = $6,
                    category_id = $7,
                    timeline = $8::jsonb,
                    budget = $9::jsonb,
                    progress = $10::jsonb,
                    notes = $11::jsonb,
                    data_sources = $12::jsonb,
                    public_engagement = $13::jsonb,
                    location = $14::jsonb,
                    updated_at = CURRENT_TIMESTAMP
                WHERE project_id = $15 AND voided = false
                RETURNING project_id
            `;
            
            const result = await pool.query(updateQuery, [
                projectName,
                projectDescription || null,
                directorate || null,
                sector || null,
                ministry || null,
                stateDepartment || null,
                categoryId || null,
                timeline,
                budget,
                progress,
                notes,
                dataSourcesJson,
                publicEngagement,
                location,
                id
            ]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Project not found or already deleted' });
            }
            
            // Fetch updated project
            const query = GET_SINGLE_PROJECT_QUERY(DB_TYPE);
            const result2 = await pool.query(query, [id]);
            const projectRows = DB_TYPE === 'postgresql' ? result2.rows : result2[0];
            res.status(200).json(projectRows[0] || projectRows);
        } else {
            // MySQL: Use old structure
            const connection = await pool.getConnection();
            try {
                await connection.beginTransaction();
                const [result] = await connection.query('UPDATE kemri_projects SET ? WHERE id = ? AND voided = 0', [projectData, id]);
                if (result.affectedRows === 0) {
                    await connection.rollback();
                    return res.status(404).json({ message: 'Project not found or already deleted' });
                }
                const query = GET_SINGLE_PROJECT_QUERY(DB_TYPE);
                const [rows] = await connection.query(query, [id]);
                await connection.commit();
                res.status(200).json(rows[0]);
            } catch (error) {
                await connection.rollback();
                throw error;
            } finally {
                connection.release();
            }
        }
    } catch (error) {
        console.error('Error updating project:', error);
        console.error('Error stack:', error.stack);
        console.error('Project data received:', JSON.stringify(projectData, null, 2));
        res.status(500).json({ message: 'Error updating project', error: error.message, details: error.stack });
    }
});

/**
 * @route DELETE /api/projects/:id
 * @description Soft delete a project
 * @returns No content on success
 */
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    if (isNaN(parseInt(id))) { return res.status(400).json({ message: 'Invalid project ID' }); }
    
    try {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const [result] = await connection.query('UPDATE kemri_projects SET voided = 1 WHERE id = ? AND voided = 0', [id]);
            if (result.affectedRows === 0) {
                await connection.rollback();
                return res.status(404).json({ message: 'Project not found or already deleted' });
            }
            await connection.commit();
            res.status(200).json({ message: 'Project soft-deleted successfully' });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error soft-deleting project:', error);
        res.status(500).json({ message: 'Error soft-deleting project', error: error.message });
    }
});

// --- Junction Table Routes ---
router.get('/:projectId/counties', async (req, res) => {
    const { projectId } = req.params;
    if (isNaN(parseInt(projectId))) { return res.status(400).json({ message: 'Invalid project ID' }); }
    if (!(await checkProjectExists(projectId))) { return res.status(404).json({ message: 'Project not found' }); }
    try {
        const [rows] = await pool.query(
            `SELECT pc.countyId, c.name AS countyName, pc.assignedAt
             FROM kemri_project_counties pc
             JOIN kemri_counties c ON pc.countyId = c.countyId
             WHERE pc.projectId = ?`, [projectId]
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching project counties:', error);
        res.status(500).json({ message: 'Error fetching project counties', error: error.message });
    }
});
router.post('/:projectId/counties', async (req, res) => {
    const { projectId } = req.params;
    const { countyId } = req.body;
    if (isNaN(parseInt(projectId)) || isNaN(parseInt(countyId))) { return res.status(400).json({ message: 'Invalid projectId or countyId' }); }
    if (!(await checkProjectExists(projectId))) { return res.status(404).json({ message: 'Project not found' }); }
    try {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const [result] = await connection.query(
                'INSERT INTO kemri_project_counties (projectId, countyId, assignedAt) VALUES (?, ?, NOW())', [projectId, countyId]
            );
            await connection.commit();
            res.status(201).json({ projectId: parseInt(projectId), countyId: parseInt(countyId), assignedAt: new Date() });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally { connection.release(); }
    } catch (error) {
        console.error('Error adding project county association:', error);
        if (error.code === 'ER_DUP_ENTRY') { return res.status(409).json({ message: 'This county is already associated with this project' }); }
        res.status(500).json({ message: 'Error adding project county association', error: error.message });
    }
});
router.delete('/:countyId', async (req, res) => {
    const { projectId, countyId } = req.params;
    if (isNaN(parseInt(projectId)) || isNaN(parseInt(countyId))) { return res.status(400).json({ message: 'Invalid projectId or countyId' }); }
    if (!(await checkProjectExists(projectId))) { return res.status(404).json({ message: 'Project not found' }); }
    try {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const [result] = await connection.query(
                'DELETE FROM kemri_project_counties WHERE projectId = ? AND countyId = ?', [projectId, countyId]
            );
            if (result.affectedRows === 0) { await connection.rollback(); return res.status(404).json({ message: 'Project-county association not found' }); }
            await connection.commit();
            res.status(204).send();
        } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); }
    } catch (error) {
        console.error('Error deleting project county association:', error);
        res.status(500).json({ message: 'Error deleting project county association', error: error.message });
    }
});

router.get('/:projectId/subcounties', async (req, res) => {
    const { projectId } = req.params;
    if (isNaN(parseInt(projectId))) { return res.status(400).json({ message: 'Invalid project ID' }); }
    if (!(await checkProjectExists(projectId))) { return res.status(404).json({ message: 'Project not found' }); }
    try {
        const [rows] = await pool.query(
            `SELECT psc.subcountyId, sc.name AS subcountyName, sc.geoLat, sc.geoLon, psc.assignedAt
             FROM kemri_project_subcounties psc
             JOIN kemri_subcounties sc ON psc.subcountyId = sc.subcountyId
             WHERE psc.projectId = ? AND sc.voided = 0`, [projectId]
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching project subcounties:', error);
        res.status(500).json({ message: 'Error fetching project subcounties', error: error.message });
    }
});
router.post('/:projectId/subcounties', async (req, res) => {
    const { projectId } = req.params;
    const { subcountyId } = req.body;
    if (isNaN(parseInt(projectId)) || isNaN(parseInt(subcountyId))) { return res.status(400).json({ message: 'Invalid projectId or subcountyId' }); }
    if (!(await checkProjectExists(projectId))) { return res.status(404).json({ message: 'Project not found' }); }
    try {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const [result] = await connection.query(
                'INSERT INTO kemri_project_subcounties (projectId, subcountyId, assignedAt) VALUES (?, ?, NOW())', [projectId, subcountyId]
            );
            await connection.commit();
            res.status(201).json({ projectId: parseInt(projectId), subcountyId: parseInt(subcountyId), assignedAt: new Date() });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally { connection.release(); }
    } catch (error) {
        console.error('Error adding project subcounty association:', error);
        if (error.code === 'ER_DUP_ENTRY') { return res.status(409).json({ message: 'This subcounty is already associated with this project' }); }
        res.status(500).json({ message: 'Error adding project subcounty association', error: error.message });
    }
});
router.delete('/:subcountyId', async (req, res) => {
    const { projectId, subcountyId } = req.params;
    if (isNaN(parseInt(projectId)) || isNaN(parseInt(subcountyId))) { return res.status(400).json({ message: 'Invalid projectId or subcountyId' }); }
    if (!(await checkProjectExists(projectId))) { return res.status(404).json({ message: 'Project not found' }); }
    try {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const [result] = await connection.query(
                'DELETE FROM kemri_project_subcounties WHERE projectId = ? AND subcountyId = ?', [projectId, subcountyId]
            );
            if (result.affectedRows === 0) { await connection.rollback(); return res.status(404).json({ message: 'Project-subcounty association not found' }); }
            await connection.commit();
            res.status(204).send();
        } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); }
    } catch (error)
    {
        console.error('Error deleting project subcounty association:', error);
        res.status(500).json({ message: 'Error deleting project subcounty association', error: error.message });
    }
});

router.get('/:projectId/wards', async (req, res) => {
    const { projectId } = req.params;
    if (isNaN(parseInt(projectId))) { return res.status(400).json({ message: 'Invalid project ID' }); }
    if (!(await checkProjectExists(projectId))) { return res.status(404).json({ message: 'Project not found' }); }
    try {
        const [rows] = await pool.query(
            `SELECT pw.wardId, w.name AS wardName, w.geoLat, w.geoLon, pw.assignedAt
             FROM kemri_project_wards pw
             JOIN kemri_wards w ON pw.wardId = w.wardId
             WHERE pw.projectId = ? AND w.voided = 0`, [projectId]
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching project wards:', error);
        res.status(500).json({ message: 'Error fetching project wards', error: error.message });
    }
});
router.post('/:projectId/wards', async (req, res) => {
    const { projectId } = req.params;
    const { wardId } = req.body;
    if (isNaN(parseInt(projectId)) || isNaN(parseInt(wardId))) { return res.status(400).json({ message: 'Invalid projectId or wardId' }); }
    if (!(await checkProjectExists(projectId))) { return res.status(404).json({ message: 'Project not found' }); }
    try {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const [result] = await connection.query(
                'INSERT INTO kemri_project_wards (projectId, wardId, assignedAt) VALUES (?, ?, NOW())', [projectId, wardId]
            );
            await connection.commit();
            res.status(201).json({ projectId: parseInt(projectId), wardId: parseInt(wardId), assignedAt: new Date() });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally { connection.release(); }
    } catch (error) {
        console.error('Error adding project ward association:', error);
        if (error.code === 'ER_DUP_ENTRY') { return res.status(409).json({ message: 'This ward is already associated with this project' }); }
        res.status(500).json({ message: 'Error adding project ward association', error: error.message });
    }
});
router.delete('/:wardId', async (req, res) => {
    const { projectId, wardId } = req.params;
    if (isNaN(parseInt(projectId)) || isNaN(parseInt(wardId))) { return res.status(400).json({ message: 'Invalid projectId or wardId' }); }
    if (!(await checkProjectExists(projectId))) { return res.status(404).json({ message: 'Project not found' }); }
    try {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const [result] = await connection.query(
                'DELETE FROM kemri_project_wards WHERE projectId = ? AND wardId = ?', [projectId, wardId]
            );
            if (result.affectedRows === 0) { await connection.rollback(); return res.status(404).json({ message: 'Project-ward association not found' }); }
            await connection.commit();
            res.status(204).send();
        } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); }
    } catch (error)
    {
        console.error('Error deleting project ward association:', error);
        res.status(500).json({ message: 'Error deleting project ward association', error: error.message });
    }
});

// ============================================
// PROJECT SITES ROUTES
// ============================================

/**
 * @route GET /api/projects/:projectId/sites
 * @description Get all sites for a project
 * @access Private
 */
router.get('/:projectId/sites', async (req, res) => {
    const { projectId } = req.params;
    const DB_TYPE = process.env.DB_TYPE || 'mysql';
    
    if (isNaN(parseInt(projectId))) {
        return res.status(400).json({ message: 'Invalid project ID' });
    }

    try {
        let query;
        if (DB_TYPE === 'postgresql') {
            // First check if project exists (only exclude projects where voided = true/1)
            const projectCheck = await pool.query(
                'SELECT project_id FROM projects WHERE project_id = $1 AND (voided IS NULL OR voided = false)',
                [projectId]
            );
            
            if (projectCheck.rows.length === 0) {
                return res.status(404).json({ message: 'Project not found' });
            }
            
            query = `
                SELECT 
                    ps.site_id, ps.project_id, ps.site_level, ps.region, ps.county, ps.constituency, ps.ward,
                    ps.site_name, ps.status_raw, ps.status_norm, ps.percent_complete,
                    ps.contract_sum_kes, ps.approved_cost_kes, ps.amount_disbursed_kes,
                    ps.units, ps.stalls, ps.bed_capacity, ps.acreage,
                    ps.connected_by, ps.categorization, ps.reason_for_outage,
                    ps.start_date, ps.end_date, ps.remarks, ps.key_issues, ps.suggested_solutions,
                    ps.extra, ps.loaded_at
                FROM projects p
                LEFT JOIN project_sites ps ON p.project_id = ps.project_id
                WHERE p.project_id = $1 AND (p.voided IS NULL OR p.voided = false) AND ps.site_id IS NOT NULL
                ORDER BY ps.site_id ASC
            `;
            const result = await pool.query(query, [projectId]);
            return res.status(200).json(result.rows || []);
        } else {
            // First check if project exists (only exclude projects where voided = 1/true)
            const [projectCheck] = await pool.query(
                'SELECT id FROM kemri_projects WHERE id = ? AND (voided IS NULL OR voided = 0)',
                [projectId]
            );
            
            if (projectCheck.length === 0) {
                return res.status(404).json({ message: 'Project not found' });
            }
            
            query = `
                SELECT 
                    ps.site_id, ps.project_id, ps.site_level, ps.region, ps.county, ps.constituency, ps.ward,
                    ps.site_name, ps.status_raw, ps.status_norm, ps.percent_complete,
                    ps.contract_sum_kes, ps.approved_cost_kes, ps.amount_disbursed_kes,
                    ps.units, ps.stalls, ps.bed_capacity, ps.acreage,
                    ps.connected_by, ps.categorization, ps.reason_for_outage,
                    ps.start_date, ps.end_date, ps.remarks, ps.key_issues, ps.suggested_solutions,
                    ps.extra, ps.loaded_at
                FROM kemri_projects p
                LEFT JOIN project_sites ps ON p.id = ps.project_id
                WHERE p.id = ? AND (p.voided IS NULL OR p.voided = 0) AND ps.site_id IS NOT NULL
                ORDER BY ps.site_id ASC
            `;
            const [rows] = await pool.query(query, [projectId]);
            return res.status(200).json(rows || []);
        }
    } catch (error) {
        console.error('Error fetching project sites:', error);
        res.status(500).json({ message: 'Error fetching project sites', error: error.message });
    }
});

/**
 * @route POST /api/projects/:projectId/sites
 * @description Create a new site for a project
 * @access Private
 */
router.post('/:projectId/sites', async (req, res) => {
    const { projectId } = req.params;
    const DB_TYPE = process.env.DB_TYPE || 'mysql';
    const siteData = req.body;
    
    if (isNaN(parseInt(projectId))) {
        return res.status(400).json({ message: 'Invalid project ID' });
    }

    try {
        // Verify project exists
        if (DB_TYPE === 'postgresql') {
            const projectCheckQuery = 'SELECT project_id FROM projects WHERE project_id = $1 AND voided = false';
            const projectCheck = await pool.query(projectCheckQuery, [projectId]);
            if (projectCheck.rows.length === 0) {
                return res.status(404).json({ message: 'Project not found' });
            }
        } else {
            const projectCheckQuery = 'SELECT id FROM projects WHERE id = ? AND voided = 0';
            const [projectRows] = await pool.query(projectCheckQuery, [projectId]);
            if (projectRows.length === 0) {
                return res.status(404).json({ message: 'Project not found' });
            }
        }

        // Prepare site data
        const {
            site_level = 'site',
            region, county, constituency, ward,
            site_name, status_raw, status_norm = 'Not Started',
            percent_complete = 0,
            contract_sum_kes, approved_cost_kes, amount_disbursed_kes,
            units, stalls, bed_capacity, acreage,
            connected_by, categorization, reason_for_outage,
            start_date, end_date, remarks, key_issues, suggested_solutions,
            extra
        } = siteData;

        if (DB_TYPE === 'postgresql') {
            const insertQuery = `
                INSERT INTO project_sites (
                    project_id, site_level, region, county, constituency, ward,
                    site_name, status_raw, status_norm, percent_complete,
                    contract_sum_kes, approved_cost_kes, amount_disbursed_kes,
                    units, stalls, bed_capacity, acreage,
                    connected_by, categorization, reason_for_outage,
                    start_date, end_date, remarks, key_issues, suggested_solutions,
                    extra, loaded_at
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                    $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
                    $21, $22, $23, $24, $25, $26, $27, CURRENT_TIMESTAMP
                )
                RETURNING site_id, project_id, site_level, region, county, constituency, ward,
                    site_name, status_raw, status_norm, percent_complete,
                    contract_sum_kes, approved_cost_kes, amount_disbursed_kes,
                    units, stalls, bed_capacity, acreage,
                    connected_by, categorization, reason_for_outage,
                    start_date, end_date, remarks, key_issues, suggested_solutions,
                    extra, loaded_at
            `;
            
            const extraJson = extra ? JSON.stringify(extra) : null;
            const result = await pool.query(insertQuery, [
                projectId, site_level, region || null, county || null, constituency || null, ward || null,
                site_name || null, status_raw || null, status_norm, percent_complete,
                contract_sum_kes || null, approved_cost_kes || null, amount_disbursed_kes || null,
                units || null, stalls || null, bed_capacity || null, acreage || null,
                connected_by || null, categorization || null, reason_for_outage || null,
                start_date || null, end_date || null, remarks || null, key_issues || null, suggested_solutions || null,
                extraJson
            ]);
            
            return res.status(201).json(result.rows[0]);
        } else {
            const insertQuery = `
                INSERT INTO project_sites (
                    project_id, site_level, region, county, constituency, ward,
                    site_name, status_raw, status_norm, percent_complete,
                    contract_sum_kes, approved_cost_kes, amount_disbursed_kes,
                    units, stalls, bed_capacity, acreage,
                    connected_by, categorization, reason_for_outage,
                    start_date, end_date, remarks, key_issues, suggested_solutions,
                    extra, loaded_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            `;
            
            const extraJson = extra ? JSON.stringify(extra) : null;
            const [result] = await pool.query(insertQuery, [
                projectId, site_level, region || null, county || null, constituency || null, ward || null,
                site_name || null, status_raw || null, status_norm, percent_complete,
                contract_sum_kes || null, approved_cost_kes || null, amount_disbursed_kes || null,
                units || null, stalls || null, bed_capacity || null, acreage || null,
                connected_by || null, categorization || null, reason_for_outage || null,
                start_date || null, end_date || null, remarks || null, key_issues || null, suggested_solutions || null,
                extraJson
            ]);
            
            // Fetch the created site
            const [rows] = await pool.query('SELECT * FROM project_sites WHERE site_id = ?', [result.insertId]);
            return res.status(201).json(rows[0]);
        }
    } catch (error) {
        console.error('Error creating project site:', error);
        res.status(500).json({ message: 'Error creating project site', error: error.message });
    }
});

/**
 * @route PUT /api/projects/:projectId/sites/:siteId
 * @description Update a project site
 * @access Private
 */
router.put('/:projectId/sites/:siteId', async (req, res) => {
    const { projectId, siteId } = req.params;
    const DB_TYPE = process.env.DB_TYPE || 'mysql';
    const siteData = req.body;
    
    if (isNaN(parseInt(projectId)) || isNaN(parseInt(siteId))) {
        return res.status(400).json({ message: 'Invalid project ID or site ID' });
    }

    try {
        const {
            site_level, region, county, constituency, ward,
            site_name, status_raw, status_norm,
            percent_complete,
            contract_sum_kes, approved_cost_kes, amount_disbursed_kes,
            units, stalls, bed_capacity, acreage,
            connected_by, categorization, reason_for_outage,
            start_date, end_date, remarks, key_issues, suggested_solutions,
            extra
        } = siteData;

        if (DB_TYPE === 'postgresql') {
            const updateQuery = `
                UPDATE project_sites SET
                    site_level = $1, region = $2, county = $3, constituency = $4, ward = $5,
                    site_name = $6, status_raw = $7, status_norm = $8, percent_complete = $9,
                    contract_sum_kes = $10, approved_cost_kes = $11, amount_disbursed_kes = $12,
                    units = $13, stalls = $14, bed_capacity = $15, acreage = $16,
                    connected_by = $17, categorization = $18, reason_for_outage = $19,
                    start_date = $20, end_date = $21, remarks = $22, key_issues = $23, suggested_solutions = $24,
                    extra = $25
                WHERE project_id = $26 AND site_id = $27
                RETURNING *
            `;
            
            const extraJson = extra ? JSON.stringify(extra) : null;
            const result = await pool.query(updateQuery, [
                site_level, region || null, county || null, constituency || null, ward || null,
                site_name || null, status_raw || null, status_norm, percent_complete,
                contract_sum_kes || null, approved_cost_kes || null, amount_disbursed_kes || null,
                units || null, stalls || null, bed_capacity || null, acreage || null,
                connected_by || null, categorization || null, reason_for_outage || null,
                start_date || null, end_date || null, remarks || null, key_issues || null, suggested_solutions || null,
                extraJson,
                projectId, siteId
            ]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Project site not found' });
            }
            
            return res.status(200).json(result.rows[0]);
        } else {
            const updateQuery = `
                UPDATE project_sites SET
                    site_level = ?, region = ?, county = ?, constituency = ?, ward = ?,
                    site_name = ?, status_raw = ?, status_norm = ?, percent_complete = ?,
                    contract_sum_kes = ?, approved_cost_kes = ?, amount_disbursed_kes = ?,
                    units = ?, stalls = ?, bed_capacity = ?, acreage = ?,
                    connected_by = ?, categorization = ?, reason_for_outage = ?,
                    start_date = ?, end_date = ?, remarks = ?, key_issues = ?, suggested_solutions = ?,
                    extra = ?
                WHERE project_id = ? AND site_id = ?
            `;
            
            const extraJson = extra ? JSON.stringify(extra) : null;
            const [result] = await pool.query(updateQuery, [
                site_level, region || null, county || null, constituency || null, ward || null,
                site_name || null, status_raw || null, status_norm, percent_complete,
                contract_sum_kes || null, approved_cost_kes || null, amount_disbursed_kes || null,
                units || null, stalls || null, bed_capacity || null, acreage || null,
                connected_by || null, categorization || null, reason_for_outage || null,
                start_date || null, end_date || null, remarks || null, key_issues || null, suggested_solutions || null,
                extraJson,
                projectId, siteId
            ]);
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Project site not found' });
            }
            
            // Fetch the updated site
            const [rows] = await pool.query('SELECT * FROM project_sites WHERE project_id = ? AND site_id = ?', [projectId, siteId]);
            return res.status(200).json(rows[0]);
        }
    } catch (error) {
        console.error('Error updating project site:', error);
        res.status(500).json({ message: 'Error updating project site', error: error.message });
    }
});

/**
 * @route DELETE /api/projects/:projectId/sites/:siteId
 * @description Delete a project site
 * @access Private
 */
router.delete('/:projectId/sites/:siteId', async (req, res) => {
    const { projectId, siteId } = req.params;
    const DB_TYPE = process.env.DB_TYPE || 'mysql';
    
    if (isNaN(parseInt(projectId)) || isNaN(parseInt(siteId))) {
        return res.status(400).json({ message: 'Invalid project ID or site ID' });
    }

    try {
        if (DB_TYPE === 'postgresql') {
            const deleteQuery = 'DELETE FROM project_sites WHERE project_id = $1 AND site_id = $2';
            const result = await pool.query(deleteQuery, [projectId, siteId]);
            
            if (result.rowCount === 0) {
                return res.status(404).json({ message: 'Project site not found' });
            }
            
            return res.status(204).send();
        } else {
            const deleteQuery = 'DELETE FROM project_sites WHERE project_id = ? AND site_id = ?';
            const [result] = await pool.query(deleteQuery, [projectId, siteId]);
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Project site not found' });
            }
            
            return res.status(204).send();
        }
    } catch (error) {
        console.error('Error deleting project site:', error);
        res.status(500).json({ message: 'Error deleting project site', error: error.message });
    }
});


/* */

module.exports = router;