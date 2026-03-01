import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  Close as CloseIcon,
  Visibility,
  VisibilityOff,
  Lock as LockIcon,
} from '@mui/icons-material';
import { tokens } from '../pages/dashboard/theme';
import authService from '../api/authService';
import { useAuth } from '../context/AuthContext';

const ChangePasswordModal = ({ open, onClose, userId }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
    setError('');
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters long';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Check if userId is available
    if (!userId) {
      setError('User ID is missing. Please refresh the page and try again.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Get username from user context for password verification
      const username = user?.username || user?.email;
      
      if (!username) {
        setError('Unable to identify user. Please refresh the page and try again.');
        setLoading(false);
        return;
      }
      
      // Call API to change password
      const response = await authService.changePassword({
        userId: userId,
        username: username,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      // Check if the response indicates success
      if (response && (response.success !== false)) {
        setSuccess(true);
        // Reset form after successful change
        setTimeout(() => {
          handleClose();
          setSuccess(false);
        }, 2000);
      } else {
        setError(response?.message || 'Failed to change password. Please try again.');
      }
    } catch (err) {
      console.error('Password change error:', err);
      
      // Handle different error types
      let errorMessage = 'Failed to change password. Please try again.';
      
      if (err.response) {
        // Server responded with error status
        const status = err.response.status;
        const data = err.response.data;
        
        if (status === 401 || status === 403) {
          errorMessage = data?.message || 'Current password is incorrect. Please check and try again.';
        } else if (status === 400) {
          errorMessage = data?.message || 'Invalid request. Please check your input and try again.';
        } else if (status === 404) {
          errorMessage = 'Password change service is not available. Please contact support.';
        } else if (status === 500) {
          errorMessage = 'Server error occurred. Please try again later.';
        } else {
          errorMessage = data?.message || data?.error || `Error: ${status}. Please try again.`;
        }
      } else if (err.request) {
        // Request was made but no response received
        errorMessage = 'Unable to connect to server. Please check your connection and try again.';
      } else {
        // Something else happened
        errorMessage = err.message || 'An unexpected error occurred. Please try again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setErrors({});
    setError('');
    setSuccess(false);
    setShowPasswords({
      current: false,
      new: false,
      confirm: false,
    });
    onClose();
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          bgcolor: theme.palette.mode === 'dark' ? colors.primary[400] : '#ffffff',
          boxShadow: theme.palette.mode === 'dark' 
            ? '0 12px 48px rgba(0,0,0,0.5)' 
            : '0 12px 48px rgba(0,0,0,0.15)',
          overflow: 'hidden',
        }
      }}
    >
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 3,
          px: 3.5,
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)'
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2.5,
              backgroundColor: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            <LockIcon sx={{ fontSize: '1.5rem' }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1.25rem' }}>
              Change Password
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.95, fontSize: '0.8rem', mt: 0.25 }}>
              Update your account password securely
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={handleClose}
          sx={{
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              transform: 'rotate(90deg)',
              transition: 'all 0.3s ease',
            },
            transition: 'all 0.3s ease',
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 4, bgcolor: theme.palette.mode === 'dark' ? colors.primary[400] : '#fafbfc' }}>
        {success && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              '& .MuiAlert-icon': {
                fontSize: '1.5rem'
              }
            }}
          >
            Password changed successfully! This dialog will close shortly.
          </Alert>
        )}

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              '& .MuiAlert-icon': {
                fontSize: '1.5rem'
              }
            }}
          >
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} id="change-password-form">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Current Password */}
            <TextField
              fullWidth
              label="Current Password"
              type={showPasswords.current ? 'text' : 'password'}
              value={formData.currentPassword}
              onChange={(e) => handleInputChange('currentPassword', e.target.value)}
              error={!!errors.currentPassword}
              helperText={errors.currentPassword}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility('current')}
                      edge="end"
                      sx={{ 
                        color: theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[600],
                        '&:hover': {
                          color: colors.blueAccent?.[500] || '#6870fa',
                          backgroundColor: 'rgba(102, 126, 234, 0.08)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: theme.palette.mode === 'dark' ? colors.primary[500] : '#ffffff',
                  fontSize: '0.95rem',
                  '& fieldset': { 
                    borderColor: theme.palette.mode === 'dark' ? colors.primary[300] : colors.grey[300],
                    borderWidth: '1.5px'
                  },
                  '&:hover fieldset': { 
                    borderColor: colors.blueAccent?.[500] || '#6870fa',
                    borderWidth: '2px'
                  },
                  '&.Mui-focused fieldset': { 
                    borderColor: colors.blueAccent?.[500] || '#6870fa',
                    borderWidth: '2px',
                    boxShadow: `0 0 0 3px ${colors.blueAccent?.[500] || '#6870fa'}20`
                  },
                  '&.Mui-error fieldset': {
                    borderWidth: '2px'
                  }
                },
                '& .MuiInputLabel-root': { 
                  color: theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[700],
                  fontWeight: 500,
                  '&.Mui-focused': {
                    color: colors.blueAccent?.[500] || '#6870fa',
                  }
                },
                '& .MuiOutlinedInput-input': { 
                  color: theme.palette.mode === 'dark' ? '#ffffff' : '#1a1a1a !important',
                  py: 1.5,
                  fontWeight: 500,
                  '&::placeholder': {
                    color: theme.palette.mode === 'dark' ? colors.grey[400] : colors.grey[500],
                    opacity: 1
                  }
                },
                '& .MuiFormHelperText-root': {
                  fontSize: '0.8rem',
                  mt: 1
                }
              }}
            />

            {/* New Password */}
            <TextField
              fullWidth
              label="New Password"
              type={showPasswords.new ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={(e) => handleInputChange('newPassword', e.target.value)}
              error={!!errors.newPassword}
              helperText={errors.newPassword || 'Must be at least 6 characters long'}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility('new')}
                      edge="end"
                      sx={{ 
                        color: theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[600],
                        '&:hover': {
                          color: colors.blueAccent?.[500] || '#6870fa',
                          backgroundColor: 'rgba(102, 126, 234, 0.08)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: theme.palette.mode === 'dark' ? colors.primary[500] : '#ffffff',
                  fontSize: '0.95rem',
                  '& fieldset': { 
                    borderColor: theme.palette.mode === 'dark' ? colors.primary[300] : colors.grey[300],
                    borderWidth: '1.5px'
                  },
                  '&:hover fieldset': { 
                    borderColor: colors.blueAccent?.[500] || '#6870fa',
                    borderWidth: '2px'
                  },
                  '&.Mui-focused fieldset': { 
                    borderColor: colors.blueAccent?.[500] || '#6870fa',
                    borderWidth: '2px',
                    boxShadow: `0 0 0 3px ${colors.blueAccent?.[500] || '#6870fa'}20`
                  },
                  '&.Mui-error fieldset': {
                    borderWidth: '2px'
                  }
                },
                '& .MuiInputLabel-root': { 
                  color: theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[700],
                  fontWeight: 500,
                  '&.Mui-focused': {
                    color: colors.blueAccent?.[500] || '#6870fa',
                  }
                },
                '& .MuiOutlinedInput-input': { 
                  color: theme.palette.mode === 'dark' ? '#ffffff' : '#1a1a1a !important',
                  py: 1.5,
                  fontWeight: 500,
                  '&::placeholder': {
                    color: theme.palette.mode === 'dark' ? colors.grey[400] : colors.grey[500],
                    opacity: 1
                  }
                },
                '& .MuiFormHelperText-root': {
                  fontSize: '0.8rem',
                  mt: 1,
                  color: errors.newPassword 
                    ? theme.palette.error.main 
                    : (theme.palette.mode === 'dark' ? colors.grey[400] : colors.grey[600])
                }
              }}
            />

            {/* Confirm Password */}
            <TextField
              fullWidth
              label="Confirm New Password"
              type={showPasswords.confirm ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility('confirm')}
                      edge="end"
                      sx={{ 
                        color: theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[600],
                        '&:hover': {
                          color: colors.blueAccent?.[500] || '#6870fa',
                          backgroundColor: 'rgba(102, 126, 234, 0.08)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: theme.palette.mode === 'dark' ? colors.primary[500] : '#ffffff',
                  fontSize: '0.95rem',
                  '& fieldset': { 
                    borderColor: theme.palette.mode === 'dark' ? colors.primary[300] : colors.grey[300],
                    borderWidth: '1.5px'
                  },
                  '&:hover fieldset': { 
                    borderColor: colors.blueAccent?.[500] || '#6870fa',
                    borderWidth: '2px'
                  },
                  '&.Mui-focused fieldset': { 
                    borderColor: colors.blueAccent?.[500] || '#6870fa',
                    borderWidth: '2px',
                    boxShadow: `0 0 0 3px ${colors.blueAccent?.[500] || '#6870fa'}20`
                  },
                  '&.Mui-error fieldset': {
                    borderWidth: '2px'
                  }
                },
                '& .MuiInputLabel-root': { 
                  color: theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[700],
                  fontWeight: 500,
                  '&.Mui-focused': {
                    color: colors.blueAccent?.[500] || '#6870fa',
                  }
                },
                '& .MuiOutlinedInput-input': { 
                  color: theme.palette.mode === 'dark' ? '#ffffff' : '#1a1a1a !important',
                  py: 1.5,
                  fontWeight: 500,
                  '&::placeholder': {
                    color: theme.palette.mode === 'dark' ? colors.grey[400] : colors.grey[500],
                    opacity: 1
                  }
                },
                '& .MuiFormHelperText-root': {
                  fontSize: '0.8rem',
                  mt: 1
                }
              }}
            />
          </Box>
        </form>
      </DialogContent>

      <DialogActions sx={{ 
        p: 3.5, 
        bgcolor: theme.palette.mode === 'dark' ? colors.primary[500] : '#f8f9fa',
        borderTop: `1px solid ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.grey[200]}`,
        gap: 2,
        justifyContent: 'flex-end'
      }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          sx={{
            color: theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[700],
            px: 3,
            py: 1,
            borderRadius: 2,
            fontWeight: 600,
            textTransform: 'none',
            '&:hover': { 
              bgcolor: theme.palette.mode === 'dark' ? colors.primary[600] : colors.grey[200],
              transform: 'translateY(-1px)',
            },
            transition: 'all 0.2s ease'
          }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form="change-password-form"
          variant="contained"
          disabled={loading || success}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            px: 4,
            py: 1,
            borderRadius: 2,
            fontWeight: 600,
            textTransform: 'none',
            minWidth: 160,
            boxShadow: '0 4px 14px rgba(102, 126, 234, 0.4)',
            '&:hover': { 
              background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
              boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
              transform: 'translateY(-2px)',
            },
            '&:disabled': {
              background: theme.palette.mode === 'dark' ? colors.grey[700] : colors.grey[400],
              boxShadow: 'none',
            },
            transition: 'all 0.3s ease'
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CircularProgress size={18} sx={{ color: 'white' }} />
              <Typography sx={{ fontSize: '0.95rem' }}>Changing...</Typography>
            </Box>
          ) : (
            'Change Password'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChangePasswordModal;

