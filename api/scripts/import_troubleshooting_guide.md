# Project Import Troubleshooting Guide

## File Ready for Import
✅ **File**: `/home/dev/dev/imes_working/v5/projects_import_template_fixed_dates.xlsx`

### File Status:
- ✓ Valid Excel format
- ✓ 15 rows (1 header + 14 data rows)
- ✓ All required headers present
- ✓ Dates are valid (no invalid dates like June 31st)
- ✓ All dates parse correctly

## Import Instructions

1. **Access Central Import Hub** in the application
2. **Select "Projects"** as the import type
3. **Upload the file**: `/home/dev/dev/imes_working/v5/projects_import_template_fixed_dates.xlsx`
4. **Click "Upload & Preview"** to see the preview
5. **Review the metadata mapping** (if shown)
6. **Click "Confirm Import"** to import the data

## Common Issues and Fixes

### Issue: Date parsing errors
**Status**: ✅ FIXED - The import code now automatically fixes invalid dates
- June 31st → June 30th
- February 30th → February 28th/29th (depending on leap year)

### Issue: Empty rows causing import failures
**Status**: ✅ FIXED - The import code now automatically filters out empty rows

### Issue: Unrecognized headers
**Current**: "Contractor" header is not recognized (but won't cause import failure)
- This field is optional and will be ignored during import
- It doesn't affect the import process

## File Validation Results

### Headers Found (15):
1. ProjectRefNum ✓
2. ProjectName ✓
3. Description ✓
4. StartDate ✓
5. EndDate ✓
6. FinancialYear ✓
7. Budget ✓
8. Contracted ✓
9. AmountPaid ✓
10. Status ✓
11. Department ✓
12. Directorate ✓
13. Sub-County ✓
14. Ward ✓
15. Contractor (unrecognized but harmless)

### Data Quality:
- ✓ All rows have required fields (ProjectName or ProjectRefNum)
- ✓ Dates are in valid format
- ✓ No empty data rows
- ✓ All dates parse correctly

## If Import Still Fails

1. **Check API logs**: `docker logs node_api --tail 50`
2. **Check for specific error messages** in the preview
3. **Verify metadata exists** (departments, subcounties, wards, financial years)
4. **Check database connection** is working

## Next Steps

If you encounter any errors during import, please note:
- The exact error message
- Which row number (if applicable)
- Any preview messages shown

The file is ready and should import successfully!













