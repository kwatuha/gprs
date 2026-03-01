import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Avatar,
  TextField,
  Button,
  Grid,
  Chip,
  IconButton,
  LinearProgress,
  Divider,
  useTheme,
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as AccountIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { tokens } from '../pages/dashboard/theme';

const ProfileModal = ({ open, onClose, user, onSave }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || '',
    role: user?.role || '',
    location: user?.location || '',
    bio: user?.bio || '',
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    onSave(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      department: user?.department || '',
      role: user?.role || '',
      location: user?.location || '',
      bio: user?.bio || '',
    });
    setIsEditing(false);
  };

  const calculateProfileCompletion = () => {
    const fields = ['name', 'email', 'phone', 'department', 'role', 'location', 'bio'];
    const completedFields = fields.filter(field => formData[field] && formData[field].trim() !== '').length;
    return Math.round((completedFields / fields.length) * 100);
  };

  const profileCompletion = calculateProfileCompletion();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: colors.primary[400],
          borderRadius: 3,
          boxShadow: `0 8px 32px ${colors.primary[300]}20`,
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: colors.primary[500], 
        color: colors.grey[100],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 3
      }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ 
            bgcolor: colors.blueAccent?.[500] || '#6870fa',
            width: 40,
            height: 40
          }}>
            <AccountIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Profile Details
            </Typography>
            <Typography variant="body2" color={colors.grey[300]}>
              Manage your personal information
            </Typography>
          </Box>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          {!isEditing ? (
            <IconButton 
              onClick={() => setIsEditing(true)}
              sx={{ 
                color: colors.blueAccent?.[500] || '#6870fa',
                '&:hover': { bgcolor: colors.blueAccent?.[500] + '20' }
              }}
            >
              <EditIcon />
            </IconButton>
          ) : (
            <Box display="flex" gap={1}>
              <IconButton 
                onClick={handleSave}
                sx={{ 
                  color: colors.greenAccent?.[500] || '#4cceac',
                  '&:hover': { bgcolor: colors.greenAccent?.[500] + '20' }
                }}
              >
                <SaveIcon />
              </IconButton>
              <IconButton 
                onClick={handleCancel}
                sx={{ 
                  color: colors.redAccent?.[500] || '#db4f4a',
                  '&:hover': { bgcolor: colors.redAccent?.[500] + '20' }
                }}
              >
                <CancelIcon />
              </IconButton>
            </Box>
          )}
          <IconButton 
            onClick={onClose}
            sx={{ 
              color: colors.grey[300],
              '&:hover': { bgcolor: colors.primary[600] }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Profile Completion Progress */}
        <Box mb={3}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <Typography variant="subtitle2" color={colors.grey[100]} fontWeight="medium">
              Profile Completion
            </Typography>
            <Typography variant="h6" color={colors.blueAccent?.[500] || '#6870fa'} fontWeight="bold">
              {profileCompletion}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={profileCompletion}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: colors.primary[300],
              '& .MuiLinearProgress-bar': {
                bgcolor: colors.blueAccent?.[500] || '#6870fa',
                borderRadius: 4,
              }
            }}
          />
        </Box>

        <Divider sx={{ mb: 3, borderColor: colors.primary[300] }} />

        {/* Profile Form */}
        <Grid container spacing={3}>
          {/* Profile Picture Section */}
          <Grid item xs={12} md={4}>
            <Box textAlign="center">
              <Avatar sx={{ 
                width: 120, 
                height: 120, 
                mx: 'auto', 
                mb: 2,
                bgcolor: colors.blueAccent?.[500] || '#6870fa',
                boxShadow: `0 4px 20px ${colors.blueAccent?.[500] || '#6870fa'}30`
              }}>
                <AccountIcon sx={{ fontSize: 60 }} />
              </Avatar>
              <Typography variant="h6" fontWeight="bold" color={colors.grey[100]} mb={1}>
                {formData.name}
              </Typography>
              <Chip 
                label={formData.role} 
                size="small" 
                sx={{ 
                  bgcolor: colors.greenAccent?.[500] || '#4cceac', 
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
            </Box>
          </Grid>

          {/* Form Fields */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: <AccountIcon sx={{ color: colors.grey[400], mr: 1 }} />
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: colors.primary[500],
                      '& fieldset': { borderColor: colors.primary[300] },
                      '&:hover fieldset': { borderColor: colors.blueAccent?.[500] || '#6870fa' },
                      '&.Mui-focused fieldset': { borderColor: colors.blueAccent?.[500] || '#6870fa' },
                    },
                    '& .MuiInputLabel-root': { color: colors.grey[300] },
                    '& .MuiOutlinedInput-input': { color: colors.grey[100] },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: <EmailIcon sx={{ color: colors.grey[400], mr: 1 }} />
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: colors.primary[500],
                      '& fieldset': { borderColor: colors.primary[300] },
                      '&:hover fieldset': { borderColor: colors.blueAccent?.[500] || '#6870fa' },
                      '&.Mui-focused fieldset': { borderColor: colors.blueAccent?.[500] || '#6870fa' },
                    },
                    '& .MuiInputLabel-root': { color: colors.grey[300] },
                    '& .MuiOutlinedInput-input': { color: colors.grey[100] },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: <PhoneIcon sx={{ color: colors.grey[400], mr: 1 }} />
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: colors.primary[500],
                      '& fieldset': { borderColor: colors.primary[300] },
                      '&:hover fieldset': { borderColor: colors.blueAccent?.[500] || '#6870fa' },
                      '&.Mui-focused fieldset': { borderColor: colors.blueAccent?.[500] || '#6870fa' },
                    },
                    '& .MuiInputLabel-root': { color: colors.grey[300] },
                    '& .MuiOutlinedInput-input': { color: colors.grey[100] },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Department"
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: <WorkIcon sx={{ color: colors.grey[400], mr: 1 }} />
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: colors.primary[500],
                      '& fieldset': { borderColor: colors.primary[300] },
                      '&:hover fieldset': { borderColor: colors.blueAccent?.[500] || '#6870fa' },
                      '&.Mui-focused fieldset': { borderColor: colors.blueAccent?.[500] || '#6870fa' },
                    },
                    '& .MuiInputLabel-root': { color: colors.grey[300] },
                    '& .MuiOutlinedInput-input': { color: colors.grey[100] },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Role"
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: <StarIcon sx={{ color: colors.grey[400], mr: 1 }} />
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: colors.primary[500],
                      '& fieldset': { borderColor: colors.primary[300] },
                      '&:hover fieldset': { borderColor: colors.blueAccent?.[500] || '#6870fa' },
                      '&.Mui-focused fieldset': { borderColor: colors.blueAccent?.[500] || '#6870fa' },
                    },
                    '& .MuiInputLabel-root': { color: colors.grey[300] },
                    '& .MuiOutlinedInput-input': { color: colors.grey[100] },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: <LocationIcon sx={{ color: colors.grey[400], mr: 1 }} />
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: colors.primary[500],
                      '& fieldset': { borderColor: colors.primary[300] },
                      '&:hover fieldset': { borderColor: colors.blueAccent?.[500] || '#6870fa' },
                      '&.Mui-focused fieldset': { borderColor: colors.blueAccent?.[500] || '#6870fa' },
                    },
                    '& .MuiInputLabel-root': { color: colors.grey[300] },
                    '& .MuiOutlinedInput-input': { color: colors.grey[100] },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bio"
                  multiline
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Tell us about yourself..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: colors.primary[500],
                      '& fieldset': { borderColor: colors.primary[300] },
                      '&:hover fieldset': { borderColor: colors.blueAccent?.[500] || '#6870fa' },
                      '&.Mui-focused fieldset': { borderColor: colors.blueAccent?.[500] || '#6870fa' },
                    },
                    '& .MuiInputLabel-root': { color: colors.grey[300] },
                    '& .MuiOutlinedInput-input': { color: colors.grey[100] },
                  }}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, bgcolor: colors.primary[500] }}>
        <Button
          onClick={onClose}
          sx={{
            color: colors.grey[300],
            '&:hover': { bgcolor: colors.primary[600] }
          }}
        >
          Close
        </Button>
        {isEditing && (
          <Button
            onClick={handleSave}
            variant="contained"
            sx={{
              bgcolor: colors.blueAccent?.[500] || '#6870fa',
              '&:hover': { bgcolor: colors.blueAccent?.[600] || '#535ac8' }
            }}
          >
            Save Changes
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ProfileModal;
