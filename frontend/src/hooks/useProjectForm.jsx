import { useState, useEffect, useCallback } from 'react';
import apiService from '../api';
import { DEFAULT_COUNTY } from '../configs/appConfig';

const useProjectForm = (currentProject, allMetadata, onFormSuccess, setSnackbar) => {
  const [formData, setFormData] = useState({
    projectName: '', projectDescription: '', startDate: '', endDate: '',
    directorate: '', costOfProject: '', paidOut: '',
    objective: '', expectedOutput: '', principalInvestigator: '', expectedOutcome: '',
    status: 'Not Started', statusReason: '',
    ministry: '', stateDepartment: '', sector: '', // New fields replacing departmentId, sectionId, categoryId
    countyIds: [], subcountyIds: [], wardIds: [],
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [formSections, setFormSections] = useState([]);
  const [formSubPrograms, setFormSubPrograms] = useState([]);
  const [formSubcounties, setFormSubcounties] = useState([]);
  const [formWards, setFormWards] = useState([]);
  const [missingFinancialYear, setMissingFinancialYear] = useState(null); // For financial years not in metadata

  const [initialAssociations, setInitialAssociations] = useState({
    countyIds: [],
    subcountyIds: [],
    wardIds: [],
  });

  useEffect(() => {
    if (currentProject) {
      setLoading(true);
      const fetchAssociations = async () => {
        try {
          const [countiesRes, subcountiesRes, wardsRes] = await Promise.all([
            apiService.junctions.getProjectCounties(currentProject.id),
            apiService.junctions.getProjectSubcounties(currentProject.id),
            apiService.junctions.getProjectWards(currentProject.id),
          ]);
          const countyIds = countiesRes.map(c => String(c.countyId));
          const subcountyIds = subcountiesRes.map(sc => String(sc.subcountyId));
          const wardIds = wardsRes.map(w => String(w.wardId));

          const formDataToSet = {
            projectName: currentProject.projectName || '',
            projectDescription: currentProject.projectDescription || '',
            startDate: currentProject.startDate ? new Date(currentProject.startDate).toISOString().split('T')[0] : '',
            endDate: currentProject.endDate ? new Date(currentProject.endDate).toISOString().split('T')[0] : '',
            directorate: currentProject.directorate || '',
            costOfProject: currentProject.costOfProject || '',
            paidOut: currentProject.paidOut || '',
            objective: currentProject.objective || '',
            expectedOutput: currentProject.expectedOutput || '',
            principalInvestigator: currentProject.principalInvestigator || '',
            expectedOutcome: currentProject.expectedOutcome || '',
            status: currentProject.status || 'Not Started',
            statusReason: currentProject.statusReason || '',
            ministry: currentProject.ministry || '',
            stateDepartment: currentProject.stateDepartment || '',
            sector: currentProject.sector || '',
            countyIds,
            subcountyIds,
            wardIds,
          };
          
          setFormData(formDataToSet);

          setInitialAssociations({ countyIds, subcountyIds, wardIds });

        } catch (err) {
          setSnackbar({ open: true, message: 'Failed to load project associations for editing.', severity: 'error' });
          console.error("Error fetching project associations:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchAssociations();
    } else {
      // For new projects, default to the configured default county (Kisumu)
      let defaultCountyIds = [];
      if (allMetadata?.counties) {
        // First try to find by countyId if specified in DEFAULT_COUNTY
        if (DEFAULT_COUNTY.countyId) {
          const countyById = allMetadata.counties.find(c => c.countyId === DEFAULT_COUNTY.countyId);
          if (countyById) {
            defaultCountyIds = [String(countyById.countyId)];
          }
        }
        // If not found by ID, find by name (case-insensitive, partial match)
        if (defaultCountyIds.length === 0 && DEFAULT_COUNTY.name) {
          const countyByName = allMetadata.counties.find(c => 
            c.name?.toLowerCase().includes(DEFAULT_COUNTY.name.toLowerCase())
          );
          if (countyByName) {
            defaultCountyIds = [String(countyByName.countyId)];
          }
        }
      }
      
      setFormData({
        projectName: '', projectDescription: '', startDate: '', endDate: '',
        directorate: '', costOfProject: '', paidOut: '',
        objective: '', expectedOutput: '', principalInvestigator: '', expectedOutcome: '',
        status: 'Not Started', statusReason: '',
        ministry: '', stateDepartment: '', sector: '',
        countyIds: defaultCountyIds, // Default to configured default county (Kisumu)
        subcountyIds: [], wardIds: [],
      });
      setInitialAssociations({ countyIds: defaultCountyIds, subcountyIds: [], wardIds: [] });
      setLoading(false);
    }
  }, [currentProject, setSnackbar, allMetadata]);


  useEffect(() => {
    const fetchFormDropdowns = async () => {
        // Load sub-counties from all selected counties
        if (formData.countyIds && formData.countyIds.length > 0) {
            try {
                // Fetch subcounties for all selected counties and merge them
                const subcountyPromises = formData.countyIds.map(countyId => 
                    apiService.metadata.counties.getSubcountiesByCounty(countyId).catch(() => [])
                );
                const subcountyArrays = await Promise.all(subcountyPromises);
                // Flatten and deduplicate by subcountyId
                const allSubcounties = subcountyArrays.flat();
                const uniqueSubcounties = Array.from(
                    new Map(allSubcounties.map(sc => [sc.subcountyId, sc])).values()
                );
                setFormSubcounties(uniqueSubcounties);
            } catch (err) { 
                console.error("Error fetching form sub-counties:", err); 
                setFormSubcounties([]); 
            }
        } else {
            // If no counties selected, use default county for subcounty loading
            let defaultCountyId = null;
            if (allMetadata?.counties) {
                if (DEFAULT_COUNTY.countyId) {
                    const countyById = allMetadata.counties.find(c => c.countyId === DEFAULT_COUNTY.countyId);
                    if (countyById) {
                        defaultCountyId = String(countyById.countyId);
                    }
                }
                if (!defaultCountyId && DEFAULT_COUNTY.name) {
                    const countyByName = allMetadata.counties.find(c => 
                        c.name?.toLowerCase().includes(DEFAULT_COUNTY.name.toLowerCase())
                    );
                    if (countyByName) {
                        defaultCountyId = String(countyByName.countyId);
                    }
                }
            }
            
            if (defaultCountyId) {
                try { 
                    setFormSubcounties(await apiService.metadata.counties.getSubcountiesByCounty(defaultCountyId)); 
                } catch (err) { 
                    console.error("Error fetching form sub-counties:", err); 
                    setFormSubcounties([]); 
                }
            } else {
                setFormSubcounties([]);
            }
        }
        
        // Load wards from all selected subcounties
        if (formData.subcountyIds && formData.subcountyIds.length > 0) {
            try {
                // Fetch wards for all selected subcounties and merge them
                const wardPromises = formData.subcountyIds.map(subcountyId => 
                    apiService.metadata.subcounties.getWardsBySubcounty(subcountyId).catch(() => [])
                );
                const wardArrays = await Promise.all(wardPromises);
                // Flatten and deduplicate by wardId
                const allWards = wardArrays.flat();
                const uniqueWards = Array.from(
                    new Map(allWards.map(w => [w.wardId, w])).values()
                );
                setFormWards(uniqueWards);
            } catch (err) { 
                console.error("Error fetching form wards:", err); 
                setFormWards([]); 
            }
        } else { 
            setFormWards([]); 
        }
    };

    fetchFormDropdowns();
  }, [formData.countyIds, formData.subcountyIds, allMetadata]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
        const newState = { ...prev, [name]: value };

        // Clear subcounties and wards when counties change
        if (name === 'subcountyIds' && prev.subcountyIds[0] !== value[0]) { newState.wardIds = []; }

        return newState;
    });
  };

  const handleMultiSelectChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
        const newArrayValue = typeof value === 'string' ? value.split(',') : value;
        const newState = { ...prev, [name]: newArrayValue };
        
        // When counties change, clear subcounties and wards
        if (name === 'countyIds') {
            // Check if the selected counties have changed (not just order)
            const prevSet = new Set(prev.countyIds || []);
            const newSet = new Set(newArrayValue);
            const hasChanged = prevSet.size !== newSet.size || 
                !Array.from(newSet).every(id => prevSet.has(id));
            if (hasChanged) {
                newState.subcountyIds = [];
                newState.wardIds = [];
            }
        }
        // When subcounties change, clear wards
        if (name === 'subcountyIds') {
            const prevSet = new Set(prev.subcountyIds || []);
            const newSet = new Set(newArrayValue);
            const hasChanged = prevSet.size !== newSet.size || 
                !Array.from(newSet).every(id => prevSet.has(id));
            if (hasChanged) {
                newState.wardIds = [];
            }
        }
        
        return newState;
    });
  };

  const validateForm = () => {
    let errors = {};
    // Only projectName is required
    if (!formData.projectName || !formData.projectName.trim()) {
      errors.projectName = 'Project Name is required.';
    }
    // Validate date range only if both dates are provided
    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      errors.date_range = 'End Date cannot be before Start Date.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const synchronizeAssociations = useCallback(async (projectId, currentIds, newIds, addFn, removeFn) => {
    const idsToAdd = newIds.filter(id => !currentIds.includes(id));
    const idsToRemove = currentIds.filter(id => !newIds.includes(id));
    const addPromises = idsToAdd.map(id => addFn(projectId, id));
    const removePromises = idsToRemove.map(id => removeFn(projectId, id));
    await Promise.allSettled([...addPromises, ...removePromises]);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      setSnackbar({ open: true, message: 'Please correct the form errors.', severity: 'error' });
      return;
    }

    setLoading(true);
    const dataToSubmit = { ...formData };
    
    // Note: Geographical coverage (counties) is optional and will default to Kisumu if not provided
    for (const key of ['costOfProject', 'paidOut']) {
      if (dataToSubmit[key] === '' || dataToSubmit[key] === null) { dataToSubmit[key] = null; } else if (typeof dataToSubmit[key] === 'string') { const parsed = parseFloat(dataToSubmit[key]); dataToSubmit[key] = isNaN(parsed) ? null : parsed; }
    }

    // Handle geographical coverage - convert to integers and filter invalid values
    let countyIdsToSave = (dataToSubmit.countyIds || []).map(id => parseInt(id, 10)).filter(id => !isNaN(id));
    const subcountyIdsToSave = (dataToSubmit.subcountyIds || []).map(id => parseInt(id, 10)).filter(id => !isNaN(id));
    const wardIdsToSave = (dataToSubmit.wardIds || []).map(id => parseInt(id, 10)).filter(id => !isNaN(id));
    
    // If no counties selected, default to the configured default county (Kisumu)
    // This ensures projects always have at least one county
    if (countyIdsToSave.length === 0 && allMetadata?.counties) {
      let defaultCounty = null;
      // First try to find by countyId if specified in DEFAULT_COUNTY
      if (DEFAULT_COUNTY.countyId) {
        defaultCounty = allMetadata.counties.find(c => c.countyId === DEFAULT_COUNTY.countyId);
      }
      // If not found by ID, find by name (case-insensitive, partial match)
      if (!defaultCounty && DEFAULT_COUNTY.name) {
        defaultCounty = allMetadata.counties.find(c => 
          c.name?.toLowerCase().includes(DEFAULT_COUNTY.name.toLowerCase())
        );
      }
      if (defaultCounty) {
        countyIdsToSave = [defaultCounty.countyId];
        console.log(`No counties selected, defaulting to ${DEFAULT_COUNTY.name} county:`, defaultCounty);
      }
    }
    
    delete dataToSubmit.countyIds; delete dataToSubmit.subcountyIds; delete dataToSubmit.wardIds;

    let projectId = currentProject ? currentProject.id : null;

    try {
      if (currentProject) {
        await apiService.projects.updateProject(projectId, dataToSubmit);
        setSnackbar({ open: true, message: 'Project updated successfully!', severity: 'success' });
      } else {
        const createdProject = await apiService.projects.createProject(dataToSubmit);
        projectId = createdProject.id;
        setSnackbar({ open: true, message: 'Project created successfully!', severity: 'success' });
      }

      if (projectId) {
        await Promise.all([
          synchronizeAssociations(projectId, initialAssociations.countyIds.map(id => parseInt(id, 10)), countyIdsToSave, apiService.junctions.addProjectCounty, apiService.junctions.removeProjectCounty),
          synchronizeAssociations(projectId, initialAssociations.subcountyIds.map(id => parseInt(id, 10)), subcountyIdsToSave, apiService.junctions.addProjectSubcounty, apiService.junctions.removeProjectSubcounty),
          synchronizeAssociations(projectId, initialAssociations.wardIds.map(id => parseInt(id, 10)), wardIdsToSave, apiService.junctions.addProjectWard, apiService.junctions.removeProjectWard),
        ]);
      }
      onFormSuccess();
    } catch (err) {
      console.error("Submit project error:", err);
      setSnackbar({ open: true, message: err.response?.data?.message || err.message || 'Failed to save project.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [formData, currentProject, initialAssociations, onFormSuccess, setSnackbar, synchronizeAssociations, validateForm, allMetadata]);

  return {
    formData, formErrors, loading, handleChange, handleMultiSelectChange, handleSubmit,
    formSubcounties, formWards,
  };
};

export default useProjectForm;
