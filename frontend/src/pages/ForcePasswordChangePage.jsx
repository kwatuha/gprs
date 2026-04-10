import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  TextField,
  Typography,
} from '@mui/material';
import { useAuth } from '../context/AuthContext.jsx';
import authService from '../api/authService';

const ForcePasswordChangePage = () => {
  const navigate = useNavigate();
  const { token, user, mustChangePassword, completeForcedPasswordChange, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!token) return <Navigate to="/login" replace />;
  if (!mustChangePassword) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required.');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    if (currentPassword === newPassword) {
      setError('New password must be different from current password.');
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword({
        userId: user?.id || user?.userId || user?.actualUserId,
        username: user?.username || user?.email,
        currentPassword,
        newPassword,
      });
      completeForcedPasswordChange();
      navigate('/', { replace: true });
    } catch (err) {
      const payload = err?.response?.data ?? err;
      setError((payload && (payload.message || payload.error)) || err?.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', py: 4 }}>
      <Card sx={{ width: '100%' }}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>
            Password Change Required
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Super Admin accounts must change password on every login before accessing the application.
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField fullWidth margin="dense" label="Current Password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            <TextField fullWidth margin="dense" label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <TextField fullWidth margin="dense" label="Confirm New Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button color="inherit" onClick={logout} disabled={loading}>Logout</Button>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? <CircularProgress size={18} /> : 'Change Password'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ForcePasswordChangePage;

